export const detectClient = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const platform = req.headers["x-platform"] || "";
  const clientType = req.headers["x-client-type"] || "";

  if (clientType === "mobile" || clientType === "react-native") {
    return "mobile";
  }

  if (platform === "ios" || platform === "android") {
    return "mobile";
  }

  const mobilePatterns = [/react-native/i, /okhttp/i, /cfnetwork/i];

  if (mobilePatterns.some((pattern) => pattern.test(userAgent))) {
    return "mobile";
  }

  return "web";
};
