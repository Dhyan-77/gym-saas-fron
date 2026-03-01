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
const StatusPill = ({ status }) => {
  const styles =
    status === "active"
      ? "bg-emerald-400/15 text-emerald-200 border-emerald-300/20"
      : status === "expiring"
      ? "bg-amber-400/15 text-amber-200 border-amber-300/20"
      : "bg-rose-400/15 text-rose-200 border-rose-300/20";

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${styles} backdrop-blur-md`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};

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
  <div className="relative min-h-[100dvh] bg-[#05060A] text-white overflow-hidden">
    {/* iOS-ish global styling helpers */}
    <style>{`
      :root{
        --glass: rgba(255,255,255,.06);
        --glass-2: rgba(255,255,255,.09);
        --hairline: rgba(255,255,255,.10);
        --hairline-2: rgba(255,255,255,.14);
        --shadow: 0 18px 50px rgba(0,0,0,.55);
        --shadow-soft: 0 12px 28px rgba(0,0,0,.40);
      }
      .glass {
        background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
        border: 1px solid rgba(255,255,255,.12);
        box-shadow: var(--shadow-soft);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
      }
      .glass-strong {
        background: linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.06));
        border: 1px solid rgba(255,255,255,.14);
        box-shadow: var(--shadow);
        backdrop-filter: blur(22px);
        -webkit-backdrop-filter: blur(22px);
      }
      .glass-inset {
        position: relative;
        overflow: hidden;
      }
      .glass-inset:before{
        content:"";
        position:absolute;
        inset:-2px;
        background: radial-gradient(900px 380px at 12% 0%, rgba(255,255,255,.16), transparent 55%),
                    radial-gradient(700px 300px at 90% 10%, rgba(255,255,255,.10), transparent 60%);
        pointer-events:none;
      }
      .hairline {
        border-color: rgba(255,255,255,.10);
      }
      .ios-btn {
        background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(255,255,255,.86));
        color: #0B0D12;
        border: 1px solid rgba(255,255,255,.55);
        box-shadow: 0 12px 30px rgba(0,0,0,.45);
      }
      .ios-btn:hover{ filter: brightness(1.02); transform: translateY(-1px); }
      .ios-btn:active{ transform: translateY(0px); filter: brightness(.98); }
      .ios-ghost {
        background: rgba(255,255,255,.06);
        border: 1px solid rgba(255,255,255,.12);
      }
      .ios-ghost:hover{ background: rgba(255,255,255,.09); }
      .ios-danger {
        background: rgba(255, 59, 48, .12);
        border: 1px solid rgba(255, 59, 48, .28);
        color: rgba(255, 140, 140, 1);
      }
      .ios-danger:hover{ background: rgba(255, 59, 48, .18); }
      .soft-text { color: rgba(255,255,255,.72); }
      .soft-text-2 { color: rgba(255,255,255,.55); }
      .noise {
        position:absolute; inset:0;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.12'/%3E%3C/svg%3E");
        mix-blend-mode: overlay;
        opacity:.18;
        pointer-events:none;
      }
    `}</style>

    <Navigation />

    {/* Background blobs + subtle noise (premium iOS depth) */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-24 -left-28 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.28),transparent_60%)] blur-3xl" />
      <div className="absolute top-24 -right-32 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.26),transparent_62%)] blur-3xl" />
      <div className="absolute bottom-[-140px] left-1/4 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.16),transparent_62%)] blur-3xl" />
      <div className="noise" />
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-10">
        <div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-[-0.02em]">
            <span className="bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              Member Management
            </span>
          </h1>
          <p className="mt-1 text-sm sm:text-base soft-text-2">
            Add, edit, and manage your gym members
          </p>
        </div>

        <button
          onClick={openAddModal}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl ios-btn transition-all duration-200 disabled:opacity-60 disabled:transform-none"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-2xl glass border border-red-500/25 text-red-100 text-sm whitespace-pre-line">
          <div className="font-medium mb-1">Something went wrong</div>
          <div className="text-red-200/80">{error}</div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div className="glass glass-inset rounded-3xl p-5 sm:p-6">
          <div className="text-xs uppercase tracking-wide soft-text-2 mb-2">
            Total Members
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em]">
            {loading ? "…" : stats.total}
          </div>
        </div>

        <div className="glass glass-inset rounded-3xl p-5 sm:p-6">
          <div className="text-xs uppercase tracking-wide soft-text-2 mb-2">
            Active Members
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-emerald-300">
            {loading ? "…" : stats.active}
          </div>
        </div>

        <div className="glass glass-inset rounded-3xl p-5 sm:p-6">
          <div className="text-xs uppercase tracking-wide soft-text-2 mb-2">
            Expiring Soon (≤ 7 days)
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-amber-300">
            {loading ? "…" : stats.expiring}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block glass-strong rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b hairline bg-white/[0.03]">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wide soft-text-2">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wide soft-text-2">
                  Phone
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wide soft-text-2">
                  Plan
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wide soft-text-2">
                  End Date
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wide soft-text-2">
                  Days Left
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wide soft-text-2">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs uppercase tracking-wide soft-text-2">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && membersWithStatus.length === 0 && (
                <tr>
                  <td className="px-6 py-8 soft-text-2" colSpan={7}>
                    No members yet. Click “Add Member”.
                  </td>
                </tr>
              )}

              {membersWithStatus.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-white/5 hover:bg-white/[0.04] transition-colors"
                >
                  <td className="px-6 py-4 font-medium">{m.name}</td>
                  <td className="px-6 py-4 soft-text">{m.phone || "-"}</td>
                  <td className="px-6 py-4 capitalize">{m.plan}</td>
                  <td className="px-6 py-4 soft-text">{m.end_date}</td>
                  <td className="px-6 py-4 soft-text">{m.days_left}</td>
                  <td className="px-6 py-4">
                    <StatusPill status={m.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-2 rounded-xl ios-ghost transition-colors"
                        aria-label="Edit member"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(m.id)}
                        className="p-2 rounded-xl ios-danger transition-colors"
                        aria-label="Delete member"
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
                    <td className="px-6 py-6 soft-text-2" colSpan={7}>
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
          <div className="glass rounded-3xl p-4 soft-text-2">
            No members yet. Tap “Add Member”.
          </div>
        )}

        {membersWithStatus.map((m) => (
          <div key={m.id} className="glass glass-inset rounded-3xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold tracking-[-0.01em]">
                  {m.name}
                </div>
                <div className="text-sm soft-text">{m.phone || "-"}</div>
              </div>
              <StatusPill status={m.status} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="soft-text-2 text-xs uppercase tracking-wide">
                  Plan
                </div>
                <div className="capitalize">{m.plan}</div>
              </div>
              <div>
                <div className="soft-text-2 text-xs uppercase tracking-wide">
                  Days Left
                </div>
                <div>{m.days_left}</div>
              </div>
              <div className="col-span-2">
                <div className="soft-text-2 text-xs uppercase tracking-wide">
                  End Date
                </div>
                <div>{m.end_date}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(m)}
                className="px-3 py-2 rounded-2xl ios-ghost transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={() => handleDeleteMember(m.id)}
                className="px-3 py-2 rounded-2xl ios-danger transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          </div>
        ))}

        {loading && (
          <div className="glass rounded-3xl p-4 soft-text-2">Loading…</div>
        )}
      </div>
    </div>

    {/* Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div className="glass-strong rounded-3xl w-full max-w-md max-h-[85dvh] overflow-y-auto">
          <div className="p-5 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em]">
                {editingMember ? "Edit Member" : "Add New Member"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-2xl ios-ghost transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide soft-text-2 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-white/30 focus:outline-none focus:border-white/[0.26] focus:ring-2 focus:ring-white/10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide soft-text-2 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-white/30 focus:outline-none focus:border-white/[0.26] focus:ring-2 focus:ring-white/10"
                  placeholder="10-digit number"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide soft-text-2 mb-2">
                  Plan *
                </label>
                <select
                  value={formData.plan}
                  onChange={(e) =>
                    setFormData({ ...formData, plan: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white focus:outline-none focus:border-white/[0.26] focus:ring-2 focus:ring-white/10"
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wide soft-text-2 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white focus:outline-none focus:border-white/[0.26] focus:ring-2 focus:ring-white/10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide soft-text-2 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white focus:outline-none focus:border-white/[0.26] focus:ring-2 focus:ring-white/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide soft-text-2 mb-2">
                  Course Taken
                </label>
                <input
                  type="text"
                  value={formData.course_taken}
                  onChange={(e) =>
                    setFormData({ ...formData, course_taken: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-white/30 focus:outline-none focus:border-white/[0.26] focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide soft-text-2 mb-2">
                  Offer Taken
                </label>
                <input
                  type="text"
                  value={formData.offer_taken}
                  onChange={(e) =>
                    setFormData({ ...formData, offer_taken: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-white placeholder-white/30 focus:outline-none focus:border-white/[0.26] focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="w-full sm:flex-1 px-6 py-3 rounded-2xl ios-ghost transition-all disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:flex-1 px-6 py-3 rounded-2xl ios-btn transition-all disabled:opacity-60 disabled:transform-none"
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
