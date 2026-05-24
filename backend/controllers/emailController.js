import EmailJob from '../models/EmailJob.js';
import asyncHandler from '../utils/asyncHandler.js';
import { processEmailQueue } from '../services/emailQueueService.js';

export const getEmailJobs = asyncHandler(async (req, res) => {
  const jobs = await EmailJob.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: jobs });
});

export const runEmailQueue = asyncHandler(async (req, res) => {
  const results = await processEmailQueue();
  res.json({ success: true, data: results });
});
