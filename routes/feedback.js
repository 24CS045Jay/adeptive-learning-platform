import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { Feedback } from "../models/index.js";

const router = express.Router();

router.use(authenticate);

// ── GET /api/feedback ───────────────────────────────────────────────────────
// Admin/Faculty view aggregated helpfulness stats & feedback entries
router.get("/", requireRole("admin", "faculty"), async (req, res) => {
  try {
    const feedbackList = await Feedback.find()
      .populate("studentId", "name email")
      .populate("subjectId", "name code")
      .sort({ createdAt: -1 });

    const total = feedbackList.length;
    const upvotes = feedbackList.filter((f) => f.rating === "up").length;
    const helpfulnessPct = total > 0 ? Math.round((upvotes / total) * 100) : 100;

    const formattedList = feedbackList.map((f) => ({
      ...f.toObject(),
      id: String(f._id),
      isThumbsUp: f.rating === "up",
      timestamp: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString(),
    }));

    res.json({
      stats: {
        total,
        upvotes,
        downvotes: total - upvotes,
        helpfulnessPct,
      },
      feedback: formattedList,
    });
  } catch (error) {
    console.error("[Feedback API] GET error:", error);
    res.status(500).json({ error: "Failed to fetch feedback." });
  }
});

// ── POST /api/feedback ──────────────────────────────────────────────────────
// Student submits AI response rating (thumbs up/down + optional comment)
router.post("/", async (req, res) => {
  try {
    const { question, answer, rating, isThumbsUp, comment, subjectId } = req.body;

    let finalRating = rating;
    if (!finalRating && typeof isThumbsUp === "boolean") {
      finalRating = isThumbsUp ? "up" : "down";
    }

    if (!question || !answer || !finalRating) {
      return res.status(400).json({ error: "question, answer, and rating (up/down) are required." });
    }

    const fb = await Feedback.create({
      studentId: req.user._id || req.user.id,
      subjectId: subjectId || null,
      question,
      answer,
      rating: finalRating,
      comment: comment || "",
    });

    res.status(201).json({
      ...fb.toObject(),
      id: String(fb._id),
      isThumbsUp: fb.rating === "up",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Feedback API] POST error:", error);
    res.status(500).json({ error: "Failed to record feedback." });
  }
});

export default router;
