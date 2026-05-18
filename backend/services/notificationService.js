import Notification from '../models/Notification.js';
import { emitToUser, emitToAdmin } from '../config/socket.js';

export const createNotification = async ({
  recipient,
  title,
  message,
  type = 'info',
  link,
  metadata,
  broadcastAdmin = false,
}) => {
  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    link,
    metadata,
  });

  emitToUser(recipient.toString(), 'notification', notification);

  if (broadcastAdmin) {
    emitToAdmin('notification', notification);
  }

  return notification;
};

export const notifyMany = async (recipients, payload) => {
  const notifications = await Promise.all(
    recipients.map((recipient) =>
      createNotification({ recipient, ...payload })
    )
  );
  return notifications;
};
