import express from "express";
import bcrypt from "bcryptjs";
import { User, AuditLog } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// GET /api/users - List users (Admin/Faculty)
router.get("/", authenticate, requireRole("admin", "faculty"), async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users." });
  }
});

// GET /api/users/:id - Get single user
router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user." });
  }
});

// POST /api/users - Create user (Admin only)
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required." });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role.toLowerCase(),
    });

    await AuditLog.create({
      actorId: req.user.id || req.user._id,
      action: "CREATE_USER",
      details: { createdUserId: user._id, email: user.email, role: user.role },
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("[User Error] Create error:", error);
    return res.status(500).json({ error: "Failed to create user." });
  }
});

// PUT /api/users/:id - Update user (Admin only)
router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (role) updates.role = role.toLowerCase();
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-passwordHash");
    if (!updatedUser) return res.status(404).json({ error: "User not found." });

    await AuditLog.create({
      actorId: req.user.id || req.user._id,
      action: "UPDATE_USER",
      details: { updatedUserId: updatedUser._id, updates: Object.keys(updates) },
    });

    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update user." });
  }
});

// DELETE /api/users/:id - Delete user (Admin only)
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found." });

    await AuditLog.create({
      actorId: req.user.id || req.user._id,
      action: "DELETE_USER",
      details: { deletedUserId: deleted._id, email: deleted.email },
    });

    return res.json({ message: "User deleted successfully.", id: req.params.id });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete user." });
  }
});

export default router;
