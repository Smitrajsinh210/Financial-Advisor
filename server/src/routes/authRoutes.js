import { Router } from "express";
import { body } from "express-validator";
import { forgotPassword, loginUser, registerUser } from "../controllers/authController.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  validateRequest,
  registerUser
);

router.post(
  "/login",
  [body("email").isEmail().withMessage("Valid email is required"), body("password").notEmpty().withMessage("Password is required")],
  validateRequest,
  loginUser
);

router.post("/forgot-password", [body("email").isEmail().withMessage("Valid email is required")], validateRequest, forgotPassword);

export default router;
