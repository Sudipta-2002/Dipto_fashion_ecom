// High-performance Stale-While-Revalidate (SWR) Client-Side Data Cache
const memoryCache = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 Minutes

/**
 * Get data from memory or persistent localStorage cache
 */
export const getCache = (key) => {
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key);
    if (Date.now() < entry.expiry) {
      return entry.data;
    }
    memoryCache.delete(key);
  }

  try {
    const local = localStorage.getItem(`df_cache_${key}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (Date.now() < parsed.expiry) {
        memoryCache.set(key, parsed);
        return parsed.data;
      } else {
        localStorage.removeItem(`df_cache_${key}`);
      }
    }
  } catch (e) {
    // Fallback gracefully
  }
  return null;
};

/**
 * Save data into memory + localStorage persistent cache
 */
export const setCache = (key, data, ttlMs = DEFAULT_TTL_MS) => {
  const expiry = Date.now() + ttlMs;
  const entry = { data, expiry };
  memoryCache.set(key, entry);

  try {
    localStorage.setItem(`df_cache_${key}`, JSON.stringify(entry));
  } catch (e) {
    // Ignore storage quota errors
  }
};

/**
 * Clear specific key or all cache
 */
export const clearCache = (key) => {
  if (key) {
    memoryCache.delete(key);
    try {
      localStorage.removeItem(`df_cache_${key}`);
    } catch (e) {}
  } else {
    memoryCache.clear();
  }
};

/**
 * Smart Fetch wrapper supporting Stale-While-Revalidate caching pattern
 */
export const fetchWithCache = async (key, fetcherFn, { ttlMs = DEFAULT_TTL_MS, forceRefresh = false } = {}) => {
  // 1. Check cache first unless force refresh requested
  if (!forceRefresh) {
    const cached = getCache(key);
    if (cached !== null) {
      // Trigger background revalidation asynchronously
      fetcherFn()
        .then((fresh) => {
          if (fresh) setCache(key, fresh, ttlMs);
        })
        .catch(() => {});
      return { data: cached, isCached: true };
    }
  }

  // 2. Fetch fresh data
  const freshData = await fetcherFn();
  if (freshData !== null && freshData !== undefined) {
    setCache(key, freshData, ttlMs);
  }
  return { data: freshData, isCached: false };
};
