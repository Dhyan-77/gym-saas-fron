import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { Search, Filter, X, Wallet, Receipt, MessageCircle, ChevronRight } from "lucide-react";
import { Drawer } from "vaul";
import { toast } from "sonner";
import { api } from "../../api";
import { getActiveGymId } from "../../utils/gym";

function statusFromDaysLeft(daysLeft) {
  if (daysLeft == null) return "active";
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 7) return "expiring";
  return "active";
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
      .map(([k, v]) =>
        Array.isArray(v)
          ? `${k}: ${v.join(" ")}`
          : typeof v === "object"
          ? `${k}: ${JSON.stringify(v)}`
          : `${k}: ${v}`
      )
      .join("\n");
  }

  return err?.message || "Something went wrong";
}

function ActionButton({ icon: Icon, title, subtitle, onClick, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
        disabled
          ? "cursor-not-allowed border-white/10 bg-white/[0.03] opacity-50"
          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          {subtitle ? <p className="mt-1 text-xs text-white/55">{subtitle}</p> : null}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-white/35" />
    </button>
  );
}

function getMemberPriority(member) {
  const remaining = Number(member.remaining_fee || 0);
  const daysLeft = member.days_left ?? 999999;

  if (remaining > 0 && daysLeft < 0) return 1;
  if (remaining > 0 && daysLeft <= 7) return 2;
  if (remaining > 0) return 3;
  if (daysLeft < 0) return 4;
  if (daysLeft <= 7) return 5;
  return 6;
}

export default function AllMembers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  const [gymId, setGymId] = useState(null);
  const [members, setMembers] = useState([]);

  const [loadingGym, setLoadingGym] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [error, setError] = useState("");

  const [selectedMember, setSelectedMember] = useState(null);
  const [showActionDrawer, setShowActionDrawer] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

    return withStatus
      .filter((m) => filterPlan === "all" || m.plan === filterPlan)
      .sort((a, b) => {
        const pa = getMemberPriority(a);
        const pb = getMemberPriority(b);

        if (pa !== pb) return pa - pb;

        const remainingDiff = Number(b.remaining_fee || 0) - Number(a.remaining_fee || 0);
        if (remainingDiff !== 0) return remainingDiff;

        return (a.days_left ?? 999999) - (b.days_left ?? 999999);
      });
  }, [members, filterPlan]);

  const loading = loadingGym || loadingMembers;

  const openMemberActions = (member) => {
    setSelectedMember(member);
    setShowActionDrawer(true);
  };

  const handleUpdatePayment = () => {
    toast.info("Update payment drawer is the next step.");
  };

  const handleReceipt = () => {
    toast.info("Receipt flow is the next step.");
  };

  const handleWhatsappReminder = async () => {
    if (!gymId || !selectedMember) return;

    try {
      setActionLoading(true);

      const res = await api.get(
        `/api/gyms/${gymId}/members/${selectedMember.id}/whatsapp-reminder/`
      );

      const link = res?.data?.whatsapp_link;

      if (!link) {
        toast.error("WhatsApp link not found");
        return;
      }

      window.open(link, "_blank", "noopener,noreferrer");
      toast.success("Opening WhatsApp");
    } catch (err) {
      toast.error(parseError(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-[#07090f] text-white">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Students & Members</h1>
          <p className="text-sm text-white/60">
            Members with unpaid and overdue fees are shown first.
          </p>
        </div>

        {error && (
          <div className="mb-4 whitespace-pre-line rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search name or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="all">All Plans</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
          Priority order: unpaid overdue → unpaid due soon → unpaid → others.
        </div>

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
              <button
                key={m.id}
                type="button"
                onClick={() => openMemberActions(m)}
                className="block w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/[0.08]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{m.name}</p>
                    <p className="text-sm text-white/60">
                      {m.phone || "No phone"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${badge}`}
                    >
                      {status === "expiring"
                        ? "Due Soon"
                        : status === "expired"
                        ? "Expired"
                        : "Active"}
                    </span>

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${paymentTone(
                        m.payment_status
                      )}`}
                    >
                      {paymentLabel(m.payment_status)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
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

                  <div>
                    <p className="text-white/50">Paid</p>
                    <p className="text-emerald-300">{formatCurrency(m.amount_paid)}</p>
                  </div>

                  <div>
                    <p className="text-white/50">Pending</p>
                    <p className="text-red-300">{formatCurrency(m.remaining_fee)}</p>
                  </div>
                </div>

                <div className="mt-3 text-right text-xs text-white/40">
                  Tap to manage payment, receipt or WhatsApp reminder
                </div>
              </button>
            );
          })}
        </div>

        {!loading && filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/60">No members found.</p>
          </div>
        )}

        <Drawer.Root open={showActionDrawer} onOpenChange={setShowActionDrawer}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />

            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90dvh] flex-col rounded-t-[28px] border-t border-white/15 bg-[#161a22] shadow-[0_-20px_60px_rgba(0,0,0,0.55)]">
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20" />

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-xl p-5 pb-8 sm:p-6">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Member actions</h2>
                      <p className="mt-1 text-sm text-white/55">
                        Quick actions for this member.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowActionDrawer(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {selectedMember && (
                    <>
                      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-lg font-semibold text-white">
                              {selectedMember.name}
                            </p>
                            <p className="mt-1 text-sm text-white/55">
                              {selectedMember.phone || "No phone number"}
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${paymentTone(
                              selectedMember.payment_status
                            )}`}
                          >
                            {paymentLabel(selectedMember.payment_status)}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-black/20 p-3 text-sm">
                          <div>
                            <p className="text-white/45">Total Fee</p>
                            <p className="mt-1 text-white">
                              {formatCurrency(selectedMember.total_fee)}
                            </p>
                          </div>

                          <div>
                            <p className="text-white/45">Paid</p>
                            <p className="mt-1 text-emerald-300">
                              {formatCurrency(selectedMember.amount_paid)}
                            </p>
                          </div>

                          <div>
                            <p className="text-white/45">Remaining</p>
                            <p className="mt-1 text-red-300">
                              {formatCurrency(selectedMember.remaining_fee)}
                            </p>
                          </div>

                          <div>
                            <p className="text-white/45">Renewal</p>
                            <p className="mt-1 text-white">
                              {selectedMember.end_date || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <ActionButton
                          icon={Wallet}
                          title="Update payment"
                          subtitle="Add the next payment for this member"
                          onClick={handleUpdatePayment}
                          disabled={Number(selectedMember.remaining_fee || 0) <= 0}
                        />

                        <ActionButton
                          icon={Receipt}
                          title="Receipt / invoice"
                          subtitle={
                            Number(selectedMember.amount_paid || 0) > 0
                              ? "View latest receipt and print it"
                              : "No payment yet"
                          }
                          onClick={handleReceipt}
                          disabled={Number(selectedMember.amount_paid || 0) <= 0}
                        />

                        <ActionButton
                          icon={MessageCircle}
                          title="Send WhatsApp reminder"
                          subtitle={
                            Number(selectedMember.remaining_fee || 0) > 0
                              ? "Open WhatsApp with prefilled message"
                              : "No pending amount"
                          }
                          onClick={handleWhatsappReminder}
                          disabled={
                            actionLoading ||
                            !selectedMember.phone ||
                            Number(selectedMember.remaining_fee || 0) <= 0
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  );
}