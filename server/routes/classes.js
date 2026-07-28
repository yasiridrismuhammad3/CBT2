const express = require('express');
const router = express.Router();
const { getClasses, createClass, deleteClass } = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getClasses);
router.post('/', authorize('admin'), createClass);
router.delete('/:id', authorize('admin'), deleteClass);

module.exports = router;
