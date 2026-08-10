import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { PLANS, usePlan } from "@/lib/plan";
import { useSignatures } from "@/lib/signature-store";
import {
  DEFAULT_PAYMENT_LINKS,
  STRIPE_DASHBOARD_URL,
  usePaymentLinks,
  type PaymentLinks,
} from "@/lib/payment-links";


export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Sign Vel" },
      { name: "description", content: "Manage your Sign Vel account, workspace, branding defaults, and export preferences." },
      { property: "og:title", content: "Sign Vel Settings" },
      { property: "og:description", content: "Account, workspace, branding defaults, notifications, and data controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

const STORAGE_KEY = "signvel.settings.v1";

type Prefs = {
  displayName: string;
  email: string;
  workspace: string;
  defaultFont: string;
  defaultPrimary: string;
  defaultAccent: string;
  exportFormat: "rich" | "html" | "htm";
  autoInlineStyles: boolean;
  showBrandBadge: boolean;
  emailNotifications: boolean;
  productUpdates: boolean;
  weeklyDigest: boolean;
};

const DEFAULTS: Prefs = {
  displayName: "",
  email: "",
  workspace: "My Workspace",
  defaultFont: "Rubik",
  defaultPrimary: "#5B2EFF",
  defaultAccent: "#00E5A0",
  exportFormat: "rich",
  autoInlineStyles: true,
  showBrandBadge: false,
  emailNotifications: true,
  productUpdates: true,
  weeklyDigest: false,
};

function Settings() {
  const [p, setP] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setP({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    toast.success("Settings saved");
  }

  function update<K extends keyof Prefs>(k: K, v: Prefs[K]) {
    setP((prev) => ({ ...prev, [k]: v }));
  }

  function wipeSignatures() {
    if (!confirm("Delete every saved signature? This cannot be undone.")) return;
    localStorage.removeItem("signvel.signatures.v1");
    toast.success("All signatures deleted");
  }

  return (
    <div className="p-8 md:p-12 max-w-4xl">
      <div className="mb-10">
        <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
          (Settings)
        </span>
        <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight">Preferences</h1>
        <p className="text-sm text-muted-foreground mt-2">Configure your account, workspace defaults, and how signatures export.</p>
      </div>

      <Section title="Account">
        <Field label="Display name">
          <input className={input} value={p.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="Your name" />
        </Field>
        <Field label="Email">
          <input className={input} type="email" value={p.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" />
        </Field>
        <Field label="Workspace name">
          <input className={input} value={p.workspace} onChange={(e) => update("workspace", e.target.value)} />
        </Field>
      </Section>

      <Section title="Plan & billing">
        <PlanPanel />
      </Section>

      <Section title="Payments (owner only)">
        <PaymentsPanel />
      </Section>


      <Section title="Branding defaults">
        <Field label="Default font">
          <select className={input} value={p.defaultFont} onChange={(e) => update("defaultFont", e.target.value)}>
            {["Rubik", "Inter", "Inter Tight", "Roboto", "Open Sans", "Lato", "Poppins", "Montserrat", "Playfair Display"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Default primary color">
            <input type="color" className="h-10 w-full rounded-lg border border-border bg-white" value={p.defaultPrimary} onChange={(e) => update("defaultPrimary", e.target.value)} />
          </Field>
          <Field label="Default accent color">
            <input type="color" className="h-10 w-full rounded-lg border border-border bg-white" value={p.defaultAccent} onChange={(e) => update("defaultAccent", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Export">
        <Field label="Default export format">
          <select className={input} value={p.exportFormat} onChange={(e) => update("exportFormat", e.target.value as Prefs["exportFormat"])}>
            <option value="rich">Rich text (paste into Gmail / Apple Mail / Outlook Web)</option>
            <option value="html">HTML source</option>
            <option value="htm">.htm file (Outlook Windows)</option>
          </select>
        </Field>
        <Toggle label="Inline styles automatically on copy" checked={p.autoInlineStyles} onChange={(v) => update("autoInlineStyles", v)} />
        <Toggle label='Include "Made with Sign Vel" badge' checked={p.showBrandBadge} onChange={(v) => update("showBrandBadge", v)} />
      </Section>

      <Section title="Notifications">
        <Toggle label="Product emails" checked={p.emailNotifications} onChange={(v) => update("emailNotifications", v)} />
        <Toggle label="Feature announcements" checked={p.productUpdates} onChange={(v) => update("productUpdates", v)} />
        <Toggle label="Weekly signature analytics digest" checked={p.weeklyDigest} onChange={(v) => update("weeklyDigest", v)} />
      </Section>

      <Section title="Data" tone="danger">
        <p className="text-sm text-muted-foreground mb-3">
          Every signature you create is saved locally in your browser. You can wipe everything if you want a clean slate.
        </p>
        <button
          onClick={wipeSignatures}
          className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
        >
          Delete all signatures
        </button>
      </Section>

      <div className="flex justify-end sticky bottom-0 bg-background/80 backdrop-blur pt-4 pb-2">
        <Button onClick={save} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
          Save settings
        </Button>
      </div>
    </div>
  );
}

const input = "w-full px-3 py-2 rounded-lg bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

function PaymentsPanel() {
  const { links, save } = usePaymentLinks();
  const [draft, setDraft] = useState<PaymentLinks>(DEFAULT_PAYMENT_LINKS);

  useEffect(() => setDraft(links), [links]);

  const set = <K extends keyof PaymentLinks>(k: K, v: PaymentLinks[K]) =>
    setDraft((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Paste your Stripe Payment Link for each paid plan. Once saved, the pricing page sends buyers
        straight to Stripe Checkout instead of switching plans locally. Create and manage the links in
        your Stripe developer dashboard.
      </p>

      <a href={draft.dashboardUrl || STRIPE_DASHBOARD_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
        <Button size="sm" variant="outline" className="gap-2">
          Open Stripe payment links dashboard ↗
        </Button>
      </a>

      <Field label="Stripe dashboard URL">
        <input className={input} value={draft.dashboardUrl} onChange={(e) => set("dashboardUrl", e.target.value)} placeholder={STRIPE_DASHBOARD_URL} />
      </Field>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Starter — monthly link">
          <input className={input} value={draft.starterMonthly} onChange={(e) => set("starterMonthly", e.target.value)} placeholder="https://buy.stripe.com/..." />
        </Field>
        <Field label="Starter — yearly link">
          <input className={input} value={draft.starterYearly} onChange={(e) => set("starterYearly", e.target.value)} placeholder="https://buy.stripe.com/..." />
        </Field>
        <Field label="Growth — monthly link">
          <input className={input} value={draft.growthMonthly} onChange={(e) => set("growthMonthly", e.target.value)} placeholder="https://buy.stripe.com/..." />
        </Field>
        <Field label="Growth — yearly link">
          <input className={input} value={draft.growthYearly} onChange={(e) => set("growthYearly", e.target.value)} placeholder="https://buy.stripe.com/..." />
        </Field>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => {
            save(draft);
            toast.success("Payment links saved");
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Save payment links
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            save(DEFAULT_PAYMENT_LINKS);
            toast.success("Payment links cleared");
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

function PlanPanel() {

  const { planId, plan, trial, setPlan } = usePlan();
  const { list } = useSignatures();
  const limit = plan.signatureLimit;
  return (
    <div className="space-y-4">
      {trial.ready && (trial.onTrial || trial.expired) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            trial.expired ? "bg-destructive/10 text-destructive" : "bg-primary/5 text-foreground"
          }`}
        >
          {trial.expired
            ? "Your trial has expired — pick a paid plan to restore full access."
            : `Trial active · ${trial.daysLeft} day${trial.daysLeft === 1 ? "" : "s"} left (ends ${new Date(trial.endsAt).toLocaleDateString()}).`}
        </div>
      )}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium">
            Current plan: <span className="text-primary">{plan.name}</span> — {plan.tagline}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {list.length} of {limit === Infinity ? "unlimited" : limit} signature{limit === 1 ? "" : "s"} used
            {plan.trialDays ? ` · ${plan.trialDays}-day full-feature trial` : ""}
          </p>
        </div>
        <Link to="/pricing">
          <Button size="sm" variant="outline">Compare plans</Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {PLANS.map((pl) => (
          <button
            key={pl.id}
            type="button"
            onClick={() => {
              setPlan(pl.id);
              void recordPlanChange(pl.id, "monthly");
              toast.success(`Switched to the ${pl.name} plan`);
            }}

            className={`rounded-xl border px-3 py-3 text-left transition-colors ${
              planId === pl.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
          >
            <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">{pl.name}</p>
            <p className="text-sm font-semibold mt-0.5">
              {pl.monthly === null ? "Custom" : pl.monthly === 0 ? "Free" : `$${pl.monthly.toFixed(2)}/mo`}
            </p>
            <p className="text-[11px] text-muted-foreground">{pl.tagline}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "danger" }) {
  return (
    <section className={`mb-6 rounded-xl bg-white ring-1 p-6 ${tone === "danger" ? "ring-destructive/20" : "ring-black/5"}`}>
      <h2 className="font-[Inter_Tight] font-bold tracking-tight mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span className="text-sm min-w-0 flex-1">{label}</span>
      <button
        type="button"
        role="switch"
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-[38px] h-[22px] rounded-full transition-colors ${checked ? "bg-primary" : "bg-[#E4E4EE]"}`}
        aria-checked={checked}
        aria-label={label}
      >
        <span className={`absolute top-[2px] left-[2px] size-[18px] bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </label>
  );
}

