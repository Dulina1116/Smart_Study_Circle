import express from "express";
import {
  createCircle,
  getLecturerCircles,
  updateCircle,
  deleteCircle,
  inviteMembers,
} from "../controllers/circleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createCircle).get(protect, getLecturerCircles);

router.route("/:id").put(protect, updateCircle).delete(protect, deleteCircle);

router.route("/:id/invite").post(protect, inviteMembers);

export default router;
