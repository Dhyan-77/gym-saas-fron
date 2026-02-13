import { useState } from "react";
import Navigation from "../components/Navigation";
import { Search, Filter } from "lucide-react";

export default function AllMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

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
  ];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || member.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="relative min-h-[100svh] bg-black text-white">
      <Navigation />

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-6 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-6 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            All Members
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Complete list of all gym members
          </p>
        </div>

        {/* Sticky Filters */}
        <div className="sticky top-16 z-30 mb-6">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">

            <div className="flex flex-col sm:flex-row gap-4">

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
                />
              </div>

              {/* Plan Filter */}
              <div className="sm:w-48 relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 appearance-none"
                >
                  <option value="all">All Plans</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-400 break-all">
                    {member.email}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
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

              {/* Plan */}
              <div className="mt-3 inline-block px-3 py-1 bg-white/10 rounded-lg text-xs">
                {member.plan}
              </div>

              {/* Days Remaining (More Prominent) */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-gray-400">Days Remaining</div>
                <div
                  className={`text-2xl font-semibold ${
                    member.daysRemaining < 0
                      ? "text-red-400"
                      : member.daysRemaining < 7
                      ? "text-orange-400"
                      : "text-green-400"
                  }`}
                >
                  {member.daysRemaining < 0
                    ? `${Math.abs(member.daysRemaining)} overdue`
                    : `${member.daysRemaining} days`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No members found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
