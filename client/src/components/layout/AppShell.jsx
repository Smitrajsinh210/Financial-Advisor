import { Bell, BrainCircuit, Home, LayoutDashboard, PiggyBank, Settings, Shield, Wallet } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { translations } from "../../data/translations";

const navItems = [
  { to: "/app/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { to: "/app/expenses", icon: Wallet, key: "expenses" },
  { to: "/app/budgets", icon: Wallet, key: "budgets" },
  { to: "/app/goals", icon: PiggyBank, key: "goals" },
  { to: "/app/family-room", icon: Home, key: "family" },
  { to: "/app/advisor", icon: BrainCircuit, key: "advisor" },
  { to: "/app/reports", icon: Bell, key: "reports" },
  { to: "/app/profile", icon: Settings, key: "profile" }
];

const AppShell = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const labels = translations[user?.language || "en"];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-white/10 bg-slate-950/80 p-6 backdrop-blur-xl lg:min-h-screen lg:border-b-0 lg:border-r">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="rounded-2xl bg-brand-500 px-3 py-2 text-lg font-black text-slate-950">AI</div>
          <div>
            <p className="text-lg font-semibold">Financial Advisor</p>
            <p className="text-sm text-slate-400">{labels.tagline}</p>
          </div>
        </Link>

        <nav className="mt-8 space-y-2">
          {navItems.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-brand-500 text-slate-950" : "text-slate-300 hover:bg-white/5"
                }`
              }
            >
              <Icon size={18} />
              {labels[key]}
            </NavLink>
          ))}
          {user?.role === "admin" ? (
            <NavLink
              to="/app/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-brand-500 text-slate-950" : "text-slate-300 hover:bg-white/5"
                }`
              }
            >
              <Shield size={18} />
              {labels.admin}
            </NavLink>
          ) : null}
        </nav>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Signed in as</p>
          <p className="mt-2 font-semibold">{user?.name}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>

        <div className="mt-4 flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Light" : "Dark"} mode
          </button>
          <button className="btn-secondary flex-1" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
};

export default AppShell;
