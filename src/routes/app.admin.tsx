import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SignInAsButton } from "@/components/admin/SignInAsButton";
import { CustomerSignatures } from "@/components/admin/CustomerSignatures";
import { SetPasswordButton } from "@/components/admin/SetPasswordButton";

import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/lib/auth";
import { can, ROLE_SUMMARY } from "@/lib/permissions";
import {
  COMP_DURATIONS,
  cancelAccess,
  changePlan,
  extendTrial,
  grantComplimentary,
  money,
  setAccountStatus,
  shortDate,
  useAdminData,
  type Comp,
  type PlanRow,
  type Profile,
  type Sub,
} from "@/lib/admin-data";

export const Route = createFileRoute("/app/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Sign Vel" },
      { name: "description", content: "Owner panel: customers, subscriptions, sales, plans and complimentary access." },
      { property: "og:title", content: "Sign Vel Admin" },
      { property: "og:description", content: "Monitor users, subscriptions and revenue, and manage customer access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const DAY = 86_400_000;
const SECTIONS = ["Dashboard", "Customers", "Subscriptions", "Sales", "Plans", "Settings"] as const;
type Section = (typeof SECTIONS)[number];

const STATUS_LABEL: Record<string, string> = {
  trialing: "Trial",
  trial: "Trial",
  active: "Active",
  past_due: "Past due",
  cancelled: "Cancelled",
  canceled: "Cancelled",
  complimentary: "Complimentary",
};

function AdminPage() {
  const { ready, user, roles, isAdmin, isStaff } = useAuth();
  const data = useAdminData(ready && isStaff);
  const [section, setSection] = useState<Section>("Dashboard");
  const [openCustomer, setOpenCustomer] = useState<string | null>(null);

  const canManageCustomers = can(roles, "customers.manage");
  const canManagePlans = can(roles, "plans.manage");

  const subByUser = useMemo(() => {
    const map = new Map<string, Sub>();
    for (const s of data.subs) if (!map.has(s.user_id)) map.set(s.user_id, s);
    return map;
  }, [data.subs]);

  const compByUser = useMemo(() => {
    const map = new Map<string, Comp>();
    for (const c of data.comps) if (!c.revoked_at && !map.has(c.user_id)) map.set(c.user_id, c);
    return map;
  }, [data.comps]);

  const rolesByUser = useMemo(() => {
    const map = new Map<string, AppRole[]>();
    for (const r of data.roles) map.set(r.user_id, [...(map.get(r.user_id) ?? []), r.role]);
    return map;
  }, [data.roles]);

  const profileById = useMemo(() => new Map(data.profiles.map((p) => [p.id, p])), [data.profiles]);
  const nameOf = (id: string) => {
    const p = profileById.get(id);
    return p?.email ?? p?.full_name ?? id.slice(0, 8);
  };

  if (!ready) return <Shell><p className="text-sm text-muted-foreground">Checking your access…</p></Shell>;

  if (!user) {
    return (
      <Shell>
        <Gate title="Sign in required" body="The owner panel is only available to signed-in admins and managers.">
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
          body="Ask an owner to grant you admin or manager access. Your account is signed in as a standard user."
        >
          <Link to="/app"><Button variant="outline">Back to dashboard</Button></Link>
        </Gate>
      </Shell>
    );
  }

  const selected = openCustomer ? profileById.get(openCustomer) ?? null : null;

  return (
    <Shell>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <span className="font-[JetBrains_Mono] text-[10px] uppercase tracking-[0.2em] text-primary font-medium block mb-2">
            (Admin)
          </span>
          <h1 className="text-3xl font-[Inter_Tight] font-bold tracking-tight">Owner panel</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isAdmin
              ? "Full workspace control — customers, subscriptions, sales, plans and settings."
              : "Manager view — you can monitor customers and reassign signatures, but not change billing or roles."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void data.reload()} disabled={data.loading}>
          {data.loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <nav className="flex gap-1 flex-wrap border-b border-border mb-8">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSection(s)}
            className={`px-3.5 py-2 text-sm rounded-t-lg -mb-px border-b-2 transition-colors ${
              section === s
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </nav>

      {section === "Dashboard" && (
        <DashboardSection data={data} subByUser={subByUser} compByUser={compByUser} nameOf={nameOf} onOpen={(id) => { setOpenCustomer(id); setSection("Customers"); }} />
      )}

      {section === "Customers" && (
        <CustomersSection
          data={data}
          subByUser={subByUser}
          compByUser={compByUser}
          rolesByUser={rolesByUser}
          selected={selected}
          onOpen={setOpenCustomer}
          canManage={canManageCustomers}
          canManageRoles={can(roles, "roles.manage")}
          currentUserId={user.id}
        />
      )}

      {section === "Subscriptions" && <SubscriptionsSection subs={data.subs} nameOf={nameOf} />}

      {section === "Sales" && <SalesSection purchases={data.purchases} nameOf={nameOf} />}

      {section === "Plans" && <PlansSection plans={data.plans} canManage={canManagePlans} reload={data.reload} />}

      {section === "Settings" && <SettingsSection settings={data.settings} canManage={can(roles, "settings.manage")} reload={data.reload} />}
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

function DashboardSection({
  data,
  subByUser,
  compByUser,
  nameOf,
  onOpen,
}: {
  data: ReturnType<typeof useAdminData>;
  subByUser: Map<string, Sub>;
  compByUser: Map<string, Comp>;
  nameOf: (id: string) => string;
  onOpen: (id: string) => void;
}) {
  const now = Date.now();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newThisMonth = data.profiles.filter((p) => new Date(p.created_at) >= startOfMonth).length;
  const trials = data.subs.filter((s) => s.status === "trial" || s.status === "trialing").length;
  const paid = data.subs.filter((s) => s.status === "active" && s.amount_cents > 0).length;
  const comps = compByUser.size;
  const monthlyRevenue = data.purchases
    .filter((x) => x.status === "paid" && new Date(x.created_at) >= startOfMonth)
    .reduce((n, x) => n + x.amount_cents, 0);
  const totalRevenue = data.purchases.filter((x) => x.status === "paid").reduce((n, x) => n + x.amount_cents, 0);

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Total users" value={String(data.profiles.length)} />
        <Stat label="New this month" value={String(newThisMonth)} />
        <Stat label="Active trials" value={String(trials)} />
        <Stat label="Paid customers" value={String(paid)} accent />
        <Stat label="Complimentary users" value={String(comps)} />
        <Stat label="Revenue this month" value={money(monthlyRevenue)} />
        <Stat label="Total revenue" value={money(totalRevenue)} />
        <Stat label="Signatures created" value={String([...data.signatureCounts.values()].reduce((a, b) => a + b, 0))} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Recent signups">
          {data.profiles.length === 0 ? (
            <Empty>No accounts yet.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {data.profiles.slice(0, 8).map((p) => {
                const sub = subByUser.get(p.id);
                return (
                  <li key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                    <button type="button" onClick={() => onOpen(p.id)} className="text-left min-w-0">
                      <span className="text-sm font-medium block truncate">{p.full_name || p.email || p.id.slice(0, 8)}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {shortDate(p.created_at)} · {now - new Date(p.created_at).getTime() < 2 * DAY ? "new" : sub?.plan_name ?? "Free"}
                      </span>
                    </button>
                    <StatusBadge status={sub?.status ?? "trial"} />
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Recent payments">
          {data.purchases.length === 0 ? (
            <Empty>No payments recorded yet.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {data.purchases.slice(0, 8).map((x) => (
                <li key={x.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-sm font-medium block truncate">{nameOf(x.user_id)}</span>
                    <span className="text-[11px] text-muted-foreground">{x.plan_name} · {shortDate(x.created_at)}</span>
                  </div>
                  <span className="text-sm font-medium">{money(x.amount_cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

function CustomersSection({
  data,
  subByUser,
  compByUser,
  rolesByUser,
  selected,
  onOpen,
  canManage,
  canManageRoles,
  currentUserId,
}: {
  data: ReturnType<typeof useAdminData>;
  subByUser: Map<string, Sub>;
  compByUser: Map<string, Comp>;
  rolesByUser: Map<string, AppRole[]>;
  selected: Profile | null;
  onOpen: (id: string | null) => void;
  canManage: boolean;
  canManageRoles: boolean;
  currentUserId: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.profiles;
    return data.profiles.filter(
      (p) =>
        (p.email ?? "").toLowerCase().includes(q) ||
        (p.full_name ?? "").toLowerCase().includes(q) ||
        (p.organization_name ?? "").toLowerCase().includes(q),
    );
  }, [data.profiles, query]);

  if (selected) {
    return (
      <CustomerDetail
        profile={selected}
        sub={subByUser.get(selected.id)}
        comp={compByUser.get(selected.id)}
        comps={data.comps.filter((c) => c.user_id === selected.id)}
        purchases={data.purchases.filter((p) => p.user_id === selected.id)}
        plans={data.plans}
        roles={rolesByUser.get(selected.id) ?? []}
        signatures={data.signatureCounts.get(selected.id) ?? 0}
        canManage={canManage}
        canManageRoles={canManageRoles}
        isSelf={selected.id === currentUserId}
        onBack={() => onOpen(null)}
        reload={data.reload}
      />
    );
  }

  return (
    <Panel title="Customers">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email or organisation"
        className="w-full sm:w-80 px-3 py-2 rounded-lg bg-white border border-border text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      {filtered.length === 0 ? (
        <Empty>No accounts match that search.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr><Th>Customer</Th><Th>Plan</Th><Th>Status</Th><Th>Signatures</Th><Th>Joined</Th><Th /></tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const sub = subByUser.get(p.id);
                const comp = compByUser.get(p.id);
                return (
                  <tr key={p.id} className="border-t border-border">
                    <Td>
                      <span className="font-medium">{p.full_name || p.email || p.id.slice(0, 8)}</span>
                      {p.full_name && p.email && <span className="block text-xs text-muted-foreground">{p.email}</span>}
                      {p.account_status === "suspended" && (
                        <span className="text-[10px] text-red-600 font-medium">Suspended</span>
                      )}
                    </Td>
                    <Td>
                      {comp ? `${comp.plan_name} — Complimentary` : sub?.plan_name ?? "Free"}
                    </Td>
                    <Td><StatusBadge status={comp ? "complimentary" : sub?.status ?? "trial"} /></Td>
                    <Td>{data.signatureCounts.get(p.id) ?? 0}</Td>
                    <Td>{shortDate(p.created_at)}</Td>
                    <Td>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onOpen(p.id)}>
                        Open
                      </Button>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function CustomerDetail({
  profile,
  sub,
  comp,
  comps,
  purchases,
  plans,
  roles,
  signatures,
  canManage,
  canManageRoles,
  isSelf,
  onBack,
  reload,
}: {
  profile: Profile;
  sub?: Sub;
  comp?: Comp;
  comps: Comp[];
  purchases: ReturnType<typeof useAdminData>["purchases"];
  plans: PlanRow[];
  roles: AppRole[];
  signatures: number;
  canManage: boolean;
  canManageRoles: boolean;
  isSelf: boolean;
  onBack: () => void;
  reload: () => Promise<void>;
}) {
  const [planId, setPlanId] = useState(sub?.plan_id ?? plans[0]?.id ?? "free");
  const [interval, setInterval] = useState<"monthly" | "yearly">((sub?.billing_interval as "monthly") ?? "monthly");
  const [compPlan, setCompPlan] = useState(plans.find((p) => p.id !== "free")?.id ?? "starter");
  const [compDuration, setCompDuration] = useState<string>("1y");
  const [compNote, setCompNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(label: string, fn: () => Promise<{ error: { message: string } | null }>) {
    setBusy(true);
    const { error } = await fn();
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success(label);
      await reload();
    }
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground mb-4">
        ← Back to customers
      </button>

      <Panel title={profile.full_name || profile.email || "Customer"}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Field label="Email" value={profile.email ?? "—"} />
          <Field label="Organisation" value={profile.organization_name ?? "—"} />
          <Field label="Registered" value={shortDate(profile.created_at)} />
          <Field label="Last activity" value={shortDate(profile.last_active_at)} />
          <Field label="Current plan" value={comp ? `${comp.plan_name} — Complimentary` : sub?.plan_name ?? "Free"} />
          <Field label="Subscription" value={STATUS_LABEL[comp ? "complimentary" : sub?.status ?? "trial"] ?? "Trial"} />
          <Field label="Trial ends" value={shortDate(sub?.trial_ends_at ?? null)} />
          <Field label="Renews" value={shortDate(sub?.current_period_end ?? null)} />
          <Field label="Signatures" value={String(signatures)} />
          <Field label="Employees" value={String(Math.max(1, signatures))} />
          <Field label="Account" value={profile.account_status === "suspended" ? "Suspended" : "Active"} />
          <Field label="Roles" value={roles.length ? roles.join(", ") : "user"} />
        </div>
      </Panel>

      {!canManage ? (
        <Panel title="Manage">
          <Empty>Manager view is read-only. Only an admin can change plans, grant free access or suspend accounts.</Empty>
        </Panel>
      ) : (
        <>
          <Panel title="Change plan">
            <div className="flex flex-wrap items-end gap-3">
              <Select label="Plan" value={planId} onChange={setPlanId} options={plans.map((p) => ({ value: p.id, label: p.name }))} />
              <Select
                label="Billing"
                value={interval}
                onChange={(v) => setInterval(v as "monthly" | "yearly")}
                options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
              />
              <Button
                size="sm"
                disabled={busy}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  const plan = plans.find((p) => p.id === planId);
                  if (!plan) return;
                  void run("Plan updated", () => changePlan(profile.id, plan, interval, sub));
                }}
              >
                Apply plan
              </Button>
            </div>
          </Panel>

          <Panel title="Complimentary access">
            <p className="text-xs text-muted-foreground mb-4">
              Stored separately from payments — a complimentary customer is never charged and shows as
              “Plan — Complimentary”.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <Select label="Plan" value={compPlan} onChange={setCompPlan} options={plans.filter((p) => p.id !== "free").map((p) => ({ value: p.id, label: p.name }))} />
              <Select label="Duration" value={compDuration} onChange={setCompDuration} options={COMP_DURATIONS.map((d) => ({ value: d.id, label: d.label }))} />
              <div className="space-y-1.5">
                <label className="text-[10px] font-[JetBrains_Mono] uppercase text-muted-foreground block">Note</label>
                <input
                  value={compNote}
                  onChange={(e) => setCompNote(e.target.value)}
                  placeholder="Friend / partner"
                  className="px-3 py-2 rounded-lg bg-white border border-border text-sm w-52"
                />
              </div>
              <Button
                size="sm"
                disabled={busy}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  const plan = plans.find((p) => p.id === compPlan);
                  const duration = COMP_DURATIONS.find((d) => d.id === compDuration);
                  if (!plan || !duration) return;
                  void run("Complimentary access granted", () => grantComplimentary(profile, plan, duration, compNote, sub));
                }}
              >
                Grant free access
              </Button>
            </div>

            {comps.length > 0 && (
              <ul className="mt-5 divide-y divide-border">
                {comps.map((c) => (
                  <li key={c.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                    <div>
                      <span className="font-medium">{c.plan_name} — Complimentary</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {c.duration === "lifetime" ? "Lifetime" : `Until ${shortDate(c.expires_at)}`}
                        {c.note ? ` · ${c.note}` : ""}
                        {c.revoked_at ? ` · revoked ${shortDate(c.revoked_at)}` : ""}
                      </span>
                    </div>
                    {!c.revoked_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={busy}
                        onClick={() =>
                          void run("Complimentary access revoked", async () =>
                            supabase
                              .from("complimentary_access")
                              .update({ revoked_at: new Date().toISOString() } as never)
                              .eq("id", c.id),
                          )
                        }
                      >
                        Revoke
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Signatures (${signatures})`}>
            <CustomerSignatures userId={profile.id} />
          </Panel>

          <Panel title="Access controls">

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={busy} onClick={() => void run("Trial extended by 7 days", () => extendTrial(profile.id, 7, sub))}>
                Extend trial 7 days
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => void run("Trial extended by 30 days", () => extendTrial(profile.id, 30, sub))}>
                Extend trial 30 days
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => void run("Access cancelled", () => cancelAccess(profile.id, sub))}>
                Cancel access
              </Button>
              <SignInAsButton userId={profile.id} disabled={busy || isSelf} />
              <SetPasswordButton userId={profile.id} disabled={busy} />
              {profile.account_status === "suspended" ? (
                <Button size="sm" disabled={busy} className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => void run("Account restored", () => setAccountStatus(profile.id, "active"))}>
                  Restore account
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={busy || isSelf} onClick={() => void run("Account suspended", () => setAccountStatus(profile.id, "suspended"))}>
                  Suspend account
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Suspending blocks the customer from creating or editing signatures — enforced by database rules, not just
              hidden buttons. “Sign in as customer” replaces your session with theirs — sign out to come back to your own
              admin account.
            </p>
          </Panel>

        </>
      )}

      <Panel title="Roles and permissions">
        <div className="flex flex-wrap gap-2 mb-4">
          {(["admin", "manager"] as const).map((role) => {
            const on = roles.includes(role);
            return (
              <button
                key={role}
                type="button"
                disabled={!canManageRoles || busy || (isSelf && role === "admin" && on)}
                onClick={() =>
                  void run(on ? `${role} access removed` : `${role} access granted`, async () =>
                    on
                      ? supabase.from("user_roles").delete().eq("user_id", profile.id).eq("role", role)
                      : supabase.from("user_roles").insert({ user_id: profile.id, role } as never),
                  )
                }
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {on ? `${role} ✓` : `Make ${role}`}
              </button>
            );
          })}
        </div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {(Object.keys(ROLE_SUMMARY) as AppRole[]).map((r) => (
            <li key={r}>
              <span className="text-foreground font-medium">{ROLE_SUMMARY[r].label}:</span> {ROLE_SUMMARY[r].blurb}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Payments">
        {purchases.length === 0 ? (
          <Empty>No payments from this customer yet.</Empty>
        ) : (
          <table className="w-full text-sm">
            <thead><tr><Th>Date</Th><Th>Plan</Th><Th>Amount</Th><Th>Status</Th></tr></thead>
            <tbody>
              {purchases.map((x) => (
                <tr key={x.id} className="border-t border-border">
                  <Td>{shortDate(x.created_at)}</Td>
                  <Td>{x.plan_name}</Td>
                  <Td>{money(x.amount_cents)}</Td>
                  <Td><StatusBadge status={x.status} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subscriptions / Sales                                               */
/* ------------------------------------------------------------------ */

function SubscriptionsSection({ subs, nameOf }: { subs: Sub[]; nameOf: (id: string) => string }) {
  return (
    <Panel title="Subscriptions">
      {subs.length === 0 ? (
        <Empty>No subscriptions yet.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr><Th>Customer</Th><Th>Plan</Th><Th>Billing</Th><Th>Amount</Th><Th>Status</Th><Th>Started</Th><Th>Next renewal</Th><Th>Cancelled</Th></tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <Td>{nameOf(s.user_id)}</Td>
                  <Td>{s.plan_name}</Td>
                  <Td className="capitalize">{s.billing_interval}</Td>
                  <Td>{money(s.amount_cents)}</Td>
                  <Td><StatusBadge status={s.status} /></Td>
                  <Td>{shortDate(s.created_at)}</Td>
                  <Td>{shortDate(s.current_period_end)}</Td>
                  <Td>{shortDate(s.canceled_at)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function SalesSection({ purchases, nameOf }: { purchases: ReturnType<typeof useAdminData>["purchases"]; nameOf: (id: string) => string }) {
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const paid = purchases.filter((p) => p.status === "paid");
  const sum = (rows: typeof paid) => rows.reduce((n, x) => n + x.amount_cents, 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Today" value={money(sum(paid.filter((p) => new Date(p.created_at) >= startOfDay)))} />
        <Stat label="This month" value={money(sum(paid.filter((p) => new Date(p.created_at) >= startOfMonth)))} accent />
        <Stat label="All time" value={money(sum(paid))} />
      </div>
      <Panel title="Payments">
        {purchases.length === 0 ? (
          <Empty>No payments recorded yet.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr><Th>Date</Th><Th>Customer</Th><Th>Plan</Th><Th>Amount</Th><Th>Status</Th><Th>Transaction</Th></tr>
              </thead>
              <tbody>
                {purchases.map((x) => (
                  <tr key={x.id} className="border-t border-border">
                    <Td>{shortDate(x.created_at)}</Td>
                    <Td>{nameOf(x.user_id)}</Td>
                    <Td>{x.plan_name}</Td>
                    <Td>{money(x.amount_cents)}</Td>
                    <Td><StatusBadge status={x.status} /></Td>
                    <Td className="font-[JetBrains_Mono] text-[11px]">{x.stripe_reference ?? "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Plans                                                               */
/* ------------------------------------------------------------------ */

const FEATURE_KEYS = ["export_html", "export_outlook", "custom_branding", "team_rollout", "priority_support"] as const;
const FEATURE_LABEL: Record<string, string> = {
  export_html: "HTML export",
  export_outlook: "Outlook install",
  custom_branding: "Custom branding",
  team_rollout: "Team rollout",
  priority_support: "Priority support",
};

function PlansSection({ plans, canManage, reload }: { plans: PlanRow[]; canManage: boolean; reload: () => Promise<void> }) {
  return (
    <div className="space-y-4">
      {!canManage && <Empty>Manager view — plan pricing can only be changed by an admin.</Empty>}
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} canManage={canManage} reload={reload} />
      ))}
    </div>
  );
}

function PlanCard({ plan, canManage, reload }: { plan: PlanRow; canManage: boolean; reload: () => Promise<void> }) {
  const [draft, setDraft] = useState(plan);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const { error } = await supabase
      .from("plans")
      .update({
        name: draft.name,
        tagline: draft.tagline,
        monthly_cents: Number(draft.monthly_cents) || 0,
        yearly_cents: Number(draft.yearly_cents) || 0,
        signature_limit: Number(draft.signature_limit) || 0,
        employee_limit: Number(draft.employee_limit) || 0,
        features: draft.features,
        is_active: draft.is_active,
      } as never)
      .eq("id", plan.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success(`${draft.name} saved`);
      await reload();
    }
  }

  return (
    <section className="rounded-xl bg-white ring-1 ring-black/5 p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-[Inter_Tight] font-bold tracking-tight">{plan.name}</h2>
        <span className="text-[10px] font-[JetBrains_Mono] uppercase text-muted-foreground">{plan.id}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <NumberField label="Monthly (cents)" value={draft.monthly_cents} onChange={(v) => setDraft({ ...draft, monthly_cents: v })} disabled={!canManage} />
        <NumberField label="Yearly (cents)" value={draft.yearly_cents} onChange={(v) => setDraft({ ...draft, yearly_cents: v })} disabled={!canManage} />
        <NumberField label="Signature limit" value={draft.signature_limit} onChange={(v) => setDraft({ ...draft, signature_limit: v })} disabled={!canManage} />
        <NumberField label="Employee limit" value={draft.employee_limit} onChange={(v) => setDraft({ ...draft, employee_limit: v })} disabled={!canManage} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FEATURE_KEYS.map((key) => {
          const on = Boolean(draft.features?.[key]);
          return (
            <button
              key={key}
              type="button"
              disabled={!canManage}
              onClick={() => setDraft({ ...draft, features: { ...draft.features, [key]: !on } })}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors disabled:opacity-40 ${
                on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {FEATURE_LABEL[key]}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" disabled={!canManage || busy} className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => void save()}>
          {busy ? "Saving…" : "Save plan"}
        </Button>
        <button
          type="button"
          disabled={!canManage}
          onClick={() => setDraft({ ...draft, is_active: !draft.is_active })}
          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          {draft.is_active ? "Visible on pricing page" : "Hidden from pricing page"} — toggle
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function SettingsSection({
  settings,
  canManage,
  reload,
}: {
  settings: ReturnType<typeof useAdminData>["settings"];
  canManage: boolean;
  reload: () => Promise<void>;
}) {
  const [draft, setDraft] = useState(settings);
  const [busy, setBusy] = useState(false);

  if (!settings || !draft) return <Empty>Settings are loading…</Empty>;

  async function save() {
    if (!draft) return;
    setBusy(true);
    const { error } = await supabase
      .from("app_settings")
      .update({
        product_name: draft.product_name,
        support_email: draft.support_email,
        default_trial_days: Number(draft.default_trial_days) || 0,
        signups_enabled: draft.signups_enabled,
        maintenance_mode: draft.maintenance_mode,
        announcement: draft.announcement,
      } as never)
      .eq("id", "global");
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Settings saved");
      await reload();
    }
  }

  return (
    <Panel title="Software settings">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <TextField label="Product name" value={draft.product_name} onChange={(v) => setDraft({ ...draft, product_name: v })} disabled={!canManage} />
        <TextField label="Support email" value={draft.support_email ?? ""} onChange={(v) => setDraft({ ...draft, support_email: v })} disabled={!canManage} />
        <NumberField label="Default trial (days)" value={draft.default_trial_days} onChange={(v) => setDraft({ ...draft, default_trial_days: v })} disabled={!canManage} />
        <TextField label="Announcement" value={draft.announcement ?? ""} onChange={(v) => setDraft({ ...draft, announcement: v })} disabled={!canManage} />
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Toggle label="Signups enabled" on={draft.signups_enabled} disabled={!canManage} onClick={() => setDraft({ ...draft, signups_enabled: !draft.signups_enabled })} />
        <Toggle label="Maintenance mode" on={draft.maintenance_mode} disabled={!canManage} onClick={() => setDraft({ ...draft, maintenance_mode: !draft.maintenance_mode })} />
      </div>

      <Button size="sm" className="mt-5 bg-primary text-primary-foreground hover:bg-primary/90" disabled={!canManage || busy} onClick={() => void save()}>
        {busy ? "Saving…" : "Save settings"}
      </Button>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* UI primitives                                                       */
/* ------------------------------------------------------------------ */

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

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ring-1 ${accent ? "bg-primary/5 ring-primary/20" : "bg-white ring-black/5"}`}>
      <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-[Inter_Tight] font-bold tracking-tight mt-1">{value}</p>
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

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-[JetBrains_Mono] uppercase text-muted-foreground block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 rounded-lg bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextField({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-[JetBrains_Mono] uppercase text-muted-foreground block">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-white border border-border text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function NumberField({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-[JetBrains_Mono] uppercase text-muted-foreground block">{label}</label>
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 rounded-lg bg-white border border-border text-sm disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

function Toggle({ label, on, onClick, disabled }: { label: string; on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors disabled:opacity-40 ${
        on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABEL[status] ?? status;
  const tone =
    label === "Active" || label === "Paid" || status === "paid"
      ? "bg-primary/10 text-primary"
      : label === "Complimentary"
      ? "bg-emerald-50 text-emerald-700"
      : label === "Past due" || label === "Cancelled"
      ? "bg-red-50 text-red-600"
      : "bg-secondary text-muted-foreground";
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${tone}`}>{status === "paid" ? "Paid" : label}</span>;
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="text-left text-[10px] font-[JetBrains_Mono] uppercase tracking-widest text-muted-foreground pb-2 pr-4 font-medium">
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`py-2.5 pr-4 align-top ${className}`}>{children}</td>;
}
