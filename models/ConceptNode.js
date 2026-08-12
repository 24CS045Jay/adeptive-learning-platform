import mongoose from "mongoose";

const conceptNodeSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: false, default: null },
    name: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ConceptNode = mongoose.models.ConceptNode || mongoose.model("ConceptNode", conceptNodeSchema);
