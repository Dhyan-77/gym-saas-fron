import { useState } from "react";
import Navigation from "../components/Navigation";
import { Search, Filter } from "lucide-react";

export default function AllMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  // Mock data
  const members = [
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "(555) 123-4567",
      plan: "Premium",
      startDate: "2026-01-01",
      endDate: "2026-03-01",
      status: "active",
      daysRemaining: 24,
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
      daysRemaining: 10,
    },
    {
      id: "3",
      name: "Mike Davis",
      email: "mike@example.com",
      phone: "(555) 345-6789",
      plan: "VIP",
      startDate: "2025-12-01",
      endDate: "2026-02-28",
      status: "active",
      daysRemaining: 23,
    },
    {
      id: "4",
      name: "Emily Wilson",
      email: "emily@example.com",
      phone: "(555) 456-7890",
      plan: "Standard",
      startDate: "2026-01-20",
      endDate: "2026-02-20",
      status: "expiring",
      daysRemaining: 15,
    },
    {
      id: "5",
      name: "David Brown",
      email: "david@example.com",
      phone: "(555) 567-8901",
      plan: "Premium",
      startDate: "2025-11-15",
      endDate: "2026-01-15",
      status: "expired",
      daysRemaining: -21,
    },
  ];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || member.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Gradient background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            All Members
          </h1>
          <p className="text-gray-400">Complete list of all gym members</p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Plan Filter */}
            <div className="sm:w-48 relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 appearance-none"
              >
                <option value="all">All Plans</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-200"
            >
              {/* Member Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl mb-1">{member.name}</h3>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs ${
                      member.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : member.status === "expiring"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-lg text-sm">
                  {member.plan}
                </div>
              </div>

              {/* Member Details */}
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Email:</span>
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Phone:</span>
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Start:</span>
                  <span>{member.startDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">End:</span>
                  <span>{member.endDate}</span>
                </div>
              </div>

              {/* Days Remaining */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400">Days Remaining</div>
                <div
                  className={`text-2xl ${
                    member.daysRemaining < 0
                      ? "text-red-400"
                      : member.daysRemaining < 7
                      ? "text-orange-400"
                      : "text-green-400"
                  }`}
                >
                  {member.daysRemaining < 0
                    ? `${Math.abs(member.daysRemaining)} days overdue`
                    : `${member.daysRemaining} days`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No members found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
