import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { api, getApiBaseURL } from "../../api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectionCheck, setConnectionCheck] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // ✅ SimpleJWT login
      const tokenRes = await api.post("/api/auth/login/", {
        username: normalizedEmail,
        password,
      });

      const access = tokenRes.data?.access;
      const refresh = tokenRes.data?.refresh;

      if (!access) throw new Error("No access token returned from login API");

      localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);

      // ✅ Check if gym exists
      const gymsRes = await api.get("/api/gyms/");
      const gyms = Array.isArray(gymsRes.data) ? gymsRes.data : [];

      navigate(gyms.length ? "/admin" : "/gym-setup");
    } catch (err) {
      const msg =
        err?.userMessage ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed";
      const apiUrl = getApiBaseURL();
      setError(
        apiUrl && (msg.includes("Cannot reach") || err?.code === "ERR_NETWORK")
          ? `${msg}\n\nAPI: ${apiUrl}`
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    const url = getApiBaseURL();
    const displayUrl = url || "same origin (proxied)";
    setConnectionCheck({ status: "checking", url: displayUrl });
    try {
      const healthUrl = url ? `${url.replace(/\/$/, "")}/api/health/` : "/api/health/";
      console.log("Testing URL:", healthUrl); // Mobile debug
      const res = await fetch(healthUrl, { 
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log("Response status:", res.status); // Mobile debug
      if (res.ok) {
        setConnectionCheck({
          status: "ok",
          url: displayUrl,
          message: "Backend reachable.",
        });
      } else {
        setConnectionCheck({
          status: "error",
          url: displayUrl,
          message: `HTTP ${res.status}`,
        });
      }
    } catch (e) {
      const msg = e?.message || String(e);
      console.log("Connection error:", msg); // Mobile debug
      console.log("User agent:", navigator.userAgent); // Mobile debug
      setConnectionCheck({
        status: "error",
        url: displayUrl,
        message: msg.includes("Failed to fetch") || msg.includes("NetworkError")
          ? "Cannot reach server. Check connection."
          : msg,
      });
    }
  };

return (
  <div className="relative min-h-[100svh] bg-[#05060a] text-white flex items-center justify-center px-4 py-10 overflow-hidden">
    {/* Background: premium iOS glass + glow mesh */}
    <div className="absolute inset-0 pointer-events-none">
      {/* glow blobs */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />

      {/* subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_10%,rgba(255,255,255,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_700px_at_50%_100%,rgba(0,0,0,0.55),transparent_60%)]" />
    </div>

    <div className="w-full max-w-[420px] relative z-10">
      {/* Header */}
      <div className="text-center mb-7">
        <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-[22px]
                        bg-white/10 border border-white/12 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.45)]
                        ring-1 ring-white/10">
          <Dumbbell className="w-8 h-8 text-white" />
        </div>

        <h1 className="mt-4 text-[28px] leading-tight font-semibold tracking-[-0.02em]
                       bg-gradient-to-b from-white via-white/90 to-white/55 bg-clip-text text-transparent">
          GymFlow
        </h1>
        <p className="mt-1 text-[13px] text-white/55">
          Manage your gym with ease
        </p>
      </div>

      {/* Glass Card */}
      <div
        className="relative rounded-[28px] p-[18px]
                   bg-white/[0.07] border border-white/[0.12] backdrop-blur-2xl
                   shadow-[0_24px_80px_rgba(0,0,0,0.55)]
                   ring-1 ring-white/10"
      >
        {/* inner highlight */}
        <div className="absolute inset-0 rounded-[28px] pointer-events-none
                        bg-[linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0.02),rgba(255,255,255,0.06))]
                        opacity-60" />
        <div className="relative">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-center">
            Welcome Back
          </h2>
          <p className="mt-1 text-center text-[13px] text-white/50">
            Sign in to continue
          </p>

          {error && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-400/25 text-rose-100 text-[13px] break-words whitespace-pre-line">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4.5">
            {/* Email */}
            <div>
              <label className="block text-[12px] font-medium text-white/65 mb-2">
                Email
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl
                           bg-white/[0.06] border border-white/[0.10]
                           text-white placeholder-white/35
                           shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                           focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20
                           transition"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-medium text-white/65 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-[88px] rounded-2xl
                             bg-white/[0.06] border border-white/[0.10]
                             text-white placeholder-white/35
                             shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                             focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20
                             transition"
                  placeholder="••••••••"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2
                             px-3 py-1.5 rounded-full text-[12px] font-medium
                             bg-white/10 border border-white/10 text-white/80
                             hover:bg-white/14 active:scale-[0.98]
                             transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Primary button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3.5 rounded-2xl font-semibold text-[14px] text-black
                         bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f9_55%,#e2e8f0_100%)]
                         shadow-[0_14px_40px_rgba(0,0,0,0.55)]
                         hover:shadow-[0_18px_60px_rgba(0,0,0,0.60)]
                         active:scale-[0.985] active:shadow-[0_10px_30px_rgba(0,0,0,0.55)]
                         disabled:opacity-60 disabled:active:scale-100
                         transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer actions */}
          <div className="mt-6 text-center text-[13px] text-white/55">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-white/90 hover:text-white underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </div>

          {/* Connection check */}
          <div className="mt-5 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={checkConnection}
              className="w-full text-center text-[12px] text-white/45 hover:text-white/70 transition"
            >
              Check connection
            </button>

            {connectionCheck && (
              <div className="mt-3 p-3 rounded-2xl bg-white/[0.06] border border-white/[0.10] text-[12px] whitespace-pre-line">
                <div className="text-white/50">API: {connectionCheck.url}</div>
                <div
                  className={
                    connectionCheck.status === "ok"
                      ? "text-emerald-300 mt-1"
                      : connectionCheck.status === "checking"
                      ? "text-white/70 mt-1"
                      : "text-amber-300 mt-1"
                  }
                >
                  {connectionCheck.status === "checking"
                    ? "Checking..."
                    : connectionCheck.message}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tiny bottom hint spacing like iOS */}
      <div className="h-6" />
    </div>
  </div>
);
}
