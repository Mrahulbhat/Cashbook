// utils/cache.js

const cache = {};
const MAX_KEYS = 100;

/**
 * Set cache with TTL
 * @param {string} key
 * @param {any} data
 * @param {number} ttl - time to live in ms (default 60s)
 */
export const setCache = (key, data, ttl = 60000) => {
  // Prevent unlimited memory growth
  if (Object.keys(cache).length >= MAX_KEYS) {
    const firstKey = Object.keys(cache)[0];
    delete cache[firstKey];
  }

  cache[key] = {
    data,
    expiry: Date.now() + ttl,
  };
};

/**
 * Get cached value
 * @param {string} key
 * @returns cached data or null
 */
export const getCache = (key) => {
  const cached = cache[key];
  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    delete cache[key];
    return null;
  }

  return cached.data;
};

/**
 * Clear single cache key
 * @param {string} key
 */
export const clearCache = (key) => {
  delete cache[key];
};

/**
 * Clear multiple cache keys by prefix
 * @param {string} prefix
 */
export const clearCacheByPrefix = (prefix) => {
  Object.keys(cache).forEach((key) => {
    if (key.startsWith(prefix)) {
      delete cache[key];
    }
  });
};
