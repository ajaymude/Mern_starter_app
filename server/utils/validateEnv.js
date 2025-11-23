/**
 * Validates environment variables on application startup
 * Fails fast if required variables are missing
 */

const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "PORT",
  "FRONTEND_URL",
];

const optionalEnvVars = {
  NODE_ENV: "development",
  JWT_EXPIRE: "7d",
  JWT_REFRESH_EXPIRE: "30d",
  JWT_COOKIE_EXPIRE: "7",
  JWT_REFRESH_COOKIE_EXPIRE: "30",
  CORS_ORIGIN: "*",
  LOG_LEVEL: "info",
  REQUEST_TIMEOUT: "30000",
  SLOW_REQUEST_THRESHOLD_MS: "1000",
  VERY_SLOW_REQUEST_THRESHOLD_MS: "5000",
  MONGODB_MAX_POOL_SIZE: "100",
  MONGODB_MIN_POOL_SIZE: "10",
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: "5000",
  MONGODB_SOCKET_TIMEOUT_MS: "45000",
  MONGODB_CONNECT_TIMEOUT_MS: "10000",
  MONGODB_FAMILY: "4",
  MONGODB_W: "majority",
  MONGODB_WTIMEOUT: "5000",
  MONGODB_RETRY_WRITES: "true",
};

export const validateEnv = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push(
      "JWT_SECRET should be at least 32 characters long for security"
    );
  }

  // Set defaults for optional variables
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  });

  // Fail if required variables are missing
  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\nPlease check your .env file.");
    process.exit(1);
  }

  // Warn about security issues
  if (warnings.length > 0) {
    console.warn("⚠️  Environment variable warnings:");
    warnings.forEach((warning) => {
      console.warn(`   - ${warning}`);
    });
  }

  // Warn about production settings
  if (process.env.NODE_ENV === "production") {
    if (process.env.CORS_ORIGIN === "*") {
      console.warn(
        "⚠️  CORS_ORIGIN is set to '*' in production. Consider restricting to specific origins."
      );
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      console.warn(
        "⚠️  JWT_SECRET is too short for production. Use at least 32 characters."
      );
    }
  }

  console.log("✅ Environment variables validated");
};

