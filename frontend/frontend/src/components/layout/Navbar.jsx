import React from 'react';
import { Search, Plus, Disc, X } from 'lucide-react';

export function Navbar({
  boardTitle = 'global-discoveries',
  onOpenSubmitModal,
  searchQuery,
  onSearchChange,
}) {
  return (
    <header className="sticky top-0 z-50 h-14 bg-[#0E1113] border-b border-[#272B2E] px-4 flex items-center justify-between gap-4">
      {/* 1. Left: Brand Logo & Title */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-reddit-orange flex items-center justify-center text-white shadow transition-transform group-hover:scale-105">
            <Disc className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
          </div>
          <span className="text-lg font-black tracking-tight text-white hidden sm:inline">
            melodex
          </span>
        </a>
      </div>

      {/* 2. Middle: Real-time Feed Search Input */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={`Search songs, artists, or vibes in r/${boardTitle}...`}
            className="w-full h-10 pl-10 pr-9 rounded-full bg-[#1A1D20] hover:bg-[#22262A] focus:bg-[#1A1D20] border border-transparent focus:border-neutral-500 text-sm text-neutral-200 placeholder-neutral-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute right-3 text-neutral-400 hover:text-neutral-200"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Right: Direct Recommendation Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenSubmitModal}
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-reddit-orange hover:bg-[#e03d00] text-white text-xs font-bold transition-all shadow cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Drop Track</span>
        </button>
      </div>
    </header>
  );
}