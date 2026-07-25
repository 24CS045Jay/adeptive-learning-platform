import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    text: { type: String, required: true },
    options: { type: [mongoose.Schema.Types.Mixed], default: [] },
    correctOption: { type: mongoose.Schema.Types.Mixed, required: true },
    topicTag: { type: String, default: "" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
  },
  { timestamps: true }
);

export const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);
