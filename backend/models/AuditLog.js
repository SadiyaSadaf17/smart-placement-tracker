import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    actorRole: { type: String, index: true },
    actionType: { type: String, required: true, index: true },
    targetEntity: { type: String, required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, index: true },
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: { createdAt: 'timestamp', updatedAt: false } }
);

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.pre('save', function lockImmutable(next) {
  if (!this.isNew) return next(new Error('Audit logs are immutable'));
  return next();
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
