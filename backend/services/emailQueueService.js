import EmailJob from '../models/EmailJob.js';
import { sendEmail } from './emailService.js';

export const enqueueEmail = (payload) => EmailJob.create(payload);

export const processEmailQueue = async ({ limit = 20 } = {}) => {
  const jobs = await EmailJob.find({
    status: { $in: ['queued', 'failed'] },
    nextAttemptAt: { $lte: new Date() },
    attempts: { $lt: 3 },
  })
    .sort({ createdAt: 1 })
    .limit(limit);

  const results = [];
  for (const job of jobs) {
    try {
      job.attempts += 1;
      await sendEmail({ to: job.to, subject: job.subject, html: job.html, text: job.text });
      job.status = 'sent';
      job.sentAt = new Date();
      job.lastError = undefined;
      await job.save();
      results.push({ id: job._id, status: 'sent' });
    } catch (error) {
      job.status = 'failed';
      job.lastError = error.message;
      job.nextAttemptAt = new Date(Date.now() + job.attempts * 5 * 60 * 1000);
      await job.save();
      results.push({ id: job._id, status: 'failed', error: error.message });
    }
  }

  return results;
};
