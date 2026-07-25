import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Subject } from "../models/index.js";

/**
 * Seed script populates MongoDB Atlas with prototype users and subjects.
 * Idempotent (uses upsert to avoid duplicate errors).
 */
async function seedDatabase() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/ai_tutor";
  console.log("[Seed] Connecting to MongoDB...");

  try {
    await mongoose.connect(uri);
    console.log("[Seed] Connected successfully to MongoDB.");

    const defaultPassword = "password123";
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    // 1. Seed Users (1 Admin, 3 Faculty, 3 Students)
    const seedUsersData = [
      { name: "System Admin", email: "admin@charusat.edu.in", passwordHash, role: "admin" },
      { name: "Dr. Nisha Shah", email: "faculty@charusat.edu.in", passwordHash, role: "faculty" },
      { name: "Prof. Anil Kumar", email: "anil@charusat.edu.in", passwordHash, role: "faculty" },
      { name: "Dr. Priya Rao", email: "priya@charusat.edu.in", passwordHash, role: "faculty" },
      { name: "Aarav Patel", email: "student@charusat.edu.in", passwordHash, role: "student" },
      { name: "Meera Joshi", email: "meera@charusat.edu.in", passwordHash, role: "student" },
      { name: "Kabir Singh", email: "kabir@charusat.edu.in", passwordHash, role: "student" },
    ];

    const userMap = {};
    for (const u of seedUsersData) {
      const updatedUser = await User.findOneAndUpdate(
        { email: u.email },
        { $setOnInsert: u },
        { upsert: true, new: true }
      );
      userMap[u.email] = updatedUser._id;
      console.log(`[Seed User] ${u.role.toUpperCase()}: ${u.name} (${u.email})`);
    }

    // 2. Seed 6 Subjects
    const seedSubjectsData = [
      { name: "Big Data Analytics", code: "CSE501", semester: 5, facultyEmail: "faculty@charusat.edu.in" },
      { name: "Operating Systems", code: "CSE502", semester: 5, facultyEmail: "anil@charusat.edu.in" },
      { name: "Theory Of Computation", code: "CSE503", semester: 5, facultyEmail: "priya@charusat.edu.in" },
      { name: "Competitive Programming", code: "CSE504", semester: 5, facultyEmail: "faculty@charusat.edu.in" },
      { name: "Machine Learning", code: "CSE505", semester: 5, facultyEmail: "anil@charusat.edu.in" },
      { name: "Research Methodology", code: "CSE506", semester: 5, facultyEmail: "priya@charusat.edu.in" },
    ];

    for (const s of seedSubjectsData) {
      const facultyId = userMap[s.facultyEmail];
      await Subject.findOneAndUpdate(
        { code: s.code },
        {
          name: s.name,
          code: s.code,
          semester: s.semester,
          facultyId,
        },
        { upsert: true, new: true }
      );
      console.log(`[Seed Subject] ${s.code}: ${s.name} (Semester ${s.semester})`);
    }

    console.log("\n[Seed Success] MongoDB seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[Seed Error] Failed to seed database:", error);
    process.exit(1);
  }
}

seedDatabase();
