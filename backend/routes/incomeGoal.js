const express = require('express');
const router = express.Router();
const { setIncomeGoal, getIncomeGoal } = require('../controllers/incomeGoalController');
const protect = require('../middleware/auth');

// Apply protect middleware to all routes
router.post('/', protect, setIncomeGoal);
router.get('/', protect, getIncomeGoal);

module.exports = router; 