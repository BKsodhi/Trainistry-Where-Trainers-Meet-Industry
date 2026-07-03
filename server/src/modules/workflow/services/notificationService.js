import Notification from '../models/Notification.js';

export const dispatchNotification = async ({ userId, title, message, type = 'STATUS_UPDATE', actionLink = null }) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      actionLink
    });

    // Mock Email Dispatch
    console.log(`\n=== EMAIL SENT ===`);
    console.log(`To User ID: ${userId}`);
    console.log(`Subject: ${title}`);
    console.log(`Body: ${message}`);
    console.log(`Link: ${actionLink}`);
    console.log(`==================\n`);

    return notification;
  } catch (error) {
    console.error('Failed to dispatch notification:', error);
  }
};
