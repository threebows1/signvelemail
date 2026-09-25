-- ═══════════════════════════════════════════════════════════
-- Sign Vel — database schema
--
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is guarded.
--
-- Design notes
--   * The editor's entire settings object is stored as one jsonb column
--     (signatures.state). That is deliberate: the shape changes often while
--     the product is young, and jsonb means no migration every time a control
--     is added. Anything queried or billed on gets its own column.
--   * Row Level Security is the real enforcement. The client is untrusted —
--     plan gating in JavaScript is only for the interface.
-- ═══════════════════════════════════════════════════════════

-- ── Profiles ──────────────────────────────────────────────
-- One row per auth user. `plan` is written by the Stripe webhook, never by
-- the browser (see the policies below: users may update their row, but the
-- plan column is protected by a trigger).
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  email              text,
  full_name          text,
  plan               text not null default 'free'
                     check (plan in ('free','solo','team','org')),
  stripe_customer_id text unique,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Added after the first release, so this runs as an alter rather than being
-- folded into the create above — otherwise re-running this file would leave an
-- existing table without the column.
--
-- Grants access to the admin figures in the editor. Like `plan`, it is not
-- something the browser may set: the trigger below strips any attempt, so the
-- only way to become an admin is this, run here in the SQL editor:
--
--   update public.profiles set is_admin = true where email = 'you@example.com';
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- The plan set, as a constraint that can change. `create table if not exists`
-- leaves an existing table's constraints alone, so adding a tier to the column
-- definition above does nothing on a database that already has the table —
-- which is every database that matters. Stated again here so re-running this
-- file actually applies it.
alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check
  check (plan in ('free','solo','team','org'));

-- ── A signature allowance for one account ─────────────────
-- Null means "whatever the plan gives", which is what every account starts as.
-- A number is an allowance set by hand for that one account, and it overrides
-- the plan in both directions: it is how somebody on the free tier is given
-- ten without being marked as having paid for them, and how an organisation is
-- given a hundred.
--
-- Deliberately not a fourth plan value, for the same reason the trial is a date
-- rather than a tier: the plan column says what was bought, and every figure in
-- the admin panel is derived from it. An allowance is not a purchase.
alter table public.profiles
  add column if not exists signature_limit integer
  check (signature_limit is null or signature_limit > 0);

-- Every account starts on a 30-day trial with the paid features switched on.
-- Kept separate from `plan` rather than added to it as a fourth value: a trial
-- is a date, not a tier, and someone can be on a paid plan and still have an
-- unexpired trial date sitting behind it. Entitlement is the OR of the two —
-- see has_paid_access below.
--
-- Adding the column with a default backfills existing rows, so anyone who
-- signed up before this runs gets their thirty days from today rather than
-- being expired on arrival.
alter table public.profiles
  add column if not exists trial_ends_at timestamptz not null default (now() + interval '30 days');

-- The one question the rest of the schema asks about entitlement, in one
-- place. security definer so it can read profiles from inside a storage
-- policy, where the caller only sees their own row.
create or replace function public.has_paid_access(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = uid
      and (plan <> 'free' or trial_ends_at > now())
  );
$$;

-- ── Signatures ────────────────────────────────────────────
-- `state` holds the editor's S object verbatim.
create table if not exists public.signatures (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'My signature',
  state      jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists signatures_user_id_idx on public.signatures(user_id);
-- At most one default signature per user.
create unique index if not exists signatures_one_default_per_user
  on public.signatures(user_id) where is_default;

-- ── Subscriptions ─────────────────────────────────────────
-- Written only by the Stripe webhook (service-role key). Readable by the owner
-- so the interface can show status without a round trip to Stripe.
create table if not exists public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id        text,
  status                 text,
  quantity               integer default 1,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

-- ── updated_at maintenance ────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists signatures_touch on public.signatures;
create trigger signatures_touch before update on public.signatures
  for each row execute function public.touch_updated_at();

drop trigger if exists subscriptions_touch on public.subscriptions;
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ── Create a profile automatically on sign-up ─────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── Row Level Security ────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.signatures    enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "read own profile"   on public.profiles;
drop policy if exists "update own profile" on public.profiles;
create policy "read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "read own signatures"   on public.signatures;
drop policy if exists "insert own signatures" on public.signatures;
drop policy if exists "update own signatures" on public.signatures;
drop policy if exists "delete own signatures" on public.signatures;
create policy "read own signatures"   on public.signatures for select using (auth.uid() = user_id);
create policy "insert own signatures" on public.signatures for insert with check (auth.uid() = user_id);
create policy "update own signatures" on public.signatures for update using (auth.uid() = user_id);
create policy "delete own signatures" on public.signatures for delete using (auth.uid() = user_id);

-- Read-only to the owner. Writes come from the webhook, which uses the
-- service-role key and bypasses RLS entirely.
drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription" on public.subscriptions for select using (auth.uid() = user_id);


-- ── Storage: brand assets ─────────────────────────────────
-- Public-read bucket. This is what fixes broken logos in sent mail: uploads
-- become real https URLs instead of data: URIs, which Gmail and Outlook strip.
-- Files live under <user-id>/… so the policies can scope writes per user.
insert into storage.buckets (id, name, public)
values ('brand', 'brand', true)
on conflict (id) do nothing;

drop policy if exists "brand public read"   on storage.objects;
drop policy if exists "brand owner write"   on storage.objects;
drop policy if exists "brand owner update"  on storage.objects;
drop policy if exists "brand owner delete"  on storage.objects;

create policy "brand public read" on storage.objects
  for select using (bucket_id = 'brand');

-- Hosting an image needs paid access — a live subscription or an unexpired
-- trial — and this is where that actually holds.
-- The editor hides images on a free plan, but the signature is assembled in the
-- visitor's own browser, so that gate is a product boundary rather than a
-- security one. This is the boundary: a free plan cannot obtain a hosted URL,
-- and an un-hosted image is stripped by Gmail and Outlook before a recipient
-- ever sees it.
create policy "brand owner write" on storage.objects
  for insert with check (
    bucket_id = 'brand'
    and auth.uid()::text = (storage.foldername(name))[1]
    and public.has_paid_access(auth.uid())
  );

-- Same rule on replacement: a free plan must not be able to change what sits
-- at a hosted URL either.
create policy "brand owner update" on storage.objects
  for update using (
    bucket_id = 'brand'
    and auth.uid()::text = (storage.foldername(name))[1]
    and public.has_paid_access(auth.uid())
  );

create policy "brand owner delete" on storage.objects
  for delete using (
    bucket_id = 'brand' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ── Gated assets ──────────────────────────────────────────
-- The `brand` bucket above is public, and a public bucket does not consult
-- these policies at all: /storage/v1/object/public/… serves the bytes to
-- anyone holding the URL, plan or no plan. That is why the select policy on it
-- reads as unconditional — it is not being enforced either way.
--
-- This bucket is private, so nothing is served from it directly. The only
-- reader is the cdn worker, which holds the service key, asks
-- has_paid_access() about the owner, and streams the object back or returns a
-- transparent pixel. That is where access actually stops when a plan lapses.
--
-- `brand` is left in place on purpose. URLs already issued from it are sitting
-- in mail that has been sent, and breaking those would take images out of
-- correspondence that is already in other people's inboxes. Everything from
-- here goes to `assets`; nothing new is written to `brand`.
insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do nothing;

drop policy if exists "assets owner read"   on storage.objects;
drop policy if exists "assets owner write"  on storage.objects;
drop policy if exists "assets owner update" on storage.objects;
drop policy if exists "assets owner delete" on storage.objects;

-- Only for the account's own use through the API — the worker reads with the
-- service key and bypasses this entirely. Recipients never authenticate, which
-- is the whole point: they reach the image through the worker or not at all.
create policy "assets owner read" on storage.objects
  for select using (
    bucket_id = 'assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "assets owner write" on storage.objects
  for insert with check (
    bucket_id = 'assets'
    and auth.uid()::text = (storage.foldername(name))[1]
    and public.has_paid_access(auth.uid())
  );

create policy "assets owner update" on storage.objects
  for update using (
    bucket_id = 'assets'
    and auth.uid()::text = (storage.foldername(name))[1]
    and public.has_paid_access(auth.uid())
  );

create policy "assets owner delete" on storage.objects
  for delete using (
    bucket_id = 'assets' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- The worker asks this over PostgREST rather than reading profiles itself, so
-- entitlement has one definition and it is the one the policies already use.
grant execute on function public.has_paid_access(uuid) to service_role;

-- ── Teams ─────────────────────────────────────────────────
-- The Team plan sells three things that all need the same missing piece:
-- shared brand defaults, section locks that reach other people, and ten
-- signatures across a company rather than ten each. None of them mean anything
-- without somewhere to say who is in the company, which is what this is.
--
-- A team owns its brand: the defaults every member's editor starts from, and
-- which sections they may change. Both are jsonb because they mirror the
-- editor's own state, which changes shape often — the same reason signatures
-- store their state that way rather than in columns.
create table if not exists public.teams (
  id             uuid primary key default gen_random_uuid(),
  name           text not null default 'My team',
  owner_id       uuid not null references auth.users(id) on delete cascade,
  -- The keys the editor calls SCOPED_KEYS, as the owner set them.
  brand_defaults jsonb not null default '{}'::jsonb,
  -- {"typography":"locked","disclaimer":"editable", ...}
  rollout_locks  jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists teams_owner_idx on public.teams(owner_id);

-- Membership. One team per person: a signature belongs to one company, and
-- "which of my teams is this for" is a question the editor would then have to
-- ask on every screen.
alter table public.profiles
  add column if not exists team_id uuid references public.teams(id) on delete set null;

create index if not exists profiles_team_idx on public.profiles(team_id);

drop trigger if exists teams_touch on public.teams;
create trigger teams_touch before update on public.teams
  for each row execute function public.touch_updated_at();

-- ── Who may see and change a team ─────────────────────────
-- Written as security-definer helpers because the policies below need to read
-- profiles, and a policy that reads the table it protects recurses.
create or replace function public.team_of(uid uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select team_id from public.profiles where id = uid;
$$;

create or replace function public.owns_team(uid uuid, tid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.teams where id = tid and owner_id = uid);
$$;

alter table public.teams enable row level security;

-- A member reads their own team, because their editor starts from its brand.
drop policy if exists "read own team" on public.teams;
create policy "read own team" on public.teams for select
  using (id = public.team_of(auth.uid()) or owner_id = auth.uid());

-- Only the owner writes the brand. A member changing the shared defaults would
-- be the opposite of what the plan sells.
drop policy if exists "owner updates team" on public.teams;
create policy "owner updates team" on public.teams for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "owner creates team" on public.teams;
create policy "owner creates team" on public.teams for insert
  with check (owner_id = auth.uid());

-- ── Membership is not self-service ────────────────────────
-- team_id decides whose brand somebody inherits and whose signature budget
-- they spend, so it is held to the same rule as plan and is_admin: not a
-- column the browser gets to write. Someone could otherwise join a paying
-- company's team with one PATCH.
create or replace function public.protect_billing_columns()
returns trigger language plpgsql as $$
begin
  if auth.role() = 'authenticated' then
    new.plan := old.plan;
    new.stripe_customer_id := old.stripe_customer_id;
    new.is_admin := old.is_admin;
    -- Otherwise the trial is extended with one PATCH from the browser.
    new.trial_ends_at := old.trial_ends_at;
    -- An allowance decides how many signatures an account may have, so it is
    -- held to the same rule: not a column the client gets to write.
    new.signature_limit := old.signature_limit;
    -- Nor is the team they belong to.
    new.team_id := old.team_id;
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_billing on public.profiles;
create trigger profiles_protect_billing before update on public.profiles
  for each row execute function public.protect_billing_columns();

-- ── Ten signatures across the team, not ten each ──────────
-- The cap and the tally now both follow the team where there is one. A Team
-- plan sold as ten signatures meant ten each while everybody was their own
-- island, which is the whole company's budget multiplied by its headcount.
--
-- The cap comes from the team owner's plan, because the owner is who pays.
create or replace function public.enforce_signature_quota()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  team       uuid;
  payer      uuid;
  user_plan  text;
  allowance  integer;
  trial_end  timestamptz;
  existing   integer;
  cap        integer;
begin
  select team_id into team from public.profiles where id = new.user_id;

  -- In a team, the owner's standing decides for everyone in it; alone, your
  -- own does. An allowance set on the individual still overrides both, which
  -- is how one person in a team can be given room without moving the company.
  select signature_limit into allowance from public.profiles where id = new.user_id;

  if team is not null then
    select owner_id into payer from public.teams where id = team;
  else
    payer := new.user_id;
  end if;

  select plan, trial_ends_at into user_plan, trial_end
    from public.profiles where id = payer;

  if allowance is not null then
    cap := allowance;
  elsif coalesce(user_plan, 'free') = 'solo' then
    -- One, as sold. Caught before the "any paid plan is uncapped" branch
    -- below, or Solo would quietly be the same as Business.
    cap := 1;
  elsif coalesce(user_plan, 'free') = 'team' then
    cap := 10;
  elsif coalesce(user_plan, 'free') <> 'free' then
    cap := null;                       -- org and anything above: no ceiling
  elsif trial_end is not null and trial_end > now() then
    cap := 5;
  else
    cap := 1;
  end if;

  if cap is not null then
    if team is not null and allowance is null then
      -- The team's whole budget, spent by whoever spends it first.
      select count(*) into existing
        from public.signatures s
        join public.profiles p on p.id = s.user_id
       where p.team_id = team;
    else
      select count(*) into existing from public.signatures where user_id = new.user_id;
    end if;

    if existing >= cap then
      raise exception 'This account is limited to % signature(s).', cap
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists signatures_quota on public.signatures;
create trigger signatures_quota before insert on public.signatures
  for each row execute function public.enforce_signature_quota();
