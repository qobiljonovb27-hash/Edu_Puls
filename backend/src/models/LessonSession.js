const mongoose = require('mongoose');

const lessonSessionSchema = mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    lessonNumber: {
      type: Number,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'finished'],
      default: 'active',
    },
    videoUrl: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LessonSession', lessonSessionSchema);
