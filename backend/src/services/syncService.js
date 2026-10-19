const supabase = require('../config/db');
const { addTrackToPlaylist } = require('./spotifyService');

let isSyncRunning = false;

/**
 * Runs a single scan cycle to find qualifying tracks and push them to Spotify.
 */
const runSyncCycle = async () => {
  if (isSyncRunning) return;
  isSyncRunning = true;

  try {
    // 1. Fetch unsynced posts joined with board metadata and active host tokens
    const { data: candidates, error: fetchError } = await supabase
      .from('posts')
      .select(`
        id,
        spotify_uri,
        track_name,
        score,
        board_id,
        boards!inner (
          id,
          spotify_playlist_id,
          vote_threshold_for_sync,
          spotify_sync_tokens!inner (
            id
          )
        )
      `)
      .eq('is_synced_to_spotify', false)
      .not('boards.spotify_playlist_id', 'is', null)
      .limit(15);

    if (fetchError) {
      console.error('[Sync Worker] Failed fetching candidates:', fetchError.message);
      return;
    }

    if (!candidates || candidates.length === 0) {
      return;
    }

    for (const post of candidates) {
      const board = post.boards;
      const threshold = board.vote_threshold_for_sync || 5;

      // Ensure post has crossed the target threshold
      if (post.score < threshold) {
        continue;
      }

      try {
        // 2. Append track to Spotify playlist
        await addTrackToPlaylist(
          board.id,
          board.spotify_playlist_id,
          post.spotify_uri
        );

        // 3. Mark track as synced in Supabase
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            is_synced_to_spotify: true,
            synced_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        if (updateError) {
          console.error(`[Sync Worker] Failed updating post ${post.id}:`, updateError.message);
        } else {
          console.log(`[Sync Worker] Added "${post.track_name}" to playlist ${board.spotify_playlist_id}`);
        }
      } catch (trackError) {
        console.error(
          `[Sync Worker] Failed adding track "${post.track_name}" (${post.id}):`,
          trackError.response?.data || trackError.message
        );
      }
    }
  } catch (err) {
    console.error('[Sync Worker] Error during sync loop:', err.message);
  } finally {
    isSyncRunning = false;
  }
};

/**
 * Starts the periodic sync worker loop.
 * @param {number} intervalMs - Poll frequency in milliseconds (default 30s)
 */
const startSyncJob = (intervalMs = 30000) => {
  console.log(`[Sync Worker] Supabase Sync Engine started. Polling every ${intervalMs / 1000}s.`);
  runSyncCycle();
  return setInterval(runSyncCycle, intervalMs);
};

module.exports = {
  startSyncJob,
  runSyncCycle,
};