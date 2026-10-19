// Base epoch reference timestamp (Jan 1, 2024 00:00:00 UTC in seconds)
const REDDIT_EPOCH = 1704067200;

// Halflife factor: roughly 45000 seconds (12.5 hours) for logarithmic vote decay
const GRAVITY_FACTOR = 45000;

module.exports = {
  REDDIT_EPOCH,
  GRAVITY_FACTOR,
};