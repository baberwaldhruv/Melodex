import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, Music2, AlertCircle } from 'lucide-react';
import { spotifyAPI, boardAPI } from '../../api/client';

const SUGGESTED_VIBES = [
  'Late Night Drive',
  'Study Beats',
  'Gym Pump',
  'Chill Vibes',
  'Nostalgia',
  'Synthwave',
];

export const SubmitTrackModal = ({ isOpen, onClose, boardId, onTrackSubmitted }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [vibeTag, setVibeTag] = useState('');
  const [note, setNote] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Debounced live Spotify track search
  useEffect(() => {
    if (!query.trim() || selectedTrack) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const response = await spotifyAPI.search(query.trim());
        setSearchResults(response.data?.data || []);
      } catch (err) {
        console.error('Spotify Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [query, selectedTrack]);

  if (!isOpen) return null;

  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
    setQuery(track.track_name);
    setSearchResults([]);
    setError(null);
  };

  const handleClearSelection = () => {
    setSelectedTrack(null);
    setQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrack) {
      setError('Please search and select a song from Spotify.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      spotify_track_id: selectedTrack.spotify_track_id,
      track_name: selectedTrack.track_name,
      artist_name: selectedTrack.artist_name,
      album_name: selectedTrack.album_name,
      album_art_url: selectedTrack.album_art_url,
      preview_url: selectedTrack.preview_url,
      spotify_uri: selectedTrack.spotify_uri,
      vibe_tag: vibeTag.trim() || null,
      note: note.trim() || null,
    };

    try {
      const response = await boardAPI.submitTrack(boardId, payload);
      onTrackSubmitted(response.data.post);
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Failed to submit track. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-reddit-card border border-reddit-border rounded-lg max-w-lg w-full p-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-reddit-border">
          <h2 className="text-base font-bold text-reddit-text flex items-center gap-2">
            <Music2 className="w-5 h-5 text-reddit-orange" />
            Drop a Recommendation
          </h2>
          <button
            onClick={onClose}
            className="text-reddit-muted hover:text-reddit-text p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Track Search Field */}
          <div className="relative">
            <label className="block text-xs font-semibold text-reddit-muted mb-1">
              Search Track on Spotify
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-reddit-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (selectedTrack) setSelectedTrack(null);
                }}
                placeholder="Search song title or artist..."
                className="w-full bg-[#121314] border border-reddit-border rounded-md pl-9 pr-9 py-2 text-xs text-reddit-text focus:outline-none focus:border-reddit-muted transition-colors"
                autoFocus
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 absolute right-3 text-reddit-muted animate-spin" />
              )}
              {selectedTrack && !isSearching && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="absolute right-3 text-reddit-muted hover:text-reddit-text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Spotify Autocomplete Dropdown */}
            {searchResults.length > 0 && !selectedTrack && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-[#151719] border border-reddit-border rounded-md shadow-xl z-10 divide-y divide-[#222426]">
                {searchResults.map((track) => (
                  <div
                    key={track.spotify_track_id}
                    onClick={() => handleSelectTrack(track)}
                    className="flex items-center gap-3 p-2.5 hover:bg-[#202224] cursor-pointer transition-colors"
                  >
                    {track.album_art_url ? (
                      <img
                        src={track.album_art_url}
                        alt={track.track_name}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#25272a] rounded flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-reddit-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-reddit-text truncate">
                        {track.track_name}
                      </p>
                      <p className="text-[11px] text-reddit-muted truncate">
                        {track.artist_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Track Preview Badge */}
          {selectedTrack && (
            <div className="flex items-center gap-3 p-2.5 bg-[#1b271d] border border-[#274f2d] rounded-md">
              <img
                src={selectedTrack.album_art_url}
                alt={selectedTrack.track_name}
                className="w-11 h-11 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-spotify-green">
                  Selected Track
                </span>
                <p className="text-xs font-bold text-white truncate">
                  {selectedTrack.track_name}
                </p>
                <p className="text-[11px] text-[#9fcb9f] truncate">
                  {selectedTrack.artist_name}
                </p>
              </div>
            </div>
          )}

          {/* Vibe Tag Selection */}
          <div>
            <label className="block text-xs font-semibold text-reddit-muted mb-1.5">
              Vibe / Mood Tag (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUGGESTED_VIBES.map((vibe) => (
                <button
                  type="button"
                  key={vibe}
                  onClick={() => setVibeTag(vibe === vibeTag ? '' : vibe)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                    vibeTag === vibe
                      ? 'bg-reddit-orange border-reddit-orange text-white'
                      : 'bg-[#181a1b] border-reddit-border text-reddit-muted hover:text-reddit-text'
                  }`}
                >
                  {vibe}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={vibeTag}
              onChange={(e) => setVibeTag(e.target.value)}
              placeholder="Or type a custom vibe (e.g. Cyberpunk, 90s Grunge)..."
              maxLength={32}
              className="w-full bg-[#121314] border border-reddit-border rounded-md px-3 py-1.5 text-xs text-reddit-text focus:outline-none focus:border-reddit-muted"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-reddit-muted mb-1">
              Note or Context (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={280}
              placeholder="Why should this song make the board?"
              className="w-full bg-[#121314] border border-reddit-border rounded-md p-2 text-xs text-reddit-text focus:outline-none focus:border-reddit-muted resize-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-reddit-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-reddit-muted hover:bg-[#232527] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedTrack}
              className="px-5 py-1.5 rounded-full text-xs font-bold bg-reddit-orange hover:bg-[#e03d00] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Posting...' : 'Post Recommendation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};