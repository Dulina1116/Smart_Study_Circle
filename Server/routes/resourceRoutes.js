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
  verifyResource,
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

// Allowed MIME types per resource type
const TYPE_MIMES = {
  pdf:          ["application/pdf"],
  document:     [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.oasis.opendocument.text",
  ],
  presentation: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.presentation",
  ],
  video:        ["video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska", "video/webm"],
  other:        [], // any file accepted for "other"
};

const TYPE_LABELS = {
  pdf:          ".pdf",
  document:     ".doc, .docx, .txt, .odt",
  presentation: ".ppt, .pptx, .odp",
  video:        ".mp4, .mov, .avi, .mkv, .webm",
};

const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter(req, file, cb) {
    const resourceType = (req.body.type || "other").toLowerCase();
    const allowed = TYPE_MIMES[resourceType];

    // "other" or unknown type — accept anything
    if (!allowed || allowed.length === 0) {
      return cb(null, true);
    }

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const label = TYPE_LABELS[resourceType] || resourceType;
      cb(new Error(`Only ${label} files are accepted for ${resourceType} type.`));
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
router.put("/:resourceId/verify", verifyResource);
router.delete("/:resourceId", deleteResource);
router.post("/:resourceId/download", trackDownload);

export default router;
