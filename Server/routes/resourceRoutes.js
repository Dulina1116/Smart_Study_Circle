import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllResources,
  getFeaturedResources,
  getResourcesByCategory,
  getResourcesBySpecificCategory,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  trackDownload,
  getRecentResources,
} from "../controllers/resourceController.js";

const router = express.Router();

const resourceUploadDir = path.join(process.cwd(), "uploads", "resources");
if (!fs.existsSync(resourceUploadDir)) {
  fs.mkdirSync(resourceUploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, resourceUploadDir);
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `resource-${req.user.id}-${unique}${ext}`);
  },
});

const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter(req, file, cb) {
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "video/mp4",
      "video/quicktime",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

// Public routes
router.get("/", getAllResources);
router.get("/featured", getFeaturedResources);
router.get("/categories", getResourcesByCategory);
router.get("/category/:category", getResourcesBySpecificCategory);
router.get("/recent", getRecentResources);

// Protected routes
router.use(protect);
router.get("/:resourceId", getResourceById);
router.post("/", upload.single("file"), createResource);
router.put("/:resourceId", upload.single("file"), updateResource);
router.delete("/:resourceId", deleteResource);
router.post("/:resourceId/download", trackDownload);

export default router;
