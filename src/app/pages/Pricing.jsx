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
    monthly: { price: "₹199", label: "/month", sub: "Billed monthly" },
    six_months: { price: "₹999", label: "/6 months", sub: "Save vs monthly" },
    yearly: { price: "₹1999", label: "/year", sub: "Best overall value" },
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

  const cycles = [
    { key: "monthly", label: "Monthly" },
    { key: "six_months", label: "6 Months" },
    { key: "yearly", label: "Yearly" },
  ];

  return (
    <div className="min-h-screen text-white bg-[#050507] relative overflow-hidden">
      {/* Premium background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute top-28 -right-20 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-96 w-[28rem] rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />
      </div>

      <Navigation />

      <div className="relative mx-auto w-full max-w-md px-4 pb-14 pt-10 sm:max-w-lg sm:px-6 sm:pt-14">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-[28px] leading-tight sm:text-4xl font-semibold tracking-tight">
            Upgrade to{" "}
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              GymFlow Pro
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            Manage members, track revenue, automate renewals — built for serious gym owners.
          </p>
        </div>

        {/* iOS segmented control */}
        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)]">
            <div className="grid grid-cols-3 gap-1">
              {cycles.map((c) => {
                const active = billingCycle === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => setBillingCycle(c.key)}
                    className={[
                      "relative isolate rounded-xl px-3 py-2 text-[12px] sm:text-sm font-medium transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                      active
                        ? "text-black"
                        : "text-white/70 hover:text-white",
                    ].join(" ")}
                  >
                    {active && (
                      <span
                        className={[
                          "absolute inset-0 -z-10 rounded-xl",
                          "bg-white shadow-[0_10px_25px_-14px_rgba(255,255,255,0.6)]",
                        ].join(" ")}
                      />
                    )}
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Glass Card */}
        <div className="mt-8 relative">
          {/* iOS-like floating badge */}
          {billingCycle === "yearly" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="rounded-full border border-emerald-300/30 bg-emerald-300/15 px-4 py-1 text-[11px] font-semibold tracking-wide text-emerald-100 backdrop-blur-xl shadow-[0_10px_30px_-18px_rgba(16,185,129,0.8)]">
                BEST VALUE
              </div>
            </div>
          )}

          <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-white/[0.06] backdrop-blur-2xl shadow-[0_20px_70px_-35px_rgba(0,0,0,0.9)]">
            {/* glass highlight */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-24 left-0 h-56 w-full rotate-6 bg-gradient-to-b from-white/18 via-white/6 to-transparent blur-xl" />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10" />
            </div>

            <div className="relative p-6 sm:p-8">
              {/* Price row */}
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[44px] leading-none sm:text-6xl font-semibold tracking-tight">
                    {pricing[billingCycle].price}
                    <span className="ml-2 text-base sm:text-lg font-medium text-white/55">
                      {pricing[billingCycle].label}
                    </span>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-white/55">
                    {pricing[billingCycle].sub}
                  </p>
                </div>

                {/* tiny “pro” chip */}
                <div className="shrink-0">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70 backdrop-blur-xl">
                    <span className="font-semibold text-white/85">PRO</span>{" "}
                    <span className="text-white/50">Access</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              {/* Features */}
              <ul className="space-y-3 text-sm sm:text-[15px] text-white/75">
                {[
                  "Unlimited Members",
                  "Automated Renewal Reminders",
                  "Revenue Dashboard",
                  "Priority Support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 border border-emerald-300/20 backdrop-blur">
                      <Check className="h-4 w-4 text-emerald-200" />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                disabled={loading}
                onClick={handleSubscribe}
                className={[
                  "mt-7 w-full rounded-2xl py-3.5 sm:py-4 font-semibold",
                  "text-[14px] sm:text-[15px] text-black",
                  "bg-gradient-to-b from-white to-white/85",
                  "shadow-[0_20px_40px_-25px_rgba(255,255,255,0.9)]",
                  "transition active:scale-[0.985] hover:brightness-[1.02]",
                  "disabled:opacity-60 disabled:active:scale-100",
                  "relative overflow-hidden",
                ].join(" ")}
              >
                {/* subtle shine */}
                <span className="pointer-events-none absolute inset-0">
                  <span className="absolute -top-10 left-1/2 h-24 w-56 -translate-x-1/2 rotate-12 bg-white/35 blur-2xl" />
                </span>
                <span className="relative">
                  {loading ? "Processing..." : "Start Pro Membership"}
                </span>
              </button>

              <p className="mt-3 text-center text-[11px] text-white/45">
                Cancel anytime. Secure payments powered by Razorpay.
              </p>
            </div>
          </div>

          {/* bottom subtle note card (optional premium touch) */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 text-xs text-white/60">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                🔒
              </span>
              <p className="leading-relaxed">
                Your subscription activates instantly after payment. You can manage billing anytime.
              </p>
            </div>
          </div>
        </div>

        {/* safe-bottom spacing for mobile */}
        <div className="h-6" />
      </div>
    </div>
  );
}