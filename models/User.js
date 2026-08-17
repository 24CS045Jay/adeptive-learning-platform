import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "super_admin", "faculty", "student"], required: true },
    // Department code/id. It is required by application authorization for every
    // non-super_admin account, but remains optional in the schema for migration
    // compatibility with legacy records.
    departmentId: { type: String, trim: true, uppercase: true, index: true },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
