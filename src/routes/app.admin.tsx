import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/app/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Sign Vel" },
      { name: "description", content: "Owner dashboard: monitor signups, active subscriptions, revenue and grant full access to teammates." },
      { property: "og:title", content: "Sign Vel Admin" },
      { property: "og:description", content: "Monitor users, subscriptions and revenue, and manage who has full access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Profile = { id: string; email: string | null; full_name: string | null; created_at: string };
type RoleRow = { user_id: string; role: AppRole };
type Sub = {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  billing_interval: string;
  status: string;
  amount_cents: number;
  current_period_end: string | null;
  created_at: string;
};
type Purchase = {
  id: string;
  user_id: string;
  plan_name: string;
  billing_interval: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
};

const DAY = 86_400_000;
const money = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function AdminPage() {
  const { ready, user, isAdmin, isStaff } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [subs, setSubs] = useState<Sub[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [p, r, s, pu] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
      supabase.from("purchases").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setProfiles((p.data ?? []) as Profile[]);
    setRoles((r.data ?? []) as RoleRow[]);
    setSubs((s.data ?? []) as Sub[]);
    setPurchases((pu.data ?? []) as Purchase[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ready && isStaff) void load();
  }, [ready, isStaff, load]);

  const stats = useMemo(() => {
    const now = Date.now();
    const active = subs.filter((s) => s.status === "active");
    const trialing = subs.filter((s) => s.status === "trialing");
    const mrr = active.reduce((sum, s) => sum + (s.billing_interval === "yearly" ? s.amount_cents / 12 : s.amount_cents), 0);
    const revenue30 = purchases
      .filter((x) => x.status === "paid" && now - new Date(x.created_at).getTime() < 30 * DAY)
      .reduce((sum, x) => sum + x.amount_cents, 0);
    const revenueAll = purchases.filter((x) => x.status === "paid").reduce((sum, x) => sum + x.amount_cents, 0);
    const new7 = profiles.filter((x) => now - new Date(x.created_at).getTime() < 7 * DAY).length;
    const conversion = profiles.length ? Math.round((active.length / profiles.length) * 100) : 0;
    return { active: active.length, trialing: trialing.length, mrr, revenue30, revenueAll, new7, conversion };
  }, [subs, purchases, profiles]);

  const rolesByUser = useMemo(() => {
    const map = new Map<string, AppRole[]>();
    for (const r of roles) map.set(r.user_id, [...(map.get(r.user_id) ?? []), r.role]);
    return map;
  }, [roles]);

  const subByUser = useMemo(() => {
    const map = new Map<string, Sub>();
    for (const s of subs) if (!map.has(s.user_id)) map.set(s.user_id, s);
    return map;
  }, [subs]);

  const emailById = useMemo(() => new Map(profiles.map((p) => [p.id, p.email ?? p.id.slice(0, 8)])), [profiles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => (p.email ?? "").toLowerCase().includes(q) || (p.full_name ?? "").toLowerCase().includes(q));
  }, [profiles, query]);

  async function toggleRole(userId: string, role: Exclude<AppRole, "user">) {
    if (!isAdmin) return;
    const has = (rolesByUser.get(userId) ?? []).includes(role);
    if (has && userId === user?.id && role === "admin") {
      toast.error("You can't remove your own admin access");
      return;
    }
    const res = has
      ? await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role)
      : await supabase.from("user_roles").insert({ user_id: userId, role });
    if (res.error) {
      toast.error(res.error.message);
      return;
    }
    toast.success(has ? `${role} access removed` : `${role} access granted`);
    void load();
  }

  if (!ready) {
    return <Shell><p className="text-sm text-muted-foreground">Checking your access…</p></Shell>;
  }

  if (!user) {
    return (
      <Shell>
        <Gate title="Sign in required" body="Admin tools are only available to signed-in owners and managers.">
          <Link to="/login" search={{ next: "/app/admin" }}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign in</Button>
          </Link>
        </Gate>
      </Shell>
    );
  }

  if (!isStaff) {
    return (
      <Shell>
        <Gate
          title="You don't have admin access"
          body="Ask an owner to grant you admin or manager access from this page. Your account is signed in as a standard user."
        >
          <Link to="/app"><Button variant="outline">Back to dashboard</Button></Link>
        </Gate>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
            (Admin)
          </span>
          <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight">Owner dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Live view of signups, subscriptions and revenue — plus who has full access.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Stat label="Total accounts" value={String(profiles.length)} sub={`${stats.new7} new in 7 days`} />
        <Stat label="Active subscriptions" value={String(stats.active)} sub={`${stats.trialing} on trial`} accent />
        <Stat label="MRR" value={money(stats.mrr)} sub="Normalised monthly" />
        <Stat label="Revenue (30 days)" value={money(stats.revenue30)} sub={`${money(stats.revenueAll)} lifetime`} />
      </div>

      <Panel title="Plan breakdown">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["free", "starter", "growth", "custom"].map((planId) => {
            const rows = subs.filter((s) => s.plan_id === planId);
            return (
              <div key={planId} className="rounded-xl border border-border px-3 py-3">
                <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">{planId}</p>
                <p className="text-xl font-[Inter_Tight] font-bold">{rows.length}</p>
                <p className="text-[11px] text-muted-foreground">
                  {rows.filter((r) => r.status === "active").length} active
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Conversion to a paid plan: {stats.conversion}%</p>
      </Panel>

      <Panel title="Recent purchases">
        {purchases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No purchases recorded yet. New checkouts appear here automatically.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <Th>Customer</Th><Th>Plan</Th><Th>Billing</Th><Th>Amount</Th><Th>Status</Th><Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice(0, 25).map((x) => (
                  <tr key={x.id} className="border-t border-border">
                    <Td>{emailById.get(x.user_id) ?? "—"}</Td>
                    <Td>{x.plan_name}</Td>
                    <Td className="capitalize">{x.billing_interval}</Td>
                    <Td>{money(x.amount_cents)}</Td>
                    <Td><Badge tone={x.status === "paid" ? "good" : "muted"}>{x.status}</Badge></Td>
                    <Td>{new Date(x.created_at).toLocaleDateString()}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="People & access">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="w-full sm:w-72 px-3 py-2 rounded-lg bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {!isAdmin && (
            <p className="text-xs text-muted-foreground">Manager view — only admins can change access.</p>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No accounts match that search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <Th>Person</Th><Th>Plan</Th><Th>Status</Th><Th>Joined</Th><Th>Access</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const userRoles = rolesByUser.get(p.id) ?? [];
                  const sub = subByUser.get(p.id);
                  return (
                    <tr key={p.id} className="border-t border-border">
                      <Td>
                        <span className="font-medium">{p.full_name || p.email || p.id.slice(0, 8)}</span>
                        {p.full_name && p.email && (
                          <span className="block text-xs text-muted-foreground">{p.email}</span>
                        )}
                      </Td>
                      <Td>{sub?.plan_name ?? "Free"}</Td>
                      <Td><Badge tone={sub?.status === "active" ? "good" : "muted"}>{sub?.status ?? "trialing"}</Badge></Td>
                      <Td>{new Date(p.created_at).toLocaleDateString()}</Td>
                      <Td>
                        <div className="flex gap-2">
                          {(["admin", "manager"] as const).map((role) => {
                            const on = userRoles.includes(role);
                            return (
                              <button
                                key={role}
                                type="button"
                                disabled={!isAdmin}
                                onClick={() => void toggleRole(p.id, role)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                  on
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {on ? `${role} ✓` : `Make ${role}`}
                              </button>
                            );
                          })}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          Admins get full access, including granting or revoking access for others. Managers can monitor everything but
          cannot change access.
        </p>
      </Panel>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="p-8 md:p-12 max-w-6xl">{children}</div>;
}

function Gate({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 p-10 max-w-lg">
      <h1 className="text-2xl font-[Inter_Tight] font-bold tracking-tight mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground mb-6">{body}</p>
      {children}
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ring-1 ${accent ? "bg-primary/5 ring-primary/20" : "bg-white ring-black/5"}`}>
      <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-[Inter_Tight] font-bold tracking-tight mt-1">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-xl bg-white ring-1 ring-black/5 p-6">
      <h2 className="font-[Inter_Tight] font-bold tracking-tight mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground pb-2 pr-4 font-medium">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-2.5 pr-4 align-top ${className}`}>{children}</td>;
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "good" | "muted" }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
        tone === "good" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}
