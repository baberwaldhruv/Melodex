const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');
const { searchLimiter } = require('../middlewares/rateLimiter');

// Track autocomplete proxy
router.get('/search', searchLimiter, spotifyController.search);

// Host OAuth flow endpoints
router.get('/login', spotifyController.initiateOAuth);
router.get('/callback', spotifyController.handleOAuthCallback);

module.exports = router;