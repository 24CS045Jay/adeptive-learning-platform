import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    resourceType: { type: String, default: "raw" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    chunkCount: { type: Number, default: 0 },
    chromaCollection: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);
