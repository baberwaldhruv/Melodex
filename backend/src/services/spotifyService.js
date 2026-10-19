const axios = require('axios');
const spotifyConfig = require('../config/spotify');
const supabase = require('../config/db');

// In-memory cache for machine-to-machine Client Credentials token
let clientCredentialsToken = null;
let tokenExpiresAt = 0;

/**
 * Returns a valid Spotify Client Credentials access token.
 * Reuses the cached token until 60 seconds before expiration.
 */
const getClientCredentialsToken = async () => {
  const now = Date.now();
  if (clientCredentialsToken && now < tokenExpiresAt - 60000) {
    return clientCredentialsToken;
  }

  const authHeader = Buffer.from(
    `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`
  ).toString('base64');

  const response = await axios.post(
    `${spotifyConfig.accountsBaseUrl}/api/token`,
    new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
    }
  );

  clientCredentialsToken = response.data.access_token;
  tokenExpiresAt = now + response.data.expires_in * 1000;

  return clientCredentialsToken;
};

/**
 * Searches tracks on Spotify using client credentials.
 */
const searchTracks = async (query, limit = 10) => {
  const token = await getClientCredentialsToken();

  const response = await axios.get(`${spotifyConfig.apiBaseUrl}/search`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: query,
      type: 'track',
      limit,
    },
  });

  const items = response.data.tracks?.items || [];
  return items.map((track) => ({
    spotify_track_id: track.id,
    track_name: track.name,
    artist_name: track.artists.map((a) => a.name).join(', '),
    album_name: track.album.name,
    album_art_url: track.album.images?.[0]?.url || null,
    preview_url: track.preview_url || null,
    spotify_uri: track.uri,
  }));
};

/**
 * Exchanges OAuth authorization code for Host user tokens.
 */
const exchangeAuthCode = async (code) => {
  const authHeader = Buffer.from(
    `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`
  ).toString('base64');

  const response = await axios.post(
    `${spotifyConfig.accountsBaseUrl}/api/token`,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: spotifyConfig.redirectUri,
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
    }
  );

  return response.data;
};

/**
 * Ensures the target board has an active access token.
 * Refreshes token in Supabase if current token is expired or close to expiring.
 */
const getValidHostAccessToken = async (boardId) => {
  const { data: tokenRecord, error } = await supabase
    .from('spotify_sync_tokens')
    .select('*')
    .eq('board_id', boardId)
    .single();

  if (error || !tokenRecord) {
    throw new Error(`No linked Spotify account found for board ${boardId}`);
  }

  const expiresAt = new Date(tokenRecord.expires_at).getTime();
  const now = Date.now();

  // If valid for at least 2 more minutes, return current access token
  if (now < expiresAt - 120000) {
    return tokenRecord.access_token;
  }

  // Refresh expired access token
  const authHeader = Buffer.from(
    `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`
  ).toString('base64');

  const response = await axios.post(
    `${spotifyConfig.accountsBaseUrl}/api/token`,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenRecord.refresh_token,
    }).toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
    }
  );

  const newAccessToken = response.data.access_token;
  const newExpiresInSeconds = response.data.expires_in;
  const newExpiresAt = new Date(Date.now() + newExpiresInSeconds * 1000).toISOString();
  const updatedRefreshToken = response.data.refresh_token || tokenRecord.refresh_token;

  await supabase
    .from('spotify_sync_tokens')
    .update({
      access_token: newAccessToken,
      refresh_token: updatedRefreshToken,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('board_id', boardId);

  return newAccessToken;
};

/**
 * Appends a track URI to a Spotify playlist.
 */
const addTrackToPlaylist = async (boardId, playlistId, trackUri) => {
  const accessToken = await getValidHostAccessToken(boardId);

  const response = await axios.post(
    `${spotifyConfig.apiBaseUrl}/playlists/${playlistId}/tracks`,
    {
      uris: [trackUri],
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

module.exports = {
  searchTracks,
  exchangeAuthCode,
  getValidHostAccessToken,
  addTrackToPlaylist,
};