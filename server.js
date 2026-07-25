import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectMongo } from "./db/mongo.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import subjectRoutes from "./routes/subjects.js";
import documentRoutes from "./routes/documents.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "AI Tutor API Backend", timestamp: new Date().toISOString() });
});

// REST API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/documents", documentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Express Error Handler]:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Start Express server after connecting to MongoDB Atlas
async function startServer() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`[Express Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
