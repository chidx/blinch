/**
 * localStorage utilities for Blinch frontend
 * Provides type-safe localStorage operations with error handling
 */

const STORAGE_KEYS = {
  ACTIONS: 'blinch_actions',
  USER_ACTIONS: 'blinch_user_actions',
  SESSION: 'blinch_session',
} as const;

/**
 * Generic localStorage get with error handling
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Generic localStorage set with error handling
 */
export function setToLocalStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);

    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, attempting to clear old data...');
      // Could implement cleanup logic here
    }

    return false;
  }
}

/**
 * Generic localStorage remove with error handling
 */
export function removeFromLocalStorage(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const test = '__localStorage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all Blinch-related data from localStorage
 */
export function clearBlinchStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeFromLocalStorage(key);
  });
}

/**
 * Get approximate size of localStorage in bytes
 */
export function getLocalStorageSize(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  let total = 0;
  for (const key in window.localStorage) {
    if (window.localStorage.hasOwnProperty(key)) {
      total += window.localStorage[key].length + key.length;
    }
  }
  return total;
}

export { STORAGE_KEYS };
