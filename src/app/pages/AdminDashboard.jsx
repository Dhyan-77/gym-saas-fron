import { useState } from "react";
import Navigation from "../components/Navigation";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export default function AdminDashboard() {
  const [members, setMembers] = useState([
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "(555) 123-4567",
      plan: "Premium",
      startDate: "2026-01-01",
      endDate: "2026-03-01",
      status: "active",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "(555) 234-5678",
      plan: "Standard",
      startDate: "2026-01-15",
      endDate: "2026-02-15",
      status: "expiring",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    plan: "Standard",
    startDate: "",
    endDate: "",
  });

  const handleAddMember = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      plan: "Standard",
      startDate: "",
      endDate: "",
    });
    setShowModal(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      plan: member.plan,
      startDate: member.startDate,
      endDate: member.endDate,
    });
    setShowModal(true);
  };

  const handleDeleteMember = (id) => {
    if (confirm("Are you sure you want to delete this member?")) {
      setMembers(members.filter((m) => m.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingMember) {
      setMembers(
        members.map((m) =>
          m.id === editingMember.id ? { ...m, ...formData, status: "active" } : m
        )
      );
    } else {
      const newMember = {
        id: Date.now().toString(),
        ...formData,
        status: "active",
      };
      setMembers([...members, newMember]);
    }

    setShowModal(false);
  };

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

  return (
    <div className="relative min-h-[100dvh] bg-black text-white">
      <Navigation />

      {/* Gradient background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-6 sm:top-1/4 sm:left-1/4 w-56 h-56 sm:w-96 sm:h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-6 sm:bottom-1/4 sm:right-1/4 w-56 h-56 sm:w-96 sm:h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Header */}
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
            onClick={handleAddMember}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="text-gray-400 text-sm mb-2">Total Members</div>
            <div className="text-2xl sm:text-3xl">{members.length}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="text-gray-400 text-sm mb-2">Active Members</div>
            <div className="text-2xl sm:text-3xl text-green-400">
              {members.filter((m) => m.status === "active").length}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="text-gray-400 text-sm mb-2">Expiring Soon</div>
            <div className="text-2xl sm:text-3xl text-orange-400">
              {members.filter((m) => m.status === "expiring").length}
            </div>
          </div>
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Name</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Email</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Phone</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Plan</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">End Date</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Status</th>
                  <th className="text-right px-6 py-4 text-gray-400 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">{member.name}</td>
                    <td className="px-6 py-4 text-gray-400">{member.email}</td>
                    <td className="px-6 py-4 text-gray-400">{member.phone}</td>
                    <td className="px-6 py-4">{member.plan}</td>
                    <td className="px-6 py-4 text-gray-400">{member.endDate}</td>
                    <td className="px-6 py-4">
                      <StatusPill status={member.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards (<md) */}
        <div className="md:hidden space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-medium">{member.name}</div>
                  <div className="text-sm text-gray-400 break-all">{member.email}</div>
                </div>
                <StatusPill status={member.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">Phone</div>
                  <div className="text-white">{member.phone}</div>
                </div>
                <div>
                  <div className="text-gray-400">Plan</div>
                  <div className="text-white">{member.plan}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-400">End Date</div>
                  <div className="text-white">{member.endDate}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEditMember(member)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                    required
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
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all"
                  >
                    {editingMember ? "Update" : "Add"} Member
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
