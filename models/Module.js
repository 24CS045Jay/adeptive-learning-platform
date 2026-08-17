import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Module = mongoose.models.Module || mongoose.model("Module", moduleSchema);
