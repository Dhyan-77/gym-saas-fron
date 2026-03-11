import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { Plus, Edit2, Trash2, X, Users, Clock3, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "vaul";
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
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        status === "active"
          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/15"
          : status === "expiring"
          ? "bg-orange-500/15 text-orange-300 border border-orange-400/15"
          : "bg-red-500/15 text-red-300 border border-red-400/15"
      }`}
    >
      {status === "expiring" ? "Due Soon" : status === "expired" ? "Expired" : "Active"}
    </span>
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const gymsRes = await api.get("/api/gyms/");
        const gyms = Array.isArray(gymsRes.data) ? gymsRes.data : [];

        if (!gyms.length) {
          window.location.href = "/gym-setup";
          return;
        }

        const activeId = getActiveGymId(gyms);

        if (!mounted) return;
        setGymId(activeId);

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

  const handleDeleteMember = async (id) => {
    if (!gymId) return;

    if (!confirm("Delete this member?")) return;

    try {
      await api.delete(`/api/gyms/${gymId}/members/${id}/delete`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Member deleted");
    } catch (err) {
      toast.error(parseError(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

        toast.success("Member updated");
      } else {
        const res = await api.post(`/api/gyms/${gymId}/members/`, formData);
        setMembers((prev) => [res.data, ...prev]);
        toast.success("Member added");
      }

      setShowModal(false);
    } catch (err) {
      const msg = parseError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#07090f] text-white">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Students & Members
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Add members, track renewals and keep records clear.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 active:scale-[0.98]"
          >
            <Plus size={18} />
            Add Member
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200 whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Users className="h-4 w-4" />
              Total Members
            </div>
            <div className="mt-2 text-3xl font-semibold text-white">
              {loading ? "…" : stats.total}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Active
            </div>
            <div className="mt-2 text-3xl font-semibold text-emerald-300">
              {loading ? "…" : stats.active}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock3 className="h-4 w-4 text-orange-300" />
              Due Soon
            </div>
            <div className="mt-2 text-3xl font-semibold text-orange-300">
              {loading ? "…" : stats.expiring}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {!loading && membersWithStatus.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-center">
              <p className="text-base font-medium text-white">No members added yet</p>
              <p className="mt-1 text-sm text-white/55">
                Add your first member to start tracking renewals.
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                <Plus size={16} />
                Add Member
              </button>
            </div>
          )}

          {membersWithStatus.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{m.name}</p>
                  <p className="mt-1 text-sm text-white/55">{m.phone || "No phone number"}</p>
                </div>

                <StatusPill status={m.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-black/20 p-3 text-sm">
                <div>
                  <p className="text-white/45">Plan</p>
                  <p className="mt-1 text-white">{m.plan || "-"}</p>
                </div>

                <div>
                  <p className="text-white/45">Renewal</p>
                  <p className="mt-1 text-white">{m.end_date || "-"}</p>
                </div>

                <div>
                  <p className="text-white/45">Days Left</p>
                  <p className="mt-1 text-white">{m.days_left ?? "-"}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => openEditModal(m)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10"
                >
                  <Edit2 size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteMember(m.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <Drawer.Root open={showModal} onOpenChange={setShowModal}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />

            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-[28px] border-t border-white/15 bg-[#161a22] shadow-[0_-20px_60px_rgba(0,0,0,0.55)]">
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20" />

              <div className="mx-auto max-w-xl p-5 sm:p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {editingMember ? "Edit member" : "Add new member"}
                    </h2>
                    <p className="mt-1 text-sm text-white/55">
                      Keep member details and renewal dates updated.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                  >
                    <X size={18} />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200 whitespace-pre-line">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      Full name
                    </label>
                    <input
                      className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                      placeholder="Enter member name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      Phone number
                    </label>
                    <input
                      className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      Plan
                    </label>
                    <select
                      value={formData.plan}
                      onChange={(e) =>
                        setFormData({ ...formData, plan: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                    >
                      <option value="monthly" className="bg-[#202632]">
                        Monthly
                      </option>
                      <option value="yearly" className="bg-[#202632]">
                        Yearly
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">
                        Start date
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({ ...formData, start_date: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">
                        Renewal date
                      </label>
                      <input
                        type="date"
                        className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({ ...formData, end_date: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      Course / batch
                    </label>
                    <input
                      className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                      placeholder="Optional"
                      value={formData.course_taken}
                      onChange={(e) =>
                        setFormData({ ...formData, course_taken: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      Offer / notes
                    </label>
                    <input
                      className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                      placeholder="Optional"
                      value={formData.offer_taken}
                      onChange={(e) =>
                        setFormData({ ...formData, offer_taken: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 sm:w-auto"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200 disabled:opacity-60 sm:w-auto"
                    >
                      {saving
                        ? "Saving..."
                        : editingMember
                        ? "Update Member"
                        : "Add Member"}
                    </button>
                  </div>
                </form>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  );
}