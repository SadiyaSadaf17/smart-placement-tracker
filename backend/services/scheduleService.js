import RoundSchedule from '../models/RoundSchedule.js';

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

export const assertNoScheduleConflicts = async ({ slots, excludeScheduleId }) => {
  for (const slot of slots) {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    if (!(start < end)) {
      const error = new Error('Slot end time must be after start time');
      error.statusCode = 400;
      throw error;
    }

    const studentIds = slot.assignedStudents || [];
    if (!studentIds.length) continue;

    const existing = await RoundSchedule.find({
      ...(excludeScheduleId ? { _id: { $ne: excludeScheduleId } } : {}),
      'slots.assignedStudents': { $in: studentIds },
      'slots.startTime': { $lt: end },
      'slots.endTime': { $gt: start },
    }).select('title slots');

    const conflict = existing.some((schedule) =>
      schedule.slots.some((existingSlot) =>
        existingSlot.assignedStudents.some((student) => studentIds.map(String).includes(student.toString())) &&
        overlaps(start, end, existingSlot.startTime, existingSlot.endTime)
      )
    );

    if (conflict) {
      const error = new Error('Schedule conflict detected for one or more students');
      error.statusCode = 409;
      throw error;
    }
  }
};
