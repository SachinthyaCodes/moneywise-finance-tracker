const cron = require('node-cron');
const notificationService = require('../services/notificationService');

/**
 * Starts the cron job to check and send notifications for upcoming bills
 * Runs daily at midnight (00:00)
 */
const startNotificationCron = () => {
  console.log('Starting notification cron job...');
  
  // Schedule to run at midnight every day
  cron.schedule('0 0 * * *', async () => {
    console.log('Running notification check:', new Date().toISOString());
    try {
      await notificationService.checkAndSendBillNotifications();
      console.log('Notification check completed successfully');
    } catch (error) {
      console.error('Error running notification cron job:', error);
    }
  });
  
  // You can add more scheduled tasks here if needed
};

module.exports = {
  startNotificationCron
};
