import { useState } from "react";
import Navigation from "../components/Navigation";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function Subscriptions() {
  const members = [
    {
      id: "5",
      name: "David Brown",
      email: "david@example.com",
      phone: "(555) 567-8901",
      plan: "Premium",
      endDate: "2026-01-15",
      daysRemaining: -21,
      status: "expired",
    },
    {
      id: "6",
      name: "Lisa Anderson",
      email: "lisa@example.com",
      phone: "(555) 678-9012",
      plan: "Standard",
      endDate: "2026-02-07",
      daysRemaining: 2,
      status: "expiring",
    },
    {
      id: "7",
      name: "Robert Taylor",
      email: "robert@example.com",
      phone: "(555) 789-0123",
      plan: "VIP",
      endDate: "2026-02-09",
      daysRemaining: 4,
      status: "expiring",
    },
    {
      id: "8",
      name: "Jennifer Lee",
      email: "jennifer@example.com",
      phone: "(555) 890-1234",
      plan: "Standard",
      endDate: "2026-02-10",
      daysRemaining: 5,
      status: "expiring",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "(555) 234-5678",
      plan: "Standard",
      endDate: "2026-02-15",
      daysRemaining: 10,
      status: "expiring",
    },
    {
      id: "4",
      name: "Emily Wilson",
      email: "emily@example.com",
      phone: "(555) 456-7890",
      plan: "Standard",
      endDate: "2026-02-20",
      daysRemaining: 15,
      status: "expiring",
    },
    {
      id: "3",
      name: "Mike Davis",
      email: "mike@example.com",
      phone: "(555) 345-6789",
      plan: "VIP",
      endDate: "2026-02-28",
      daysRemaining: 23,
      status: "active",
    },
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      phone: "(555) 123-4567",
      plan: "Premium",
      endDate: "2026-03-01",
      daysRemaining: 24,
      status: "active",
    },
  ];

  const [selectedTab, setSelectedTab] = useState("all");

  const filteredMembers = members.filter((member) => {
    if (selectedTab === "expiring") return member.status === "expiring";
    if (selectedTab === "expired") return member.status === "expired";
    return true;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "expired":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case "expiring":
        return <Clock className="w-5 h-5 text-orange-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
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

  const DaysText = ({ daysRemaining }) => (
    <div
      className={`${
        daysRemaining < 0
          ? "text-red-400"
          : daysRemaining < 7
          ? "text-orange-400"
          : "text-green-400"
      }`}
    >
      {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
    </div>
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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl mb-1 sm:mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Subscription Status
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Monitor member subscriptions and renewals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="text-gray-400 text-sm">Expired</div>
            </div>
            <div className="text-2xl sm:text-3xl text-red-400">
              {members.filter((m) => m.status === "expired").length}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <div className="text-gray-400 text-sm">Expiring Soon (&lt; 7 days)</div>
            </div>
            <div className="text-2xl sm:text-3xl text-orange-400">
              {members.filter((m) => m.daysRemaining > 0 && m.daysRemaining < 7).length}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="text-gray-400 text-sm">Active</div>
            </div>
            <div className="text-2xl sm:text-3xl text-green-400">
              {members.filter((m) => m.status === "active").length}
            </div>
          </div>
        </div>

        {/* Tabs (wrap on mobile) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 mb-5 sm:mb-6 inline-flex flex-wrap gap-2">
          {[
            { key: "all", label: "All Members" },
            { key: "expiring", label: "Expiring Soon" },
            { key: "expired", label: "Expired" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedTab(t.key)}
              className={`px-4 sm:px-6 py-2 rounded-xl transition-all text-sm sm:text-base ${
                selectedTab === t.key
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Desktop Table (md+) */}
        <div className="hidden md:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Priority</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Member</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Contact</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Plan</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">End Date</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Days Remaining</th>
                  <th className="text-left px-6 py-4 text-gray-400 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className={`border-b border-white/5 transition-colors ${
                      member.status === "expired"
                        ? "bg-red-500/5 hover:bg-red-500/10"
                        : member.daysRemaining < 7
                        ? "bg-orange-500/5 hover:bg-orange-500/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(member.status)}
                        <span className="text-gray-400">#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{member.name}</td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="text-sm">{member.email}</div>
                      <div className="text-xs text-gray-500">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 bg-white/10 rounded-lg text-sm">
                        {member.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{member.endDate}</td>
                    <td className="px-6 py-4">
                      <DaysText daysRemaining={member.daysRemaining} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={member.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards (<md) */}
        <div className="md:hidden space-y-3">
          {filteredMembers.map((member, index) => (
            <div
              key={member.id}
              className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 ${
                member.status === "expired"
                  ? "bg-red-500/5"
                  : member.daysRemaining < 7
                  ? "bg-orange-500/5"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(member.status)}
                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                  </div>
                  <div className="mt-1 text-base font-medium">{member.name}</div>
                  <div className="text-sm text-gray-400 break-all">{member.email}</div>
                  <div className="text-xs text-gray-500">{member.phone}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <StatusPill status={member.status} />
                  <span className="inline-flex px-3 py-1 bg-white/10 rounded-lg text-sm">
                    {member.plan}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-400">End Date</div>
                  <div className="text-gray-200">{member.endDate}</div>
                </div>
                <div>
                  <div className="text-gray-400">Remaining</div>
                  <DaysText daysRemaining={member.daysRemaining} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alert Box */}
        {members.filter((m) => m.daysRemaining < 7 && m.daysRemaining > 0).length > 0 && (
          <div className="mt-5 sm:mt-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-base sm:text-lg mb-2 text-orange-400">
                  Action Required
                </h3>
                <p className="text-sm sm:text-base text-gray-300">
                  {members.filter((m) => m.daysRemaining < 7 && m.daysRemaining > 0).length}{" "}
                  member(s) have subscriptions expiring within the next 7 days. Consider reaching
                  out for renewal.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
