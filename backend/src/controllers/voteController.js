const supabase = require('../config/db');

/**
 * Atomic Vote Handler via Supabase RPC
 * POST /api/posts/:postId/vote
 * Body: { voteType: 1 | -1 | 0 }
 */
const castVote = async (req, res, next) => {
  const { postId } = req.params;
  const { voteType } = req.body;
  const voterHash = req.voterHash;

  const parsedVoteType = parseInt(voteType, 10);
  if (![-1, 0, 1].includes(parsedVoteType)) {
    return res.status(400).json({ error: 'Invalid voteType. Must be 1, -1, or 0.' });
  }

  try {
    // Invoke the PostgreSQL atomic function created in the Supabase SQL editor
    const { data, error } = await supabase.rpc('cast_vote_atomic', {
      p_post_id: postId,
      p_voter_hash: voterHash,
      p_vote_type: parsedVoteType,
    });

    if (error) {
      if (error.message.includes('Post not found')) {
        return res.status(404).json({ error: 'Post not found.' });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      postId: data.postId,
      score: data.score,
      upvotes: data.upvotes,
      downvotes: data.downvotes,
      userVote: data.userVote,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  castVote,
};