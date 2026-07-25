import mongoose from "mongoose";

const topicMasterySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    topicTag: { type: String, required: true },
    masteryLabel: { type: String, enum: ["weak", "average", "strong"], required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TopicMastery = mongoose.models.TopicMastery || mongoose.model("TopicMastery", topicMasterySchema);
