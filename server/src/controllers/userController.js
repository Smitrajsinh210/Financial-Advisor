import { getAll, normalizeUser, run } from "../config/db.js";

export const getProfile = async (req, res, next) => {
  try {
    const notifications = getAll(
      `SELECT id, userId, title, message, type, read, createdAt, updatedAt
       FROM notifications WHERE userId = ? ORDER BY datetime(createdAt) DESC LIMIT 6`,
      [req.user.id]
    ).map((row) => ({ ...row, read: Boolean(row.read) }));

    res.json({
      success: true,
      data: {
        user: req.user,
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "avatar", "language", "currency", "monthlyIncome", "emailNotifications"];
    const nextUser = { ...req.user };
    allowedFields.forEach((field) => {
      if (field in req.body) nextUser[field] = req.body[field];
    });
    run(
      `UPDATE users
       SET name = ?, avatar = ?, language = ?, currency = ?, monthlyIncome = ?, emailNotifications = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        nextUser.name,
        nextUser.avatar || "",
        nextUser.language,
        nextUser.currency,
        Number(nextUser.monthlyIncome || 0),
        nextUser.emailNotifications ? 1 : 0,
        req.user.id
      ]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: normalizeUser({
        ...nextUser,
        password: req.user.password,
        id: req.user.id
      })
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (_req, res, next) => {
  try {
    const users = getAll(
      `SELECT id, name, email, role, avatar, language, currency, monthlyIncome, emailNotifications, isActive, createdAt, updatedAt
       FROM users ORDER BY datetime(createdAt) DESC`
    ).map(normalizeUser);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
