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
      .map(([k, v]) =>
        Array.isArray(v) ? `${k}: ${v.join(" ")}` : `${k}: ${v}`
      )
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

  useEffect(() => {

    let mounted = true;

    async function loadGym() {

      try {

        const gymsRes = await api.get("/api/gyms/");

        const gyms = Array.isArray(gymsRes.data) ? gymsRes.data : [];

        if (!gyms.length) {
          window.location.href = "/gym-setup";
          return;
        }

        const id = getActiveGymId(gyms);

        if (mounted) setGymId(id);

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

  useEffect(() => {

    if (!gymId) return;

    let mounted = true;

    async function loadMembers() {

      try {

        const allRes = await api.get(`/api/gyms/${gymId}/members/`);
        const expRes = await api.get(`/api/gyms/${gymId}/members/expiring/`, {
          params: { days: 7 },
        });

        const allList = Array.isArray(allRes.data) ? allRes.data : [];
        const expList = Array.isArray(expRes.data) ? expRes.data : [];

        allList.sort(
          (a, b) => (a.days_left ?? 999999) - (b.days_left ?? 999999)
        );

        expList.sort(
          (a, b) => (a.days_left ?? 999999) - (b.days_left ?? 999999)
        );

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

  const allWithStatus = useMemo(
    () =>
      allMembers.map((m) => ({
        ...m,
        status: statusFromDaysLeft(m.days_left),
      })),
    [allMembers]
  );

  const expiringWithStatus = useMemo(
    () =>
      expiringMembers.map((m) => ({
        ...m,
        status: statusFromDaysLeft(m.days_left),
      })),
    [expiringMembers]
  );

  const stats = useMemo(() => {

    const expired = allWithStatus.filter(
      (m) => m.status === "expired"
    ).length;

    const active = allWithStatus.filter(
      (m) => m.status === "active"
    ).length;

    const expiring = expiringWithStatus.filter(
      (m) => m.status === "expiring"
    ).length;

    return { expired, expiring, active };

  }, [allWithStatus, expiringWithStatus]);

  const filteredMembers = useMemo(() => {

    if (selectedTab === "expiring") return expiringWithStatus;

    if (selectedTab === "expired")
      return allWithStatus.filter((m) => m.status === "expired");

    return allWithStatus;

  }, [allWithStatus, expiringWithStatus, selectedTab]);

  const StatusBadge = ({ status }) => {

    if (status === "expired")
      return (
        <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
          Overdue
        </span>
      );

    if (status === "expiring")
      return (
        <span className="text-xs text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">
          Due Soon
        </span>
      );

    return (
      <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
        Active
      </span>
    );

  };

  return (

    <div className="min-h-[100svh] bg-[#07090f] text-white">

      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-2xl font-semibold">
            Fee Renewals
          </h1>

          <p className="text-sm text-white/60">
            Track members whose fees are due
          </p>

        </div>

        {error && (

          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm whitespace-pre-line">
            {error}
          </div>

        )}

        {/* Stats */}

        <div className="grid grid-cols-3 gap-4 mb-8">

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">

            <div className="flex items-center gap-2 text-red-400 text-sm">

              <AlertCircle size={16} />

              Overdue Fees

            </div>

            <div className="text-2xl font-semibold mt-2">
              {loading ? "…" : stats.expired}
            </div>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">

            <div className="flex items-center gap-2 text-orange-400 text-sm">

              <Clock size={16} />

              Due Soon

            </div>

            <div className="text-2xl font-semibold mt-2">
              {loading ? "…" : stats.expiring}
            </div>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">

            <div className="flex items-center gap-2 text-green-400 text-sm">

              <CheckCircle size={16} />

              Active Members

            </div>

            <div className="text-2xl font-semibold mt-2">
              {loading ? "…" : stats.active}
            </div>

          </div>

        </div>

        {/* Tabs */}

        <div className="flex gap-2 mb-6">

          {[
            { key: "all", label: "All" },
            { key: "expiring", label: "Due Soon" },
            { key: "expired", label: "Overdue" },
          ].map((tab) => (

            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm ${
                selectedTab === tab.key
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>

          ))}

        </div>

        {/* Members */}

        <div className="space-y-3">

          {filteredMembers.map((m) => (

            <div
              key={m.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="font-medium">{m.name}</p>

                  <p className="text-sm text-white/60">
                    {m.phone || "No phone"}
                  </p>

                </div>

                <StatusBadge status={m.status} />

              </div>

              <div className="mt-3 grid grid-cols-3 text-sm">

                <div>

                  <p className="text-white/50">Plan</p>

                  <p>{m.plan}</p>

                </div>

                <div>

                  <p className="text-white/50">Renewal</p>

                  <p>{m.end_date}</p>

                </div>

                <div>

                  <p className="text-white/50">Days</p>

                  <p
                    className={
                      m.days_left < 0
                        ? "text-red-400"
                        : m.days_left <= 7
                        ? "text-orange-400"
                        : "text-green-400"
                    }
                  >
                    {m.days_left < 0
                      ? `${Math.abs(m.days_left)} overdue`
                      : `${m.days_left} days`}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}