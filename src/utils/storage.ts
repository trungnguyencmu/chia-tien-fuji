const CURRENT_TRIP_KEY = 'currentTripId';

/**
 * Get current trip ID from localStorage
 */
export function getCurrentTripId(): string | null {
  return localStorage.getItem(CURRENT_TRIP_KEY);
}

/**
 * Set current trip ID in localStorage
 */
export function setCurrentTripId(tripId: string): void {
  localStorage.setItem(CURRENT_TRIP_KEY, tripId);
}

/**
 * Clear current trip ID
 */
export function clearCurrentTripId(): void {
  localStorage.removeItem(CURRENT_TRIP_KEY);
}
