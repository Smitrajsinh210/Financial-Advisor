import toast from "react-hot-toast";
import useAsync from "../hooks/useAsync";
import api from "../utils/api";
import Loader from "../components/ui/Loader";

const ReportsPage = () => {
  const { data, loading } = useAsync(async () => {
    const response = await api.get("/reports/dashboard");
    return response.data.data;
  }, []);

  const openFile = async (path, filename) => {
    const response = await api.get(path, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const sendEmailSummary = async () => {
    await api.post("/reports/email-summary");
    toast.success("Email summary triggered");
  };

  if (loading) return <Loader label="Preparing reports..." />;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="mt-2 text-slate-400">Export your transaction history, monthly summaries, and PDF reports.</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <button className="btn-primary" onClick={() => openFile("/reports/export/pdf", "monthly-report.pdf")}>Export PDF</button>
          <button className="btn-secondary" onClick={() => openFile("/reports/export/csv", "transactions.csv")}>Download CSV</button>
          <button className="btn-secondary" onClick={sendEmailSummary}>Email monthly summary</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card"><p className="text-sm text-slate-400">Income</p><p className="mt-3 text-3xl font-bold">{data.summary.income.toFixed(2)}</p></div>
        <div className="card"><p className="text-sm text-slate-400">Expenses</p><p className="mt-3 text-3xl font-bold">{data.summary.expenses.toFixed(2)}</p></div>
        <div className="card"><p className="text-sm text-slate-400">Savings</p><p className="mt-3 text-3xl font-bold">{data.summary.savings.toFixed(2)}</p></div>
        <div className="card"><p className="text-sm text-slate-400">Budget Left</p><p className="mt-3 text-3xl font-bold">{data.summary.budgetLeft.toFixed(2)}</p></div>
      </div>
    </div>
  );
};

export default ReportsPage;
