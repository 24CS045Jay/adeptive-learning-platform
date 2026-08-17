import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { Escalation, Subject, User } from "../models/index.js";

const router = express.Router();

router.use(authenticate);

// ── GET /api/escalations ───────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const userRole = req.user.role?.toLowerCase();
    const userId = req.user._id || req.user.id;

    let filter = {};
    if (userRole === "faculty") {
      const facultySubjects = await Subject.find({ facultyId: userId }).select("_id");
      const subjectIds = facultySubjects.map((s) => s._id);
      filter = { subjectId: { $in: subjectIds } };
    } else if (userRole === "student") {
      filter = { studentId: userId };
    }
    // Admin sees all (filter remains {})

    const escalations = await Escalation.find(filter)
      .populate("studentId", "name email")
      .populate("subjectId", "name code")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 });

    const list = escalations.map((e) => ({
      ...e.toObject(),
      id: String(e._id),
      student: e.studentId?.name || "Student",
      subject: e.subjectId?.name || e.subjectId?.code || "General",
      question: e.question,
      status: e.status,
      escalatedAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
      facultyAnswer: e.facultyAnswer || "",
      resolvedBy: e.resolvedBy?.name || "",
    }));

    res.json(list);
  } catch (error) {
    console.error("[Escalations API] GET error:", error);
    res.status(500).json({ error: "Failed to fetch escalations." });
  }
});

// ── POST /api/escalations ──────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { question, subjectId, subject } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    let targetSubjectId = subjectId;
    if (!targetSubjectId && subject) {
      const sDoc = await Subject.findOne({
        $or: [{ name: subject }, { code: subject }],
      });
      if (sDoc) targetSubjectId = sDoc._id;
    }

    const escalation = await Escalation.create({
      studentId: req.user._id || req.user.id,
      subjectId: targetSubjectId || null,
      question,
      status: "open",
    });

    const populated = await Escalation.findById(escalation._id)
      .populate("studentId", "name email")
      .populate("subjectId", "name code");

    res.status(201).json({
      ...populated.toObject(),
      id: String(populated._id),
      student: populated.studentId?.name || req.user.name || "Student",
      subject: populated.subjectId?.name || subject || "General",
      question: populated.question,
      status: populated.status,
      escalatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Escalations API] POST error:", error);
    res.status(500).json({ error: "Failed to create escalation." });
  }
});

// ── PATCH /api/escalations/:id/resolve ─────────────────────────────────────
router.patch("/:id/resolve", requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { facultyAnswer } = req.body;
    const escalationId = req.params.id;

    const esc = await Escalation.findById(escalationId);
    if (!esc) {
      return res.status(404).json({ error: "Escalation not found." });
    }

    esc.status = "resolved";
    esc.facultyAnswer = facultyAnswer || esc.facultyAnswer || "";
    esc.resolvedBy = req.user._id || req.user.id;
    await esc.save();

    const updated = await Escalation.findById(escalationId)
      .populate("studentId", "name email")
      .populate("subjectId", "name code")
      .populate("resolvedBy", "name email");

    res.json({
      ...updated.toObject(),
      id: String(updated._id),
      student: updated.studentId?.name || "Student",
      subject: updated.subjectId?.name || "General",
      status: updated.status,
      facultyAnswer: updated.facultyAnswer,
      resolvedBy: updated.resolvedBy?.name || req.user.name || "Faculty",
    });
  } catch (error) {
    console.error("[Escalations API] PATCH resolve error:", error);
    res.status(500).json({ error: "Failed to resolve escalation." });
  }
});

export default router;
