import express from "express";
import { authenticate } from "../middleware/auth.js";
import { Notification } from "../models/index.js";

const router = express.Router();

/**
 * Internal helper function to create a notification for a user.
 * Can be imported and invoked by other route handlers (e.g. quiz published, document approved).
 */
export async function createNotification({ userId, type = "info", title = "", message }) {
  try {
    if (!userId || !message) return null;
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      read: false,
    });
    return notification;
  } catch (error) {
    console.error("[Notification Helper Error]:", error);
    return null;
  }
}

router.use(authenticate);

// ── GET /api/notifications ──────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    const list = notifications.map((n) => ({
      ...n.toObject(),
      id: String(n._id),
      timestamp: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    }));

    res.json(list);
  } catch (error) {
    console.error("[Notifications API] GET error:", error);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

// ── PATCH /api/notifications/:id/read ──────────────────────────────────────
router.patch("/:id/read", async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notificationId = req.params.id;

    if (notificationId === "read-all") {
      await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
      return res.json({ message: "All notifications marked as read." });
    }

    const n = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!n) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.json({
      ...n.toObject(),
      id: String(n._id),
    });
  } catch (error) {
    console.error("[Notifications API] PATCH /read error:", error);
    res.status(500).json({ error: "Failed to update notification." });
  }
});

export default router;
