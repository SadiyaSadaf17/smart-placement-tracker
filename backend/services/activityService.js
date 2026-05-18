import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async ({ user, action, entity, entityId, details, ip }) => {
  try {
    await ActivityLog.create({ user, action, entity, entityId, details, ip });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};
