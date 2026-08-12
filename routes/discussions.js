import express from "express";
import { authenticate } from "../middleware/auth.js";
import { Discussion, Subject } from "../models/index.js";

const router = express.Router();

router.use(authenticate);

// ── GET /api/discussions ────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { subjectId } = req.query;
    const filter = {};
    if (subjectId) {
      filter.subjectId = subjectId;
    } else if (req.user.role === "student") {
      const studentSubjects = await Subject.find({ enrolledStudentIds: req.user._id || req.user.id }).select("_id");
      const subjectIds = studentSubjects.map((s) => s._id);
      if (subjectIds.length > 0) {
        filter.subjectId = { $in: subjectIds };
      }
    }

    const discussions = await Discussion.find(filter)
      .populate("authorId", "name role")
      .populate("subjectId", "name code")
      .sort({ createdAt: -1 });

    const list = discussions.map((d) => {
      const obj = d.toObject();
      return {
        ...obj,
        id: String(d._id),
        subjectName: d.subjectId?.name || "General",
        author: d.authorName || d.authorId?.name || "Anonymous",
        authorRole: d.authorRole || (d.authorId?.role === "faculty" ? "Faculty" : "Student"),
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        answers: (obj.answers || []).map((ans) => ({
          ...ans,
          id: String(ans._id),
          author: ans.authorName || "Anonymous",
          createdAt: ans.createdAt ? new Date(ans.createdAt).toISOString() : new Date().toISOString(),
        })),
      };
    });

    res.json(list);
  } catch (error) {
    console.error("[Discussions API] GET error:", error);
    res.status(500).json({ error: "Failed to fetch discussion posts." });
  }
});

// ── POST /api/discussions ───────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { subjectId, title, message, content, tags } = req.body;
    const discussionMessage = message || content;

    if (!subjectId || !discussionMessage) {
      return res.status(400).json({ error: "subjectId and message are required." });
    }

    const post = await Discussion.create({
      subjectId,
      authorId: req.user._id || req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role === "faculty" ? "Faculty" : "Student",
      title: title || "",
      message: discussionMessage,
      tags: tags || [],
      upvotes: 1,
      answers: [],
    });

    const populated = await Discussion.findById(post._id)
      .populate("authorId", "name role")
      .populate("subjectId", "name code");

    res.status(201).json({
      ...populated.toObject(),
      id: String(populated._id),
      subjectName: populated.subjectId?.name || "General",
      author: populated.authorName || req.user.name,
      authorRole: populated.authorRole,
      createdAt: new Date().toISOString(),
      answers: [],
    });
  } catch (error) {
    console.error("[Discussions API] POST error:", error);
    res.status(500).json({ error: "Failed to create discussion post." });
  }
});

// ── POST /api/discussions/:id/answers ───────────────────────────────────────
router.post("/:id/answers", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required for answers." });
    }

    const post = await Discussion.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Discussion post not found." });
    }

    const authorRole = req.user.role === "faculty" ? "Faculty" : "Student";
    const newAnswer = {
      authorId: req.user._id || req.user.id,
      authorName: req.user.name,
      authorRole,
      content,
      isFacultyVerified: authorRole === "Faculty",
      upvotes: 1,
    };

    post.answers.push(newAnswer);
    await post.save();

    const updated = await Discussion.findById(req.params.id)
      .populate("authorId", "name role")
      .populate("subjectId", "name code");

    res.status(201).json({
      ...updated.toObject(),
      id: String(updated._id),
      subjectName: updated.subjectId?.name || "General",
      author: updated.authorName || req.user.name,
      authorRole: updated.authorRole,
      createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : new Date().toISOString(),
      answers: updated.answers.map((ans) => ({
        ...ans.toObject(),
        id: String(ans._id),
        author: ans.authorName || "Anonymous",
        createdAt: ans.createdAt ? new Date(ans.createdAt).toISOString() : new Date().toISOString(),
      })),
    });
  } catch (error) {
    console.error("[Discussions API] POST answer error:", error);
    res.status(500).json({ error: "Failed to post answer." });
  }
});

// ── PATCH /api/discussions/:id/upvote ──────────────────────────────────────
router.patch("/:id/upvote", async (req, res) => {
  try {
    const post = await Discussion.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Discussion post not found." });
    }

    post.upvotes += 1;
    await post.save();

    res.json({ id: String(post._id), upvotes: post.upvotes });
  } catch (error) {
    console.error("[Discussions API] PATCH upvote error:", error);
    res.status(500).json({ error: "Failed to upvote discussion post." });
  }
});

export default router;
