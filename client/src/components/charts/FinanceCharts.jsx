import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const COLORS = ["#18b977", "#38bdf8", "#f59e0b", "#f97316", "#a78bfa", "#ef4444"];

export const ExpensePieChart = ({ data = [] }) => (
  <div className="card h-[320px]">
    <h3 className="mb-6 text-lg font-semibold">Expense Breakdown</h3>
    <ResponsiveContainer width="100%" height="85%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export const MonthlyLineChart = ({ data = [] }) => (
  <div className="card h-[320px]">
    <h3 className="mb-6 text-lg font-semibold">Monthly Trend</h3>
    <ResponsiveContainer width="100%" height="85%">
      <LineChart data={data}>
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
);

export const GoalBarChart = ({ data = [] }) => (
  <div className="card h-[320px]">
    <h3 className="mb-6 text-lg font-semibold">Goal Progress</h3>
    <ResponsiveContainer width="100%" height="85%">
      <BarChart data={data}>
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
);
