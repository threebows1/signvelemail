import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Sign Vel" },
      { name: "description", content: "Simple, affordable pricing for teams of every size. Deploy pixel-perfect email signatures from $2.25/mo." },
      { property: "og:title", content: "Sign Vel Pricing" },
      { property: "og:description", content: "Trial free. Basic from $2.25/mo. Plus from $4.75/mo. Pro from $17.50/mo. Billed monthly or yearly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pricing,
});

type Cycle = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  tagline: string;
  audience: string;
  monthly: number | null;
  yearly: number | null;
  yearlyStrike?: number;
  monthlyStrike?: number;
  highlight?: boolean;
  cta: string;
};

const plans: Plan[] = [
  {
    id: "trial",
    name: "Trial",
    tagline: "30 Day Trial",
    audience: "For everyone",
    monthly: 0,
    yearly: 0,
    cta: "Start Free",
  },
  {
    id: "basic",
    name: "Basic",
    tagline: "For Individuals",
    audience: "Solo creators & freelancers",
    monthly: 2.25,
    monthlyStrike: 3.5,
    yearly: 27,
    yearlyStrike: 35,
    cta: "Get Started",
  },
  {
    id: "plus",
    name: "Plus",
    tagline: "For Small Business",
    audience: "Growing teams up to 50",
    monthly: 4.75,
    monthlyStrike: 6,
    yearly: 56,
    yearlyStrike: 71.25,
    highlight: true,
    cta: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For Large Business + Agencies",
    audience: "Enterprises & agencies",
    monthly: 17.5,
    monthlyStrike: 22,
    yearly: 210,
    yearlyStrike: 263.75,
    cta: "Get Started",
  },
];

type Row = {
  label: string;
  values: (string | boolean)[];
};

const rows: Row[] = [
  { label: "Signature designs", values: ["up to 5", "1", "up to 10", "10+ (unlimited)"] },
  { label: "Team members per design", values: ["multiple", "multiple", "multiple", "multiple"] },
  { label: "Fully editable", values: [true, true, true, true] },
  { label: "Custom templates", values: ["1", "1", "10", "unlimited"] },
  { label: "Profile images (default + custom)", values: [true, true, true, true] },
  { label: "Share via link", values: [true, true, true, true] },
  { label: "Share via email + CSV", values: [false, false, "50 members", "unlimited"] },
  { label: "White label branding", values: [false, false, false, true] },
  { label: "Personalized address & socials per member", values: [false, false, true, true] },
  { label: "Signature analytics", values: [false, false, false, true] },
  { label: "Image hosting", values: [true, true, true, true] },
  { label: "Fetch branding from website", values: [true, true, true, true] },
  { label: "Export to Gmail, Outlook, Apple Mail", values: [true, true, true, true] },
  { label: "One-click deploy to Google Workspace", values: [false, false, true, true] },
  { label: "One-click deploy to Microsoft 365", values: [false, false, true, true] },
  { label: "Campaign banners & CTA buttons", values: [false, true, true, true] },
  { label: "A/B test signatures", values: [false, false, false, true] },
  { label: "Role-based permissions (SSO ready)", values: [false, false, false, true] },
  { label: "Priority support", values: [false, false, true, true] },
  { label: "Dedicated success manager", values: [false, false, false, true] },
];

function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("yearly");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" aria-label="Sign Vel home">
          <Logo size={48} wordmarkClassName="text-xl" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Sign in
          </Link>
          <Link to="/app">
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
              Open App
            </Button>
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-10 text-center">
        <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-4">
          (Pricing)
        </span>
        <h1 className="text-5xl md:text-6xl font-[Inter_Tight] font-bold tracking-tighter mb-4">
          One price. Every mailbox.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Straightforward plans that undercut every competitor. Cancel anytime. All plans include a free 30-day trial.
        </p>

        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted border border-border">
          <button
            onClick={() => setCycle("monthly")}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
              cycle === "monthly" ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle("yearly")}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
              cycle === "yearly" ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            Yearly <span className="ml-1 text-[10px] font-[JetBrains_Mono] text-primary">SAVE 20%</span>
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => {
            const price = cycle === "yearly" ? p.yearly : p.monthly;
            const strike = cycle === "yearly" ? p.yearlyStrike : p.monthlyStrike;
            const suffix = cycle === "yearly" ? "/year" : "/month";
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-6 bg-white ring-1 transition-all ${
                  p.highlight
                    ? "ring-2 ring-primary shadow-xl -translate-y-1"
                    : "ring-black/5 hover:ring-primary/30"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-[JetBrains_Mono] uppercase tracking-widest rounded-full">
                    Most Popular
                  </span>
                )}
                <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-[0.2em] text-muted-foreground">
                  {p.name}
                </p>
                <h3 className="text-2xl font-[Inter_Tight] font-bold text-primary mt-2">{p.tagline}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  {price === 0 ? (
                    <span className="text-4xl font-bold">Free</span>
                  ) : (
                    <>
                      {strike && (
                        <span className="text-lg text-muted-foreground line-through">${strike.toFixed(2)}</span>
                      )}
                      <span className="text-4xl font-bold">${price?.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">{suffix}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-[JetBrains_Mono]">
                  {p.audience}
                </p>
                <Link to="/login" className="block mt-6">
                  <Button
                    className={`w-full py-6 rounded-lg font-semibold ${
                      p.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    {p.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium">
            Compare Features
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="overflow-x-auto rounded-2xl ring-1 ring-black/5 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-stone-50/60">
                <th className="text-left px-5 py-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Feature
                </th>
                {plans.map((p) => (
                  <th key={p.id} className="px-5 py-4 text-center">
                    <div className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
                      {p.name}
                    </div>
                    <div className="text-primary font-semibold mt-0.5">{p.tagline}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} className={i % 2 ? "bg-stone-50/40" : ""}>
                  <td className="px-5 py-3 text-foreground">{r.label}</td>
                  {r.values.map((v, idx) => (
                    <td key={idx} className="px-5 py-3 text-center text-sm">
                      {typeof v === "boolean" ? (
                        v ? (
                          <Check className="size-4 text-primary mx-auto" strokeWidth={2.5} />
                        ) : (
                          <Minus className="size-4 text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        <span className="text-foreground">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          All prices in USD. Yearly plans are billed once per year and include ~20% savings vs. monthly.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-[Inter_Tight] font-bold tracking-tight text-center mb-10">Frequently asked</h2>
        <div className="space-y-4">
          {[
            {
              q: "Can I switch plans later?",
              a: "Yes — upgrade or downgrade at any time. We prorate the difference automatically.",
            },
            {
              q: "Do you offer refunds?",
              a: "Every plan starts with a full 30-day trial. If it's not for you, cancel before the trial ends and pay nothing.",
            },
            {
              q: "Which email clients are supported?",
              a: "Gmail, Google Workspace, Outlook (Windows/Mac/Web), Microsoft 365, Apple Mail, Thunderbird, and iOS Mail.",
            },
            {
              q: "Can I white-label Sign Vel for my agency?",
              a: "Yes — the Pro plan includes full white-label branding, custom domain, and CSV bulk deployment.",
            },
          ].map((f) => (
            <div key={f.q} className="rounded-xl bg-white ring-1 ring-black/5 p-5">
              <p className="font-semibold">{f.q}</p>
              <p className="text-sm text-muted-foreground mt-1.5">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-10 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size={40} wordmarkClassName="text-sm" />
          <p className="text-xs text-muted-foreground">&copy; 2026 Sign Vel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
