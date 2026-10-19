import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { RightSidebar } from './components/layout/RightSidebar';
import { FeedFilterTabs } from './components/feed/FeedFilterTabs';
import { PostCard } from './components/feed/PostCard';
import { SubmitTrackModal } from './components/modals/SubmitTrackModal';
import { useFingerprint } from './hooks/useFingerprint';
import { boardAPI } from './api/client';
import { Loader2, Music, AlertCircle } from 'lucide-react';

// Default board slug for demo/initial view
const DEFAULT_BOARD_SLUG = 'global-discoveries';

export default function App() {
  // Ensure device fingerprint is generated & cached in localStorage
  useFingerprint();

  const [board, setBoard] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeSort, setActiveSort] = useState('hot');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Board Metadata
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

  // 2. Fetch Board Posts Feed
  const fetchFeed = useCallback(async (boardId, sortType, pageNum = 1, append = false) => {
    if (!boardId) return;

    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

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

  // Initialize board and feed on mount
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

  // Handle sort tab switch
  const handleSortChange = (newSort) => {
    if (newSort === activeSort) return;
    setActiveSort(newSort);
    setPage(1);
    if (board?.id) {
      fetchFeed(board.id, newSort, 1, false);
    }
  };

  // Handle pagination load more
  const handleLoadMore = () => {
    if (page >= totalPages || isLoadingMore || !board?.id) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(board.id, activeSort, nextPage, true);
  };

  // Prepend newly submitted track to the top of the feed immediately
  const handleTrackSubmitted = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    // Refresh board statistics (e.g. total submissions count)
    fetchBoard();
  };

  return (
    <div className="min-h-screen bg-reddit-bg text-reddit-text flex flex-col font-sans">
      {/* 1. Global Navigation Bar */}
      <Navbar
        boardTitle={board?.slug || DEFAULT_BOARD_SLUG}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        spotifyPlaylistId={board?.spotify_playlist_id}
      />

      {/* 2. Main Reddit-Style Center Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-2 sm:px-4 py-4 flex justify-center gap-6">
        {/* Center Feed Column */}
        <div className="w-full max-w-2xl flex-1">
          {/* Sorting Tabs (Hot / New / Top) */}
          <FeedFilterTabs
            activeSort={activeSort}
            onSortChange={handleSortChange}
          />

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-200 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Initial Loading Spinner */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-reddit-muted space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-reddit-orange" />
              <span className="text-xs">Loading tracks...</span>
            </div>
          ) : posts.length === 0 ? (
            /* Empty Feed State */
            <div className="bg-reddit-card border border-reddit-border rounded-md p-10 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#202224] flex items-center justify-center text-reddit-muted">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-reddit-text">
                No songs dropped yet
              </h3>
              <p className="text-xs text-reddit-muted max-w-xs">
                Be the first to recommend a song to this board. Tracks with enough upvotes make it to the Spotify playlist!
              </p>
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold bg-reddit-orange hover:bg-[#e03d00] text-white transition-all shadow"
              >
                Drop First Track
              </button>
            </div>
          ) : (
            /* Post Cards Feed */
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {/* Load More Button */}
              {page < totalPages && (
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

        {/* Right Sidebar Column */}
        <RightSidebar board={board} />
      </main>

      {/* 3. Drop Recommendation Modal */}
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