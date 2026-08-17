import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    semester: { type: Number, required: true },
    departmentId: { type: String, required: true, uppercase: true, trim: true, index: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    syllabus: { type: String, default: "" },
    enrolledStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

export const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);
