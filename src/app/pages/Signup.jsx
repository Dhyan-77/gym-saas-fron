import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { api } from "../../api";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", // UI only (backend doesn't use it)
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  setLoading(true);

  try {
    // ✅ backend expects only email + password
    await api.post("/api/auth/signup/", {
      email: formData.email,
      password: formData.password,
    });

    // you DON'T auto-login in backend signup, so redirect to login
   navigate("/login");
  } catch (err) {
    const data = err?.response?.data;
    const msg =
      err?.userMessage ||
      (typeof data?.detail === "string"
        ? data.detail
        : data?.email?.[0] ||
          data?.password?.[0] ||
          (data && typeof data === "object"
            ? Object.entries(data)
                .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(" ")}` : `${k}: ${v}`))
                .join("\n")
            : null)) ||
      err?.message ||
      "Signup failed. Check your connection and try again.";
    setError(msg);
  } finally {
    setLoading(false);
  }
};

  return (
  <div className="relative min-h-[100svh] bg-[#05060a] text-white flex items-center justify-center px-4 py-10 overflow-hidden">
    {/* Background: premium iOS glass + glow mesh */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_10%,rgba(255,255,255,0.08),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_700px_at_50%_100%,rgba(0,0,0,0.55),transparent_60%)]" />
    </div>

    <div className="w-full max-w-[420px] relative z-10">
      {/* Header */}
      <div className="text-center mb-7">
        <div
          className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-[22px]
                     bg-white/10 border border-white/12 backdrop-blur-xl
                     shadow-[0_16px_50px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
        >
          <Dumbbell className="w-8 h-8 text-white" />
        </div>

        <h1 className="mt-4 text-[28px] leading-tight font-semibold tracking-[-0.02em]
                       bg-gradient-to-b from-white via-white/90 to-white/55 bg-clip-text text-transparent">
          GymFlow
        </h1>
        <p className="mt-1 text-[13px] text-white/55">
          Start managing your gym today
        </p>
      </div>

      {/* Glass Card */}
      <div
        className="relative rounded-[28px] p-[18px]
                   bg-white/[0.07] border border-white/[0.12] backdrop-blur-2xl
                   shadow-[0_24px_80px_rgba(0,0,0,0.55)]
                   ring-1 ring-white/10"
      >
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none
                     bg-[linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0.02),rgba(255,255,255,0.06))]
                     opacity-60"
        />
        <div className="relative">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-center">
            Create Account
          </h2>
          <p className="mt-1 text-center text-[13px] text-white/50">
            Create your admin account to get started
          </p>

          {error && (
            <div className="mt-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-400/25 text-rose-100 text-[13px] break-words whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4.5">
            {/* Name */}
            <div>
              <label className="block text-[12px] font-medium text-white/65 mb-2">
                Full name
              </label>
              <input
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3.5 rounded-2xl
                           bg-white/[0.06] border border-white/[0.10]
                           text-white placeholder-white/35
                           shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                           focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20
                           transition"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] font-medium text-white/65 mb-2">
                Email
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                  autoComplete="new-password"
                  minLength={8}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-3.5 pr-[88px] rounded-2xl
                             bg-white/[0.06] border border-white/[0.10]
                             text-white placeholder-white/35
                             shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                             focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20
                             transition"
                  placeholder="Minimum 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[12px] font-medium text-white/65 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3.5 pr-[88px] rounded-2xl
                             bg-white/[0.06] border border-white/[0.10]
                             text-white placeholder-white/35
                             shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                             focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20
                             transition"
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2
                             px-3 py-1.5 rounded-full text-[12px] font-medium
                             bg-white/10 border border-white/10 text-white/80
                             hover:bg-white/14 active:scale-[0.98]
                             transition"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

     <div className="flex items-start gap-3">
  <input
    id="agree"
    type="checkbox"
    required
    className="mt-1 h-5 w-5 min-w-[20px] rounded-md
               bg-white/[0.06] border border-white/20
               accent-white"
  />
{/* Terms */}
  <label
    htmlFor="agree"
    className="text-[13px] leading-relaxed text-white/55 select-none"
  >
    I agree to the{" "}
    <a
      href="#"
      onClick={(e) => e.stopPropagation()}
      className="text-white/85 hover:text-white underline-offset-4 hover:underline"
    >
      Terms of Service
    </a>{" "}
    and{" "}
    <a
      href="#"
      onClick={(e) => e.stopPropagation()}
      className="text-white/85 hover:text-white underline-offset-4 hover:underline"
    >
      Privacy Policy
    </a>
  </label>
</div>

            {/* Primary */}
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
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-white/55">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-white/90 hover:text-white underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="h-6" />
    </div>
  </div>
);
}
