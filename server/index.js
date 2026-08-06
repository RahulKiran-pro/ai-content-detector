require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateEnv } = require('./config/validateEnv');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { router: historyRoutes } = require('./routes/historyRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const flaggedRoutes = require('./routes/flaggedRoutes');

// Validate Environment Variables on Startup (Non-blocking in dev/demo)
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Production-ready Dynamic CORS Origin Handler
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000'
];

if (process.env.CLIENT_URL) {
  const cleanClientUrl = process.env.CLIENT_URL.trim().replace(/\/$/, '');
  if (!allowedOrigins.includes(cleanClientUrl)) {
    allowedOrigins.push(cleanClientUrl);
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    // Allow exact matches in allowedOrigins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel production & preview deployments (*.vercel.app)
    if (/\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Fallback: reflect origin in development or when CLIENT_URL is wildcard '*'
    if (process.env.NODE_ENV !== 'production' || process.env.CLIENT_URL === '*') {
      return callback(null, true);
    }

    callback(new Error(`CORS policy rejection for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

// Enable Pre-Flight OPTIONS Handling Globally
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint for Render / Deployment monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TruthLens Backend API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root API Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TruthLens AI Enterprise Detection API Service Running',
    health: '/health',
    documentation: 'https://github.com/RahulKiran-pro/ai-content-detector'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/detect', detectionRoutes);
app.use('/api/flagged', flaggedRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack || err.message || err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred on the server.',
    success: false
  });
});

// Bind to 0.0.0.0 for Render / Container Environment Compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[TruthLens Backend] Server running on http://0.0.0.0:${PORT} (PORT=${PORT})`);
  console.log(`[TruthLens Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
});
