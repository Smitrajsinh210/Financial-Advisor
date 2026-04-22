import { getAll, getOne, run } from "../config/db.js";
import { getMonthRange, summarizeTransactions } from "../utils/financialInsights.js";

const mapTransaction = (row) => ({
  ...row,
  _id: row.id,
  amount: Number(row.amount),
  isRecurring: Boolean(row.isRecurring)
});
const mapBudget = (row) => ({ ...row, _id: row.id, monthlyLimit: Number(row.monthlyLimit) });
const mapGoal = (row) => ({
  ...row,
  _id: row.id,
  targetAmount: Number(row.targetAmount),
  savedAmount: Number(row.savedAmount)
});

export const getTransactions = async (req, res, next) => {
  try {
    const transactions = getAll(
      `SELECT * FROM transactions WHERE userId = ? ORDER BY datetime(date) DESC, id DESC`,
      [req.user.id]
    ).map(mapTransaction);
    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const result = run(
      `INSERT INTO transactions (userId, type, category, amount, note, date, isRecurring, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        req.user.id,
        req.body.type,
        req.body.category,
        Number(req.body.amount),
        req.body.note || "",
        req.body.date || new Date().toISOString(),
        req.body.isRecurring ? 1 : 0
      ]
    );
    const transaction = mapTransaction(getOne("SELECT * FROM transactions WHERE id = ?", [result.lastInsertRowid]));
    const { start, end } = getMonthRange();
    const monthlyTransactions = getAll(
      `SELECT * FROM transactions WHERE userId = ? AND datetime(date) >= datetime(?) AND datetime(date) <= datetime(?)`,
      [req.user.id, start.toISOString(), end.toISOString()]
    ).map(mapTransaction);
    const budgets = getAll(`SELECT * FROM budgets WHERE userId = ?`, [req.user.id]).map(mapBudget);
    const goals = getAll(`SELECT * FROM goals WHERE userId = ?`, [req.user.id]).map(mapGoal);
    const summary = summarizeTransactions(monthlyTransactions, budgets, goals);

    if (transaction.type === "expense") {
      const exceeded = summary.overspendingCategories.find((item) => item.category === transaction.category);

      if (exceeded) {
        run(
          `INSERT INTO notifications (userId, title, message, type, read, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            req.user.id,
            "Budget alert",
            `You exceeded your ${transaction.category} budget by ${exceeded.exceededBy.toFixed(2)}.`,
            "warning"
          ]
        );
      }
    }

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const existing = getOne(`SELECT * FROM transactions WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);
    if (!existing) {
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }
    const nextTransaction = {
      ...existing,
      ...req.body,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : Number(existing.amount),
      isRecurring: req.body.isRecurring !== undefined ? (req.body.isRecurring ? 1 : 0) : existing.isRecurring
    };
    run(
      `UPDATE transactions
       SET type = ?, category = ?, amount = ?, note = ?, date = ?, isRecurring = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ? AND userId = ?`,
      [
        nextTransaction.type,
        nextTransaction.category,
        nextTransaction.amount,
        nextTransaction.note || "",
        nextTransaction.date,
        nextTransaction.isRecurring,
        req.params.id,
        req.user.id
      ]
    );
    const transaction = mapTransaction(getOne(`SELECT * FROM transactions WHERE id = ?`, [req.params.id]));

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = getOne(`SELECT id FROM transactions WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);

    if (!transaction) {
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }

    run(`DELETE FROM transactions WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);
    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    next(error);
  }
};
