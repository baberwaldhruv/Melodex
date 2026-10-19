const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for track submissions:
 * Max 10 submissions per 15 minutes per IP.
 */
const postSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many tracks submitted from this connection. Please wait 15 minutes.',
  },
});

/**
 * Rate limiter for voting:
 * Max 60 votes per 1 minute per IP.
 */
const voteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Voting too fast. Please slow down.',
  },
});

/**
 * Rate limiter for Spotify search autocomplete:
 * Max 40 search queries per minute.
 */
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Search rate limit exceeded. Please wait a moment.',
  },
});

module.exports = {
  postSubmissionLimiter,
  voteLimiter,
  searchLimiter,
};