import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ["pdf", "video", "slides", "link", "doc", "other"], default: "link" },
  },
  { timestamps: true }
);

export const Resource = mongoose.models.Resource || mongoose.model("Resource", resourceSchema);
