const School = require('../models/School');
const User = require('../models/User');

// @desc    Get all schools
// @route   GET /api/schools
// @access  Private (SuperAdmin only)
const getSchools = async (req, res) => {
  const schools = await School.find({});
  res.json(schools);
};

// @desc    Create a school and its admin account
// @route   POST /api/schools
// @access  Private (SuperAdmin only)
const createSchool = async (req, res) => {
  const { name, director, login, password } = req.body;

  const school = await School.create({
    name,
    director,
  });

  if (school) {
    // Create the admin user for this school
    await User.create({
      fullName: director,
      username: login,
      password: password,
      role: 'admin',
      schoolId: school._id,
      status: 'active'
    });

    res.status(201).json(school);
  } else {
    res.status(400).json({ message: 'Maktab ma\'lumotlari xato' });
  }
};

// @desc    Delete a school
// @route   DELETE /api/schools/:id
// @access  Private (SuperAdmin only)
const deleteSchool = async (req, res) => {
  const school = await School.findById(req.params.id);

  if (school) {
    await school.deleteOne();
    res.json({ message: 'School removed' });
  } else {
    res.status(404).json({ message: 'School not found' });
  }
};

// @desc    Get current school QR secret
// @route   GET /api/schools/my/qr
// @access  Private (Admin only)
const getSchoolQR = async (req, res) => {
  const school = await School.findById(req.user.schoolId);
  if (!school) {
    return res.status(404).json({ message: 'Maktab topilmadi' });
  }
  res.json({ qrSecret: school.qrSecret });
};

// @desc    Get school dashboard stats
// @route   GET /api/schools/stats
// @access  Private (Admin only)
const getSchoolStats = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    // 1. Jami o'qituvchilar
    const totalTeachers = await User.countDocuments({ role: 'teacher', schoolId });

    // 2. Bugun dars boshlaganlar (Davomat)
    const presentToday = await User.countDocuments({ 
      role: 'teacher', 
      schoolId,
      status: { $in: ['Maktabda', 'Darsda', 'Kechikkan'] }
    });

    // 3. Hozirgi faol darslar
    const LessonSession = require('../models/LessonSession');
    const activeLessonsCount = await LessonSession.countDocuments({ 
      status: 'active',
      schoolId
    });

    res.json({
      totalTeachers,
      presentToday,
      activeLessons: activeLessonsCount,
      attendanceRate: totalTeachers > 0 ? Math.round((presentToday / totalTeachers) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current school bell schedule
// @route   GET /api/schools/my/schedule
// @access  Private (Admin only)
const getBellSchedule = async (req, res) => {
  const school = await School.findById(req.user.schoolId);
  if (!school) {
    return res.status(404).json({ message: 'Maktab topilmadi' });
  }
  res.json({
    schedule: school.bellSchedule,
    checkInDeadline: school.checkInDeadline
  });
};

// @desc    Update school bell schedule
// @route   PUT /api/schools/my/schedule
// @access  Private (Admin only)
const updateBellSchedule = async (req, res) => {
  const { schedule, checkInDeadline } = req.body;
  const school = await School.findById(req.user.schoolId);

  if (!school) {
    return res.status(404).json({ message: 'Maktab topilmadi' });
  }

  if (schedule) school.bellSchedule = schedule;
  if (checkInDeadline) school.checkInDeadline = checkInDeadline;
  
  await school.save();

  res.json({
    schedule: school.bellSchedule,
    checkInDeadline: school.checkInDeadline
  });
};

// @desc    Get school classes
// @route   GET /api/schools/my/classes
// @access  Private (Admin only)
const getClasses = async (req, res) => {
  const school = await School.findById(req.user.schoolId);
  res.json(school.classes || []);
};

// @desc    Add a new class to school
// @route   POST /api/schools/my/classes
// @access  Private (Admin only)
const addClass = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Sinf nomi talab qilinadi' });
    }

    const school = await School.findById(req.user.schoolId);

    if (!school) {
      return res.status(404).json({ message: 'Maktab topilmadi' });
    }

    // Sinf allaqachon bormi tekshirish
    if (school.classes && school.classes.find(c => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ message: 'Ushbu sinf allaqachon qo\'shilgan' });
    }

    // Yangi sinfni qo'shish
    school.classes.push({ name });
    await school.save();

    res.status(201).json(school.classes);
  } catch (error) {
    console.error('Add class error:', error);
    res.status(500).json({ message: 'Serverda xatolik yuz berdi' });
  }
};

// @desc    Clear all school analytics (Lessons & Attendance)
// @route   POST /api/schools/my/reset
// @access  Private (Admin only)
const resetSchoolData = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const LessonSession = require('../models/LessonSession');
    const Attendance = require('../models/Attendance');
    await LessonSession.deleteMany({ schoolId });
    const teachers = await User.find({ schoolId, role: 'teacher' }).select('_id');
    const teacherIds = teachers.map(t => t._id);
    await Attendance.deleteMany({ teacherId: { $in: teacherIds } });
    await User.updateMany({ schoolId, role: 'teacher' }, { status: 'active' });
    res.json({ message: 'Maktab statistikasi muvaffaqiyatli tozalandi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get real school analytics for charts
// @route   GET /api/schools/my/analytics
// @access  Private (Admin only)
const getSchoolAnalytics = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const LessonSession = require('../models/LessonSession');
    const User = require('../models/User');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lessons = await LessonSession.find({ schoolId, startTime: { $gte: sevenDaysAgo } });
    const days = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];
    const weeklyStats = [];
    for(let i = 5; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dayLessons = lessons.filter(l => new Date(l.startTime).toDateString() === d.toDateString());
      weeklyStats.push({ name: days[d.getDay()], 'O\'z vaqtida': dayLessons.filter(l => !l.isLate).length, 'Kechikkan': dayLessons.filter(l => l.isLate).length });
    }
    const teachers = await User.find({ schoolId, role: 'teacher' }).limit(5);
    const kpiData = teachers.map(t => {
      const teacherLessons = lessons.filter(l => l.teacherId && l.teacherId.toString() === t._id.toString());
      const onTime = teacherLessons.filter(l => !l.isLate).length;
      const score = teacherLessons.length > 0 ? Math.round((onTime / teacherLessons.length) * 100) : 0;
      return { name: t.fullName.split(' ')[0], kpi: score };
    });
    res.json({ weeklyStats, kpiData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSchools,
  createSchool,
  deleteSchool,
  getSchoolQR,
  getSchoolStats,
  getBellSchedule,
  updateBellSchedule,
  getClasses,
  addClass,
  resetSchoolData,
  getSchoolAnalytics
};
