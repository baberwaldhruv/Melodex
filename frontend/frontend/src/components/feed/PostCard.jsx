import React, { useState } from 'react';
import { ExternalLink, Disc3, CheckCircle2, Play, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { VoteGutter } from './VoteGutter';

export const PostCard = ({ post }) => {
  const [showEmbed, setShowEmbed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'recently';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    const trackPayload = {
      id: post.spotify_track_id || post.id,
      postId: post.id,
      title: post.track_name,
      artist: post.artist_name,
      cover_url: post.album_art_url,
      spotify_uri: post.spotify_track_id ? `spotify:track:${post.spotify_track_id}` : null,
      spotify_track_id: post.spotify_track_id,
    };

    e.dataTransfer.setData('application/json', JSON.stringify(trackPayload));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group/card flex bg-reddit-card border border-reddit-border hover:border-[#4d4e50] transition-all rounded-md mb-2.5 overflow-hidden shadow-sm cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'opacity-40 border-dashed border-reddit-orange scale-[0.99]' : ''
      }`}
    >
      {/* Drag Gripper */}
      <div className="w-4 flex items-center justify-center text-zinc-600 group-hover/card:text-zinc-400 transition-colors bg-black/10">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Left Voting Gutter */}
      <div onClick={(e) => e.stopPropagation()} className="cursor-default">
        <VoteGutter
          postId={post.id}
          initialScore={post.score || 0}
          initialUserVote={post.user_vote || 0}
        />
      </div>

      {/* Main Card Content */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          {/* Header Metadata */}
          <div className="flex items-center gap-2 text-[11px] text-reddit-muted mb-1.5 flex-wrap">
            <span className="font-semibold text-reddit-text">Anonymous</span>
            <span>•</span>
            <span>{formatTimeAgo(post.created_at)}</span>

            {post.vibe_tag && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2c221e] text-reddit-orange border border-[#482e25]">
                {post.vibe_tag}
              </span>
            )}

            {post.is_synced_to_spotify && (
              <span className="flex items-center gap-1 text-spotify-green text-[10px] font-medium ml-auto bg-[#132819] px-2 py-0.5 rounded-full border border-[#1b4324]">
                <CheckCircle2 className="w-3 h-3" />
                Synced to Spotify
              </span>
            )}
          </div>

          {/* Track Details Row */}
          <div className="flex items-start gap-3">
            {post.album_art_url ? (
              <img
                src={post.album_art_url}
                alt={post.album_name || post.track_name}
                className="w-14 h-14 rounded object-cover flex-shrink-0 shadow border border-[#2b2b2b] pointer-events-none"
                loading="lazy"
              />
            ) : (
              <div className="w-14 h-14 bg-[#232527] rounded flex items-center justify-center flex-shrink-0 text-reddit-muted border border-reddit-border">
                <Disc3 className="w-6 h-6 animate-spin-slow" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-reddit-text truncate leading-tight">
                {post.track_name}
              </h3>
              <p className="text-xs text-reddit-muted truncate mt-0.5">
                {post.artist_name} {post.album_name && `• ${post.album_name}`}
              </p>

              {post.note && (
                <p className="text-xs text-[#a4a7a9] mt-1.5 italic line-clamp-2 bg-[#202124] p-1.5 rounded border border-[#2c2d30]">
                  "{post.note}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Embedded Spotify Track Player */}
        {showEmbed && post.spotify_track_id && (
          <div
            className="mt-3 overflow-hidden rounded-md border border-[#2c2d30] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://open.spotify.com/embed/track/${post.spotify_track_id}?utm_source=generator&theme=0`}
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={`Spotify Player: ${post.track_name}`}
            />
          </div>
        )}

        {/* Actions Row */}
        <div
          className="flex items-center gap-2 mt-3 pt-2 border-t border-[#252729] text-xs font-semibold text-reddit-muted cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowEmbed(!showEmbed)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-[#272729] transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-spotify-green" />
            <span>{showEmbed ? 'Close Player' : 'Preview Song'}</span>
            {showEmbed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <a
            href={`https://open.spotify.com/track/${post.spotify_track_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-[#272729] transition-colors ml-auto text-spotify-green"
          >
            <span>Open in Spotify</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};