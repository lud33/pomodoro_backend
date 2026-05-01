const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const statisticsController = require('../controllers/statisticsController');

router.get('/today', auth, statisticsController.getTodayStats);
router.get('/week', auth, statisticsController.getWeekStats);
router.get('/streak', auth, statisticsController.getStreakInfo);

module.exports = router;