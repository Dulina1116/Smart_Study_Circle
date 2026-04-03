import express from 'express'
import { getNotifications, markAsRead, markAllRead, handleNotificationAction } from '../controllers/notificationController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getNotifications)
router.patch('/read-all', protect, markAllRead)
router.patch('/:id/read', protect, markAsRead)
router.post('/:id/action', protect, handleNotificationAction)

export default router
