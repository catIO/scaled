/**
 * Returns a Date object stripped of time components (00:00:00.000 in local timezone).
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

/**
 * Returns a 'YYYY-MM-DD' string formatted in local timezone.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a 'YYYY-MM-DD' string as a Date at 00:00:00 in local timezone.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return getStartOfDay();
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return getStartOfDay(new Date(dateStr));
}

/**
 * Returns a 'YYYY-MM-DD' key for the given date in local timezone.
 */
export function getDayKey(date: Date = new Date()): string {
  return getLocalDateString(getStartOfDay(date));
}
