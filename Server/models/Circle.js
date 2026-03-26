import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  date: { type: String },
  time: { type: String }
}, { _id: false });

const circleSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  circleName: { type: String, required: true },
  circleType: { type: String, enum: ['student', 'lecturer'], default: 'lecturer' },
  description: { type: String },
  isPrivate: { type: Boolean, default: false },
  inviteCode: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  firstSession: sessionSchema,
  activity: { type: String, default: 'Newly Created' },
  activityType: { type: String, enum: ['high', 'moderate', 'low'], default: 'moderate' }
}, {
  timestamps: true
});

export default mongoose.model('Circle', circleSchema);
