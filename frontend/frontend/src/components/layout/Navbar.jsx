import React from 'react';
import { Plus, Radio, Search, ExternalLink } from 'lucide-react';

export const Navbar = ({ boardTitle, onOpenSubmitModal, spotifyPlaylistId }) => {
  return (
    <header className="sticky top-0 z-40 h-12 bg-reddit-card border-b border-reddit-border px-4 flex items-center justify-between">
      {/* Brand & Board Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-reddit-orange flex items-center justify-center text-white">
            <Radio className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
            JamBoard
          </span>
        </div>

        <div className="h-4 w-px bg-reddit-border hidden sm:block" />

        <span className="text-xs font-semibold text-reddit-muted truncate max-w-[160px] sm:max-w-xs">
          r/{boardTitle || 'discovery'}
        </span>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-reddit-muted" />
          <input
            type="text"
            placeholder="Search recommendations in this board..."
            className="w-full bg-[#121314] hover:bg-[#161819] focus:bg-[#121314] border border-reddit-border rounded-full pl-8 pr-4 py-1.5 text-xs text-reddit-text placeholder-reddit-muted focus:outline-none focus:border-reddit-muted transition-colors"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {spotifyPlaylistId && (
          <a
            href={`https://open.spotify.com/playlist/${spotifyPlaylistId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-spotify-green hover:bg-[#1a271c] border border-spotify-green/40 transition-colors"
          >
            <span>Spotify Playlist</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        <button
          onClick={onOpenSubmitModal}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-reddit-text text-black hover:bg-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Track</span>
        </button>
      </div>
    </header>
  );
};