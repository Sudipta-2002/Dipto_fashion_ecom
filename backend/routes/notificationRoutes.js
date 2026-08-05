import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

const router = express.Router();

let memoryNotifications = [
  {
    _id: 'notif_default_1',
    type: 'Announcement',
    title: '🔥 Welcome to Dipto Fashion!',
    message: 'Explore our exclusive Banarasi sarees, Festive Kurta collections, and special discount offers!',
    readBy: [],
    target: 'ALL',
    createdAt: new Date().toISOString()
  }
];

const isMongoConnected = () => mongoose.connection.readyState === 1;

// GET /api/notifications - Fetch notification history (Public Unrestricted Access)
router.get('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    if (isMongoConnected()) {
      const list = await Notification.find().sort({ createdAt: -1 });
      return res.json(list);
    } else {
      return res.json(memoryNotifications);
    }
  } catch (err) {
    return res.json(memoryNotifications);
  }
});

// POST /api/notifications - Admin broadcast notification
router.post('/', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log('>>> [notificationRoutes POST /] Payload received:', req.body);
  try {
    const { title, message, type = 'Announcement', target = 'ALL' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Notification title and message details are required' });
    }

    let notificationObj = null;

    if (isMongoConnected()) {
      try {
        notificationObj = await Notification.create({
          title: title.trim(),
          message: message.trim(),
          type,
          target,
          readBy: []
        });
        console.log('>>> Mongoose notification successfully saved to MongoDB:', notificationObj._id);
        return res.status(201).json({ success: true, message: 'Saved to MongoDB', notification: notificationObj, data: notificationObj });
      } catch (dbErr) {
        console.error('>>> Mongoose Notification create error:', dbErr);
        return res.status(500).json({ success: false, error: dbErr.message, message: dbErr.message });
      }
    } else {
      notificationObj = {
        _id: 'notif_' + Date.now(),
        title: title.trim(),
        message: message.trim(),
        type,
        target,
        readBy: [],
        createdAt: new Date().toISOString()
      };
      memoryNotifications.unshift(notificationObj);
      return res.status(201).json({ success: true, message: 'Saved to memory (DB offline)', notification: notificationObj, data: notificationObj });
    }
  } catch (err) {
    console.error('>>> Notification route error:', err);
    return res.status(500).json({ success: false, error: err.message, message: err.message || 'Failed to broadcast notification' });
  }
});

// POST /api/notifications/:id/read - Mark notification as read by User ID
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    if (isMongoConnected()) {
      const updated = await Notification.findByIdAndUpdate(
        id,
        { $addToSet: { readBy: userId } },
        { new: true }
      );
      return res.json({ success: true, notification: updated });
    } else {
      const item = memoryNotifications.find((n) => n._id === id);
      if (item) {
        if (!item.readBy.includes(userId)) {
          item.readBy.push(userId);
        }
        return res.json({ success: true, notification: item });
      }
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/notifications/:id - Admin delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await Notification.findByIdAndDelete(id);
    } else {
      memoryNotifications = memoryNotifications.filter((n) => n._id !== id);
    }
    return res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
