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
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
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

  return (
    <div className="min-h-screen bg-black text-white p-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto pt-12 pb-20 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {hasExistingGyms ? "Add another gym" : "Setup Your Gym"}
          </h1>

          <p className="text-gray-400 text-sm sm:text-base">
            {hasExistingGyms
              ? "Add a new gym to your account"
              : "Add your gym details to get started"}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Gym Name *
              </label>
              <input
                type="text"
                value={formData.gymName}
                onChange={(e) =>
                  setFormData({ ...formData, gymName: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                placeholder="FitZone Gym"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                placeholder="123 Fitness Street"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                required
              />

              <input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                required
              />

              <input
                type="text"
                placeholder="ZIP Code"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(hasExistingGyms ? "/admin" : "/")}
                className="w-full sm:flex-1 px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
              >
                {hasExistingGyms ? "Back to Dashboard" : "Back"}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 px-6 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition disabled:opacity-60"
              >
                {loading
                  ? "Creating..."
                  : hasExistingGyms
                    ? "Add gym"
                    : "Continue to Dashboard"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
