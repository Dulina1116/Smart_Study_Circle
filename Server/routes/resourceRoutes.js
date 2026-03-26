import express from 'express';
import { uploadResource, getTopResources, getResources, updateResource, deleteResource } from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })
const router = express.Router();

router.post('/', protect, upload.single('file'), uploadResource);
router.get('/', protect, getResources);
router.get('/top', protect, getTopResources);
router.put('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

export default router;
