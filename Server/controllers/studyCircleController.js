import StudyCircle from "../models/StudyCircle.js";
import CircleMessage from "../models/CircleMessage.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";

import { formatAvatarUrl, normalizeAvatar } from "../utils/avatarHelper.js";

const sanitizeUser = (user) => ({
  id: user?._id || user?.id || "",
  fullName: user?.fullName || "",
  displayName: user?.displayName || "",
  email: user?.email || "",
  avatar: normalizeAvatar(user?.avatar, user?.profilePicture),
  profilePicture: user?.profilePicture || "",
});

const mapCircle = (circle, currentUserId) => {
  const creatorId = String(circle.creator?._id || circle.creator);
  const meId = String(currentUserId);

  const memberIds = (circle.members || []).map((m) => String(m._id || m));
  const moderatorIds = (circle.coModerators || []).map((m) =>
    String(m._id || m),
  );

  const pendingJoinRequests = (circle.joinRequests || [])
    .filter((jr) => jr.status === "pending")
    .map((jr) => ({
      id: jr._id,
      user:
        jr.user && typeof jr.user === "object"
          ? sanitizeUser(jr.user)
          : { id: jr.user },
      requestedAt: jr.requestedAt,
    }));

  return {
    id: circle._id,
    subject: circle.subject,
    moduleCode: circle.moduleCode,
    semester: circle.semester,
    year: circle.year,
    visibility: circle.visibility,
    inviteCode: circle.inviteCode,
    creator: circle.creator?._id
      ? sanitizeUser(circle.creator)
      : { id: circle.creator },
    coModerators: (circle.coModerators || []).map((cm) =>
      cm?._id ? sanitizeUser(cm) : { id: cm },
    ),
    members: (circle.members || []).map((m) =>
      m?._id ? sanitizeUser(m) : { id: m },
    ),
    memberCount:
      circle.memberCount || (circle.members ? circle.members.length : 0),
    pendingJoinRequests,
    myMembership: {
      isCreator: creatorId === meId,
      isCoModerator: moderatorIds.includes(meId),
      isMember: memberIds.includes(meId),
    },
    createdAt: circle.createdAt,
    updatedAt: circle.updatedAt,
  };
};

const isMemberOfCircle = (circle, userId) => {
  const meId = String(userId);
  return circle.members.some((m) => String(m._id || m) === meId);
};

const mapMessage = (msg) => ({
  id: msg._id,
  circleId: msg.circle,
  groupId: msg.groupId || msg.circle,
  receiverId: msg.receiverId || null,
  senderId: msg.sender?._id || msg.senderId || msg.sender,
  messageType: msg.messageType || "text",
  text: msg.text,
  fileUrl: msg.fileUrl || "",
  fileName: msg.fileName || "",
  fileSize: msg.fileSize || 0,
  mimeType: msg.mimeType || "",
  status: msg.status || "sent",
  createdAt: msg.createdAt,
  sender: msg.sender?._id
    ? sanitizeUser(msg.sender)
    : {
        id: msg.sender,
      },
});

const generateInviteCode = async () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (let i = 0; i < 10; i += 1) {
    let code = "";
    for (let j = 0; j < 8; j += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    const exists = await StudyCircle.findOne({ inviteCode: code }).lean();
    if (!exists) return code;
  }

  throw new Error("Could not generate unique invite code");
};

const isModerator = (circle, userId) => {
  const meId = String(userId);
  return (
    String(circle.creator) === meId ||
    circle.coModerators.some((cm) => String(cm) === meId)
  );
};

// POST /api/circles
export const createStudyCircle = async (req, res) => {
  try {
    const { subject, moduleCode, semester, year, visibility, description } =
      req.body;
    const parsedYear = Number(year);

    if (!subject || !moduleCode || !semester || !year) {
      return res
        .status(400)
        .json({
          message: "Subject, module code, semester and year are required.",
        });
    }

    if (!Number.isInteger(parsedYear) || parsedYear < 1 || parsedYear > 4) {
      return res.status(400).json({ message: "Year must be between 1 and 4." });
    }

    const inviteCode = await generateInviteCode();

    const circle = await StudyCircle.create({
      subject: String(subject).trim(),
      moduleCode: String(moduleCode).trim().toUpperCase(),
      semester: String(semester).trim(),
      year: parsedYear,
      visibility: visibility === "private" ? "private" : "public",
      description: description
        ? String(description).trim().substring(0, 250)
        : "",
      inviteCode,
      creator: req.user._id,
      members: [req.user._id],
      coModerators: [],
      joinRequests: [],
      reports: [],
    });

    const populated = await StudyCircle.findById(circle._id)
      .populate("creator", "fullName displayName email avatar profilePicture")
      .populate(
        "coModerators",
        "fullName displayName email avatar profilePicture",
      )
      .populate("members", "fullName displayName email avatar profilePicture")
      .populate(
        "joinRequests.user",
        "fullName displayName email avatar profilePicture",
      );

    return res.status(201).json({
      message: "Study circle created successfully.",
      circle: mapCircle(populated, req.user._id),
    });
  } catch (err) {
    console.error("Create Study Circle Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error creating study circle." });
  }
};

// GET /api/circles/my
export const getMyStudyCircles = async (req, res) => {
  try {
    const circlesRaw = await StudyCircle.find({
      members: req.user._id,
      isActive: true,
    })
      .select(
        "subject moduleCode semester year visibility inviteCode creator coModerators members joinRequests createdAt updatedAt",
      )
      .sort({ updatedAt: -1 })
      .lean()
      .populate("creator", "fullName displayName email avatar profilePicture")
      .populate(
        "coModerators",
        "fullName displayName email avatar profilePicture",
      )
      // Keep members unpopulated for list performance, but populate join requester
      // identities so moderators can see who requested to join.
      .populate(
        "joinRequests.user",
        "fullName displayName email avatar profilePicture",
      );

    const circles = circlesRaw.map((c) => mapCircle(c, req.user._id));
    return res.json({ circles });
  } catch (err) {
    console.error("Get My Study Circles Error:", err.message);
    return res.status(500).json({ message: "Server error loading circles." });
  }
};

// GET /api/circles/discover
export const getDiscoverCircles = async (req, res) => {
  try {
    const circlesRaw = await StudyCircle.aggregate([
      {
        $match: {
          visibility: "public",
          isActive: true,
          members: { $ne: req.user._id },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 40 },
      {
        $project: {
          subject: 1,
          moduleCode: 1,
          semester: 1,
          year: 1,
          visibility: 1,
          inviteCode: 1,
          creator: 1,
          createdAt: 1,
          updatedAt: 1,
          memberCount: { $size: "$members" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creatorDoc",
        },
      },
      {
        $unwind: {
          path: "$creatorDoc",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          subject: 1,
          moduleCode: 1,
          semester: 1,
          year: 1,
          visibility: 1,
          inviteCode: 1,
          memberCount: 1,
          createdAt: 1,
          updatedAt: 1,
          creator: {
            _id: "$creatorDoc._id",
            fullName: "$creatorDoc.fullName",
            displayName: "$creatorDoc.displayName",
            email: "$creatorDoc.email",
            avatar: "$creatorDoc.avatar",
            profilePicture: "$creatorDoc.profilePicture",
          },
        },
      },
    ]);

    const circles = circlesRaw.map((c) => ({
      id: c._id,
      subject: c.subject,
      moduleCode: c.moduleCode,
      semester: c.semester,
      year: c.year,
      visibility: c.visibility,
      inviteCode: c.inviteCode,
      creator: c.creator?._id
        ? sanitizeUser(c.creator)
        : { id: c.creator?._id || c.creator },
      coModerators: [],
      members: [],
      memberCount: c.memberCount || 0,
      pendingJoinRequests: [],
      myMembership: {
        isCreator: false,
        isCoModerator: false,
        isMember: false,
      },
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return res.json({ circles });
  } catch (err) {
    console.error("Get Discover Circles Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error loading discover circles." });
  }
};

// POST /api/circles/:circleId/request-join
export const requestJoinCircle = async (req, res) => {
  try {
    const { circleId } = req.params;
    const circle = await StudyCircle.findById(circleId);

    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    const meId = String(req.user._id);
    if (circle.members.some((m) => String(m) === meId)) {
      return res.status(400).json({ message: "You are already a member." });
    }

    const existingRequest = circle.joinRequests.find(
      (jr) => String(jr.user) === meId && jr.status === "pending",
    );
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending join request." });
    }

    if (circle.visibility === "public") {
      circle.members.push(req.user._id);
      await circle.save();
      return res.json({ message: "Joined circle successfully." });
    }

    circle.joinRequests.push({ user: req.user._id, status: "pending" });
    await circle.save();

    return res.json({ message: "Join request sent successfully." });
  } catch (err) {
    console.error("Request Join Circle Error:", err.message);
    return res.status(500).json({ message: "Server error sending request." });
  }
};

// POST /api/circles/join-by-code
export const joinCircleByInviteCode = async (req, res) => {
  try {
    const rawCode = req.body.inviteCode;
    const inviteCode = rawCode ? String(rawCode).trim().toUpperCase() : "";

    if (!inviteCode) {
      return res.status(400).json({ message: "Invite code is required." });
    }

    // Invite-code flow is for private circles only.
    const circle = await StudyCircle.findOne({
      inviteCode,
      isActive: true,
      visibility: "private",
    });

    if (!circle) {
      const publicCircle = await StudyCircle.findOne({
        inviteCode,
        isActive: true,
        visibility: "public",
      }).select("_id");

      if (publicCircle) {
        return res
          .status(400)
          .json({
            message:
              "This is a public circle. Join directly from the Discover Public Circles section.",
          });
      }

      return res.status(404).json({ message: "Invalid invite code." });
    }

    const meId = String(req.user._id);
    if (circle.members.some((m) => String(m) === meId)) {
      return res
        .status(400)
        .json({ message: "You are already a member of this circle." });
    }

    const existingPending = circle.joinRequests.find(
      (jr) => String(jr.user) === meId && jr.status === "pending",
    );
    if (existingPending) {
      return res
        .status(400)
        .json({
          message: "You already have a pending join request for this circle.",
        });
    }

    circle.joinRequests.push({ user: req.user._id, status: "pending" });
    await circle.save();
    return res.json({
      message:
        "Invite code accepted. Join request sent to moderators for approval.",
    });
  } catch (err) {
    console.error("Join By Code Error:", err.message);
    return res.status(500).json({ message: "Server error joining circle." });
  }
};

// POST /api/circles/:circleId/requests/:requestId
export const respondToJoinRequest = async (req, res) => {
  try {
    const { circleId, requestId } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Action must be approve or reject." });
    }

    const circle = await StudyCircle.findById(circleId);
    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    if (!isModerator(circle, req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only moderators can manage requests." });
    }

    const request = circle.joinRequests.id(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Pending request not found." });
    }

    request.status = action === "approve" ? "approved" : "rejected";
    request.respondedAt = new Date();

    if (action === "approve") {
      const requesterId = String(request.user);
      if (!circle.members.some((m) => String(m) === requesterId)) {
        circle.members.push(request.user);
      }
    }

    await circle.save();
    return res.json({ message: `Request ${action}d successfully.` });
  } catch (err) {
    console.error("Respond Join Request Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error updating join request." });
  }
};

// POST /api/circles/:circleId/co-moderators
export const assignCoModerator = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { userId, email } = req.body;

    if (!userId && !email) {
      return res.status(400).json({ message: "Provide userId or email." });
    }

    const circle = await StudyCircle.findById(circleId);
    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    if (String(circle.creator) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only the circle creator can assign co-moderators." });
    }

    if ((circle.coModerators || []).length >= 2) {
      return res
        .status(400)
        .json({ message: "Maximum 2 co-moderators can be assigned." });
    }

    let targetUser = null;

    if (userId) {
      targetUser = await User.findById(userId).select(
        "_id email role isVerified",
      );
    } else {
      const normalizedEmail = String(email).trim().toLowerCase();
      targetUser = await User.findOne({ email: normalizedEmail }).select(
        "_id email role isVerified",
      );
    }

    if (!targetUser) {
      return res
        .status(404)
        .json({ message: "Student not found for the provided email." });
    }

    if (targetUser.role !== "student") {
      return res
        .status(400)
        .json({
          message: "Only student accounts can be assigned as co-moderators.",
        });
    }

    if (!targetUser.isVerified) {
      return res
        .status(400)
        .json({ message: "Student account is not verified yet." });
    }

    const targetUserId = String(targetUser._id);

    if (String(circle.creator) === targetUserId) {
      return res
        .status(400)
        .json({ message: "Creator cannot be assigned as co-moderator." });
    }

    if (circle.coModerators.some((m) => String(m) === targetUserId)) {
      return res
        .status(400)
        .json({ message: "This student is already a co-moderator." });
    }

    // Auto-join the student to this circle (public or private) before assigning co-moderator.
    if (!circle.members.some((m) => String(m) === targetUserId)) {
      circle.members.push(targetUser._id);
    }

    // Clear any pending join request for this student because they are now directly added.
    circle.joinRequests = (circle.joinRequests || []).filter(
      (jr) => String(jr.user) !== targetUserId,
    );

    circle.coModerators.push(targetUser._id);
    await circle.save();

    return res.json({
      message:
        "Co-moderator assigned successfully. Student joined the circle automatically.",
    });
  } catch (err) {
    console.error("Assign Co-Moderator Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error assigning co-moderator." });
  }
};

// DELETE /api/circles/:circleId/co-moderators/:userId
export const removeCoModerator = async (req, res) => {
  try {
    const { circleId, userId } = req.params;

    const circle = await StudyCircle.findById(circleId);
    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    if (String(circle.creator) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only the circle creator can remove co-moderators." });
    }

    circle.coModerators = circle.coModerators.filter(
      (cm) => String(cm) !== String(userId),
    );
    await circle.save();

    return res.json({ message: "Co-moderator removed successfully." });
  } catch (err) {
    console.error("Remove Co-Moderator Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error removing co-moderator." });
  }
};

// POST /api/circles/:circleId/leave
export const leaveCircle = async (req, res) => {
  try {
    const { circleId } = req.params;

    const circle = await StudyCircle.findById(circleId);
    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    const meId = String(req.user._id);

    if (String(circle.creator) === meId) {
      return res
        .status(400)
        .json({
          message:
            "Creator cannot leave the circle. Transfer ownership first (not implemented).",
        });
    }

    circle.members = circle.members.filter((m) => String(m) !== meId);
    circle.coModerators = circle.coModerators.filter((m) => String(m) !== meId);
    circle.joinRequests = circle.joinRequests.filter(
      (jr) => String(jr.user) !== meId,
    );

    await circle.save();
    return res.json({ message: "You left the circle successfully." });
  } catch (err) {
    console.error("Leave Circle Error:", err.message);
    return res.status(500).json({ message: "Server error leaving circle." });
  }
};

// POST /api/circles/:circleId/report
export const reportCircle = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { reason, details } = req.body;

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Report reason is required." });
    }

    const circle = await StudyCircle.findById(circleId);
    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    const hasAlreadyReported = circle.reports.some(
      (r) => String(r.user) === String(req.user._id),
    );
    if (hasAlreadyReported) {
      return res
        .status(400)
        .json({ message: "You have already reported this circle." });
    }

    circle.reports.push({
      user: req.user._id,
      reason: String(reason).trim(),
      details: details ? String(details).trim() : "",
    });

    await circle.save();
    return res.json({
      message: "Circle reported successfully. Our team will review it.",
    });
  } catch (err) {
    console.error("Report Circle Error:", err.message);
    return res.status(500).json({ message: "Server error reporting circle." });
  }
};

// DELETE /api/circles/:circleId
export const deleteStudyCircle = async (req, res) => {
  try {
    const { circleId } = req.params;

    const circle = await StudyCircle.findById(circleId);
    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    if (String(circle.creator) !== String(req.user._id)) {
      return res
        .status(403)
        .json({
          message: "Only the study circle owner can delete this circle.",
        });
    }

    circle.isActive = false;
    await circle.save();

    return res.json({ message: "Study circle deleted successfully." });
  } catch (err) {
    console.error("Delete Study Circle Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error deleting study circle." });
  }
};

// PUT /api/circles/:circleId
export const updateStudyCircle = async (req, res) => {
  try {
    const { circleId } = req.params;
    const { subject, moduleCode, semester, year, visibility, description } =
      req.body;

    const circle = await StudyCircle.findById(circleId)
      .populate("creator", "fullName displayName email avatar profilePicture")
      .populate(
        "coModerators",
        "fullName displayName email avatar profilePicture",
      )
      .populate("members", "fullName displayName email avatar profilePicture")
      .populate(
        "joinRequests.user",
        "fullName displayName email avatar profilePicture",
      );

    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    const userId = String(req.user._id);
    const isCreator = String(circle.creator._id) === userId;
    const isCoModerator = circle.coModerators.some(
      (mod) => String(mod._id) === userId,
    );

    if (!isCreator && !isCoModerator) {
      return res
        .status(403)
        .json({
          message:
            "Only the circle owner and co-moderators can update this circle.",
        });
    }

    if (subject) circle.subject = subject.trim();
    if (moduleCode) circle.moduleCode = moduleCode.trim().toUpperCase();
    if (semester) circle.semester = semester.trim();
    if (year) circle.year = Number(year);
    if (visibility && ["public", "private"].includes(visibility))
      circle.visibility = visibility;
    if (description !== undefined)
      circle.description = String(description).trim().substring(0, 250);

    await circle.save();

    const mapped = mapCircle(circle, req.user);
    return res.json(mapped);
  } catch (err) {
    console.error("Update Study Circle Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error updating study circle." });
  }
};

// GET /api/circles/:circleId
export const getStudyCircleById = async (req, res) => {
  try {
    const { circleId } = req.params;

    const circle = await StudyCircle.findById(circleId)
      .populate("creator", "fullName displayName email avatar profilePicture")
      .populate(
        "coModerators",
        "fullName displayName email avatar profilePicture",
      )
      .populate("members", "fullName displayName email avatar profilePicture")
      .populate(
        "joinRequests.user",
        "fullName displayName email avatar profilePicture",
      );

    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    const meId = String(req.user._id);
    const isMember = circle.members.some((m) => String(m._id) === meId);

    if (!isMember && circle.visibility === "private") {
      return res
        .status(403)
        .json({
          message: "This private circle can only be viewed by members.",
        });
    }

    return res.json({ circle: mapCircle(circle, req.user._id) });
  } catch (err) {
    console.error("Get Circle By Id Error:", err.message);
    return res.status(500).json({ message: "Server error loading circle." });
  }
};

// GET /api/circles/:circleId/messages
export const getCircleMessages = async (req, res) => {
  try {
    const { circleId } = req.params;
    const circle = await StudyCircle.findById(circleId).select(
      "members visibility isActive",
    );

    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    if (!isMemberOfCircle(circle, req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only circle members can access chat." });
    }

    const messages = await CircleMessage.find({ circle: circleId })
      .sort({ createdAt: -1 })
      .limit(60)
      .populate("sender", "fullName displayName email avatar profilePicture")
      .lean();

    const ordered = messages.reverse().map(mapMessage);
    return res.json({ messages: ordered });
  } catch (err) {
    console.error("Get Circle Messages Error:", err.message);
    return res.status(500).json({ message: "Server error loading messages." });
  }
};

// POST /api/circles/:circleId/messages
export const sendCircleMessage = async (req, res) => {
  try {
    const { circleId } = req.params;
    const rawText = req.body.text;
    const text = rawText ? String(rawText).trim() : "";

    if (!text) {
      return res.status(400).json({ message: "Message text is required." });
    }

    const circle =
      await StudyCircle.findById(circleId).select("members isActive");
    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    if (!isMemberOfCircle(circle, req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only circle members can send messages." });
    }

    const urlRegex = /(https?:\/\/[^\s]+)/i;
    const messageType = urlRegex.test(text) ? "link" : "text";

    const created = await CircleMessage.create({
      circle: circleId,
      sender: req.user._id,
      text,
      messageType,
    });

    const populated = await CircleMessage.findById(created._id)
      .populate("sender", "fullName displayName email avatar profilePicture")
      .lean();

    const payload = mapMessage(populated);
    const io = req.app.get("io");
    if (io) {
      io.to(`circle:${circleId}`).emit("circle:new-message", payload);
    }

    return res.status(201).json({ message: payload });
  } catch (err) {
    console.error("Send Circle Message Error:", err.message);
    return res.status(500).json({ message: "Server error sending message." });
  }
};

// POST /api/circles/:circleId/messages/upload
export const sendCircleFileMessage = async (req, res) => {
  try {
    const { circleId } = req.params;

    const circle =
      await StudyCircle.findById(circleId).select("members isActive");
    if (!circle || !circle.isActive) {
      return res.status(404).json({ message: "Study circle not found." });
    }

    if (!isMemberOfCircle(circle, req.user._id)) {
      return res
        .status(403)
        .json({ message: "Only circle members can upload files." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const created = await CircleMessage.create({
      circle: circleId,
      sender: req.user._id,
      text: req.body.caption ? String(req.body.caption).trim() : "",
      messageType: "file",
      fileUrl: `/uploads/chat/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    const populated = await CircleMessage.findById(created._id)
      .populate("sender", "fullName displayName email avatar profilePicture")
      .lean();

    const payload = mapMessage(populated);
    const io = req.app.get("io");
    if (io) {
      io.to(`circle:${circleId}`).emit("circle:new-message", payload);
    }

    return res.status(201).json({ message: payload });
  } catch (err) {
    console.error("Send Circle File Message Error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error uploading file message." });
  }
};
