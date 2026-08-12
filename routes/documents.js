import express from "express";
import multer from "multer";
import { cloudinary } from "../lib/cloudinary.js";
import { Document, Subject, AuditLog } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { extractText } from "../lib/textExtract.js";

const router = express.Router();

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8001";

// Multer memory storage configuration for streaming files directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ["pdf", "pptx", "docx"];
    const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";

    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("ALLOWED_TYPES_ONLY"));
    }
    cb(null, true);
  },
});

// Middleware wrapper for multer error handling
function handleUploadFile(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.message === "ALLOWED_TYPES_ONLY" || err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          error: "Invalid file type. Only PDF, PPTX, and DOCX documents are allowed.",
        });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds maximum limit of 25MB." });
      }
      return res.status(400).json({ error: err.message || "File upload validation failed." });
    }
    next();
  });
}

async function performDocumentIngestion(doc, actorId, action) {
  const subjectCode = doc.subjectId?.code || "GENERAL";
  const collectionName = `subject_${subjectCode}`;
  let ingestionStatus = "failed";
  let chunkCount = 0;

  try {
    const text = await extractText(doc.fileUrl, doc.fileName);
    if (!text || !text.trim()) {
      console.warn(`[Ingest] Document ${doc._id} (${doc.fileName}) produced empty text after extraction.`);
    }

    const ingestRes = await fetch(`${RAG_SERVICE_URL}/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: String(doc._id),
        subjectCode,
        text: text || "",
        metadata: {
          subject: subjectCode,
          uploadedAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
          fileName: doc.fileName,
        },
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!ingestRes.ok) {
      const errBody = await ingestRes.text();
      throw new Error(`RAG service returned ${ingestRes.status}: ${errBody.slice(0, 300)}`);
    }

    const ingestData = await ingestRes.json();
    chunkCount = ingestData.chunkCount ?? 0;
    ingestionStatus = "ok";

    if (chunkCount === 0) {
      ingestionStatus = "failed";
      console.warn(`[Ingest] Document ${doc._id} successfully reached RAG service but returned zero chunks.`);
      await AuditLog.create({
        actorId,
        action: "INGEST_FAILED",
        details: {
          documentId: doc._id,
          fileName: doc.fileName,
          subjectCode,
          error: "Zero chunks returned from RAG service",
        },
      });
    }

    console.log(`[Ingest] Document ${doc._id} ingested: ${chunkCount} chunks → ${collectionName}`);
  } catch (ingestErr) {
    ingestionStatus = "failed";
    console.error(`[Ingest] Failed for document ${doc._id}:`, ingestErr.message);

    await AuditLog.create({
      actorId,
      action: "INGEST_FAILED",
      details: {
        documentId: doc._id,
        fileName: doc.fileName,
        subjectCode,
        error: ingestErr.message,
      },
    });
  }

  doc.chunkCount = chunkCount;
  doc.chromaCollection = collectionName;
  doc.ingestionStatus = ingestionStatus;
  await doc.save();

  await AuditLog.create({
    actorId,
    action,
    details: {
      documentId: doc._id,
      fileName: doc.fileName,
      status: doc.status,
      ingestionStatus,
      chunkCount,
      collection: collectionName,
    },
  });

  return { ingestionStatus, chunkCount, collectionName };
}

// GET /api/documents - List documents
router.get("/", authenticate, async (req, res) => {
  try {
    const { status, subjectId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (subjectId) filter.subjectId = subjectId;

    const documents = await Document.find(filter)
      .populate("subjectId", "name code semester")
      .populate("uploaderId", "name email role")
      .sort({ createdAt: -1 });

    return res.json(documents);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch documents." });
  }
});

// POST /api/documents/upload - Faculty & Admin file upload to Cloudinary & MongoDB
router.post("/upload", authenticate, requireRole("faculty", "admin"), handleUploadFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No document file attached. Please select a PDF, PPTX, or DOCX file." });
    }

    const { subjectId, topicTag, unit } = req.body;
    if (!subjectId) {
      return res.status(400).json({ error: "subjectId is required." });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    const subjectFolder = `subjects/${subject.code || "GENERAL"}`;
    const fileName = req.file.originalname;

    // Helper to upload buffer to Cloudinary using raw resource_type
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: subjectFolder,
          resource_type: "raw",
          public_id: `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Create Document record in MongoDB with status pending
    const docRecord = await Document.create({
      subjectId: subject._id,
      uploaderId: req.user._id || req.user.id,
      fileName,
      fileUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      resourceType: "raw",
      status: "pending",
      ingestionStatus: "pending",
      chunkCount: 0,
      chromaCollection: "",
    });

    // Log to AuditLog
    await AuditLog.create({
      actorId: req.user._id || req.user.id,
      action: "UPLOAD_DOCUMENT",
      details: {
        documentId: docRecord._id,
        fileName,
        subjectCode: subject.code,
        cloudinaryPublicId: cloudinaryResult.public_id,
        fileUrl: cloudinaryResult.secure_url,
      },
    });

    return res.status(201).json({
      message: "Document uploaded successfully and queued for admin approval.",
      document: docRecord,
    });
  } catch (error) {
    console.error("[Document Upload Error]:", error);
    return res.status(500).json({ error: error.message || "Failed to upload document." });
  }
});

// PATCH /api/documents/:id/approve - Admin only
router.patch("/:id/approve", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate("subjectId", "name code");
    if (!doc) return res.status(404).json({ error: "Document not found." });

    doc.status = "approved";
    await doc.save();

    const ingestionResult = await performDocumentIngestion(doc, req.user._id || req.user.id, "APPROVE_DOCUMENT");

    return res.json({
      message: `Document approved successfully. Ingestion: ${ingestionResult.ingestionStatus}.`,
      document: doc,
    });
  } catch (error) {
    console.error("[Document Approve Error]:", error);
    return res.status(500).json({ error: "Failed to approve document." });
  }
});

// POST /api/documents/:id/reingest - Admin only
router.post("/:id/reingest", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate("subjectId", "name code");
    if (!doc) return res.status(404).json({ error: "Document not found." });
    if (doc.status !== "approved") {
      return res.status(400).json({ error: "Only approved documents can be re-ingested." });
    }

    const ingestionResult = await performDocumentIngestion(doc, req.user._id || req.user.id, "REINGEST_DOCUMENT");

    return res.json({
      message: `Document re-ingested successfully. Ingestion: ${ingestionResult.ingestionStatus}.`,
      document: doc,
    });
  } catch (error) {
    console.error("[Document Reingest Error]:", error);
    return res.status(500).json({ error: "Failed to re-ingest document." });
  }
});

// PATCH /api/documents/:id/reject - Admin only
router.patch("/:id/reject", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate("subjectId", "code");
    if (!doc) return res.status(404).json({ error: "Document not found." });

    const wasApproved = doc.status === "approved";
    doc.status = "rejected";
    await doc.save();

    // If it was approved, remove its vectors from ChromaDB to avoid orphaned data
    if (wasApproved) {
      const subjectCode = doc.subjectId?.code || "GENERAL";
      try {
        const delRes = await fetch(`${RAG_SERVICE_URL}/delete-document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: String(doc._id), subjectCode }),
          signal: AbortSignal.timeout(15_000),
        });
        if (!delRes.ok) {
          console.warn(`[RAG Delete] Non-ok response for doc ${doc._id}: ${delRes.status}`);
        } else {
          const delData = await delRes.json();
          console.log(`[RAG Delete] Removed ${delData.deleted} vectors for rejected doc ${doc._id}`);
        }
      } catch (delErr) {
        console.warn(`[RAG Delete] Failed to delete vectors for rejected doc ${doc._id}:`, delErr.message);
      }
    }

    await AuditLog.create({
      actorId: req.user._id || req.user.id,
      action: "REJECT_DOCUMENT",
      details: { documentId: doc._id, fileName: doc.fileName, status: "rejected", vectorsRemoved: wasApproved },
    });

    return res.json({ message: "Document rejected.", document: doc });
  } catch (error) {
    console.error("[Document Reject Error]:", error);
    return res.status(500).json({ error: "Failed to reject document." });
  }
});

// DELETE /api/documents/:id - Admin only (Deletes from Cloudinary AND MongoDB together)
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).populate("subjectId", "code");
    if (!doc) return res.status(404).json({ error: "Document not found." });

    const wasApproved = doc.status === "approved";

    // Step 1: Remove from Cloudinary using cloudinaryPublicId
    try {
      if (doc.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(doc.cloudinaryPublicId, { resource_type: "raw" });
      }
    } catch (cErr) {
      console.warn("[Cloudinary Delete Warning]:", cErr.message);
    }

    // Step 2: Remove vectors from ChromaDB if document was ever approved
    if (wasApproved) {
      const subjectCode = doc.subjectId?.code || "GENERAL";
      try {
        const delRes = await fetch(`${RAG_SERVICE_URL}/delete-document`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: String(doc._id), subjectCode }),
          signal: AbortSignal.timeout(15_000),
        });
        if (!delRes.ok) {
          console.warn(`[RAG Delete] Non-ok for doc ${doc._id}: ${delRes.status}`);
        } else {
          const delData = await delRes.json();
          console.log(`[RAG Delete] Removed ${delData.deleted} vectors for deleted doc ${doc._id}`);
        }
      } catch (delErr) {
        console.warn(`[RAG Delete] Could not remove vectors for deleted doc ${doc._id}:`, delErr.message);
      }
    }

    // Step 3: Delete Mongo Document record
    await Document.findByIdAndDelete(doc._id);

    // Step 4: Log to AuditLog
    await AuditLog.create({
      actorId: req.user._id || req.user.id,
      action: "DELETE_DOCUMENT",
      details: {
        documentId: doc._id,
        fileName: doc.fileName,
        cloudinaryPublicId: doc.cloudinaryPublicId,
        vectorsRemoved: wasApproved,
      },
    });

    return res.json({ message: "Document deleted from Cloudinary and MongoDB successfully.", id: req.params.id });
  } catch (error) {
    console.error("[Document Delete Error]:", error);
    return res.status(500).json({ error: "Failed to delete document." });
  }
});

export default router;
