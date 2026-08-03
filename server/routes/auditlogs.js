const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all audit logs (Admin only)
// @route   GET /api/auditlogs
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 200;

    const logs = await AuditLog.find()
      .populate('user', 'fullName dsNumber email role')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
