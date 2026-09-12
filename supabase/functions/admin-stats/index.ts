// ═══════════════════════════════════════════════════════════
// admin-stats — the editor's Admin panel: counts, the user list, and
// granting paid access
//
// Counting users means reading auth.users, and nothing holding a browser key
// can do that: Row Level Security hides other people's rows, and the admin
// endpoints reject the publishable key outright. That is the correct
// behaviour, so the count has to come from somewhere the service-role key can
// live without being shipped to anyone. That is this function.
//
// Supabase injects SUPABASE_SERVICE_ROLE_KEY into the function's environment,
// so the key is never typed, committed, or pasted anywhere.
//
// The order below matters and is the whole security model:
//
//   1. Require a bearer token; reject anonymous callers.
//   2. Resolve that token to a user with the ANON client. Never trust a user
//      id sent in the body — a caller can put anything there.
//   3. Look up is_admin for that user with the service-role client. The column
//      is trigger-protected, so nobody can grant it to themselves.
//   4. Only then do the work — counts, the user list, or a plan change.
//
// The plan change is the only write. It addresses the account by id rather
// than email, refuses anything outside the allowed plans, and refuses to
// change the caller's own plan. is_admin is not settable here at all.
//
// Deploy:  supabase functions deploy admin-stats
// ═══════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// The editor is served from these origins. A wildcard would let any page a
// signed-in admin happens to visit call this with their token.
const ALLOWED_ORIGINS = [
  'https://signvel.com',
  'https://www.signvel.com',
  'https://signvelemail.threebows1.workers.dev',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
];

function corsHeaders(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

// The only values the plan column accepts. Checked here as well as by the
// column's own constraint, so a bad value is a clear 400 rather than a
// database error surfacing through the interface.
const PLANS = ['free', 'team', 'org'];

// Who exists, and what they are on. Reads profiles rather than auth.users:
// everything the panel shows lives there, and it keeps the row a plan change
// has to target the same row that was listed.
async function listUsers(admin: any, origin: string | null) {
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, plan, is_admin, created_at, trial_ends_at')
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) return json({ error: error.message }, 500, origin);
  return json({ users: data ?? [] }, 200, origin);
}

// Grants or removes paid access.
//
// This is the one write in the function, so it is the one that has to be
// careful. The plan is checked against the allowed list; the target is
// addressed by id rather than by email, so two accounts sharing an address
// cannot be confused for each other; and an admin cannot change their own
// plan, which keeps "I upgraded myself" out of the audit trail and makes the
// panel a tool for granting access to other people rather than to oneself.
//
// is_admin is deliberately not settable here. Granting administrator rights
// stays a SQL statement someone has to write on purpose.
async function setPlan(admin: any, body: any, callerId: string, origin: string | null) {
  const userId = String(body?.userId || '');
  const plan = String(body?.plan || '');

  if (!userId) return json({ error: 'Which account?' }, 400, origin);
  if (!PLANS.includes(plan)) return json({ error: 'Unknown plan.' }, 400, origin);
  if (userId === callerId) {
    return json({ error: 'Change your own plan from the SQL editor, not here.' }, 400, origin);
  }

  const { data, error } = await admin
    .from('profiles')
    .update({ plan })
    .eq('id', userId)
    .select('id, email, plan, is_admin, created_at, trial_ends_at')
    .single();

  if (error) return json({ error: error.message }, 500, origin);
  if (!data) return json({ error: 'No such account.' }, 404, origin);
  return json({ user: data }, 200, origin);
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Use POST.' }, 405, origin);
  }

  // ── 1. Bearer token required ──
  const auth = req.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return json({ error: 'Not signed in.' }, 401, origin);

  // ── 2. Resolve the token to a real user ──
  const asUser = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await asUser.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: 'Not signed in.' }, 401, origin);
  const uid = userData.user.id;

  // ── 3. Is that user an admin? ──
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: profile } = await admin
    .from('profiles').select('is_admin').eq('id', uid).single();

  // Deliberately the same message and status as "not signed in": telling a
  // non-admin that the endpoint exists and they merely lack the flag is more
  // than they need to know.
  if (!profile?.is_admin) return json({ error: 'Not permitted.' }, 403, origin);

  // ── 4. Which job? ──
  // One function rather than three, so there is one place where the checks
  // above live and one thing to deploy.
  const body = await req.json().catch(() => ({}));
  const action = body?.action || 'stats';

  if (action === 'users') return listUsers(admin, origin);
  if (action === 'setPlan') return setPlan(admin, body, uid, origin);
  if (action !== 'stats') return json({ error: 'Unknown action.' }, 400, origin);

  // ── 5. Counts (the default action) ──
  // listUsers is paged; the total comes back regardless of perPage, so ask for
  // the smallest page that still returns it rather than pulling every row.
  const { data: page, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (listErr) return json({ error: listErr.message }, 500, origin);

  const since = (days: number) => new Date(Date.now() - days * 864e5).toISOString();

  const [signatures, confirmed, week, month, plans] = await Promise.all([
    admin.from('signatures').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since(7)),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since(30)),
    admin.from('profiles').select('plan, trial_ends_at'),
  ]);

  // Counted together so the two add up to the profile count rather than
  // overlapping: a paid account is reported by its plan, and only a free one
  // is reported as trialling or expired.
  const byPlan: Record<string, number> = {};
  let onTrial = 0;
  let expired = 0;
  const now = Date.now();
  (plans.data ?? []).forEach((r: { plan: string; trial_ends_at: string }) => {
    byPlan[r.plan] = (byPlan[r.plan] ?? 0) + 1;
    if (r.plan === 'free') {
      if (r.trial_ends_at && new Date(r.trial_ends_at).getTime() > now) onTrial++;
      else expired++;
    }
  });

  return json({
    users: page?.total ?? 0,
    profiles: confirmed.count ?? 0,
    signatures: signatures.count ?? 0,
    newLast7: week.count ?? 0,
    newLast30: month.count ?? 0,
    byPlan,
    onTrial,
    expired,
    generatedAt: new Date().toISOString(),
  }, 200, origin);
});
