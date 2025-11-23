import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

// Security headers with Helmet
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Rate limiting - using in-memory store (works without Redis)
// For Redis-based distributed rate limiting, use rateLimiter.js
// General API limiter (in-memory, works without Redis)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  // Uses in-memory store by default (works without Redis)
});

// Strict rate limiting for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Data sanitization against NoSQL query injection
export const sanitizeMongo = mongoSanitize();

// Data sanitization against XSS
export const sanitizeXSS = xss();

// Prevent HTTP Parameter Pollution
export const preventHPP = hpp({
  whitelist: [
    "duration",
    "ratingsQuantity",
    "ratingsAverage",
    "maxGroupSize",
    "difficulty",
    "price",
  ],
});
