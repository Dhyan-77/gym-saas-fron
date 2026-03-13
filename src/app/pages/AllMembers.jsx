import { useEffect, useMemo, useRef, useState } from "react";
import Navigation from "../components/Navigation";
import {
  Search,
  Filter,
  X,
  Wallet,
  Receipt,
  MessageCircle,
  ChevronRight,
  CalendarDays,
  Printer,
} from "lucide-react";
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

function DateField({ label, value, onChange, required = false, inputRef }) {
  const openPicker = () => {
    if (inputRef?.current?.showPicker) {
      inputRef.current.showPicker();
    } else {
      inputRef?.current?.focus();
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/70">
        {label}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          value={value}
          onChange={onChange}
          required={required}
          style={{ colorScheme: "dark" }}
          className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 pr-12 text-white outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
        />

        <button
          type="button"
          onClick={openPicker}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label={`Select ${label.toLowerCase()}`}
        >
          <CalendarDays size={16} />
        </button>
      </div>
    </div>
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

function printReceiptHTML(receipt) {
  const html = `
    <html>
      <head>
        <title>Receipt ${receipt.receipt_number || ""}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 32px;
            color: #111;
          }
          .wrap {
            max-width: 720px;
            margin: 0 auto;
            border: 1px solid #ddd;
            border-radius: 16px;
            padding: 24px;
          }
          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .muted {
            color: #555;
            margin-bottom: 20px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin: 20px 0;
          }
          .box {
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            padding: 12px;
          }
          .label {
            font-size: 12px;
            color: #666;
            margin-bottom: 6px;
          }
          .value {
            font-size: 16px;
            font-weight: 600;
          }
          .section {
            margin-top: 24px;
          }
          .line {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .line:last-child {
            border-bottom: none;
          }
          .note {
            margin-top: 16px;
            padding: 12px;
            background: #f8f8f8;
            border-radius: 12px;
          }
          @media print {
            body { padding: 0; }
            .wrap { border: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="title">Payment Receipt</div>
          <div class="muted">${receipt.business_name || "-"}</div>

          <div class="grid">
            <div class="box">
              <div class="label">Receipt Number</div>
              <div class="value">${receipt.receipt_number || "-"}</div>
            </div>
            <div class="box">
              <div class="label">Payment Date</div>
              <div class="value">${receipt.payment_date || "-"}</div>
            </div>
            <div class="box">
              <div class="label">Student Name</div>
              <div class="value">${receipt.student_name || "-"}</div>
            </div>
            <div class="box">
              <div class="label">Phone</div>
              <div class="value">${receipt.phone || "-"}</div>
            </div>
          </div>

          <div class="section">
            <div class="line">
              <span>Total Fee</span>
              <strong>${formatCurrency(receipt.total_fee)}</strong>
            </div>
            <div class="line">
              <span>Paid This Time</span>
              <strong>${formatCurrency(receipt.paid_this_time)}</strong>
            </div>
            <div class="line">
              <span>Total Paid</span>
              <strong>${formatCurrency(receipt.total_paid)}</strong>
            </div>
            <div class="line">
              <span>Remaining Balance</span>
              <strong>${formatCurrency(receipt.remaining_balance)}</strong>
            </div>
          </div>

          ${
            receipt.note
              ? `<div class="note"><strong>Note:</strong> ${receipt.note}</div>`
              : ""
          }
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return false;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 300);

  return true;
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

  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const paymentDateRef = useRef(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const [showReceiptDrawer, setShowReceiptDrawer] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState("");
  const [receiptData, setReceiptData] = useState(null);

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

  const refreshMembers = async () => {
    if (!gymId) return null;
    const res = await api.get(`/api/gyms/${gymId}/members/`);
    const list = Array.isArray(res.data) ? res.data : [];
    setMembers(list);
    return list;
  };

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

  const paymentRemainingPreview = useMemo(() => {
    if (!selectedMember) return 0;
    const currentRemaining = Number(selectedMember.remaining_fee || 0);
    const paymentAmount = Number(paymentForm.amount || 0);
    const remaining = currentRemaining - paymentAmount;
    return remaining > 0 ? remaining : 0;
  }, [selectedMember, paymentForm.amount]);

  const loading = loadingGym || loadingMembers;

  const openMemberActions = (member) => {
    setSelectedMember(member);
    setShowActionDrawer(true);
  };

  const openPaymentDrawer = () => {
    if (!selectedMember) return;
    setPaymentError("");
    setPaymentForm({
      amount: "",
      payment_date: new Date().toISOString().slice(0, 10),
      note: "",
    });
    setShowPaymentDrawer(true);
  };

  const handleUpdatePayment = () => {
    setShowActionDrawer(false);
    openPaymentDrawer();
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!gymId || !selectedMember) return;

    setPaymentSaving(true);
    setPaymentError("");

    const amount = Number(paymentForm.amount || 0);
    const remaining = Number(selectedMember.remaining_fee || 0);

    if (amount <= 0) {
      const msg = "Payment amount must be greater than 0";
      setPaymentError(msg);
      toast.error(msg);
      setPaymentSaving(false);
      return;
    }

    if (amount > remaining) {
      const msg = "Payment amount cannot be greater than remaining balance";
      setPaymentError(msg);
      toast.error(msg);
      setPaymentSaving(false);
      return;
    }

    try {
      await api.post(`/api/gyms/${gymId}/members/${selectedMember.id}/payments/`, {
        amount,
        payment_date: paymentForm.payment_date,
        note: paymentForm.note.trim(),
      });

      const updatedList = await refreshMembers();
      const updatedMember = updatedList?.find((m) => m.id === selectedMember.id) || null;

      if (updatedMember) {
        setSelectedMember({
          ...updatedMember,
          status: statusFromDaysLeft(updatedMember.days_left),
        });
      }

      setShowPaymentDrawer(false);
      toast.success("Payment added successfully");
    } catch (err) {
      const msg = parseError(err);
      setPaymentError(msg);
      toast.error(msg);
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleReceipt = async () => {
    if (!gymId || !selectedMember) return;

    try {
      setReceiptLoading(true);
      setReceiptError("");
      setReceiptData(null);

      const paymentsRes = await api.get(
        `/api/gyms/${gymId}/members/${selectedMember.id}/payments/`
      );

      const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];

      if (!payments.length) {
        toast.error("No payments found for this member");
        return;
      }

      const latestPayment = payments[0];

      const receiptRes = await api.get(
        `/api/gyms/${gymId}/payments/${latestPayment.id}/receipt/`
      );

      setReceiptData(receiptRes.data);
      setShowActionDrawer(false);
      setShowReceiptDrawer(true);
    } catch (err) {
      const msg = parseError(err);
      setReceiptError(msg);
      toast.error(msg);
    } finally {
      setReceiptLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!receiptData) return;
    const ok = printReceiptHTML(receiptData);
    if (!ok) {
      toast.error("Popup blocked. Please allow popups and try again.");
    }
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
                    <p className="text-sm text-white/60">{m.phone || "No phone"}</p>
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
                          disabled={
                            receiptLoading || Number(selectedMember.amount_paid || 0) <= 0
                          }
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

        <Drawer.Root open={showPaymentDrawer} onOpenChange={setShowPaymentDrawer}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90dvh] flex-col rounded-t-[28px] border-t border-white/15 bg-[#161a22] shadow-[0_-20px_60px_rgba(0,0,0,0.55)]">
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20" />

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-xl p-5 pb-8 sm:p-6">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Update payment</h2>
                      <p className="mt-1 text-sm text-white/55">
                        Add a new payment entry for this member.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPaymentDrawer(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {selectedMember && (
                    <>
                      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-base font-semibold text-white">
                          {selectedMember.name}
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-3 rounded-xl bg-black/20 p-3 text-sm">
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
                        </div>
                      </div>

                      {paymentError && (
                        <div className="mb-4 whitespace-pre-line rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                          {paymentError}
                        </div>
                      )}

                      <form onSubmit={handleSavePayment} className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-white/70">
                            Payment amount
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={paymentForm.amount}
                            onChange={(e) =>
                              setPaymentForm((prev) => ({
                                ...prev,
                                amount: e.target.value,
                              }))
                            }
                            placeholder="Enter payment amount"
                            className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                            required
                          />
                        </div>

                        <DateField
                          label="Payment date"
                          value={paymentForm.payment_date}
                          onChange={(e) =>
                            setPaymentForm((prev) => ({
                              ...prev,
                              payment_date: e.target.value,
                            }))
                          }
                          required
                          inputRef={paymentDateRef}
                        />

                        <div>
                          <label className="mb-2 block text-sm font-medium text-white/70">
                            Note
                          </label>
                          <input
                            value={paymentForm.note}
                            onChange={(e) =>
                              setPaymentForm((prev) => ({
                                ...prev,
                                note: e.target.value,
                              }))
                            }
                            placeholder="Optional note"
                            className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                          />
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-white/60">Remaining after payment</span>
                            <span className="font-semibold text-red-300">
                              {formatCurrency(paymentRemainingPreview)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={paymentSaving}
                            className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-gray-200 disabled:opacity-60"
                          >
                            {paymentSaving ? "Saving payment..." : "Save Payment"}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

        <Drawer.Root open={showReceiptDrawer} onOpenChange={setShowReceiptDrawer}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90dvh] flex-col rounded-t-[28px] border-t border-white/15 bg-[#161a22] shadow-[0_-20px_60px_rgba(0,0,0,0.55)]">
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20" />

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-xl p-5 pb-8 sm:p-6">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Receipt / Invoice</h2>
                      <p className="mt-1 text-sm text-white/55">
                        Latest payment receipt for this member.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowReceiptDrawer(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {receiptError && (
                    <div className="mb-4 whitespace-pre-line rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                      {receiptError}
                    </div>
                  )}

                  {receiptLoading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/60">
                      Loading receipt...
                    </div>
                  ) : receiptData ? (
                    <>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-lg font-semibold text-white">
                              {receiptData.business_name || "Business"}
                            </p>
                            <p className="mt-1 text-sm text-white/55">Payment Receipt</p>
                          </div>

                          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right">
                            <p className="text-xs text-white/45">Receipt No.</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {receiptData.receipt_number || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-xl bg-black/20 p-3">
                            <p className="text-xs text-white/45">Student Name</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {receiptData.student_name || "-"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-black/20 p-3">
                            <p className="text-xs text-white/45">Phone</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {receiptData.phone || "-"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-black/20 p-3">
                            <p className="text-xs text-white/45">Payment Date</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {receiptData.payment_date || "-"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-black/20 p-3">
                            <p className="text-xs text-white/45">Note</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {receiptData.note || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-white/60">Total Fee</span>
                            <span className="text-sm font-semibold text-white">
                              {formatCurrency(receiptData.total_fee)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-white/60">Paid This Time</span>
                            <span className="text-sm font-semibold text-emerald-300">
                              {formatCurrency(receiptData.paid_this_time)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-white/60">Total Paid</span>
                            <span className="text-sm font-semibold text-white">
                              {formatCurrency(receiptData.total_paid)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                            <span className="text-sm text-white/60">Remaining Balance</span>
                            <span className="text-sm font-semibold text-red-300">
                              {formatCurrency(receiptData.remaining_balance)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <button
                          type="button"
                          onClick={handlePrintReceipt}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-gray-200"
                        >
                          <Printer className="h-4 w-4" />
                          Print Receipt
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/60">
                      No receipt data found.
                    </div>
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