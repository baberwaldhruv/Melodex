const axios = require('axios');
const supabase = require('../config/db');
const spotifyConfig = require('../config/spotify');
const { searchTracks, exchangeAuthCode } = require('../services/spotifyService');

/**
 * Proxy track search to Spotify
 * GET /api/spotify/search?q=query_string&limit=10
 */
const search = async (req, res, next) => {
  const query = req.query.q;
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));

  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: 'Search query parameter (q) is required.' });
  }

  try {
    const tracks = await searchTracks(query, limit);
    return res.status(200).json({ data: tracks });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Spotify OAuth Authorize URL for board creator
 * GET /api/spotify/login?boardId=UUID
 */
const initiateOAuth = (req, res) => {
  const { boardId } = req.query;

  if (!boardId) {
    return res.status(400).json({ error: 'boardId query parameter is required.' });
  }

  const state = Buffer.from(JSON.stringify({ boardId })).toString('base64');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: spotifyConfig.clientId,
    scope: spotifyConfig.scopes,
    redirect_uri: spotifyConfig.redirectUri,
    state,
  });

  return res.redirect(`${spotifyConfig.accountsBaseUrl}/authorize?${params.toString()}`);
};

/**
 * Handle Spotify OAuth Callback and persist sync credentials in Supabase
 * GET /api/spotify/callback?code=...&state=...
 */
const handleOAuthCallback = async (req, res, next) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).send(`Spotify Authorization Failed: ${error}`);
  }

  if (!code || !state) {
    return res.status(400).send('Invalid callback request: missing code or state.');
  }

  try {
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
    const { boardId } = decodedState;

    // 1. Verify board exists
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id, slug')
      .eq('id', boardId)
      .single();

    if (boardError || !board) {
      return res.status(404).send('Board matching OAuth state was not found.');
    }

    // 2. Exchange code for access & refresh tokens
    const tokenData = await exchangeAuthCode(code);
    const { access_token, refresh_token, expires_in, scope } = tokenData;

    // 3. Fetch Spotify user ID
    const userProfileResponse = await axios.get(`${spotifyConfig.apiBaseUrl}/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const spotifyUserId = userProfileResponse.data.id;

    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // 4. Upsert token record via Supabase
    const { error: upsertError } = await supabase
      .from('spotify_sync_tokens')
      .upsert(
        {
          board_id: boardId,
          spotify_user_id: spotifyUserId,
          access_token,
          refresh_token,
          expires_at: expiresAt,
          scope,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'board_id' }
      );

    if (upsertError) throw upsertError;

    // Redirect user back to the board's frontend view
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(`${clientUrl}/b/${board.slug}?spotify_connected=true`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  search,
  initiateOAuth,
  handleOAuthCallback,
};