import express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import logger from "./utils/logger.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import monitoringRoutes from "./routes/monitoringRoutes.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requestId } from "./middleware/requestId.js";
import {
  securityHeaders,
  apiLimiter,
  sanitizeMongo,
  sanitizeXSS,
  preventHPP,
} from "./middleware/security.js";
import {
  performanceMonitor,
  requestTimeout,
} from "./middleware/performance.js";

// Load environment variables
dotenv.config();

const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy (important for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Request ID middleware (add unique ID to each request)
app.use(requestId);

// Performance monitoring
app.use(performanceMonitor);
app.use(requestTimeout(parseInt(process.env.REQUEST_TIMEOUT || "30000", 10)));

// Security middleware (must be first)
app.use(securityHeaders);
app.use(sanitizeMongo);
app.use(sanitizeXSS);
app.use(preventHPP);

// Compression middleware (reduce response size)
app.use(compression());

// CORS configuration - Support for web and mobile
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL]
        : [];

    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development, restrict in production
    }
  },
  credentials: true, // Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Platform",
    "X-Client-Type",
    "Accept",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Cookie parser middleware (for web authentication)
app.use(cookieParser());

// Body parser middleware (optimized limits for high traffic)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Increase JSON parser limit for specific routes if needed
// app.use('/api/upload', express.json({ limit: '5mb' }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // Custom morgan format for production
  morgan.token("user", (req) => req.user?.id || "anonymous");
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// Rate limiting (apply to all API routes)
// Uses in-memory store
app.use("/api/", apiLimiter);

// Monitoring routes (before rate limiting)
app.use("/api/monitoring", monitoringRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "../client/build"), {
      maxAge: "1y", // Cache static assets for 1 year
      etag: true,
      lastModified: true,
      // Aggressive caching for static assets
      immutable: true,
      // Cache control headers
      setHeaders: (res, path) => {
        // Cache JavaScript and CSS files aggressively
        if (path.endsWith(".js") || path.endsWith(".css")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
        // Cache images
        if (path.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/i)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  // Serve React app for all non-API routes (no cache for HTML)
  app.get("*", (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
