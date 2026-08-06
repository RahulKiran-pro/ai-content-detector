const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_change_in_production';

/**
 * Sign JWT token for user
 */
function generateToken(user) {
  const payload = {
    userId: user._id ? user._id.toString() : user.id,
    email: user.email
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * requireAuth Middleware
 * Protects endpoints — requires valid JWT in Authorization: Bearer <token>
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attempt database lookup if connected
    try {
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (e) {
      // Fallback if DB is unavailable
    }

    // Attach decoded token payload if user object not found in DB
    req.user = {
      _id: decoded.userId,
      id: decoded.userId,
      email: decoded.email
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token. Please log in again.' });
  }
}

/**
 * optionalAuth Middleware
 * Attaches req.user if token is present, but allows request to proceed for guest users
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    try {
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (e) {}

    req.user = {
      _id: decoded.userId,
      id: decoded.userId,
      email: decoded.email
    };
  } catch (err) {
    req.user = null;
  }
  next();
}

module.exports = {
  generateToken,
  requireAuth,
  optionalAuth
};
