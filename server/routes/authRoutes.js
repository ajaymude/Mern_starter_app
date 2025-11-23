import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  refreshToken,
} from "../controllers/authController.js";
import {
  getGoogleAuthUrl,
  googleCallback,
  verifyGoogleToken,
} from "../controllers/googleAuthController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRegister, validateLogin } from "../middleware/validation.js";
import { authLimiter } from "../middleware/security.js";
import rateLimit from "express-rate-limit";

// Additional rate limiters (in-memory, works without Redis)
const googleAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 Google auth attempts per 15 minutes
  message: "Too many Google authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: "Too many registration attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

// Regular auth routes (with optimized rate limiting)
router.post("/register", registerLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/logout", protect, logout);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);

// Google OAuth routes
router.get("/google", getGoogleAuthUrl);
router.get("/google/callback", googleCallback);
router.post("/google/verify", googleAuthLimiter, verifyGoogleToken);

export default router;

