const express = require('express');
const router = express.Router();

const boardRoutes = require('./boardRoutes');
const postRoutes = require('./postRoutes');
const voteRoutes = require('./voteRoutes');
const spotifyRoutes = require('./spotifyRoutes');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

router.use('/boards', boardRoutes);
router.use('/posts', postRoutes);
router.use('/posts', voteRoutes);
router.use('/spotify', spotifyRoutes);

module.exports = router;