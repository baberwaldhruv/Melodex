const supabase = require('../config/db');
const { calculateHotScore } = require('../services/rankingService');

/**
 * Create a new track post on a board
 * POST /api/boards/:boardId/posts
 */
const createPost = async (req, res, next) => {
  const { boardId } = req.params;
  const {
    spotify_track_id,
    track_name,
    artist_name,
    album_name,
    album_art_url,
    preview_url,
    spotify_uri,
    vibe_tag,
    note,
  } = req.body;

  const creatorHash = req.voterHash;

  if (!spotify_track_id || !track_name || !artist_name || !spotify_uri) {
    return res.status(400).json({ error: 'Missing mandatory track metadata fields.' });
  }

  try {
    // 1. Verify board exists
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('id', boardId)
      .single();

    if (boardError || !board) {
      return res.status(404).json({ error: 'Board not found.' });
    }

    // 2. Prevent duplicate tracks within the same board
    const { data: existingTrack } = await supabase
      .from('posts')
      .select('id, track_name')
      .eq('board_id', boardId)
      .eq('spotify_track_id', spotify_track_id)
      .maybeSingle();

    if (existingTrack) {
      return res.status(409).json({
        error: `"${track_name}" has already been submitted to this board. Upvote the existing track instead!`,
        existingPostId: existingTrack.id,
      });
    }

    const now = new Date();
    const initialUpvotes = 1;
    const initialDownvotes = 0;
    const initialScore = 1;
    const initialHotScore = calculateHotScore(initialUpvotes, initialDownvotes, now);

    // 3. Insert post record
    const { data: newPost, error: insertPostError } = await supabase
      .from('posts')
      .insert({
        board_id: boardId,
        spotify_track_id,
        track_name,
        artist_name,
        album_name: album_name || null,
        album_art_url: album_art_url || null,
        preview_url: preview_url || null,
        spotify_uri,
        vibe_tag: vibe_tag || null,
        note: note || null,
        upvote_count: initialUpvotes,
        downvote_count: initialDownvotes,
        score: initialScore,
        hot_score: initialHotScore,
        creator_fingerprint_hash: creatorHash,
        created_at: now.toISOString(),
      })
      .select()
      .single();

    if (insertPostError) throw insertPostError;

    // 4. Auto-register submitter's initial upvote
    const { error: insertVoteError } = await supabase
      .from('votes')
      .insert({
        post_id: newPost.id,
        voter_hash: creatorHash,
        vote_type: 1,
      });

    if (insertVoteError) {
      console.error('Failed to register initial vote:', insertVoteError.message);
    }

    return res.status(201).json({
      message: 'Track submitted successfully.',
      post: {
        ...newPost,
        userVote: 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch feed of posts for a board with Hot / Top / New sorting and search
 * GET /api/boards/:boardId/posts?sort=hot&page=1&limit=25&search=query
 */
const getFeed = async (req, res, next) => {
  const { boardId } = req.params;
  const sort = (req.query.sort || 'hot').toLowerCase();
  const search = (req.query.search || '').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const voterHash = req.voterHash;

  try {
    let query = supabase
      .from('posts')
      .select('*, votes(vote_type, voter_hash)', { count: 'exact' })
      .eq('board_id', boardId);

    // Apply DB search filter across track_name, artist_name, and vibe_tag
    if (search.length > 0) {
      const term = `%${search}%`;
      query = query.or(`track_name.ilike.${term},artist_name.ilike.${term},vibe_tag.ilike.${term}`);
    }

    // Apply sorting
    if (sort === 'top') {
      query = query.order('score', { ascending: false });
    } else if (sort === 'new') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('hot_score', { ascending: false });
    }

    const { data: posts, count: total, error } = await query.range(from, to);

    if (error) throw error;

    // Normalize results to include anonymous user's specific vote
    const formattedPosts = (posts || []).map((post) => {
      const userVoteRecord = (post.votes || []).find((v) => v.voter_hash === voterHash);
      const { votes, ...postData } = post;
      return {
        ...postData,
        user_vote: userVoteRecord ? userVoteRecord.vote_type : 0,
      };
    });

    return res.status(200).json({
      data: formattedPosts,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeed,
};