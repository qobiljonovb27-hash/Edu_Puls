const LessonSchedule = require('../models/LessonSchedule');

// @desc    Get weekly schedule for a class
// @route   GET /api/schedules/class/:className
// @access  Private (Admin/Teacher)
const getClassSchedule = async (req, res) => {
  try {
    const schedule = await LessonSchedule.find({
      schoolId: req.user.schoolId,
      className: req.params.className
    }).populate('teacherId', 'fullName');
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update or Create a schedule slot
// @route   POST /api/schedules
// @access  Private (Admin only)
const updateScheduleSlot = async (req, res) => {
  const { className, dayOfWeek, lessonNumber, subject, teacherId } = req.body;

  try {
    // Agar bu katakda dars bo'lsa yangilaymiz, bo'lmasa yangi yaratamiz
    let slot = await LessonSchedule.findOne({
      schoolId: req.user.schoolId,
      className,
      dayOfWeek,
      lessonNumber
    });

    if (slot) {
      slot.subject = subject;
      slot.teacherId = teacherId;
      await slot.save();
    } else {
      slot = await LessonSchedule.create({
        schoolId: req.user.schoolId,
        className,
        dayOfWeek,
        lessonNumber,
        subject,
        teacherId
      });
    }

    const populatedSlot = await slot.populate('teacherId', 'fullName');
    res.status(201).json(populatedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a schedule slot
// @route   DELETE /api/schedules/:id
// @access  Private (Admin only)
const deleteScheduleSlot = async (req, res) => {
  try {
    const slot = await LessonSchedule.findById(req.params.id);
    if (slot) {
      await slot.deleteOne();
      res.json({ message: 'Dars jadvaldan olib tashlandi' });
    } else {
      res.status(404).json({ message: 'Dars topilmadi' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClassSchedule,
  updateScheduleSlot,
  deleteScheduleSlot
};
