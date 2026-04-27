const express = require('express');
const router = express.Router();
const { 
    getClassSchedule, 
    updateScheduleSlot, 
    deleteScheduleSlot 
} = require('../controllers/scheduleController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.route('/')
  .post(protect, authorize('admin'), updateScheduleSlot);

router.route('/class/:className')
  .get(protect, getClassSchedule);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteScheduleSlot);

module.exports = router;
