import Notification from '../models/Notification.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = { recipient: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.json({ success: true, data: notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true, message: 'All notifications marked as read' });
});
