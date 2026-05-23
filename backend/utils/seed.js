import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import Company from '../models/Company.js';
import PlacementDrive from '../models/PlacementDrive.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { calculateATSScore } from './aiHelpers.js';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany(),
      Student.deleteMany(),
      Admin.deleteMany(),
      Company.deleteMany(),
      PlacementDrive.deleteMany(),
      Application.deleteMany(),
      Notification.deleteMany(),
    ]);

    const adminUser = await User.create({
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
    });

    const admin = await Admin.create({
      user: adminUser._id,
      fullName: 'Placement Officer',
      department: 'Training & Placement Cell',
      phone: '9876543210',
    });

    const companies = await Company.insertMany([
      { name: 'TCS', industry: 'IT Services', location: 'Pan India' },
      { name: 'Infosys', industry: 'IT Services', location: 'Bangalore' },
      { name: 'Wipro', industry: 'IT Services', location: 'Hyderabad' },
      { name: 'Amazon', industry: 'E-commerce', location: 'Bangalore' },
      { name: 'Microsoft', industry: 'Technology', location: 'Hyderabad' },
    ]);

    const studentData = [
      { email: 'rahul@cse.edu', fullName: 'Rahul Sharma', rollNumber: 'CS21B001', branch: 'CSE', cgpa: 8.5, skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'DSA'] },
      { email: 'priya@it.edu', fullName: 'Priya Patel', rollNumber: 'IT21B002', branch: 'IT', cgpa: 8.2, skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'] },
      { email: 'amit@ece.edu', fullName: 'Amit Kumar', rollNumber: 'EC21B003', branch: 'ECE', cgpa: 7.8, skills: ['Embedded Systems', 'C', 'Verilog', 'IoT'] },
      { email: 'sneha@cse.edu', fullName: 'Sneha Reddy', rollNumber: 'CS21B004', branch: 'CSE', cgpa: 9.1, skills: ['Java', 'Spring Boot', 'React', 'AWS', 'Docker'] },
      { email: 'vikram@mech.edu', fullName: 'Vikram Singh', rollNumber: 'ME21B005', branch: 'MECH', cgpa: 7.2, skills: ['AutoCAD', 'SolidWorks', 'MATLAB'] },
    ];

    const students = [];
    for (const data of studentData) {
      const user = await User.create({
        email: data.email,
        password: 'student123',
        role: 'student',
      });
      const student = await Student.create({
        user: user._id,
        fullName: data.fullName,
        rollNumber: data.rollNumber,
        branch: data.branch,
        cgpa: data.cgpa,
        skills: data.skills,
        backlogs: 0,
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        linkedin: `https://linkedin.com/in/${data.fullName.toLowerCase().replace(' ', '')}`,
        github: `https://github.com/${data.fullName.split(' ')[0].toLowerCase()}`,
        projects: [
          { title: 'Placement Tracker', description: 'Full stack MERN app', technologies: ['React', 'Node'] },
        ],
        certifications: [{ name: 'AWS Cloud Practitioner', issuer: 'Amazon', date: new Date('2024-06-01') }],
      });
      student.atsScore = calculateATSScore(student);
      await student.save();
      students.push(student);

      await Notification.create({
        recipient: user._id,
        title: 'Welcome to Placement Tracker',
        message: 'Complete your profile and explore eligible companies.',
        type: 'info',
      });
    }

    const drives = await PlacementDrive.insertMany([
      {
        company: companies[3]._id,
        companyName: 'Amazon',
        role: 'SDE Intern',
        package: 12,
        location: 'Bangalore',
        description: 'Software development internship with PPO opportunity.',
        eligibility: { minCgpa: 7.5, allowedBranches: ['CSE', 'IT'], maxBacklogs: 0 },
        requiredSkills: ['Java', 'DSA', 'System Design'],
        interviewDate: new Date('2026-06-15'),
        driveStatus: 'active',
        createdBy: admin._id,
      },
      {
        company: companies[4]._id,
        companyName: 'Microsoft',
        role: 'Software Engineer',
        package: 18,
        location: 'Hyderabad',
        description: 'Full-time software engineer role.',
        eligibility: { minCgpa: 8, allowedBranches: ['CSE', 'IT', 'ECE'], maxBacklogs: 0 },
        requiredSkills: ['C#', 'Azure', 'React', 'DSA'],
        interviewDate: new Date('2026-07-01'),
        driveStatus: 'upcoming',
        createdBy: admin._id,
      },
      {
        company: companies[0]._id,
        companyName: 'TCS',
        role: 'Graduate Trainee',
        package: 3.6,
        location: 'Pan India',
        description: 'Mass recruitment drive for all branches.',
        eligibility: { minCgpa: 6, allowedBranches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'], maxBacklogs: 2 },
        requiredSkills: ['Communication', 'Aptitude'],
        interviewDate: new Date('2026-05-20'),
        driveStatus: 'active',
        createdBy: admin._id,
      },
    ]);

    await Application.create([
      {
        student: students[0]._id,
        drive: drives[0]._id,
        currentRound: 'Technical Round',
        roundHistory: [
          { round: 'Applied', status: 'passed' },
          { round: 'Shortlisted', status: 'passed' },
          { round: 'Aptitude', status: 'passed' },
          { round: 'Technical Round', status: 'pending' },
        ],
      },
      {
        student: students[3]._id,
        drive: drives[1]._id,
        currentRound: 'Applied',
        roundHistory: [{ round: 'Applied', status: 'pending' }],
      },
    ]);

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Admin Login:');
    console.log('  Email: admin@college.edu');
    console.log('  Password: admin123\n');
    console.log('Student Logins (password: student123):');
    studentData.forEach((s) => console.log(`  ${s.email}`));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
