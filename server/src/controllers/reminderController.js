import { getAll, getOne, run } from "../config/db.js";

export const getReminders = async (req, res, next) => {
  try {
    const reminders = getAll(
      `SELECT * FROM notifications WHERE userId = ? ORDER BY datetime(createdAt) DESC, id DESC`,
      [req.user.id]
    ).map((row) => ({ ...row, _id: row.id, read: Boolean(row.read) }));
    res.json({ success: true, data: reminders });
  } catch (error) {
    next(error);
  }
};

export const markReminderAsRead = async (req, res, next) => {
  try {
    const existing = getOne(`SELECT * FROM notifications WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);

    if (!existing) {
      const error = new Error("Reminder not found");
      error.statusCode = 404;
      throw error;
    }
    run(`UPDATE notifications SET read = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);
    const reminder = { ...getOne(`SELECT * FROM notifications WHERE id = ?`, [req.params.id]), _id: Number(req.params.id), read: true };

    res.json({ success: true, data: reminder });
  } catch (error) {
    next(error);
  }
};
