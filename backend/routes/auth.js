const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const authMiddleware = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router; 