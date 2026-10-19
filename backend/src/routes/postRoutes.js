const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Retrieve a single post by ID
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ? LIMIT 1', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    return res.status(200).json({ post: rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;