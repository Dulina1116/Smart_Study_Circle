import express from 'express';
import { getStudentProgress, getAdminOverview, getLecturerStudentAnalytics } from '../controllers/progressController.js';

const router = express.Router();

router.get('/student/:userId', getStudentProgress);
router.get('/admin/overview', getAdminOverview);
router.get('/lecturer/analytics', getLecturerStudentAnalytics);

export default router;
