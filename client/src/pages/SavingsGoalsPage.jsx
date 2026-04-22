import { useState } from "react";
import toast from "react-hot-toast";
import useAsync from "../hooks/useAsync";
import api from "../utils/api";
import Loader from "../components/ui/Loader";

const initialGoal = {
  title: "",
  targetAmount: "",
  savedAmount: "",
  deadline: new Date().toISOString().slice(0, 10)
};

const SavingsGoalsPage = () => {
  const { data, loading, setData } = useAsync(async () => {
    const response = await api.get("/goals");
    return response.data.data;
  }, []);
  const [form, setForm] = useState(initialGoal);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/goals", {
        ...form,
        targetAmount: Number(form.targetAmount),
        savedAmount: Number(form.savedAmount)
      });
      setData((prev) => [...(prev || []), response.data.data]);
      setForm(initialGoal);
      toast.success("Goal created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save goal");
    }
  };

  const updateGoal = async (goal) => {
    const savedAmount = Number(goal.savedAmount) + 500;
    const response = await api.put(`/goals/${goal._id}`, { savedAmount });
    setData((prev) => prev.map((item) => (item._id === goal._id ? response.data.data : item)));
    toast.success("Added ₹500 progress");
  };

  if (loading) return <Loader label="Loading savings goals..." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-2xl font-bold">Create Savings Goal</h2>
        <input className="input" placeholder="Goal title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
        <input className="input" placeholder="Target amount" type="number" value={form.targetAmount} onChange={(e) => setForm((prev) => ({ ...prev, targetAmount: e.target.value }))} />
        <input className="input" placeholder="Saved amount" type="number" value={form.savedAmount} onChange={(e) => setForm((prev) => ({ ...prev, savedAmount: e.target.value }))} />
        <input className="input" type="date" value={form.deadline} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} />
        <button className="btn-primary w-full">Save goal</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((goal) => {
          const progress = goal.targetAmount ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100)) : 0;

          return (
            <div key={goal._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{goal.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">Deadline {new Date(goal.deadline).toLocaleDateString()}</p>
                </div>
                <button className="btn-secondary" type="button" onClick={() => updateGoal(goal)}>
                  Add 500
                </button>
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-brand-400" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                <span>Saved {goal.savedAmount.toFixed(2)}</span>
                <span>Target {goal.targetAmount.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsGoalsPage;
