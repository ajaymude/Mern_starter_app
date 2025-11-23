import { randomUUID } from "crypto";

/**
 * Middleware to add a unique request ID to each request
 * Useful for tracing requests across services and debugging
 */
export const requestId = (req, res, next) => {
  // Generate or use existing request ID
  req.id = req.headers["x-request-id"] || randomUUID();
  
  // Add request ID to response headers
  res.setHeader("X-Request-ID", req.id);
  
  // Add to logger context (if using structured logging)
  req.loggerContext = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  };

  next();
};

