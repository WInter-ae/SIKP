/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Format date to Indonesian locale with time
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "12 Februari 2026, 14:30")
 */
export function formatDateTimeIndonesia(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date to Indonesian locale without time
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "12 Februari 2026")
 */
export function formatDateIndonesia(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Subtract milliseconds from a date
 * @param date - Source date
 * @param milliseconds - Milliseconds to subtract
 * @returns New Date object
 */
export function subtractMilliseconds(date: Date, milliseconds: number): Date {
  return new Date(date.getTime() - milliseconds);
}

/**
 * Add milliseconds to a date
 * @param date - Source date
 * @param milliseconds - Milliseconds to add
 * @returns New Date object
 */
export function addMilliseconds(date: Date, milliseconds: number): Date {
  return new Date(date.getTime() + milliseconds);
}

/**
 * Check if a date is valid
 * @param date - Date to validate
 * @returns true if valid date
 */
export function isValidDate(date: unknown): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}
