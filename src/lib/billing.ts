import { supabase } from "@/integrations/supabase/client";
import { getPlan, type PlanId } from "@/lib/plan";

/**
 * Records a plan change for the signed-in user so the owner dashboard can report
 * revenue, active subscriptions and purchases. Silently no-ops when signed out.
 */
export async function recordPlanChange(planId: PlanId, interval: "monthly" | "yearly" = "monthly") {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return;

  const plan = getPlan(planId);
  const price = interval === "yearly" ? plan.yearly : plan.monthly;
  const amountCents = Math.round((price ?? 0) * 100);
  const paid = planId !== "free" && amountCents > 0;
  const periodDays = interval === "yearly" ? 365 : 30;

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const row = {
    user_id: user.id,
    plan_id: planId,
    plan_name: plan.name,
    billing_interval: interval,
    status: paid ? "active" : "trialing",
    amount_cents: amountCents,
    current_period_end: new Date(Date.now() + periodDays * 86_400_000).toISOString(),
    canceled_at: null,
  };

  if (existing) {
    await supabase.from("subscriptions").update(row).eq("id", existing.id);
  } else {
    await supabase.from("subscriptions").insert(row);
  }

  if (paid) {
    await supabase.from("purchases").insert({
      user_id: user.id,
      plan_id: planId,
      plan_name: plan.name,
      billing_interval: interval,
      amount_cents: amountCents,
      status: "paid",
    });
  }
}
