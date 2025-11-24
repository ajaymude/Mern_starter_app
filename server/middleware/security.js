import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://*.google.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://fonts.googleapis.com",
        "https://*.google.com",
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://apis.google.com",
        "https://*.google.com",
      ],
      connectSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://oauth2.googleapis.com",
        "https://www.googleapis.com",
        "https://*.google.com",
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://*.google.com",
      ],
      childSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://*.google.com",
        "blob:",
      ],
      imgSrc: ["'self'", "data:", "https:", "https://*.google.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'", "https://accounts.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const sanitizeMongo = mongoSanitize();
export const sanitizeXSS = xss();

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
