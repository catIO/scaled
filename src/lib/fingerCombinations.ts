const FINGER_COMBINATIONS = ['im','mi', 'ma', 'am'] as const;

/**
 * Get a random finger combination.
 * Returns a different combination each time called.
 */
export function getRandomFingerCombination(): string {
  const index = Math.floor(Math.random() * FINGER_COMBINATIONS.length);
  return FINGER_COMBINATIONS[index];
}
