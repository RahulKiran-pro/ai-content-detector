require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { validateEnv } = require('./config/validateEnv');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { router: historyRoutes } = require('./routes/historyRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const flaggedRoutes = require('./routes/flaggedRoutes');

// Validate Environment Variables on Startup
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// CORS Configuration supporting process.env.CLIENT_URL
const clientUrl = process.env.CLIENT_URL || '*';
app.use(cors({
  origin: clientUrl === '*' ? '*' : [clientUrl, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TruthLens Backend API',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/detect', detectionRoutes);
app.use('/api/flagged', flaggedRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'An unexpected error occurred on the server.' });
});

app.listen(PORT, () => {
  console.log(`TruthLens AI Backend running on port ${PORT}`);
  console.log(`TRUTHSCAN_API_KEY status: ${process.env.TRUTHSCAN_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
});
