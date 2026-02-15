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
      .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(" ")}` : `${k}: ${v}`))
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

  // 1) Load gyms and pick active gym (multi-gym ready)
  useEffect(() => {
    let mounted = true;

    async function loadGym() {
      setLoadingGym(true);
      setError("");

      try {
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

  // 2) Load members when gymId changes OR when searchTerm changes (debounced)
  useEffect(() => {
    if (!gymId) return;

    let mounted = true;

    const timer = setTimeout(async () => {
      setLoadingMembers(true);
      setError("");

      try {
        const params = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();

        const res = await api.get(`/api/gyms/${gymId}/members/`, { params });
        const list = Array.isArray(res.data) ? res.data : [];

        // optional: sort by days_left ascending (expired -> expiring -> active)
        list.sort((a, b) => (a.days_left ?? 999999) - (b.days_left ?? 999999));

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

  // 3) Client-side plan filter
  const filteredMembers = useMemo(() => {
    const withStatus = members.map((m) => ({
      ...m,
      status: statusFromDaysLeft(m.days_left),
    }));

    return withStatus.filter((m) => {
      return filterPlan === "all" || m.plan === filterPlan;
    });
  }, [members, filterPlan]);

  const loading = loadingGym || loadingMembers;

  return (
    <div className="relative min-h-[100svh] bg-black text-white">
      <Navigation />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-6 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-6 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            All Members
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Complete list of all gym members
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="sticky top-16 z-30 mb-6">
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, phone, course, offer..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
                />
              </div>

              <div className="sm:w-48 relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 appearance-none"
                >
                  <option value="all">All Plans</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                  <p className="text-sm text-gray-400 break-all">{m.phone || "—"}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    m.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : m.status === "expiring"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-white/10 rounded-lg text-xs">
                  {m.plan}
                </span>
                {m.course_taken ? (
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-lg text-xs">
                    {m.course_taken}
                  </span>
                ) : null}
                {m.offer_taken ? (
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-lg text-xs">
                    {m.offer_taken}
                  </span>
                ) : null}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-gray-400">Days Remaining</div>
                <div
                  className={`text-2xl font-semibold ${
                    m.days_left < 0
                      ? "text-red-400"
                      : m.days_left <= 7
                      ? "text-orange-400"
                      : "text-green-400"
                  }`}
                >
                  {m.days_left < 0
                    ? `${Math.abs(m.days_left)} overdue`
                    : `${m.days_left} days`}
                </div>

                <div className="mt-2 text-xs text-gray-400">
                  End: <span className="text-gray-300">{m.end_date}</span>
                </div>
              </div>
            </div>
          ))}

          {loading &&
            members.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 text-gray-600"
              >
                Loading…
              </div>
            ))}
        </div>

        {!loading && filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No members found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
