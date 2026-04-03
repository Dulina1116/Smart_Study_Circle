import Notification from '../models/Notification.js'
import Circle from '../models/Circle.js'
import StudyCircle from '../models/StudyCircle.js'

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

// POST /api/notifications/:id/action
// body: { action: 'join' | 'deny' | 'remind' }
export const handleNotificationAction = async (req, res) => {
  try {
    const { action } = req.body || {}
    const id = req.params.id

    if (!['join', 'deny', 'remind'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action.' })
    }

    const notification = await Notification.findOne({ _id: id, recipient: req.user._id })
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' })
    }

    // JOIN: add user to the referenced circle (Circle or StudyCircle)
    if (action === 'join') {
      const circleId = notification.metadata && notification.metadata.circleId
      if (!circleId) return res.status(400).json({ message: 'No circle attached to this notification.' })

      let target = await Circle.findById(circleId)
      let type = 'circle'
      if (!target) {
        target = await StudyCircle.findById(circleId)
        type = 'studyCircle'
      }

      if (!target) return res.status(404).json({ message: 'Circle not found.' })

      const isMember = (target.members || []).some((m) => String(m) === String(req.user._id))
      if (!isMember) {
        target.members = target.members || []
        target.members.push(req.user._id)

        // if study circle, clear any pending join request for this user
        if (type === 'studyCircle' && Array.isArray(target.joinRequests)) {
          target.joinRequests = target.joinRequests.filter((jr) => String(jr.user) !== String(req.user._id))
        }

        await target.save()
      }

      notification.read = true
      await notification.save()

      return res.json({ ok: true, joined: !isMember ? true : true, circleId: String(circleId), circleType: type })
    }

    // DENY: mark notification read
    if (action === 'deny') {
      notification.read = true
      await notification.save()
      return res.json({ ok: true, denied: true })
    }

    // REMIND: snooze the notification (store a snoozedUntil timestamp)
    if (action === 'remind') {
      const snoozeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      notification.metadata = notification.metadata || {}
      notification.metadata.snoozedUntil = snoozeUntil
      await notification.save()
      return res.json({ ok: true, snoozedUntil })
    }
  } catch (err) {
    console.error('Notification action error:', err.message)
    return res.status(500).json({ message: 'Failed to handle notification action.' })
  }
}
