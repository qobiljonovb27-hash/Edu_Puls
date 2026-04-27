const mongoose = require('mongoose');

const schoolSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a school name'],
      unique: true,
    },
    director: {
      type: String,
      required: [true, 'Please add a director name'],
    },
    qrSecret: {
      type: String,
      default: function() { return 'QR_' + Math.random().toString(36).substr(2, 9).toUpperCase(); }
    },
    teachersCount: {
      type: Number,
      default: 0,
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
    bellSchedule: {
      type: [{
        lessonNumber: Number,
        startTime: String,
        endTime: String
      }],
      default: [
        { lessonNumber: 1, startTime: '08:00', endTime: '08:45' },
        { lessonNumber: 2, startTime: '08:55', endTime: '09:40' },
        { lessonNumber: 3, startTime: '09:50', endTime: '10:35' },
        { lessonNumber: 4, startTime: '10:55', endTime: '11:40' },
        { lessonNumber: 5, startTime: '11:50', endTime: '12:35' },
        { lessonNumber: 6, startTime: '12:45', endTime: '13:30' },
        { lessonNumber: 7, startTime: '13:40', endTime: '14:25' },
      ]
    },
    checkInDeadline: {
      type: String,
      default: '07:45'
    },
    classes: [
      {
        name: { type: String, required: true },
      }
    ],
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Inactive'],
      default: 'Active',
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('School', schoolSchema);
