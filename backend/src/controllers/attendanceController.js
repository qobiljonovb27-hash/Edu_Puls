const Attendance = require('../models/Attendance');
const School = require('../models/School');

// @desc    QR Check-in for teacher
// @route   POST /api/attendance/qr-checkin
// @access  Private (Teacher only)
const qrCheckin = async (req, res) => {
  const { qrCode } = req.body;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Validate QR Code
  const school = await School.findById(req.user.schoolId);
  if (!school || school.qrSecret !== qrCode) {
    return res.status(400).json({ message: 'Noto\'g\'ri QR kod! Iltimos, maktabdagi rasmiy QR kodni skanerlang.' });
  }

  // Check if already checked in today
  const existingRecord = await Attendance.findOne({
    teacherId: req.user._id,
    date: dateStr
  });

  if (existingRecord) {
    return res.status(400).json({ message: 'Siz bugun allaqachon kirgansiz!' });
  }

  // Lateness check based on school's customized deadline
  const checkInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  let status = 'present';
  
  if (school.checkInDeadline && checkInTime > school.checkInDeadline) {
    status = 'late';
  }

  const User = require('../models/User');
  const attendance = await Attendance.create({
    teacherId: req.user._id,
    date: dateStr,
    checkInTime,
    checkInMethod: 'QR',
    status
  });

  // O'qituvchi statusini bazada ham yangilaymiz (Direktor ko'rishi uchun)
  await User.findByIdAndUpdate(req.user._id, { 
    status: status === 'late' ? 'Kechikkan' : 'Maktabda' 
  });

  res.status(201).json(attendance);
};

// @desc    Get teacher attendance history
// @route   GET /api/attendance/teacher/:id
// @access  Private
const getTeacherAttendance = async (req, res) => {
  const attendance = await Attendance.find({ teacherId: req.params.id }).sort('-date');
  res.json(attendance);
};

// @desc    Get all attendance logs for a school (for Director)
// @route   GET /api/attendance/school
// @access  Private (Admin only)
const getSchoolAttendance = async (req, res) => {
  try {
    const User = require('../models/User');
    // Avval o'qituvchilar ro'yxatini olamiz
    const teachers = await User.find({ schoolId: req.user.schoolId, role: 'teacher' }).select('_id');
    const teacherIds = teachers.map(t => t._id);

    const attendance = await Attendance.find({ 
      teacherId: { $in: teacherIds }
    }).populate('teacherId', 'fullName').sort('-createdAt');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  qrCheckin,
  getTeacherAttendance,
  getSchoolAttendance
};
