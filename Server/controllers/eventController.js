import Event from "../models/Event.js";
import StudyCircle from "../models/StudyCircle.js";

// Valid event types
const VALID_TYPES = ["study_session", "deadline", "exam"];

// ── Helper: verify the user is an active member of the given circle ──────────
const assertCircleMembership = async (circleId, userId) => {
  const circle = await StudyCircle.findById(circleId).select("members isActive").lean();
  if (!circle) throw { status: 404, message: "Study circle not found" };
  if (!circle.isActive) throw { status: 400, message: "Study circle is no longer active" };
  const isMember = circle.members.some((m) => String(m) === String(userId));
  if (!isMember) {
    throw {
      status: 403,
      message:
        "You must be a member of the selected study circle to link this event to it",
    };
  }
  return circle;
};

// GET /api/events — fetch events visible to the current user:
//   • All events created by the user (circle-linked or not)
//   • Circle-linked events created by OTHER students, only when the user is a member of that circle
export const getEvents = async (req, res) => {
  try {
    const { year, month, start, end } = req.query;
    const userId = req.user._id;

    // Build optional date range filter
    let dateFilter = {};
    if (start && end) {
      dateFilter = { $gte: new Date(start), $lte: new Date(end) };
    } else if (year && month) {
      dateFilter = {
        $gte: new Date(Number(year), Number(month) - 1, 1),
        $lte: new Date(Number(year), Number(month), 0, 23, 59, 59, 999),
      };
    }
    const dateCondition = Object.keys(dateFilter).length ? { date: dateFilter } : {};

    // 1. Own events (any, regardless of circle)
    const ownEvents = await Event.find({ user: userId, ...dateCondition })
      .sort({ date: 1 })
      .populate("circle", "subject moduleCode members")
      .lean();

    // 2. Events from other creators that are circle-linked — only study_session can be shared
    const otherCircleEvents = await Event.find({
      user: { $ne: userId },
      circle: { $ne: null },
      type: "study_session", // deadlines and exams are strictly private to their creator
      ...dateCondition,
    })
      .sort({ date: 1 })
      .populate("circle", "subject moduleCode members")
      .lean();

    // Keep only those where the current user is a circle member
    const accessibleOtherEvents = otherCircleEvents.filter((ev) => {
      if (!ev.circle || !Array.isArray(ev.circle.members)) return false;
      return ev.circle.members.some((m) => String(m) === String(userId));
    });

    // For own circle-linked events: also verify still a member
    // (edge case: removed from circle after creating the event)
    const filteredOwnEvents = ownEvents.filter((ev) => {
      if (!ev.circle) return true;
      if (!Array.isArray(ev.circle.members)) return true;
      return ev.circle.members.some((m) => String(m) === String(userId));
    });

    // Merge + de-duplicate by _id
    const seen = new Set();
    const merged = [];
    for (const ev of [...filteredOwnEvents, ...accessibleOtherEvents]) {
      const id = String(ev._id);
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(ev);
      }
    }
    merged.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({ events: merged });
  } catch (err) {
    console.error("getEvents error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// GET /api/events/:id
// Owner always has access; non-owner only if they are a circle member
export const getEventById = async (req, res) => {
  try {
    const userId = req.user._id;
    const event = await Event.findById(req.params.id)
      .populate("circle", "subject moduleCode members")
      .lean();

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const isOwner = String(event.user) === String(userId);
    if (!isOwner) {
      // Deadlines and exams are strictly private — only the creator can access them
      if (event.type === "deadline" || event.type === "exam") {
        return res.status(403).json({ error: "Access denied. Deadlines and exams are private." });
      }
      if (!event.circle) {
        return res.status(403).json({ error: "Access denied" });
      }
      const isMember =
        Array.isArray(event.circle.members) &&
        event.circle.members.some((m) => String(m) === String(userId));
      if (!isMember) {
        return res
          .status(403)
          .json({ error: "Access denied. You are not a member of this circle." });
      }
    }

    res.status(200).json({ event });
  } catch (err) {
    console.error("getEventById error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// POST /api/events — create event
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, endDate, type, location, circle } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        error: "Invalid event type",
        details: `Type must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }
    if (description && description.length > 500) {
      return res.status(400).json({
        error: "Description too long",
        details: "Description cannot exceed 500 characters",
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // ── Circle membership validation ──
    if (circle) {
      try {
        await assertCircleMembership(circle, req.user._id);
      } catch (e) {
        return res.status(e.status || 400).json({ error: e.message });
      }
    }

    const event = await Event.create({
      title: title.trim(),
      description: description?.trim() || "",
      date: parsedDate,
      endDate: endDate ? new Date(endDate) : null,
      type,
      location: location?.trim() || "",
      circle: circle || null,
      user: req.user._id,
    });

    await event.populate("circle", "subject moduleCode");

    res.status(201).json({ event, message: "Event created successfully" });
  } catch (err) {
    console.error("createEvent error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "Validation error", details: err.message });
    }
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// PUT /api/events/:id — update event (creator only)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!event) {
      return res
        .status(404)
        .json({ error: "Event not found or you are not the creator" });
    }

    const { title, description, date, endDate, type, location, circle } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    if (type !== undefined && !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        error: "Invalid event type",
        details: `Type must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }
    if (description !== undefined && description.length > 500) {
      return res.status(400).json({
        error: "Description too long",
        details: "Description cannot exceed 500 characters",
      });
    }

    // ── Circle membership validation if circle is being changed ──
    if (circle !== undefined && circle) {
      try {
        await assertCircleMembership(circle, req.user._id);
      } catch (e) {
        return res.status(e.status || 400).json({ error: e.message });
      }
    }

    if (title !== undefined) event.title = title.trim();
    if (description !== undefined) event.description = description.trim();
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      event.date = parsedDate;
    }
    if (endDate !== undefined) event.endDate = endDate ? new Date(endDate) : null;
    if (type !== undefined) event.type = type;
    if (location !== undefined) event.location = location.trim();
    if (circle !== undefined) event.circle = circle || null;

    await event.save();
    await event.populate("circle", "subject moduleCode");

    res.status(200).json({ event, message: "Event updated successfully" });
  } catch (err) {
    console.error("updateEvent error:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "Validation error", details: err.message });
    }
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// DELETE /api/events/:id — delete event (creator only)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!event) {
      return res
        .status(404)
        .json({ error: "Event not found or you are not the creator" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("deleteEvent error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
