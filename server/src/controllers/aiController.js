import { getAll, getOne, run } from "../config/db.js";
import { getMonthRange, summarizeTransactions } from "../utils/financialInsights.js";
import { generateFinancialAdvice } from "../services/aiService.js";

const mapTransaction = (row) => ({ ...row, _id: row.id, amount: Number(row.amount), isRecurring: Boolean(row.isRecurring) });
const mapBudget = (row) => ({ ...row, _id: row.id, monthlyLimit: Number(row.monthlyLimit) });
const mapGoal = (row) => ({ ...row, _id: row.id, targetAmount: Number(row.targetAmount), savedAmount: Number(row.savedAmount) });
const mapChat = (row) => ({ ...row, _id: row.id });

export const getAdvisorInsights = async (req, res, next) => {
  try {
    const { start, end } = getMonthRange();
    const transactions = getAll(
      `SELECT * FROM transactions WHERE userId = ? AND datetime(date) >= datetime(?) AND datetime(date) <= datetime(?)`,
      [req.user.id, start.toISOString(), end.toISOString()]
    ).map(mapTransaction);
    const budgets = getAll(`SELECT * FROM budgets WHERE userId = ?`, [req.user.id]).map(mapBudget);
    const goals = getAll(`SELECT * FROM goals WHERE userId = ?`, [req.user.id]).map(mapGoal);

    const summary = summarizeTransactions(transactions, budgets, goals);
    const prompt =
      req.body.prompt ||
      "Provide monthly spending analysis, overspending alerts, savings guidance, debt reduction tips, investment beginner advice, and emergency fund planning.";
    const history = getAll(
      `SELECT * FROM chat_history WHERE userId = ? ORDER BY datetime(createdAt) DESC, id DESC LIMIT 8`,
      [req.user.id]
    )
      .map(mapChat)
      .reverse();

    const result = await generateFinancialAdvice({ user: req.user, summary, budgets, goals, prompt, history });
    const insert = run(
      `INSERT INTO chat_history (userId, question, response, createdAt, updatedAt)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [req.user.id, prompt, result.response]
    );
    const chat = mapChat(getOne(`SELECT * FROM chat_history WHERE id = ?`, [insert.lastInsertRowid]));

    res.json({
      success: true,
      data: {
        insights: result.response,
        summary,
        chat,
        history: [...history, chat]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const history = getAll(
      `SELECT * FROM chat_history WHERE userId = ? ORDER BY datetime(createdAt) DESC, id DESC`,
      [req.user.id]
    ).map(mapChat);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};
