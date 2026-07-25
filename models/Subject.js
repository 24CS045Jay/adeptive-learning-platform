import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, trim: true },
    semester: { type: Number, required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

export const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
