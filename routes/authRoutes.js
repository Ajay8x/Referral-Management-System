import express from 'express';
import { registerUser, loginUser, logoutUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/login', (req, res) => res.redirect('/login'));
router.post('/login', loginUser);
router.get('/register', (req, res) => res.redirect('/register'));
router.post('/register', registerUser);
router.get('/logout', logoutUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export default router;

