import React from 'react';
import { Radio, ShieldAlert, CheckCircle, Disc, ExternalLink } from 'lucide-react';

export const RightSidebar = ({ board }) => {
  if (!board) return null;

  const threshold = board.vote_threshold_for_sync || 5;
  const stats = board.stats || { totalSubmissions: 0, syncedTracksCount: 0 };

  return (
    <aside className="w-72 flex-shrink-0 space-y-3.5 hidden lg:block">
      {/* 1. About Community Widget */}
      <div className="bg-reddit-sidebar border border-reddit-border rounded-md overflow-hidden text-xs">
        <div className="h-10 bg-gradient-to-r from-[#e03d00] to-reddit-orange px-3 flex items-center">
          <span className="font-bold text-white tracking-wide uppercase text-[11px]">
            About Board
          </span>
        </div>

        <div className="p-3.5 space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-reddit-orange" />
            <h4 className="font-bold text-sm text-reddit-text leading-tight">
              {board.title}
            </h4>
          </div>

          <p className="text-reddit-muted leading-relaxed">
            {board.description || 'Welcome to this collaborative song discovery board.'}
          </p>

          <div className="grid grid-cols-2 gap-2 py-2 border-y border-reddit-border/60">
            <div>
              <span className="font-bold text-sm text-reddit-text block">
                {stats.totalSubmissions}
              </span>
              <span className="text-[10px] text-reddit-muted">Total Submissions</span>
            </div>
            <div>
              <span className="font-bold text-sm text-spotify-green block">
                {stats.syncedTracksCount}
              </span>
              <span className="text-[10px] text-reddit-muted">Synced to Spotify</span>
            </div>
          </div>

          {/* Sync Rule Callout */}
          <div className="bg-[#181d19] border border-[#27482d] p-2.5 rounded text-[11px] text-[#9eca9f] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-spotify-green">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Auto-Sync Threshold</span>
            </div>
            <p>
              Tracks that reach <strong>+{threshold} net upvotes</strong> will be added
              directly to the connected Spotify playlist.
            </p>
          </div>

          {!board.has_spotify_connected && (
            <a
              href={`http://localhost:5500/api/spotify/login?boardId=${board.id}`}
              className="block text-center w-full py-1.5 rounded-full text-xs font-bold bg-[#1db954] hover:bg-[#1aa34a] text-black transition-colors"
            >
              Connect Host Spotify
            </a>
          )}
        </div>
      </div>

      {/* 2. Embedded Playlist Widget */}
      {board.spotify_playlist_id && (
        <div className="bg-reddit-sidebar border border-reddit-border rounded-md overflow-hidden text-xs p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[11px] uppercase tracking-wide text-reddit-muted flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-spotify-green" />
              Board Playlist
            </span>
            <a
              href={`https://open.spotify.com/playlist/${board.spotify_playlist_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-spotify-green hover:underline flex items-center gap-0.5"
            >
              Open <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <iframe
            src={`https://open.spotify.com/embed/playlist/${board.spotify_playlist_id}?utm_source=generator&theme=0`}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded"
            title="Board Playlist"
          />
        </div>
      )}

      {/* 3. Community Rules Widget */}
      <div className="bg-reddit-sidebar border border-reddit-border rounded-md p-3.5 text-xs">
        <h4 className="font-bold text-[11px] text-reddit-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-reddit-orange" />
          Submission Rules
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-reddit-muted text-[11px]">
          <li>No duplicate tracks on the same board.</li>
          <li>Check track title and artist accuracy via Spotify search.</li>
          <li>Upvote songs matching the board's vibe.</li>
          <li>No spam or vote manipulation.</li>
        </ol>
      </div>
    </aside>
  );
};