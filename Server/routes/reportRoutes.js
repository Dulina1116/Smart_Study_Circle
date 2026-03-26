import express from "express";
import {
  getPendingReports,
  updateReportStatus,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getPendingReports);
router.put("/:id/status", protect, updateReportStatus);

export default router;
