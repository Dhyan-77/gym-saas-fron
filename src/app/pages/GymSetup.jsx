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

  const [locStatus, setLocStatus] = useState("idle");

  const [formData, setFormData] = useState({
    gymName: "",
    address: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    api
      .get("/api/gyms/")
      .then((res) => {
        const gyms = Array.isArray(res.data) ? res.data : [];
        setHasExistingGyms(gyms.length > 0);
      })
      .catch(() => {});
  }, []);

  const handleUseLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Location not supported on this device.");
      return;
    }

    setLocStatus("locating");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));

        setLocStatus("ok");
      },
      () => {
        setLocStatus("error");
        setError("Could not get location. Please try again.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.gymName,
        address: formData.address || "",
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const res = await api.post("/api/gyms/", payload);

      if (res.data?.id) {
        setActiveGymId(res.data.id);
      }

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
    <div className="min-h-[100svh] bg-[#07090f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 border border-white/10">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>

          <h1 className="mt-4 text-2xl font-semibold text-white">
            GymFlow
          </h1>

          <p className="text-sm text-white/60 mt-1">
            {hasExistingGyms ? "Add another gym" : "Create your gym"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.06] border border-white/[0.1] rounded-2xl p-6 backdrop-blur-xl shadow-xl">

          <h2 className="text-lg font-semibold text-white text-center">
            Gym details
          </h2>

          <p className="text-sm text-white/60 text-center mt-1">
            You can edit this later anytime
          </p>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

            {/* Gym Name */}
            <div>
              <label className="text-sm text-white/70">
                Gym name
              </label>

              <input
                type="text"
                required
                value={formData.gymName}
                onChange={(e) =>
                  setFormData({ ...formData, gymName: e.target.value })
                }
                placeholder="e.g. Iron Paradise Gym"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* Address */}
            <div>
              <label className="text-sm text-white/70">
                Address (optional)
              </label>

              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Street, City"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* Location Button */}
            <button
              type="button"
              onClick={handleUseLocation}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white hover:bg-white/10 transition"
            >
              <MapPin size={16} />

              {locStatus === "locating"
                ? "Detecting location..."
                : locStatus === "ok"
                ? "Location captured"
                : "Use current location"}
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-xl bg-white text-black py-3 font-semibold hover:bg-gray-200 active:scale-[0.98] transition"
            >
              {loading
                ? "Saving..."
                : hasExistingGyms
                ? "Add Gym"
                : "Create Gym"}
            </button>

          </form>

          <p className="text-xs text-white/40 text-center mt-6">
            Your gym information is private and secure.
          </p>

        </div>
      </div>
    </div>
  );
}