const express = require('express');
const router = express.Router();
const {
  submitExam,
  getResultById,
  getResultsByExam,
  getStudentResultHistory
} = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/submit', authorize('student'), submitExam);
router.get('/student/history', authorize('student'), getStudentResultHistory);
router.get('/exam/:examId', authorize('admin', 'teacher'), getResultsByExam);
router.get('/:id', getResultById);

module.exports = router;
