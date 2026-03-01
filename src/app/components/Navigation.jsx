import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { getActiveGymId, setActiveGymId as saveActiveGymId } from "../../utils/gym";

import {
  Dumbbell,
  LayoutDashboard,
  Users,
  Bell,
  DollarSign,
  LogOut,
  Menu,
  X,
  Building2,
  Plus,
} from "lucide-react";

// simple DRF error parser (no extra util file needed)
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



export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

    const hideNav = ["/login", "/signup"].includes(location.pathname);
  if (hideNav) return null;

  const [open, setOpen] = useState(false);

  // gyms dropdown state
  const [gyms, setGyms] = useState([]);
  const [activeGymId, setActiveGymIdState] = useState("");
  const [gymLoading, setGymLoading] = useState(true);
  const [gymError, setGymError] = useState("");

  // ✅ subscription state (for PRO badge)
  const [sub, setSub] = useState(null);

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/members", label: "Members", icon: Users },
    { path: "/subscriptions", label: "Subscriptions", icon: Bell },
    { path: "/pricing", label: "Pricing", icon: DollarSign },
    
  ];

  const showGymSwitcher = location.pathname !== "/pricing";

  // ✅ Load subscription status (safe, won’t crash)
  useEffect(() => {
    let mounted = true;

    async function loadSubscription() {
      try {
        const token = localStorage.getItem("access");
        if (!token) return;

        const res = await api.get("/api/billing/me/");
        if (!mounted) return;

        setSub(res.data);
      } catch (err) {
        // ignore (401 etc.)
      }
    }

    loadSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ Load gyms once
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

    // ✅ persist selection
    saveActiveGymId(id);

    // ✅ update local state
    setActiveGymIdState(id);

    setOpen(false);

    // simplest + reliable so all pages re-fetch with new gym id
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("activeGymId");

    setSub(null);
    setGyms([]);
    setActiveGymIdState("");

    navigate("/");
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50">
      {/* Inline styles (same look as the dashboard glass) */}
      <style>{`
        .nav-glass{
          background: linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.04));
          border-bottom: 1px solid rgba(255,255,255,.10);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .nav-shine{
          position: relative;
          overflow: hidden;
        }
        .nav-shine:before{
          content:"";
          position:absolute;
          inset:-2px;
          background: radial-gradient(900px 220px at 14% 0%, rgba(255,255,255,.14), transparent 55%),
                      radial-gradient(700px 220px at 90% 10%, rgba(255,255,255,.10), transparent 60%);
          pointer-events:none;
        }
        .nav-pill{
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.04);
        }
        .nav-pill:hover{ background: rgba(255,255,255,.07); }
        .nav-pill-active{
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 10px 22px rgba(0,0,0,.35);
        }
        .ios-chip{
          background: rgba(34,197,94,.18);
          border: 1px solid rgba(34,197,94,.28);
          color: rgba(187,255,214,1);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .ios-iconbtn{
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.05);
        }
        .ios-iconbtn:hover{ background: rgba(255,255,255,.08); }
        .ios-panel{
          background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: 0 18px 50px rgba(0,0,0,.55);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }
        .ios-select{
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
          color: white;
        }
        .ios-select:focus{
          outline: none;
          box-shadow: 0 0 0 2px rgba(255,255,255,.10);
          border-color: rgba(255,255,255,.22);
        }
      `}</style>

      <div className="nav-glass nav-shine">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/admin" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border border-white/10 bg-white/[0.06]">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-semibold tracking-[-0.02em]">
                <span className="bg-gradient-to-b from-white via-white/85 to-white/55 bg-clip-text text-transparent">
                  GymFlow
                </span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 lg:px-4 py-2 rounded-2xl transition-all duration-200 ${
                      active
                        ? "nav-pill-active text-white"
                        : "nav-pill text-white/70 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "opacity-100" : "opacity-80"}`} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* ✅ PRO Badge */}
            {sub?.status === "active" && (
              <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ios-chip">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                PRO • {sub?.days_remaining ?? 0} days left
              </span>
            )}

            {/* Desktop Right Side: Gym switcher + Logout */}
            <div className="hidden md:flex items-center gap-3">
              {showGymSwitcher && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-white/60" />

                  <select
                    value={activeGymId}
                    onChange={handleGymChange}
                    disabled={gymLoading || gyms.length === 0}
                    className="px-3 py-2 rounded-2xl text-sm ios-select disabled:opacity-60"
                    title={gymError || "Select gym"}
                  >
                    {gymLoading && <option value="">Loading gyms…</option>}

                    {!gymLoading && gyms.length === 0 && (
                      <option value="">No gym found</option>
                    )}

                    {!gymLoading &&
                      gyms.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name || "Unnamed Gym"}
                        </option>
                      ))}
                  </select>

                  <Link
                    to="/gym-setup"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl ios-iconbtn text-white text-sm transition"
                    title="Add new gym"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add gym</span>
                  </Link>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl text-white/70 hover:text-white transition-colors nav-pill"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-2xl ios-iconbtn"
              aria-label="Open menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay Panel (premium iOS style) */}
      {open && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-3 right-3 top-[76px] z-50 ios-panel rounded-3xl p-3">
            {/* ✅ Mobile PRO Badge */}
            {sub?.status === "active" && (
              <div className="px-2 pt-1 pb-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ios-chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  PRO • {sub?.days_remaining ?? 0} days left
                </span>
              </div>
            )}

            {/* Mobile Gym Switcher */}
            {showGymSwitcher && (
              <div className="px-2 pb-2">
                <div className="text-[11px] uppercase tracking-wide text-white/55 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Select Gym
                </div>

                <select
                  value={activeGymId}
                  onChange={handleGymChange}
                  disabled={gymLoading || gyms.length === 0}
                  className="w-full px-3 py-3 rounded-2xl text-sm ios-select disabled:opacity-60"
                >
                  {gymLoading && <option value="">Loading gyms…</option>}

                  {!gymLoading && gyms.length === 0 && (
                    <option value="">No gym found</option>
                  )}

                  {!gymLoading &&
                    gyms.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name || "Unnamed Gym"}
                      </option>
                    ))}
                </select>

                <Link
                  to="/gym-setup"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 mt-2 px-3 py-3 rounded-2xl ios-iconbtn text-white text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add new gym</span>
                </Link>

                {gymError ? (
                  <div className="mt-2 text-xs text-red-200/90 whitespace-pre-line">
                    {gymError}
                  </div>
                ) : null}

                <div className="my-3 h-px bg-white/10" />
              </div>
            )}

            <div className="space-y-1 px-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 ${
                      active
                        ? "nav-pill-active text-white"
                        : "nav-pill text-white/75 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl nav-pill text-white/75 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}