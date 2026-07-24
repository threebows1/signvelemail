import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { oauthApi } from "@/lib/oauth-authorization";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/login", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = (data as any)?.redirect_url ?? (data as any)?.redirect_to;
    if (immediate && !(data as any)?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold mb-2">Authorization request failed</h1>
        <p className="text-sm text-muted-foreground">{String((error as Error)?.message ?? error)}</p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error } = approve
      ? await oauthApi.approveAuthorization(authorization_id)
      : await oauthApi.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = (data as any)?.redirect_url ?? (data as any)?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = (details as any)?.client?.name ?? "the connecting app";

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md bg-white ring-1 ring-black/5 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Logo size={36} />
          <span className="font-bold text-lg tracking-tight">Sign Vel</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Connect {clientName}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {clientName} wants to use Sign Vel as you. This lets it read and manage your email signatures on your behalf.
        </p>

        {error && (
          <p role="alert" className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Deny
          </Button>
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" disabled={busy} onClick={() => decide(true)}>
            Approve
          </Button>
        </div>
      </div>
    </main>
  );
}
