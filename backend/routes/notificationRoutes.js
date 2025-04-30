const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Test endpoint to verify notification system
router.post('/test', async (req, res) => {
  try {
    // Get user's email
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send test email
    const emailSent = await notificationService.sendEmailNotification(
      user.email,
      'Test Notification - MoneyWise',
      `
        <h2>Test Notification</h2>
        <p>This is a test notification from MoneyWise Finance Tracker.</p>
        <p>If you're receiving this email, the notification system is working correctly!</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `
    );

    // Send test push notification (will just log to console)
    const pushSent = await notificationService.sendPushNotification(
      req.user.id,
      'Test Push Notification',
      'This is a test push notification from MoneyWise'
    );

    res.json({
      success: true,
      message: 'Test notifications sent successfully',
      emailSent,
      pushSent,
      userEmail: user.email
    });
  } catch (error) {
    console.error('Error sending test notifications:', error);
    res.status(500).json({ 
      error: 'Failed to send test notifications',
      details: error.message 
    });
  }
});

// Get notification preferences
router.get('/preferences', async (req, res) => {
  try {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: req.user.id }
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      const defaultPreferences = await prisma.notificationPreferences.create({
        data: {
          userId: req.user.id,
          emailNotifications: true,
          pushNotifications: true,
          daysBeforeDue: 3
        }
      });
      return res.json(defaultPreferences);
    }

    res.json(preferences);
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

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: req.user.id },
      update: {
        emailNotifications,
        pushNotifications,
        daysBeforeDue
      },
      create: {
        userId: req.user.id,
        emailNotifications,
        pushNotifications,
        daysBeforeDue
      }
    });

    res.json(preferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

module.exports = router; 