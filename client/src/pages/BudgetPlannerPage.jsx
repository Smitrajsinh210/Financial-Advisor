import { useState } from "react";
import toast from "react-hot-toast";
import useAsync from "../hooks/useAsync";
import api from "../utils/api";
import Loader from "../components/ui/Loader";

const BudgetPlannerPage = () => {
  const { data, loading, setData } = useAsync(async () => {
    const response = await api.get("/budgets");
    return response.data.data;
  }, []);
  const [form, setForm] = useState({ category: "", monthlyLimit: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/budgets", {
        category: form.category,
        monthlyLimit: Number(form.monthlyLimit)
      });
      setData((prev) => {
        const filtered = (prev || []).filter((item) => item.category !== response.data.data.category);
        return [response.data.data, ...filtered];
      });
      setForm({ category: "", monthlyLimit: "" });
      toast.success("Budget saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save budget");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/budgets/${id}`);
    setData((prev) => prev.filter((item) => item._id !== id));
    toast.success("Budget removed");
  };

  if (loading) return <Loader label="Loading budgets..." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-2xl font-bold">Budget Planner</h2>
        <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
        <input className="input" placeholder="Monthly limit" type="number" value={form.monthlyLimit} onChange={(e) => setForm((prev) => ({ ...prev, monthlyLimit: e.target.value }))} />
        <button className="btn-primary w-full">Save budget</button>
      </form>

      <div className="card">
        <h2 className="text-2xl font-bold">Category Limits</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {data.map((budget) => (
            <div key={budget._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Category</p>
                  <p className="text-xl font-semibold">{budget.category}</p>
                </div>
                <button className="text-sm text-rose-300" onClick={() => handleDelete(budget._id)} type="button">Delete</button>
              </div>
              <p className="mt-5 text-3xl font-bold">{budget.monthlyLimit.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetPlannerPage;
