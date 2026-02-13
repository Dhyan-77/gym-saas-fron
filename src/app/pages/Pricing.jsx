import { useState } from "react";
import Navigation from "../components/Navigation";
import { Check } from "lucide-react";

export default function Pricing() {
  const [billedYearly, setBilledYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "/month",
      description: "For small gyms testing digital management",
      features: [
        "Up to 30 members",
        "Basic member tracking",
        "Manual renewal management",
        "Email support",
      ],
      buttonText: "Start Free",
      highlight: false,
    },
    {
      name: "Growth",
      price: billedYearly ? "$99" : "$9.99",
      period: billedYearly ? "/year" : "/month",
      description: "Built for gym owners ready to scale",
      popular: true,
      features: [
        "Unlimited members",
        "Automated renewal reminders",
        "Payment tracking dashboard",
        "Revenue analytics",
        "Priority support",
      ],
      buttonText: "Upgrade to Growth",
      highlight: true,
    },
    {
      name: "Elite",
      price: billedYearly ? "$199" : "$19.99",
      period: billedYearly ? "/year" : "/month",
      description: "Advanced tools for serious operators",
      features: [
        "Everything in Growth",
        "Multi-location management",
        "Advanced financial reporting",
        "24/7 priority support",
      ],
      buttonText: "Go Elite",
      highlight: false,
    },
  ];

  return (
    <div className="relative min-h-[100svh] bg-black text-white">
      <Navigation />

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-6 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-6 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">

        {/* HERO */}
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Simple Pricing. No Hidden Fees.
          </h1>

          <p className="text-gray-400 mt-4 text-sm sm:text-lg max-w-2xl mx-auto">
            Built specifically for independent gym owners who want
            better control over memberships and renewals.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-xl">
            <button
              onClick={() => setBilledYearly(false)}
              className={`px-6 py-2 rounded-full text-sm transition ${
                !billedYearly
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setBilledYearly(true)}
              className={`px-6 py-2 rounded-full text-sm transition ${
                billedYearly
                  ? "bg-white text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly
            </button>

            {billedYearly && (
              <span className="ml-3 flex items-center text-xs text-green-400 font-medium">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/5 backdrop-blur-2xl border rounded-2xl p-6 shadow-lg transition-all ${
                plan.highlight
                  ? "border-white shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                  : "border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 right-4 px-3 py-1 text-xs bg-white text-black rounded-full">
                  Recommended
                </div>
              )}

              <div className="mb-6">
                <div className="text-gray-400 text-sm">{plan.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {plan.description}
                </div>

                <div className="flex items-end gap-2 mt-4">
                  <span className="text-4xl font-semibold">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-300">
                    <Check className="w-4 h-4 mt-1 flex-shrink-0 text-white" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-medium transition ${
                  plan.highlight
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* HONEST POSITIONING SECTION */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-8">
            <h3 className="text-2xl font-semibold mb-4">
              Why GymFlow?
            </h3>
            <p className="text-gray-400">
              GymFlow was built to simplify gym management — 
              no complex enterprise software, no unnecessary features. 
              Just the tools you actually need to manage members and renewals efficiently.
            </p>
          </div>
        </div>

        {/* RISK REVERSAL */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-3">
              Cancel Anytime
            </h3>
            <p className="text-gray-400 text-sm sm:text-base">
              No contracts. No long-term commitment. 
              Upgrade, downgrade, or cancel whenever you want.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
