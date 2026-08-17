import mongoose from "mongoose";

const discussionAnswerSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "" },
    authorRole: { type: String, default: "Student" },
    content: { type: String, required: true },
    isFacultyVerified: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const discussionSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "" },
    authorRole: { type: String, default: "Student" },
    title: { type: String, default: "" },
    message: { type: String, required: true },
    tags: { type: [String], default: [] },
    upvotes: { type: Number, default: 0 },
    answers: { type: [discussionAnswerSchema], default: [] },
  },
  { timestamps: true }
);

export const Discussion = mongoose.models.Discussion || mongoose.model("Discussion", discussionSchema);
