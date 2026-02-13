import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  Bell,
  DollarSign,
  LogOut,
  Menu,
  X,
  ExpandIcon,
} from "lucide-react";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/members", label: "Members", icon: Users },
    { path: "/subscriptions", label: "Subscriptions", icon: Bell },
    { path: "/pricing", label: "Pricing", icon: DollarSign },
   
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

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

          {/* Desktop Logout */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

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

            {/* Mobile Logout */}
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
