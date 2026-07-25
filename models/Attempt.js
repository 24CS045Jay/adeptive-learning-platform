import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    answers: { type: [mongoose.Schema.Types.Mixed], default: [] },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Attempt = mongoose.models.Attempt || mongoose.model("Attempt", attemptSchema);
