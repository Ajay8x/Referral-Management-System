import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });

// Warm-up database connection
connectDB().catch((err) => {
  console.warn('⚠️ MongoDB initial connection attempt warning:', err.message);
});

const app = express();

// Allowed origins
const allowedOrigins = [
  'https://referral-management-system-ten.vercel.app',
  'http://localhost:5000',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL
].filter(Boolean);

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(o => o.replace(/\/$/, '') === cleanOrigin) || cleanOrigin.endsWith('.vercel.app');

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads if directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
try {
  app.use('/uploads', express.static(uploadDir));
} catch (e) {
  // Ignore static folder errors in serverless
}

// Root status route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Shree RBSK Referral Management Backend API is running',
    version: '1.0.0',
    health: '/api/health'
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongoConfigured: Boolean(process.env.MONGO_URI)
  });
});


// Middleware: Ensure database is connected before processing API data routes
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api')) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (dbError) {
    console.error('❌ Database connection failed during request:', dbError.message);
    return res.status(503).json({
      success: false,
      message: `Database Connection Failed: ${dbError.message}. Make sure MONGO_URI is set in Vercel Environment Variables and IP 0.0.0.0/0 is whitelisted in MongoDB Atlas.`
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
