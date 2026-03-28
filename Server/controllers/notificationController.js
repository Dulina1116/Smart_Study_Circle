import Notification from '../models/Notification.js'

// GET /api/notifications  — last 30 notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications.', error: err.message })
  }
}

// PATCH /api/notifications/:id/read  — mark single notification as read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notification.', error: err.message })
  }
}

// PATCH /api/notifications/read-all  — mark all as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all notifications.', error: err.message })
  }
}

// Helper used by other controllers to create a notification
export const createNotification = async ({ recipientId, type, message, metadata = {} }) => {
  try {
    await Notification.create({ recipient: recipientId, type, message, metadata })
  } catch (err) {
    console.error('Notification create error:', err.message)
  }
}
