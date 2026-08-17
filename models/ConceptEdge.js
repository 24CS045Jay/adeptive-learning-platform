import mongoose from "mongoose";

const conceptEdgeSchema = new mongoose.Schema(
  {
    fromNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "ConceptNode", required: true },
    toNodeId: { type: mongoose.Schema.Types.ObjectId, ref: "ConceptNode", required: true },
    relationType: { type: String, required: true },
  },
  { timestamps: true }
);

export const ConceptEdge = mongoose.models.ConceptEdge || mongoose.model("ConceptEdge", conceptEdgeSchema);
