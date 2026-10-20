const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotifyController');

// Clean, unblocked public search route
router.get('/search', spotifyController.search);

module.exports = router;