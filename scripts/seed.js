import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";

/**
 * Bootstrap Seed Script for Production / Fresh Deployments
 *
 * Seeds ONLY the single primary Admin account needed to manage the system.
 * Safe and idempotent (skips if an admin account already exists).
 */
async function seedAdmin() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/ai_tutor";
  console.log("[Seed Admin] Connecting to MongoDB...");

  try {
    await mongoose.connect(uri);
    console.log("[Seed Admin] Connected successfully to MongoDB.");

    let adminEmail = process.env.SEED_ADMIN_EMAIL;
    let adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn(
        "\n[SECURITY WARNING] SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD is not set in process.env!\n" +
          "Falling back to default credentials: 'admin@charusat.edu.in' / 'admin123'\n" +
          "PLEASE CHANGE THE ADMIN PASSWORD IMMEDIATELY AFTER FIRST LOGIN!\n",
      );
      adminEmail = adminEmail || "admin@charusat.edu.in";
      adminPassword = adminPassword || "admin123";
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [{ email: adminEmail.toLowerCase() }, { role: "admin" }],
    });

    if (existingAdmin) {
      console.log(
        `[Seed Admin] Admin account already exists: ${existingAdmin.email} (ID: ${existingAdmin._id}). Skipping creation.`,
      );
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const newAdmin = await User.create({
      name: "System Admin",
      email: adminEmail.toLowerCase().trim(),
      passwordHash,
      role: "admin",
      departmentId: "CSE",
    });

    console.log(`\n[Seed Admin Success] Created initial admin account!`);
    console.log(`  - Name: ${newAdmin.name}`);
    console.log(`  - Email: ${newAdmin.email}`);
    console.log(`  - Role: ${newAdmin.role}\n`);

    process.exit(0);
  } catch (error) {
    console.error("[Seed Admin Error] Failed to seed admin account:", error);
    process.exit(1);
  }
}

seedAdmin();
