import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { PLANS, writePlanId, type PlanId } from "@/lib/plan";


export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Sign Vel" },
      { name: "description", content: "Start free with 1 signature and a 7-day trial. 10 signatures for $4.99/mo, 30 for $20/mo, or custom pricing for unlimited seats." },
      { property: "og:title", content: "Sign Vel Pricing" },
      { property: "og:description", content: "Free plan with 1 signature and a 7-day trial. Starter $4.99/mo for 10 signatures. Growth $20/mo for 30. Custom for unlimited." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pricing,
});

type Cycle = "monthly" | "yearly";

type Row = {
  label: string;
  values: (string | boolean)[];
};

// Every row below maps to functionality that ships in the app today.
const rows: Row[] = [
  { label: "Saved signatures", values: ["1", "10", "30", "Unlimited"] },
  { label: "7-day trial of all paid features", values: [true, false, false, false] },
  { label: "Template library (31 designs)", values: [true, true, true, true] },
  { label: "Blank / custom template", values: [true, true, true, true] },
  { label: "Layout filters — single, two-column, vertical", values: [true, true, true, true] },
  { label: "Live editor preview while you tweak", values: [true, true, true, true] },
  { label: "Colour palette presets + per-role colours", values: [true, true, true, true] },
  { label: "Typography controls (font, size, line height, spacing)", values: [true, true, true, true] },
  { label: "Profile photo & company logo uploads", values: [true, true, true, true] },
  { label: "Logo width + photo crop controls", values: [true, true, true, true] },
  { label: "Social profiles with reordering (22 networks)", values: [true, true, true, true] },
  { label: "Icon styles — brand, solid, outline, plain", values: [true, true, true, true] },
  { label: "Fetch branding from a website URL", values: [false, true, true, true] },
  { label: "Extras — banner, disclaimer, booking button, green footer", values: [false, true, true, true] },
  { label: "Copy-to-clipboard install", values: [true, true, true, true] },
  { label: "Gmail & Apple Mail rich-text export", values: [true, true, true, true] },
  { label: "Raw HTML export", values: [false, true, true, true] },
  { label: "Outlook for Windows .htm download", values: [false, true, true, true] },
  { label: "Shareable editor link", values: [false, true, true, true] },
  { label: "Duplicate & rename signatures", values: [true, true, true, true] },
  { label: "Cloud sync across devices", values: [false, true, true, true] },
  { label: "Delivery dashboard for signature rollouts", values: [false, false, true, true] },
  { label: "Connect to Claude / MCP assistants", values: [false, false, true, true] },
  { label: "Team-wide branding defaults in Settings", values: [false, false, true, true] },
  { label: "Onboarding & priority support", values: [false, false, false, true] },
];

function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("yearly");
  const navigate = useNavigate();

  function choose(id: PlanId) {
    writePlanId(id);
    const p = PLANS.find((x) => x.id === id);
    if (id === "free") {
      navigate({ to: "/login", search: { next: "/app" } });
      return;
    }
    toast.success(`You're on ${p?.name} — full access unlocked`, {
      description: "Your workspace is ready right away. No refresh or re-login needed.",
    });
    navigate({ to: "/app" });
  }


  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/" aria-label="Sign Vel home">
          <Logo size={48} wordmarkClassName="text-xl" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" search={{ next: "/app" }} className="text-sm font-medium hover:text-primary transition-colors">
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
          Pay for signatures, not seats.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Start free with one signature and a 7-day trial of everything. Scale up when you need more. Cancel anytime.
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
          {PLANS.map((p) => {
            const price = cycle === "yearly" ? p.yearly : p.monthly;
            const suffix = cycle === "yearly" ? "/year" : "/month";
            const strike = cycle === "yearly" && p.monthly ? p.monthly * 12 : undefined;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-6 bg-white ring-1 transition-all ${
                  p.highlight ? "ring-2 ring-primary shadow-xl -translate-y-1" : "ring-black/5 hover:ring-primary/30"
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
                  {price === null ? (
                    <span className="text-4xl font-bold">Let's talk</span>
                  ) : price === 0 ? (
                    <span className="text-4xl font-bold">Free</span>
                  ) : (
                    <>
                      {strike && (
                        <span className="text-lg text-muted-foreground line-through">${strike.toFixed(2)}</span>
                      )}
                      <span className="text-4xl font-bold">${price.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground">{suffix}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-[JetBrains_Mono]">
                  {p.audience}
                </p>
                {p.trialDays && (
                  <p className="text-xs text-primary mt-1 font-medium">Includes a {p.trialDays}-day full-feature trial</p>
                )}
                {p.id === "custom" ? (
                  <a href="mailto:hello@signvel.app?subject=Custom%20plan%20enquiry" className="block mt-6">
                    <Button className="w-full py-6 rounded-lg font-semibold bg-foreground text-background hover:bg-foreground/90">
                      {p.cta}
                    </Button>
                  </a>
                ) : (
                  <Link to="/login" search={{ next: "/app" }} className="block mt-6" onClick={() => choose(p.id)}>
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
                )}
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
                {PLANS.map((p) => (
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
          All prices in USD. Yearly billing saves 20% versus paying monthly. Free plan features stay free after the 7-day trial ends.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-[Inter_Tight] font-bold tracking-tight text-center mb-10">Frequently asked</h2>
        <div className="space-y-4">
          {[
            {
              q: "What happens after the 7-day trial?",
              a: "Your account drops to the Free plan — one signature, kept live forever. Nothing is deleted, extra signatures simply stay read-only until you upgrade.",
            },
            {
              q: "Can I switch plans later?",
              a: "Yes — move between Starter and Growth whenever you like. The signature limit updates instantly.",
            },
            {
              q: "Which email clients are supported?",
              a: "Gmail, Google Workspace, Outlook (Windows, Mac, Web), Microsoft 365, Apple Mail, Thunderbird and iOS Mail.",
            },
            {
              q: "What counts as a signature?",
              a: "Each saved design in your dashboard. Duplicating a design to tweak it for a colleague counts as one more.",
            },
            {
              q: "How does custom pricing work?",
              a: "Tell us how many people you need to cover and we quote a flat rate with unlimited signatures and onboarding help.",
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
