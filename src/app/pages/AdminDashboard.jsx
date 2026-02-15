import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { api } from "../../api";
import { getActiveGymId } from "../../utils/gym";

function statusFromDaysLeft(daysLeft) {
  if (daysLeft == null) return "active";
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring";
  return "active";
}

function parseError(err) {
  const data = err?.response?.data;

  if (typeof data?.detail === "string") return data.detail;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(" ")}` : `${k}: ${v}`))
      .join("\n");
  }

  return err?.message || "Something went wrong";
}

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [gymId, setGymId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    plan: "monthly",
    start_date: "",
    end_date: "",
    course_taken: "",
    offer_taken: "",
  });

  const membersWithStatus = useMemo(() => {
    return members.map((m) => ({
      ...m,
      status: statusFromDaysLeft(m.days_left),
    }));
  }, [members]);

  const stats = useMemo(() => {
    const total = membersWithStatus.length;
    const active = membersWithStatus.filter((m) => m.status === "active").length;
    const expiring = membersWithStatus.filter((m) => m.status === "expiring").length;
    return { total, active, expiring };
  }, [membersWithStatus]);

  const StatusPill = ({ status }) => (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs ${
        status === "active"
          ? "bg-green-500/20 text-green-400"
          : status === "expiring"
          ? "bg-orange-500/20 text-orange-400"
          : "bg-red-500/20 text-red-400"
      }`}
    >
      {status}
    </span>
  );

  // ✅ Load active gym + members
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const gymsRes = await api.get("/api/gyms/");
        const gyms = Array.isArray(gymsRes.data) ? gymsRes.data : [];

        if (!gyms.length) {
          window.location.href = "/gym-setup";
          return;
        }

        // ✅ THIS is the key change: use active gym from localStorage (or fallback)
        const activeId = getActiveGymId(gyms);

        if (!activeId) {
          window.location.href = "/gym-setup";
          return;
        }

        if (!mounted) return;
        setGymId(activeId);

        // ✅ use correct URL (no placeholder)
        const membersRes = await api.get(`/api/gyms/${activeId}/members/`);
        const list = Array.isArray(membersRes.data) ? membersRes.data : [];

        if (!mounted) return;
        setMembers(list);
      } catch (err) {
        if (mounted) setError(parseError(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const openAddModal = () => {
    setError("");
    setEditingMember(null);
    setFormData({
      name: "",
      phone: "",
      plan: "monthly",
      start_date: "",
      end_date: "",
      course_taken: "",
      offer_taken: "",
    });
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setError("");
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      phone: member.phone || "",
      plan: member.plan || "monthly",
      start_date: member.start_date || "",
      end_date: member.end_date || "",
      course_taken: member.course_taken || "",
      offer_taken: member.offer_taken || "",
    });
    setShowModal(true);
  };

  const handleDeleteMember = async (memberId) => {
    if (!gymId) return;
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      // ✅ your backend URL ends with /delete (no trailing slash)
      await api.delete(`/api/gyms/${gymId}/members/${memberId}/delete`);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      alert(parseError(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gymId) return;

    setSaving(true);
    setError("");

    try {
      if (editingMember) {
        const res = await api.patch(
          `/api/gyms/${gymId}/members/${editingMember.id}/`,
          formData
        );
        setMembers((prev) =>
          prev.map((m) => (m.id === editingMember.id ? res.data : m))
        );
      } else {
        const res = await api.post(`/api/gyms/${gymId}/members/`, formData);
        setMembers((prev) => [res.data, ...prev]);
      }

      setShowModal(false);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-black text-white">
      <Navigation />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-6 sm:top-1/4 sm:left-1/4 w-56 h-56 sm:w-96 sm:h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-6 sm:bottom-1/4 sm:right-1/4 w-56 h-56 sm:w-96 sm:h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl mb-1 sm:mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Member Management
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Add, edit, and manage your gym members
            </p>
          </div>

          <button
            onClick={openAddModal}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-lg disabled:opacity-60"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="text-gray-400 text-sm mb-2">Total Members</div>
            <div className="text-2xl sm:text-3xl">{loading ? "…" : stats.total}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="text-gray-400 text-sm mb-2">Active Members</div>
            <div className="text-2xl sm:text-3xl text-green-400">
              {loading ? "…" : stats.active}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="text-gray-400 text-sm mb-2">Expiring Soon (≤ 7 days)</div>
            <div className="text-2xl sm:text-3xl text-orange-400">
              {loading ? "…" : stats.expiring}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Name</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Phone</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Plan</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">End Date</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Days Left</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Status</th>
                  <th className="text-right px-6 py-4 text-gray-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && membersWithStatus.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-gray-400" colSpan={7}>
                      No members yet. Click “Add Member”.
                    </td>
                  </tr>
                )}

                {membersWithStatus.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">{m.name}</td>
                    <td className="px-6 py-4 text-gray-400">{m.phone || "-"}</td>
                    <td className="px-6 py-4">{m.plan}</td>
                    <td className="px-6 py-4 text-gray-400">{m.end_date}</td>
                    <td className="px-6 py-4 text-gray-400">{m.days_left}</td>
                    <td className="px-6 py-4">
                      <StatusPill status={m.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {loading &&
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="border-b border-white/5">
                      <td className="px-6 py-4 text-gray-600" colSpan={7}>
                        Loading…
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {!loading && membersWithStatus.length === 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-gray-400">
              No members yet. Tap “Add Member”.
            </div>
          )}

          {membersWithStatus.map((m) => (
            <div
              key={m.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-medium">{m.name}</div>
                  <div className="text-sm text-gray-400">{m.phone || "-"}</div>
                </div>
                <StatusPill status={m.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">Plan</div>
                  <div className="text-white">{m.plan}</div>
                </div>
                <div>
                  <div className="text-gray-400">Days Left</div>
                  <div className="text-white">{m.days_left}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-400">End Date</div>
                  <div className="text-white">{m.end_date}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(m)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteMember(m.id)}
                  className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          ))}

          {loading && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-gray-600">
              Loading…
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black border border-white/10 rounded-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto">
            <div className="p-5 sm:p-8">
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl">
                  {editingMember ? "Edit Member" : "Add New Member"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                    placeholder="10-digit number"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Plan *</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">End Date *</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Course Taken</label>
                  <input
                    type="text"
                    value={formData.course_taken}
                    onChange={(e) =>
                      setFormData({ ...formData, course_taken: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Offer Taken</label>
                  <input
                    type="text"
                    value={formData.offer_taken}
                    onChange={(e) =>
                      setFormData({ ...formData, offer_taken: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                    className="w-full sm:flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:flex-1 px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all disabled:opacity-60"
                  >
                    {saving ? "Saving..." : editingMember ? "Update" : "Add"} Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
