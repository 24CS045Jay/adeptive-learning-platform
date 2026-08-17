import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, AuditLog } from "../models/index.js";
import { authenticate, JWT_SECRET } from "../middleware/auth.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (role && user.role !== role.toLowerCase()) {
      return res.status(403).json({ error: `Account is registered as ${user.role}. Select correct tab.` });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // AuditLog entry for login
    await AuditLog.create({
      actorId: user._id,
      action: "USER_LOGIN",
      details: { email: user.email, role: user.role, ip: req.ip },
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Auth Error] Login error:", error);
    return res.status(500).json({ error: "Internal server error during login." });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const roleLower = String(role).trim().toLowerCase();
    if (!["student", "faculty", "admin"].includes(roleLower)) {
      return res.status(400).json({ error: "Role must be student, faculty, or admin." });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: roleLower,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    await AuditLog.create({
      actorId: user._id,
      action: "USER_REGISTER",
      details: { email: user.email, role: user.role, ip: req.ip },
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Auth Error] Register error:", error);
    return res.status(500).json({ error: "Internal server error during registration." });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
