import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'rbsk_super_secret_jwt_key_2025_safe_secure', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      _id: user._id,
      name: user.name,
      mobile: user.mobile,
      role: user.role
    }
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, mobile, password } = req.body;

    if (!name || !mobile || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ mobile: cleanMobile });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account already exists with this mobile number' });
    }

    const user = await User.create({
      name: name.trim(),
      mobile: cleanMobile,
      password
    });

    sendTokenResponse(user, 201, res, 'Account created successfully');
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during registration'
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ success: false, message: 'Please provide mobile number and password' });
    }

    const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    const user = await User.findOne({ mobile: cleanMobile }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid mobile number or password' });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Logout user & clear cookie
// @route   GET /api/auth/logout & /logout
// @access  Public
export const logoutUser = (req, res) => {
  res.clearCookie('token');
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
  return res.redirect('/login');
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
