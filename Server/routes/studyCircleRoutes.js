import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import {
  assignCoModerator,
  createStudyCircle,
  deleteStudyCircle,
  getDiscoverCircles,
  getCircleMessages,
  getMyStudyCircles,
  getStudyCircleById,
  joinCircleByInviteCode,
  leaveCircle,
  removeCoModerator,
  reportCircle,
  requestJoinCircle,
  respondToJoinRequest,
  sendCircleFileMessage,
  sendCircleMessage,
  updateStudyCircle,
} from "../controllers/studyCircleController.js";

const router = express.Router();

const chatUploadDir = path.join(process.cwd(), "uploads", "chat");
if (!fs.existsSync(chatUploadDir)) {
  fs.mkdirSync(chatUploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, chatUploadDir);
  },
  filename(req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `chat-${req.user.id}-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(protect);

router.post("/", createStudyCircle);
router.get("/my", getMyStudyCircles);
router.get("/discover", getDiscoverCircles);
router.post("/join-by-code", joinCircleByInviteCode);
router.get("/:circleId", getStudyCircleById);
router.delete("/:circleId", deleteStudyCircle);
router.put("/:circleId", updateStudyCircle);
router.post("/:circleId/request-join", requestJoinCircle);
router.get("/:circleId/messages", getCircleMessages);
router.post("/:circleId/messages", sendCircleMessage);
router.post(
  "/:circleId/messages/upload",
  upload.single("file"),
  sendCircleFileMessage,
);
router.post("/:circleId/requests/:requestId", respondToJoinRequest);
router.post("/:circleId/co-moderators", assignCoModerator);
router.delete("/:circleId/co-moderators/:userId", removeCoModerator);
router.post("/:circleId/leave", leaveCircle);
router.post("/:circleId/report", reportCircle);

export default router;
