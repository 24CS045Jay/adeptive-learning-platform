/**
 * routes/tutor.js — POST /api/tutor/ask
 *
 * Real RAG-powered Ask Tutor endpoint.
 * Flow:
 *   1. Soft auth — tries real JWT, falls back to x-user-id header (simulated token compat)
 *   2. Look up Subject → get subjectCode
 *   3. Query Python RAG service for top-K chunks
 *   4. Compute confidence from best distance (cosine: lower = more similar)
 *   5a. Below threshold → escalate + log → return fallback message
 *   5b. Above threshold → build prompt → callLLM() → resolve source filenames → return answer
 *   6. Always log to RagInteractionLog
 */

import express                from "express";
import jwt                    from "jsonwebtoken";
import { JWT_SECRET }         from "../middleware/auth.js";
import { Subject, Document, Escalation, RagInteractionLog } from "../models/index.js";
import { callLLM }            from "../lib/llm.js";

const router = express.Router();

const RAG_SERVICE_URL      = process.env.RAG_SERVICE_URL      || "http://localhost:8001";
const CONFIDENCE_THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD ?? "0.55");

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Cosine distance from ChromaDB is in [0, 2]: 0 = identical, 2 = opposite.
// A distance <= 0.85 indicates semantic relevance for MiniLM embeddings.
// We map distance to confidence:  confidence = 1 - (distance * 0.7)
function distanceToConfidence(distance) {
  return Math.max(0, Math.min(1, parseFloat((1 - distance * 0.7).toFixed(4))));
}

// ─── Soft Auth Middleware ─────────────────────────────────────────────────────
// The existing authenticate() middleware calls res.status(401).json() directly
// without calling next(err), so it cannot be safely wrapped.
// This inline version:
//   1. Tries a real JWT verification.
//   2. Falls back to x-user-id / x-user-role headers (for simulated-token frontends).
//   3. Allows anonymous access if neither is present (question logged without studentId).
function softAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization ?? "";

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: decoded.id, role: decoded.role, name: decoded.name };
      return next();
    } catch {
      // Simulated or expired token — fall through to header fallback
    }
  }

  // Header fallback used when the frontend issues simulated JWTs
  const userId   = req.headers["x-user-id"];
  const userRole = req.headers["x-user-role"] || "student";
  if (userId) {
    req.user = { id: userId, role: userRole };
    return next();
  }

  // Anonymous — allow through, studentId will be null in the log
  req.user = null;
  return next();
}

// ─── POST /api/tutor/ask ──────────────────────────────────────────────────────
router.post("/ask", softAuthenticate, async (req, res) => {
  try {
    const { subjectId, subjectCode: bodySubjectCode, question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ error: "question is required." });
    }

    // ── Validate studentId — mock IDs like 'u178...' are not ObjectIds ───
    const OBJECTID_RE = /^[0-9a-fA-F]{24}$/;
    const rawStudentId = req.user?.id || req.user?._id || null;
    const studentId = rawStudentId && OBJECTID_RE.test(String(rawStudentId))
      ? rawStudentId
      : null;

    // ── Step 1: resolve subjectCode ───────────────────────────────────────
    // Priority: (1) subjectCode sent by frontend, (2) MongoDB lookup, (3) GENERAL
    let subject     = null;
    let subjectCode = bodySubjectCode?.trim() || "GENERAL";

    if (!bodySubjectCode && subjectId) {
      try {
        subject = await Subject.findById(subjectId).lean();
        if (subject?.code) subjectCode = subject.code;
      } catch {
        // subjectId may be a mock string — non-fatal
      }
    }

    // ── Step 2: query Python RAG service ─────────────────────────────────
    let ragResults = [];
    let ragError   = null;

    try {
      const ragRes = await fetch(`${RAG_SERVICE_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectCode, question: question.trim(), topK: 5 }),
        signal: AbortSignal.timeout(30_000),
      });

      if (ragRes.ok) {
        const ragData = await ragRes.json();
        ragResults = ragData.results ?? [];
      } else {
        ragError = `RAG service returned ${ragRes.status}`;
        console.warn("[Ask Tutor] RAG query error:", ragError);
      }
    } catch (err) {
      ragError = err.message;
      console.warn("[Ask Tutor] RAG service unreachable:", ragError);
    }

    // ── Step 3: compute confidence ────────────────────────────────────────
    const bestDistance = ragResults.length > 0 ? ragResults[0].distance : 2;
    const confidence   = distanceToConfidence(bestDistance);

    // ── Step 4a: escalation (low confidence or no chunks) ─────────────────
    if (confidence < CONFIDENCE_THRESHOLD || ragResults.length === 0) {
      try {
        await Escalation.create({
          studentId:  studentId || undefined,
          subjectId:  subject?._id || undefined,
          question:   question.trim(),
          status:     "open",
        });
      } catch (escErr) {
        console.warn("[Ask Tutor] Failed to create escalation:", escErr.message);
      }

      await RagInteractionLog.create({
        studentId:       studentId || undefined,
        subjectId:       subject?._id || undefined,
        question:        question.trim(),
        confidenceScore: confidence,
        escalated:       true,
        llmProvider:     null,
        sources:         [],
      }).catch((e) => console.warn("[RagInteractionLog] write failed:", e.message));

      return res.json({
        answer:
          "I don't have enough approved material to answer this confidently yet. " +
          "Your question has been escalated to the faculty for review.",
        escalated:  true,
        confidence: parseFloat(confidence.toFixed(4)),
        sources:    [],
      });
    }

    // ── Step 4b: build context from retrieved chunks ──────────────────────
    const contextText = ragResults
      .map((r, i) => `[Chunk ${i + 1}]\n${r.text}`)
      .join("\n\n---\n\n");

    const systemPrompt =
      "You are a helpful academic tutor. " +
      "Answer the student's question ONLY using the provided course material chunks below. " +
      "If the chunks do not fully answer the question, say so explicitly and do NOT use any outside knowledge. " +
      "Be concise, clear, and accurate. Do not hallucinate or invent information.";

    const userPrompt =
      `Course material context:\n\n${contextText}\n\n---\n\nStudent question: ${question.trim()}`;

    // ── Step 5: call LLM (Gemini → Groq fallback) ────────────────────────
    let answerText  = "";
    let llmProvider = null;

    try {
      const llmResult = await callLLM(systemPrompt, userPrompt);
      answerText  = llmResult.text;
      llmProvider = llmResult.provider;
    } catch (llmErr) {
      console.error("[Ask Tutor] LLM call failed:", llmErr.message);
      answerText = contextText; // return raw chunks as fallback
    }

    // ── Step 6: resolve source file names from Document collection ────────
    const documentIds = [
      ...new Set(ragResults.map((r) => r.metadata?.documentId).filter(Boolean)),
    ];

    const docRecords = await Document.find({ _id: { $in: documentIds } })
      .select("fileName")
      .lean();

    const docMap = {};
    for (const d of docRecords) {
      docMap[String(d._id)] = d.fileName;
    }

    const sources = ragResults
      .map((r) => ({
        documentId: r.metadata?.documentId ?? null,
        fileName:   docMap[r.metadata?.documentId] ?? "Unknown document",
        chunkIndex: parseInt(r.metadata?.chunkIndex ?? "0", 10),
      }))
      .filter((s) => s.documentId);

    // ── Step 7: log the interaction ───────────────────────────────────────
    await RagInteractionLog.create({
      studentId:       studentId || undefined,
      subjectId:       subject?._id || undefined,
      question:        question.trim(),
      confidenceScore: confidence,
      escalated:       false,
      llmProvider,
      sources,
    }).catch((e) => console.warn("[RagInteractionLog] write failed:", e.message));

    return res.json({
      answer:     answerText,
      escalated:  false,
      confidence: parseFloat(confidence.toFixed(4)),
      sources,
      provider:   llmProvider,
    });
  } catch (error) {
    console.error("[Ask Tutor] Unhandled error:", error);
    return res.status(500).json({ error: "Failed to process your question. Please try again." });
  }
});

export default router;
