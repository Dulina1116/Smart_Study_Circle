import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    circleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
      required: true,
    },
    reportedUserParams: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Dismissed", "Resolved"],
      default: "Pending",
    },
    description: { type: String },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActionRequired: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Report", reportSchema);
