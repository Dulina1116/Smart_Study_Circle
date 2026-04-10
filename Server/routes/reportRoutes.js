import express from "express";
import {
  getPendingReports,
  updateReportStatus,
} from "../controllers/reportController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), getPendingReports);
router.put("/:id/status", protect, authorizeRoles("admin"), updateReportStatus);

export default router;
