import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Report from '../models/Report.js';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dipto_fashion_secret_key_2026';

// Global memory array fallback
global.memoryReports = global.memoryReports || [];

const isMongoConnected = () => {
  try {
    return mongoose.connection.readyState === 1;
  } catch (e) {
    return false;
  }
};

// 1. Submit a New Support Report / Issue Ticket
router.post(['/', '/create', '/reports'], async (req, res) => {
  try {
    let userId = null;
    let tokenEmail = null;
    let tokenName = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
        tokenEmail = decoded.email;
        tokenName = decoded.name;
      } catch (tokenErr) {}
    }

    const { subject, category, message, userEmail: bodyEmail, userName: bodyName } = req.body;
    if (!subject || !category || !message) {
      return res.status(400).json({ success: false, message: 'Subject, category, and detailed message are required' });
    }

    let userObj = null;
    if (userId && isMongoConnected()) {
      userObj = await User.findById(userId).catch(() => null);
    }

    const userEmail = (bodyEmail || userObj?.email || tokenEmail || '').trim();
    const userName = (bodyName || userObj?.name || tokenName || 'Customer').trim();

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email is required to submit a report' });
    }

    if (isMongoConnected()) {
      const report = await Report.create({
        userId,
        userEmail,
        userName,
        subject,
        category,
        message,
        status: 'Pending'
      });
      return res.status(201).json({ success: true, report });
    } else {
      const newReport = {
        _id: 'rep_' + Date.now(),
        userId,
        userEmail,
        userName,
        subject,
        category,
        message,
        status: 'Pending',
        adminReply: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      global.memoryReports.unshift(newReport);
      return res.status(201).json({ success: true, report: newReport });
    }
  } catch (err) {
    console.error('Create Report Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to submit report' });
  }
});

// 2. Fetch User's Submitted Reports (User Profile View)
router.get(['/my-reports', '/user', '/user/:email', '/my-reports/:email'], async (req, res) => {
  try {
    let userId = null;
    let tokenEmail = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
        tokenEmail = decoded.email;
      } catch (tokenErr) {}
    }

    const emailParam = req.params.email || req.query.email || req.query.userEmail || tokenEmail;
    const cleanEmail = emailParam ? emailParam.trim() : '';

    const orConditions = [];
    if (userId) {
      orConditions.push({ userId });
      orConditions.push({ userId: String(userId) });
    }
    if (cleanEmail) {
      const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      orConditions.push({ userEmail: emailRegex });
    }

    let filter = {};
    if (orConditions.length > 0) filter = { $or: orConditions };

    if (isMongoConnected()) {
      const reports = await Report.find(filter).sort({ createdAt: -1 });
      return res.json(reports);
    } else {
      const userReports = (global.memoryReports || []).filter(r => {
        if (userId && String(r.userId) === String(userId)) return true;
        if (cleanEmail && r.userEmail.toLowerCase() === cleanEmail.toLowerCase()) return true;
        return false;
      });
      return res.json(userReports);
    }
  } catch (err) {
    console.error('Fetch User Reports Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch reports' });
  }
});

// 3. Admin: Fetch All Reports
router.get(['/admin/all', '/admin/reports', '/all', '/admin', '/'], async (req, res) => {
  try {
    if (isMongoConnected()) {
      const reports = await Report.find().sort({ createdAt: -1 });
      return res.json(reports);
    } else {
      return res.json(global.memoryReports || []);
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch all reports' });
  }
});

// 4. Admin: Reply to Report & Update Status
router.put(['/reply/:id', '/admin/reply/:id', '/:id/reply', '/admin/:id/reply'], async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, status = 'Resolved' } = req.body;
    if (!adminReply) {
      return res.status(400).json({ success: false, message: 'Admin reply message is required' });
    }

    if (isMongoConnected()) {
      const report = await Report.findById(id);
      if (!report) return res.status(404).json({ success: false, message: 'Report ticket not found' });

      report.adminReply = adminReply;
      report.status = status;
      report.repliedAt = new Date();
      await report.save();

      return res.json({ success: true, report });
    } else {
      const report = (global.memoryReports || []).find(r => String(r._id) === String(id));
      if (!report) return res.status(404).json({ success: false, message: 'Report ticket not found' });

      report.adminReply = adminReply;
      report.status = status;
      report.repliedAt = new Date().toISOString();
      report.updatedAt = new Date().toISOString();

      return res.json({ success: true, report });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to send reply' });
  }
});

// 5. Admin: Delete Report Ticket
router.delete(['/:id', '/admin/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await Report.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Report deleted successfully' });
    } else {
      const idx = (global.memoryReports || []).findIndex(r => String(r._id) === String(id));
      if (idx !== -1) global.memoryReports.splice(idx, 1);
      return res.json({ success: true, message: 'Report deleted successfully' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete report' });
  }
});

export default router;
