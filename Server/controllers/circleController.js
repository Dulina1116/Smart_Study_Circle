import Circle from "../models/Circle.js";
import StudyCircle from "../models/StudyCircle.js";
import Notification from "../models/Notification.js";

// @desc    Create new circle
// @route   POST /api/circles
// @access  Private (Lecturer)
export const createCircle = async (req, res) => {
  try {
    const {
      courseCode,
      courseName,
      circleName,
      description,
      isPrivate,
      inviteCode,
      firstSession,
      circleType,
    } = req.body;

    if (!courseCode || !circleName) {
      return res
        .status(400)
        .json({ message: "Course Code and Circle Name are required" });
    }

    // Duplicate check across both circle models (case-insensitive)
    const nameLower = circleName.trim().toLowerCase();
    const codeLower  = courseCode.trim().toLowerCase();

    const existsInCircle = await Circle.findOne({
      circleName: { $regex: `^${nameLower}$`, $options: 'i' },
      courseCode: { $regex: `^${codeLower}$`, $options: 'i' },
    }).lean();

    const existsInStudyCircle = await StudyCircle.findOne({
      subject: { $regex: `^${nameLower}$`, $options: 'i' },
      moduleCode: { $regex: `^${codeLower}$`, $options: 'i' },
    }).lean();

    if (existsInCircle || existsInStudyCircle) {
      return res.status(409).json({
        message: `A circle named "${circleName}" for module "${courseCode}" already exists. Please use a different name or module code.`,
      });
    }

    const circle = await Circle.create({
      courseCode,
      courseName,
      circleName,
      circleType: circleType || "lecturer",
      description,
      isPrivate,
      inviteCode,
      firstSession,
      creator: req.user._id,
      members: [req.user._id], // Creator is intrinsically a member
      activity: "Newly Created",
      activityType: "moderate",
    });

    // Notify the creator
    await Notification.create({
      recipient: req.user._id,
      type: 'general',
      message: `Your study circle "${circleName}" was created successfully.`,
      metadata: { circleId: circle._id },
    }).catch(() => {});

    res.status(201).json(circle);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create circle", error: error.message });
  }
};

// @desc    Get lecturer's circles
// @route   GET /api/circles
// @access  Private
export const getLecturerCircles = async (req, res) => {
  try {
    // A user can fetch circles they created or where they are a member.
    const circles = await Circle.find({
      $or: [{ creator: req.user._id }, { members: req.user._id }],
    }).sort({ createdAt: -1 });

    res.json(circles);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch circles", error: error.message });
  }
};

// @desc    Update a circle
// @route   PUT /api/circles/:id
// @access  Private
export const updateCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    // Check if user is the creator
    if (circle.creator.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this circle" });
    }

    const updatedCircle = await Circle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    res.json(updatedCircle);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update circle", error: error.message });
  }
};

// @desc    Delete a circle
// @route   DELETE /api/circles/:id
// @access  Private
export const deleteCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    if (circle.creator.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this circle" });
    }

    await Circle.findByIdAndDelete(req.params.id);
    res.json({ message: "Circle removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete circle", error: error.message });
  }
};

// @desc    Invite members by email (send notification)
// @route   POST /api/circles/:id/invite
// @access  Private
export const inviteMembers = async (req, res) => {
  try {
    const { emails } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one email.' });
    }

    const circle = await Circle.findById(req.params.id);
    if (!circle) return res.status(404).json({ message: 'Circle not found.' });
    if (circle.creator.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized.' });
    }

    const User = (await import('../models/User.js')).default;
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const results = [];
    for (const email of emails) {
      try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (user && !circle.members.map(String).includes(String(user._id))) {
          circle.members.push(user._id);
          // In-app notification
          await Notification.create({
            recipient: user._id,
            type: 'invite',
            message: `You've been invited to join the circle "${circle.circleName}".`,
            metadata: { circleId: circle._id },
          }).catch(() => {});
        }

        await transporter.sendMail({
          from: `"Smart Study Circle" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `You've been invited to join "${circle.circleName}" — Smart Study Circle`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border-radius:16px;border:1px solid #e5e7eb;">
              <h2 style="color:#0d9488;">✦ Smart Study Circle</h2>
              <p style="font-size:16px;">You have been invited to join a study circle!</p>
              <div style="background:#f0fdfa;border-radius:12px;padding:20px;margin:20px 0;">
                <p style="margin:0;font-size:13px;color:#6b7280;">CIRCLE NAME</p>
                <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#0f172a;">${circle.circleName}</p>
                ${circle.courseCode ? `<p style="margin:8px 0 0;font-size:13px;color:#0d9488;font-weight:600;">${circle.courseCode} — ${circle.courseName || ''}</p>` : ''}
              </div>
              <p style="color:#6b7280;font-size:13px;">Log in to Smart Study Circle to view your new circle and start collaborating with your peers.</p>
              <a href="http://localhost:5173/login" style="display:inline-block;margin-top:16px;background:#0d9488;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">Open Smart Study Circle →</a>
            </div>
          `,
        });
        results.push({ email, status: 'invited' });
      } catch (err) {
        results.push({ email, status: 'failed', reason: err.message });
      }
    }

    await circle.save();
    res.status(207).json({ message: 'Invitations processed.', results });
  } catch (error) {
    res.status(500).json({ message: 'Failed to invite members.', error: error.message });
  }
};
