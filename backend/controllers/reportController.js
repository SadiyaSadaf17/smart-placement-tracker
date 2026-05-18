import PDFDocument from 'pdfkit';
import XLSX from 'xlsx';
import Student from '../models/Student.js';
import Application from '../models/Application.js';
import PlacementDrive from '../models/PlacementDrive.js';
import asyncHandler from '../utils/asyncHandler.js';

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
