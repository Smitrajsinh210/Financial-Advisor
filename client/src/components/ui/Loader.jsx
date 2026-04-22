const Loader = ({ label = "Loading..." }) => (
  <div className="flex min-h-[180px] items-center justify-center">
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-400" />
      {label}
    </div>
  </div>
);

export default Loader;
