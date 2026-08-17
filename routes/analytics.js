import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { User, TopicMastery, Attempt, Subject } from "../models/index.js";

const router = express.Router();

router.use(authenticate);

// ── GET /api/analytics/risk-profiles ───────────────────────────────────────
// Dynamically compute student ML risk profiles from real TopicMastery & Attempt data
router.get("/risk-profiles", requireRole("admin", "faculty"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("_id name email");

    const riskProfiles = await Promise.all(
      students.map(async (student) => {
        const studentId = student._id;

        // Fetch student topic masteries
        const masteries = await TopicMastery.find({ studentId }).populate("subjectId", "name code");
        const weakTopics = masteries.filter((m) => m.masteryLabel === "weak");
        const weakTopicCount = weakTopics.length;

        // Fetch student attempts
        const attempts = await Attempt.find({ studentId }).sort({ submittedAt: -1 });

        let scorePct = 75; // default fallback if no attempt yet
        if (attempts.length > 0) {
          const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
          scorePct = Math.round(totalScore / attempts.length);
        }

        // Determine Risk Level
        let risk = "Low";
        if (weakTopicCount >= 3 || scorePct < 60) {
          risk = "High";
        } else if (weakTopicCount >= 1 || scorePct < 75) {
          risk = "Medium";
        }

        // Determine Trend from last 2 attempts
        let trend = "Stable";
        if (attempts.length >= 2) {
          const recentScore = attempts[0].score;
          const previousScore = attempts[1].score;
          if (recentScore > previousScore + 5) trend = "Improving";
          else if (recentScore < previousScore - 5) trend = "Declining";
        }

        // Determine Subject name
        let subjectName = "Big Data Analytics";
        if (masteries.length > 0 && masteries[0].subjectId?.name) {
          subjectName = masteries[0].subjectId.name;
        }

        return {
          studentId: String(student._id),
          studentName: student.name,
          email: student.email,
          subject: subjectName,
          trend,
          risk,
          scorePct,
          weakTopicCount,
        };
      })
    );

    res.json(riskProfiles);
  } catch (error) {
    console.error("[Analytics API] GET /risk-profiles error:", error);
    res.status(500).json({ error: "Failed to compute student risk profiles." });
  }
});

export default router;
