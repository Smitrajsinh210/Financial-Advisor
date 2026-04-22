import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "local_development_secret_change_me";

const generateToken = (userId) =>
  jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

export default generateToken;
