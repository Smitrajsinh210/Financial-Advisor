import { useState } from "react";
import toast from "react-hot-toast";
import useAsync from "../hooks/useAsync";
import api from "../utils/api";
import Loader from "../components/ui/Loader";

const initialForm = {
  type: "expense",
  category: "Food",
  amount: "",
  note: "",
  date: new Date().toISOString().slice(0, 10),
  isRecurring: false
};

const ExpenseTrackerPage = () => {
  const { data, loading, setData } = useAsync(async () => {
    const response = await api.get("/transactions");
    return response.data.data;
  }, []);
  const [form, setForm] = useState(initialForm);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/transactions", { ...form, amount: Number(form.amount) });
      setData((prev) => [response.data.data, ...(prev || [])]);
      setForm(initialForm);
      toast.success("Transaction added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save transaction");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setData((prev) => prev.filter((item) => item._id !== id));
      toast.success("Transaction removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete transaction");
    }
  };

  if (loading) return <Loader label="Loading transactions..." />;

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-2xl font-bold">Add Transaction</h2>
        <select className="input" value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
        <input className="input" placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} />
        <input className="input" placeholder="Note" value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
        <input className="input" type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} />
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm((prev) => ({ ...prev, isRecurring: e.target.checked }))} />
          Recurring transaction reminder
        </label>
        <button className="btn-primary w-full">Save transaction</button>
      </form>

      <div className="card">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="mt-6 space-y-4">
          {data.map((item) => (
            <div key={item._id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{item.category}</p>
                <p className="text-sm text-slate-400">{item.note || "No note"} • {new Date(item.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${item.type === "income" ? "bg-brand-500/20 text-brand-200" : "bg-sky-500/20 text-sky-200"}`}>
                  {item.type}
                </span>
                <span className="text-lg font-semibold">{item.amount.toFixed(2)}</span>
                <button className="btn-secondary" type="button" onClick={() => handleDelete(item._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTrackerPage;
