import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectMongo } from "./db/mongo.js";

import authRoutes     from "./routes/auth.js";
import userRoutes     from "./routes/users.js";
import subjectRoutes  from "./routes/subjects.js";
import documentRoutes from "./routes/documents.js";
import tutorRoutes    from "./routes/tutor.js";

const app  = express();
const PORT = process.env.PORT || 5000;

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8001";

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "AI Tutor API Backend", timestamp: new Date().toISOString() });
});

// REST API Routes
app.use("/api/auth",      authRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/subjects",  subjectRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/tutor",     tutorRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Express Error Handler]:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ── Python RAG service health probe ─────────────────────────────────────────
async function checkRagServiceHealth() {
  try {
    const res = await fetch(`${RAG_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      console.log(`[Startup] ✅ Python RAG service is reachable at ${RAG_SERVICE_URL}`);
    } else {
      console.warn(
        `[Startup] ⚠️  Python RAG service returned HTTP ${res.status} — ` +
        `Ask Tutor will degrade gracefully until the service is healthy.`
      );
    }
  } catch {
    console.warn(
      `[Startup] ⚠️  Python RAG service is UNREACHABLE at ${RAG_SERVICE_URL}\n` +
      `         → Make sure the Python service is running: cd ml_service && uvicorn main:app --port 8001\n` +
      `         → Ask Tutor will still escalate gracefully, but no real answers will be generated.`
    );
  }
}

// Start Express server after connecting to MongoDB Atlas
async function startServer() {
  await connectMongo();

  // Non-blocking health check — a warning, never a crash
  checkRagServiceHealth();

  app.listen(PORT, () => {
    console.log(`[Express Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
