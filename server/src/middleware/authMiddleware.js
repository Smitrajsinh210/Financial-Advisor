import jwt from "jsonwebtoken";
import { getOne, normalizeUser } from "../config/db.js";

const jwtSecret = process.env.JWT_SECRET || "local_development_secret_change_me";

export const protect = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Not authorized, token missing");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);
    const user = normalizeUser(
      getOne(
        `SELECT id, name, email, role, avatar, language, currency, monthlyIncome, emailNotifications, isActive, createdAt, updatedAt
         FROM users WHERE id = ?`,
        [decoded.id]
      )
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    const error = new Error("Access denied");
    error.statusCode = 403;
    return next(error);
  }

  next();
};
