import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  organization_name: string | null;
  account_status: string;
  suspended_at: string | null;
  last_active_at: string | null;
  created_at: string;
};

export type RoleRow = { user_id: string; role: AppRole };

export type Sub = {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  billing_interval: string;
  status: string;
  amount_cents: number;
  trial_ends_at: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  stripe_reference: string | null;
  created_at: string;
};

export type Purchase = {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  billing_interval: string;
  amount_cents: number;
  currency: string;
  status: string;
  stripe_reference: string | null;
  created_at: string;
};

export type Comp = {
  id: string;
  user_id: string;
  email: string | null;
  plan_id: string;
  plan_name: string;
  duration: string;
  expires_at: string | null;
  note: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type PlanRow = {
  id: string;
  name: string;
  tagline: string;
  monthly_cents: number;
  yearly_cents: number;
  signature_limit: number;
  employee_limit: number;
  trial_days: number;
  features: Record<string, boolean>;
  is_active: boolean;
  sort_order: number;
};

export type Settings = {
  id: string;
  product_name: string;
  support_email: string | null;
  default_trial_days: number;
  signups_enabled: boolean;
  maintenance_mode: boolean;
  announcement: string | null;
};

export type AdminData = {
  profiles: Profile[];
  roles: RoleRow[];
  subs: Sub[];
  purchases: Purchase[];
  comps: Comp[];
  plans: PlanRow[];
  settings: Settings | null;
  signatureCounts: Map<string, number>;
};

const EMPTY: AdminData = {
  profiles: [],
  roles: [],
  subs: [],
  purchases: [],
  comps: [],
  plans: [],
  settings: null,
  signatureCounts: new Map(),
};

export function useAdminData(enabled: boolean) {
  const [data, setData] = useState<AdminData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, r, s, pu, c, pl, st, sig] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("purchases").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("complimentary_access").select("*").order("created_at", { ascending: false }),
      supabase.from("plans").select("*").order("sort_order"),
      supabase.from("app_settings").select("*").eq("id", "global").maybeSingle(),
      supabase.from("signatures").select("user_id"),
    ]);

    const counts = new Map<string, number>();
    for (const row of (sig.data ?? []) as { user_id: string }[]) {
      counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
    }

    setData({
      profiles: (p.data ?? []) as Profile[],
      roles: (r.data ?? []) as RoleRow[],
      subs: (s.data ?? []) as Sub[],
      purchases: (pu.data ?? []) as Purchase[],
      comps: (c.data ?? []) as Comp[],
      plans: ((pl.data ?? []) as unknown as PlanRow[]),
      settings: (st.data ?? null) as Settings | null,
      signatureCounts: counts,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (enabled) void load();
  }, [enabled, load]);

  return { ...data, loading, reload: load };
}

const DAY = 86_400_000;

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const shortDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

/** Upsert a subscription row for a customer. */
export async function upsertSubscription(userId: string, patch: Partial<Sub>, existing?: Sub) {
  if (existing) {
    return supabase.from("subscriptions").update(patch as never).eq("id", existing.id);
  }
  return supabase.from("subscriptions").insert({ user_id: userId, ...patch } as never);
}

export async function changePlan(
  userId: string,
  plan: PlanRow,
  interval: "monthly" | "yearly",
  existing?: Sub,
) {
  const amount = interval === "yearly" ? plan.yearly_cents : plan.monthly_cents;
  const days = interval === "yearly" ? 365 : 30;
  return upsertSubscription(
    userId,
    {
      plan_id: plan.id,
      plan_name: plan.name,
      billing_interval: interval,
      amount_cents: amount,
      status: amount > 0 ? "active" : "trial",
      current_period_end: new Date(Date.now() + days * DAY).toISOString(),
      canceled_at: null,
    },
    existing,
  );
}

export const COMP_DURATIONS = [
  { id: "30d", label: "30 days", days: 30 },
  { id: "3m", label: "3 months", days: 90 },
  { id: "1y", label: "1 year", days: 365 },
  { id: "lifetime", label: "Lifetime", days: null },
] as const;

export async function grantComplimentary(
  profile: Profile,
  plan: PlanRow,
  duration: (typeof COMP_DURATIONS)[number],
  note: string,
  existing?: Sub,
) {
  const expiresAt = duration.days ? new Date(Date.now() + duration.days * DAY).toISOString() : null;

  const { data: authData } = await supabase.auth.getUser();

  const grant = await supabase.from("complimentary_access").insert({
    user_id: profile.id,
    email: profile.email,
    plan_id: plan.id,
    plan_name: plan.name,
    duration: duration.id,
    expires_at: expiresAt,
    note: note || null,
    granted_by: authData.user?.id ?? null,
  } as never);
  if (grant.error) return grant;

  // Complimentary access never touches billing: amount stays zero so nobody is charged.
  return upsertSubscription(
    profile.id,
    {
      plan_id: plan.id,
      plan_name: plan.name,
      billing_interval: duration.id === "lifetime" ? "yearly" : "monthly",
      status: "complimentary",
      amount_cents: 0,
      current_period_end: expiresAt,
      canceled_at: null,
      stripe_reference: null,
    },
    existing,
  );
}

export async function extendTrial(userId: string, days: number, existing?: Sub) {
  const base = existing?.trial_ends_at ? new Date(existing.trial_ends_at).getTime() : Date.now();
  const from = Math.max(base, Date.now());
  const until = new Date(from + days * DAY).toISOString();
  return upsertSubscription(
    userId,
    { status: "trial", trial_ends_at: until, current_period_end: until, canceled_at: null },
    existing,
  );
}

export async function cancelAccess(userId: string, existing?: Sub) {
  return upsertSubscription(
    userId,
    { status: "cancelled", canceled_at: new Date().toISOString() },
    existing,
  );
}

export async function setAccountStatus(userId: string, status: "active" | "suspended") {
  return supabase
    .from("profiles")
    .update({ account_status: status, suspended_at: status === "suspended" ? new Date().toISOString() : null } as never)
    .eq("id", userId);
}
