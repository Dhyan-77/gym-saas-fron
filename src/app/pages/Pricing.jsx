import { useState } from "react";
import Navigation from "../components/Navigation";
import { Check } from "lucide-react";

export default function Pricing() {
  const [billedYearly, setBilledYearly] = useState(false);

  const plans = [
    {
      name: "Free Plan",
      price: billedYearly ? "$0" : "$0",
      period: "/month",
      features: [
        "Send up to 2 transfers per month",
        "Basic transaction history",
        "Email support",
        "Limited currency support (USD, EUR, GBP)",
        "Basic security features",
      ],
      buttonText: "Get Started",
      buttonClass: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    },
    {
      name: "Standard Plan",
      price: billedYearly ? "$99.99" : "$9.99",
      period: "/month",
      popular: true,
      features: [
        "Unlimited transfers",
        "Transaction history with export options",
        "Priority email support",
        "Expanded currency support",
        "Advanced security features",
      ],
      buttonText: "Get Started",
      buttonClass: "bg-white hover:bg-gray-200 text-black",
    },
    {
      name: "Pro Plan",
      price: billedYearly ? "$199.99" : "$19.99",
      period: "/month",
      features: [
        "Unlimited transfers with priority processing",
        "Comprehensive transaction analytics",
        "24/7 priority support",
        "Full currency support",
        "Enterprise security features",
      ],
      buttonText: "Get Started",
      buttonClass: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Gradient background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Pricing
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your gym management needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2">
            <button
              onClick={() => setBilledYearly(false)}
              className={`px-6 py-2 rounded-full transition-all ${
                !billedYearly ? "bg-white/10 text-white" : "text-gray-400"
              }`}
            >
              Billed Monthly
            </button>
            <button
              onClick={() => setBilledYearly(true)}
              className={`px-6 py-2 rounded-full transition-all ${
                billedYearly ? "bg-white/10 text-white" : "text-gray-400"
              }`}
            >
              Billed Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/5 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 hover:border-white/30 ${
                plan.popular
                  ? "border-white/30 scale-105 md:scale-110 shadow-2xl"
                  : "border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black rounded-full text-sm">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="text-gray-400 text-sm mb-2">{plan.name}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl transition-all duration-200 ${plan.buttonClass}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h3 className="text-2xl mb-4">Need a custom plan?</h3>
            <p className="text-gray-400 mb-6">
              We offer custom enterprise solutions for gyms with special requirements. Contact our
              sales team to discuss your needs.
            </p>
            <button className="px-8 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-all duration-200">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
