import Student from '../models/Student.js';
import Application from '../models/Application.js';
import PlacementDrive from '../models/PlacementDrive.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAnalytics = asyncHandler(async (req, res) => {
  const branchPlacements = await Student.aggregate([
    {
      $group: {
        _id: '$branch',
        total: { $sum: 1 },
        placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } },
        avgCgpa: { $avg: '$cgpa' },
        avgPackage: { $avg: '$placedPackage' },
      },
    },
    { $sort: { placed: -1 } },
  ]);

  const placementTrends = await Application.aggregate([
    {
      $match: { currentRound: 'Selected' },
    },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  const companyHiring = await Student.aggregate([
    { $match: { placementStatus: 'placed', placedCompany: { $exists: true, $ne: null } } },
    { $group: { _id: '$placedCompany', count: { $sum: 1 }, avgPackage: { $avg: '$placedPackage' } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const packageDistribution = await Student.aggregate([
    { $match: { placementStatus: 'placed', placedPackage: { $gt: 0 } } },
    {
      $bucket: {
        groupBy: '$placedPackage',
        boundaries: [0, 5, 10, 15, 20, 50],
        default: '50+',
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const roundFunnel = await Application.aggregate([
    { $group: { _id: '$currentRound', count: { $sum: 1 } } },
  ]);

  const studentPerformance = await Student.aggregate([
    {
      $project: {
        branch: 1,
        cgpa: 1,
        skillCount: { $size: { $ifNull: ['$skills', []] } },
        atsScore: { $ifNull: ['$atsScore', 0] },
        placed: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] },
      },
    },
    {
      $group: {
        _id: null,
        avgCgpa: { $avg: '$cgpa' },
        avgSkills: { $avg: '$skillCount' },
        avgATS: { $avg: '$atsScore' },
        placementRate: { $avg: '$placed' },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      branchPlacements,
      placementTrends: placementTrends.map((t) => ({
        label: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
        count: t.count,
      })),
      companyHiring: companyHiring.map((c) => ({
        company: c._id,
        count: c.count,
        avgPackage: c.avgPackage?.toFixed(2),
      })),
      packageDistribution,
      roundFunnel,
      studentPerformance: studentPerformance[0] || {},
    },
  });
});
