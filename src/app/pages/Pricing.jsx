import { useState } from "react";
import Navigation from "../components/Navigation";
import { Check } from "lucide-react";
import { api } from "../../api";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);

  // DB plan IDs (NOT razorpay_plan_id string)
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
        theme: { color: "#ffffff" },

        handler: function () {
          // After payment success
          window.location.href = "/dashboard";
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
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-3xl mx-auto px-6 py-16 text-center">

        <h1 className="text-4xl font-bold mb-4">
          GymFlow Pro
        </h1>

        <p className="text-gray-400 mb-10">
          Everything you need to manage members and renewals.
        </p>

        {/* Billing Options */}
        <div className="flex justify-center gap-4 mb-10">
          {["monthly", "six_months", "yearly"].map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`px-5 py-2 rounded-full text-sm transition ${
                billingCycle === cycle
                  ? "bg-white text-black"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {cycle === "six_months"
                ? "6 Months"
                : cycle.charAt(0).toUpperCase() + cycle.slice(1)}
            </button>
          ))}
        </div>

        {/* Pricing Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-xl">

          {billingCycle === "yearly" && (
            <div className="mb-4 text-green-400 text-sm font-medium">
              Best Value 🔥
            </div>
          )}

          <div className="text-5xl font-semibold">
            {pricing[billingCycle].price}
            <span className="text-gray-400 text-lg ml-2">
              {pricing[billingCycle].label}
            </span>
          </div>

          <ul className="mt-8 space-y-4 text-gray-300 text-left max-w-sm mx-auto">
            <li className="flex gap-3">
              <Check className="w-4 h-4 mt-1" />
              Unlimited Members
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 mt-1" />
              Automated Renewal Reminders
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 mt-1" />
              Revenue Dashboard
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 mt-1" />
              Priority Support
            </li>
          </ul>

          <button
            disabled={loading}
            onClick={handleSubscribe}
            className="mt-10 w-full bg-white text-black py-3 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Subscribe Now"}
          </button>

        </div>
      </div>
    </div>
  );
}