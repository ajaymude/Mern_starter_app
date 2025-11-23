import { AppError } from "../utils/AppError.js";

export const notFound = (req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
};
