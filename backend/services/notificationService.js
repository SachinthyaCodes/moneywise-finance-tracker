const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports like 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
      }
    });
  }

  async sendEmailNotification(userEmail, subject, content) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: userEmail,
        subject: subject,
        html: content,
      });
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  async sendPushNotification(userId, title, body) {
    // TODO: Implement push notification logic
    // This could be implemented using Firebase Cloud Messaging or a similar service
    console.log(`Push notification would be sent to user ${userId}: ${title} - ${body}`);
    return true;
  }

  async checkAndSendBillNotifications() {
    try {
      // Get all users with notification preferences
      const users = await prisma.user.findMany({
        include: {
          notificationPreferences: true,
          recurringBills: true,
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const user of users) {
        if (!user.notificationPreferences) continue;

        const { daysBeforeDue, emailNotifications, pushNotifications } = user.notificationPreferences;

        for (const bill of user.recurringBills) {
          const dueDate = new Date(bill.dueDate);
          dueDate.setHours(0, 0, 0, 0);

          // Calculate days until due
          const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

          // Check if we should send a notification
          if (daysUntilDue === daysBeforeDue) {
            const notificationContent = {
              title: `Bill Due Soon: ${bill.name}`,
              body: `Your bill "${bill.name}" for $${bill.amount} is due in ${daysBeforeDue} days on ${dueDate.toLocaleDateString()}.`,
            };

            if (emailNotifications) {
              await this.sendEmailNotification(
                user.email,
                notificationContent.title,
                notificationContent.body
              );
            }

            if (pushNotifications) {
              await this.sendPushNotification(
                user.id,
                notificationContent.title,
                notificationContent.body
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking and sending bill notifications:', error);
    }
  }
}

module.exports = new NotificationService(); 