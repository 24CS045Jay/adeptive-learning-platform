import mongoose from "mongoose";

/**
 * Conversation — stores multi-turn student <-> tutor chat history.
 */
const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["student", "tutor"], required: true },
    text: { type: String, required: true },
    worked_example: { type: String, default: null },
    visual: { type: mongoose.Schema.Types.Mixed, default: null },
    sources: [
      {
        documentId: { type: String },
        fileName: { type: String },
        chunkIndex: { type: Number },
      },
    ],
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: false },
    title: { type: String, required: true },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Index for fast lookups by student
conversationSchema.index({ studentId: 1, updatedAt: -1 });

export const Conversation =
  mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
