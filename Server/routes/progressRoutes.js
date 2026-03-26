import express from 'express';
import { getStudentProgress, getAdminOverview } from '../controllers/progressController.js';

const router = express.Router();

router.get('/student/:userId', getStudentProgress);
router.get('/admin/overview', getAdminOverview);

export default router;
