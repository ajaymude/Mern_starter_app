/**
 * Detect client type from request headers
 * Returns 'web', 'mobile', or 'unknown'
 */
export const detectClient = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const platform = req.headers["x-platform"] || "";
  const clientType = req.headers["x-client-type"] || "";

  // Check explicit client type header (set by mobile apps)
  if (clientType === "mobile" || clientType === "react-native") {
    return "mobile";
  }

  // Check platform header (set by mobile apps)
  if (platform === "ios" || platform === "android") {
    return "mobile";
  }

  // Check user agent for mobile patterns
  const mobilePatterns = [
    /react-native/i,
    /okhttp/i, // Android HTTP client
    /cfnetwork/i, // iOS network library
  ];

  if (mobilePatterns.some((pattern) => pattern.test(userAgent))) {
    return "mobile";
  }

  // Default to web for browser requests
  return "web";
};
