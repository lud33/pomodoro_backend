const PomodoroSession = require('../models/PomodoroSession');
const User = require('../models/User');
const Task = require('../models/Task');

// Create a new pomodoro session
exports.createSession = async (req, res) => {
  try {
    const { startTime, endTime, durationMinutes, type, taskId } = req.body;
    
    const session = await PomodoroSession.create({
      user: req.userId,
      task: taskId || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      durationMinutes: durationMinutes,
      type: type,
      completed: true
    });
    
    // If it's a work session, update streak
    if (type === 'work') {
      await updateUserStreak(req.userId);
    }
    
    // If task is linked, increment pomodoro count
    if (taskId) {
      await Task.findByIdAndUpdate(taskId, {
        $inc: { pomodoroSessions: 1 }
      });
    }
    
    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all sessions for a user
exports.getUserSessions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user: req.userId };
    
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const sessions = await PomodoroSession.find(query)
      .sort({ startTime: -1 })
      .populate('task', 'title');
    
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get today's sessions
exports.getTodaySessions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sessions = await PomodoroSession.find({
      user: req.userId,
      startTime: { $gte: today, $lt: tomorrow },
      type: 'work'
    });
    
    const totalFocusTime = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    
    res.json({
      sessions: sessions,
      totalFocusTime: totalFocusTime,
      sessionsCount: sessions.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to update user streak
async function updateUserStreak(userId) {
  const user = await User.findById(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  
  if (!lastActive) {
    // First session ever
    user.currentStreak = 1;
    user.bestStreak = 1;
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    if (lastActive >= yesterday && lastActive < today) {
      // Consecutive day
      user.currentStreak += 1;
      if (user.currentStreak > user.bestStreak) {
        user.bestStreak = user.currentStreak;
      }
    } else if (lastActive < yesterday) {
      // Streak broken
      user.currentStreak = 1;
    }
    // If lastActive is today, don't change streak
  }
  
  user.lastActiveDate = today;
  await user.save();
}