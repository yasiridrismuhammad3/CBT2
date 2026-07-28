const express = require('express');
const router = express.Router();
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions
} = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'teacher'), getQuestions);
router.post('/', authorize('admin', 'teacher'), createQuestion);
router.post('/bulk-import', authorize('admin', 'teacher'), bulkImportQuestions);
router.put('/:id', authorize('admin', 'teacher'), updateQuestion);
router.delete('/:id', authorize('admin', 'teacher'), deleteQuestion);

module.exports = router;
