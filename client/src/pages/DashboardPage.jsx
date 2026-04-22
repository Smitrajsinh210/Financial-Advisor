import { DollarSign, PiggyBank, Scale, Wallet } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, LineChart, CartesianGrid, XAxis, YAxis, Legend, Line, BarChart, Bar } from "recharts";
import useAsync from "../hooks/useAsync";
import api from "../utils/api";
import Loader from "../components/ui/Loader";
import StatCard from "../components/ui/StatCard";

const COLORS = ["#18b977", "#38bdf8", "#f59e0b", "#f97316", "#a78bfa", "#ef4444"];

const DashboardPage = () => {
  const { data, loading, error } = useAsync(async () => {
    const response = await api.get("/reports/dashboard");
    return response.data.data;
  }, []);

  if (loading) return <Loader label="Loading dashboard insights..." />;
  if (error || !data) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold">Dashboard unavailable</h2>
        <p className="mt-3 text-slate-400">
          The dashboard data could not be loaded yet. Please refresh the page after restarting the backend.
        </p>
        <p className="mt-4 text-sm text-rose-300">
          {error?.response?.data?.message || error?.message || "Unknown dashboard error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Income" value={data.summary.income.toFixed(2)} hint="This month" icon={DollarSign} />
        <StatCard title="Total Expenses" value={data.summary.expenses.toFixed(2)} hint="This month" icon={Wallet} />
        <StatCard title="Savings" value={data.summary.savings.toFixed(2)} hint="Income minus expenses" icon={PiggyBank} />
        <StatCard title="Budget Left" value={data.summary.budgetLeft.toFixed(2)} hint="Across all active budgets" icon={Scale} />
        <StatCard title="Goal Progress" value={`${data.summary.goalTarget ? Math.round((data.summary.goalSaved / data.summary.goalTarget) * 100) : 0}%`} hint="Combined target tracking" icon={PiggyBank} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card h-[320px]">
          <h3 className="mb-6 text-lg font-semibold">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={data.expenseByCategory} dataKey="value" nameKey="name" outerRadius={100} label>
                {data.expenseByCategory.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card h-[320px]">
          <h3 className="mb-6 text-lg font-semibold">Monthly Trend</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#18b977" strokeWidth={3} />
              <Line type="monotone" dataKey="expense" stroke="#38bdf8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card h-[320px]">
          <h3 className="mb-6 text-lg font-semibold">Savings Goal Progress</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.goalProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="saved" fill="#18b977" radius={[10, 10, 0, 0]} />
              <Bar dataKey="target" fill="#334155" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold">Financial Focus</h3>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Top expense category</p>
              <p className="mt-2 text-xl font-semibold">{data.summary.topCategory?.category || "No data yet"}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Overspending categories</p>
              <p className="mt-2 text-xl font-semibold">{data.summary.overspendingCategories.length || 0}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Transactions this month</p>
              <p className="mt-2 text-xl font-semibold">{data.transactions.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
