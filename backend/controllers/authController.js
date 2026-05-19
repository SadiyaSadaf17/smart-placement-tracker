import crypto from 'crypto';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { logActivity } from '../services/activityService.js';

const sendAuthResponse = (res, user, profile) => {
  res.status(200).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    profile,
  });
};

export const registerStudent = asyncHandler(async (req, res) => {
  const { email, password, fullName, rollNumber, branch, cgpa, phone } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ email, password, role: 'student' });
  const student = await Student.create({
    user: user._id,
    fullName,
    rollNumber,
    branch,
    cgpa: cgpa || 0,
    phone,
  });

  await logActivity({
    user: user._id,
    action: 'REGISTER',
    entity: 'Student',
    entityId: student._id,
    ip: req.ip,
  });

  sendAuthResponse(res, user, student);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Account has been deactivated. Contact placement cell.');
  }

  let profile = null;
  if (user.role === 'student') {
    profile = await Student.findOne({ user: user._id });
  } else {
    profile = await Admin.findOne({ user: user._id });
  }

  await logActivity({ user: user._id, action: 'LOGIN', ip: req.ip });
  sendAuthResponse(res, user, profile);
});

export const getMe = asyncHandler(async (req, res) => {
  let profile = null;
  if (req.user.role === 'student') {
    profile = await Student.findOne({ user: req.user._id }).populate('user', 'email role');
  } else {
    profile = await Admin.findOne({ user: req.user._id }).populate('user', 'email role');
  }

  res.json({ success: true, user: req.user, profile });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({
      success: true,
      message: 'If your email is registered, you will receive a reset link shortly.',
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  res.json({
    success: true,
    message: 'If your email is registered, you will receive a reset link shortly.',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendAuthResponse(res, user, null);
});

export const logout = asyncHandler(async (req, res) => {
  await logActivity({ user: req.user._id, action: 'LOGOUT', ip: req.ip });
  res.json({ success: true, message: 'Logged out successfully' });
});
