const User = require('../models/User');

// @desc    Get all teachers for a specific school
// @route   GET /api/teachers
// @access  Private (Admin only)
const getTeachers = async (req, res) => {
  const teachers = await User.find({ 
    role: 'teacher', 
    schoolId: req.user.schoolId 
  });
  res.json(teachers);
};

// @desc    Create a teacher
// @route   POST /api/teachers
// @access  Private (Admin only)
const createTeacher = async (req, res) => {
  const { fullName, username, password, subject } = req.body;

  const teacherExists = await User.findOne({ username });

  if (teacherExists) {
    res.status(400).json({ message: 'Ushbu login band, iltimos boshqa login tanlang' });
    return;
  }

  const teacher = await User.create({
    fullName,
    username,
    password,
    subject,
    role: 'teacher',
    schoolId: req.user.schoolId,
    status: 'active'
  });

  if (teacher) {
    res.status(201).json(teacher);
  } else {
    res.status(400).json({ message: 'Ma\'lumotlar xato' });
  }
};

// @desc    Delete a teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin only)
const deleteTeacher = async (req, res) => {
  const teacher = await User.findById(req.params.id);

  if (teacher && teacher.role === 'teacher') {
    await teacher.deleteOne();
    res.json({ message: 'Teacher removed' });
  } else {
    res.status(404).json({ message: 'Teacher not found' });
  }
};

module.exports = {
  getTeachers,
  createTeacher,
  deleteTeacher,
};
