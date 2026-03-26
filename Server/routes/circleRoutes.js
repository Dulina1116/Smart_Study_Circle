import express from "express";
import {
  createCircle,
  getLecturerCircles,
  updateCircle,
  deleteCircle,
} from "../controllers/circleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createCircle).get(protect, getLecturerCircles);

router.route("/:id").put(protect, updateCircle).delete(protect, deleteCircle);

export default router;
