import React from 'react';
import {
  Home,
  TrendingUp,
  Compass,
  Sparkles,
  Flame,
} from 'lucide-react';

export default function LeftSidebar({ activeTab = 'home', onSelectTab }) {
  return (
    <aside className="w-64 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto pr-2 py-4 flex flex-col justify-between text-reddit-text select-none text-sm border-r border-[#22272B]">
      <div className="space-y-1">
        <button
          onClick={() => onSelectTab && onSelectTab('home')}
          className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
            activeTab === 'home'
              ? 'bg-[#272B2E] text-white font-semibold'
              : 'text-neutral-300 hover:bg-[#1A1D20]'
          }`}
        >
          <Home className="w-5 h-5 text-reddit-text" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onSelectTab && onSelectTab('popular')}
          className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
            activeTab === 'popular'
              ? 'bg-[#272B2E] text-white font-semibold'
              : 'text-neutral-300 hover:bg-[#1A1D20]'
          }`}
        >
          <Flame className="w-5 h-5 text-reddit-orange" />
          <span>Popular</span>
        </button>

        <button
          onClick={() => onSelectTab && onSelectTab('trending')}
          className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
            activeTab === 'trending'
              ? 'bg-[#272B2E] text-white font-semibold'
              : 'text-neutral-300 hover:bg-[#1A1D20]'
          }`}
        >
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <span>Trending</span>
        </button>

        <button
          onClick={() => onSelectTab && onSelectTab('explore')}
          className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
            activeTab === 'explore'
              ? 'bg-[#272B2E] text-white font-semibold'
              : 'text-neutral-300 hover:bg-[#1A1D20]'
          }`}
        >
          <Compass className="w-5 h-5 text-sky-400" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => onSelectTab && onSelectTab('new')}
          className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
            activeTab === 'new'
              ? 'bg-[#272B2E] text-white font-semibold'
              : 'text-neutral-300 hover:bg-[#1A1D20]'
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>New Releases</span>
        </button>
      </div>
    </aside>
  );
}