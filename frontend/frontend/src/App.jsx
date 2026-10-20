import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/layout/Navbar';
import { RightSidebar } from './components/layout/RightSidebar';
import LeftSidebar from './components/layout/LeftSidebar';
import { FeedFilterTabs } from './components/feed/FeedFilterTabs';
import { PostCard } from './components/feed/PostCard';
import { SubmitTrackModal } from './components/modals/SubmitTrackModal';
import { useFingerprint } from './hooks/useFingerprint';
import { boardAPI } from './api/client';
import { Loader2, Music, AlertCircle } from 'lucide-react';

const DEFAULT_BOARD_SLUG = 'global-discoveries';

export default function App() {
  useFingerprint();

  const [board, setBoard] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeSort, setActiveSort] = useState('top');
  const [searchQuery, setSearchQuery] = useState('');

  // Saved Tracks Queue State (Right Sidebar)
  const [playlistTracks, setPlaylistTracks] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchBoard = useCallback(async () => {
    try {
      const response = await boardAPI.getBoard(DEFAULT_BOARD_SLUG);
      setBoard(response.data?.board || null);
      return response.data?.board?.id;
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError('Could not load board. Please make sure the backend is running.');
      return null;
    }
  }, []);

  const fetchFeed = useCallback(async (boardId, sortType, pageNum = 1, append = false) => {
    if (!boardId) return;

    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const response = await boardAPI.getFeed(boardId, sortType, pageNum);
      const fetchedPosts = response.data?.data || [];
      const pagination = response.data?.pagination || {};

      setTotalPages(pagination.totalPages || 1);

      if (append) {
        setPosts((prev) => [...prev, ...fetchedPosts]);
      } else {
        setPosts(fetchedPosts);
      }
    } catch (err) {
      console.error('Failed to fetch feed:', err);
      setError('Failed to load posts.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const boardId = await fetchBoard();
      if (boardId) {
        await fetchFeed(boardId, activeSort, 1, false);
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, [fetchBoard, fetchFeed, activeSort]);

  const handleSortChange = (newSort) => {
    if (newSort === activeSort) return;
    setActiveSort(newSort);
    setPage(1);
    if (board?.id) {
      fetchFeed(board.id, newSort, 1, false);
    }
  };

  const handleLoadMore = () => {
    if (page >= totalPages || isLoadingMore || !board?.id) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(board.id, activeSort, nextPage, true);
  };

  const handleTrackSubmitted = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    fetchBoard();
  };

  // Delete post from Main Feed
  const handleDeletePost = async (postId) => {
    // 1. Instant local removal (Optimistic Update)
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    // 2. Also remove from saved tracks if present
    setPlaylistTracks((prev) => prev.filter((t) => t.id !== postId && t.postId !== postId));

    // 3. Backend deletion API call (if your API client supports it)
    try {
      if (boardAPI.deletePost) {
        await boardAPI.deletePost(postId);
      }
    } catch (err) {
      console.error('Failed to delete post from server:', err);
    }
  };

  // Drag and Drop saved tracks handlers
  const handleAddTrack = (track) => {
    setPlaylistTracks((prev) => {
      const exists = prev.some(
        (t) => (t.id && t.id === track.id) || (t.title === track.title && t.artist === track.artist)
      );
      if (exists) return prev;
      return [...prev, track];
    });
  };

  const handleRemoveTrack = (trackIdOrIndex) => {
    setPlaylistTracks((prev) =>
      prev.filter((t, idx) => (t.id ? t.id !== trackIdOrIndex : idx !== trackIdOrIndex))
    );
  };

  const handleClearSavedTracks = () => {
    setPlaylistTracks([]);
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.track_name?.toLowerCase().includes(q) ||
        p.artist_name?.toLowerCase().includes(q) ||
        p.vibe_tag?.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  return (
    <div className="min-h-screen bg-reddit-bg text-reddit-text flex flex-col font-sans">
      <Navbar
        boardTitle={board?.slug || DEFAULT_BOARD_SLUG}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 w-full flex justify-between items-start">
        {/* Left Sidebar */}
        <div className="hidden lg:block shrink-0">
          <LeftSidebar
            activeTab={
              activeSort === 'top'
                ? 'popular'
                : activeSort === 'new'
                ? 'new'
                : 'home'
            }
            onSelectTab={(tab) => {
              if (tab === 'popular') handleSortChange('top');
              else if (tab === 'new') handleSortChange('new');
              else handleSortChange('hot');
            }}
          />
        </div>

        {/* Center Main Feed + Right Sidebar */}
        <div className="flex-1 flex justify-center gap-6 px-4 py-4 max-w-5xl mx-auto">
          <div className="w-full max-w-2xl flex-1">
            <FeedFilterTabs
              activeSort={activeSort}
              onSortChange={handleSortChange}
            />

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-200 flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-reddit-muted space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-reddit-orange" />
                <span className="text-xs">Loading tracks...</span>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-reddit-card border border-reddit-border rounded-md p-10 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#202224] flex items-center justify-center text-reddit-muted">
                  <Music className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-reddit-text">
                  {searchQuery ? 'No matching tracks found' : 'No songs dropped yet'}
                </h3>
                <p className="text-xs text-reddit-muted max-w-xs">
                  {searchQuery
                    ? 'Try searching for another song title, artist, or vibe.'
                    : 'Be the first to recommend a song to this board.'}
                </p>
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold bg-reddit-orange hover:bg-[#e03d00] text-white transition-all shadow"
                >
                  Drop First Track
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDeletePost={handleDeletePost}
                  />
                ))}

                {page < totalPages && !searchQuery && (
                  <div className="text-center py-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="px-5 py-2 rounded-full text-xs font-bold bg-[#1e2022] hover:bg-[#282a2d] border border-reddit-border text-reddit-text transition-colors disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        'Load More Tracks'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Drag & Drop Saved Tracks */}
          <RightSidebar
            board={board}
            playlistTracks={playlistTracks}
            onAddTrack={handleAddTrack}
            onRemoveTrack={handleRemoveTrack}
            onClearAll={handleClearSavedTracks}
          />
        </div>
      </div>

      {board?.id && (
        <SubmitTrackModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          boardId={board.id}
          onTrackSubmitted={handleTrackSubmitted}
        />
      )}
    </div>
  );
}