import { getAll, getOne, run } from "../config/db.js";

const mapGoal = (row) => ({
  ...row,
  _id: row.id,
  targetAmount: Number(row.targetAmount),
  savedAmount: Number(row.savedAmount)
});

export const getGoals = async (req, res, next) => {
  try {
    const goals = getAll(
      `SELECT * FROM goals WHERE userId = ? ORDER BY datetime(deadline) ASC, id ASC`,
      [req.user.id]
    ).map(mapGoal);
    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const result = run(
      `INSERT INTO goals (userId, title, targetAmount, savedAmount, deadline, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [req.user.id, req.body.title, Number(req.body.targetAmount), Number(req.body.savedAmount || 0), req.body.deadline]
    );
    const goal = mapGoal(getOne(`SELECT * FROM goals WHERE id = ?`, [result.lastInsertRowid]));
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

export const updateGoal = async (req, res, next) => {
  try {
    const existing = getOne(`SELECT * FROM goals WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);

    if (!existing) {
      const error = new Error("Goal not found");
      error.statusCode = 404;
      throw error;
    }
    const nextGoal = {
      ...existing,
      ...req.body,
      targetAmount:
        req.body.targetAmount !== undefined ? Number(req.body.targetAmount) : Number(existing.targetAmount),
      savedAmount:
        req.body.savedAmount !== undefined ? Number(req.body.savedAmount) : Number(existing.savedAmount)
    };
    run(
      `UPDATE goals
       SET title = ?, targetAmount = ?, savedAmount = ?, deadline = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ? AND userId = ?`,
      [nextGoal.title, nextGoal.targetAmount, nextGoal.savedAmount, nextGoal.deadline, req.params.id, req.user.id]
    );
    const goal = mapGoal(getOne(`SELECT * FROM goals WHERE id = ?`, [req.params.id]));

    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = getOne(`SELECT id FROM goals WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);

    if (!goal) {
      const error = new Error("Goal not found");
      error.statusCode = 404;
      throw error;
    }

    run(`DELETE FROM goals WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);
    res.json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    next(error);
  }
};
