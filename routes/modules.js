import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { Module, Resource, Subject } from "../models/index.js";

const router = express.Router();

router.use(authenticate);

// ── GET /api/modules ────────────────────────────────────────────────────────
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

    const modules = await Module.find(filter).sort({ order: 1, createdAt: 1 });
    const list = modules.map((m) => ({
      ...m.toObject(),
      id: String(m._id),
      subjectId: String(m.subjectId),
    }));

    res.json(list);
  } catch (error) {
    console.error("[Modules API] GET error:", error);
    res.status(500).json({ error: "Failed to fetch modules." });
  }
});

// ── POST /api/modules ───────────────────────────────────────────────────────
router.post("/", requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { subjectId, name, title, order } = req.body;
    const moduleName = name || title;
    if (!subjectId || !moduleName) {
      return res.status(400).json({ error: "subjectId and module name are required." });
    }

    const newModule = await Module.create({
      subjectId,
      name: moduleName,
      order: order ?? 0,
    });

    res.status(201).json({
      ...newModule.toObject(),
      id: String(newModule._id),
      subjectId: String(newModule.subjectId),
    });
  } catch (error) {
    console.error("[Modules API] POST error:", error);
    res.status(500).json({ error: "Failed to create module." });
  }
});

// ── DELETE /api/modules/:id ────────────────────────────────────────────────
router.delete("/:id", requireRole("faculty", "admin"), async (req, res) => {
  try {
    const mod = await Module.findByIdAndDelete(req.params.id);
    if (!mod) {
      return res.status(404).json({ error: "Module not found." });
    }
    // Also remove resources belonging to this module
    await Resource.deleteMany({ moduleId: req.params.id });

    res.json({ message: "Module and its associated resources deleted successfully." });
  } catch (error) {
    console.error("[Modules API] DELETE error:", error);
    res.status(500).json({ error: "Failed to delete module." });
  }
});

export default router;
