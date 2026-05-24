import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  actor,
  actionType,
  targetEntity,
  targetId,
  oldValues,
  newValues,
  ipAddress,
  metadata,
}) => {
  try {
    await AuditLog.create({
      actorId: actor?._id,
      actorRole: actor?.role,
      actionType,
      targetEntity,
      targetId,
      oldValues,
      newValues,
      ipAddress,
      metadata,
    });
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
};
