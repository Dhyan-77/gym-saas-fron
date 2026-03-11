import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { api } from "../../api";
import { checkAuth } from "../../auth";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Skip signup if already logged in
  useEffect(() => {
    const verify = async () => {
      const isAuth = await checkAuth();
      if (isAuth) navigate("/admin");
    };
    verify();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/api/auth/signup/", {
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");
    } catch (err) {
      const data = err?.response?.data;

      const msg =
        err?.userMessage ||
        data?.detail ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        "Signup failed. Please try again.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] bg-[#07090f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-white">
            GymFlow
          </h1>

          <p className="text-sm text-white/60 mt-1">
            Start tracking members & fees
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl p-6 shadow-xl">

          <h2 className="text-lg font-semibold text-white text-center">
            Create your account
          </h2>

          <p className="text-sm text-white/60 text-center mt-1">
            Takes less than a minute
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

            {/* Name */}
            <div>
              <label className="text-sm text-white/70">
                Full name
              </label>

              <input
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-white/70">
                Email address
              </label>

              <input
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Minimum 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-white/70">
                Confirm password
              </label>

              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-16 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/70 hover:text-white"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-white text-black py-3 font-semibold hover:bg-gray-200 active:scale-[0.98] transition"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-white font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>

          {/* Trust */}
          <p className="text-xs text-white/40 text-center mt-6">
            Secure signup. Your data is protected.
          </p>

        </div>
      </div>
    </div>
  );
}