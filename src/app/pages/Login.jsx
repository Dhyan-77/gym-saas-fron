import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Dumbbell } from "lucide-react";
import { api } from "../../api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login/", {
        // NOTE: if backend expects username, change to: username: email
        email,
        password,
      });

      const access =
        res.data.access ||
        res.data.access_token ||
        res.data.token ||
        res.data?.tokens?.access;

      const refresh =
        res.data.refresh ||
        res.data.refresh_token ||
        res.data?.tokens?.refresh;

      if (!access) throw new Error("No access token returned from login API");

      localStorage.setItem("accessToken", access);
      if (refresh) localStorage.setItem("refreshToken", refresh);

      navigate("/admin");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-black text-white flex items-center justify-center px-4 py-8 sm:py-12">
      {/* Gradient background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* smaller circles on mobile, bigger on desktop */}
        <div className="absolute top-10 left-6 sm:top-1/4 sm:left-1/4 w-56 h-56 sm:w-96 sm:h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-6 sm:bottom-1/4 sm:right-1/4 w-56 h-56 sm:w-96 sm:h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white/10 rounded-2xl mb-3 sm:mb-4 backdrop-blur-sm">
            <Dumbbell className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl mb-1 sm:mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            GymFlow
          </h1>

          <p className="text-sm sm:text-base text-gray-400">
            Manage your gym with ease
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8">
          <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm break-words">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-white hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        {/* Bottom link */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            to="/pricing"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            View Pricing Plans →
          </Link>
        </div>
      </div>
    </div>
  );
}
