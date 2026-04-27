const LessonSession = require('../models/LessonSession');

// @desc    Start a new lesson
// @route   POST /api/lessons/start
// @access  Private (Teacher only)
const startLesson = async (req, res) => {
  const { subject, className } = req.body;
  const School = require('../models/School');
  
  const school = await School.findById(req.user.schoolId);
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  let isLate = false;
  let lessonNumber = 0;

  if (school && school.bellSchedule) {
    // Find matching lesson slot (very simple logic: find first slot where now < endTime)
    const currentSlot = school.bellSchedule.find(s => currentTime <= s.endTime);
    if (currentSlot) {
      lessonNumber = currentSlot.lessonNumber;
      // If started after scheduled start, it's late
      if (currentTime > currentSlot.startTime) {
        isLate = true;
      }
    }
  }

  const lesson = await LessonSession.create({
    teacherId: req.user._id,
    schoolId: req.user.schoolId,
    subject,
    className,
    lessonNumber,
    isLate,
    status: 'active'
  });

  const User = require('../models/User');
  await User.findByIdAndUpdate(req.user._id, { status: 'Darsda' });

  res.status(201).json(lesson);
};

// @desc    End an active lesson
// @route   PUT /api/lessons/:id/end
// @access  Private (Teacher only)
const endLesson = async (req, res) => {
  const lesson = await LessonSession.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({ message: 'Dars topilmadi' });
  }

  lesson.endTime = Date.now();
  lesson.status = 'finished';
  await lesson.save();

  const User = require('../models/User');
  await User.findByIdAndUpdate(req.user._id, { status: 'Maktabda' });

  res.json(lesson);
};

// @desc    Get all active lessons for a school or teacher
// @route   GET /api/lessons/active
// @access  Private
const getActiveLessons = async (req, res) => {
  let query = { status: 'active' };

  if (req.user.role === 'teacher') {
    query.teacherId = req.user._id;
  } else {
    query.schoolId = req.user.schoolId;
  }

  const lessons = await LessonSession.find(query).populate('teacherId', 'fullName');
  
  res.json(lessons);
};

// @desc    Upload proof for a lesson
// @route   POST /api/lessons/:id/proof
// @access  Private (Teacher only)
const uploadProof = async (req, res) => {
  const lesson = await LessonSession.findById(req.params.id);

  if (!lesson) {
    return res.status(404).json({ message: 'Dars topilmadi' });
  }

  // If using local storage, multer provides req.file
  if (!req.file) {
    return res.status(400).json({ message: 'Fayl yuklanmadi' });
  }

  // Store the relative path (so frontend can serve it)
  lesson.videoUrl = `/uploads/${req.file.filename}`;
  await lesson.save();

  res.json(lesson);
};

// @desc    Get lesson history for teacher
// @route   GET /api/lessons/history
// @access  Private (Teacher only)
const getLessonHistory = async (req, res) => {
  const history = await LessonSession.find({
    teacherId: req.user._id,
    status: 'finished'
  }).sort('-startTime');
  
  res.json(history);
};

// @desc    Get daily lesson grid (Class vs LessonNumber)
// @route   GET /api/lessons/daily-grid
// @access  Private (Admin only)
const getDailyGrid = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lessons = await LessonSession.find({
      schoolId: req.user.schoolId,
      startTime: { $gte: today }
    }).populate('teacherId', 'fullName');

    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startLesson,
  endLesson,
  getActiveLessons,
  getLessonHistory,
  uploadProof,
  getDailyGrid
};
