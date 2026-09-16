import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Helper to extract token from cookies or auth header
const extractToken = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

// Protect API JSON routes
export const protect = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rbsk_super_secret_jwt_key_2025_safe_secure');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found for this token' });
    }
    next();
  } catch (error) {
    console.error('Auth API Middleware Error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

// Protect EJS View rendering routes (redirect to /login if unauthorized)
export const protectView = async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rbsk_super_secret_jwt_key_2025_safe_secure');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.clearCookie('token');
      return res.redirect('/login');
    }
    res.locals.user = req.user;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Redirect to /dashboard if already logged in (for /login and /register pages)
export const redirectIfLoggedIn = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rbsk_super_secret_jwt_key_2025_safe_secure');
    const user = await User.findById(decoded.id);
    if (user) {
      return res.redirect('/dashboard');
    }
    next();
  } catch (error) {
    next();
  }
};
