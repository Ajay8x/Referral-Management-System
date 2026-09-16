import express from 'express';
import { protectView, redirectIfLoggedIn } from '../middleware/auth.js';
import Referral from '../models/Referral.js';
import { logoutUser } from '../controllers/authController.js';

const router = express.Router();

// Root route: Redirect to dashboard if logged in, otherwise login
router.get('/', (req, res) => {
  if (req.cookies && req.cookies.token) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

// Login Page
router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login', {
    title: 'Login - Shree RBSK Referral System',
    error: null,
    mobile: ''
  });
});

// Register Page
router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register', {
    title: 'Register - Shree RBSK Referral System',
    error: null,
    formData: {}
  });
});

// Dashboard Page (Protected)
router.get('/dashboard', protectView, async (req, res) => {
  try {
    const { search, status, instituteType } = req.query;
    const query = { user: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (instituteType && instituteType !== 'all') {
      query.instituteType = instituteType;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { childName: regex },
        { fatherName: regex },
        { motherName: regex },
        { villageName: regex },
        { instituteName: regex },
        { defect: regex },
        { otherDefect: regex },
        { mobile1: regex },
        { mobile2: regex },
        { mobile3: regex },
        { birthCertificateNo: regex }
      ];
    }

    const referrals = await Referral.find(query).sort({ createdAt: -1 });

    // Aggregated stats
    const allUserReferrals = await Referral.find({ user: req.user._id }, 'status');
    const stats = {
      total: allUserReferrals.length,
      pending: allUserReferrals.filter(r => r.status === 'Pending').length,
      referred: allUserReferrals.filter(r => r.status === 'Referred').length,
      started: allUserReferrals.filter(r => r.status === 'Treatment Started').length,
      completed: allUserReferrals.filter(r => r.status === 'Completed').length
    };

    res.render('dashboard', {
      title: 'Dashboard - Shree RBSK Referral System',
      user: req.user,
      referrals,
      stats,
      filters: {
        search: search || '',
        status: status || 'all',
        instituteType: instituteType || 'all'
      }
    });
  } catch (error) {
    console.error('Dashboard Render Error:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Failed to load dashboard. Please refresh or try again later.'
    });
  }
});

// Logout
router.get('/logout', logoutUser);

export default router;
