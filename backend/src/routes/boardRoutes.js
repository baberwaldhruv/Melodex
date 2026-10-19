const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const postController = require('../controllers/postController');
const hashIdentifier = require('../middlewares/hashIdentifier');
const { postSubmissionLimiter } = require('../middlewares/rateLimiter');

// Board metadata and sidebar stats
router.get('/:identifier', boardController.getBoard);
router.post('/', boardController.createBoard);

// Feed and track submissions for a specific board
router.get('/:boardId/posts', hashIdentifier, postController.getFeed);
router.post(
  '/:boardId/posts',
  postSubmissionLimiter,
  hashIdentifier,
  postController.createPost
);

module.exports = router;