import fs from 'fs';
import path from 'path';
import Student from '../models/Student.js';
import Application from '../models/Application.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createZipBuffer } from '../services/zipService.js';

const buildQuery = async (query) => {
  const studentQuery = { resume: { $exists: true, $ne: '' } };
  if (query.branch) studentQuery.branch = query.branch;
  if (query.department) studentQuery.department = query.department;
  if (query.batchYear) studentQuery.batchYear = query.batchYear;
  if (query.placementStatus) studentQuery.placementStatus = query.placementStatus;

  if (query.company || query.applied === 'true') {
    const appQuery = {};
    if (query.company) {
      const apps = await Application.find().populate({ path: 'drive', match: { companyName: query.company } });
      appQuery._id = { $in: apps.filter((app) => app.drive).map((app) => app._id) };
    }
    const applications = await Application.find(appQuery).select('student');
    studentQuery._id = { $in: applications.map((app) => app.student) };
  }
  return studentQuery;
};

const resolveResumePath = (resume) => path.resolve(process.cwd(), resume.replace(/^\//, ''));

export const listResumes = asyncHandler(async (req, res) => {
  const query = await buildQuery(req.query);
  const students = await Student.find(query)
    .populate('user', 'email')
    .select('fullName rollNumber branch department batchYear placementStatus resume user')
    .sort({ updatedAt: -1 })
    .limit(500);
  res.json({ success: true, data: students });
});

export const downloadResumeZip = asyncHandler(async (req, res) => {
  const query = await buildQuery(req.query);
  const students = await Student.find(query).select('fullName rollNumber resume');
  const entries = students
    .filter((student) => student.resume && fs.existsSync(resolveResumePath(student.resume)))
    .map((student) => ({
      name: `${student.rollNumber}-${student.fullName}.pdf`.replace(/[^\w.-]+/g, '_'),
      data: fs.readFileSync(resolveResumePath(student.resume)),
    }));

  if (!entries.length) {
    res.status(404);
    throw new Error('No resume files found');
  }

  const zip = createZipBuffer(entries);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=resumes.zip');
  res.send(zip);
});
