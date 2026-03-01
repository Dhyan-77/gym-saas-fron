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

  const [showManualAddress, setShowManualAddress] = useState(false);
  const [locStatus, setLocStatus] = useState("idle"); // idle | locating | ok | error

  const [formData, setFormData] = useState({
    gymName: "",
    // a human-readable address (from manual entry or reverse geocode later)
    address: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
    latitude: null,
    longitude: null,
  });

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

  const handleUseCurrentLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Location is not supported on this device.");
      setLocStatus("error");
      return;
    }

    setLocStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // We store coordinates. Address can be filled later (reverse geocode) or manual.
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
        setLocStatus("ok");
      },
      (err) => {
        const msg =
          err?.code === 1
            ? "Location permission denied."
            : "Could not fetch location. Try again.";
        setError(msg);
        setLocStatus("error");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const handleSaveManualAddress = () => {
    setError("");
    const parts = [
      formData.addressLine1,
      formData.city,
      formData.state,
      formData.zipCode,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prefer manual/human address if present.
      // If only coords exist, you can still send coords to backend (if supported),
      // or require manual address. Here: allow either.
      const hasCoords =
        typeof formData.latitude === "number" &&
        typeof formData.longitude === "number";

      const fullAddress =
        formData.address ||
        [formData.addressLine1, formData.city, formData.state, formData.zipCode]
          .filter(Boolean)
          .join(", ");

      if (!fullAddress && !hasCoords) {
        setError("Please use location or enter address manually.");
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.gymName,
        address: fullAddress || "", // if backend requires string
        // include coords if your backend model supports it
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const res = await api.post("/api/gyms/", payload);

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

  return (
    <div className="relative min-h-[100svh] bg-[#05060a] text-white flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_50%_10%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_700px_at_50%_100%,rgba(0,0,0,0.55),transparent_60%)]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-7">
          <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-[22px]
                          bg-white/10 border border-white/12 backdrop-blur-xl
                          shadow-[0_16px_50px_rgba(0,0,0,0.45)] ring-1 ring-white/10">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>

          <h1 className="mt-4 text-[28px] leading-tight font-semibold tracking-[-0.02em]
                         bg-gradient-to-b from-white via-white/90 to-white/55 bg-clip-text text-transparent">
            GymFlow
          </h1>
          <p className="mt-1 text-[13px] text-white/55">
            {hasExistingGyms ? "Add another gym" : "Set up your first gym"}
          </p>
        </div>

        <div className="relative rounded-[28px] p-[18px]
                        bg-white/[0.07] border border-white/[0.12] backdrop-blur-2xl
                        shadow-[0_24px_80px_rgba(0,0,0,0.55)]
                        ring-1 ring-white/10">
          <div className="absolute inset-0 rounded-[28px] pointer-events-none
                          bg-[linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0.02),rgba(255,255,255,0.06))]
                          opacity-60" />
          <div className="relative">
            <h2 className="text-[22px] font-semibold tracking-[-0.01em] text-center">
              Gym Setup
            </h2>
            <p className="mt-1 text-center text-[13px] text-white/50">
              Location helps members find you faster
            </p>

            {error && (
              <div className="mt-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-400/25 text-rose-100 text-[13px] break-words whitespace-pre-line">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4.5">
              {/* Gym Name */}
              <div>
                <label className="block text-[12px] font-medium text-white/65 mb-2">
                  Gym name
                </label>
                <input
                  type="text"
                  value={formData.gymName}
                  onChange={(e) => setFormData({ ...formData, gymName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl
                             bg-white/[0.06] border border-white/[0.10]
                             text-white placeholder-white/35
                             shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                             focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20
                             transition"
                  placeholder="e.g., Iron Paradise"
                  required
                />
              </div>

              {/* Address */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-2">
                    <div className="mt-0.5 text-white/70">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-white/70">Address</div>
                      <div className="mt-1 text-[12px] text-white/45 leading-relaxed">
                        Use current location or enter it manually.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="shrink-0 px-3 py-2 rounded-full text-[12px] font-semibold
                               bg-white/10 border border-white/10 text-white/85
                               hover:bg-white/14 active:scale-[0.98] transition"
                  >
                    {locStatus === "locating" ? "Locating..." : "Use location"}
                  </button>
                </div>

                {/* Status chip */}
                <div className="mt-3 flex items-center gap-2 text-[12px]">
                  <span
                    className={
                      locStatus === "ok"
                        ? "px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-200"
                        : locStatus === "error"
                        ? "px-2 py-1 rounded-full bg-amber-500/10 border border-amber-400/25 text-amber-200"
                        : "px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/55"
                    }
                  >
                    {locStatus === "ok"
                      ? "Location captured"
                      : locStatus === "error"
                      ? "Location failed"
                      : "Optional"}
                  </span>

                  {formData.latitude != null && formData.longitude != null && (
                    <span className="text-white/45">
                      {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                    </span>
                  )}
                </div>

                {/* Address preview (manual/human) */}
                <div className="mt-3">
                  <input
                    type="text"
                    value={formData.address || ""}
                    readOnly
                    className="w-full px-4 py-3 rounded-2xl bg-black/20 border border-white/10
                               text-white/80 placeholder-white/30 focus:outline-none"
                    placeholder="No manual address saved (optional if using location)"
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
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.10]
                                   text-white placeholder-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                                   focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20 transition"
                        placeholder="Street address"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.10]
                                     text-white placeholder-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                                     focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20 transition"
                          placeholder="City"
                        />
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.10]
                                     text-white placeholder-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                                     focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20 transition"
                          placeholder="State"
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.10]
                                   text-white placeholder-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
                                   focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/20 transition"
                        placeholder="ZIP code"
                      />

                      <button
                        type="button"
                        onClick={handleSaveManualAddress}
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
                {loading ? "Saving..." : hasExistingGyms ? "Add Gym" : "Create Gym"}
              </button>
            </form>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}