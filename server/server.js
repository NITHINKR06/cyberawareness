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

// Check if we're in a cloud environment (detect early for logging)
const isServerless = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const isRender = process.env.RENDER === 'true' || process.env.RENDER_SERVICE_NAME;
const isProduction = process.env.NODE_ENV === 'production';

// Log environment information (helpful for debugging)
console.log('🚀 Starting server...');
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Port: ${PORT}`);
console.log(`   Platform: ${isRender ? 'Render' : isServerless ? 'Vercel/Serverless' : 'Local/Other'}`);
if (isRender) {
  console.log(`   Render Service: ${process.env.RENDER_SERVICE_NAME || 'unknown'}`);
  console.log(`   Render Region: ${process.env.RENDER_REGION || 'unknown'}`);
}
console.log(`   MongoDB URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Not set (using default)'}`);
if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('localhost')) {
  // Show first and last part of connection string for verification (hide credentials)
  const uriParts = process.env.MONGODB_URI.split('@');
  if (uriParts.length > 1) {
    console.log(`   MongoDB Cluster: ${uriParts[1].split('/')[0]}`);
  }
}

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
  'https://cyberawareness-iota.vercel.app', // Production frontend
].filter(Boolean);

console.log(`   Allowed CORS Origins: ${allowedOrigins.join(', ')}`);

app.use(cors({
  origin: function (origin, callback) {
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

    // In production, be strict about CORS
    if (isProduction && !isServerless) {
      console.warn(`⚠️  CORS: Blocked origin ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }

    // Fallback: log and allow (for serverless environments)
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

// Validate MongoDB URI in production or Render environments
if ((process.env.NODE_ENV === 'production' || isRender) && !isServerless) {
  if (!process.env.MONGODB_URI || mongoUri === 'mongodb://localhost:27017/walrus_db') {
    console.error('❌ ERROR: MONGODB_URI environment variable is required!');
    console.error('   Please set MONGODB_URI in your environment variables.');
    if (isRender) {
      console.error('   For Render: Go to your service → Environment → Add MONGODB_URI');
      console.error('   Example: mongodb+srv://username:password@cluster.mongodb.net/dbname');
    }
    // Don't exit immediately on Render - let the connection attempt provide better error messages
  }
}

// MongoDB connection options optimized for serverless
const mongoOptions = {
  ...(mongoDbName ? { dbName: mongoDbName } : {}),
  // Serverless-optimized options
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 10000, // Increased to 10 seconds for better reliability
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // Wait 10 seconds before timing out
  retryWrites: true, // Retry writes if they fail due to transient network errors
};

// Mongoose buffering is handled automatically in Mongoose 8.x
// No need to set bufferCommands or bufferMaxEntries

// Connect to MongoDB with retry logic
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    // Validate MongoDB URI format (check for Render or production)
    const isProductionLike = process.env.NODE_ENV === 'production' || isRender;
    if (isProductionLike && (!process.env.MONGODB_URI || mongoUri.includes('localhost'))) {
      const errorMsg = '❌ ERROR: MONGODB_URI is not properly configured!';
      console.error(errorMsg);
      if (isRender) {
        console.error('   Please configure MONGODB_URI in Render dashboard:');
        console.error('   1. Go to your Render service dashboard');
        console.error('   2. Navigate to the "Environment" tab');
        console.error('   3. Click "Add Environment Variable"');
        console.error('   4. Key: MONGODB_URI');
        console.error('   5. Value: Your MongoDB Atlas connection string');
        console.error('   Example: mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority');
        console.error('');
        console.error('   📖 See RENDER_DEPLOYMENT.md for detailed setup instructions');
      } else {
        console.error('   Please set MONGODB_URI in your environment variables');
      }
      // Don't exit immediately - let connection attempt show the actual error
      if (!isRender && process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      throw new Error('MONGODB_URI not configured');
    }

    console.log(`🔌 Attempting to connect to MongoDB... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
    await mongoose.connect(mongoUri, mongoOptions);
    const conn = mongoose.connection;
    console.log(`✅ Connected to MongoDB: host=${conn.host} db=${conn.name}`);
    retryCount = 0; // Reset retry count on successful connection
  } catch (err) {
    retryCount++;
    console.error(`❌ MongoDB connection error (attempt ${retryCount}/${MAX_RETRIES}):`, err.message);

    // Provide helpful error messages
    if (err.message.includes('authentication failed') || err.code === 8000) {
      console.error('   💡 Authentication failed. Please check:');
      console.error('      1. MongoDB username and password are correct');
      console.error('      2. Password is URL-encoded (replace special chars: @ → %40, : → %3A, / → %2F, etc.)');
      console.error('      3. Database user has proper permissions (at least read/write access)');
      console.error('      4. IP whitelist in MongoDB Atlas includes Render IPs (or 0.0.0.0/0 for testing)');
      console.error('      5. Connection string format is correct:');
      console.error('         mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority');
      console.error('');
      console.error('   🔐 Common issue: If your password contains special characters, URL-encode them:');
      console.error('      Example: If password is "p@ss:w0rd", use "p%40ss%3Aw0rd"');
      console.error('      Online encoder: https://www.urlencoder.org/');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('   💡 DNS resolution failed. Please check:');
      console.error('      - MongoDB cluster URL/hostname is correct');
      console.error('      - Network connectivity is available');
      console.error('      - Cluster is not paused in MongoDB Atlas');
    } else if (err.message.includes('MONGODB_URI not configured')) {
      // Already handled above, but ensure we don't retry
      return;
    }

    // Retry logic for non-serverless environments
    if (retryCount < MAX_RETRIES && !isServerless) {
      console.log(`   ⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      setTimeout(() => {
        connectDB();
      }, RETRY_DELAY);
    } else if (isServerless) {
      // Don't throw in serverless - let it retry on next request
      console.log('   ℹ️  Serverless environment: Will retry on next request');
    } else {
      // Exit after max retries in non-serverless environments
      console.error(`   ❌ Failed to connect after ${MAX_RETRIES} attempts. Exiting...`);
      if (!isRender) {
        process.exit(1);
      }
    }
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error event:', err.message);
  if (err.message.includes('authentication failed') || err.code === 8000) {
    console.error('   💡 Check your MongoDB credentials and IP whitelist settings');
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
  // Attempt to reconnect if not in serverless mode
  if (!isServerless && retryCount < MAX_RETRIES) {
    console.log('   Attempting to reconnect...');
    setTimeout(() => {
      connectDB();
    }, RETRY_DELAY);
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
  retryCount = 0;
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

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  // Close MongoDB connection
  mongoose.connection.close(false, () => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  if (isProduction) {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  if (isProduction) {
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    if (isProduction) {
      console.log('   🔒 Production mode: Enhanced security enabled');
    }
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', error);
      process.exit(1);
    }
  });
} else {
  console.log('✅ Server running in serverless mode');
}
