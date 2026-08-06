const express = require('express');
const DetectionHistory = require('../models/DetectionHistory');
const { requireAuth } = require('../middleware/auth');
const { getIsConnected } = require('../config/db');

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
      const statusCode = err.status || err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Error processing request' });
    });
  };
}

// In-memory fallback history store if DB is offline
const inMemoryHistory = [];

/**
 * Helper to record scan in history (used by detectionRoutes)
 */
async function recordDetectionHistory(userId, scanData) {
  if (!userId) return null;

  const { contentType, inputSummary, truthscanId, status, result, verdict } = scanData;

  if (getIsConnected()) {
    try {
      if (truthscanId) {
        // Update existing pending doc if present
        const existing = await DetectionHistory.findOne({ user: userId, truthscanId });
        if (existing) {
          existing.status = status || existing.status;
          if (result !== undefined) existing.result = result;
          if (verdict) existing.verdict = verdict;
          await existing.save();
          return existing;
        }
      }

      return await DetectionHistory.create({
        user: userId,
        contentType,
        inputSummary: inputSummary || 'Detection Scan',
        truthscanId,
        status: status || 'pending',
        result,
        verdict: verdict || 'Unverified'
      });
    } catch (e) {
      console.warn('Failed to record detection history in MongoDB:', e.message);
    }
  }

  // Fallback in-memory history record
  const mockDoc = {
    _id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user: userId.toString(),
    contentType,
    inputSummary: inputSummary || 'Detection Scan',
    truthscanId,
    status: status || 'done',
    result,
    verdict: verdict || 'Unverified',
    createdAt: new Date()
  };
  inMemoryHistory.unshift(mockDoc);
  return mockDoc;
}

/**
 * GET /api/history
 * Fetch authenticated user's recent detection history
 */
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  if (getIsConnected()) {
    const total = await DetectionHistory.countDocuments({ user: userId });
    const history = await DetectionHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      history,
      page,
      pages: Math.ceil(total / limit) || 1,
      total
    });
  } else {
    // In-memory fallback filtering by user ID
    const userScans = inMemoryHistory.filter(h => h.user === userId.toString());
    return res.json({
      history: userScans.slice((page - 1) * limit, page * limit),
      page: 1,
      pages: 1,
      total: userScans.length
    });
  }
}));

/**
 * GET /api/history/:id
 * Fetch single detection detail (with resource ownership check)
 */
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req.user._id || req.user.id).toString();
  const scanId = req.params.id;

  if (getIsConnected()) {
    const doc = await DetectionHistory.findById(scanId);
    if (!doc) {
      return res.status(404).json({ error: 'Detection record not found.' });
    }

    // Security check: resource.user.toString() === req.user._id.toString()
    if (doc.user.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only view your own detection history.' });
    }

    return res.json(doc);
  } else {
    const doc = inMemoryHistory.find(h => h._id === scanId);
    if (!doc) {
      return res.status(404).json({ error: 'Detection record not found.' });
    }
    if (doc.user !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only view your own detection history.' });
    }
    return res.json(doc);
  }
}));

module.exports = {
  router,
  recordDetectionHistory
};
