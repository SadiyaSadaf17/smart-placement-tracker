import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';
import Student from '../models/Student.js';
import Application from '../models/Application.js';
import PlacementDrive from '../models/PlacementDrive.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPlacementAnalytics } from '../services/analyticsService.js';

export const exportStudentsPDF = asyncHandler(async (req, res) => {
  const students = await Student.find().populate('user', 'email');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=students-report.pdf');

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text('Placement Tracker - Students Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10);

  students.forEach((s, i) => {
    doc.text(
      `${i + 1}. ${s.fullName} | ${s.rollNumber} | ${s.branch} | CGPA: ${s.cgpa} | Status: ${s.placementStatus}`
    );
  });

  doc.end();
});

export const exportStudentsExcel = asyncHandler(async (req, res) => {
  const students = await Student.find().populate('user', 'email');
  const data = students.map((s) => ({
    Name: s.fullName,
    Email: s.user?.email,
    Roll: s.rollNumber,
    Branch: s.branch,
    CGPA: s.cgpa,
    Backlogs: s.backlogs,
    Status: s.placementStatus,
    Package: s.placedPackage || 'N/A',
    Company: s.placedCompany || 'N/A',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
  res.send(buffer);
});

export const exportApplicationsExcel = asyncHandler(async (req, res) => {
  const applications = await Application.find()
    .populate('student', 'fullName rollNumber branch')
    .populate('drive', 'companyName role package');

  const data = applications.map((a) => ({
    Student: a.student?.fullName,
    Roll: a.student?.rollNumber,
    Company: a.drive?.companyName,
    Role: a.drive?.role,
    Package: a.drive?.package,
    Status: a.currentRound,
    Applied: a.appliedAt,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Applications');
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=applications.xlsx');
  res.send(buffer);
});

export const getSummaryReport = asyncHandler(async (req, res) => {
  const [students, drives, applications, placed] = await Promise.all([
    Student.countDocuments(),
    PlacementDrive.countDocuments(),
    Application.countDocuments(),
    Student.countDocuments({ placementStatus: 'placed' }),
  ]);

  res.json({
    success: true,
    data: {
      generatedAt: new Date(),
      students,
      drives,
      applications,
      placed,
      placementRate: students ? ((placed / students) * 100).toFixed(2) : 0,
    },
  });
});

export const exportMonthlyAnalyticsPDF = asyncHandler(async (req, res) => {
  const analytics = await getPlacementAnalytics(req.query);
  const monthLabel = req.query.year || new Date().getFullYear();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=monthly-placement-report-${monthLabel}.pdf`);

  const doc = new PDFDocument({ margin: 48 });
  doc.pipe(res);

  doc.fontSize(20).text('Smart Placement Tracker - Monthly Analytics Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleString('en-IN')}`);
  doc.text(`Filters: Branch ${analytics.filters.branch || 'All'} | Year ${analytics.filters.year || 'All'} | Company ${analytics.filters.company || 'All'}`);
  doc.moveDown();

  doc.fontSize(14).text('Overview');
  doc.fontSize(10);
  Object.entries(analytics.overview).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`);
  });

  doc.moveDown();
  doc.fontSize(14).text('Monthly Placement Trends');
  doc.fontSize(10);
  analytics.placementTrends.forEach((row) => {
    doc.text(`${row.label}: ${row.placements} placements | Avg Package: ${row.avgPackage} LPA | Highest: ${row.highestPackage} LPA`);
  });

  doc.moveDown();
  doc.fontSize(14).text('Branch-wise Placement Statistics');
  doc.fontSize(10);
  analytics.branchPlacements.forEach((row) => {
    doc.text(`${row._id}: ${row.placed}/${row.total} placed (${row.placementPercentage}%) | Avg Package: ${row.avgPackage} LPA`);
  });

  doc.end();
});

export const exportMonthlyAnalyticsExcel = asyncHandler(async (req, res) => {
  const analytics = await getPlacementAnalytics(req.query);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([analytics.overview]), 'Overview');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(analytics.branchPlacements), 'Branch Stats');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(analytics.placementTrends), 'Monthly Trends');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(analytics.companyHiring), 'Company Hiring');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(analytics.applicationFunnel), 'Funnel');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(analytics.eligibilityPlacementRatio.drives), 'Eligibility Ratio');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const yearLabel = req.query.year || new Date().getFullYear();

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=monthly-placement-report-${yearLabel}.xlsx`);
  res.send(buffer);
});
