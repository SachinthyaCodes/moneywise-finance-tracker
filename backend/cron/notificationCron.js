const cron = require('node-cron');
const notificationService = require('../services/notificationService');

// Run every day at 9:00 AM
const schedule = '0 9 * * *';

function startNotificationCron() {
  cron.schedule(schedule, async () => {
    console.log('Running bill notification check...');
    await notificationService.checkAndSendBillNotifications();
  });
  console.log('Bill notification cron job scheduled');
}

module.exports = { startNotificationCron }; 