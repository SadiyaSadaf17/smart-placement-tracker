import XLSX from 'xlsx';
import Student from '../models/Student.js';
import Application from '../models/Application.js';
import asyncHandler from '../utils/asyncHandler.js';

const toWorkbook = (sheetName, rows) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

export const getAdvancedReport = asyncHandler(async (req, res) => {
  const { type = 'branch-wise' } = req.params;
  let data = [];

  if (type === 'branch-wise') {
    data = await Student.aggregate([{ $group: { _id: '$branch', total: { $sum: 1 }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } }, avgPackage: { $avg: '$placedPackage' } } }]);
  } else if (type === 'unplaced') {
    data = await Student.find({ placementStatus: { $ne: 'placed' } }).select('fullName rollNumber branch department batchYear cgpa placementConsentStatus');
  } else if (type === 'company-wise') {
    data = await Application.aggregate([{ $match: { currentRound: 'Selected' } }, { $lookup: { from: 'placementdrives', localField: 'drive', foreignField: '_id', as: 'drive' } }, { $unwind: '$drive' }, { $group: { _id: '$drive.companyName', selected: { $sum: 1 }, avgPackage: { $avg: '$drive.package' } } }]);
  } else if (type === 'package-slab') {
    data = await Student.aggregate([{ $match: { placementStatus: 'placed', placedPackage: { $gt: 0 } } }, { $bucket: { groupBy: '$placedPackage', boundaries: [0, 5, 10, 15, 20, 50], default: '50+', output: { count: { $sum: 1 } } } }]);
  } else if (type === 'year-wise') {
    data = await Student.aggregate([{ $group: { _id: '$batchYear', total: { $sum: 1 }, placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } } } }]);
  }

  res.json({ success: true, data });
});

export const exportAdvancedReport = asyncHandler(async (req, res) => {
  const fakeReq = { ...req, params: { type: req.params.type } };
  let captured;
  const fakeRes = { json: (payload) => { captured = payload.data; } };
  await getAdvancedReport(fakeReq, fakeRes);
  const buffer = toWorkbook(req.params.type, captured || []);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${req.params.type}-report.xlsx`);
  res.send(buffer);
});
