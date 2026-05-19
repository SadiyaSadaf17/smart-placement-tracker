import express from 'express';
import {
  registerStudent,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  validate({
    email: { required: true, email: true },
    password: { required: true, minLength: 6 },
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
router.put('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
