import { getAll, getOne, run } from "../config/db.js";
import {
  calculateLiveRoomSummary,
  ensureRoomMember,
  getMonthKeyFromExpenseDate,
  recalculateMonthlySummary
} from "../services/familySummaryService.js";

const mapExpense = (row) => ({
  ...row,
  _id: Number(row.id),
  roomId: Number(row.roomId),
  userId: Number(row.userId),
  amount: Number(row.amount)
});

export const addFamilyExpense = async (req, res, next) => {
  try {
    const roomId = Number(req.body.roomId);
    ensureRoomMember(roomId, req.user.id);

    const result = run(
      `INSERT INTO family_expenses (roomId, userId, title, amount, category, date, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        roomId,
        req.user.id,
        req.body.title,
        Number(req.body.amount),
        req.body.category,
        req.body.date || new Date().toISOString().slice(0, 10)
      ]
    );

    const expense = mapExpense(getOne(`SELECT * FROM family_expenses WHERE id = ?`, [result.lastInsertRowid]));
    recalculateMonthlySummary(roomId, getMonthKeyFromExpenseDate(expense.date));

    res.status(201).json({
      success: true,
      data: {
        expense,
        liveSummary: calculateLiveRoomSummary(roomId)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getFamilyExpenses = async (req, res, next) => {
  try {
    const roomId = Number(req.params.roomId);
    ensureRoomMember(roomId, req.user.id);

    const expenses = getAll(
      `SELECT fe.*, u.name AS userName
       FROM family_expenses fe
       JOIN users u ON u.id = fe.userId
       WHERE fe.roomId = ?
       ORDER BY datetime(fe.date) DESC, fe.id DESC`,
      [roomId]
    ).map(mapExpense);

    res.json({
      success: true,
      data: {
        expenses,
        liveSummary: calculateLiveRoomSummary(roomId)
      }
    });
  } catch (error) {
    next(error);
  }
};
