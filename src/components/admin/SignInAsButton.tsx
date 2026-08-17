import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { createImpersonationToken } from "@/lib/impersonate.functions";

/**
 * Admin-only "Sign in as". Swaps the current browser session for the customer's
 * own session, so everything the customer sees is exactly what they'd see.
 * The admin is signed out of their own account and signs back in afterwards.
 */
export function SignInAsButton({
  userId,
  label = "Sign in as customer",
  className,
  size = "sm",
  disabled,
}: {
  userId: string;
  label?: string;
  className?: string;
  size?: "sm" | "default";
  disabled?: boolean;
}) {
  const mintToken = useServerFn(createImpersonationToken);
  const [busy, setBusy] = useState(false);

  async function signInAs() {
    const ok = window.confirm(
      "Sign in as this customer?\n\nYou will be signed out of your own admin account and see the app exactly as they do. Sign out to return to your own account.",
    );
    if (!ok) return;

    setBusy(true);
    try {
      const { email, tokenHash } = await mintToken({ data: { userId } });
      await supabase.auth.signOut();
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
      if (error) throw error;
      toast.success(`Signed in as ${email}`);
      window.location.assign("/app");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in as this customer");
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      size={size}
      variant="outline"
      className={className}
      disabled={busy || disabled}
      onClick={() => void signInAs()}
    >
      {busy ? "Signing in…" : label}
    </Button>
  );
}
