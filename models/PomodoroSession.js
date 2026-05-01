const mongoose = require('mongoose');

const pomodoroSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['work', 'short_break', 'long_break'],
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('PomodoroSession', pomodoroSessionSchema);