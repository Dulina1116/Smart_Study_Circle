import express from "express";
import {
  getDashboardStats,
  getCircleAnalytics,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, getDashboardStats);
router.get("/analytics/:circleId", protect, getCircleAnalytics);

export default router;
