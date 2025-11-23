import mongoose from "mongoose";
import app from "./app.js";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import { validateEnv } from "./utils/validateEnv.js";

dotenv.config();
validateEnv();

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

if (!PORT) {
  logger.error("PORT is not set in environment variables");
  process.exit(1);
}

if (!MONGODB_URI) {
  logger.error("MONGODB_URI is not set in environment variables");
  process.exit(1);
}

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", {
    error: err,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

const mongooseOptions = {
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "100", 10),
  minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "10", 10),
  serverSelectionTimeoutMS: parseInt(
    process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || "5000",
    10
  ),
  socketTimeoutMS: parseInt(
    process.env.MONGODB_SOCKET_TIMEOUT_MS || "45000",
    10
  ),
  connectTimeoutMS: parseInt(
    process.env.MONGODB_CONNECT_TIMEOUT_MS || "10000",
    10
  ),
  family: parseInt(process.env.MONGODB_FAMILY || "4", 10),
  readPreference: process.env.MONGODB_READ_PREFERENCE || "primary",
  w: process.env.MONGODB_W || "majority",
  wtimeout: parseInt(process.env.MONGODB_WTIMEOUT || "5000", 10),
  retryWrites: process.env.MONGODB_RETRY_WRITES !== "false",
};

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    logger.info("✅ MongoDB connected successfully", {
      uri: MONGODB_URI.replace(/\/\/.*@/, "//***:***@"), // Hide credentials in logs
      options: mongooseOptions,
    });
  })
  .catch((err) => {
    logger.error("❌ MongoDB connection error", {
      error: err,
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || "development",
    port: PORT,
  });
});

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...", {
    error: err,
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  logger.info("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    logger.info("💥 Process terminated!");
    process.exit(0);
  });
});
