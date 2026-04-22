import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getOne, normalizeUser, run } from "../config/db.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../services/mailService.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = getOne("SELECT id FROM users WHERE email = ?", [email]);

    if (existingUser) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = run(
      `INSERT INTO users (name, email, password, createdAt, updatedAt)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [name, email.toLowerCase(), hashedPassword]
    );
    const user = normalizeUser(getOne("SELECT * FROM users WHERE id = ?", [result.lastInsertRowid]));

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
          currency: user.currency
        },
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = normalizeUser(getOne("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          language: user.language,
          currency: user.currency,
          monthlyIncome: user.monthlyIncome,
          emailNotifications: user.emailNotifications
        },
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = normalizeUser(getOne("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]));

    if (!user) {
      res.json({
        success: true,
        message: "If an account exists for this email, a reset link has been prepared."
      });
      return;
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    run(
      `UPDATE users SET resetToken = ?, resetTokenExpiresAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [resetToken, new Date(Date.now() + 1000 * 60 * 30).toISOString(), user.id]
    );

    const resetUrl = `${process.env.APP_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `<p>Hello ${user.name},</p><p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    });

    res.json({
      success: true,
      message: "Password reset instructions sent if email delivery is configured.",
      data: { resetUrl }
    });
  } catch (error) {
    next(error);
  }
};
