import React, { useState } from 'react';
import { ListMusic, Trash2, PlusCircle, Music2 } from 'lucide-react';

export const RightSidebar = ({
  playlistTracks = [],
  onAddTrack,
  onRemoveTrack,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;
      const track = JSON.parse(rawData);

      if (onAddTrack) {
        onAddTrack(track);
      }
    } catch (err) {
      console.error('Failed to parse dropped track data:', err);
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 space-y-4 hidden lg:block sticky top-4 select-none">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl overflow-hidden transition-all duration-300 backdrop-blur-md bg-zinc-950/80 border shadow-xl ${
          isDragOver
            ? 'border-[#1db954] ring-4 ring-[#1db954]/20 bg-[#121c15]/90 shadow-[#1db954]/10'
            : 'border-zinc-800/80 hover:border-zinc-700/80'
        }`}
      >
        {/* Sleek Top Banner */}
        <div className="h-11 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 px-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-bold text-white tracking-wider uppercase text-[11px]">
            <div className="p-1 rounded-md bg-black/20 backdrop-blur-sm">
              <ListMusic className="w-3.5 h-3.5 text-white" />
            </div>
            <span>Saved Tracks</span>
          </div>

          <span className="bg-black/35 backdrop-blur-sm border border-white/10 text-white font-mono px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-tight">
            {playlistTracks.length} {playlistTracks.length === 1 ? 'track' : 'tracks'}
          </span>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Drop Target Box: ONLY visible when no tracks are added */}
          {playlistTracks.length === 0 && (
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-[#1db954] bg-[#1db954]/10 text-[#1db954] scale-[0.99]'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/70'
              }`}
            >
              <div
                className={`w-10 h-10 mx-auto mb-2.5 rounded-full flex items-center justify-center transition-transform ${
                  isDragOver ? 'bg-[#1db954]/20 scale-110' : 'bg-zinc-800/80'
                }`}
              >
                <PlusCircle
                  className={`w-5 h-5 transition-colors ${
                    isDragOver ? 'text-[#1db954] animate-spin' : 'text-zinc-400'
                  }`}
                />
              </div>
              <p className="text-[12px] font-semibold tracking-wide">
                {isDragOver ? 'Drop to add track' : 'Drag tracks here'}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">From Hot, New, or Top feeds</p>
            </div>
          )}

          {/* Track List Container */}
          {playlistTracks.length > 0 && (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {playlistTracks.map((track, index) => (
                <div
                  key={track.id || `${track.title}-${index}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850/80 transition-all duration-150 group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="text-[11px] font-mono text-zinc-500 w-3 text-right flex-shrink-0">
                      {index + 1}
                    </span>

                    {track.cover_url ? (
                      <img
                        src={track.cover_url}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm ring-1 ring-white/5 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-700/60">
                        <Music2 className="w-4 h-4 text-zinc-400" />
                      </div>
                    )}

                    <div className="min-w-0 truncate">
                      <p className="text-zinc-200 font-medium text-xs truncate leading-tight group-hover:text-white transition-colors">
                        {track.title}
                      </p>
                      <p className="text-zinc-500 text-[11px] truncate leading-tight mt-1 font-normal">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveTrack && onRemoveTrack(track.id || index)}
                    title="Remove track"
                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all opacity-40 group-hover:opacity-100 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};