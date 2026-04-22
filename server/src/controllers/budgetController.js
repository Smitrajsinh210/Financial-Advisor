import { getAll, getOne, run } from "../config/db.js";

const mapBudget = (row) => ({ ...row, _id: row.id, monthlyLimit: Number(row.monthlyLimit) });

export const getBudgets = async (req, res, next) => {
  try {
    const budgets = getAll(`SELECT * FROM budgets WHERE userId = ? ORDER BY id DESC`, [req.user.id]).map(mapBudget);
    res.json({ success: true, data: budgets });
  } catch (error) {
    next(error);
  }
};

export const createBudget = async (req, res, next) => {
  try {
    run(
      `INSERT INTO budgets (userId, category, monthlyLimit, createdAt, updatedAt)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT(userId, category)
       DO UPDATE SET monthlyLimit = excluded.monthlyLimit, updatedAt = CURRENT_TIMESTAMP`,
      [req.user.id, req.body.category, Number(req.body.monthlyLimit)]
    );
    const budget = mapBudget(
      getOne(`SELECT * FROM budgets WHERE userId = ? AND category = ?`, [req.user.id, req.body.category])
    );

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const budget = getOne(`SELECT id FROM budgets WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);

    if (!budget) {
      const error = new Error("Budget not found");
      error.statusCode = 404;
      throw error;
    }

    run(`DELETE FROM budgets WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);
    res.json({ success: true, message: "Budget deleted successfully" });
  } catch (error) {
    next(error);
  }
};
