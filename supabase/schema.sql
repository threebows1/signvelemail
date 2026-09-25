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
                     check (plan in ('free','team','org')),
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

-- ── Stop the browser editing its own plan or granting itself admin ────
-- Users may update their profile (name, etc.) but plan and customer id are
-- billing state and must only move via the webhook's service-role connection.
-- is_admin and trial_ends_at are held to the same rule for the same reason: a
-- column that decides what someone may see, or for how long, is not one the
-- client gets to write.
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
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_billing on public.profiles;
create trigger profiles_protect_billing before update on public.profiles
  for each row execute function public.protect_billing_columns();

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

-- ── Plan limits, enforced in the database ─────────────────
-- What an account may keep, in one place. Doing it here rather than in
-- JavaScript means it holds even if someone calls the API directly.
--
--   an allowance   whatever it says
--   a paid plan    no ceiling
--   on trial       five, which is what the site offers for the thirty days
--   free           one
--
-- The trial used to be held to one alongside every other free account, on the
-- reasoning that the cap was one of the things being tried. The site has said
-- "five signatures" on the home page, the pricing page and both auth pages the
-- whole time, so what that actually bought was a wall in the middle of the
-- trial with no warning attached. Five here is the site's own promise, kept.
--
-- signature_limit overrides all of it when set. It is the one number that
-- decides, so an allowance can be given to a free account and an organisation
-- can be held to a hundred; leave it null and nothing about an account changes.
create or replace function public.enforce_signature_quota()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_plan  text;
  allowance  integer;
  trial_end  timestamptz;
  existing   integer;
  cap        integer;
begin
  select plan, signature_limit, trial_ends_at
    into user_plan, allowance, trial_end
    from public.profiles where id = new.user_id;

  -- Null cap means unlimited, which is why this is not simply a number with a
  -- large default.
  if allowance is not null then
    cap := allowance;
  elsif coalesce(user_plan, 'free') <> 'free' then
    cap := null;
  elsif trial_end is not null and trial_end > now() then
    cap := 5;
  else
    cap := 1;
  end if;

  if cap is not null then
    select count(*) into existing from public.signatures where user_id = new.user_id;
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
