const express = require('express');
const router = express.Router();
const {
  getTeachers,
  createTeacher,
  deleteTeacher,
} = require('../controllers/teacherController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router
  .route('/')
  .get(protect, authorize('admin'), getTeachers)
  .post(protect, authorize('admin'), createTeacher);

router
  .route('/:id')
  .delete(protect, authorize('admin'), deleteTeacher);

module.exports = router;
