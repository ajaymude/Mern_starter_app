import express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import logger from "./utils/logger.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import monitoringRoutes from "./routes/monitoringRoutes.js";

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

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);

app.use(requestId);
app.use(performanceMonitor);
app.use(requestTimeout(parseInt(process.env.REQUEST_TIMEOUT || "30000", 10)));

app.use(securityHeaders);
app.use(sanitizeMongo);
app.use(sanitizeXSS);
app.use(preventHPP);

app.use(compression());
const corsOptions = {
  origin: function (origin, callback) {
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
      callback(null, true);
    }
  },
  credentials: true,
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
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  morgan.token("user", (req) => req.user?.id || "anonymous");
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

app.use("/api/", apiLimiter);
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "../client/build"), {
      maxAge: "1y",
      etag: true,
      lastModified: true,
      immutable: true,
      setHeaders: (res, path) => {
        if (path.endsWith(".js") || path.endsWith(".css")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
        if (path.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/i)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  app.get("*", (req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
