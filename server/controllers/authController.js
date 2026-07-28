const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'damale_school_katsina_secret_key_2026_cbt_secure', {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

// @desc    Student Login — DS Number ONLY (no password required)
// @route   POST /api/auth/student-login
// @access  Public
exports.studentLogin = async (req, res, next) => {
  try {
    const { dsNumber } = req.body;

    if (!dsNumber) {
      return res.status(400).json({ success: false, message: 'Please enter your DS Number' });
    }

    const user = await User.findOne({
      dsNumber: dsNumber.toUpperCase().trim(),
      role: 'student'
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'DS Number not found. Please contact your class teacher.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact the School Administrator.' });
    }

    user.lastLogin = new Date();
    await user.save();

    // Audit log
    try {
      await AuditLog.create({
        user: user._id,
        action: 'LOGIN',
        details: `STUDENT logged in via DS Number: ${user.dsNumber}`,
        ipAddress: req.ip
      });
    } catch (e) { /* non-critical */ }

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin / Teacher Login — Email + Password
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide Email and Password' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { dsNumber: identifier.toUpperCase().trim() }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact School Administrator.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    user.lastLogin = new Date();
    await user.save();

    try {
      await AuditLog.create({
        user: user._id,
        action: 'LOGIN',
        details: `${user.role.toUpperCase()} logged in (${user.email || user.dsNumber})`,
        ipAddress: req.ip
      });
    } catch (e) { /* non-critical */ }

    const token = generateToken(user._id);
    user.password = undefined;

    res.status(200).json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Logged-in User
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedSubjects');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
