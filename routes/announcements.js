import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { Announcement, Subject } from "../models/index.js";

const router = express.Router();

router.use(authenticate);

// ── GET /api/announcements ──────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    const userId = req.user._id || req.user.id;

    let filter = {};
    if (userRole === "student") {
      // Students see institution-wide announcements OR subject-scoped for subjects they are enrolled in
      const enrolledSubjects = await Subject.find({ enrolledStudentIds: userId }).select("_id");
      const subjectIds = enrolledSubjects.map((s) => s._id);

      filter = {
        $or: [
          { scope: "institution" },
          { scope: "subject", subjectId: { $in: subjectIds } },
        ],
      };
    } else if (userRole === "faculty") {
      // Faculty see institution-wide OR announcements for subjects they teach
      const facultySubjects = await Subject.find({ facultyId: userId }).select("_id");
      const subjectIds = facultySubjects.map((s) => s._id);

      filter = {
        $or: [
          { scope: "institution" },
          { authorId: userId },
          { scope: "subject", subjectId: { $in: subjectIds } },
        ],
      };
    }
    // Admin sees all announcements (filter remains {})

    const announcements = await Announcement.find(filter)
      .populate("authorId", "name email role")
      .populate("subjectId", "name code")
      .sort({ createdAt: -1 });

    const list = announcements.map((a) => ({
      ...a.toObject(),
      id: String(a._id),
      postedBy: a.authorId?.name || "System Admin",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
    }));

    res.json(list);
  } catch (error) {
    console.error("[Announcements API] GET error:", error);
    res.status(500).json({ error: "Failed to fetch announcements." });
  }
});

// ── POST /api/announcements ─────────────────────────────────────────────────
router.post("/", requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { title, message, scope, subjectId } = req.body;
    const userRole = req.user.role?.toLowerCase();

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required." });
    }

    let finalScope = scope || (userRole === "admin" ? "institution" : "subject");
    if (userRole !== "admin" && finalScope === "institution") {
      // Faculty can only post subject-scoped announcements
      finalScope = "subject";
    }

    const ann = await Announcement.create({
      title,
      message,
      scope: finalScope,
      subjectId: finalScope === "subject" ? subjectId : null,
      authorId: req.user._id || req.user.id,
    });

    const populated = await Announcement.findById(ann._id).populate("authorId", "name email");

    res.status(201).json({
      ...populated.toObject(),
      id: String(populated._id),
      postedBy: populated.authorId?.name || "System Admin",
      createdAt: populated.createdAt ? new Date(populated.createdAt).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Announcements API] POST error:", error);
    res.status(500).json({ error: "Failed to create announcement." });
  }
});

// ── DELETE /api/announcements/:id ───────────────────────────────────────────
router.delete("/:id", requireRole("faculty", "admin"), async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    const userId = String(req.user._id || req.user.id);
    const authorId = String(ann.authorId);
    const userRole = req.user.role?.toLowerCase();

    // Admin can delete any, faculty can delete their own
    if (userRole !== "admin" && authorId !== userId) {
      return res.status(403).json({ error: "Forbidden: You can only delete your own announcements." });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement deleted successfully." });
  } catch (error) {
    console.error("[Announcements API] DELETE error:", error);
    res.status(500).json({ error: "Failed to delete announcement." });
  }
});

export default router;
