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

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;
