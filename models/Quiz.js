import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    title: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isAiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
