const express = require('express');
const router = express.Router();
const {
  getSchools,
  createSchool,
  deleteSchool,
  getSchoolQR,
  getSchoolStats,
  getBellSchedule,
  updateBellSchedule,
  getClasses,
  addClass,
  resetSchoolData
} = require('../controllers/schoolController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.get('/my/qr', protect, authorize('admin', 'teacher'), getSchoolQR);
router.get('/stats', protect, authorize('admin'), getSchoolStats);
router.get('/my/analytics', protect, authorize('admin'), getSchoolAnalytics);
router.post('/my/reset', protect, authorize('admin'), resetSchoolData);
router.route('/my/schedule')
  .get(protect, authorize('admin'), getBellSchedule)
  .put(protect, authorize('admin'), updateBellSchedule);
router.route('/my/classes')
  .get(protect, authorize('admin', 'teacher'), getClasses)
  .post(protect, authorize('admin'), addClass);

router
  .route('/')
  .get(protect, authorize('superadmin'), getSchools)
  .post(protect, authorize('superadmin'), createSchool);

router
  .route('/:id')
  .delete(protect, authorize('superadmin'), deleteSchool);

module.exports = router;
