import XLSX from 'xlsx';
import Application, { ROUND_STATUSES } from '../models/Application.js';
import Student from '../models/Student.js';
import asyncHandler from '../utils/asyncHandler.js';
import { logAudit } from '../services/auditService.js';

export const bulkStatusPreview = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Upload an Excel or CSV file');
  }
  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
  const preview = await Promise.all(rows.map(async (row, index) => {
    const errors = [];
    if (!row.rollNumber) errors.push('rollNumber is required');
    if (!row.company) errors.push('company is required');
    if (!ROUND_STATUSES.includes(row.round)) errors.push('Invalid round');
    if (row.status && !['passed', 'failed', 'pending'].includes(row.status)) errors.push('Invalid status');
    const student = row.rollNumber ? await Student.findOne({ rollNumber: String(row.rollNumber).trim().toUpperCase() }) : null;
    if (row.rollNumber && !student) errors.push('Student not found');
    return { rowNumber: index + 2, data: row, valid: errors.length === 0, errors };
  }));
  res.json({ success: true, data: { rows: preview, summary: { total: preview.length, valid: preview.filter((row) => row.valid).length, invalid: preview.filter((row) => !row.valid).length } } });
});

export const bulkStatusCommit = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Upload an Excel or CSV file');
  }
  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
  const results = [];

  for (const row of rows) {
    const student = await Student.findOne({ rollNumber: String(row.rollNumber || '').trim().toUpperCase() });
    if (!student || !ROUND_STATUSES.includes(row.round)) {
      results.push({ row, success: false, message: 'Invalid student or round' });
      continue;
    }
    const app = await Application.findOne({ student: student._id }).populate('drive');
    if (!app || (row.company && app.drive?.companyName !== row.company)) {
      results.push({ row, success: false, message: 'Application not found for company' });
      continue;
    }
    app.currentRound = row.round;
    app.roundHistory.push({ round: row.round, status: row.status || 'pending', remarks: row.remarks });
    await app.save();
    await logAudit({ actor: req.user, actionType: 'BULK_APPLICATION_STATUS_UPDATED', targetEntity: 'Application', targetId: app._id, newValues: row, ipAddress: req.ip });
    results.push({ row, success: true, message: 'Updated' });
  }

  res.json({ success: true, data: { results, summary: { total: results.length, success: results.filter((row) => row.success).length, failed: results.filter((row) => !row.success).length } } });
});
