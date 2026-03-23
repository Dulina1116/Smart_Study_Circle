import User from "../models/User.js";

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.displayName = req.body.displayName || user.displayName;
      user.department = req.body.department || user.department;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.emailAlerts = req.body.emailAlerts !== undefined ? req.body.emailAlerts : user.emailAlerts;
      user.pushNotifications = req.body.pushNotifications !== undefined ? req.body.pushNotifications : user.pushNotifications;
      user.universityEmail = req.body.universityEmail || user.universityEmail;
      user.avatar = req.body.avatar || user.avatar;

      const updatedUser = await user.save();

      res.status(200).json({
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        displayName: updatedUser.displayName,
        department: updatedUser.department,
        bio: updatedUser.bio,
        universityEmail: updatedUser.universityEmail,
        avatar: updatedUser.avatar,
        emailAlerts: updatedUser.emailAlerts,
        pushNotifications: updatedUser.pushNotifications,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// @route   GET /api/users/profile
// @desc    Get user profile details
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        department: user.department,
        bio: user.bio,
        universityEmail: user.universityEmail,
        avatar: user.avatar,
        emailAlerts: user.emailAlerts,
        pushNotifications: user.pushNotifications,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};
