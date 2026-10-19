import React from 'react';
import { Flame, Sparkles, TrendingUp } from 'lucide-react';

export const FeedFilterTabs = ({ activeSort, onSortChange }) => {
  const tabs = [
    { id: 'hot', label: 'Hot', icon: Flame },
    { id: 'new', label: 'New', icon: Sparkles },
    { id: 'top', label: 'Top', icon: TrendingUp },
  ];

  return (
    <div className="flex items-center gap-2 p-3 bg-reddit-card border border-reddit-border rounded-md mb-4 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeSort === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSortChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isActive
                ? 'bg-[#272729] text-white shadow'
                : 'text-reddit-muted hover:bg-[#222426] hover:text-reddit-text'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-reddit-orange' : ''}`} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};