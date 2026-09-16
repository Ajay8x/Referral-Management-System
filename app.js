import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import viewRoutes from './routes/viewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Warm-up database connection
connectDB().catch((err) => {
  console.warn('⚠️ MongoDB initial connection attempt warning:', err.message);
});

const app = express();

// Set View Engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (public and uploads)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware: Pass user from locals or token info if available
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Health check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongoConfigured: Boolean(process.env.MONGO_URI)
  });
});

// Database connection checker middleware for API and dynamic pages
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (dbError) {
    console.error('❌ Database connection error:', dbError.message);
    if (req.path.startsWith('/api')) {
      return res.status(503).json({
        success: false,
        message: `Database Connection Failed: ${dbError.message}`
      });
    }
    return res.status(503).render('error', {
      title: 'Database Connection Error',
      message: 'Unable to connect to the database. Please check your network and MongoDB connection.'
    });
  }
});

// Page View Routes (EJS SSR)
app.use('/', viewRoutes);

// API REST Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/upload', uploadRoutes);

// 404 Handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
  res.status(404).render('error', {
    title: '404 - Page Not Found',
    message: 'The page you are looking for does not exist or has been moved.'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err.message);
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  }
  res.status(err.status || 500).render('error', {
    title: 'Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

export default app;
