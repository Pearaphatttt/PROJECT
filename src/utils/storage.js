/**
 * Storage utility for localStorage operations
 * Only services and stores should use this module
 */

/**
 * Read JSON value from localStorage
 * @param {string} key - Storage key
 * @param {any} fallback - Default value if key doesn't exist or parse fails
 * @returns {any} Parsed JSON value or fallback
 */
export function readJSON(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return fallback;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to read JSON from localStorage key "${key}":`, e);
    return fallback;
  }
}

/**
 * Write JSON value to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 */
export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write JSON to localStorage key "${key}":`, e);
  }
}

/**
 * Remove a key from localStorage
 * @param {string} key - Storage key to remove
 */
export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to remove localStorage key "${key}":`, e);
  }
}
