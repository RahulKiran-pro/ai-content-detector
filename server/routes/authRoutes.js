const express = require('express');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken, requireAuth } = require('../middleware/auth');
const { getIsConnected } = require('../config/db');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
      const statusCode = err.status || err.statusCode || 500;
      res.status(statusCode).json({ error: err.message || 'Authentication error', message: err.message || 'Authentication error' });
    });
  };
}

// In-memory fallback user store if MongoDB is offline
const inMemoryUsers = new Map();

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Registration Handler
 * Hashes password exactly once, saves user, generates JWT, returns success, user, token.
 */
async function handleRegisterUser(req, res) {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.', message: 'Please provide email and password.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.', message: 'Password must be at least 6 characters long.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userName = (name || email.split('@')[0]).trim();

  if (getIsConnected()) {
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, 'i') }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.', message: 'An account with this email already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: userName,
      email: normalizedEmail,
      passwordHash,
      authProvider: 'local',
      role: 'user'
    });

    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
      message: 'Registration successful!'
    });
  } else {
    // In-memory fallback
    if (inMemoryUsers.has(normalizedEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists.', message: 'An account with this email already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const mockUser = {
      _id: `user_${Date.now()}`,
      name: userName,
      email: normalizedEmail,
      passwordHash,
      authProvider: 'local',
      avatarUrl: '',
      role: 'user'
    };
    inMemoryUsers.set(normalizedEmail, mockUser);

    const token = generateToken(mockUser);
    return res.status(201).json({
      success: true,
      token,
      user: { id: mockUser._id, name: mockUser.name, email: mockUser.email, role: 'user' },
      message: 'Registration successful!'
    });
  }
}

/**
 * POST /api/auth/register & POST /api/auth/signup
 */
router.post('/register', authLimiter, asyncHandler(handleRegisterUser));
router.post('/signup', authLimiter, asyncHandler(handleRegisterUser));

/**
 * POST /api/auth/login
 * Performs case-insensitive email lookup, compares password via bcrypt, returns user + token.
 */
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.', message: 'Please provide email and password.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const invalidMsg = 'Incorrect email or password.';

  if (getIsConnected()) {
    let user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +password');
    if (!user) {
      user = await User.findOne({ email: new RegExp(`^${escapeRegExp(normalizedEmail)}$`, 'i') }).select('+passwordHash +password');
    }

    if (!user) {
      const mockUser = inMemoryUsers.get(normalizedEmail);
      if (mockUser) {
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(password, mockUser.passwordHash);
        if (isMatch) {
          const token = generateToken(mockUser);
          return res.json({
            success: true,
            token,
            user: { id: mockUser._id, name: mockUser.name, email: mockUser.email, role: 'user' }
          });
        }
      }
      return res.status(401).json({ error: invalidMsg, message: invalidMsg });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: invalidMsg, message: invalidMsg });
    }

    const token = generateToken(user);
    return res.json({
      success: true,
      token,
      user: user.toJSON()
    });
  } else {
    // In-memory fallback
    const mockUser = inMemoryUsers.get(normalizedEmail);
    if (!mockUser) {
      return res.status(401).json({ error: invalidMsg, message: invalidMsg });
    }

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, mockUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: invalidMsg, message: invalidMsg });
    }

    const token = generateToken(mockUser);
    return res.json({
      success: true,
      token,
      user: { id: mockUser._id, name: mockUser.name, email: mockUser.email, role: 'user' }
    });
  }
}));

/**
 * POST /api/auth/google
 */
router.post('/google', asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: 'Missing Google ID token.', message: 'Missing Google ID token.' });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    payload = ticket.getPayload();
  } catch (err) {
    return res.status(401).json({ error: 'Failed to verify Google ID token.', message: 'Failed to verify Google ID token.' });
  }

  const { sub: googleId, email, name, picture: avatarUrl } = payload;
  const normalizedEmail = email.toLowerCase();

  if (getIsConnected()) {
    let user = await User.findOne({ $or: [{ googleId }, { email: normalizedEmail }] });

    if (user) {
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
      success: true,
      token,
      user: user.toJSON()
    });
  } else {
    let mockUser = inMemoryUsers.get(normalizedEmail);
    if (!mockUser) {
      mockUser = {
        _id: `google_${googleId}`,
        name: name || email.split('@')[0],
        email: normalizedEmail,
        googleId,
        authProvider: 'google',
        avatarUrl: avatarUrl || '',
        role: 'user'
      };
      inMemoryUsers.set(normalizedEmail, mockUser);
    }

    const token = generateToken(mockUser);
    return res.json({
      success: true,
      token,
      user: { id: mockUser._id, name: mockUser.name, email: mockUser.email, role: 'user' }
    });
  }
}));

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name || req.user.email.split('@')[0],
      email: req.user.email,
      authProvider: req.user.authProvider || 'local',
      avatarUrl: req.user.avatarUrl || '',
      role: req.user.role || 'user'
    }
  });
}));

module.exports = router;
