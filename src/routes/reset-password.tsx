import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — Sign Vel" },
      { name: "description", content: "Choose a new password for your Sign Vel account." },
      { property: "og:title", content: "Reset Password — Sign Vel" },
      { property: "og:description", content: "Choose a new password for your Sign Vel account." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated — you're signed in.");
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link to="/" aria-label="Sign Vel home">
          <Logo size={44} wordmarkClassName="text-lg" />
        </Link>
        <Link to="/login" search={{ next: undefined }}>
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm bg-white ring-1 ring-black/5 p-10 rounded-2xl shadow-xl">
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-3">
            Recovery
          </span>
          <h1 className="text-2xl font-bold tracking-tight mb-6">Set a new password</h1>

          {!ready ? (
            <p className="text-sm text-muted-foreground">
              Open this page from the password reset link in your email, then choose a new password here.
            </p>
          ) : (
            <form className="space-y-5" onSubmit={submit}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-[JetBrains_Mono] text-muted-foreground uppercase">
                  New password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-border px-3 py-2 text-sm rounded focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-foreground text-background font-semibold text-sm rounded-lg hover:bg-foreground/90"
              >
                {busy ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
