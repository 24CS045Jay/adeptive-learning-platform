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

// Compound index for unique/fast lookups of topic mastery per student, subject, and topic tag
topicMasterySchema.index({ studentId: 1, subjectId: 1, topicTag: 1 });

export const TopicMastery = mongoose.models.TopicMastery || mongoose.model("TopicMastery", topicMasterySchema);
