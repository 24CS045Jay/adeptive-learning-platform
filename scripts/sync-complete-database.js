import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Subject } from "../models/index.js";

async function syncCompleteDatabase() {
  const uri = process.env.MONGO_URI;
  console.log("[SyncCompleteDB] Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("[SyncCompleteDB] Connected to MongoDB Atlas!");

  // 1. Sync Admin User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("12345678", salt);

  const adminEmail = "hod@charusat.ac.in";
  const adminUser = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      name: "Amit Thakkar",
      email: adminEmail,
      passwordHash,
      role: "admin",
      departmentId: "CSE",
    },
    { upsert: true, returnDocument: "after" },
  );
  console.log(`[SyncCompleteDB] ✅ Admin User synced: ${adminUser.name} (${adminUser.email})`);

  // 2. Sync Seed Subjects into MongoDB Atlas
  const seedSubjectsData = [
    {
      name: "Big Data Analytics",
      code: "CSE501",
      semester: 5,
      syllabus: "Covers MapReduce, Spark, and big data pipelines.",
    },
    {
      name: "Machine Learning",
      code: "CSE502",
      semester: 5,
      syllabus: "Covers supervised/unsupervised algorithms and deep learning.",
    },
    {
      name: "Cloud Computing",
      code: "CSE503",
      semester: 5,
      syllabus: "Covers AWS, Azure, GCP, virtualisation, and containers.",
    },
    {
      name: "Distributed Systems",
      code: "CSE601",
      semester: 6,
      syllabus: "Covers Paxos, Raft, CAP theorem, and consistency.",
    },
  ];

  for (const s of seedSubjectsData) {
    const updatedSubject = await Subject.findOneAndUpdate(
      { code: s.code },
      {
        name: s.name,
        code: s.code,
        semester: s.semester,
        syllabus: s.syllabus,
        departmentId: "CSE",
        facultyId: adminUser._id,
      },
      { upsert: true, returnDocument: "after" },
    );
    console.log(
      `[SyncCompleteDB] ✅ Subject synced: ${updatedSubject.code} - ${updatedSubject.name}`,
    );
  }

  const userCount = await User.countDocuments();
  const subjectCount = await Subject.countDocuments();
  console.log(`\n[SyncCompleteDB] Final MongoDB Atlas Counts:`);
  console.log(`  - Users Collection Count: ${userCount}`);
  console.log(`  - Subjects Collection Count: ${subjectCount}`);

  await mongoose.disconnect();
  console.log("[SyncCompleteDB] Sync completed successfully!");
}

syncCompleteDatabase().catch((err) => {
  console.error("[SyncCompleteDB Error]", err);
  process.exit(1);
});
