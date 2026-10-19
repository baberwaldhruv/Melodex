import React, { useState } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { voteAPI } from '../../api/client';

export const VoteGutter = ({ postId, initialScore, initialUserVote = 0 }) => {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (targetVote) => {
    if (isVoting) return;

    // Toggle vote off if clicking the currently active vote
    const nextVote = userVote === targetVote ? 0 : targetVote;

    // Optimistic score delta calculation
    let delta = 0;
    if (userVote === 1) delta -= 1;
    if (userVote === -1) delta += 1;
    if (nextVote === 1) delta += 1;
    if (nextVote === -1) delta -= 1;

    const previousScore = score;
    const previousVote = userVote;

    setUserVote(nextVote);
    setScore(previousScore + delta);
    setIsVoting(true);

    try {
      const response = await voteAPI.castVote(postId, nextVote);
      if (response.data?.success) {
        setScore(response.data.score);
        setUserVote(response.data.userVote);
      }
    } catch (err) {
      // Revert optimistic state on network/API failure
      setScore(previousScore);
      setUserVote(previousVote);
      console.error('Failed to cast vote:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const getScoreColor = () => {
    if (userVote === 1) return 'text-reddit-orange';
    if (userVote === -1) return 'text-reddit-blue';
    return 'text-reddit-text';
  };

  return (
    <div className="flex flex-col items-center justify-start py-2 px-1 bg-[#151719] rounded-l-md w-10 sm:w-12 select-none border-r border-[#26282b]">
      <button
        onClick={() => handleVote(1)}
        disabled={isVoting}
        aria-label="Upvote"
        className={`p-1 rounded hover:bg-[#272729] transition-colors ${
          userVote === 1 ? 'text-reddit-orange' : 'text-reddit-muted hover:text-white'
        }`}
      >
        <ArrowBigUp className={`w-6 h-6 ${userVote === 1 ? 'fill-reddit-orange' : ''}`} />
      </button>

      <span className={`text-xs font-bold my-1 tracking-tight ${getScoreColor()}`}>
        {score}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        aria-label="Downvote"
        className={`p-1 rounded hover:bg-[#272729] transition-colors ${
          userVote === -1 ? 'text-reddit-blue' : 'text-reddit-muted hover:text-white'
        }`}
      >
        <ArrowBigDown className={`w-6 h-6 ${userVote === -1 ? 'fill-reddit-blue' : ''}`} />
      </button>
    </div>
  );
};