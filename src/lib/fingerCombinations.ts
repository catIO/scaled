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
