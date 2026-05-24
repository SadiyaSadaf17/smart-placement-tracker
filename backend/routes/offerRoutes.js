import express from 'express';
import {
  getMyOffers,
  getOffers,
  respondToOffer,
  uploadOfferLetter,
  verifyOffer,
} from '../controllers/offerController.js';
import { authorize, protect, requirePermission, requireStudent } from '../middleware/authMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';
import { uploadOfferLetter as uploadOfferLetterMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/my', authorize('student'), requireStudent, getMyOffers);
router.patch('/:id/respond', authorize('student'), requireStudent, respondToOffer);
router.get('/', requirePermission(PERMISSIONS.VIEW_OFFERS), getOffers);
router.patch('/:id/verify', requirePermission(PERMISSIONS.MANAGE_OFFERS), verifyOffer);
router.post('/:id/letter', requirePermission(PERMISSIONS.MANAGE_OFFERS), uploadOfferLetterMiddleware.single('offerLetter'), uploadOfferLetter);

export default router;
