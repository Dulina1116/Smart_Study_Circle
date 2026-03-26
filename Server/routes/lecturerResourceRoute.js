import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResource, getTopResources, getResources, updateResource, deleteResource } from '../controllers/lecturerResourceController.js';

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, { recursive: true });
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
router.put('/:id', protect, upload.single('file'), updateResource);
router.delete('/:id', protect, deleteResource);

export default router;
