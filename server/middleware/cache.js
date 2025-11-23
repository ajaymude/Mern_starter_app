import logger from "../utils/logger.js";

// In-memory cache (no Redis needed)
const memoryCache = new Map();
const memoryCacheTTL = new Map();

/**
 * Cache middleware for API responses
 * Caches GET requests for specified duration
 */
export const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Skip cache for authenticated user-specific requests
    if (req.user) {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Check in-memory cache
      const cachedData = memoryCache.get(key);
      const ttl = memoryCacheTTL.get(key);
      
      if (cachedData && ttl && Date.now() < ttl) {
        logger.debug("Cache hit", { key });
        const data = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
        return res.json(data);
      } else {
        // Clean up expired entries
        memoryCache.delete(key);
        memoryCacheTTL.delete(key);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function (data) {
        const dataString = JSON.stringify(data);
        
        // Cache in memory
        memoryCache.set(key, dataString);
        memoryCacheTTL.set(key, Date.now() + duration * 1000);

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error("Cache middleware error", {
        error: error.message,
        key,
      });
      next();
    }
  };
};

/**
 * Clear cache by pattern
 */
export const clearCache = async (pattern) => {
  try {
    let count = 0;
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern.replace("*", ""))) {
        memoryCache.delete(key);
        memoryCacheTTL.delete(key);
        count++;
      }
    }
    logger.info("Cache cleared", { pattern, count });
  } catch (error) {
    logger.error("Clear cache error", { error: error.message, pattern });
  }
};

/**
 * Cache user data (with user-specific key)
 */
export const cacheUserData = async (userId, data, ttl = 3600) => {
  try {
    const key = `user:${userId}`;
    const dataString = JSON.stringify(data);
    
    memoryCache.set(key, dataString);
    memoryCacheTTL.set(key, Date.now() + ttl * 1000);
  } catch (error) {
    logger.error("Cache user data error", {
      error: error.message,
      userId,
    });
  }
};

/**
 * Get cached user data
 */
export const getCachedUserData = async (userId) => {
  try {
    const key = `user:${userId}`;
    const cachedData = memoryCache.get(key);
    const ttl = memoryCacheTTL.get(key);
    
    if (cachedData && ttl && Date.now() < ttl) {
      return typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
    } else {
      // Clean up expired entry
      memoryCache.delete(key);
      memoryCacheTTL.delete(key);
      return null;
    }
  } catch (error) {
    logger.error("Get cached user data error", {
      error: error.message,
      userId,
    });
    return null;
  }
};

/**
 * Invalidate user cache
 */
export const invalidateUserCache = async (userId) => {
  try {
    const key = `user:${userId}`;
    memoryCache.delete(key);
    memoryCacheTTL.delete(key);
  } catch (error) {
    logger.error("Invalidate user cache error", {
      error: error.message,
      userId,
    });
  }
};
