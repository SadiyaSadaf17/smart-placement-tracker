import { ALLOWED_DRIVE_TRANSITIONS, canTransitionDrive, DRIVE_STAGES } from '../config/driveWorkflow.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Student from '../models/Student.js';
import { notifyMany } from './notificationService.js';

const statusForStage = (stage) => {
  if (stage === DRIVE_STAGES.APPLICATIONS_OPEN) return 'active';
  if ([DRIVE_STAGES.APPLICATIONS_CLOSED, DRIVE_STAGES.RESULTS_PUBLISHED, DRIVE_STAGES.COMPLETED].includes(stage)) return 'closed';
  if (stage === DRIVE_STAGES.CANCELLED) return 'cancelled';
  return 'upcoming';
};

export const transitionDriveStage = async ({ driveId, nextStage, actor, remarks }) => {
  const drive = await PlacementDrive.findById(driveId);
  if (!drive) {
    const error = new Error('Drive not found');
    error.statusCode = 404;
    throw error;
  }

  const currentStage = drive.workflowStage || DRIVE_STAGES.DRAFT;
  if (!canTransitionDrive(currentStage, nextStage)) {
    const error = new Error(`Invalid transition from ${currentStage} to ${nextStage}`);
    error.statusCode = 400;
    error.allowedTransitions = ALLOWED_DRIVE_TRANSITIONS[currentStage] || [];
    throw error;
  }

  drive.workflowStage = nextStage;
  drive.driveStatus = statusForStage(nextStage);
  drive.stageHistory.push({ from: currentStage, to: nextStage, changedBy: actor?._id, remarks });
  drive.stageTimestamps = {
    ...(drive.stageTimestamps?.toObject?.() || drive.stageTimestamps || {}),
    [nextStage]: new Date(),
  };
  await drive.save();

  if ([DRIVE_STAGES.PUBLISHED, DRIVE_STAGES.APPLICATIONS_OPEN].includes(nextStage)) {
    const students = await Student.find({ placementBlocked: { $ne: true } }).select('user');
    await notifyMany(students.map((student) => student.user), {
      title: 'Placement Drive Update',
      message: `${drive.companyName} - ${drive.role}: ${nextStage.replaceAll('_', ' ')}`,
      type: 'drive',
      link: '/student/companies',
    });
  }

  return drive;
};
