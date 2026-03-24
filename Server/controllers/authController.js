import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { normalizeAvatar } from "../utils/avatarHelper.js";

// ── JWT token generate ──
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ── OTP generate (6 digits) ──
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ── Email send ──
const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Smart Study Circle" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email — Smart Study Circle",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;
        border-radius: 16px; border: 1px solid #e5e7eb;">
        <h2 style="color: #00b8a9;">✦ Smart Study Circle</h2>
        <p>Your email verification code is:</p>
        <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px;
          color: #00b8a9; margin: 24px 0;">${otp}</div>
        <p style="color: #6b7280; font-size: 13px;">
          This code expires in <strong>10 minutes</strong>.
          If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  });
};

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register new user & send OTP
// @access  Public
// ─────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Already registered check
    const existing = await User.findOne({ email });
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    if (existing && !existing.isVerified) {
      // OTP resend — update existing unverified user
      existing.fullName = fullName;
      existing.password = password;
      existing.role = role;
      existing.otp = otp;
      existing.otpExpiry = otpExpiry;
      await existing.save();
    } else {
      // New user create
      await User.create({ fullName, email, password, role, otp, otpExpiry });
    }

    await sendOTPEmail(email, otp);

    res.status(201).json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/verify-otp
// @desc    Verify OTP & activate account
// @access  Public
// ─────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (user.otpExpiry < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please register again." });
    }

    // Verify user
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        universityEmail: user.universityEmail,
        bio: user.bio,
        officeLocation: user.officeLocation,
        officeHours: user.officeHours,
        avatar: normalizeAvatar(user.avatar, user.profilePicture),
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ─────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        universityEmail: user.universityEmail,
        bio: user.bio,
        officeLocation: user.officeLocation,
        officeHours: user.officeHours,
        avatar: normalizeAvatar(user.avatar, user.profilePicture),
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
