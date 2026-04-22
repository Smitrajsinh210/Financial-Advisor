import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const ProfileSettingsPage = () => {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    language: user?.language || "en",
    currency: user?.currency || "INR",
    monthlyIncome: user?.monthlyIncome || 0,
    emailNotifications: user?.emailNotifications ?? true,
    avatar: user?.avatar || ""
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put("/users/me", form);
      await refreshProfile();
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card max-w-3xl space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <p className="mt-2 text-slate-400">Manage identity, localization, currency preferences, and notification settings.</p>
      </div>

      <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
      <input className="input" placeholder="Avatar URL" value={form.avatar} onChange={(e) => setForm((prev) => ({ ...prev, avatar: e.target.value }))} />
      <input className="input" placeholder="Monthly income" type="number" value={form.monthlyIncome} onChange={(e) => setForm((prev) => ({ ...prev, monthlyIncome: Number(e.target.value) }))} />

      <div className="grid gap-4 md:grid-cols-2">
        <select className="input" value={form.language} onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="gu">Gujarati</option>
        </select>
        <select className="input" value={form.currency} onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}>
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input type="checkbox" checked={form.emailNotifications} onChange={(e) => setForm((prev) => ({ ...prev, emailNotifications: e.target.checked }))} />
        Enable email summaries and reminders
      </label>

      <button className="btn-primary" disabled={saving}>
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
};

export default ProfileSettingsPage;
