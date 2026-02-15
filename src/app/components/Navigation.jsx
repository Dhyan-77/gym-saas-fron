import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { api } from "../../api";
import { getActiveGymId, setActiveGymId } from "../../utils/gym";

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
  const [open, setOpen] = useState(false);

  // gyms dropdown state
  const [gyms, setGyms] = useState([]);
  const [activeGymId, setActiveGymIdState] = useState("");
  const [gymLoading, setGymLoading] = useState(true);
  const [gymError, setGymError] = useState("");

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/members", label: "Members", icon: Users },
    { path: "/subscriptions", label: "Subscriptions", icon: Bell },
    { path: "/pricing", label: "Pricing", icon: DollarSign },
  ];

  // load gyms once
  useEffect(() => {
    let mounted = true;

    async function loadGyms() {
      setGymLoading(true);
      setGymError("");

      try {
        const token = localStorage.getItem("access");
        if (!token) {
          // user not logged in, don't call protected API
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
    setActiveGymId(id); // saves to localStorage
    setActiveGymIdState(id);
    setOpen(false);

    // simplest + reliable so all pages re-fetch with new gym id
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("activeGymId");
    navigate("/");
  };

  const showGymSwitcher = location.pathname !== "/pricing"; // optional: hide on pricing if you want

  return (
    <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-lg">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              GymFlow
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Side: Gym switcher + Logout */}
          <div className="hidden md:flex items-center gap-3">
            {showGymSwitcher && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />

                <select
                  value={activeGymId}
                  onChange={handleGymChange}
                  disabled={gymLoading || gyms.length === 0}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60"
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
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {open && (
          <div className="md:hidden pb-4 space-y-2">
            {/* Mobile Gym Switcher */}
            {showGymSwitcher && (
              <div className="px-2">
                <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Select Gym
                </div>

                <select
                  value={activeGymId}
                  onChange={handleGymChange}
                  disabled={gymLoading || gyms.length === 0}
                  className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-60"
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

                {gymError ? (
                  <div className="mt-2 text-xs text-red-300 whitespace-pre-line">
                    {gymError}
                  </div>
                ) : null}
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
