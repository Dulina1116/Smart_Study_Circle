import express from 'express';
import { getStudentProgress, getAdminOverview, getLecturerStudentAnalytics } from '../controllers/progressController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/student/:userId', getStudentProgress);
router.get('/admin/overview', protect, authorizeRoles('admin'), getAdminOverview);
router.get('/lecturer/analytics', getLecturerStudentAnalytics);

export default router;
