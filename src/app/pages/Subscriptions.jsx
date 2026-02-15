import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
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

export default function Subscriptions() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [gymId, setGymId] = useState(null);

  const [allMembers, setAllMembers] = useState([]);
  const [expiringMembers, setExpiringMembers] = useState([]);

  const [loadingGym, setLoadingGym] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState("");

  // 1) load active gym id
  useEffect(() => {
    let mounted = true;

    async function loadGym() {
      setLoadingGym(true);
      setError("");

      try {
        // ✅ FIX: correct token key
        const token = localStorage.getItem("access");
        if (!token) {
          window.location.href = "/";
          return;
        }

        const gymsRes = await api.get("/api/gyms/");
        const gyms = Array.isArray(gymsRes.data) ? gymsRes.data : [];

        if (!gyms.length) {
          window.location.href = "/gym-setup";
          return;
        }

        // ✅ FIX: use selected gym (multi gym support)
        const id = getActiveGymId(gyms);
        if (!id) {
          window.location.href = "/gym-setup";
          return;
        }

        if (!mounted) return;
        setGymId(id);
      } catch (err) {
        if (mounted) setError(parseError(err));
      } finally {
        if (mounted) setLoadingGym(false);
      }
    }

    loadGym();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) load members when gymId is known
  useEffect(() => {
    if (!gymId) return;

    let mounted = true;

    async function loadMembers() {
      setLoadingMembers(true);
      setError("");

      try {
        // A) ALL
        const allRes = await api.get(`/api/gyms/${gymId}/members/`);
        const allList = Array.isArray(allRes.data) ? allRes.data : [];

        // B) EXPIRING (<=7 days)
        const expRes = await api.get(`/api/gyms/${gymId}/members/expiring/`, {
          params: { days: 7 },
        });
        const expList = Array.isArray(expRes.data) ? expRes.data : [];

        allList.sort((a, b) => (a.days_left ?? 999999) - (b.days_left ?? 999999));
        expList.sort((a, b) => (a.days_left ?? 999999) - (b.days_left ?? 999999));

        if (!mounted) return;
        setAllMembers(allList);
        setExpiringMembers(expList);
      } catch (err) {
        if (mounted) setError(parseError(err));
      } finally {
        if (mounted) setLoadingMembers(false);
      }
    }

    loadMembers();
    return () => {
      mounted = false;
    };
  }, [gymId]);

  const loading = loadingGym || loadingMembers;

  // normalize
  const allWithStatus = useMemo(
    () => allMembers.map((m) => ({ ...m, status: statusFromDaysLeft(m.days_left) })),
    [allMembers]
  );

  const expiringWithStatus = useMemo(
    () => expiringMembers.map((m) => ({ ...m, status: statusFromDaysLeft(m.days_left) })),
    [expiringMembers]
  );

  const stats = useMemo(() => {
    const expired = allWithStatus.filter((m) => m.status === "expired").length;
    const active = allWithStatus.filter((m) => m.status === "active").length;

    // use expiring endpoint for accuracy
    const expiring = expiringWithStatus.filter((m) => m.status === "expiring").length;

    return { expired, expiring, active };
  }, [allWithStatus, expiringWithStatus]);

  const filteredMembers = useMemo(() => {
    if (selectedTab === "expiring") return expiringWithStatus;
    if (selectedTab === "expired") return allWithStatus.filter((m) => m.status === "expired");
    return allWithStatus;
  }, [allWithStatus, expiringWithStatus, selectedTab]);

  const DaysText = ({ days }) => (
    <div
      className={`text-lg font-semibold ${
        days < 0 ? "text-red-400" : days <= 7 ? "text-orange-400" : "text-green-400"
      }`}
    >
      {days < 0 ? `${Math.abs(days)} overdue` : `${days} days`}
    </div>
  );

  return (
    <div className="relative min-h-[100svh] bg-black text-white">
      <Navigation />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-6 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-6 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Subscription Status
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Monitor member renewals & expirations
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Expired",
              value: stats.expired,
              icon: <AlertCircle className="w-5 h-5 text-red-400" />,
              color: "text-red-400",
            },
            {
              label: "Expiring (≤ 7 days)",
              value: stats.expiring,
              icon: <Clock className="w-5 h-5 text-orange-400" />,
              color: "text-orange-400",
            },
            {
              label: "Active",
              value: stats.active,
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
                {loading ? "…" : stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
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
                  selectedTab === tab.key ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {!loading && filteredMembers.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-gray-400">
              No members in this category.
            </div>
          )}

          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className={`bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-lg ${
                m.status === "expired"
                  ? "border-red-500/30"
                  : m.status === "expiring"
                  ? "border-orange-500/30"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold">{m.name}</div>
                  <div className="text-sm text-gray-400 break-all">{m.phone || "—"}</div>
                </div>

                <div className="text-right">
                  <DaysText days={m.days_left} />
                  <div className="text-xs text-gray-500">Ends {m.end_date}</div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-xs">{m.plan}</span>
                <span
                  className={`text-xs font-medium ${
                    m.status === "expired"
                      ? "text-red-400"
                      : m.status === "expiring"
                      ? "text-orange-400"
                      : "text-green-400"
                  }`}
                >
                  {m.status}
                </span>
              </div>
            </div>
          ))}

          {loading &&
            allMembers.length === 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 text-gray-600"
              >
                Loading…
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
