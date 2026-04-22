import { motion } from "framer-motion";

const StatCard = ({ title, value, hint, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    className="card relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-fintech-grid bg-[size:28px_28px] opacity-10" />
    <div className="relative flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <h3 className="mt-3 text-3xl font-bold">{value}</h3>
        <p className="mt-2 text-sm text-slate-400">{hint}</p>
      </div>
      {Icon ? (
        <div className="rounded-2xl bg-brand-500/20 p-3 text-brand-300">
          <Icon size={22} />
        </div>
      ) : null}
    </div>
  </motion.div>
);

export default StatCard;
