import { useEffect, useMemo, useRef, useState } from "react";
import Navigation from "../components/Navigation";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
  Clock3,
  CheckCircle2,
  CalendarDays,
  MessageCircle,
  Receipt,
  Wallet,
  ChevronRight,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "vaul";
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
      .map(([k, v]) => {
        if (Array.isArray(v)) return `${k}: ${v.join(" ")}`;
        if (typeof v === "object") return `${k}: ${JSON.stringify(v)}`;
        return `${k}: ${v}`;
      })
      .join("\n");
  }

  return err?.message || "Something went wrong";
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

function ActionButton({
  icon: Icon,
  title,
  subtitle,
  onClick,
  disabled = false,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
        disabled
          ? "cursor-not-allowed border-white/10 bg-white/[0.03] opacity-50"
          : danger
          ? "border-red-500/20 bg-red-500/10 hover:bg-red-500/15"
          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            danger ? "bg-red-500/15 text-red-300" : "bg-white/10 text-white"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className={`truncate text-sm font-semibold ${danger ? "text-red-200" : "text-white"}`}>
            {title}
          </p>
          {subtitle ? (
            <p className="mt-1 text-xs text-white/55">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-white/35" />
    </button>
  );
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
            body {
              padding: 0;
            }
            .wrap {
              border: none;
              border-radius: 0;
            }
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

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [gymId, setGymId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [showActionDrawer, setShowActionDrawer] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const paymentDateRef = useRef(null);

  const [showReceiptDrawer, setShowReceiptDrawer] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState("");
  const [receiptData, setReceiptData] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    note: "",
  });

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const emptyForm = {
    name: "",
    phone: "",
    plan: "monthly",
    start_date: "",
    end_date: "",
    course_taken: "",
    offer_taken: "",
    total_fee: "",
    amount_paid: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const membersWithStatus = useMemo(() => {
    return members.map((m) => ({
      ...m,
      status: statusFromDaysLeft(m.days_left),
    }));
  }, [members]);

  const stats = useMemo(() => {
    const total = membersWithStatus.length;
    const active = membersWithStatus.filter((m) => m.status === "active").length;
    const expiring = membersWithStatus.filter((m) => m.status === "expiring").length;

    return {
      total,
      active,
      expiring,
    };
  }, [membersWithStatus]);

  const currentRemainingPreview = useMemo(() => {
    const total = Number(formData.total_fee || 0);
    const paid = Number(formData.amount_paid || 0);
    const remaining = total - paid;
    return remaining > 0 ? remaining : 0;
  }, [formData.total_fee, formData.amount_paid]);

  const paymentRemainingPreview = useMemo(() => {
    if (!selectedMember) return 0;
    const currentRemaining = Number(selectedMember.remaining_fee || 0);
    const paymentAmount = Number(paymentForm.amount || 0);
    const remaining = currentRemaining - paymentAmount;
    return remaining > 0 ? remaining : 0;
  }, [selectedMember, paymentForm.amount]);

  const StatusPill = ({ status }) => (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        status === "active"
          ? "border border-emerald-400/15 bg-emerald-500/15 text-emerald-300"
          : status === "expiring"
          ? "border border-orange-400/15 bg-orange-500/15 text-orange-300"
          : "border border-red-400/15 bg-red-500/15 text-red-300"
      }`}
    >
      {status === "expiring" ? "Due Soon" : status === "expired" ? "Expired" : "Active"}
    </span>
  );

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

  const refreshMembers = async () => {
    if (!gymId) return null;
    const res = await api.get(`/api/gyms/${gymId}/members/`);
    const list = Array.isArray(res.data) ? res.data : [];
    setMembers(list);
    return list;
  };

  const openAddModal = () => {
    setError("");
    setEditingMember(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setError("");
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      phone: member.phone || "",
      plan: member.plan || "monthly",
      start_date: member.start_date || "",
      end_date: member.end_date || "",
      course_taken: member.course_taken || "",
      offer_taken: member.offer_taken || "",
      total_fee: member.total_fee ?? "",
      amount_paid: member.amount_paid ?? "",
    });
    setShowModal(true);
  };

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

  const handleDeleteMember = async (id) => {
    if (!gymId) return;
    if (!window.confirm("Delete this member?")) return;

    try {
      await api.delete(`/api/gyms/${gymId}/members/${id}/delete`);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Member deleted");

      if (selectedMember?.id === id) {
        setShowActionDrawer(false);
        setSelectedMember(null);
      }
    } catch (err) {
      toast.error(parseError(err));
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
      await api.post(
        `/api/gyms/${gymId}/members/${selectedMember.id}/payments/`,
        {
          amount,
          payment_date: paymentForm.payment_date,
          note: paymentForm.note.trim(),
        }
      );

      const updatedList = await refreshMembers();
      const updatedMember =
        updatedList?.find((m) => m.id === selectedMember.id) || null;

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

  const handleActionEdit = () => {
    if (!selectedMember) return;
    setShowActionDrawer(false);
    openEditModal(selectedMember);
  };

  const buildPayload = () => {
    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      plan: formData.plan,
      start_date: formData.start_date,
      end_date: formData.end_date,
      course_taken: formData.course_taken.trim(),
      offer_taken: formData.offer_taken.trim(),
      total_fee: formData.total_fee === "" ? 0 : Number(formData.total_fee),
    };

    if (!editingMember) {
      payload.amount_paid = formData.amount_paid === "" ? 0 : Number(formData.amount_paid);
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gymId) return;

    setSaving(true);
    setError("");

    const totalFee = Number(formData.total_fee || 0);
    const amountPaid = Number(formData.amount_paid || 0);

    if (totalFee < 0) {
      const msg = "Total fee cannot be negative";
      setError(msg);
      toast.error(msg);
      setSaving(false);
      return;
    }

    if (!editingMember) {
      if (amountPaid < 0) {
        const msg = "Paid amount cannot be negative";
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }

      if (amountPaid > totalFee) {
        const msg = "Paid amount cannot be greater than total fee";
        setError(msg);
        toast.error(msg);
        setSaving(false);
        return;
      }
    }

    try {
      const payload = buildPayload();

      if (editingMember) {
        const res = await api.patch(
          `/api/gyms/${gymId}/members/${editingMember.id}/`,
          payload
        );

        setMembers((prev) =>
          prev.map((m) => (m.id === editingMember.id ? res.data : m))
        );

        if (selectedMember?.id === editingMember.id) {
          setSelectedMember({
            ...res.data,
            status: statusFromDaysLeft(res.data.days_left),
          });
        }

        toast.success("Member updated");
      } else {
        const res = await api.post(`/api/gyms/${gymId}/members/`, payload);
        setMembers((prev) => [res.data, ...prev]);
        toast.success("Member added");
      }

      setShowModal(false);
      setEditingMember(null);
      setFormData(emptyForm);
    } catch (err) {
      const msg = parseError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#07090f] pb-24 text-white sm:pb-8">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Students & Members
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Add members, track renewals and manage payment status.
          </p>
        </div>

        {error && (
          <div className="mb-5 whitespace-pre-line rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Users className="h-4 w-4" />
              Total Members
            </div>
            <div className="mt-2 text-3xl font-semibold text-white">
              {loading ? "…" : stats.total}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              Active
            </div>
            <div className="mt-2 text-3xl font-semibold text-emerald-300">
              {loading ? "…" : stats.active}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Clock3 className="h-4 w-4 text-orange-300" />
              Due Soon
            </div>
            <div className="mt-2 text-3xl font-semibold text-orange-300">
              {loading ? "…" : stats.expiring}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {!loading && membersWithStatus.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-center">
              <p className="text-base font-medium text-white">No members added yet</p>
              <p className="mt-1 text-sm text-white/55">
                Add your first member to start tracking renewals.
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
              >
                <Plus size={16} />
                Add Member
              </button>
            </div>
          )}

          {membersWithStatus.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => openMemberActions(m)}
              className="block w-full rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left shadow-sm transition hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white">{m.name}</p>
                  <p className="mt-1 text-sm text-white/55">{m.phone || "No phone number"}</p>
                </div>

                <div className="ml-3 flex flex-col items-end gap-2">
                  <StatusPill status={m.status} />
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${paymentTone(
                      m.payment_status
                    )}`}
                  >
                    {paymentLabel(m.payment_status)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-black/20 p-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-white/45">Plan</p>
                  <p className="mt-1 text-white">{m.plan || "-"}</p>
                </div>

                <div>
                  <p className="text-white/45">Renewal</p>
                  <p className="mt-1 text-white">{m.end_date || "-"}</p>
                </div>

                <div>
                  <p className="text-white/45">Days Left</p>
                  <p className="mt-1 text-white">{m.days_left ?? "-"}</p>
                </div>

                <div>
                  <p className="text-white/45">Total Fee</p>
                  <p className="mt-1 text-white">{formatCurrency(m.total_fee)}</p>
                </div>

                <div>
                  <p className="text-white/45">Paid</p>
                  <p className="mt-1 text-emerald-300">{formatCurrency(m.amount_paid)}</p>
                </div>

                <div>
                  <p className="text-white/45">Remaining</p>
                  <p className="mt-1 text-red-300">{formatCurrency(m.remaining_fee)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end text-sm text-white/45">
                Tap to view actions
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 hidden justify-center sm:flex">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition hover:bg-gray-200 active:scale-[0.98]"
          >
            <Plus size={18} />
            Add Member
          </button>
        </div>

        <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden">
          <button
            onClick={openAddModal}
            className="w-full rounded-2xl bg-white py-3.5 text-sm font-semibold text-black shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition active:scale-[0.98]"
          >
            Add Member
          </button>
        </div>

        <Drawer.Root open={showModal} onOpenChange={setShowModal}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[28px] border-t border-white/15 bg-[#161a22] shadow-[0_-20px_60px_rgba(0,0,0,0.55)]">
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20" />
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-xl p-5 pb-24 sm:p-6 sm:pb-28">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {editingMember ? "Edit member" : "Add new member"}
                      </h2>
                      <p className="mt-1 text-sm text-white/55">
                        Keep member details, fees and renewal dates updated.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 whitespace-pre-line rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">
                        Full name
                      </label>
                      <input
                        className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                        placeholder="Enter member name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">
                        Phone number
                      </label>
                      <input
                        inputMode="numeric"
                        maxLength={10}
                        className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">
                        Plan
                      </label>
                      <select
                        value={formData.plan}
                        onChange={(e) =>
                          setFormData({ ...formData, plan: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                      >
                        <option value="monthly" className="bg-[#202632]">
                          Monthly
                        </option>
                        <option value="yearly" className="bg-[#202632]">
                          Yearly
                        </option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <DateField
                        label="Start date"
                        value={formData.start_date}
                        onChange={(e) =>
                          setFormData({ ...formData, start_date: e.target.value })
                        }
                        required
                        inputRef={startDateRef}
                      />

                      <DateField
                        label="Renewal date"
                        value={formData.end_date}
                        onChange={(e) =>
                          setFormData({ ...formData, end_date: e.target.value })
                        }
                        required
                        inputRef={endDateRef}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/70">
                          Total fee
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                          placeholder="Enter total fee"
                          value={formData.total_fee}
                          onChange={(e) =>
                            setFormData({ ...formData, total_fee: e.target.value })
                          }
                          required
                        />
                      </div>

                      {!editingMember ? (
                        <div>
                          <label className="mb-2 block text-sm font-medium text-white/70">
                            Initial paid amount
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                            placeholder="Enter paid amount"
                            value={formData.amount_paid}
                            onChange={(e) =>
                              setFormData({ ...formData, amount_paid: e.target.value })
                            }
                          />
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                          <p className="text-sm text-white/60">Amount paid</p>
                          <p className="mt-1 text-base font-semibold text-emerald-300">
                            {formatCurrency(formData.amount_paid)}
                          </p>
                          <p className="mt-1 text-xs text-white/45">
                            Future payments should be added from the payment section.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-white/60">Remaining balance</span>
                        <span className="font-semibold text-red-300">
                          {formatCurrency(currentRemainingPreview)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">
                        Course / batch
                      </label>
                      <input
                        className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                        placeholder="Optional"
                        value={formData.course_taken}
                        onChange={(e) =>
                          setFormData({ ...formData, course_taken: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/70">
                        Offer / notes
                      </label>
                      <input
                        className="w-full rounded-xl border border-white/12 bg-[#202632] px-4 py-3 text-white placeholder-white/35 outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
                        placeholder="Optional"
                        value={formData.offer_taken}
                        onChange={(e) =>
                          setFormData({ ...formData, offer_taken: e.target.value })
                        }
                      />
                    </div>

                    <div className="sticky bottom-0 -mx-5 mt-6 border-t border-white/10 bg-[#161a22]/95 px-5 pb-5 pt-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 sm:w-auto"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:bg-gray-200 disabled:opacity-60 sm:w-auto"
                        >
                          {saving
                            ? "Saving..."
                            : editingMember
                            ? "Update Member"
                            : "Add Member"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>

        <Drawer.Root open={showActionDrawer} onOpenChange={setShowActionDrawer}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[90dvh] flex-col rounded-t-[28px] border-t border-white/15 bg-[#161a22] shadow-[0_-20px_60px_rgba(0,0,0,0.55)]">
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/20" />
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-xl p-5 pb-8 sm:p-6">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Member actions
                      </h2>
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

                          <div className="flex flex-col items-end gap-2">
                            <StatusPill status={selectedMember.status} />
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${paymentTone(
                                selectedMember.payment_status
                              )}`}
                            >
                              {paymentLabel(selectedMember.payment_status)}
                            </span>
                          </div>
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

                        <ActionButton
                          icon={Edit2}
                          title="Edit member"
                          subtitle="Update member details and total fee"
                          onClick={handleActionEdit}
                        />

                        <ActionButton
                          icon={Trash2}
                          title="Delete member"
                          subtitle="Remove this member from your records"
                          onClick={() => handleDeleteMember(selectedMember.id)}
                          danger
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
                      <h2 className="text-xl font-semibold text-white">
                        Update payment
                      </h2>
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
                      <h2 className="text-xl font-semibold text-white">
                        Receipt / Invoice
                      </h2>
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
                            <p className="mt-1 text-sm text-white/55">
                              Payment Receipt
                            </p>
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