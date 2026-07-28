const express = require('express');
const router = express.Router();
const {
  getExams,
  getAvailableExamsForStudent,
  getExamForTaking,
  createExam,
  updateExam,
  togglePublishExam,
  deleteExam
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/available', authorize('student'), getAvailableExamsForStudent);
router.get('/:id/take', authorize('student'), getExamForTaking);

router.get('/', authorize('admin', 'teacher'), getExams);
router.post('/', authorize('admin', 'teacher'), createExam);
router.put('/:id', authorize('admin', 'teacher'), updateExam);
router.patch('/:id/toggle-publish', authorize('admin', 'teacher'), togglePublishExam);
router.delete('/:id', authorize('admin', 'teacher'), deleteExam);

module.exports = router;
