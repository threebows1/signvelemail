-- ═══════════════════════════════════════════════════════════
-- Signvel — database schema
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
-- is_admin is held to the same rule for the same reason: a column that decides
-- what someone may see is not one the client gets to write.
create or replace function public.protect_billing_columns()
returns trigger language plpgsql as $$
begin
  if auth.role() = 'authenticated' then
    new.plan := old.plan;
    new.stripe_customer_id := old.stripe_customer_id;
    new.is_admin := old.is_admin;
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
-- The free plan gets one signature. Doing this here rather than in JavaScript
-- means it holds even if someone calls the API directly.
create or replace function public.enforce_signature_quota()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_plan text;
  existing  integer;
begin
  select plan into user_plan from public.profiles where id = new.user_id;
  if coalesce(user_plan, 'free') = 'free' then
    select count(*) into existing from public.signatures where user_id = new.user_id;
    if existing >= 1 then
      raise exception 'The free plan allows one signature. Upgrade to add more.'
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

-- Hosting an image is a paid feature, and this is where that actually holds.
-- The editor hides images on a free plan, but the signature is assembled in the
-- visitor's own browser, so that gate is a product boundary rather than a
-- security one. This is the boundary: a free plan cannot obtain a hosted URL,
-- and an un-hosted image is stripped by Gmail and Outlook before a recipient
-- ever sees it.
create policy "brand owner write" on storage.objects
  for insert with check (
    bucket_id = 'brand'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and plan <> 'free'
    )
  );

-- Same rule on replacement: a free plan must not be able to change what sits
-- at a hosted URL either.
create policy "brand owner update" on storage.objects
  for update using (
    bucket_id = 'brand'
    and auth.uid()::text = (storage.foldername(name))[1]
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and plan <> 'free'
    )
  );

create policy "brand owner delete" on storage.objects
  for delete using (
    bucket_id = 'brand' and auth.uid()::text = (storage.foldername(name))[1]
  );
