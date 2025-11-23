import logger from "../utils/logger.js";

export const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const requestId = req.id || req.headers["x-request-id"];

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const duration = Date.now() - startTime;

    const slowRequestThreshold = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || "1000", 10);
    const verySlowRequestThreshold = parseInt(process.env.VERY_SLOW_REQUEST_THRESHOLD_MS || "5000", 10);

    if (duration > slowRequestThreshold) {
      logger.warn("Slow request detected", {
        requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        userAgent: req.get("user-agent"),
        ip: req.ip,
      });
    }

    if (duration > verySlowRequestThreshold) {
      logger.error("Very slow request detected", {
        requestId,
        method: req.method,
        url: req.originalUrl || req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }

    try {
      if (!res.headersSent) {
        res.setHeader("X-Response-Time", `${duration}ms`);
      }
    } catch (error) {
      // Ignore
    }

    return originalJson(body);
  };

  next();
};

export const requestTimeout = (timeout) => {
  const defaultTimeout = parseInt(process.env.REQUEST_TIMEOUT || "30000", 10);
  timeout = timeout || defaultTimeout;
  return (req, res, next) => {
    let timeoutId = null;

    timeoutId = setTimeout(() => {
      if (!res.headersSent && !res.writableEnded) {
        try {
          res.status(504).json({
            status: "error",
            message: "Request timeout",
          });
          logger.error("Request timeout", {
            method: req.method,
            url: req.originalUrl || req.url,
            timeout: `${timeout}ms`,
          });
        } catch (error) {
          logger.error("Error sending timeout response", {
            error: error.message,
          });
        }
      }
    }, timeout);

    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      return originalJson(body);
    };

    res.on("finish", () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });

    res.on("close", () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });

    next();
  };
};
