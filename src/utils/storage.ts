import {
  fetchPayerNames as fetchPayerNamesAPI,
  addPayerNameToBackend,
  deletePayerNameFromBackend,
} from '../api/api';

const PAYER_NAMES_KEY = 'trip-expense-payer-names';

/**
 * Get all saved payer names from localStorage (cached)
 */
export function getPayerNamesFromCache(): string[] {
  try {
    const stored = localStorage.getItem(PAYER_NAMES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading payer names:', error);
    return [];
  }
}

/**
 * Save payer names to localStorage (cache)
 */
export function savePayerNamesToCache(names: string[]): void {
  try {
    localStorage.setItem(PAYER_NAMES_KEY, JSON.stringify(names));
  } catch (error) {
    console.error('Error saving payer names:', error);
  }
}

/**
 * Fetch payer names from backend and update cache
 */
export async function fetchPayerNames(): Promise<string[]> {
  try {
    const names = await fetchPayerNamesAPI();

    // Validate that we got an array of strings, not objects
    const validNames = Array.isArray(names)
      ? names.filter((name) => typeof name === 'string')
      : [];

    // If we got invalid data (objects instead of strings), fallback to cache
    if (validNames.length === 0 && names.length > 0) {
      console.error('Invalid payer names data received from backend');
      console.error('Expected: array of strings, Got:', names);
      console.warn('⚠️ Please update your Google Apps Script with the new code!');
      return getPayerNamesFromCache();
    }

    savePayerNamesToCache(validNames);
    return validNames;
  } catch (error) {
    console.error('Error fetching payer names from backend:', error);
    // Fallback to cache if backend fails
    return getPayerNamesFromCache();
  }
}

/**
 * Add a new payer name to backend and cache
 */
export async function addPayerName(name: string): Promise<string[]> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error('Name cannot be empty');
  }

  try {
    const updatedNames = await addPayerNameToBackend(trimmedName);
    savePayerNamesToCache(updatedNames);
    return updatedNames;
  } catch (error) {
    console.error('Error adding payer name:', error);
    throw error;
  }
}

/**
 * Remove a payer name from backend and cache
 */
export async function removePayerName(name: string): Promise<string[]> {
  try {
    const updatedNames = await deletePayerNameFromBackend(name);
    savePayerNamesToCache(updatedNames);
    return updatedNames;
  } catch (error) {
    console.error('Error removing payer name:', error);
    throw error;
  }
}
