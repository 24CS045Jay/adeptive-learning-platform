import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { Resource, Module } from "../models/index.js";

const router = express.Router();

router.use(authenticate);

// ── GET /api/resources ──────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { moduleId } = req.query;
    const filter = {};
    if (moduleId) {
      filter.moduleId = moduleId;
    }

    const resources = await Resource.find(filter).sort({ createdAt: 1 });
    const list = resources.map((r) => ({
      ...r.toObject(),
      id: String(r._id),
      moduleId: String(r.moduleId),
    }));

    res.json(list);
  } catch (error) {
    console.error("[Resources API] GET error:", error);
    res.status(500).json({ error: "Failed to fetch resources." });
  }
});

// ── POST /api/resources ─────────────────────────────────────────────────────
router.post("/", requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { moduleId, title, url, type } = req.body;
    if (!moduleId || !title || !url) {
      return res.status(400).json({ error: "moduleId, title, and url are required." });
    }

    const resource = await Resource.create({
      moduleId,
      title,
      url,
      type: type || "link",
    });

    res.status(201).json({
      ...resource.toObject(),
      id: String(resource._id),
      moduleId: String(resource.moduleId),
    });
  } catch (error) {
    console.error("[Resources API] POST error:", error);
    res.status(500).json({ error: "Failed to create resource." });
  }
});

// ── DELETE /api/resources/:id ───────────────────────────────────────────────
router.delete("/:id", requireRole("faculty", "admin"), async (req, res) => {
  try {
    const resDoc = await Resource.findByIdAndDelete(req.params.id);
    if (!resDoc) {
      return res.status(404).json({ error: "Resource not found." });
    }
    res.json({ message: "Resource deleted successfully." });
  } catch (error) {
    console.error("[Resources API] DELETE error:", error);
    res.status(500).json({ error: "Failed to delete resource." });
  }
});

export default router;
