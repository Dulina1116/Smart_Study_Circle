import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { protect } from '../middleware/authMiddleware.js'
import { updateProfile, uploadProfilePhoto, removeProfilePhoto } from '../controllers/userController.js'

const router = express.Router()

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Multer config for local disk storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
  }
})

const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)
  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb('Images only! (jpg, jpeg, png)')
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5 MB LIMIT
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
})

// Routes
router.route('/profile').put(protect, updateProfile)
router.route('/profile/photo').post(protect, upload.single('image'), uploadProfilePhoto)
router.route('/profile/photo').delete(protect, removeProfilePhoto)

export default router
