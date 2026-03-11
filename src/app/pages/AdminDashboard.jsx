import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { Plus, Edit2, Trash2, X } from "lucide-react";
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
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === "active"
          ? "bg-green-500/15 text-green-400"
          : status === "expiring"
          ? "bg-orange-500/15 text-orange-400"
          : "bg-red-500/15 text-red-400"
      }`}
    >
      {status === "expiring" ? "Due Soon" : status}
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
    return () => (mounted = false);
  }, []);

  const openAddModal = () => {
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
      toast.error(parseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#07090f] text-white">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-2xl font-semibold">
              Students & Members
            </h1>

            <p className="text-sm text-white/60">
              Track renewals and manage members
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-medium hover:bg-gray-200"
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>

        {/* Stats */}

        <div className="grid grid-cols-3 gap-4 mb-8">

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Total</p>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Active</p>
            <p className="text-2xl font-semibold text-green-400">{stats.active}</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/60">Due Soon</p>
            <p className="text-2xl font-semibold text-orange-400">
              {stats.expiring}
            </p>
          </div>

        </div>

        {/* Member List */}

        <div className="space-y-3">

          {membersWithStatus.map((m) => (

            <div
              key={m.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >

              <div className="flex items-center justify-between">

                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-white/60">{m.phone || "-"}</p>
                </div>

                <StatusPill status={m.status} />

              </div>

              <div className="mt-3 flex justify-between text-sm text-white/70">

                <div>
                  <p>Plan</p>
                  <p className="text-white">{m.plan}</p>
                </div>

                <div>
                  <p>Renewal</p>
                  <p className="text-white">{m.end_date}</p>
                </div>

                <div>
                  <p>Days</p>
                  <p className="text-white">{m.days_left}</p>
                </div>

              </div>

              <div className="mt-4 flex justify-end gap-2">

                <button
                  onClick={() => openEditModal(m)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteMember(m.id)}
                  className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* Drawer */}

        <Drawer.Root open={showModal} onOpenChange={setShowModal}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/60" />

            <Drawer.Content className="fixed bottom-0 left-0 right-0 bg-[#111] rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">

              <h2 className="text-xl font-semibold mb-6">
                {editingMember ? "Edit Member" : "Add Member"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e)=>setFormData({...formData,name:e.target.value})}
                  required
                />

                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e)=>setFormData({...formData,phone:e.target.value})}
                />

                <div className="grid grid-cols-2 gap-3">

                  <input
                    type="date"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                    value={formData.start_date}
                    onChange={(e)=>setFormData({...formData,start_date:e.target.value})}
                    required
                  />

                  <input
                    type="date"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                    value={formData.end_date}
                    onChange={(e)=>setFormData({...formData,end_date:e.target.value})}
                    required
                  />

                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-white text-black py-3 rounded-xl font-medium"
                >
                  {saving ? "Saving..." : editingMember ? "Update Member" : "Add Member"}
                </button>

              </form>

            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

      </div>
    </div>
  );
} 