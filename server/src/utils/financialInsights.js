export const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

export const summarizeTransactions = (transactions = [], budgets = [], goals = []) => {
  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expenses = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const savings = income - expenses;
  const budgetLimit = budgets.reduce((sum, item) => sum + item.monthlyLimit, 0);
  const budgetLeft = budgetLimit - expenses;
  const goalTarget = goals.reduce((sum, item) => sum + item.targetAmount, 0);
  const goalSaved = goals.reduce((sum, item) => sum + item.savedAmount, 0);

  const categoryTotals = transactions
    .filter((item) => item.type === "expense")
    .reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  return {
    income,
    expenses,
    savings,
    budgetLimit,
    budgetLeft,
    goalTarget,
    goalSaved,
    topCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
    overspendingCategories: budgets
      .map((budget) => {
        const spent = categoryTotals[budget.category] || 0;
        return {
          category: budget.category,
          spent,
          limit: budget.monthlyLimit,
          exceededBy: Math.max(spent - budget.monthlyLimit, 0)
        };
      })
      .filter((item) => item.exceededBy > 0)
  };
};

export const formatCurrency = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value || 0);

export const buildRuleBasedAdvice = (summary, user) => {
  const suggestions = [];

  if (summary.expenses > summary.income) {
    suggestions.push("Your expenses are higher than your income this month. Pause discretionary spending and rebalance your budget immediately.");
  }

  if (summary.topCategory) {
    suggestions.push(`${summary.topCategory.category} is your highest expense category at ${formatCurrency(summary.topCategory.amount, user.currency)}. Review subscriptions, frequency, and vendor choices here first.`);
  }

  if (summary.savings < summary.income * 0.2) {
    suggestions.push("Aim to save at least 20% of your income. Automating transfers on payday is one of the easiest wins.");
  }

  if (summary.overspendingCategories.length > 0) {
    suggestions.push(`You exceeded budget in ${summary.overspendingCategories.map((item) => item.category).join(", ")}. Tighten those caps or rebalance lower-priority categories.`);
  }

  if (summary.goalTarget > 0 && summary.goalSaved < summary.goalTarget) {
    suggestions.push("Your savings goals are in progress. A small weekly auto-transfer can improve goal completion odds.");
  }

  suggestions.push("Keep an emergency fund covering 3 to 6 months of essential expenses before taking major investment risk.");
  suggestions.push("If you carry high-interest debt, pay that down before increasing non-retirement investing.");
  suggestions.push("For beginners, diversified low-cost index funds are usually a simpler starting point than stock picking.");

  return suggestions;
};
