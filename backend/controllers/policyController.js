import PlacementPolicy from '../models/PlacementPolicy.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logAudit } from '../services/auditService.js';

export const getPlacementPolicy = asyncHandler(async (req, res) => {
  const policy = await PlacementPolicy.findOneAndUpdate(
    { name: 'Default Placement Policy' },
    { $setOnInsert: { name: 'Default Placement Policy' } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: policy });
});

export const updatePlacementPolicy = asyncHandler(async (req, res) => {
  const oldPolicy = await PlacementPolicy.findOne({ name: 'Default Placement Policy' }).lean();
  const policy = await PlacementPolicy.findOneAndUpdate(
    { name: 'Default Placement Policy' },
    { ...req.body, name: 'Default Placement Policy', updatedBy: req.user._id },
    { new: true, upsert: true, runValidators: true }
  );

  await logAudit({
    actor: req.user,
    actionType: 'PLACEMENT_POLICY_UPDATED',
    targetEntity: 'PlacementPolicy',
    targetId: policy._id,
    oldValues: oldPolicy,
    newValues: policy.toObject(),
    ipAddress: req.ip,
  });

  res.json({ success: true, data: policy });
});
