import logger from "../utils/logger.js";
import { AppError } from "../utils/AppError.js";

// Handle Mongoose cast errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle Mongoose duplicate field errors
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Handle Mongoose validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

// Send error response in development
const sendErrorDev = (err, res) => {
  // Check if response has already been sent
  if (res.headersSent) {
    return;
  }

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Check if response has already been sent
  if (res.headersSent) {
    return;
  }

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

export const errorHandler = (err, req, res, _next) => {
  // Check if response has already been sent
  if (res.headersSent) {
    // If headers already sent, just log the error
    logger.error("Error after response sent", {
      error: err.message,
      url: req.originalUrl,
      method: req.method,
    });
    return;
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error
  logger.error(`${err.statusCode} - ${err.message}`, {
    error: err,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id || req.user?._id || "anonymous",
  });

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }
    if (error.name === "JsonWebTokenError") {
      error = handleJWTError();
    }
    if (error.name === "TokenExpiredError") {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};
