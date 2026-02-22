/**
 * Get a random finger combination for a scale.
 * Returns a random pattern from user-defined patterns, or null if none are selected.
 */
export function getRandomFingerCombination(
  scaleName: string,
  userPatterns?: string[]
): string | null {
  if (!userPatterns || userPatterns.length === 0) {
    return null;
  }
  
  const index = Math.floor(Math.random() * userPatterns.length);
  return userPatterns[index];
}

const RECENT_SIZE = 3;

/**
 * Get the next finger combination, preferring patterns not recently used
 * to avoid too many duplicates in a row.
 * Returns the chosen pattern and the updated recent list (for caller to store).
 */
export function getNextFingerCombination(
  userPatterns: string[],
  recentlyUsed: string[]
): { pattern: string; newRecent: string[] } | null {
  if (!userPatterns || userPatterns.length === 0) {
    return null;
  }

  // Prefer patterns that haven't been used recently
  const available = userPatterns.filter((p) => !recentlyUsed.includes(p));
  const pool = available.length > 0 ? available : userPatterns;
  const index = Math.floor(Math.random() * pool.length);
  const pattern = pool[index];

  const newRecent = [...recentlyUsed, pattern].slice(-RECENT_SIZE);
  return { pattern, newRecent };
}
