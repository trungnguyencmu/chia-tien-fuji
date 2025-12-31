import {
  fetchPayerNames as fetchPayerNamesAPI,
  addPayerNameToBackend,
  deletePayerNameFromBackend,
} from '../api/api';

const PAYER_NAMES_CACHE_KEY = 'payerNamesCache';
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

/**
 * Get payer names from cache (with trip ID)
 */
export function getPayerNamesFromCache(): string[] {
  const tripId = getCurrentTripId();
  if (!tripId) return [];

  try {
    const cached = localStorage.getItem(`${PAYER_NAMES_CACHE_KEY}_${tripId}`);
    if (cached) {
      const names = JSON.parse(cached);
      return Array.isArray(names) ? names.filter((n) => typeof n === 'string') : [];
    }
  } catch (error) {
    console.error('Error reading payer names from cache:', error);
  }
  return [];
}

/**
 * Save payer names to cache (with trip ID)
 */
export function savePayerNamesToCache(names: string[]): void {
  const tripId = getCurrentTripId();
  if (!tripId) return;

  try {
    const validNames = names.filter((name) => typeof name === 'string');
    localStorage.setItem(`${PAYER_NAMES_CACHE_KEY}_${tripId}`, JSON.stringify(validNames));
  } catch (error) {
    console.error('Error saving payer names to cache:', error);
  }
}

/**
 * Fetch payer names from backend (requires current trip)
 */
export async function fetchPayerNames(): Promise<string[]> {
  const tripId = getCurrentTripId();
  if (!tripId) {
    console.warn('⚠️ No trip selected - cannot fetch payer names');
    return [];
  }

  try {
    console.log('Fetching payer names for trip:', tripId);
    const names = await fetchPayerNamesAPI(tripId);
    console.log('Received payer names:', names);

    // Validate that we got an array of strings
    const validNames = Array.isArray(names)
      ? names.filter((name) => typeof name === 'string')
      : [];

    if (validNames.length === 0 && names.length > 0) {
      console.error('Invalid payer names data received from backend');
      console.error('Expected array of strings, got:', names);
      console.warn('⚠️ Please update your Google Apps Script with the new code!');
      return getPayerNamesFromCache();
    }

    savePayerNamesToCache(validNames);
    return validNames;
  } catch (error) {
    console.error('Failed to fetch payer names:', error);
    // Fallback to cache if backend fails
    return getPayerNamesFromCache();
  }
}

/**
 * Add a payer name (requires current trip)
 */
export async function addPayerName(name: string): Promise<string[]> {
  const tripId = getCurrentTripId();
  if (!tripId) {
    throw new Error('No trip selected');
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Name cannot be empty');
  }

  const updatedNames = await addPayerNameToBackend(tripId, trimmedName);
  savePayerNamesToCache(updatedNames);
  return updatedNames;
}

/**
 * Remove a payer name (requires current trip)
 */
export async function removePayerName(name: string): Promise<string[]> {
  const tripId = getCurrentTripId();
  if (!tripId) {
    throw new Error('No trip selected');
  }

  const updatedNames = await deletePayerNameFromBackend(tripId, name);
  savePayerNamesToCache(updatedNames);
  return updatedNames;
}
