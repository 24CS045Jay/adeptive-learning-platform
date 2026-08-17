import express from "express";
import bcrypt from "bcryptjs";
import { User, AuditLog } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  isSuperAdmin,
  getDepartmentId,
  scopedResourceFilter,
  assertSameDepartment,
} from "../middleware/department.js";

const router = express.Router();

function publicUser(user) {
  const value = user.toObject ? user.toObject() : user;
  delete value.passwordHash;
  return value;
}

// GET /api/users - List users. Department-scoped admins/HODs only see their department.
router.get("/", authenticate, requireRole("admin", "faculty"), async (req, res) => {
  try {
    const filter = scopedResourceFilter(req, res);
    if (!filter) return;
    const users = await User.find(filter).select("-passwordHash").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch users." });
  }
});

// GET /api/users/:id - Direct lookup is also department-scoped.
router.get("/:id", authenticate, async (req, res) => {
  try {
    const filter = scopedResourceFilter(req, res, { _id: req.params.id });
    if (!filter) return;
    const user = await User.findOne(filter).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user." });
  }
});

// POST /api/users - Create user in the caller's department unless super_admin chooses one.
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !role)
      return res.status(400).json({ error: "Name, email, and role are required." });

    const roleLower = String(role).toLowerCase();
    if (!["student", "faculty", "admin"].includes(roleLower)) {
      return res.status(400).json({ error: "Role must be student, faculty, or admin." });
    }
    const requestedDepartment = req.body.departmentId
      ? String(req.body.departmentId).trim().toUpperCase()
      : null;
    const departmentId = isSuperAdmin(req.user) ? requestedDepartment : getDepartmentId(req.user);
    if (!departmentId)
      return res
        .status(400)
        .json({ error: "departmentId is required for department-scoped accounts." });

    const cleanEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: cleanEmail }))
      return res.status(400).json({ error: "User with this email already exists." });

    const passwordHash = await bcrypt.hash(password || "password1234", await bcrypt.genSalt(10));
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: roleLower,
      departmentId,
    });

    await AuditLog.create({
      actorId: req.user.id || req.user._id,
      action: "CREATE_USER",
      details: { createdUserId: user._id, email: user.email, role: user.role, departmentId },
    });
    return res.status(201).json(publicUser(user));
  } catch (error) {
    console.error("[User Error] Create error:", error);
    return res.status(500).json({ error: "Failed to create user." });
  }
});

// PUT /api/users/:id - Target lookup and update are department-scoped.
router.put("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const filter = scopedResourceFilter(req, res, { _id: req.params.id });
    if (!filter) return;
    const target = await User.findOne(filter);
    if (!target) return res.status(404).json({ error: "User not found." });

    const { name, email, role, password } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (role) {
      const roleLower = role.toLowerCase();
      if (!["student", "faculty", "admin"].includes(roleLower))
        return res.status(400).json({ error: "Invalid role." });
      updates.role = roleLower;
    }
    if (password) updates.passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
    if (isSuperAdmin(req.user) && req.body.departmentId)
      updates.departmentId = String(req.body.departmentId).trim().toUpperCase();
    if (
      !isSuperAdmin(req.user) &&
      updates.departmentId &&
      !assertSameDepartment(req.user, updates.departmentId)
    ) {
      return res.status(403).json({ error: "Cannot move a user outside your department." });
    }

    const updatedUser = await User.findOneAndUpdate(filter, updates, { new: true }).select(
      "-passwordHash",
    );
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

// DELETE /api/users/:id - Delete only a user in the caller's department.
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const base = /^[0-9a-fA-F]{24}$/.test(req.params.id)
      ? { _id: req.params.id }
      : { email: req.params.id.trim().toLowerCase() };
    const filter = scopedResourceFilter(req, res, base);
    if (!filter) return;
    const deleted = await User.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ error: "User not found." });
    await AuditLog.create({
      actorId: req.user.id || req.user._id,
      action: "DELETE_USER",
      details: {
        deletedUserId: deleted._id,
        email: deleted.email,
        departmentId: deleted.departmentId,
      },
    });
    return res.json({ message: "User deleted successfully.", id: req.params.id });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete user." });
  }
});

export default router;
