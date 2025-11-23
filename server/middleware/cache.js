import logger from "../utils/logger.js";

const memoryCache = new Map();
const memoryCacheTTL = new Map();

export const cache = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    if (req.user) {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = memoryCache.get(key);
      const ttl = memoryCacheTTL.get(key);

      if (cachedData && ttl && Date.now() < ttl) {
        logger.debug("Cache hit", { key });
        const data =
          typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
        return res.json(data);
      } else {
        memoryCache.delete(key);
        memoryCacheTTL.delete(key);
      }

      const originalJson = res.json.bind(res);

      res.json = function (data) {
        const dataString = JSON.stringify(data);

        memoryCache.set(key, dataString);
        memoryCacheTTL.set(key, Date.now() + duration * 1000);

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

export const getCachedUserData = async (userId) => {
  try {
    const key = `user:${userId}`;
    const cachedData = memoryCache.get(key);
    const ttl = memoryCacheTTL.get(key);

    if (cachedData && ttl && Date.now() < ttl) {
      return typeof cachedData === "string"
        ? JSON.parse(cachedData)
        : cachedData;
    } else {
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
