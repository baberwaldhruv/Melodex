const { REDDIT_EPOCH, GRAVITY_FACTOR } = require('../constants/ranking');

/**
 * Calculates Reddit's "Hot" score.
 * Formula: hot_score = sign(score) * log10(max(|score|, 1)) + (seconds_since_epoch / 45000)
 *
 * @param {number} upvotes
 * @param {number} downvotes
 * @param {Date|string|number} createdAt
 * @returns {number}
 */
const calculateHotScore = (upvotes, downvotes, createdAt) => {
  const score = upvotes - downvotes;

  // Determine vote direction
  let sign = 0;
  if (score > 0) {
    sign = 1;
  } else if (score < 0) {
    sign = -1;
  }

  // Logarithmic weight of vote count (magnitude)
  const order = Math.log10(Math.max(Math.abs(score), 1));

  // Time component: epoch delta in seconds
  const postDateInSeconds = Math.floor(new Date(createdAt).getTime() / 1000);
  const secondsSinceEpoch = postDateInSeconds - REDDIT_EPOCH;

  // Combine magnitude and time decay
  const hotScore = sign * order + secondsSinceEpoch / GRAVITY_FACTOR;

  // Rounded to 7 decimal places for database storage efficiency
  return parseFloat(hotScore.toFixed(7));
};

module.exports = {
  calculateHotScore,
};