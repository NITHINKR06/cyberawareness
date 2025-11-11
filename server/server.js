import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { securityHeaders, apiRateLimit, securityLogger, preventInjection } from './middleware/security.js';
import { sanitizeInput } from './middleware/validation.js';
import { preventNoSQLInjection } from './middleware/nosqlInjection.js';
import { preventXSS, setCSPHeaders } from './middleware/xssProtection.js';
import { csrfProtectionMiddleware, csrfTokenMiddleware, enhancedCSRFProtection } from './middleware/csrfProtection.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware stack (applied first)
app.use(securityHeaders);
app.use(setCSPHeaders);
app.use(securityLogger);
app.use(preventInjection);
app.use(preventNoSQLInjection);
app.use(preventXSS());
app.use(sanitizeInput);
app.use(csrfTokenMiddleware);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.FRONTEND_URL,
  'https://cyberawareness-iota.vercel.app',
  'https://cyberawareness-iota.vercel.app/',
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any localhost port for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all origins in development, or if explicitly configured
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true);
    }
    
    // In production, log and allow (Vercel handles CORS via headers)
    console.log(`CORS: Allowing origin ${origin}`);
    callback(null, true);
  },
  credentials: true
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration with security
app.use(session({
  secret: process.env.SESSION_SECRET || (() => {
    throw new Error('SESSION_SECRET environment variable is required for security');
  })(),
  resave: false,
  saveUninitialized: false, // Changed to false for security
  name: 'sessionId', // Custom session name
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict' // CSRF protection
  }
}));

// Session tracking middleware
app.use((req, res, next) => {
  if (!req.session.sessionId) {
    req.session.sessionId = uuidv4();
  }
  next();
});

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/walrus_db';
const mongoDbName = process.env.MONGODB_DBNAME; // optional override

// MongoDB connection options optimized for serverless
const mongoOptions = {
  ...(mongoDbName ? { dbName: mongoDbName } : {}),
  // Serverless-optimized options
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Configure Mongoose buffering (Mongoose-specific, not MongoDB driver options)
mongoose.set('bufferCommands', false);
mongoose.set('bufferMaxEntries', 0);

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }

    await mongoose.connect(mongoUri, mongoOptions);
    const conn = mongoose.connection;
    console.log(`Connected to MongoDB: host=${conn.host} db=${conn.name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Don't throw in serverless - let it retry on next request
    if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
      // Only exit in non-serverless environments
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Connect to database
connectDB();

// Import routes
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/reports.js';
import analyzerRoutes from './routes/analyzer.js';
import userRoutes from './routes/user.js';
import scenarioRoutes from './routes/scenarios.js';
import ocrRoutes from './routes/ocr.js';
import configRoutes from './routes/config.js';
import communityRoutes from './routes/community.js';
import adminRoutes from './routes/admin.js';

// Apply rate limiting to API routes
app.use('/api', apiRateLimit);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analyzer', analyzerRoutes);
app.use('/api/user', userRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/config', configRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString() 
  });
});

// Export app for Vercel serverless functions
export default app;

// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} else {
  console.log('Server running in serverless mode');
}
