import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['lecture-notes', 'past-papers', 'summaries', 'core-text', 'seminar', 'handout', 'other'],
      default: 'other',
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'document', 'presentation', 'video', 'link', 'other'],
      default: 'other',
    },
    filePath: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: null,
    },
    externalLink: {
      type: String,
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isLecturerRecommended: {
      type: Boolean,
      default: false,
    },
    circleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyCircle',
      default: null,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

resourceSchema.index({ category: 1, type: 1 })
resourceSchema.index({ uploadedBy: 1, isActive: 1 })
resourceSchema.index({ circleId: 1, isActive: 1 })
resourceSchema.index({ isLecturerRecommended: 1, isActive: 1, createdAt: -1 })

const Resource = mongoose.model('Resource', resourceSchema)
export default Resource
