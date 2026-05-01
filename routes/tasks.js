const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

router.get('/', auth, taskController.getTasks);
router.post('/', auth, taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);
router.patch('/:id/toggle', auth, taskController.toggleTask);
router.patch('/:id/increment', auth, taskController.incrementPomodoro);

module.exports = router;