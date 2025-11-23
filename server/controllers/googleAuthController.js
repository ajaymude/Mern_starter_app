import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { detectClient } from "../utils/detectClient.js";
import logger from "../utils/logger.js";

// For ID token verification, we only need the client ID
// OAuth2Client can be initialized with just the client ID for verifyIdToken
const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not set in environment variables");
  }
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

// @desc    Get Google OAuth URL (for server-side flow)
// @route   GET /api/auth/google
// @access  Public
export const getGoogleAuthUrl = asyncHandler(async (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return next(new AppError("Google OAuth not fully configured", 500));
  }

  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });

  res.status(200).json({
    status: "success",
    data: {
      authUrl,
    },
  });
});

// @desc    Google OAuth Callback (for server-side flow)
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = asyncHandler(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new AppError("Authorization code not provided", 400));
  }

  if (!process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return next(new AppError("Google OAuth not fully configured", 500));
  }

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return next(new AppError("Email not provided by Google", 400));
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name: name || "Google User",
        email,
        password: `google_${googleId}`, // Dummy password, won't be used
        googleId,
        picture,
        isGoogleAuth: true,
      });

      logger.info(`New Google user registered: ${email}`, {
        userId: user._id,
        email,
        googleId,
      });
    } else {
      // Update existing user with Google info if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.isGoogleAuth = true;
        if (picture) user.picture = picture;
        await user.save();
      }

      logger.info(`Google user logged in: ${email}`, {
        userId: user._id,
        email,
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const clientType = detectClient(req);

    // Set cookie for web clients, return token for mobile
    if (clientType === "web") {
      const cookieOptions = {
        expires: new Date(
          Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      };

      res.cookie("token", token, cookieOptions);
      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        expires: new Date(
          Date.now() +
            (process.env.JWT_REFRESH_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
        ),
      });
    }

    // Redirect to frontend with token for mobile or success for web
    if (clientType === "mobile") {
      res.status(200).json({
        status: "success",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
          },
          token,
          refreshToken,
        },
      });
    } else {
      // For web, redirect to frontend with success
      const frontendUrl = process.env.FRONTEND_URL;
      
      if (!frontendUrl) {
        logger.error("FRONTEND_URL is not set in environment variables");
        return next(new AppError("Frontend URL not configured", 500));
      }
      res.redirect(`${frontendUrl}/auth/google/success?token=${token}`);
    }
  } catch (error) {
    logger.error("Google OAuth error", {
      error: error.message,
      stack: error.stack,
    });
    return next(new AppError("Google authentication failed", 401));
  }
});

// @desc    Verify Google Token (for client-side OAuth)
// @route   POST /api/auth/google/verify
// @access  Public
export const verifyGoogleToken = asyncHandler(async (req, res, next) => {
  const { credential } = req.body;

  if (!credential) {
    return next(new AppError("Google credential not provided", 400));
  }

  // Ensure credential is a string
  if (typeof credential !== "string") {
    logger.error("Google credential is not a string", {
      type: typeof credential,
      credential: credential?.toString().substring(0, 50),
    });
    return next(new AppError("Invalid Google credential format", 400));
  }

  // Validate credential format (should be a JWT token)
  if (!credential.includes(".") || credential.split(".").length !== 3) {
    logger.error("Google credential does not appear to be a valid JWT", {
      credentialLength: credential.length,
      hasDots: credential.includes("."),
    });
    return next(new AppError("Invalid Google credential format", 400));
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    logger.error("GOOGLE_CLIENT_ID is not set in environment variables");
    return next(new AppError("Google OAuth not configured", 500));
  }

  try {
    // Create a new client instance for ID token verification
    const client = getGoogleClient();

    // Verify the ID token (credential is now guaranteed to be a string)
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return next(new AppError("Email not provided by Google", 400));
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name: name || "Google User",
        email,
        password: `google_${googleId}`,
        googleId,
        picture,
        isGoogleAuth: true,
      });

      logger.info(`New Google user registered: ${email}`, {
        userId: user._id,
        email,
        googleId,
      });
    } else {
      // Update existing user with Google info if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.isGoogleAuth = true;
        if (picture) user.picture = picture;
        await user.save();
      }

      logger.info(`Google user logged in: ${email}`, {
        userId: user._id,
        email,
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const clientType = detectClient(req);

    // Set cookie for web clients
    if (clientType === "web") {
      const cookieOptions = {
        expires: new Date(
          Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      };

      res.cookie("token", token, cookieOptions);
      res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        expires: new Date(
          Date.now() +
            (process.env.JWT_REFRESH_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
        ),
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture || null,
          createdAt: user.createdAt,
        },
        // Return tokens for mobile
        ...(clientType === "mobile" && { token, refreshToken }),
      },
    });
  } catch (error) {
    logger.error("Google token verification error", {
      error: error.message,
      stack: error.stack,
      errorName: error.name,
      credentialLength: credential?.length,
      clientId: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not Set",
    });

    // Provide more specific error messages
    if (error.message?.includes("Invalid token signature")) {
      return next(new AppError("Invalid Google token signature", 401));
    }
    if (error.message?.includes("Token used too early") || error.message?.includes("Token used too late")) {
      return next(new AppError("Google token expired or invalid", 401));
    }
    if (error.message?.includes("Invalid audience")) {
      return next(new AppError("Google token audience mismatch. Please check GOOGLE_CLIENT_ID matches frontend", 401));
    }
    if (error.message?.includes("Token expired")) {
      return next(new AppError("Google token has expired. Please try again", 401));
    }

    // Return detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === "development" 
      ? `Google authentication failed: ${error.message}` 
      : "Google authentication failed";
    
    return next(new AppError(errorMessage, 401));
  }
});

