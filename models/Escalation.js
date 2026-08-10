import mongoose from "mongoose";

const escalationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: false, default: null },
    question: { type: String, required: true },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  },
  { timestamps: true }
);

export const Escalation = mongoose.models.Escalation || mongoose.model("Escalation", escalationSchema);
