import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { normalizeAvatar } from "../utils/avatarHelper.js";

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.fullName) {
      if (!/^[a-zA-Z\s]+$/.test(req.body.fullName)) {
        return res.status(400).json({ message: "Full name can only contain letters and spaces" });
      }
      user.fullName = req.body.fullName;
    }
    user.displayName = req.body.displayName || user.displayName;
    user.department = req.body.department || user.department;
    user.designation = req.body.designation || user.designation;
    user.universityEmail = req.body.universityEmail || user.universityEmail;
    user.bio = req.body.bio || user.bio;
    user.officeLocation = req.body.officeLocation || user.officeLocation;
    user.officeHours = req.body.officeHours || user.officeHours;

    // Handle avatar - store base64 or image URL
    if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    // Email is unique and used for login, we can allow update if it's not taken
    if (req.body.email && req.body.email !== user.email) {
      const existing = await User.findOne({ email: req.body.email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = req.body.email;
    }

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      displayName: updatedUser.displayName,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      designation: updatedUser.designation,
      universityEmail: updatedUser.universityEmail,
      bio: updatedUser.bio,
      officeLocation: updatedUser.officeLocation,
      officeHours: updatedUser.officeHours,
      avatar: normalizeAvatar(updatedUser.avatar, updatedUser.profilePicture),
      profilePicture: updatedUser.profilePicture,
    });
  } catch (err) {
    console.error("Update Profile Error:", err.message);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/profile/photo
// @access  Private
export const uploadProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPath = path.join(
        process.cwd(),
        String(user.profilePicture).replace(/^\//, ""),
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save relative path: e.g. /uploads/filename.jpg
    user.profilePicture = `/uploads/${req.file.filename}`;
    const updatedUser = await user.save();

    res.json({
      message: "Profile photo uploaded successfully",
      id: updatedUser._id,
      fullName: updatedUser.fullName,
      displayName: updatedUser.displayName,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      designation: updatedUser.designation,
      universityEmail: updatedUser.universityEmail,
      bio: updatedUser.bio,
      officeLocation: updatedUser.officeLocation,
      officeHours: updatedUser.officeHours,
      avatar: normalizeAvatar(updatedUser.avatar, updatedUser.profilePicture),
      profilePicture: updatedUser.profilePicture,
    });
  } catch (err) {
    console.error("Upload Photo Error:", err.message);
    res.status(500).json({ message: "Server error uploading photo" });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/users/profile/photo
// @access  Private
export const removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.profilePicture) {
      const oldPath = path.join(
        process.cwd(),
        String(user.profilePicture).replace(/^\//, ""),
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      user.profilePicture = "";
      await user.save();
    }

    res.json({ message: "Profile photo removed" });
  } catch (err) {
    console.error("Remove Photo Error:", err.message);
    res.status(500).json({ message: "Server error removing photo" });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query).select("-password").sort("-createdAt");
    res.json(users);
  } catch (err) {
    console.error("Get All Users Error:", err.message);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get User By ID Error:", err.message);
    res.status(500).json({ message: "Server error fetching user" });
  }
};

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, isVerified } = req.body;

    if (!fullName || !/^[a-zA-Z\s]+$/.test(fullName)) {
      return res.status(400).json({ message: "Full name can only contain letters and spaces" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      isVerified: isVerified || false,
    });

    const createdUser = await User.findById(user._id).select("-password");
    res.status(201).json(createdUser);
  } catch (err) {
    console.error("Create User Error:", err.message);
    res.status(500).json({ message: "Server error creating user" });
  }
};

// @desc    Update any user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.fullName) {
      if (!/^[a-zA-Z\s]+$/.test(req.body.fullName)) {
        return res.status(400).json({ message: "Full name can only contain letters and spaces" });
      }
      user.fullName = req.body.fullName;
    }
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : user.isVerified;
    user.displayName = req.body.displayName || user.displayName;
    user.department = req.body.department || user.department;
    user.designation = req.body.designation || user.designation;
    user.universityEmail = req.body.universityEmail || user.universityEmail;
    user.bio = req.body.bio || user.bio;
    user.officeLocation = req.body.officeLocation || user.officeLocation;
    user.officeHours = req.body.officeHours || user.officeHours;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const result = await User.findById(updatedUser._id).select("-password");
    res.json(result);
  } catch (err) {
    console.error("Update User Error:", err.message);
    res.status(500).json({ message: "Server error updating user" });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ _id: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err.message);
    res.status(500).json({ message: "Server error deleting user" });
  }
};
// @desc    Bulk suspend/unsuspend users
// @route   PATCH /api/users/bulk-suspend
// @access  Private/Admin
export const bulkSuspendUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    // Toggle isSuspended for all selected users
    // We fetch them first to know their current state
    const users = await User.find({ _id: { $in: userIds } });
    
    const updatePromises = users.map(user => {
      user.isSuspended = !user.isSuspended;
      return user.save();
    });

    await Promise.all(updatePromises);
    
    res.json({ message: `Successfully updated ${userIds.length} users` });
  } catch (err) {
    console.error("Bulk Suspend Error:", err.message);
    res.status(500).json({ message: "Server error during bulk suspension" });
  }
};

// @desc    Bulk reset passwords
// @route   POST /api/users/bulk-reset-password
// @access  Private/Admin
export const bulkResetPassword = async (req, res) => {
  try {
    const { userIds } = req.body;
    const defaultPassword = "SmartCircle@123";

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    // Fetch users and filter out admins for security
    const users = await User.find({ 
      _id: { $in: userIds },
      role: { $ne: 'admin' } 
    });
    
    if (users.length === 0) {
      return res.status(400).json({ message: "No non-admin users found to reset" });
    }

    const updatePromises = users.map(user => {
      user.password = defaultPassword;
      return user.save(); // pre('save') will hash it
    });

    await Promise.all(updatePromises);

    res.json({ 
      message: `Successfully reset password for ${users.length} users. Admins were skipped.` 
    });
  } catch (err) {
    console.error("Bulk Reset Password Error:", err.message);
    res.status(500).json({ message: "Server error during bulk password reset" });
  }
};
