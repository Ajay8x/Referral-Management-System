import express from 'express';
import {
  getReferrals,
  getReferralById,
  createReferral,
  updateReferral,
  updateReferralStatus,
  deleteReferral
} from '../controllers/referralController.js';
import { protect } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

const referralUpload = uploadMiddleware.fields([
  { name: 'childPhoto', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]);

router.use(protect);

router.route('/')
  .get(getReferrals)
  .post(referralUpload, createReferral);

router.route('/:id')
  .get(getReferralById)
  .put(referralUpload, updateReferral)
  .delete(deleteReferral);

router.patch('/:id/status', updateReferralStatus);

export default router;

