import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../../api";
import {
  getActiveGymId,
  setActiveGymId as saveActiveGymId,
} from "../../utils/gym";

import {
  Building2,
  LayoutDashboard,
  Users,
  Bell,
  DollarSign,
  LogOut,
  Menu,
  X,
  Plus,
  ChevronDown,
} from "lucide-react";

function parseError(err) {
  const data = err?.response?.data;

  if (typeof data?.detail === "string") return data.detail;

  if (data && typeof data === "object") {
    const parts = [];
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val)) parts.push(`${key}: ${val.join(" ")}`);
      else if (typeof val === "string") parts.push(`${key}: ${val}`);
      else parts.push(`${key}: ${JSON.stringify(val)}`);
    }
    if (parts.length) return parts.join("\n");
  }

  return err?.message || "Something went wrong";
}

function getPlanBadge(sub) {
  if (!sub?.is_active) return null;

  const days = sub?.days_remaining ?? 0;

  if (sub?.status === "cancelled") {
    return `Pro active • Ends in ${days} days`;
  }

  return `Pro active • ${days} days left`;
}

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const hideNav = ["/login", "/signup"].includes(location.pathname);
  if (hideNav) return null;

  const [open, setOpen] = useState(false);

  const [gyms, setGyms] = useState([]);
  const [activeGymId, setActiveGymIdState] = useState("");
  const [gymLoading, setGymLoading] = useState(true);
  const [gymError, setGymError] = useState("");

  const [sub, setSub] = useState(null);

  const navItems = [
    { path: "/admin", label: "Overview", icon: LayoutDashboard },
    { path: "/members", label: "Students / Members", icon: Users },
    { path: "/subscriptions", label: "Renewals", icon: Bell },
    { path: "/pricing", label: "Plans", icon: DollarSign },
  ];

  const showCenterSwitcher = location.pathname !== "/pricing";

  useEffect(() => {
    let mounted = true;

    async function loadSubscription() {
      try {
        const token = localStorage.getItem("access");
        if (!token) return;

        const res = await api.get("/api/billing/me/");
        if (!mounted) return;

        setSub(res.data);
      } catch {
        if (!mounted) return;
        setSub(null);
      }
    }

    loadSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadGyms() {
      setGymLoading(true);
      setGymError("");

      try {
        const token = localStorage.getItem("access");

        if (!token) {
          if (!mounted) return;
          setGyms([]);
          setActiveGymIdState("");
          return;
        }

        const res = await api.get("/api/gyms/");
        const list = Array.isArray(res.data) ? res.data : [];

        if (!mounted) return;

        setGyms(list);

        const id = getActiveGymId(list);
        setActiveGymIdState(id || "");
      } catch (err) {
        if (!mounted) return;
        setGymError(parseError(err));
      } finally {
        if (mounted) setGymLoading(false);
      }
    }

    loadGyms();

    return () => {
      mounted = false;
    };
  }, []);

  const handleGymChange = (e) => {
    const id = e.target.value;

    saveActiveGymId(id);
    setActiveGymIdState(id);
    setOpen(false);

    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("activeGymId");

    setSub(null);
    setGyms([]);
    setActiveGymIdState("");
    setOpen(false);
    navigate("/login");
  };

  const isActivePath = (path) => location.pathname === path;
  const proBadgeText = getPlanBadge(sub);

  return (
    <nav className="sticky top-0 z-50">
      <div className="border-b border-white/10 bg-[#0b0d14]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link
              to="/admin"
              className="flex min-w-0 items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Building2 className="h-5 w-5 text-white" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-lg font-semibold tracking-[-0.02em] text-white">
                  Renewa
                </div>
                <div className="hidden text-xs text-white/45 sm:block">
                  Fee renewals & member tracking
                </div>
              </div>
            </Link>

            <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                        active
                          ? "bg-white text-black shadow-sm"
                          : "text-white/65 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              {sub?.is_active && (
                <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  {proBadgeText}
                </div>
              )}

              {showCenterSwitcher && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                    <select
                      value={activeGymId}
                      onChange={handleGymChange}
                      disabled={gymLoading || gyms.length === 0}
                      className="min-w-[180px] appearance-none rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-10 text-sm text-white outline-none transition focus:border-white/20 focus:ring-2 focus:ring-white/10 disabled:opacity-60"
                      title={gymError || "Select center"}
                    >
                      {gymLoading && <option value="">Loading…</option>}

                      {!gymLoading && gyms.length === 0 && (
                        <option value="">No center found</option>
                      )}

                      {!gymLoading &&
                        gyms.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name || "Unnamed Center"}
                          </option>
                        ))}
                    </select>
                  </div>

                  <Link
                    to="/gym-setup"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add center</span>
                  </Link>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>

            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              aria-label="Close menu"
            />

            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="fixed left-3 right-3 top-[74px] z-50 rounded-3xl border border-white/10 bg-[#11141d] p-4 shadow-2xl md:hidden"
            >
              <div className="mb-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">
                      Renewa
                    </div>
                    <div className="text-xs text-white/50">
                      Simple fee tracking
                    </div>
                  </div>
                </div>

                {sub?.is_active && (
                  <div className="mt-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                    {proBadgeText}
                  </div>
                )}
              </div>

              {showCenterSwitcher && (
                <div className="mb-4 border-b border-white/10 pb-4">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/45">
                    Select center
                  </div>

                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                    <select
                      value={activeGymId}
                      onChange={handleGymChange}
                      disabled={gymLoading || gyms.length === 0}
                      className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-10 text-sm text-white outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10 disabled:opacity-60"
                    >
                      {gymLoading && <option value="">Loading centers…</option>}

                      {!gymLoading && gyms.length === 0 && (
                        <option value="">No center found</option>
                      )}

                      {!gymLoading &&
                        gyms.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name || "Unnamed Center"}
                          </option>
                        ))}
                    </select>
                  </div>

                  <Link
                    to="/gym-setup"
                    onClick={() => setOpen(false)}
                    className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add another center</span>
                  </Link>

                  {gymError ? (
                    <div className="mt-2 whitespace-pre-line text-xs text-red-200">
                      {gymError}
                    </div>
                  ) : null}
                </div>
              )}

              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                        active
                          ? "bg-white text-black"
                          : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}