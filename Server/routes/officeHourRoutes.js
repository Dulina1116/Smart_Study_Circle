import express from 'express';
import { getUpcomingOfficeHours, createOfficeHour } from '../controllers/officeHourController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUpcomingOfficeHours)
  .post(protect, createOfficeHour);

export default router;
