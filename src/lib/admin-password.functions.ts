import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Admin-only password change for a customer account. The caller's admin role is
 * verified server-side; the client route guard is never trusted.
 */
export const setCustomerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; password: string }) => {
    if (!input?.userId || typeof input.userId !== "string") throw new Error("userId is required");
    if (!input?.password || input.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    return { userId: input.userId, password: input.password };
  })
  .handler(async ({ data, context }) => {
    const { data: adminRow, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleError) throw new Error(roleError.message);
    if (!adminRow) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: updated, error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);

    return { email: updated?.user?.email ?? null };
  });

/** Admin-only: email the customer a password reset link instead of setting one. */
export const sendCustomerPasswordReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; redirectTo: string }) => {
    if (!input?.userId || typeof input.userId !== "string") throw new Error("userId is required");
    return { userId: input.userId, redirectTo: input.redirectTo };
  })
  .handler(async ({ data, context }) => {
    const { data: adminRow, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleError) throw new Error(roleError.message);
    if (!adminRow) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: target, error: targetError } = await supabaseAdmin.auth.admin.getUserById(data.userId);
    if (targetError || !target?.user?.email) throw new Error("That customer has no email address");

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(target.user.email, {
      redirectTo: data.redirectTo,
    });
    if (error) throw new Error(error.message);

    return { email: target.user.email };
  });
