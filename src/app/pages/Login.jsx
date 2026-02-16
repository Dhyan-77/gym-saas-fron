import { useState } from "react";
import { Link, useNavigate } from "react-router";
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
      const res = await fetch(healthUrl, { method: "GET" });
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
    <div className="relative min-h-[100svh] bg-black text-white flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-6 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-6 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4 backdrop-blur-md shadow-lg">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-semibold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            GymFlow
          </h1>

          <p className="text-sm text-gray-400 mt-1">Manage your gym with ease</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Welcome Back
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm break-words whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-medium bg-gradient-to-r from-white to-gray-300 text-black transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-white hover:underline">
              Sign up
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={checkConnection}
              className="text-xs text-gray-500 hover:text-gray-300 w-full text-center"
            >
              Check connection
            </button>
            {connectionCheck && (
              <div className="mt-2 p-2 rounded-lg bg-white/5 text-xs text-left whitespace-pre-line">
                <div className="text-gray-400">API: {connectionCheck.url}</div>
                <div className={connectionCheck.status === "ok" ? "text-green-400 mt-1" : "text-amber-400 mt-1"}>
                  {connectionCheck.status === "checking"
                    ? "Checking..."
                    : connectionCheck.message}
                </div>
              </div>
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
}
