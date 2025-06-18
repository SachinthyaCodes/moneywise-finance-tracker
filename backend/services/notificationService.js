const nodemailer = require('nodemailer');
const User = require('../models/User');
const RecurringBill = require('../models/RecurringBill');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send email notification
const sendEmailNotification = async (email, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email notification sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

// Send push notification
const sendPushNotification = async (userId, title, body) => {
  try {
    // TODO: Implement actual push notification service (e.g., Firebase Cloud Messaging)
    console.log('Push notification would be sent:', {
      userId,
      title,
      body
    });
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

// Check for upcoming bills and send notifications
const checkUpcomingBills = async () => {
  try {
    const users = await User.find({
      'notificationPreferences.emailNotifications': true
    });

    for (const user of users) {
      const daysBeforeDue = user.notificationPreferences.daysBeforeDue;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysBeforeDue);

      const upcomingBills = await RecurringBill.find({
        userId: user._id,
        dueDate: {
          $gte: new Date(),
          $lte: dueDate
        },
        paymentStatus: { $ne: 'PAID' }
      });

      if (upcomingBills.length > 0) {
        const html = `
          <h2>Upcoming Bills Reminder</h2>
          <p>You have ${upcomingBills.length} bill(s) due in the next ${daysBeforeDue} days:</p>
          <ul>
            ${upcomingBills.map(bill => `
              <li>
                ${bill.name} - $${bill.amount}
                <br>
                Due: ${new Date(bill.dueDate).toLocaleDateString()}
              </li>
            `).join('')}
          </ul>
          <p>Please make sure to pay these bills on time to avoid any late fees.</p>
        `;

        await sendEmailNotification(
          user.email,
          'Upcoming Bills Reminder - MoneyWise',
          html
        );

        if (user.notificationPreferences.pushNotifications) {
          await sendPushNotification(
            user._id,
            'Upcoming Bills Reminder',
            `You have ${upcomingBills.length} bill(s) due in the next ${daysBeforeDue} days`
          );
        }
      }
    }
  } catch (error) {
    console.error('Error checking upcoming bills:', error);
    throw error;
  }
};

// Schedule bill notifications
const scheduleBillNotifications = () => {
  // Check for upcoming bills every day at 9 AM
  setInterval(checkUpcomingBills, 24 * 60 * 60 * 1000);
  
  // Initial check
  checkUpcomingBills();
};

module.exports = {
  sendEmailNotification,
  sendPushNotification,
  checkUpcomingBills,
  scheduleBillNotifications
}; 