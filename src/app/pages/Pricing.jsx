import { useState } from "react";
import Navigation from "../components/Navigation";
import { Check } from "lucide-react";
import { api } from "../../api";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);

  const PLAN_IDS = {
    monthly: 1,
    six_months: 2,
    yearly: 3,
  };

  const pricing = {
    monthly: { price: "₹199", label: "/month" },
    six_months: { price: "₹999", label: "/6 months" },
    yearly: { price: "₹1999", label: "/year" },
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      const res = await api.post("/api/billing/checkout/", {
        plan_id: PLAN_IDS[billingCycle],
      });

      const { razorpay_key, subscription_id } = res.data;

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded.");
        return;
      }

      const options = {
        key: razorpay_key,
        subscription_id,
        name: "GymFlow Pro",
        description: `GymFlow Pro (${billingCycle.replace("_", " ")})`,
        theme: { color: "#111111" },
        handler: function () {
          setTimeout(() => {
  window.location.href = "/admin";
}, 1500);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">

        {/* Header */}
        <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
          Upgrade to <span className="text-white">GymFlow Pro</span>
        </h1>

        <p className="text-gray-400 max-w-xl mx-auto mb-12 text-sm sm:text-base">
          Everything you need to manage members, track revenue, and automate renewals — built for serious gym owners.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-white/5 border border-white/10 p-1 rounded-full backdrop-blur-lg">
            {["monthly", "six_months", "yearly"].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-full transition-all duration-300 ${
                  billingCycle === cycle
                    ? "bg-white text-black shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {cycle === "six_months"
                  ? "6 Months"
                  : cycle.charAt(0).toUpperCase() + cycle.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Card */}
        <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 backdrop-blur-xl shadow-2xl">

          {billingCycle === "yearly" && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-semibold px-4 py-1 rounded-full shadow-md">
              BEST VALUE
            </div>
          )}

          <div className="text-4xl sm:text-6xl font-semibold tracking-tight">
            {pricing[billingCycle].price}
            <span className="text-gray-400 text-lg ml-2">
              {pricing[billingCycle].label}
            </span>
          </div>

          <ul className="mt-10 space-y-4 text-gray-300 text-left max-w-sm mx-auto">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-1" />
              Unlimited Members
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-1" />
              Automated Renewal Reminders
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-1" />
              Revenue Dashboard
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-400 mt-1" />
              Priority Support
            </li>
          </ul>

          {/* CTA */}
          <button
            disabled={loading}
            onClick={handleSubscribe}
            className="mt-12 w-full bg-white text-black py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shadow-lg"
          >
            {loading ? "Processing..." : "Start Pro Membership"}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Cancel anytime. Secure payments powered by Razorpay.
          </p>
        </div>
      </div>
    </div>
  );
}