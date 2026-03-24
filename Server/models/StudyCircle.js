import mongoose from 'mongoose'

const joinRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
)

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    details: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
)

const studyCircleSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    moduleCode: {
      type: String,
      required: [true, 'Module code is required'],
      trim: true,
      uppercase: true,
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1,
      max: 4,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 250,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coModerators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    joinRequests: [joinRequestSchema],
    reports: [reportSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

studyCircleSchema.index({ moduleCode: 1, year: 1 })
studyCircleSchema.index({ members: 1, isActive: 1, updatedAt: -1 })
studyCircleSchema.index({ visibility: 1, isActive: 1, createdAt: -1 })

const StudyCircle = mongoose.model('StudyCircle', studyCircleSchema)
export default StudyCircle
