const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('admin', 'teacher'), createAnnouncement);
router.delete('/:id', authorize('admin'), deleteAnnouncement);

module.exports = router;
