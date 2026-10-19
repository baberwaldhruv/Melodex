const supabase = require('../config/db');

/**
 * Get board details and sidebar stats
 * GET /api/boards/:identifier
 */
const getBoard = async (req, res, next) => {
  const { identifier } = req.params;

  try {
    // Check by UUID or by slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

    let query = supabase
      .from('boards')
      .select('*, spotify_sync_tokens(id)')
      .limit(1);

    if (isUUID) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data: boards, error: boardError } = await query;
    if (boardError || !boards || boards.length === 0) {
      return res.status(404).json({ error: 'Board not found.' });
    }

    const board = boards[0];

    // Compute sidebar aggregate metrics
    const { count: totalSubmissions } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('board_id', board.id);

    const { count: syncedTracksCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('board_id', board.id)
      .eq('is_synced_to_spotify', true);

    const hasSpotifyConnected = Array.isArray(board.spotify_sync_tokens)
      ? board.spotify_sync_tokens.length > 0
      : Boolean(board.spotify_sync_tokens);

    delete board.spotify_sync_tokens;

    return res.status(200).json({
      board: {
        ...board,
        has_spotify_connected: hasSpotifyConnected,
        stats: {
          totalSubmissions: totalSubmissions || 0,
          syncedTracksCount: syncedTracksCount || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new board
 * POST /api/boards
 */
const createBoard = async (req, res, next) => {
  const { title, description, slug, spotify_playlist_id, vote_threshold_for_sync } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ error: 'Title and URL slug are required.' });
  }

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

  try {
    const { data: existing } = await supabase
      .from('boards')
      .select('id')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'A board with this slug already exists.' });
    }

    const threshold = vote_threshold_for_sync ? parseInt(vote_threshold_for_sync, 10) : 5;

    const { data: newBoard, error: insertError } = await supabase
      .from('boards')
      .insert({
        slug: cleanSlug,
        title,
        description: description || null,
        spotify_playlist_id: spotify_playlist_id || null,
        vote_threshold_for_sync: threshold,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return res.status(201).json({
      message: 'Board created successfully.',
      board: newBoard,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBoard,
  createBoard,
};