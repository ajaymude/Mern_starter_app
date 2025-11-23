import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { detectClient } from "../utils/detectClient.js";
import { getCachedUserData, cacheUserData } from "../middleware/cache.js";
import logger from "../utils/logger.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const clientType = detectClient(req);

  // For web clients, check cookies first
  if (clientType === "web" && req.cookies.token) {
    token = req.cookies.token;
  }
  // For mobile clients or if no cookie, check Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to get user from cache first
    let user = await getCachedUserData(decoded.id);

    if (!user) {
      // If not in cache, fetch from database
      user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(
          new AppError(
            "The user belonging to this token no longer exists.",
            401
          )
        );
      }

      // Cache user data for 1 hour
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture || null,
        createdAt: user.createdAt,
      };
      await cacheUserData(decoded.id, userData, 3600);
      req.user = user;
    } else {
      // Convert cached data to Mongoose-like object
      req.user = {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        createdAt: user.createdAt,
      };
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again!", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError("Your token has expired! Please log in again.", 401)
      );
    }
    logger.error("Auth middleware error", {
      error,
      token: token.substring(0, 20),
    });
    return next(new AppError("Authentication failed", 401));
  }
});
