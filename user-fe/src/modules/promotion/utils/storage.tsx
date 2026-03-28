/**
 * Safe localStorage wrapper
 */

const isClient = typeof window !== 'undefined'

/**
 * Get item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue

  try {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    return JSON.parse(item) as T
  } catch {
    return defaultValue
  }
}

/**
 * Set item to localStorage
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (!isClient) return false

  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (!isClient) return false

  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

/**
 * Clear localStorage
 */
export function clearStorage(): boolean {
  if (!isClient) return false

  try {
    localStorage.clear()
    return true
  } catch {
    return false
  }
}

// Storage keys
export const STORAGE_KEYS = {
  CART: 'shophub_cart',
  FAVORITES: 'shophub_favorites',
  USER_PREFERENCES: 'shophub_preferences',
  SEARCH_HISTORY: 'shophub_search_history',
} as const
