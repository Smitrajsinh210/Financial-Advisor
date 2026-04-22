import PDFDocument from "pdfkit";
import { Parser } from "json2csv";
import { getAll } from "../config/db.js";
import { getMonthRange, summarizeTransactions } from "../utils/financialInsights.js";
import { sendEmail } from "../services/mailService.js";

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

export const getDashboardReport = async (req, res, next) => {
  try {
    const { start, end } = getMonthRange();
    const transactions = getAll(
      `SELECT * FROM transactions WHERE userId = ? AND datetime(date) >= datetime(?) AND datetime(date) <= datetime(?) ORDER BY datetime(date) ASC`,
      [req.user.id, start.toISOString(), end.toISOString()]
    ).map(mapTransaction);
    const budgets = getAll(`SELECT * FROM budgets WHERE userId = ?`, [req.user.id]).map(mapBudget);
    const goals = getAll(`SELECT * FROM goals WHERE userId = ?`, [req.user.id]).map(mapGoal);

    const summary = summarizeTransactions(transactions, budgets, goals);

    const expenseByCategory = Object.entries(
      transactions
        .filter((item) => item.type === "expense")
        .reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + item.amount;
          return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const monthlyTrend = transactions.reduce((acc, item) => {
      const key = new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const existing = acc[key] || { label: key, income: 0, expense: 0 };
      existing[item.type] += item.amount;
      acc[key] = existing;
      return acc;
    }, {});

    const goalProgress = goals.map((goal) => ({
      name: goal.title,
      saved: goal.savedAmount,
      target: goal.targetAmount
    }));

    res.json({
      success: true,
      data: {
        summary,
        expenseByCategory,
        monthlyTrend: Object.values(monthlyTrend),
        goalProgress,
        budgets,
        goals,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportCsv = async (req, res, next) => {
  try {
    const transactions = getAll(
      `SELECT * FROM transactions WHERE userId = ? ORDER BY datetime(date) DESC`,
      [req.user.id]
    ).map(mapTransaction);
    const parser = new Parser({ fields: ["type", "category", "amount", "note", "date", "isRecurring"] });
    const csv = parser.parse(
      transactions.map((item) => ({
        type: item.type,
        category: item.category,
        amount: item.amount,
        note: item.note,
        date: item.date.toISOString(),
        isRecurring: item.isRecurring
      }))
    );

    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportPdf = async (req, res, next) => {
  try {
    const { start, end } = getMonthRange();
    const transactions = getAll(
      `SELECT * FROM transactions WHERE userId = ? AND datetime(date) >= datetime(?) AND datetime(date) <= datetime(?)`,
      [req.user.id, start.toISOString(), end.toISOString()]
    ).map(mapTransaction);
    const budgets = getAll(`SELECT * FROM budgets WHERE userId = ?`, [req.user.id]).map(mapBudget);
    const goals = getAll(`SELECT * FROM goals WHERE userId = ?`, [req.user.id]).map(mapGoal);
    const summary = summarizeTransactions(transactions, budgets, goals);

    const doc = new PDFDocument({ margin: 48 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=monthly-report.pdf");
    doc.pipe(res);

    doc.fontSize(22).text("AI Financial Advisor Report");
    doc.moveDown();
    doc.fontSize(12).text(`Generated for ${req.user.name} on ${new Date().toLocaleString("en-IN")}`);
    doc.moveDown();
    doc.text(`Income: ${summary.income}`);
    doc.text(`Expenses: ${summary.expenses}`);
    doc.text(`Savings: ${summary.savings}`);
    doc.text(`Budget Left: ${summary.budgetLeft}`);
    doc.moveDown();
    doc.text("Top Transactions", { underline: true });

    transactions.slice(0, 10).forEach((item) => {
      doc.text(`${item.type.toUpperCase()} | ${item.category} | ${item.amount} | ${new Date(item.date).toLocaleDateString("en-IN")}`);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

export const emailMonthlySummary = async (req, res, next) => {
  try {
    const { start, end } = getMonthRange();
    const transactions = getAll(
      `SELECT * FROM transactions WHERE userId = ? AND datetime(date) >= datetime(?) AND datetime(date) <= datetime(?)`,
      [req.user.id, start.toISOString(), end.toISOString()]
    ).map(mapTransaction);
    const budgets = getAll(`SELECT * FROM budgets WHERE userId = ?`, [req.user.id]).map(mapBudget);
    const goals = getAll(`SELECT * FROM goals WHERE userId = ?`, [req.user.id]).map(mapGoal);
    const summary = summarizeTransactions(transactions, budgets, goals);

    await sendEmail({
      to: req.user.email,
      subject: "Your Monthly Finance Summary",
      html: `
        <h2>Monthly Summary</h2>
        <p>Income: ${summary.income}</p>
        <p>Expenses: ${summary.expenses}</p>
        <p>Savings: ${summary.savings}</p>
        <p>Budget Left: ${summary.budgetLeft}</p>
      `
    });

    res.json({ success: true, message: "Monthly summary email triggered if SMTP is configured." });
  } catch (error) {
    next(error);
  }
};
