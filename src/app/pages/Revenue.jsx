import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { IndianRupee, Wallet, AlertCircle, Users } from "lucide-react";
import { api } from "../../api";
import { getActiveGymId } from "../../utils/gym";

function formatCurrency(value) {
  const num = Number(value || 0);
  return `₹${num.toLocaleString("en-IN")}`;
}

function parseError(err) {
  const data = err?.response?.data;

  if (typeof data?.detail === "string") return data.detail;
  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([k, v]) => {
        if (Array.isArray(v)) return `${k}: ${v.join(" ")}`;
        if (typeof v === "object") return `${k}: ${JSON.stringify(v)}`;
        return `${k}: ${v}`;
      })
      .join("\n");
  }

  return err?.message || "Something went wrong";
}

function paymentTone(status) {
  if (status === "paid") {
    return "border border-emerald-400/15 bg-emerald-500/15 text-emerald-300";
  }
  if (status === "partial") {
    return "border border-orange-400/15 bg-orange-500/15 text-orange-300";
  }
  return "border border-red-400/15 bg-red-500/15 text-red-300";
}

function paymentLabel(status) {
  if (status === "paid") return "Paid";
  if (status === "partial") return "Partial";
  return "Pending";
}

export default function Revenue() {
  const [members, setMembers] = useState([]);
  const [gymId, setGymId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalExpected = members.reduce(
      (sum, m) => sum + Number(m.total_fee || 0),
      0
    );

    const totalCollected = members.reduce(
      (sum, m) => sum + Number(m.amount_paid || 0),
      0
    );

    const totalPending = members.reduce(
      (sum, m) => sum + Number(m.remaining_fee || 0),
      0
    );

    const pendingStudents = members.filter(
      (m) => Number(m.remaining_fee || 0) > 0
    ).length;

    return {
      totalExpected,
      totalCollected,
      totalPending,
      pendingStudents,
    };
  }, [members]);

  const pendingMembers = useMemo(() => {
    return [...members]
      .filter((m) => Number(m.remaining_fee || 0) > 0)
      .sort((a, b) => Number(b.remaining_fee || 0) - Number(a.remaining_fee || 0));
  }, [members]);

  return (
    <div className="min-h-[100dvh] bg-[#07090f] pb-24 text-white sm:pb-8">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Revenue
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Track expected, collected and pending fee amounts.
          </p>
        </div>

        {error && (
          <div className="mb-5 whitespace-pre-line rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <IndianRupee className="h-4 w-4" />
              Total Expected
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {loading ? "…" : formatCurrency(stats.totalExpected)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Wallet className="h-4 w-4 text-emerald-300" />
              Collected
            </div>
            <div className="mt-2 text-2xl font-semibold text-emerald-300">
              {loading ? "…" : formatCurrency(stats.totalCollected)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <AlertCircle className="h-4 w-4 text-red-300" />
              Pending
            </div>
            <div className="mt-2 text-2xl font-semibold text-red-300">
              {loading ? "…" : formatCurrency(stats.totalPending)}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Users className="h-4 w-4 text-orange-300" />
              Pending Students
            </div>
            <div className="mt-2 text-2xl font-semibold text-orange-300">
              {loading ? "…" : stats.pendingStudents}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.05] shadow-sm">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-semibold text-white">
              Pending Payment List
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Members who still have unpaid balance.
            </p>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/60">
                Loading revenue data...
              </div>
            ) : pendingMembers.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                Nice. No pending payments right now.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMembers.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-white">
                          {m.name}
                        </p>
                        <p className="mt-1 text-sm text-white/55">
                          {m.phone || "No phone number"}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${paymentTone(
                          m.payment_status
                        )}`}
                      >
                        {paymentLabel(m.payment_status)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-white/[0.03] p-3 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-white/45">Total Fee</p>
                        <p className="mt-1 text-white">
                          {formatCurrency(m.total_fee)}
                        </p>
                      </div>

                      <div>
                        <p className="text-white/45">Collected</p>
                        <p className="mt-1 text-emerald-300">
                          {formatCurrency(m.amount_paid)}
                        </p>
                      </div>

                      <div>
                        <p className="text-white/45">Pending</p>
                        <p className="mt-1 text-red-300">
                          {formatCurrency(m.remaining_fee)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}