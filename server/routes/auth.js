const express = require('express');
const router = express.Router();
const { login, studentLogin, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);                      // Admin / Teacher: email + password
router.post('/student-login', studentLogin);       // Student: DS number only
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
