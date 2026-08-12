import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: false, default: null },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    rating: { type: String, enum: ["up", "down"], required: true },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
