const PomodoroSession = require('../models/PomodoroSession');
const User = require('../models/User');

exports.getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sessions = await PomodoroSession.find({
      user: req.userId,
      type: 'work',
      startTime: { $gte: today, $lt: tomorrow }
    });
    
    const totalFocusTime = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    
    res.json({
      totalFocusTime,
      sessionsCount: sessions.length,
      date: today
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWeekStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const sessions = await PomodoroSession.find({
      user: req.userId,
      type: 'work',
      startTime: { $gte: startOfWeek, $lt: endOfWeek }
    });
    
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= day && sessionDate < nextDay;
      });
      
      weeklyData.push({
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        date: day,
        minutes: daySessions.reduce((sum, s) => sum + s.durationMinutes, 0),
        sessions: daySessions.length
      });
    }
    
    res.json(weeklyData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getStreakInfo = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      currentStreak: user.currentStreak || 0,
      bestStreak: user.bestStreak || 0,
      lastActiveDate: user.lastActiveDate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};