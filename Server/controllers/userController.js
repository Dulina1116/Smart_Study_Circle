import User from '../models/User.js'
import fs from 'fs'
import path from 'path'
import { normalizeAvatar } from '../utils/avatarHelper.js'

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.fullName = req.body.fullName || user.fullName
    user.displayName = req.body.displayName || user.displayName
    user.department = req.body.department || user.department
    user.designation = req.body.designation || user.designation
    user.universityEmail = req.body.universityEmail || user.universityEmail
    user.bio = req.body.bio || user.bio
    user.officeLocation = req.body.officeLocation || user.officeLocation
    user.officeHours = req.body.officeHours || user.officeHours
    
    // Handle avatar - store base64 or image URL
    if (req.body.avatar) {
      user.avatar = req.body.avatar
    }

    // Email is unique and used for login, we can allow update if it's not taken
    if (req.body.email && req.body.email !== user.email) {
      const existing = await User.findOne({ email: req.body.email })
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' })
      }
      user.email = req.body.email
    }

    const updatedUser = await user.save()
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
      profilePicture: updatedUser.profilePicture
    })
  } catch (err) {
    console.error('Update Profile Error:', err.message)
    res.status(500).json({ message: 'Server error updating profile' })
  }
}

// @desc    Upload profile photo
// @route   POST /api/users/profile/photo
// @access  Private
export const uploadProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' })
    }

    // Delete old profile picture if exists 
    if (user.profilePicture) {
      const oldPath = path.join(process.cwd(), String(user.profilePicture).replace(/^\//, ''))
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }

    // Save relative path: e.g. /uploads/filename.jpg
    user.profilePicture = `/uploads/${req.file.filename}`
    const updatedUser = await user.save()

    res.json({
      message: 'Profile photo uploaded successfully',
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
      profilePicture: updatedUser.profilePicture
    })
  } catch (err) {
    console.error('Upload Photo Error:', err.message)
    res.status(500).json({ message: 'Server error uploading photo' })
  }
}

// @desc    Remove profile photo
// @route   DELETE /api/users/profile/photo
// @access  Private
export const removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.profilePicture) {
      const oldPath = path.join(process.cwd(), String(user.profilePicture).replace(/^\//, ''))
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
      user.profilePicture = ''
      await user.save()
    }

    res.json({ message: 'Profile photo removed' })
  } catch (err) {
    console.error('Remove Photo Error:', err.message)
    res.status(500).json({ message: 'Server error removing photo' })
  }
}
