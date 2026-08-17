import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ConceptNode, ConceptEdge } from "../models/index.js";

const router = express.Router();

router.use(authenticate);

// ── GET /api/concept-graph ──────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { subjectId } = req.query;
    const filter = {};
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const nodes = await ConceptNode.find(filter);
    const nodeIds = nodes.map((n) => n._id);

    const edges = await ConceptEdge.find({
      $or: [
        { fromNodeId: { $in: nodeIds } },
        { toNodeId: { $in: nodeIds } },
      ],
    });

    const formattedNodes = nodes.map((n) => ({
      ...n.toObject(),
      id: String(n._id),
    }));

    const formattedEdges = edges.map((e) => ({
      ...e.toObject(),
      id: String(e._id),
      from: String(e.fromNodeId),
      to: String(e.toNodeId),
      fromNodeId: String(e.fromNodeId),
      toNodeId: String(e.toNodeId),
      label: e.relationType,
    }));

    res.json({
      nodes: formattedNodes,
      edges: formattedEdges,
    });
  } catch (error) {
    console.error("[ConceptGraph API] GET error:", error);
    res.status(500).json({ error: "Failed to fetch concept graph." });
  }
});

// ── POST /api/concept-graph/nodes ──────────────────────────────────────────
router.post("/nodes", requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { subjectId, name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Node name is required." });
    }

    const node = await ConceptNode.create({
      subjectId: subjectId || null,
      name,
      description: description || "",
    });

    res.status(201).json({
      ...node.toObject(),
      id: String(node._id),
    });
  } catch (error) {
    console.error("[ConceptGraph API] POST node error:", error);
    res.status(500).json({ error: "Failed to create concept node." });
  }
});

// ── POST /api/concept-graph/edges ──────────────────────────────────────────
router.post("/edges", requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { fromNodeId, toNodeId, relationType } = req.body;
    if (!fromNodeId || !toNodeId || !relationType) {
      return res.status(400).json({ error: "fromNodeId, toNodeId, and relationType are required." });
    }

    const edge = await ConceptEdge.create({
      fromNodeId,
      toNodeId,
      relationType,
    });

    res.status(201).json({
      ...edge.toObject(),
      id: String(edge._id),
      from: String(edge.fromNodeId),
      to: String(edge.toNodeId),
      label: edge.relationType,
    });
  } catch (error) {
    console.error("[ConceptGraph API] POST edge error:", error);
    res.status(500).json({ error: "Failed to create concept edge." });
  }
});

export default router;
