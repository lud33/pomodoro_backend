const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sessionController = require('../controllers/sessionController');

// All routes require authentication
router.use(auth);

// Create a new session
router.post('/', sessionController.createSession);

// Get user sessions (with optional date filters)
router.get('/', sessionController.getUserSessions);

// Get today's sessions
router.get('/today', sessionController.getTodaySessions);

module.exports = router;