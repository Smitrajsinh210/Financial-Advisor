import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const copy = {
  "/login": {
    title: "Welcome back",
    subtitle: "Sign in to manage your financial life with AI support.",
    action: "Login"
  },
  "/register": {
    title: "Create your account",
    subtitle: "Start tracking, planning, and improving your money habits.",
    action: "Register"
  },
  "/forgot-password": {
    title: "Reset password",
    subtitle: "We’ll prepare a reset link for your account.",
    action: "Send reset link"
  }
};

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const mode = copy[location.pathname];
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (location.pathname === "/login") {
        await login({ email: form.email, password: form.password });
        navigate("/app/dashboard");
      } else if (location.pathname === "/register") {
        await register(form);
        navigate("/app/dashboard");
      } else {
        const { data } = await api.post("/auth/forgot-password", { email: form.email });
        toast.success(data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message
        || (error.request
          ? "Cannot reach the backend server. Make sure the API and MongoDB are running."
          : "Something went wrong");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex lg:flex-col lg:justify-between lg:bg-slate-900/70 lg:p-12">
        <div className="rounded-2xl bg-brand-500 px-3 py-2 text-lg font-black text-slate-950 w-fit">AI</div>
        <div>
          <h1 className="max-w-xl text-5xl font-black leading-tight">
            Your financial command center, designed like a modern fintech product.
          </h1>
          <p className="mt-6 max-w-lg text-slate-400">
            Real dashboards, secure authentication, intelligent recommendations, and a premium user experience across mobile and desktop.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <form onSubmit={handleSubmit} className="card w-full max-w-lg space-y-5">
          <div>
            <h2 className="text-3xl font-bold">{mode.title}</h2>
            <p className="mt-2 text-slate-400">{mode.subtitle}</p>
          </div>

          {location.pathname === "/register" ? (
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Full name</span>
              <input className="input" name="name" value={form.name} onChange={handleChange} required />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Email address</span>
            <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>

          {location.pathname !== "/forgot-password" ? (
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Password</span>
              <input className="input" name="password" type="password" value={form.password} onChange={handleChange} required />
            </label>
          ) : null}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Please wait..." : mode.action}
          </button>

          <div className="flex flex-wrap justify-between gap-3 text-sm text-slate-400">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/forgot-password">Forgot Password</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
