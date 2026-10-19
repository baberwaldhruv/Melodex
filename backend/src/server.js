const app = require('./app');
const pool = require('./config/db');
const { startSyncJob } = require('./services/syncService');

const PORT = parseInt(process.env.PORT, 10) || 5500;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`JamBoard Backend running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`HTTP Server listening on port: ${PORT}`);
  console.log(`Endpoint Base: http://localhost:${PORT}/api`);
  console.log(`===============================================`);

  // Start periodic Spotify playlist synchronization worker (polls every 30 seconds)
  startSyncJob(30000);
});

// Graceful process termination
const handleGracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down HTTP server gracefully...`);

  server.close(async () => {
    console.log('HTTP server closed.');

    try {
      console.log('Closing MySQL connection pool...');
      await pool.end();
      console.log('MySQL pool closed cleanly. Process exiting.');
      process.exit(0);
    } catch (err) {
      console.error('Error while closing MySQL pool:', err.message);
      process.exit(1);
    }
  });

  // Force close after 10s timeout
  setTimeout(() => {
    console.error('Forcefully terminating process after shutdown timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});