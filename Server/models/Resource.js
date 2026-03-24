import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  size: { type: Number, required: true }, // in bytes
  type: { type: String }, // e.g., 'PDF', 'DOCX'
  visibility: { type: String, enum: ['Students', 'Lecturers', 'Public'], default: 'Students' },
  downloads: { type: Number, default: 0 },
  module: { type: String },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
})

export default mongoose.model('Resource', resourceSchema)
