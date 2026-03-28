import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['invite', 'resource', 'general'],
      default: 'general',
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
)

notificationSchema.index({ recipient: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification
