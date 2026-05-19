import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    if (err.name === 'TokenExpiredError') throw new Error('Token expired, please login again');
    if (err.name === 'JsonWebTokenError') throw new Error('Invalid token');
    throw new Error('Not authorized');
  }

  const user = await User.findById(decoded.id).select('-password');

  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Not authorized');
  }

  req.user = user;

  if (user.role === 'student') {
    req.student = await Student.findOne({ user: user._id });
  } else if (user.role === 'admin') {
    req.admin = await Admin.findOne({ user: user._id });
  }

  next();
});

export const requireStudent = asyncHandler(async (req, res, next) => {
  if (!req.student) {
    res.status(404);
    throw new Error('Student profile not found. Complete registration.');
  }
  next();
});

export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role ${req.user.role} is not authorized`);
    }
    next();
  });
