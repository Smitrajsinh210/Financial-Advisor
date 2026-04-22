import { getAll, getOne, run } from "../config/db.js";

const formatMonth = (dateValue) => {
  const date = new Date(dateValue);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const ensureRoomMember = (roomId, userId) => {
  const membership = getOne(
    `SELECT id FROM family_room_members WHERE roomId = ? AND userId = ?`,
    [roomId, userId]
  );

  if (!membership) {
    const error = new Error("You are not a member of this family room");
    error.statusCode = 403;
    throw error;
  }
};

export const recalculateMonthlySummary = (roomId, month) => {
  const expenses = getAll(
    `SELECT fe.*, u.name AS userName
     FROM family_expenses fe
     JOIN users u ON u.id = fe.userId
     WHERE fe.roomId = ? AND substr(fe.date, 1, 7) = ?
     ORDER BY datetime(fe.date) ASC, fe.id ASC`,
    [roomId, month]
  );

  if (!expenses.length) {
    run(`DELETE FROM monthly_summaries WHERE roomId = ? AND month = ?`, [roomId, month]);
    return null;
  }

  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const perUserBreakdown = expenses.reduce((acc, item) => {
    acc[item.userId] = {
      userId: Number(item.userId),
      userName: item.userName,
      total: Number(((acc[item.userId]?.total || 0) + Number(item.amount)).toFixed(2))
    };
    return acc;
  }, {});

  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});

  const topCategory =
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "Uncategorized";

  run(
    `INSERT INTO monthly_summaries (roomId, month, totalExpense, perUserBreakdown, topCategory, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT(roomId, month)
     DO UPDATE SET
       totalExpense = excluded.totalExpense,
       perUserBreakdown = excluded.perUserBreakdown,
       topCategory = excluded.topCategory,
       updatedAt = CURRENT_TIMESTAMP`,
    [roomId, month, Number(totalExpense.toFixed(2)), JSON.stringify(perUserBreakdown), topCategory]
  );

  return getOne(`SELECT * FROM monthly_summaries WHERE roomId = ? AND month = ?`, [roomId, month]);
};

export const recalculateRoomSummaries = (roomId) => {
  const months = getAll(`SELECT DISTINCT substr(date, 1, 7) AS month FROM family_expenses WHERE roomId = ?`, [
    roomId
  ]).map((item) => item.month);

  months.forEach((month) => recalculateMonthlySummary(roomId, month));
};

export const recalculateAllFamilySummaries = () => {
  const rooms = getAll(`SELECT id FROM family_rooms`);
  rooms.forEach((room) => recalculateRoomSummaries(room.id));
};

export const calculateLiveRoomSummary = (roomId, month = formatMonth(new Date().toISOString())) => {
  const expenses = getAll(
    `SELECT fe.*, u.name AS userName
     FROM family_expenses fe
     JOIN users u ON u.id = fe.userId
     WHERE fe.roomId = ? AND substr(fe.date, 1, 7) = ?
     ORDER BY datetime(fe.date) DESC, fe.id DESC`,
    [roomId, month]
  );

  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const perMemberContribution = Object.values(
    expenses.reduce((acc, item) => {
      acc[item.userId] = {
        userId: Number(item.userId),
        userName: item.userName,
        total: Number(((acc[item.userId]?.total || 0) + Number(item.amount)).toFixed(2))
      };
      return acc;
    }, {})
  );
  const categoryBreakdown = Object.entries(
    expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
      return acc;
    }, {})
  ).map(([category, amount]) => ({ category, amount: Number(amount.toFixed(2)) }));

  return {
    month,
    totalExpense: Number(totalExpense.toFixed(2)),
    perMemberContribution,
    categoryBreakdown
  };
};

export const scheduleFamilySummaryJob = () => {
  recalculateAllFamilySummaries();
  const oneDay = 24 * 60 * 60 * 1000;
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const delay = nextMidnight.getTime() - now.getTime();

  setTimeout(() => {
    recalculateAllFamilySummaries();
    setInterval(() => {
      recalculateAllFamilySummaries();
    }, oneDay);
  }, delay);
};

export const mapMonthlySummary = (row) => ({
  ...row,
  _id: Number(row.id),
  roomId: Number(row.roomId),
  totalExpense: Number(row.totalExpense),
  perUserBreakdown: JSON.parse(row.perUserBreakdown || "{}")
});

export const getMonthKeyFromExpenseDate = (dateValue) => formatMonth(dateValue);
