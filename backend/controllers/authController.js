import crypto from 'crypto';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { logActivity } from '../services/activityService.js';
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from '../services/cloudinaryService.js';

const sendAuthResponse = (res, user, profile) => {
  res.status(200).json({
    success: true,
    token: generateToken(user._id),
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || null,
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

  res.json({
    success: true,
    user: {
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      profileImage: req.user.profileImage || null,
    },
    profile,
  });
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

/* -------------------- CHANGE PASSWORD -------------------- */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (currentPassword === newPassword) {
    res.status(400);
    throw new Error('New password must be different from current password');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user || !(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

/* -------------------- UPLOAD PROFILE IMAGE -------------------- */
export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  const user = await User.findById(req.user._id).select('+profileImagePublicId');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const publicId = `user-${user._id}`;
  const uploaded = await uploadImageToCloudinary({
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    publicId,
  });

  if (user.profileImagePublicId && user.profileImagePublicId !== uploaded.publicId) {
    await deleteImageFromCloudinary(user.profileImagePublicId);
  }

  user.profileImage = uploaded.secureUrl;
  user.profileImagePublicId = uploaded.publicId;
  await user.save();

  let profile = null;
  if (user.role === 'student') {
    profile = await Student.findOne({ user: user._id });
  } else {
    profile = await Admin.findOne({ user: user._id });
  }

  res.json({
    success: true,
    message: 'Profile image updated successfully',
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
    profile,
  });
});

export const removeProfileImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+profileImagePublicId');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.profileImagePublicId) {
    await deleteImageFromCloudinary(user.profileImagePublicId);
  }

  user.profileImage = null;
  user.profileImagePublicId = null;
  await user.save();

  res.json({
    success: true,
    message: 'Profile image removed successfully',
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      profileImage: null,
    },
  });
});
