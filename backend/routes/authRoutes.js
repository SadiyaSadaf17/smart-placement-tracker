import express from 'express';
import {
  registerStudent,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
  changePassword,
  uploadProfileImage,
  removeProfileImage,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  validate({
    email: { required: true, email: true },
    password: { required: true, minLength: 8 },
    fullName: { required: true, minLength: 2 },
    rollNumber: { required: true },
    branch: { required: true },
  }),
  registerStudent
);
router.post(
  '/login',
  validate({
    email: { required: true, email: true },
    password: { required: true },
  }),
  login
);
router.post('/forgot-password', forgotPassword);
router.put(
  '/reset-password/:token',
  validate({
    password: { required: true, minLength: 8 },
  }),
  resetPassword
);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

router.put(
  '/change-password',
  protect,
  validate({
    currentPassword: { required: true },
    newPassword: { required: true, minLength: 8 },
  }),
  changePassword
);

router.put('/profile-image', protect, uploadAvatar.single('avatar'), uploadProfileImage);
router.delete('/profile-image', protect, removeProfileImage);

export default router;
