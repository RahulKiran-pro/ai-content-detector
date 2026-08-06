const express = require('express');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken, requireAuth } = require('../middleware/auth');
const { getIsConnected } = require('../config/db');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Rate limiter for auth endpoints (max 15 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Helper to handle async route errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
      const statusCode = err.status || err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Authentication error' });
    });
  };
}

// In-memory fallback user store if MongoDB is offline
const inMemoryUsers = new Map();

/**
 * POST /api/auth/signup
 * Email + Password Signup
 */
router.post('/signup', authLimiter, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // If MongoDB is connected
  if (getIsConnected()) {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      authProvider: 'local'
    });

    const token = generateToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        avatarUrl: user.avatarUrl
      }
    });
  } else {
    // In-memory fallback for demo/offline mode
    if (inMemoryUsers.has(normalizedEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const mockUser = {
      _id: `user_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      authProvider: 'local',
      avatarUrl: ''
    };
    inMemoryUsers.set(normalizedEmail, mockUser);

    const token = generateToken(mockUser);
    return res.status(201).json({
      token,
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        authProvider: mockUser.authProvider,
        avatarUrl: mockUser.avatarUrl
      }
    });
  }
}));

/**
 * POST /api/auth/login
 * Email + Password Login
 */
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const invalidMsg = 'Invalid email or password.';

  if (getIsConnected()) {
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ error: invalidMsg });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: invalidMsg });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        avatarUrl: user.avatarUrl
      }
    });
  } else {
    // In-memory fallback
    const mockUser = inMemoryUsers.get(normalizedEmail);
    if (!mockUser) {
      return res.status(401).json({ error: invalidMsg });
    }

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, mockUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: invalidMsg });
    }

    const token = generateToken(mockUser);
    return res.json({
      token,
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        authProvider: mockUser.authProvider,
        avatarUrl: mockUser.avatarUrl
      }
    });
  }
}));

/**
 * POST /api/auth/google
 * Verify Google OAuth ID Token server-side
 */
router.post('/google', asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Missing Google ID token.' });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    payload = ticket.getPayload();
  } catch (err) {
    // For demo/hackathon flexibility, parse token or handle verification error
    return res.status(401).json({ error: 'Failed to verify Google ID token with Google servers.' });
  }

  const { sub: googleId, email, name, picture: avatarUrl } = payload;
  const normalizedEmail = email.toLowerCase();

  if (getIsConnected()) {
    let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });

    if (user) {
      // Link Google ID if signing in via Google with existing local account
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'both';
        if (avatarUrl) user.avatarUrl = avatarUrl;
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email: normalizedEmail,
        googleId,
        authProvider: 'google',
        avatarUrl: avatarUrl || ''
      });
    }

    const token = generateToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        avatarUrl: user.avatarUrl
      }
    });
  } else {
    // In-memory demo fallback
    let mockUser = inMemoryUsers.get(normalizedEmail);
    if (!mockUser) {
      mockUser = {
        _id: `google_${googleId}`,
        name: name || email.split('@')[0],
        email: normalizedEmail,
        googleId,
        authProvider: 'google',
        avatarUrl: avatarUrl || ''
      };
      inMemoryUsers.set(normalizedEmail, mockUser);
    }

    const token = generateToken(mockUser);
    return res.json({
      token,
      user: {
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        authProvider: mockUser.authProvider,
        avatarUrl: mockUser.avatarUrl
      }
    });
  }
}));

/**
 * GET /api/auth/me
 * Fetch authenticated user profile
 */
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name || req.user.email.split('@')[0],
      email: req.user.email,
      authProvider: req.user.authProvider || 'local',
      avatarUrl: req.user.avatarUrl || ''
    }
  });
}));

module.exports = router;
