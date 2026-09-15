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

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getReferrals)
  .post(createReferral);

router.route('/:id')
  .get(getReferralById)
  .put(updateReferral)
  .delete(deleteReferral);

router.patch('/:id/status', updateReferralStatus);

export default router;
