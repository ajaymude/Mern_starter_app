import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

const memoryStore = new Map();

class MemoryStore {
  async increment(key) {
    try {
      const now = Date.now();
      const windowMs = 900000;
      const stored = memoryStore.get(key);
      
      if (!stored || now > stored.resetTime) {
        memoryStore.set(key, { count: 1, resetTime: now + windowMs });
        return { totalHits: 1, resetTime: new Date(now + windowMs) };
      } else {
        stored.count++;
        memoryStore.set(key, stored);
        return { totalHits: stored.count, resetTime: new Date(stored.resetTime) };
      }
    } catch (error) {
      logger.error("Rate limit error", { error: error.message, key });
      return { totalHits: 1, resetTime: new Date() };
    }
  }

  async decrement(key) {
    try {
      const stored = memoryStore.get(key);
      if (stored && stored.count > 0) {
        stored.count--;
        memoryStore.set(key, stored);
      }
    } catch (error) {
      logger.error("Rate limit decrement error", {
        error: error.message,
        key,
      });
    }
  }

  async resetKey(key) {
    try {
      memoryStore.delete(key);
    } catch (error) {
      logger.error("Rate limit reset error", {
        error: error.message,
        key,
      });
    }
  }

  shutdown() {
    memoryStore.clear();
  }
}

const rateLimitStore = new MemoryStore();

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
  skip: (req) => {
    return req.path === "/api/monitoring/health";
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
});

export const googleAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many Google authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
  skipSuccessfulRequests: true,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many password reset attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
});
