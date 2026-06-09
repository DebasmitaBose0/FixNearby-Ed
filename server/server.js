import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { validateEnv } from './config/envValidate.js';
import authRoutes from './routes/authRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

// Validate critical configuration environment variables
validateEnv();

const app = express();

// Security Middleware: Strict CSP headers and cross-origin resource protection
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com"],
        connectSrc: ["'self'", "http://localhost:5000", "https://api.fixnearby.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// CORS configuration — strict origin whitelist using Set for O(1) exact-match lookup.
// Using indexOf() is safe for string arrays but can be confusing to code reviewers;
// a Set makes the intent explicit and prevents any future partial-match bugs if the
// array is ever switched to a RegExp-based approach.
const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin header (mobile apps, server-to-server, curl).
      if (!origin) return callback(null, true);

      // Strict equality check: the incoming origin must be an exact member of
      // the whitelist.  Unlike indexOf(), this cannot be confused by crafted
      // origins such as "http://evil.com?bypass=http://localhost:5173".
      if (!allowedOrigins.has(origin)) {
        return callback(
          new Error('Not allowed by CORS policy'),
          false
        );
      }

      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// Serve uploaded images
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to Database
// TODO: Uncomment when ready to connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/search', searchRoutes);

// Protected test route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Access granted",
    user: req.user
  });
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'FixNearby API is running' });
});


// 404 handler for unknown API routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


