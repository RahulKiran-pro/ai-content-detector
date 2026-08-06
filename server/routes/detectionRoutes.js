const express = require('express');
const multer = require('multer');
const path = require('path');
const truthscanService = require('../services/truthscanService');

const router = express.Router();

// Multer memory storage configurations with size limits
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB strict limit for PDF per TruthScan
}).single('file');

const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
}).single('file');

const uploadVideo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for Video
}).single('file');

// Helper to extract file extension
function getExtension(filename) {
  if (!filename) return '';
  return path.extname(filename).toLowerCase();
}

/**
 * Resolves the public object-storage URL to pass to TruthScan /detect endpoints
 */
function resolveFileUrl(presignData, defaultDomain) {
  if (presignData.presigned_url && presignData.presigned_url.includes('/uploads/')) {
    return presignData.presigned_url.split('?')[0];
  }
  if (presignData.url && typeof presignData.url === 'string' && presignData.url.startsWith('http')) {
    return presignData.url;
  }
  if (presignData.file_path) {
    const cleanPath = presignData.file_path.replace(/^\//, '');
    return `${defaultDomain}/${cleanPath}`;
  }
  return presignData.presigned_url ? presignData.presigned_url.split('?')[0] : '';
}

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
 * POST /api/detect/text
 * Body: { text: "string" }
 */
router.post('/text', asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Please provide valid non-empty text for analysis.' });
  }

  const result = await truthscanService.text.detect(text.trim());
  const id = result.id || result.task_id || (result.data && result.data.id);
  
  if (!id && result.status !== 'done') {
    return res.status(500).json({ error: result.error || 'Failed to obtain task ID from TruthScan' });
  }

  res.json({ id: id || 'instant', ...result });
}));

/**
 * POST /api/detect/image
 * Multipart: file
 */
router.post('/image', (req, res, next) => {
  uploadImage(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image file size exceeds the 10MB limit.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an image file.' });
  }

  const ext = getExtension(req.file.originalname);
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.heif', '.avif', '.tiff', '.tif'];
  if (!allowed.includes(ext)) {
    return res.status(400).json({ error: `Invalid image extension '${ext}'. Allowed formats: ${allowed.join(', ')}` });
  }

  // 1. Presign
  const presignData = await truthscanService.image.presign(req.file.originalname);
  const presignedUrl = presignData.presigned_url || presignData.upload_url || presignData.url;
  const fileUrl = resolveFileUrl(presignData, 'https://ai-image-detector-prod.nyc3.digitaloceanspaces.com');

  if (!presignedUrl) {
    return res.status(500).json({ error: 'Failed to retrieve presigned upload URL from TruthScan' });
  }

  // 2. Upload raw buffer to S3 presigned URL with exact MIME type
  const mimeType = truthscanService.getStrictContentType(req.file.originalname, req.file.mimetype || 'image/jpeg');
  await truthscanService.image.upload(presignedUrl, req.file.buffer, mimeType);

  // 3. Submit for detection
  const detectData = await truthscanService.image.detect(fileUrl);
  const id = detectData.id || detectData.task_id || (detectData.data && detectData.data.id);

  res.json({ id: id || 'instant', ...detectData });
}));

/**
 * POST /api/detect/pdf
 * Multipart: file
 */
router.post('/pdf', (req, res, next) => {
  uploadPdf(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'PDF file size exceeds the strict 2MB limit for TruthScan.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF document.' });
  }

  const ext = getExtension(req.file.originalname);
  if (ext !== '.pdf') {
    return res.status(400).json({ error: 'Invalid document format. Only .pdf files are supported.' });
  }

  if (req.file.size > 2 * 1024 * 1024) {
    return res.status(400).json({ error: 'PDF file size exceeds TruthScan 2MB limit.' });
  }

  // 1. Presign
  const presignData = await truthscanService.pdf.presign(req.file.originalname);
  const presignedUrl = presignData.presigned_url || presignData.upload_url || presignData.url;
  const fileUrl = resolveFileUrl(presignData, 'https://ai-detector-prod.nyc3.digitaloceanspaces.com/uploads');

  if (!presignedUrl) {
    return res.status(500).json({ error: 'Failed to obtain PDF presigned upload URL from TruthScan' });
  }

  // 2. Upload to S3
  await truthscanService.pdf.upload(presignedUrl, req.file.buffer, 'application/pdf');

  // 3. Submit PDF detection
  const detectData = await truthscanService.pdf.detect(fileUrl);
  const id = detectData.id || detectData.task_id || (detectData.data && detectData.data.id);

  res.json({ id: id || 'instant', ...detectData });
}));

/**
 * POST /api/detect/audio
 * Multipart: file, optional body parameter: analyzeUpToSeconds
 */
router.post('/audio', (req, res, next) => {
  uploadAudio(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Audio file size exceeds 25MB limit.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an audio file.' });
  }

  const ext = getExtension(req.file.originalname);
  const allowed = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg'];
  if (!allowed.includes(ext)) {
    return res.status(400).json({ error: `Invalid audio format '${ext}'. Supported formats: ${allowed.join(', ')}` });
  }

  const { analyzeUpToSeconds } = req.body;

  // 1. Presign
  const presignData = await truthscanService.audio.presign(req.file.originalname);
  const presignedUrl = presignData.presigned_url || presignData.upload_url || presignData.url;
  const filePath = presignData.file_path || presignData.url || presignedUrl.split('?')[0];

  if (!presignedUrl) {
    return res.status(500).json({ error: 'Failed to obtain audio presigned URL from TruthScan' });
  }

  // 2. Upload with strict MIME type
  const audioMime = truthscanService.getStrictContentType(req.file.originalname, req.file.mimetype || 'audio/mpeg');
  await truthscanService.audio.upload(presignedUrl, req.file.buffer, audioMime);

  // 3. Detect (TruthScan Audio API expects presignData.file_path in url parameter)
  const detectData = await truthscanService.audio.detect(filePath, analyzeUpToSeconds);
  const id = detectData.id || detectData.task_id || (detectData.data && detectData.data.id);

  res.json({ id: id || 'instant', ...detectData });
}));

/**
 * POST /api/detect/video
 * Multipart file upload (up to 100MB) OR JSON body { url }
 */
router.post('/video', (req, res, next) => {
  uploadVideo(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Video file size exceeds the 100MB limit.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, asyncHandler(async (req, res) => {
  // Option A: Direct File Upload
  if (req.file) {
    const ext = getExtension(req.file.originalname);
    const allowed = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    if (!allowed.includes(ext)) {
      return res.status(400).json({ error: `Invalid video format '${ext}'. Allowed formats: ${allowed.join(', ')}` });
    }

    const detectData = await truthscanService.video.detectFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    const id = detectData.id || detectData.task_id || (detectData.data && detectData.data.id);
    return res.json({ id: id || 'instant', ...detectData });
  }

  // Option B: Video URL
  const { url } = req.body;
  if (url && typeof url === 'string' && url.startsWith('http')) {
    const detectData = await truthscanService.video.detectUrl(url.trim());
    const id = detectData.id || detectData.task_id || (detectData.data && detectData.data.id);
    return res.json({ id: id || 'instant', ...detectData });
  }

  return res.status(400).json({ error: 'Please upload a video file (up to 100MB) or provide a valid video URL.' });
}));

const { optionalAuth } = require('../middleware/auth');
const { recordDetectionHistory } = require('./historyRoutes');

/**
 * GET /api/detect/status/:type/:id
 * Query task status for specific type
 */
router.get('/status/:type/:id', optionalAuth, asyncHandler(async (req, res) => {
  const { type, id } = req.params;

  if (!id || id === 'undefined' || id === 'null') {
    return res.status(400).json({ error: 'Invalid task ID parameter.' });
  }

  const serviceMap = {
    text: truthscanService.text,
    image: truthscanService.image,
    pdf: truthscanService.pdf,
    audio: truthscanService.audio,
    video: truthscanService.video
  };

  const service = serviceMap[type.toLowerCase()];
  if (!service) {
    return res.status(400).json({ error: `Unknown detection type '${type}'. Supported types: text, image, pdf, audio, video.` });
  }

  const statusData = await service.query(id);

  // Record history if user is authenticated and job is finished
  if (req.user && (statusData.status === 'done' || typeof statusData.result === 'number')) {
    const verdict = statusData.result_details?.final_result || statusData.label || (statusData.result >= 45 ? 'AI Generated' : 'Human');
    recordDetectionHistory(req.user._id || req.user.id, {
      contentType: type.toLowerCase(),
      inputSummary: `${type.toUpperCase()} Detection Scan`,
      truthscanId: id,
      status: statusData.status || 'done',
      result: statusData.result_details || statusData.result,
      verdict
    }).catch(err => console.warn('History record error:', err));
  }

  res.json(statusData);
}));

/**
 * GET /api/detect/credits/:type
 * Check remaining credits for a service type
 */
router.get('/credits/:type', asyncHandler(async (req, res) => {
  const { type } = req.params;
  const creditsData = await truthscanService.credits.check(type.toLowerCase());
  res.json(creditsData);
}));

module.exports = router;
