import { useState } from "react";
import Navigation from "../components/Navigation";
import { Check } from "lucide-react";
import { api } from "../../api";

export default function Pricing() {

  const [billingCycle, setBillingCycle] = useState("yearly");
  const [loading, setLoading] = useState(false);

  const PLAN_IDS = {
    monthly: 1,
    six_months: 3,
    yearly: 2,
  };

  const pricing = {
    monthly: {
      price: "₹199",
      label: "/month",
      sub: "Pay monthly",
    },
    six_months: {
      price: "₹999",
      label: "/6 months",
      sub: "Save compared to monthly",
    },
    yearly: {
      price: "₹1999",
      label: "/year",
      sub: "Best value plan",
    },
  };

  const cycles = [
    { key: "monthly", label: "Monthly" },
    { key: "six_months", label: "6 Months" },
    { key: "yearly", label: "Yearly" },
  ];

  const handleSubscribe = async () => {

    try {

      setLoading(true);

      const res = await api.post("/api/billing/checkout/", {
        plan_id: PLAN_IDS[billingCycle],
      });

      const { razorpay_key, subscription_id } = res.data;

      if (!window.Razorpay) {
        alert("Payment system not loaded.");
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
          }, 1200);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {

      console.error(err);
      alert("Payment failed. Please try again.");

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="min-h-screen bg-[#07090f] text-white">

      <Navigation />

      <div className="max-w-md mx-auto px-4 py-10">

        {/* Header */}

        <div className="text-center mb-8">

          <h1 className="text-2xl font-semibold">
            Simple pricing for your gym
          </h1>

          <p className="text-sm text-white/60 mt-2">
            Manage members, renewals and fee collection easily.
          </p>

        </div>

        {/* Plan selector */}

        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-6">

          {cycles.map((c) => {

            const active = billingCycle === c.key;

            return (
              <button
                key={c.key}
                onClick={() => setBillingCycle(c.key)}
                className={`flex-1 py-2 text-sm rounded-lg transition ${
                  active
                    ? "bg-white text-black font-medium"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            );
          })}

        </div>

        {/* Pricing card */}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

          <div className="text-center">

            <div className="text-4xl font-semibold">

              {pricing[billingCycle].price}

              <span className="text-lg text-white/60 ml-1">
                {pricing[billingCycle].label}
              </span>

            </div>

            <p className="text-sm text-white/60 mt-1">
              {pricing[billingCycle].sub}
            </p>

          </div>

          {/* Divider */}

          <div className="my-6 border-t border-white/10" />

          {/* Features */}

          <ul className="space-y-3 text-sm">

            {[
              "Track all students / members",
              "See who needs to renew",
              "Track monthly fee collection",
              "Unlimited members",
              "Priority support",
            ].map((f) => (
              <li key={f} className="flex items-start gap-3">

                <Check className="w-4 h-4 text-green-400 mt-1" />

                <span className="text-white/80">{f}</span>

              </li>
            ))}

          </ul>

          {/* CTA */}

          <button
            disabled={loading}
            onClick={handleSubscribe}
            className="w-full mt-6 bg-white text-black rounded-xl py-3 font-semibold hover:bg-gray-200 transition active:scale-[0.98]"
          >
            {loading ? "Processing..." : "Start Pro Membership"}
          </button>

          {/* Trust */}

          <p className="text-xs text-center text-white/50 mt-3">
            Secure payment via Razorpay. Cancel anytime.
          </p>

        </div>

        {/* Trust block */}

        <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white/60">

          <p>
            🔒 Your data is safe and private. Payments are handled securely by Razorpay.
          </p>

        </div>

      </div>
    </div>
  );
}