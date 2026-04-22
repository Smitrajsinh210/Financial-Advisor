import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  "Track income and expenses with category intelligence",
  "Get AI-driven budget, savings, and debt guidance",
  "Monitor reports, goals, reminders, and admin insights"
];

const testimonials = [
  { name: "Riya Shah", role: "Startup marketer", text: "The savings coach helped me build my first emergency fund in just four months." },
  { name: "Aman Patel", role: "Software engineer", text: "The dashboard finally made my money habits visible and easy to act on." },
  { name: "Neha Joshi", role: "Freelancer", text: "Budget alerts and AI suggestions gave me a clear plan for irregular income." }
];

const LandingPage = () => (
  <div className="overflow-hidden">
    <section className="relative px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-500 px-3 py-2 text-lg font-black text-slate-950">AI</div>
            <span className="font-semibold">Financial Advisor</span>
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="btn-secondary">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </header>

        <div className="grid gap-12 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-2 text-sm text-brand-200">
              <Sparkles size={16} />
              AI-powered personal finance platform
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              Build calmer money habits with a fintech-grade advisor in your pocket.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              Manage expenses, set savings goals, get real-time budget signals, and ask an AI advisor for practical steps tailored to your salary, spending, and goals.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary">
                Launch Dashboard
                <ArrowRight className="ml-2" size={18} />
              </Link>
              <a href="#pricing" className="btn-secondary">View Pricing</a>
            </div>
            <div className="mt-8 grid gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="text-brand-300" size={18} />
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-5">
            <div className="card shadow-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">This month</p>
                  <h3 className="mt-2 text-3xl font-bold">₹24,800 saved</h3>
                </div>
                <div className="rounded-3xl bg-brand-500/15 p-4 text-brand-300">
                  <WalletCards />
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Budget left</p>
                  <p className="mt-2 text-xl font-semibold">₹11,200</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Goal progress</p>
                  <p className="mt-2 text-xl font-semibold">68%</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-brand-300" />
                <div>
                  <h3 className="font-semibold">Secure by design</h3>
                  <p className="text-sm text-slate-400">JWT auth, hashed passwords, protected routes, and role-based admin access.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
      {[
        ["Smart Tracking", "Income, expenses, subscriptions, recurring reminders, and goal updates in one place."],
        ["AI Coaching", "Ask questions in natural language and receive actionable financial guidance."],
        ["Decision Analytics", "Charts, exports, summaries, and admin monitoring built for scale."]
      ].map(([title, text]) => (
        <div key={title} className="card">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="mt-3 text-slate-400">{text}</p>
        </div>
      ))}
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {testimonials.map((item) => (
          <div key={item.name} className="card">
            <p className="text-slate-300">“{item.text}”</p>
            <div className="mt-6">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-slate-400">{item.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { name: "Starter", price: "₹0", perks: "Dashboard, tracking, goals, basic reports" },
          { name: "Pro", price: "₹499/mo", perks: "AI advisor, exports, reminders, email summaries" },
          { name: "Scale", price: "₹1499/mo", perks: "Admin analytics, multi-user operations, premium support" }
        ].map((plan) => (
          <div key={plan.name} className="card">
            <p className="text-sm uppercase tracking-[0.2em] text-brand-300">{plan.name}</p>
            <h3 className="mt-4 text-4xl font-black">{plan.price}</h3>
            <p className="mt-4 text-slate-400">{plan.perks}</p>
          </div>
        ))}
      </div>
    </section>

    <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-400">
      Contact: support@aifinancialadvisor.app | AI Financial Advisor | Startup-ready finance intelligence
    </footer>
  </div>
);

export default LandingPage;
