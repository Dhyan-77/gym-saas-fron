import { useState } from "react";
import Navigation from "../components/Navigation";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function Subscriptions() {
  const [selectedTab, setSelectedTab] = useState("all");

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
      id: "3",
      name: "Mike Davis",
      email: "mike@example.com",
      phone: "(555) 345-6789",
      plan: "VIP",
      endDate: "2026-02-28",
      daysRemaining: 23,
      status: "active",
    },
  ];

  const filteredMembers = members.filter((member) => {
    if (selectedTab === "expiring") return member.status === "expiring";
    if (selectedTab === "expired") return member.status === "expired";
    return true;
  });

  const DaysText = ({ days }) => (
    <div
      className={`text-lg font-semibold ${
        days < 0
          ? "text-red-400"
          : days < 7
          ? "text-orange-400"
          : "text-green-400"
      }`}
    >
      {days < 0 ? `${Math.abs(days)} overdue` : `${days} days`}
    </div>
  );

  return (
    <div className="relative min-h-[100svh] bg-black text-white">
      <Navigation />

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-6 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-6 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Subscription Status
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Monitor member renewals & expirations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Expired",
              value: members.filter((m) => m.status === "expired").length,
              icon: <AlertCircle className="w-5 h-5 text-red-400" />,
              color: "text-red-400",
            },
            {
              label: "Expiring (<7 days)",
              value: members.filter(
                (m) => m.daysRemaining > 0 && m.daysRemaining < 7
              ).length,
              icon: <Clock className="w-5 h-5 text-orange-400" />,
              color: "text-orange-400",
            },
            {
              label: "Active",
              value: members.filter((m) => m.status === "active").length,
              icon: <CheckCircle className="w-5 h-5 text-green-400" />,
              color: "text-green-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                {stat.icon}
                {stat.label}
              </div>
              <div className={`text-3xl font-semibold mt-3 ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Tabs (Mobile Optimized) */}
        <div className="mb-6 overflow-x-auto">
          <div className="inline-flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl min-w-max">
            {[
              { key: "all", label: "All" },
              { key: "expiring", label: "Expiring" },
              { key: "expired", label: "Expired" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`px-5 py-2 rounded-xl text-sm transition ${
                  selectedTab === tab.key
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4">
          {filteredMembers.map((member, index) => (
            <div
              key={member.id}
              className={`bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg ${
                member.status === "expired"
                  ? "border-red-500/30"
                  : member.daysRemaining < 7
                  ? "border-orange-500/30"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold">
                    {member.name}
                  </div>
                  <div className="text-sm text-gray-400 break-all">
                    {member.email}
                  </div>
                </div>

                <div className="text-right">
                  <DaysText days={member.daysRemaining} />
                  <div className="text-xs text-gray-500">
                    Ends {member.endDate}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-xs">
                  {member.plan}
                </span>

                <span
                  className={`text-xs font-medium ${
                    member.status === "expired"
                      ? "text-red-400"
                      : member.status === "expiring"
                      ? "text-orange-400"
                      : "text-green-400"
                  }`}
                >
                  {member.status}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
