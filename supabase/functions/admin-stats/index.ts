// ═══════════════════════════════════════════════════════════
// admin-stats — counts for the editor's Admin panel
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
//   4. Only then run the counts.
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

  // ── 4. Counts ──
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
    admin.from('profiles').select('plan'),
  ]);

  const byPlan: Record<string, number> = {};
  (plans.data ?? []).forEach((r: { plan: string }) => {
    byPlan[r.plan] = (byPlan[r.plan] ?? 0) + 1;
  });

  return json({
    users: page?.total ?? 0,
    profiles: confirmed.count ?? 0,
    signatures: signatures.count ?? 0,
    newLast7: week.count ?? 0,
    newLast30: month.count ?? 0,
    byPlan,
    generatedAt: new Date().toISOString(),
  }, 200, origin);
});
