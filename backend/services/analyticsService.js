import Student from '../models/Student.js';
import Application, { ROUND_STATUSES } from '../models/Application.js';
import PlacementDrive from '../models/PlacementDrive.js';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'];

const clampLimit = (value, fallback = 12, max = 60) =>
  Math.min(Math.max(Number(value) || fallback, 1), max);

const round = (value) => Math.round((Number(value) || 0) * 100) / 100;

const parseYear = (year) => {
  const parsed = Number(year);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(parsed) || parsed < 2000 || parsed > currentYear + 1) return null;
  return parsed;
};

const buildDateRange = (year) => {
  const safeYear = parseYear(year);
  if (!safeYear) return {};
  return {
    $gte: new Date(Date.UTC(safeYear, 0, 1)),
    $lt: new Date(Date.UTC(safeYear + 1, 0, 1)),
  };
};

const buildStudentMatch = ({ branch, department, company }) => {
  const match = {};
  const normalizedBranch = branch || department;
  if (normalizedBranch && BRANCHES.includes(normalizedBranch)) match.branch = normalizedBranch;
  if (company) match.placedCompany = company;
  return match;
};

const buildApplicationMatch = ({ company, year }) => {
  const match = {};
  const dateRange = buildDateRange(year);
  if (Object.keys(dateRange).length) match.appliedAt = dateRange;
  if (company) match['drive.companyName'] = company;
  return match;
};

const buildApplicationStudentMatch = ({ branch, department }) => {
  const match = {};
  const normalizedBranch = branch || department;
  if (normalizedBranch && BRANCHES.includes(normalizedBranch)) match['student.branch'] = normalizedBranch;
  return match;
};

const getPlacementOverview = async (studentMatch) => {
  const [overview] = await Student.aggregate([
    { $match: studentMatch },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        placedStudents: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } },
        internStudents: { $sum: { $cond: [{ $eq: ['$placementStatus', 'intern'] }, 1, 0] } },
        highestPackage: { $max: { $ifNull: ['$placedPackage', 0] } },
        averagePackage: {
          $avg: {
            $cond: [{ $gt: ['$placedPackage', 0] }, '$placedPackage', null],
          },
        },
        totalAcceptedOffers: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } },
      },
    },
  ]);

  const totalStudents = overview?.totalStudents || 0;
  const placedStudents = overview?.placedStudents || 0;

  return {
    totalStudents,
    placedStudents,
    internStudents: overview?.internStudents || 0,
    unplacedStudents: Math.max(totalStudents - placedStudents - (overview?.internStudents || 0), 0),
    placementPercentage: totalStudents ? round((placedStudents / totalStudents) * 100) : 0,
    highestPackage: round(overview?.highestPackage || 0),
    averagePackage: round(overview?.averagePackage || 0),
  };
};

const getBranchPlacements = (studentMatch) =>
  Student.aggregate([
    { $match: studentMatch },
    {
      $group: {
        _id: '$branch',
        total: { $sum: 1 },
        placed: { $sum: { $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0] } },
        interns: { $sum: { $cond: [{ $eq: ['$placementStatus', 'intern'] }, 1, 0] } },
        avgCgpa: { $avg: '$cgpa' },
        avgPackage: { $avg: { $cond: [{ $gt: ['$placedPackage', 0] }, '$placedPackage', null] } },
        highestPackage: { $max: { $ifNull: ['$placedPackage', 0] } },
      },
    },
    {
      $project: {
        total: 1,
        placed: 1,
        interns: 1,
        avgCgpa: { $round: ['$avgCgpa', 2] },
        avgPackage: { $round: [{ $ifNull: ['$avgPackage', 0] }, 2] },
        highestPackage: { $round: ['$highestPackage', 2] },
        placementPercentage: {
          $cond: [{ $gt: ['$total', 0] }, { $round: [{ $multiply: [{ $divide: ['$placed', '$total'] }, 100] }, 2] }, 0],
        },
      },
    },
    { $sort: { placementPercentage: -1, placed: -1 } },
  ]);

const getApplicationBasePipeline = (filters) => [
  {
    $lookup: {
      from: 'placementdrives',
      localField: 'drive',
      foreignField: '_id',
      as: 'drive',
    },
  },
  { $unwind: '$drive' },
  {
    $lookup: {
      from: 'students',
      localField: 'student',
      foreignField: '_id',
      as: 'student',
    },
  },
  { $unwind: '$student' },
  {
    $match: {
      ...buildApplicationMatch(filters),
      ...buildApplicationStudentMatch(filters),
    },
  },
];

const getPlacementTrends = (filters, limit) =>
  Application.aggregate([
    ...getApplicationBasePipeline(filters),
    { $match: { currentRound: 'Selected' } },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' },
        },
        placements: { $sum: 1 },
        avgPackage: { $avg: '$drive.package' },
        highestPackage: { $max: '$drive.package' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        label: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: [
                { $lt: ['$_id.month', 10] },
                { $concat: ['0', { $toString: '$_id.month' }] },
                { $toString: '$_id.month' },
              ],
            },
          ],
        },
        placements: 1,
        count: '$placements',
        avgPackage: { $round: ['$avgPackage', 2] },
        highestPackage: { $round: ['$highestPackage', 2] },
      },
    },
  ]);

const getCompanyHiring = (filters) =>
  Application.aggregate([
    ...getApplicationBasePipeline(filters),
    { $match: { currentRound: 'Selected' } },
    {
      $group: {
        _id: '$drive.companyName',
        count: { $sum: 1 },
        avgPackage: { $avg: '$drive.package' },
        highestPackage: { $max: '$drive.package' },
        roles: { $addToSet: '$drive.role' },
      },
    },
    { $sort: { count: -1, highestPackage: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        company: '$_id',
        count: 1,
        avgPackage: { $round: ['$avgPackage', 2] },
        highestPackage: { $round: ['$highestPackage', 2] },
        rolesCount: { $size: '$roles' },
      },
    },
  ]);

const getPackageDistribution = (studentMatch) =>
  Student.aggregate([
    { $match: { ...studentMatch, placementStatus: 'placed', placedPackage: { $gt: 0 } } },
    {
      $bucket: {
        groupBy: '$placedPackage',
        boundaries: [0, 5, 10, 15, 20, 50],
        default: '50+',
        output: { count: { $sum: 1 } },
      },
    },
  ]);

const getApplicationFunnel = (filters) =>
  Application.aggregate([
    ...getApplicationBasePipeline(filters),
    { $group: { _id: '$currentRound', count: { $sum: 1 } } },
  ]).then((rows) => {
    const counts = new Map(rows.map((row) => [row._id, row.count]));
    const total = counts.get('Applied') || rows.reduce((sum, row) => sum + row.count, 0);
    return ROUND_STATUSES.map((roundName, index) => ({
      round: roundName,
      count: counts.get(roundName) || 0,
      order: index + 1,
      conversionRate: total ? round(((counts.get(roundName) || 0) / total) * 100) : 0,
    }));
  });

const getOfferAcceptance = (filters) =>
  Application.aggregate([
    ...getApplicationBasePipeline(filters),
    { $match: { currentRound: { $in: ['Selected', 'Rejected'] } } },
    {
      $group: {
        _id: null,
        offers: { $sum: { $cond: [{ $eq: ['$currentRound', 'Selected'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$currentRound', 'Rejected'] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        offers: 1,
        rejected: 1,
        totalFinalized: { $add: ['$offers', '$rejected'] },
        offerAcceptanceRatio: {
          $cond: [
            { $gt: [{ $add: ['$offers', '$rejected'] }, 0] },
            { $round: [{ $multiply: [{ $divide: ['$offers', { $add: ['$offers', '$rejected'] }] }, 100] }, 2] },
            0,
          ],
        },
      },
    },
  ]).then((rows) => rows[0] || { offers: 0, rejected: 0, totalFinalized: 0, offerAcceptanceRatio: 0 });

const getStudentPerformance = (studentMatch) =>
  Student.aggregate([
    { $match: studentMatch },
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
    {
      $project: {
        _id: 0,
        avgCgpa: { $round: ['$avgCgpa', 2] },
        avgSkills: { $round: ['$avgSkills', 2] },
        avgATS: { $round: ['$avgATS', 2] },
        placementRate: { $round: [{ $multiply: ['$placementRate', 100] }, 2] },
      },
    },
  ]).then((rows) => rows[0] || {});

const getEligibleCountForDrive = (drive, studentMatch) =>
  Student.countDocuments({
    ...studentMatch,
    cgpa: { $gte: drive.eligibility?.minCgpa || 0 },
    backlogs: { $lte: drive.eligibility?.maxBacklogs ?? Number.MAX_SAFE_INTEGER },
    branch: { $in: drive.eligibility?.allowedBranches || BRANCHES },
  });

const getEligibilityPlacementRatio = async (filters, studentMatch) => {
  const driveMatch = {};
  const dateRange = buildDateRange(filters.year);
  if (Object.keys(dateRange).length) driveMatch.interviewDate = dateRange;
  if (filters.company) driveMatch.companyName = filters.company;

  const drives = await PlacementDrive.find(driveMatch)
    .select('companyName role eligibility')
    .sort({ interviewDate: -1 })
    .limit(20)
    .lean();

  const rows = await Promise.all(
    drives.map(async (drive) => {
      const [eligible, placed] = await Promise.all([
        getEligibleCountForDrive(drive, studentMatch),
        Application.countDocuments({
          drive: drive._id,
          currentRound: 'Selected',
        }),
      ]);

      return {
        driveId: drive._id,
        company: drive.companyName,
        role: drive.role,
        eligible,
        placed,
        placementRatio: eligible ? round((placed / eligible) * 100) : 0,
      };
    })
  );

  const totals = rows.reduce(
    (acc, row) => ({
      eligible: acc.eligible + row.eligible,
      placed: acc.placed + row.placed,
    }),
    { eligible: 0, placed: 0 }
  );

  return {
    totals: {
      ...totals,
      ratio: totals.eligible ? round((totals.placed / totals.eligible) * 100) : 0,
    },
    drives: rows,
  };
};

export const getAnalyticsFilterOptions = async () => {
  const [companies, years] = await Promise.all([
    PlacementDrive.distinct('companyName'),
    Application.aggregate([
      { $group: { _id: { $year: '$appliedAt' } } },
      { $sort: { _id: -1 } },
    ]),
  ]);

  return {
    branches: BRANCHES,
    departments: BRANCHES,
    companies: companies.filter(Boolean).sort(),
    years: years.map((row) => row._id).filter(Boolean),
  };
};

export const getPlacementAnalytics = async (filters = {}) => {
  const limit = clampLimit(filters.limit, 12, 36);
  const studentMatch = buildStudentMatch(filters);

  const [
    overview,
    branchPlacements,
    placementTrends,
    companyHiring,
    packageDistribution,
    applicationFunnel,
    offerAcceptance,
    studentPerformance,
    eligibilityPlacementRatio,
    filterOptions,
  ] = await Promise.all([
    getPlacementOverview(studentMatch),
    getBranchPlacements(studentMatch),
    getPlacementTrends(filters, limit),
    getCompanyHiring(filters),
    getPackageDistribution(studentMatch),
    getApplicationFunnel(filters),
    getOfferAcceptance(filters),
    getStudentPerformance(studentMatch),
    getEligibilityPlacementRatio(filters, studentMatch),
    getAnalyticsFilterOptions(),
  ]);

  return {
    filters: {
      branch: filters.branch || '',
      department: filters.department || '',
      year: parseYear(filters.year) || '',
      company: filters.company || '',
    },
    filterOptions,
    overview,
    branchPlacements,
    placementTrends,
    companyHiring,
    packageDistribution,
    roundFunnel: applicationFunnel.map(({ round, count }) => ({ _id: round, count })),
    applicationFunnel,
    offerAcceptance,
    studentPerformance,
    eligibilityPlacementRatio,
  };
};
