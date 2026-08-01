import { useEffect, useState } from "react";

export type PlanId = "free" | "starter" | "growth" | "custom";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  audience: string;
  monthly: number | null;
  yearly: number | null;
  signatureLimit: number;
  trialDays?: number;
  highlight?: boolean;
  cta: string;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "1 signature",
    audience: "Try it out, no card needed",
    monthly: 0,
    yearly: 0,
    signatureLimit: 1,
    trialDays: 7,
    cta: "Start free",
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "10 signatures",
    audience: "Freelancers & small teams",
    monthly: 4.99,
    yearly: 47.9,
    signatureLimit: 10,
    highlight: true,
    cta: "Choose Starter",
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "30 signatures",
    audience: "Growing companies",
    monthly: 20,
    yearly: 192,
    signatureLimit: 30,
    cta: "Choose Growth",
  },
  {
    id: "custom",
    name: "Custom",
    tagline: "Unlimited signatures",
    audience: "Agencies & enterprise",
    monthly: null,
    yearly: null,
    signatureLimit: Infinity,
    cta: "Contact us",
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

const KEY = "signvel:plan:v1";

export function readPlanId(): PlanId {
  if (typeof window === "undefined") return "free";
  const raw = window.localStorage.getItem(KEY);
  if (raw === "free" || raw === "starter" || raw === "growth" || raw === "custom") return raw;
  return "free";
}

export function writePlanId(id: PlanId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event("signvel:plan"));
}

const TRIAL_KEY = "signvel:trialStart:v1";
const DAY = 86_400_000;

/** Trial starts the first time the app is opened on this browser. */
export function readTrialStart(): number {
  if (typeof window === "undefined") return Date.now();
  const raw = window.localStorage.getItem(TRIAL_KEY);
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  const now = Date.now();
  window.localStorage.setItem(TRIAL_KEY, String(now));
  return now;
}

export function restartTrial() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TRIAL_KEY, String(Date.now()));
  window.dispatchEvent(new Event("signvel:plan"));
}

export type TrialState = {
  ready: boolean;
  onTrial: boolean;
  daysLeft: number;
  hoursLeft: number;
  expired: boolean;
  endsAt: number;
};

/** Client-only plan hook — returns "free" during SSR to keep hydration stable. */
export function usePlan() {
  const [planId, setPlanId] = useState<PlanId>("free");
  const [trialStart, setTrialStart] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setPlanId(readPlanId());
      setTrialStart(readTrialStart());
    };
    sync();
    window.addEventListener("signvel:plan", sync);
    window.addEventListener("storage", sync);
    const t = window.setInterval(sync, 60_000);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("signvel:plan", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const plan = getPlan(planId);
  const trialDays = plan.trialDays ?? 0;
  const isPaid = planId !== "free";
  const endsAt = (trialStart ?? Date.now()) + trialDays * DAY;
  const msLeft = endsAt - Date.now();
  const ready = trialStart !== null;

  const trial: TrialState = {
    ready,
    onTrial: ready && !isPaid && trialDays > 0 && msLeft > 0,
    daysLeft: Math.max(0, Math.ceil(msLeft / DAY)),
    hoursLeft: Math.max(0, Math.ceil(msLeft / 3_600_000)),
    expired: ready && !isPaid && trialDays > 0 && msLeft <= 0,
    endsAt,
  };

  return {
    planId,
    plan,
    trial,
    setPlan: (id: PlanId) => { writePlanId(id); setPlanId(id); },
  };
}

