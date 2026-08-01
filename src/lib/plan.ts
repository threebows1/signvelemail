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

/** Client-only plan hook — returns "free" during SSR to keep hydration stable. */
export function usePlan() {
  const [planId, setPlanId] = useState<PlanId>("free");

  useEffect(() => {
    const sync = () => setPlanId(readPlanId());
    sync();
    window.addEventListener("signvel:plan", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("signvel:plan", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { planId, plan: getPlan(planId), setPlan: (id: PlanId) => { writePlanId(id); setPlanId(id); } };
}
