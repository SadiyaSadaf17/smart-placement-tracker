import XLSX from 'xlsx';
import BulkUploadBatch from '../models/BulkUploadBatch.js';
import BulkUploadRow from '../models/BulkUploadRow.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  buildBulkErrorRows,
  commitStudentBulkUpload,
  createStudentBulkPreview,
} from '../services/studentBulkUploadService.js';
import { emitToAdmin } from '../config/socket.js';
import { logAudit } from '../services/auditService.js';

const paginateRows = async (batchId, page = 1, limit = 50) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const start = (safePage - 1) * safeLimit;
  const [rows, total] = await Promise.all([
    BulkUploadRow.find({ batch: batchId }).sort({ rowNumber: 1 }).skip(start).limit(safeLimit).lean(),
    BulkUploadRow.countDocuments({ batch: batchId }),
  ]);

  return {
    rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

export const previewStudentBulkUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an .xlsx or .csv file');
  }

  const batch = await createStudentBulkPreview({
    file: req.file,
    uploadedBy: req.user._id,
  });

  await logAudit({
    actor: req.user,
    actionType: 'BULK_STUDENTS_PREVIEWED',
    targetEntity: 'BulkUploadBatch',
    targetId: batch._id,
    newValues: batch.summary,
    ipAddress: req.ip,
  });

  const preview = await paginateRows(batch._id, req.query.page, req.query.limit);

  res.status(201).json({
    success: true,
    data: {
      batchId: batch._id,
      fileName: batch.fileName,
      summary: batch.summary,
      ...preview,
    },
  });
});

export const getStudentBulkUploadBatch = asyncHandler(async (req, res) => {
  const batch = await BulkUploadBatch.findOne({
    _id: req.params.batchId,
    uploadedBy: req.user._id,
  });

  if (!batch) {
    res.status(404);
    throw new Error('Bulk upload batch not found');
  }

  const preview = await paginateRows(batch._id, req.query.page, req.query.limit);
  res.json({
    success: true,
    data: {
      batchId: batch._id,
      fileName: batch.fileName,
      status: batch.status,
      summary: batch.summary,
      ...preview,
    },
  });
});

export const commitStudentBulkUploadBatch = asyncHandler(async (req, res) => {
  const result = await commitStudentBulkUpload({
    batchId: req.params.batchId,
    uploadedBy: req.user._id,
  });

  emitToAdmin('analytics-update', { reason: 'bulk-students-imported' });
  await logAudit({
    actor: req.user,
    actionType: 'BULK_STUDENTS_IMPORTED',
    targetEntity: 'BulkUploadBatch',
    targetId: req.params.batchId,
    newValues: { imported: result.imported, skipped: result.skipped },
    ipAddress: req.ip,
  });

  res.json({ success: true, data: result });
});

export const downloadStudentBulkUploadErrors = asyncHandler(async (req, res) => {
  const batch = await BulkUploadBatch.findOne({
    _id: req.params.batchId,
    uploadedBy: req.user._id,
  });

  if (!batch) {
    res.status(404);
    throw new Error('Bulk upload batch not found');
  }

  const rows = await buildBulkErrorRows(batch);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Errors');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=student-upload-errors-${batch._id}.xlsx`);
  res.send(buffer);
});
