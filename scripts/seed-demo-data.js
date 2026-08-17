import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  User,
  Subject,
  Module,
  Resource,
  Announcement,
  Escalation,
  Quiz,
  Question,
  ConceptNode,
  ConceptEdge,
  Notification,
  Discussion,
} from "../models/index.js";

/**
 * Opt-In Developer Demo Data Seeding Script
 *
 * Populates realistic demo users, subjects, modules, resources, announcements, and quizzes.
 * WARNING: NEVER run against production databases!
 */
async function seedDemoData() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/ai_tutor";
  console.log("[Seed Demo Data] Connecting to MongoDB...");

  try {
    await mongoose.connect(uri);
    console.log("[Seed Demo Data] Connected successfully to MongoDB.");

    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Seed Demo Users
    const demoUsers = [
      { name: "System Admin", email: "admin@charusat.edu.in", role: "admin" },
      { name: "Dr. Nisha Shah", email: "faculty@charusat.edu.in", role: "faculty" },
      { name: "Prof. Anil Kumar", email: "anil@charusat.edu.in", role: "faculty" },
      { name: "Dr. Priya Rao", email: "priya@charusat.edu.in", role: "faculty" },
      { name: "Aarav Patel", email: "student@charusat.edu.in", role: "student" },
      { name: "Meera Joshi", email: "meera@charusat.edu.in", role: "student" },
      { name: "Kabir Singh", email: "kabir@charusat.edu.in", role: "student" },
    ];

    const userMap = {};
    for (const u of demoUsers) {
      const user = await User.findOneAndUpdate(
        { email: u.email },
        { name: u.name, email: u.email, passwordHash, role: u.role },
        { upsert: true, new: true }
      );
      userMap[u.email] = user._id;
      console.log(`[Demo User] ${u.role.toUpperCase()}: ${u.name} (${u.email})`);
    }

    const studentIds = [userMap["student@charusat.edu.in"], userMap["meera@charusat.edu.in"], userMap["kabir@charusat.edu.in"]].filter(Boolean);

    // 2. Seed Demo Subjects
    const demoSubjects = [
      { name: "Big Data Analytics", code: "CSE501", semester: 5, facultyEmail: "faculty@charusat.edu.in" },
      { name: "Machine Learning", code: "CSE502", semester: 5, facultyEmail: "faculty@charusat.edu.in" },
      { name: "Cloud Computing", code: "CSE503", semester: 5, facultyEmail: "anil@charusat.edu.in" },
      { name: "Distributed Systems", code: "CSE601", semester: 6, facultyEmail: "priya@charusat.edu.in" },
      { name: "Operating Systems", code: "CSE402", semester: 4, facultyEmail: "faculty@charusat.edu.in" },
    ];

    const subjectMap = {};
    for (const s of demoSubjects) {
      const facultyId = userMap[s.facultyEmail];
      const subject = await Subject.findOneAndUpdate(
        { code: s.code },
        {
          name: s.name,
          code: s.code,
          semester: s.semester,
          facultyId,
          enrolledStudentIds: studentIds,
          syllabus: `Syllabus for ${s.name} (${s.code}). Covers core concepts, practical assignments, and exams.`,
        },
        { upsert: true, new: true }
      );
      subjectMap[s.code] = subject._id;
      console.log(`[Demo Subject] ${s.code}: ${s.name}`);
    }

    // 3. Seed Demo Modules & Resources
    const bdaId = subjectMap["CSE501"];
    if (bdaId) {
      const m1 = await Module.findOneAndUpdate(
        { subjectId: bdaId, name: "Unit 1 – MapReduce & HDFS" },
        { subjectId: bdaId, name: "Unit 1 – MapReduce & HDFS", order: 1 },
        { upsert: true, new: true }
      );
      await Resource.findOneAndUpdate(
        { moduleId: m1._id, title: "HDFS Architecture Guide" },
        { moduleId: m1._id, title: "HDFS Architecture Guide", url: "https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html", type: "link" },
        { upsert: true, new: true }
      );

      const m2 = await Module.findOneAndUpdate(
        { subjectId: bdaId, name: "Unit 2 – Apache Spark" },
        { subjectId: bdaId, name: "Unit 2 – Apache Spark", order: 2 },
        { upsert: true, new: true }
      );
      await Resource.findOneAndUpdate(
        { moduleId: m2._id, title: "Spark RDD Programming" },
        { moduleId: m2._id, title: "Spark RDD Programming", url: "https://spark.apache.org/docs/latest/rdd-programming-guide.html", type: "link" },
        { upsert: true, new: true }
      );
    }

    // 4. Seed Demo Announcements
    await Announcement.create({
      title: "Welcome to CSE 2026 Semester",
      message: "Classes for Big Data Analytics and Machine Learning commence tomorrow. Check course materials.",
      scope: "institution",
      authorId: userMap["admin@charusat.edu.in"],
    });

    if (bdaId) {
      await Announcement.create({
        title: "MapReduce Assignment 1 Published",
        message: "Assignment 1 on MapReduce word count and joins is now available under Unit 1.",
        scope: "subject",
        subjectId: bdaId,
        authorId: userMap["faculty@charusat.edu.in"],
      });
    }

    // 5. Seed Demo Concept Graph
    if (bdaId) {
      const n1 = await ConceptNode.create({ subjectId: bdaId, name: "HDFS", description: "Hadoop Distributed File System" });
      const n2 = await ConceptNode.create({ subjectId: bdaId, name: "MapReduce", description: "Batch processing paradigm" });
      await ConceptEdge.create({ fromNodeId: n1._id, toNodeId: n2._id, relationType: "supports" });
    }

    console.log("\n[Seed Demo Data Success] Demo data populated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[Seed Demo Data Error] Failed to seed demo data:", error);
    process.exit(1);
  }
}

seedDemoData();
