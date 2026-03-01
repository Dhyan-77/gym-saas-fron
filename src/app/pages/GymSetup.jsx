import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, MapPin } from "lucide-react";
import { api } from "../../api";
import { setActiveGymId } from "../../utils/gym";

export default function GymSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasExistingGyms, setHasExistingGyms] = useState(false);

  const [formData, setFormData] = useState({
    gymName: "",
    address: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: null,
longitude: null,
  });

  // Detect if user already has gyms (add another vs first-time setup)
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;
    api
      .get("/api/gyms/")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setHasExistingGyms(list.length > 0);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fullAddress = [
        formData.address,
        formData.city,
        formData.state,
        formData.zipCode,
      ]
        .filter(Boolean)
        .join(", ");

      const res = await api.post("/api/gyms/", {
        name: formData.gymName,
        address: fullAddress,
      });

      // Switch to the new gym so dashboard/members show it
      if (res.data?.id) setActiveGymId(res.data.id);

      navigate("/admin");
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.detail ||
        (data && typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : null) ||
        "Failed to create gym";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  const [showManualAddress, setShowManualAddress] = useState(false);

// Optional: store coords too (useful later)
const handleUseCurrentLocation = async () => {
  setError("");
  if (!navigator.geolocation) {
    setError("Location is not supported on this device.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;

      // For now: store a friendly string (no reverse geocoding needed).
      // Later you can call a geocoding API to convert coords -> full address.
      setFormData((prev) => ({
        ...prev,
        address: `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`,
        latitude,
        longitude,
      }));
    },
    (err) => {
      const msg =
        err?.code === 1
          ? "Location permission denied."
          : "Could not fetch location. Try again.";
      setError(msg);
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
  );
};

const handleSaveManualAddress = () => {
  const parts = [
    formData.addressLine1,
    formData.city,
    formData.zip,
  ].filter(Boolean);

  if (!parts.length) {
    setError("Please enter your address first.");
    return;
  }

  setFormData((prev) => ({
    ...prev,
    address: parts.join(", "),
  }));
  setShowManualAddress(false);
};

 return (
  <div className="relative min-h-[100svh] bg-[#05060a] text-white flex items-center justify-center px-4 py-10 overflow-hidden">
    {/* Background */}
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
          Create your gym profile in seconds
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
            Just the essentials — you can edit later
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

            {/* Location block */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[12px] font-medium text-white/70">Address</div>
                  <div className="mt-1 text-[12px] text-white/45 leading-relaxed">
                    Use your current location or enter it manually.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation /* add handler below */}
                  className="shrink-0 px-3 py-2 rounded-full text-[12px] font-semibold
                             bg-white/10 border border-white/10 text-white/85
                             hover:bg-white/14 active:scale-[0.98] transition"
                >
                  Use location
                </button>
              </div>

              {/* Readonly preview (from GPS or manual) */}
              <div className="mt-3">
                <input
                  type="text"
                  value={formData.address || ""}
                  readOnly
                  className="w-full px-4 py-3 rounded-2xl
                             bg-black/20 border border-white/10
                             text-white/80 placeholder-white/30
                             focus:outline-none"
                  placeholder="No address selected yet"
                />
              </div>

              {/* Manual toggle */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowManualAddress((v) => !v)}
                  className="w-full text-left px-3 py-2 rounded-xl
                             text-[12px] font-medium text-white/70
                             hover:bg-white/[0.06] transition"
                >
                  {showManualAddress ? "Hide manual address" : "Enter address manually"}
                </button>

                {showManualAddress && (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={formData.addressLine1 || ""}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl
                                 bg-white/[0.06] border border-white/[0.10]
                                 text-white placeholder-white/35
                                 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                                 focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20
                                 transition"
                      placeholder="Street address"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl
                                   bg-white/[0.06] border border-white/[0.10]
                                   text-white placeholder-white/35
                                   shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                                   focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20
                                   transition"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={formData.zip || ""}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl
                                   bg-white/[0.06] border border-white/[0.10]
                                   text-white placeholder-white/35
                                   shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                                   focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20
                                   transition"
                        placeholder="ZIP"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveManualAddress /* add handler below */}
                      className="w-full py-3 rounded-2xl text-[13px] font-semibold
                                 bg-white/10 border border-white/10 text-white/85
                                 hover:bg-white/14 active:scale-[0.985] transition"
                    >
                      Save manual address
                    </button>
                  </div>
                )}
              </div>
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 rounded-md bg-white/[0.06] border border-white/20 accent-white"
                required
              />
              <label className="text-[13px] leading-relaxed text-white/55">
                I agree to the{" "}
                <a href="#" className="text-white/85 hover:text-white underline-offset-4 hover:underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-white/85 hover:text-white underline-offset-4 hover:underline">
                  Privacy
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
                         disabled:opacity-60 disabled:active:scale-100 transition"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-white/55">
            Already have an account?{" "}
            <Link className="text-white/90 hover:text-white underline-offset-4 hover:underline" to="/">
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
