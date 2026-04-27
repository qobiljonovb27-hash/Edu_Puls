const express = require('express');
const router = express.Router();
const { qrCheckin, getTeacherAttendance, getSchoolAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/qr-checkin', protect, qrCheckin);
router.get('/school', protect, getSchoolAttendance);
router.get('/teacher/:id', protect, getTeacherAttendance);

module.exports = router;
