import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, usePlan } from "@/lib/plan";

const DISMISS_KEY = "signvel:trialBannerDismissed:v1";

/** Sticky reminder shown while the free trial is still running. */
export function TrialBanner() {
  const { trial, plan, planId } = usePlan();
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  useEffect(() => {
    setDismissedFor(window.sessionStorage.getItem(DISMISS_KEY));
  }, []);

  if (!trial.ready || !trial.onTrial) return null;

  const key = String(trial.daysLeft);
  if (dismissedFor === key) return null;

  const urgent = trial.daysLeft <= 3;

  return (
    <div
      className={`flex items-center gap-3 px-6 py-2.5 text-sm border-b ${
        urgent ? "bg-destructive/10 border-destructive/20" : "bg-primary/5 border-primary/15"
      }`}
    >
      <Clock className={`size-4 shrink-0 ${urgent ? "text-destructive" : "text-primary"}`} />
      <p className="min-w-0 flex-1">
        <span className="font-medium">
          {trial.daysLeft <= 1
            ? `Your ${plan.name} trial ends in ${trial.hoursLeft} hour${trial.hoursLeft === 1 ? "" : "s"}.`
            : `${trial.daysLeft} days left in your ${plan.name} trial.`}
        </span>{" "}
        <span className="text-muted-foreground">
          Upgrade now to keep your signatures editable and exportable.
        </span>
      </p>
      <Link to="/pricing" className="shrink-0">
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-8">
          Upgrade
        </Button>
      </Link>
      <button
        type="button"
        aria-label="Dismiss trial reminder"
        onClick={() => {
          window.sessionStorage.setItem(DISMISS_KEY, key);
          setDismissedFor(key);
        }}
        className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <span className="sr-only">Current plan: {planId}</span>
    </div>
  );
}

/** Blocks the workspace once the trial has expired on a free plan. */
export function TrialGuard({ children }: { children: React.ReactNode }) {
  const { trial, plan } = usePlan();

  if (!trial.ready || !trial.expired) return <>{children}</>;

  const paid = PLANS.filter((p) => p.id !== "free");

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full bg-white ring-1 ring-black/5 rounded-2xl p-8 text-center">
        <div className="size-14 mx-auto rounded-2xl bg-foreground text-background flex items-center justify-center mb-5">
          <Lock className="size-7" strokeWidth={2.5} />
        </div>
        <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
          (Trial ended)
        </span>
        <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight">
          Your {plan.trialDays}-day trial has expired
        </h1>
        <p className="text-sm text-muted-foreground mt-3">
          Your signatures are safe. Choose a plan to unlock the editor, templates, and exports again.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7 text-left">
          {paid.map((p) => (
            <div key={p.id} className="rounded-xl border border-border p-4">
              <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">
                {p.name}
              </p>
              <p className="text-lg font-semibold mt-0.5">
                {p.monthly === null ? "Custom" : `$${p.monthly.toFixed(2)}/mo`}
              </p>
              <p className="text-[11px] text-muted-foreground">{p.tagline}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
          <Link to="/pricing">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
              See plans & upgrade
            </Button>
          </Link>
          <Link to="/app/settings">
            <Button variant="outline">Manage plan in settings</Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              refreshPlan();
              toast.success("Checked your plan", {
                description: "If your upgrade went through, access is restored instantly.",
              });
            }}
          >
            Already upgraded? Re-check
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-4">
          Upgrades apply immediately — no refresh or sign-out needed.
        </p>

      </div>
    </div>
  );
}
