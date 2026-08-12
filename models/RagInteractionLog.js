import mongoose from "mongoose";

/**
 * RagInteractionLog — persists every Ask Tutor interaction for analytics and research.
 * Logged on every path: grounded answer, escalation, and LLM fallback.
 */
const ragInteractionLogSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: false },
    question: { type: String, required: true },
    confidenceScore: { type: Number, default: 0 },
    escalated: { type: Boolean, default: false },
    llmProvider: { type: String, default: null }, // "gemini" | "groq" | null
    sources: [
      {
        documentId: { type: String },
        fileName: { type: String },
        chunkIndex: { type: Number },
      },
    ],
    hasVisual: { type: Boolean, default: false },
    visualType: { type: String, default: null },
    hasWorkedExample: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RagInteractionLog =
  mongoose.models.RagInteractionLog ||
  mongoose.model("RagInteractionLog", ragInteractionLogSchema);
