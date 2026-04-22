import { useEffect, useMemo, useState } from "react";
import { Copy, X } from "lucide-react";
import toast from "react-hot-toast";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../utils/api";
import Loader from "../components/ui/Loader";

const initialExpense = {
  title: "",
  amount: "",
  category: "Groceries",
  date: new Date().toISOString().slice(0, 10)
};

const formatMonthLabel = (value) => {
  const [year, month] = value.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });
};

const WorkspaceContent = ({ room, expenses, summaries, liveSummary, expenseForm, setExpenseForm, addExpense, trendData, copyJoinCode }) => (
  <div className="mt-6 space-y-6">
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h4 className="text-2xl font-bold">{room.room.name}</h4>
          <p className="mt-2 text-sm text-slate-400">
            Private join code: <span className="font-semibold tracking-[0.2em] text-brand-300">{room.room.joinCode}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">{room.members.length} members</div>
          <button className="btn-secondary" type="button" onClick={copyJoinCode}>
            <Copy size={16} />
            Copy code
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {room.members.map((member) => (
          <div key={member._id} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
            {member.name}
          </div>
        ))}
      </div>
    </div>

    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <form className="card space-y-4" onSubmit={addExpense}>
        <h4 className="text-xl font-semibold">Add Shared Expense</h4>
        <input className="input" placeholder="Title" value={expenseForm.title} onChange={(e) => setExpenseForm((prev) => ({ ...prev, title: e.target.value }))} />
        <input className="input" placeholder="Amount" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))} />
        <input className="input" placeholder="Category" value={expenseForm.category} onChange={(e) => setExpenseForm((prev) => ({ ...prev, category: e.target.value }))} />
        <input className="input" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((prev) => ({ ...prev, date: e.target.value }))} />
        <button className="btn-primary w-full">Add family expense</button>
      </form>

      <div className="card">
        <h4 className="text-xl font-semibold">Live Summary</h4>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">Current month total</p>
            <p className="mt-3 text-3xl font-bold">{liveSummary?.totalExpense?.toFixed(2) || "0.00"}</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-slate-400">Tracked month</p>
            <p className="mt-3 text-3xl font-bold">{liveSummary?.month ? formatMonthLabel(liveSummary.month) : "No data"}</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="font-semibold">Per-member contribution</p>
          <div className="mt-3 space-y-3">
            {liveSummary?.perMemberContribution?.length ? (
              liveSummary.perMemberContribution.map((item) => (
                <div key={item.userId} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <span>{item.userName}</span>
                  <span className="font-semibold">{item.total.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No shared expenses this month yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="card">
        <h4 className="text-xl font-semibold">Shared Expense List</h4>
        <div className="mt-5 space-y-3">
          {expenses.length ? (
            expenses.map((expense) => (
              <div key={expense._id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{expense.title}</p>
                  <p className="text-sm text-slate-400">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{expense.amount.toFixed(2)}</p>
                  <p className="text-sm text-slate-400">{expense.userName}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">No shared expenses yet.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h4 className="text-xl font-semibold">Monthly Trend</h4>
        <div className="mt-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="totalExpense" fill="#18b977" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className="card">
      <h4 className="text-xl font-semibold">Month-End Summary</h4>
      <div className="mt-5 space-y-4">
        {summaries.length ? (
          summaries.map((summary) => (
            <div key={summary._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold">{formatMonthLabel(summary.month)}</p>
                  <p className="text-sm text-slate-400">Top category: {summary.topCategory}</p>
                </div>
                <p className="text-2xl font-bold">{summary.totalExpense.toFixed(2)}</p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {Object.values(summary.perUserBreakdown).map((entry) => (
                  <div key={entry.userId} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3">
                    <span>{entry.userName}</span>
                    <span className="font-semibold">{Number(entry.total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">Monthly summaries will appear here once expenses are tracked.</p>
        )}
      </div>
    </div>
  </div>
);

const FamilyRoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(localStorage.getItem("afa_family_room") || "");
  const [room, setRoom] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [liveSummary, setLiveSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [expenseForm, setExpenseForm] = useState(initialExpense);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const loadRooms = async (preferredRoomId) => {
    const response = await api.get("/family-room");
    const nextRooms = response.data.data;
    setRooms(nextRooms);

    const nextSelected =
      preferredRoomId ||
      selectedRoomId ||
      localStorage.getItem("afa_family_room") ||
      nextRooms[0]?._id?.toString() ||
      "";

    if (nextSelected) {
      setSelectedRoomId(String(nextSelected));
      localStorage.setItem("afa_family_room", String(nextSelected));
      await loadRoomDetails(String(nextSelected));
      setWorkspaceOpen(true);
    } else {
      setRoom(null);
      setExpenses([]);
      setSummaries([]);
      setLiveSummary(null);
    }
  };

  const loadRoomDetails = async (roomId) => {
    setRoomLoading(true);
    try {
      const [roomResponse, expenseResponse, summaryResponse] = await Promise.all([
        api.get(`/family-room/${roomId}`),
        api.get(`/family-expense/${roomId}`),
        api.get(`/family-summary/${roomId}`)
      ]);

      setRoom(roomResponse.data.data);
      setExpenses(expenseResponse.data.data.expenses);
      setLiveSummary(expenseResponse.data.data.liveSummary);
      setSummaries(summaryResponse.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load family room");
    } finally {
      setRoomLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await loadRooms();
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load family rooms");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const createRoom = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/family-room/create", { name: createName });
      setCreateName("");
      toast.success("Family room created");
      await loadRooms(String(response.data.data._id));
      setWorkspaceOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create room");
    }
  };

  const joinRoom = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/family-room/join", { joinCode });
      setJoinCode("");
      toast.success("Joined family room");
      await loadRooms(String(response.data.data._id));
      setWorkspaceOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not join room");
    }
  };

  const addExpense = async (event) => {
    event.preventDefault();
    if (!selectedRoomId) return;

    try {
      const response = await api.post("/family-expense/add", {
        roomId: Number(selectedRoomId),
        title: expenseForm.title,
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        date: expenseForm.date
      });

      setExpenses((prev) => [response.data.data.expense, ...prev]);
      setLiveSummary(response.data.data.liveSummary);
      setExpenseForm(initialExpense);
      toast.success("Shared expense added");
      const summaryResponse = await api.get(`/family-summary/${selectedRoomId}`);
      setSummaries(summaryResponse.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add family expense");
    }
  };

  const trendData = useMemo(
    () =>
      summaries
        .slice()
        .reverse()
        .map((item) => ({
          label: item.month,
          totalExpense: item.totalExpense
        })),
    [summaries]
  );

  const copyJoinCode = async () => {
    if (!room?.room?.joinCode) return;
    await navigator.clipboard.writeText(room.room.joinCode);
    toast.success("Join code copied");
  };

  if (loading) return <Loader label="Loading family room..." />;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="card space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Family Room</h2>
            <p className="mt-2 text-slate-400">Create or join a private shared room to track daily expenses with your family.</p>
          </div>

          <form className="space-y-3" onSubmit={createRoom}>
            <p className="font-semibold">Create Room</p>
            <input className="input" placeholder="Room name" value={createName} onChange={(e) => setCreateName(e.target.value)} />
            <button className="btn-primary w-full">Create family room</button>
          </form>

          <form className="space-y-3" onSubmit={joinRoom}>
            <p className="font-semibold">Join Room</p>
            <input className="input" placeholder="Enter private join code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} />
            <button className="btn-secondary w-full">Join family room</button>
          </form>

          <div className="space-y-3">
            <p className="font-semibold">Your Rooms</p>
            {rooms.length ? (
              rooms.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => {
                    const roomId = String(item._id);
                    setSelectedRoomId(roomId);
                    localStorage.setItem("afa_family_room", roomId);
                    loadRoomDetails(roomId);
                    setWorkspaceOpen(true);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    String(item._id) === String(selectedRoomId) ? "border-brand-400 bg-brand-500/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-slate-400">Secure room workspace</p>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400">No family rooms yet. Create or join one above.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-2xl font-bold">Private Workspace</h3>
          <p className="mt-3 text-slate-400">
            After creating or joining a room, a separate family room window opens automatically with members, expenses, live totals, and monthly summaries.
          </p>
          {room ? <button className="btn-primary mt-5" type="button" onClick={() => setWorkspaceOpen(true)}>Open {room.room.name} workspace</button> : <p className="mt-5 text-sm text-slate-400">Select or join a room to open its workspace.</p>}
        </div>
      </div>

      {workspaceOpen && room ? (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="mx-auto h-full max-w-7xl overflow-y-auto rounded-[2rem] border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-3xl font-bold">Family Room Workspace</h3>
                <p className="mt-2 text-slate-400">Everything for this room is available in this private window.</p>
              </div>
              <button className="btn-secondary" type="button" onClick={() => setWorkspaceOpen(false)}>
                <X size={16} />
                Close
              </button>
            </div>
            {roomLoading ? <Loader label="Loading room details..." /> : <WorkspaceContent room={room} expenses={expenses} summaries={summaries} liveSummary={liveSummary} expenseForm={expenseForm} setExpenseForm={setExpenseForm} addExpense={addExpense} trendData={trendData} copyJoinCode={copyJoinCode} />}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FamilyRoomPage;
