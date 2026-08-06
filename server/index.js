require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { router: historyRoutes } = require('./routes/historyRoutes');
const detectionRoutes = require('./routes/detectionRoutes');
const flaggedRoutes = require('./routes/flaggedRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'TruthLens Backend API' });
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
  console.log(`TruthLens AI Detection Backend running on http://localhost:${PORT}`);
  console.log(`TRUTHSCAN_API_KEY status: ${process.env.TRUTHSCAN_API_KEY ? 'Configured' : 'NOT CONFIGURED'}`);
});
