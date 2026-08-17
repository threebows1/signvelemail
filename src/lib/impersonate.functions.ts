import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Admin-only "sign in as" — mints a one-time magic-link token for the target
 * user so the browser can swap its session. The caller's admin role is verified
 * server-side; the client route guard is not trusted.
 */
export const createImpersonationToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => {
    if (!input?.userId || typeof input.userId !== "string") throw new Error("userId is required");
    return { userId: input.userId };
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
    if (targetError || !target?.user?.email) throw new Error("That customer has no email address to sign in with");

    const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: target.user.email,
    });
    if (linkError || !link?.properties?.hashed_token) {
      throw new Error(linkError?.message ?? "Could not create a sign-in link");
    }

    return { email: target.user.email, tokenHash: link.properties.hashed_token };
  });
