const crypto = require('crypto');

/**
 * Generates an anonymous voter/creator SHA-256 hash.
 * Combines client network/browser characteristics with server-side salt.
 */
const hashIdentifier = (req, res, next) => {
  const salt = process.env.FINGERPRINT_SALT || 'fallback-jamboard-dev-salt';

  // Extract client IP (handling reverse proxies like Cloudflare/Nginx/Vercel)
  const clientIp =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const userAgent = req.headers['user-agent'] || 'unknown-ua';
  const acceptLanguage = req.headers['accept-language'] || 'unknown-lang';
  
  // Optional client-generated persistent ID from localStorage/FingerprintJS
  const clientDeviceToken = req.headers['x-client-device-id'] || '';

  const rawFingerprint = `${clientIp}::${userAgent}::${acceptLanguage}::${clientDeviceToken}::${salt}`;

  const hash = crypto
    .createHash('sha256')
    .update(rawFingerprint)
    .digest('hex');

  // Attach voter hash to request object for downstream controllers
  req.voterHash = hash;
  next();
};

module.exports = hashIdentifier;