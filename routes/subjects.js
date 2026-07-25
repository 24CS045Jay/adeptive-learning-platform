import express from "express";
import { Subject, AuditLog } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /api/subjects - List all subjects (populates facultyId)
router.get("/", authenticate, async (req, res) => {
  try {
    const subjects = await Subject.find().populate("facultyId", "name email role").sort({ code: 1 });
    return res.json(subjects);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch subjects." });
  }
});

// GET /api/subjects/:id - Get single subject
router.get("/:id", authenticate, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate("facultyId", "name email role");
    if (!subject) return res.status(404).json({ error: "Subject not found." });
    return res.json(subject);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch subject." });
  }
});

// POST /api/subjects - Create subject (Admin only)
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, code, semester, facultyId } = req.body;
    if (!name || !code || !semester) {
      return res.status(400).json({ error: "Name, code, and semester are required." });
    }

    const existing = await Subject.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: `Subject with code '${code}' already exists.` });
    }

    const subject = await Subject.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      semester: Number(semester),
      facultyId: facultyId || null,
    });

    await AuditLog.create({
      actorId: req.user.id || req.user._id,
      action: "CREATE_SUBJECT",
      details: { subjectId: subject._id, code: subject.code, name: subject.name },
    });

    return res.status(201).json(subject);
  } catch (error) {
    console.error("[Subject Error] Create error:", error);
    return res.status(500).json({ error: "Failed to create subject." });
  }
});

// PUT /api/subjects/:id - Update subject (Admin only)
router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, code, semester, facultyId } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (code) updates.code = code.trim().toUpperCase();
    if (semester != null) updates.semester = Number(semester);
    if (facultyId !== undefined) updates.facultyId = facultyId || null;

    const updated = await Subject.findByIdAndUpdate(req.params.id, updates, { new: true }).populate("facultyId", "name email role");
    if (!updated) return res.status(404).json({ error: "Subject not found." });

    await AuditLog.create({
      actorId: req.user.id || req.user._id,
      action: "UPDATE_SUBJECT",
      details: { subjectId: updated._id, code: updated.code },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update subject." });
  }
});

// DELETE /api/subjects/:id - Delete subject (Admin only)
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Subject not found." });

    await AuditLog.create({
      actorId: req.user.id || req.user._id,
      action: "DELETE_SUBJECT",
      details: { subjectId: deleted._id, code: deleted.code },
    });

    return res.json({ message: "Subject deleted successfully.", id: req.params.id });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete subject." });
  }
});

export default router;
