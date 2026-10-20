require('dotenv').config();

module.exports = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  apiBaseUrl: 'https://api.spotify.com/v1',
  accountsBaseUrl: 'https://accounts.spotify.com',
  scopes: [
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-private',
    'user-read-private',
    'user-read-email',
  ].join(' '),
};