import mongoose from "mongoose";
import logger from "../utils/logger.js";

/**
 * Database connection configuration optimized for high traffic
 */
export const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  const options = {
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || "50", 10),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || "5", 10),
    serverSelectionTimeoutMS: parseInt(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || "5000",
      10
    ),
    socketTimeoutMS: parseInt(
      process.env.MONGODB_SOCKET_TIMEOUT_MS || "45000",
      10
    ),
    family: parseInt(process.env.MONGODB_FAMILY || "4", 10),
  };

  try {
    await mongoose.connect(MONGODB_URI, options);
    logger.info("✅ MongoDB connected successfully", {
      uri: MONGODB_URI.replace(/\/\/.*@/, "//***:***@"),
    });

    // Connection event handlers
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", { error: err });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });
  } catch (error) {
    logger.error("MongoDB connection failed", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};
