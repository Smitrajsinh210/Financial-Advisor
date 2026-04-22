import { getAll, getOne, run } from "../config/db.js";

export const getAdminOverview = async (_req, res, next) => {
  try {
    const users = getOne(`SELECT COUNT(*) AS count FROM users`)?.count || 0;
    const transactions = getOne(`SELECT COUNT(*) AS count FROM transactions`)?.count || 0;
    const goals = getOne(`SELECT COUNT(*) AS count FROM goals`)?.count || 0;
    const userStats = getAll(`SELECT role AS _id, COUNT(*) AS total FROM users GROUP BY role`);
    const revenueAnalytics = getOne(`SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = 'income'`);
    const latestUsers = getAll(
      `SELECT id, name, email, role, avatar, language, currency, monthlyIncome, emailNotifications, isActive, createdAt, updatedAt
       FROM users ORDER BY datetime(createdAt) DESC LIMIT 8`
    ).map((row) => ({
      ...row,
      monthlyIncome: Number(row.monthlyIncome || 0),
      emailNotifications: Boolean(row.emailNotifications),
      isActive: Boolean(row.isActive)
    }));

    res.json({
      success: true,
      data: {
        totalUsers: users,
        totalTransactions: transactions,
        totalGoals: goals,
        revenue: revenueAnalytics[0]?.total || 0,
        userStats,
        latestUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = getOne(`SELECT id FROM users WHERE id = ?`, [req.params.id]);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    run(`DELETE FROM users WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
