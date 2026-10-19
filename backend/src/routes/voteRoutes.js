const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const hashIdentifier = require('../middlewares/hashIdentifier');
const { voteLimiter } = require('../middlewares/rateLimiter');

// Cast, flip, or cancel anonymous vote
router.post(
  '/:postId/vote',
  voteLimiter,
  hashIdentifier,
  voteController.castVote
);

module.exports = router;