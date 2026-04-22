import { useState } from "react";
import toast from "react-hot-toast";
import useAsync from "../hooks/useAsync";
import api from "../utils/api";
import Loader from "../components/ui/Loader";
import StatCard from "../components/ui/StatCard";
import { BarChart3, Users, Wallet } from "lucide-react";

const AdminPanelPage = () => {
  const { data, loading, setData } = useAsync(async () => {
    const response = await api.get("/admin/overview");
    return response.data.data;
  }, []);
  const [processing, setProcessing] = useState("");

  const handleDelete = async (id) => {
    setProcessing(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setData((prev) => ({
        ...prev,
        latestUsers: prev.latestUsers.filter((user) => user._id !== id),
        totalUsers: prev.totalUsers - 1
      }));
      toast.success("User deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete user");
    } finally {
      setProcessing("");
    }
  };

  if (loading) return <Loader label="Loading admin analytics..." />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Users" value={String(data.totalUsers)} hint="All registered users" icon={Users} />
        <StatCard title="Transactions" value={String(data.totalTransactions)} hint="Platform-wide activity" icon={Wallet} />
        <StatCard title="Goals" value={String(data.totalGoals)} hint="Savings targets created" icon={BarChart3} />
        <StatCard title="Revenue" value={data.revenue.toFixed(2)} hint="Income transactions recorded" icon={Wallet} />
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold">Recent Users</h2>
        <div className="mt-6 space-y-4">
          {data.latestUsers.map((item) => (
            <div key={item._id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-slate-400">{item.email} • {item.role}</p>
              </div>
              <button className="btn-secondary" onClick={() => handleDelete(item._id)} disabled={processing === item._id}>
                {processing === item._id ? "Deleting..." : "Delete fake account"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;
