import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { detectClient } from "../utils/detectClient.js";
import {
  invalidateUserCache,
  cacheUserData,
  getCachedUserData,
} from "../middleware/cache.js";
import logger from "../utils/logger.js";

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError("User already exists with this email", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  const clientType = detectClient(req);

  logger.info(`New user registered: ${user.email}`, {
    userId: user._id,
    email: user.email,
    clientType,
  });

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

  res.status(201).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      // Return token for mobile clients
      ...(clientType === "mobile" && { token, refreshToken }),
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logger.warn(`Failed login attempt for email: ${email}`, {
      email,
      ip: req.ip,
    });
    return next(new AppError("Invalid email or password", 401));
  }

  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  const clientType = detectClient(req);

  logger.info(`User logged in: ${user.email}`, {
    userId: user._id,
    email: user.email,
    ip: req.ip,
    clientType,
  });

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture || null,
    createdAt: user.createdAt,
  };
  await cacheUserData(user._id.toString(), userData, 3600);

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
      },
      // Return token for mobile clients
      ...(clientType === "mobile" && { token, refreshToken }),
    },
  });
});

export const getMe = asyncHandler(async (req, res, next) => {
  const userId = req.user?.id || req.user?._id?.toString() || req.user?._id;

  if (!userId) {
    return next(new AppError("User ID not found", 400));
  }

  const userIdString = userId.toString();

  try {
    const cachedUser = await getCachedUserData(userIdString);

    if (cachedUser) {
      return res.status(200).json({
        status: "success",
        data: {
          user: cachedUser,
        },
      });
    }

    const user = await User.findById(userIdString).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture || null,
      createdAt: user.createdAt,
    };

    await cacheUserData(userIdString, userData, 3600);

    return res.status(200).json({
      status: "success",
      data: {
        user: userData,
      },
    });
  } catch (error) {
    logger.error("Error in getMe", {
      error: error.message,
      userId: userIdString,
    });

    const user = await User.findById(userIdString).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture || null,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      status: "success",
      data: {
        user: userData,
      },
    });
  }
});

export const logout = asyncHandler(async (req, res) => {
  const clientType = detectClient(req);
  const userId = req.user?.id || req.user?._id?.toString() || req.user?._id;

  if (clientType === "web") {
    const cookieOptions = {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    };

    res.cookie("token", "", cookieOptions);
    res.cookie("refreshToken", "", cookieOptions);
    res.clearCookie("token", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
  }

  logger.info(`User logged out: ${req.user?.email || "unknown"}`, {
    userId: userId?.toString(),
    clientType,
  });

  if (userId) {
    try {
      await invalidateUserCache(userId.toString());
    } catch (error) {
      logger.error("Error invalidating user cache on logout", {
        error: error.message,
        userId: userId.toString(),
      });
    }
  }

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const clientType = detectClient(req);
  let refreshToken;

  if (clientType === "web") {
    refreshToken = req.cookies.refreshToken;
  } else {
    refreshToken = req.body.refreshToken;
  }

  if (!refreshToken) {
    return next(new AppError("Refresh token not provided", 401));
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    if (clientType === "web") {
      const cookieOptions = {
        expires: new Date(
          Date.now() +
            (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      };

      res.cookie("token", newToken, cookieOptions);
      res.cookie("refreshToken", newRefreshToken, {
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
        ...(clientType === "mobile" && {
          token: newToken,
          refreshToken: newRefreshToken,
        }),
      },
    });
  } catch (error) {
    return next(new AppError("Invalid or expired refresh token", 401));
  }
});
