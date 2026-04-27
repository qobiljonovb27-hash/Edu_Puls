const mongoose = require('mongoose');

const lessonScheduleSchema = mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      required: true,
    },
    lessonNumber: {
      type: Number,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LessonSchedule', lessonScheduleSchema);
