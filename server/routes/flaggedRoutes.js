const express = require('express');
const flaggedContentService = require('../services/flaggedContentService');

const router = express.Router();

/**
 * Express error handler wrapper for async route handlers
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
      const statusCode = err.status || err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Internal server error' });
    });
  };
}

/**
 * POST /api/flagged/report
 * Accepts: { detectionData, contentType }
 * Returns: Verification Report Object
 */
router.post('/report', asyncHandler(async (req, res) => {
  const { detectionData, contentType } = req.body;
  if (!detectionData) {
    return res.status(400).json({ error: 'Please provide detection data to generate report.' });
  }

  const report = flaggedContentService.generateVerificationReport(detectionData, contentType || 'Text');
  res.json(report);
}));

/**
 * POST /api/flagged/submit-report
 * Accepts: { verificationId, reason, comments }
 * Submits user content report for moderation
 */
router.post('/submit-report', asyncHandler(async (req, res) => {
  const { verificationId, reason, comments } = req.body;
  if (!verificationId) {
    return res.status(400).json({ error: 'Missing verification ID for content report.' });
  }

  console.log(`[Content Report Submitted] ID: ${verificationId} | Reason: ${reason} | Comments: ${comments}`);

  res.json({
    status: 'success',
    message: `Report for ${verificationId} logged successfully. Thank you for contributing to content authenticity.`,
    ticketId: `TICKET-${Math.floor(100000 + Math.random() * 900000)}`
  });
}));

module.exports = router;
