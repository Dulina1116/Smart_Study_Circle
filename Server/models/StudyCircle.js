import mongoose from 'mongoose';

const studyCircleSchema = new mongoose.Schema({
  // Using strict: false so Mongoose will map any arbitrary properties
  // found in the documents accurately.
}, {
  strict: false,
  timestamps: true,
  collection: 'studycircles'
});

const StudyCircle = mongoose.model('StudyCircle', studyCircleSchema);

export default StudyCircle;
