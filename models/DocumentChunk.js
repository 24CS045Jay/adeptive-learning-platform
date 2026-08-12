import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: false },
    chunkIndex: { type: Number, required: true },
    tokenCount: { type: Number, default: 0 },
    chromaVectorId: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound index on documentId for fast retrieval of document chunks
documentChunkSchema.index({ documentId: 1 });

export const DocumentChunk = mongoose.models.DocumentChunk || mongoose.model("DocumentChunk", documentChunkSchema);
