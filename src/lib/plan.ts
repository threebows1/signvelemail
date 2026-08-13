import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";


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
export const PLAN_EVENT = "signvel:plan";

let channel: BroadcastChannel | null = null;
function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(PLAN_EVENT);
  return channel;
}

/** Tell every listener (this tab and any other open tab) to re-read the plan now. */
export function refreshPlan() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PLAN_EVENT));
  getChannel()?.postMessage("sync");
}

export function readPlanId(): PlanId {
  if (typeof window === "undefined") return "free";
  const raw = window.localStorage.getItem(KEY);
  if (raw === "free" || raw === "starter" || raw === "growth" || raw === "custom") return raw;
  return "free";
}

export function writePlanId(id: PlanId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, id);
  // A paid plan hides the trial banner outright — clear the per-session dismissal too.
  if (id !== "free") window.sessionStorage.removeItem("signvel:trialBannerDismissed:v1");
  refreshPlan();
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
  refreshPlan();
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
  const [serverPlan, setServerPlan] = useState<PlanId | null>(null);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const sync = () => {
      setPlanId(readPlanId());
      setTrialStart(readTrialStart());
    };
    sync();
    const onVisible = () => { if (!document.hidden) sync(); };
    const ch = getChannel();
    ch?.addEventListener("message", sync);
    window.addEventListener(PLAN_EVENT, sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", onVisible);
    const t = window.setInterval(sync, 15_000);
    return () => {
      window.clearInterval(t);
      ch?.removeEventListener("message", sync);
      window.removeEventListener(PLAN_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Real entitlement lives in the database: subscription row + staff roles.
  useEffect(() => {
    let cancelled = false;

    async function loadFromDb() {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;
      if (!user) {
        if (!cancelled) { setServerPlan(null); setIsStaff(false); }
        return;
      }
      const [{ data: roles }, { data: sub }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase
          .from("subscriptions")
          .select("plan_id, status, current_period_end")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;

      const staff = (roles ?? []).some((r) => r.role === "admin" || r.role === "manager");
      setIsStaff(staff);

      const active =
        sub &&
        ["active", "trial", "trialing", "complimentary", "past_due"].includes(sub.status) &&
        (!sub.current_period_end || new Date(sub.current_period_end).getTime() > Date.now());
      const id = active ? (sub!.plan_id as PlanId) : null;
      setServerPlan(id && PLANS.some((p) => p.id === id) ? id : null);
    }

    void loadFromDb();
    const { data } = supabase.auth.onAuthStateChange(() => void loadFromDb());
    const onSync = () => void loadFromDb();
    window.addEventListener(PLAN_EVENT, onSync);
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
      window.removeEventListener(PLAN_EVENT, onSync);
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

