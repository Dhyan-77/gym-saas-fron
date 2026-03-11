import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell,  Building2, } from "lucide-react";
import { api, getApiBaseURL } from "../../api";
import { checkAuth } from "../../auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectionCheck, setConnectionCheck] = useState(null);

  // ✅ Auto skip login if already authenticated
  useEffect(() => {
    const verify = async () => {
      const isAuth = await checkAuth();
      if (isAuth) {
        navigate("/admin");
      }
    };

    verify();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const tokenRes = await api.post("/api/auth/login/", {
        username: normalizedEmail,
        password,
      });

      const access = tokenRes?.data?.access;
      const refresh = tokenRes?.data?.refresh;

      if (!access) {
        throw new Error("Login failed");
      }

      localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);

      try {
        const gymsRes = await api.get("/api/gyms/");
        const gyms = Array.isArray(gymsRes?.data) ? gymsRes.data : [];

        if (gyms.length > 0) {
          navigate("/admin");
        } else {
          navigate("/gym-setup");
        }
      } catch {
        navigate("/gym-setup");
      }

    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Invalid email or password";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    const url = getApiBaseURL();
    const displayUrl = url || "same origin";

    setConnectionCheck({ status: "checking", url: displayUrl });

    try {
      const healthUrl = url
        ? `${url.replace(/\/$/, "")}/api/health/`
        : "/api/health/";

      const res = await fetch(healthUrl);

      if (res.ok) {
        setConnectionCheck({
          status: "ok",
          url: displayUrl,
          message: "Server reachable",
        });
      } else {
        setConnectionCheck({
          status: "error",
          url: displayUrl,
          message: `HTTP ${res.status}`,
        });
      }
    } catch (e) {
      setConnectionCheck({
        status: "error",
        url: displayUrl,
        message: "Cannot reach server",
      });
    }
  };

  return (
    <div className="min-h-[100svh] bg-[#07090f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
            <Building2 className="w-6 h-6 text-white" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-white">
            Renewa
          </h1>

          <p className="text-sm text-white/60 mt-1">
            Fee & Member Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6 shadow-xl">

          <h2 className="text-lg font-semibold text-white text-center">
            Welcome back
          </h2>

          <p className="text-sm text-white/60 text-center mt-1">
            Sign in to your account
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

            {/* Email */}
            <div>
              <label className="text-sm text-white/70">
                Email address
              </label>

              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-white/70">
                Password
              </label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-16 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/70 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-white text-black py-3 font-semibold hover:bg-gray-200 active:scale-[0.98] transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-white/60">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-white font-medium hover:underline"
            >
              Create account
            </Link>
          </div>

          {/* Trust note */}
          <p className="text-xs text-white/40 text-center mt-6">
            Secure login. Your data is private.
          </p>

          {/* Connection check */}
          <button
            onClick={checkConnection}
            className="w-full text-center text-xs text-white/40 mt-4 hover:text-white/70"
          >
            Check connection
          </button>

          {connectionCheck && (
            <div className="text-xs mt-2 text-center text-white/60">
              {connectionCheck.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}