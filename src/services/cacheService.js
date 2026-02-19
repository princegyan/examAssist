/**
 * Cache Service
 * In-memory cache with TTL (Time-To-Live) support for API responses
 */

class CacheService {
  constructor() {
    this.cache = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes default
  }

  /**
   * Generate a cache key from endpoint and params
   */
  generateKey(endpoint, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&')
    return `${endpoint}${paramString ? `?${paramString}` : ''}`
  }

  /**
   * Get item from cache if valid
   */
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * Set item in cache with TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    })
  }

  /**
   * Check if cache has valid entry
   */
  has(key) {
    return this.get(key) !== null
  }

  /**
   * Delete specific cache entry
   */
  delete(key) {
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Clear cache entries matching a pattern
   */
  clearPattern(pattern) {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let validCount = 0
    let expiredCount = 0
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredCount++
      } else {
        validCount++
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries: validCount,
      expiredEntries: expiredCount
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Cache TTL presets (in milliseconds)
export const CACHE_TTL = {
  SHORT: 30 * 1000,        // 30 seconds - for frequently changing data
  MEDIUM: 5 * 60 * 1000,   // 5 minutes - default
  LONG: 30 * 60 * 1000,    // 30 minutes - for stable data
  HOUR: 60 * 60 * 1000,    // 1 hour - for rarely changing data
  DAY: 24 * 60 * 60 * 1000 // 1 day - for static data
}

// Singleton instance
const cacheService = new CacheService()

// Auto-cleanup every 5 minutes
setInterval(() => cacheService.cleanup(), 5 * 60 * 1000)

export default cacheService
