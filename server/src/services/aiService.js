import OpenAI from "openai";
import { buildRuleBasedAdvice, formatCurrency } from "../utils/financialInsights.js";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const detectTopic = (prompt = "") => {
  const text = prompt.toLowerCase();
  if (text.match(/invest|mutual fund|stock|sip|etf|portfolio|crypto/)) return "investing";
  if (text.match(/debt|loan|emi|credit card|interest/)) return "debt";
  if (text.match(/budget|expense|spend|salary|cut cost|save money/)) return "budgeting";
  if (text.match(/tax|deduction|refund/)) return "tax";
  if (text.match(/retire|retirement|pension/)) return "retirement";
  if (text.match(/insurance|emergency fund|medical cover/)) return "risk planning";
  return "general personal finance";
};

const buildFallbackResponse = ({ user, summary, prompt, history = [] }) => {
  const topic = detectTopic(prompt);
  const suggestions = buildRuleBasedAdvice(summary, user);
  const recentContext = history.length
    ? `Recent context: ${history
        .slice(-2)
        .map((item) => `Q: ${item.question} | A: ${item.response.slice(0, 120)}`)
        .join(" || ")}`
    : "Recent context: none";

  return [
    `Topic detected: ${topic}`,
    `Question: ${prompt}`,
    `Current monthly snapshot: income ${formatCurrency(summary.income, user.currency)}, expenses ${formatCurrency(summary.expenses, user.currency)}, savings ${formatCurrency(summary.savings, user.currency)}, budget left ${formatCurrency(summary.budgetLeft, user.currency)}.`,
    recentContext,
    "Recommended next steps:",
    ...suggestions.map((item, index) => `${index + 1}. ${item}`),
    "If you want, ask a follow-up with your salary, fixed expenses, debt amount, savings target, or time horizon for a more precise answer."
  ].join("\n\n");
};

export const generateFinancialAdvice = async ({ user, summary, budgets, goals, prompt, history = [] }) => {
  const fallbackAdvice = buildRuleBasedAdvice(summary, user);
  const topic = detectTopic(prompt);
  const context = {
    currency: user.currency,
    monthlyIncome: user.monthlyIncome,
    summary,
    budgets,
    goals,
    userQuestion: prompt,
    topic,
    recentConversation: history.slice(-6)
  };

  if (!openai) {
    return {
      response: buildFallbackResponse({ user, summary, prompt, history })
    };
  }

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.35,
    messages: [
      {
        role: "system",
        content:
          "You are an expert AI financial advisor for personal finance questions. Answer any finance-related question that a retail user might ask: budgeting, saving, debt payoff, spending plans, emergency funds, retirement basics, investing basics, risk management, cash flow, goal planning, financial habits, and tradeoffs. Be practical, specific, and conversational like a strong AI assistant. Use the user's financial data when relevant, ask for missing numbers only when necessary, never guarantee returns, avoid regulated professional claims, and clearly say when something depends on local tax or legal rules. Prefer concise headings and bullets. End with a short next-step suggestion."
      },
      {
        role: "user",
        content: `Use this finance data and recent conversation to answer the user's latest question.\n${JSON.stringify(context)}`
      }
    ]
  });

  return {
    response:
      completion.choices[0]?.message?.content ||
      buildFallbackResponse({ user, summary, prompt, history }) ||
      `Your current estimated savings are ${formatCurrency(summary.savings, user.currency)}.\n\n${fallbackAdvice.join("\n")}`
  };
};
