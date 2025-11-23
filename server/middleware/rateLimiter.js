import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

// In-memory store for rate limiting
const memoryStore = new Map();

// In-memory rate limit store
class MemoryStore {
  async increment(key) {
    try {
      const now = Date.now();
      const windowMs = 900000; // 15 minutes
      const stored = memoryStore.get(key);
      
      if (!stored || now > stored.resetTime) {
        // New window
        memoryStore.set(key, { count: 1, resetTime: now + windowMs });
        return { totalHits: 1, resetTime: new Date(now + windowMs) };
      } else {
        // Increment existing
        stored.count++;
        memoryStore.set(key, stored);
        return { totalHits: stored.count, resetTime: new Date(stored.resetTime) };
      }
    } catch (error) {
      logger.error("Rate limit error", { error: error.message, key });
      // Fallback: allow request if rate limiting fails
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
    // Clean up
    memoryStore.clear();
  }
}

// Use in-memory store
const rateLimitStore = new MemoryStore();

// General API rate limiter (optimized for high traffic)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for high traffic
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/monitoring/health";
  },
});

// Strict rate limiting for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false,
});

// Rate limiter for Google OAuth
export const googleAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 Google auth attempts per 15 minutes
  message: "Too many Google authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
  skipSuccessfulRequests: true,
});

// Rate limiter for user registration
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: "Too many registration attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
});

// Rate limiter for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: "Too many password reset attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  store: rateLimitStore,
});
