// ═══════════════════════════════════════════════════════════
// admin-stats — everything the admin panel at /admin reads and writes
//
// Counting users means reading auth.users, and nothing holding a browser key
// can do that: Row Level Security hides other people's rows, and the admin
// endpoints reject the publishable key outright. That is the correct
// behaviour, so the work has to happen somewhere the service-role key can
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
//   4. Only then do the work.
//
// Actions
//   stats     counts, a thirty-day signup series, plan mix, subscription state
//   users     one page of profiles, with signature counts and last sign-in
//   user      one account in full: profile, auth record, signatures, subs
//   setPlan   move somebody between plans
//   setTrial  extend or end paid access without a payment — complimentary
//             access, and the way a grant is taken back
//
// The two writes address the account by id rather than email, and both refuse
// the caller's own account: this is a tool for granting access to other people
// rather than to oneself, and that keeps "I upgraded myself" off the trail.
//
// is_admin is deliberately not settable here, and there is no delete. Both
// stay SQL statements someone has to write on purpose: one hands over the
// whole panel, and the other destroys a customer's work with a single click
// sitting next to the buttons used for routine support.
//
// Deploy:  supabase functions deploy admin-stats
// ═══════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// The site is served from these origins. A wildcard would let any page a
// signed-in admin happens to visit call this with their token.
const ALLOWED_ORIGINS = [
  'https://signvel.com',
  'https://www.signvel.com',
  'https://signvelemail.threebows1.workers.dev',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
];

// Every header supabase-js puts on a functions.invoke call. Listing only
// authorization and content-type is not enough: the client also sends apikey
// and x-client-info, the browser asks permission for all of them at once, and
// a preflight that omits any one of them fails the whole request before it is
// sent. It surfaces as "Failed to send a request to the Edge Function", which
// names the symptom and not the cause.
const ALLOWED_HEADERS = 'authorization, content-type, apikey, x-client-info, x-supabase-api-version';

function corsHeaders(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
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

// What the panel is shown about an account. Listed once, so a row that comes
// back from a write has the same shape as a row that came from the list.
//
// signature_limit is kept apart from the rest because it arrives with a
// migration, and this function is deployed separately from the SQL. Asking
// Postgres for a column it does not have fails the whole select, so deploying
// the function first turned a pending migration into "every account's Details
// is broken" rather than "one new field is missing". Asked for, and dropped
// on the one error that means it is not there yet.
const USER_COLUMNS_BASE =
  'id, email, full_name, plan, is_admin, created_at, updated_at, trial_ends_at, stripe_customer_id';
const USER_COLUMNS = USER_COLUMNS_BASE + ', signature_limit, team_id';

// 42703 is undefined_column. Matched on the code rather than the message so a
// wording change in Postgres does not quietly turn this back into a hard fail.
// 42P01 is undefined_table, 42703 undefined_column — either means the teams
// half of schema.sql has not been run yet.
function missingTeamsTable(error: any) {
  return !!error && (error.code === '42P01' || error.code === '42703' || /teams|team_id/i.test(String(error.message || '')));
}

function missingAllowanceColumn(error: any) {
  return !!error && (error.code === '42703' || /signature_limit/i.test(String(error.message || '')));
}

// Runs a select twice at most: once asking for the allowance, and once without
// it if the database has not got there yet.
async function withUserColumns(run: (cols: string) => any) {
  const first = await run(USER_COLUMNS);
  if (first.error && (missingAllowanceColumn(first.error) || missingTeamsTable(first.error))) return await run(USER_COLUMNS_BASE);
  return first;
}

const MAX_USERS = 500;        // one page of the account table
const MAX_SIGNATURES = 20000; // the user_id column, tallied in one pass
const AUTH_PER_PAGE = 1000;   // auth.users is paged; this is the page size
const AUTH_PAGES = 5;         // and this stops one call becoming fifty
const MAX_TRIAL_DAYS = 3650;  // ten years, which is "forever" for a grant

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function since(days: number) {
  return new Date(Date.now() - days * 864e5).toISOString();
}

// ── Shared reads ─────────────────────────────────────────

// How many signatures each account has saved, tallied in one pass rather than
// one count query per row: at this size the whole column is smaller than the
// round trips would be.
async function signatureCounts(admin: any) {
  const counts: Record<string, number> = {};
  const { data } = await admin.from('signatures').select('user_id').limit(MAX_SIGNATURES);
  (data ?? []).forEach((r: { user_id: string }) => {
    counts[r.user_id] = (counts[r.user_id] ?? 0) + 1;
  });
  return counts;
}

type AuthFacts = { confirmed: boolean; lastSignIn: string | null; provider: string };

// Everything auth.users knows that profiles does not: whether the address was
// ever confirmed, and when the account was last actually used. Without this
// the panel can only report who signed up, not who is still here.
async function authIndex(admin: any) {
  const idx: Record<string, AuthFacts> = {};
  for (let page = 1; page <= AUTH_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: AUTH_PER_PAGE });
    const rows = data?.users ?? [];
    rows.forEach((u: any) => {
      idx[u.id] = {
        confirmed: !!u.email_confirmed_at,
        lastSignIn: u.last_sign_in_at ?? null,
        provider: (u.app_metadata && u.app_metadata.provider) || 'email',
      };
    });
    if (error || rows.length < AUTH_PER_PAGE) return { idx, truncated: false };
  }
  return { idx, truncated: true };
}

// ── Actions ──────────────────────────────────────────────

// Who exists, and what each of them is on. Reads profiles rather than
// auth.users: everything the panel shows lives there, and it keeps the row a
// plan change targets the same row that was listed.
async function listUsers(admin: any, body: any, origin: string | null) {
  // Narrowed to characters that appear in an address before it reaches a
  // PostgREST filter expression. The pattern is interpolated into that
  // expression, so nothing that could end it early is allowed through.
  const q = String(body?.q ?? '').replace(/[^A-Za-z0-9._@+ -]/g, '').trim().slice(0, 120);

  const runList = (cols: string) => {
    let sel = admin
      .from('profiles')
      .select(cols)
      .order('created_at', { ascending: false })
      .limit(MAX_USERS);
    if (q) sel = sel.ilike('email', `%${q}%`);
    return sel;
  };

  const [listed, counts, auth] = await Promise.all([
    withUserColumns(runList), signatureCounts(admin), authIndex(admin),
  ]);
  if (listed.error) return json({ error: listed.error.message }, 500, origin);

  const users = (listed.data ?? []).map((u: any) => {
    const a = auth.idx[u.id];
    return {
      ...u,
      signatures: counts[u.id] ?? 0,
      confirmed: a ? a.confirmed : null,
      last_sign_in_at: a ? a.lastSignIn : null,
      provider: a ? a.provider : null,
    };
  });

  return json({
    users,
    // Said out loud rather than quietly showing a partial list.
    capped: users.length >= MAX_USERS,
    limit: MAX_USERS,
    query: q,
  }, 200, origin);
}

// One account, in as much detail as exists. This is the "track user data"
// view: the profile row, the auth record behind it, what they have built, and
// whatever billing has recorded against them.
async function userDetail(admin: any, body: any, origin: string | null) {
  const userId = String(body?.userId ?? '');
  if (!UUID.test(userId)) return json({ error: 'Which account?' }, 400, origin);

  const [prof, sigs, subs, authRes] = await Promise.all([
    withUserColumns((cols: string) => admin.from('profiles').select(cols).eq('id', userId).single()),
    admin.from('signatures').select('id, name, is_default, created_at, updated_at')
      .eq('user_id', userId).order('updated_at', { ascending: false }).limit(50),
    admin.from('subscriptions').select('*')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    admin.auth.admin.getUserById(userId),
  ]);

  // A failed query and a missing account are not the same thing, and reporting
  // both as "No such account." is how a broken column reads as a deleted user
  // — on every account at once, with the actual reason nowhere on screen.
  if (prof.error) return json({ error: 'Could not read that account: ' + prof.error.message }, 500, origin);
  if (!prof.data) return json({ error: 'No such account.' }, 404, origin);
  const au = authRes?.data?.user;

  return json({
    user: prof.data,
    signatures: sigs.data ?? [],
    subscriptions: subs.data ?? [],
    auth: au ? {
      confirmed: !!au.email_confirmed_at,
      lastSignIn: au.last_sign_in_at ?? null,
      createdAt: au.created_at ?? null,
      provider: (au.app_metadata && au.app_metadata.provider) || 'email',
    } : null,
  }, 200, origin);
}

// Grants or removes paid access by moving the plan.
//
// The plan is checked against the allowed list; the target is addressed by id
// rather than by email, so two accounts sharing an address cannot be confused
// for each other; and an admin cannot change their own plan.
async function setPlan(admin: any, body: any, callerId: string, origin: string | null) {
  const userId = String(body?.userId ?? '');
  const plan = String(body?.plan ?? '');

  if (!UUID.test(userId)) return json({ error: 'Which account?' }, 400, origin);
  if (!PLANS.includes(plan)) return json({ error: 'Unknown plan.' }, 400, origin);
  if (userId === callerId) {
    return json({ error: 'Change your own plan from the SQL editor, not here.' }, 400, origin);
  }

  const { data, error } = await admin
    .from('profiles').update({ plan }).eq('id', userId).select(USER_COLUMNS_BASE).single();

  if (error) return json({ error: error.message }, 500, origin);
  if (!data) return json({ error: 'No such account.' }, 404, origin);
  return json({ user: data }, 200, origin);
}

// Complimentary access, without a payment and without pretending there was
// one: trial_ends_at is a date, and entitlement is the OR of it and the plan
// (see has_paid_access in schema.sql). Moving that date forward is how a
// reviewer, a friend of the company or an apology gets full access; days: 0
// sets it to now, which is how the same grant is taken back.
//
// Deliberately separate from setPlan. Writing 'team' onto an account that
// never paid makes the plan column lie, and every figure derived from it lies
// with it. A date says what actually happened.
//
// The column is trigger-protected against the browser — protect_billing_
// columns strips it for the authenticated role — and the service-role
// connection here is not that role, which is why this has to live in a
// function rather than in a PATCH from the panel.

async function setTrial(admin: any, body: any, callerId: string, origin: string | null) {
  const userId = String(body?.userId ?? '');
  const days = Number(body?.days);

  if (!UUID.test(userId)) return json({ error: 'Which account?' }, 400, origin);
  if (!Number.isFinite(days) || days < 0 || days > MAX_TRIAL_DAYS) {
    return json({ error: `Give a number of days between 0 and ${MAX_TRIAL_DAYS}.` }, 400, origin);
  }
  if (userId === callerId) {
    return json({ error: 'Grant access to someone else; change your own from the SQL editor.' }, 400, origin);
  }

  const until = new Date(Date.now() + days * 864e5).toISOString();
  const { data, error } = await admin
    .from('profiles').update({ trial_ends_at: until }).eq('id', userId).select(USER_COLUMNS_BASE).single();

  if (error) return json({ error: error.message }, 500, origin);
  if (!data) return json({ error: 'No such account.' }, 404, origin);
  return json({ user: data }, 200, origin);
}

// An allowance for one account, in signatures. Null clears it and puts the
// account back on whatever its plan gives.
//
// Separate from setPlan for the reason setTrial is separate: writing a plan
// onto an account to change what it may do makes the plan column lie, and the
// figures in this panel are derived from that column. An allowance says what
// it is — a number somebody set by hand — and leaves the billing state alone.
async function setSignatureLimit(admin: any, body: any, callerId: string, origin: string | null) {
  const userId = String(body?.userId ?? '');
  const raw = body?.limit;

  if (!UUID.test(userId)) return json({ error: 'Which account?' }, 400, origin);
  if (userId === callerId) {
    return json({ error: 'Change your own allowance from the SQL editor, not here.' }, 400, origin);
  }

  // Null is a real value here — it is how an allowance is taken back — so an
  // absent field and a zero are rejected rather than quietly read as one.
  let limit: number | null = null;
  if (raw !== null && raw !== undefined && raw !== '') {
    limit = Number(raw);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100000) {
      return json({ error: 'An allowance is a whole number of at least 1.' }, 400, origin);
    }
  }

  const { data, error } = await admin
    .from('profiles').update({ signature_limit: limit })
    .eq('id', userId).select(USER_COLUMNS).single();

  // This one cannot fall back — writing the allowance is the whole point of
  // the call. Say which step is missing instead of passing on a bare Postgres
  // message about an unknown column.
  if (error && missingAllowanceColumn(error)) {
    return json({ error: 'Allowances need schema.sql re-run first — the signature_limit column is not there yet.' }, 409, origin);
  }
  if (error) return json({ error: error.message }, 500, origin);
  if (!data) return json({ error: 'No such account.' }, 404, origin);
  return json({ user: data }, 200, origin);
}

// The overview. Everything here is counted server-side and the panel only
// draws it, so two people looking at the same moment see the same figures.

// Which team an account belongs to. "new" starts one owned by that account;
// null takes them out of whatever they were in.
//
// Membership is not self-service — protect_billing_columns strips team_id from
// anything the browser writes — because belonging to a team decides whose brand
// you inherit and whose signature budget you spend. It moves here, or it does
// not move.
async function setTeam(admin: any, body: any, origin: string | null) {
  const userId = String(body?.userId ?? '');
  const raw = body?.teamId;

  if (!UUID.test(userId)) return json({ error: 'Which account?' }, 400, origin);

  let teamId: string | null = null;

  if (raw === 'new') {
    const name = String(body?.name ?? '').trim().slice(0, 80) || 'My team';
    const { data: made, error: makeErr } = await admin
      .from('teams').insert({ name, owner_id: userId }).select('id').single();
    if (makeErr && missingTeamsTable(makeErr)) {
      return json({ error: 'Teams need schema.sql re-run first — the teams table is not there yet.' }, 409, origin);
    }
    if (makeErr) return json({ error: makeErr.message }, 500, origin);
    teamId = made.id;
  } else if (raw !== null && raw !== undefined && raw !== '') {
    teamId = String(raw);
    if (!UUID.test(teamId)) return json({ error: 'A team id, or "new", or empty to remove them.' }, 400, origin);
    const { data: found, error: findErr } = await admin
      .from('teams').select('id').eq('id', teamId).maybeSingle();
    if (findErr && missingTeamsTable(findErr)) {
      return json({ error: 'Teams need schema.sql re-run first — the teams table is not there yet.' }, 409, origin);
    }
    if (findErr) return json({ error: findErr.message }, 500, origin);
    if (!found) return json({ error: 'No team with that id.' }, 404, origin);
  }

  const { data, error } = await admin
    .from('profiles').update({ team_id: teamId })
    .eq('id', userId).select(USER_COLUMNS).single();

  if (error && missingTeamsTable(error)) {
    return json({ error: 'Teams need schema.sql re-run first — the team_id column is not there yet.' }, 409, origin);
  }
  if (error) return json({ error: error.message }, 500, origin);
  if (!data) return json({ error: 'No such account.' }, 404, origin);
  return json({ user: data }, 200, origin);
}
async function stats(admin: any, origin: string | null) {
  // listUsers is paged; the total comes back regardless of perPage, so ask for
  // the smallest page that still returns it rather than pulling every row.
  const { data: page, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (listErr) return json({ error: listErr.message }, 500, origin);

  const [sigCount, confirmed, week, month, plans, recent, subs, counts, auth] = await Promise.all([
    admin.from('signatures').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since(7)),
    admin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since(30)),
    admin.from('profiles').select('plan, trial_ends_at, created_at'),
    admin.from('profiles').select('created_at').gte('created_at', since(29)).limit(5000),
    admin.from('subscriptions').select('status, quantity, current_period_end, cancel_at_period_end').limit(1000),
    signatureCounts(admin),
    authIndex(admin),
  ]);

  // Counted together so the parts add up to the profile count rather than
  // overlapping: a paid account is reported by its plan, and only a free one
  // is reported as trialling or expired.
  const byPlan: Record<string, number> = {};
  let onTrial = 0;
  let expired = 0;
  // Complimentary access, detected rather than stored: every account is
  // created with trial_ends_at at signup + 30 days, so an end date more than
  // a month past the day the account was made can only have been put there
  // deliberately. Counting "paid plan with a live trial date" instead would
  // report every new paying customer as a freebie for their first month.
  let granted = 0;
  const now = Date.now();
  (plans.data ?? []).forEach((r: { plan: string; trial_ends_at: string; created_at: string }) => {
    byPlan[r.plan] = (byPlan[r.plan] ?? 0) + 1;
    const ends = r.trial_ends_at ? new Date(r.trial_ends_at).getTime() : 0;
    const live = ends > now;
    const made = r.created_at ? new Date(r.created_at).getTime() : 0;
    if (live && made && ends - made > 31 * 864e5) granted++;
    if (r.plan === 'free') {
      if (live) onTrial++; else expired++;
    }
  });

  // Thirty daily buckets, oldest first, keyed by date so the panel can label
  // them without recomputing the calendar.
  const series: { date: string; count: number }[] = [];
  const bucket: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const key = new Date(now - i * 864e5).toISOString().slice(0, 10);
    bucket[key] = series.length;
    series.push({ date: key, count: 0 });
  }
  (recent.data ?? []).forEach((r: { created_at: string }) => {
    const key = String(r.created_at).slice(0, 10);
    if (bucket[key] !== undefined) series[bucket[key]].count++;
  });

  // Who is still here, as opposed to who signed up once. This is the figure
  // that says whether the product is being used.
  let activeLast7 = 0;
  let activeLast30 = 0;
  let unconfirmed = 0;
  Object.keys(auth.idx).forEach((id) => {
    const a = auth.idx[id];
    if (!a.confirmed) unconfirmed++;
    if (!a.lastSignIn) return;
    const t = new Date(a.lastSignIn).getTime();
    if (t > now - 7 * 864e5) activeLast7++;
    if (t > now - 30 * 864e5) activeLast30++;
  });

  // How signature use is distributed, which is what the per-plan caps are
  // actually sold against.
  const withSignatures = Object.keys(counts).length;
  let mostSignatures = 0;
  Object.keys(counts).forEach((id) => { if (counts[id] > mostSignatures) mostSignatures = counts[id]; });

  // Billing, reported from what the subscriptions table holds rather than
  // inferred from the plan column. Nothing writes that table yet, so an empty
  // result here is the honest answer to "how much is being billed" — not a
  // reason to compute revenue out of plan names.
  const byStatus: Record<string, number> = {};
  let activeSubs = 0;
  let cancelling = 0;
  (subs.data ?? []).forEach((r: any) => {
    const st = String(r.status ?? 'unknown');
    byStatus[st] = (byStatus[st] ?? 0) + 1;
    if (st === 'active' || st === 'trialing') activeSubs++;
    if (r.cancel_at_period_end) cancelling++;
  });

  return json({
    users: page?.total ?? 0,
    profiles: confirmed.count ?? 0,
    signatures: sigCount.count ?? 0,
    newLast7: week.count ?? 0,
    newLast30: month.count ?? 0,
    byPlan,
    onTrial,
    expired,
    granted,
    activeLast7,
    activeLast30,
    unconfirmed,
    withSignatures,
    mostSignatures,
    series,
    subscriptions: {
      total: (subs.data ?? []).length,
      active: activeSubs,
      cancelling,
      byStatus,
    },
    authTruncated: auth.truncated,
    generatedAt: new Date().toISOString(),
  }, 200, origin);
}

// ── Entry ────────────────────────────────────────────────

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
  // One function rather than five, so there is one place where the checks
  // above live and one thing to deploy.
  const body = await req.json().catch(() => ({}));
  const action = body?.action || 'stats';

  if (action === 'users') return listUsers(admin, body, origin);
  if (action === 'user') return userDetail(admin, body, origin);
  if (action === 'setPlan') return setPlan(admin, body, uid, origin);
  if (action === 'setTrial') return setTrial(admin, body, uid, origin);
  if (action === 'setSignatureLimit') return setSignatureLimit(admin, body, uid, origin);
  if (action === 'setTeam') return setTeam(admin, body, origin);
  if (action === 'stats') return stats(admin, origin);
  // Naming the action matters: "Unknown action." alone says nothing about
  // which one, and the usual cause is a deployment older than the page that
  // called it rather than a typo.
  return json({
    error: `Unknown action "${String(action).slice(0, 40)}". This deployment of admin-stats is older than the panel calling it — redeploy it.`,
  }, 400, origin);
});
