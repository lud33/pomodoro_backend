const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sessionController = require('../controllers/sessionController');

router.post('/', auth, sessionController.createSession);
router.get('/', auth, sessionController.getUserSessions);

module.exports = router;