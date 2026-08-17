import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    institute: { type: String, required: true, default: "CSPIT", trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Department =
  mongoose.models.Department || mongoose.model("Department", departmentSchema);
