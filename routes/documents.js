import express from "express";
import multer from "multer";
import { cloudinary } from "../lib/cloudinary.js";
import { Document, Subject, AuditLog } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

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
      chunkCount: 0,
      chromaCollection: `collection_${subject.code.toLowerCase()}`,
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
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found." });

    doc.status = "approved";
    doc.chunkCount = Math.floor(Math.random() * 150) + 50; // Mock chunk count
    await doc.save();

    await AuditLog.create({
      actorId: req.user._id || req.user.id,
      action: "APPROVE_DOCUMENT",
      details: { documentId: doc._id, fileName: doc.fileName, status: "approved" },
    });

    return res.json({ message: "Document approved successfully.", document: doc });
  } catch (error) {
    return res.status(500).json({ error: "Failed to approve document." });
  }
});

// PATCH /api/documents/:id/reject - Admin only
router.patch("/:id/reject", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found." });

    doc.status = "rejected";
    await doc.save();

    await AuditLog.create({
      actorId: req.user._id || req.user.id,
      action: "REJECT_DOCUMENT",
      details: { documentId: doc._id, fileName: doc.fileName, status: "rejected" },
    });

    return res.json({ message: "Document rejected.", document: doc });
  } catch (error) {
    return res.status(500).json({ error: "Failed to reject document." });
  }
});

// DELETE /api/documents/:id - Admin only (Deletes from Cloudinary AND MongoDB together)
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found." });

    // Step 1: Remove from Cloudinary using cloudinaryPublicId
    try {
      if (doc.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(doc.cloudinaryPublicId, { resource_type: "raw" });
      }
    } catch (cErr) {
      console.warn("[Cloudinary Delete Warning]:", cErr.message);
    }

    // Step 2: Delete Mongo Document record
    await Document.findByIdAndDelete(doc._id);

    // Step 3: Log to AuditLog
    await AuditLog.create({
      actorId: req.user._id || req.user.id,
      action: "DELETE_DOCUMENT",
      details: { documentId: doc._id, fileName: doc.fileName, cloudinaryPublicId: doc.cloudinaryPublicId },
    });

    return res.json({ message: "Document deleted from Cloudinary and MongoDB successfully.", id: req.params.id });
  } catch (error) {
    console.error("[Document Delete Error]:", error);
    return res.status(500).json({ error: "Failed to delete document." });
  }
});

export default router;
