const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  bulkImportStudents
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin', 'teacher'), getUsers);
router.post('/', authorize('admin'), createUser);
router.post('/bulk-import', authorize('admin'), bulkImportStudents);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.put('/:id/reset-password', authorize('admin'), resetUserPassword);

module.exports = router;
