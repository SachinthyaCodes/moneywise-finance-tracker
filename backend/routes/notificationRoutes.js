const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get notification preferences
router.get('/preferences', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.notificationPreferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// Update notification preferences
router.put('/preferences', async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, daysBeforeDue } = req.body;

    // Validate daysBeforeDue
    if (daysBeforeDue < 1 || daysBeforeDue > 30) {
      return res.status(400).json({ error: 'Days before due must be between 1 and 30' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        notificationPreferences: {
          emailNotifications,
          pushNotifications,
          daysBeforeDue
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.notificationPreferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Test notification
router.post('/test', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const testNotification = {
      title: 'Test Notification',
      body: 'This is a test notification to verify your notification settings.'
    };

    // Send test email if enabled
    if (user.notificationPreferences.emailNotifications) {
      await notificationService.sendEmailNotification(
        user.email,
        testNotification.title,
        testNotification.body
      );
    }

    // Send test push notification if enabled
    if (user.notificationPreferences.pushNotifications) {
      await notificationService.sendPushNotification(
        user._id,
        testNotification.title,
        testNotification.body
      );
    }

    res.json({
      message: 'Test notifications sent successfully',
      emailSent: user.notificationPreferences.emailNotifications,
      pushSent: user.notificationPreferences.pushNotifications
    });
  } catch (error) {
    console.error('Error sending test notifications:', error);
    res.status(500).json({ error: 'Failed to send test notifications' });
  }
});

module.exports = router; 