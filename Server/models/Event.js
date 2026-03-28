import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    endDate: {
      type: Date,
      default: null,
    },
    type: {
      type: String,
      enum: ["study_session", "deadline", "exam"],
      required: [true, "Event type is required"],
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyCircle",
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for fast queries by user + date range
eventSchema.index({ user: 1, date: 1 });

const Event = mongoose.model("Event", eventSchema);
export default Event;
