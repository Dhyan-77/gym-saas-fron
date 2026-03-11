import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { Search, Filter } from "lucide-react";
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

export default function AllMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  const [gymId, setGymId] = useState(null);
  const [members, setMembers] = useState([]);

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

    const timer = setTimeout(async () => {
      setLoadingMembers(true);

      try {
        const params = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();

        const res = await api.get(`/api/gyms/${gymId}/members/`, { params });

        const list = Array.isArray(res.data) ? res.data : [];

        list.sort(
          (a, b) => (a.days_left ?? 999999) - (b.days_left ?? 999999)
        );

        if (mounted) setMembers(list);
      } catch (err) {
        if (mounted) setError(parseError(err));
      } finally {
        if (mounted) setLoadingMembers(false);
      }
    }, 350);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [gymId, searchTerm]);

  const filteredMembers = useMemo(() => {
    const withStatus = members.map((m) => ({
      ...m,
      status: statusFromDaysLeft(m.days_left),
    }));

    return withStatus.filter(
      (m) => filterPlan === "all" || m.plan === filterPlan
    );
  }, [members, filterPlan]);

  const loading = loadingGym || loadingMembers;

  return (
    <div className="min-h-[100svh] bg-[#07090f] text-white">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}

        <div className="mb-8">

          <h1 className="text-2xl font-semibold">
            Students & Members
          </h1>

          <p className="text-sm text-white/60">
            View all members and track renewals
          </p>

        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Search + Filter */}

        <div className="mb-6 flex flex-col sm:flex-row gap-3">

          <div className="relative flex-1">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />

            <input
              type="text"
              placeholder="Search name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />

          </div>

          <div className="relative w-full sm:w-48">

            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />

            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="all">All Plans</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>

          </div>

        </div>

        {/* Members List */}

        <div className="space-y-3">

          {filteredMembers.map((m) => {

            const status = m.status;

            const badge =
              status === "active"
                ? "bg-green-500/15 text-green-400"
                : status === "expiring"
                ? "bg-orange-500/15 text-orange-400"
                : "bg-red-500/15 text-red-400";

            return (
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

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${badge}`}
                  >
                    {status === "expiring"
                      ? "Due Soon"
                      : status === "expired"
                      ? "Expired"
                      : "Active"}
                  </span>

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
            );
          })}

        </div>

        {!loading && filteredMembers.length === 0 && (

          <div className="text-center py-16">

            <p className="text-white/60">
              No members found.
            </p>

          </div>

        )}

      </div>
    </div>
  );
}