/**
 * Global API Error Boundary Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // MySQL unique constraint duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Duplicate record error. The resource already exists.',
    });
  }

  // Axios/Spotify API errors
  if (err.response && err.response.data) {
    const status = err.response.status || 502;
    return res.status(status).json({
      error: 'Upstream Spotify API Error',
      details: err.response.data.error || err.response.data,
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;