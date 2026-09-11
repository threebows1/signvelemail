# Signvel — backend setup

What you need to do before I can wire the editor to accounts, saved data and
payments. None of this needs code from me first; it produces the four values
the app will need.

**Never paste a secret key into this repo or into chat.** Only two of the
values below belong in client code, and both are designed to be public.

---

## 1. Supabase project

You chose a clean slate, so a fresh project is fine — but if the old Lovable
project still exists, reusing it keeps your existing URL and keys.

1. Create the project. Pick the region closest to your users (Frankfurt or
   Singapore are the usual picks for the UAE; Supabase has no Gulf region).
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, Run.
3. Check **Table Editor** — you should see `profiles`, `signatures`,
   `subscriptions`, and a `brand` bucket under **Storage**.
4. Open **Authentication → Providers** and enable what you want. Email magic
   link needs no setup; Google needs an OAuth client.
5. Under **Authentication → URL Configuration**, add your site URL and
   `http://localhost:3000` so sign-in redirects work in development.

**Values I need** (both are safe to share — they are meant for browsers):

- `SUPABASE_URL` — Settings → API → Project URL
- `SUPABASE_ANON_KEY` — Settings → API → Project API keys → `anon` `public`

**Value I must never see:** the `service_role` key. It bypasses every security
policy. It goes into the Edge Function's environment only.

---

## 2. Stripe

1. Create the account and stay in **Test mode** until the flow works end to end.
2. **Products → Add product**, one per paid plan:
   - *Team* — recurring, monthly and yearly prices
   - *Organisation* — recurring, or "contact us" if you'd rather quote manually
3. Copy each **Price ID** (looks like `price_1Q...`). One per billing interval.
4. **Developers → API keys**: copy the **Publishable key** (`pk_test_...`).
5. Later, once the webhook is deployed, add the endpoint under
   **Developers → Webhooks** and copy its **Signing secret** (`whsec_...`).

**Values I need:**

- `STRIPE_PUBLISHABLE_KEY` — `pk_test_...` (safe in client code)
- The **Price IDs** for each plan

**Values I must never see:** the Secret key (`sk_...`) and the webhook signing
secret. Both go into Edge Function environment variables, set through the
Supabase dashboard.

---

## 3. Hosting

The site is static — plain HTML, CSS and one JavaScript file, no build step —
so any static host works. `server.ps1` is for local development only and
should not be deployed.

**Cloudflare Pages, Netlify or Vercel** all work on the free tier. Connect the
GitHub repo and they deploy on push.

One thing to configure: the editor is `index.html` and the marketing home page
is `landing.html`. Decide which should be at `/`:

- **Landing at `/`** (conventional) — rename `landing.html` → `index.html` and
  `index.html` → `app.html`, then update the links. I can do this in one pass.
- **Keep as-is** — `/` opens the editor. Simpler, but unusual for a product
  with a marketing site.

---

## 4. What I build once you have those

In order, each testable before the next:

1. `config.js` holding the two public keys — the only file you edit by hand.
2. Auth: sign-in screen, session handling, sign-out.
3. Data: `saveState`/`loadState` read and write `signatures.state`, with
   `localStorage` kept as an offline cache so the editor still works logged out.
4. Uploads: files go to Supabase Storage and return public URLs. **This is what
   stops logos breaking in sent mail** — the biggest single fix available.
5. Checkout: pricing buttons open Stripe Checkout.
6. Edge Function: receives Stripe webhooks and updates `subscriptions` and
   `profiles.plan`.
7. Gating: paid features check the plan. The database already enforces the
   free-plan single-signature limit, so the interface only has to explain it.

---

## Admin figures

The editor has an **Admin** section showing how many people have signed up. It
only appears for a profile marked `is_admin`, and the numbers come from an Edge
Function rather than from the browser.

That indirection is the point. Counting users means reading `auth.users`, and
nothing holding the publishable key can do that — Row Level Security hides
other people's rows and the admin endpoints reject the key outright. The count
has to come from somewhere the service-role key can live without being shipped
to anyone.

**1. Re-run `supabase/schema.sql`** (SQL Editor → paste → Run). It is safe to
re-run; this adds the `is_admin` column and extends the trigger that already
stops the browser editing its own plan, so nobody can grant it to themselves.

**2. Make yourself an admin.** In the SQL Editor:

```sql
update public.profiles set is_admin = true where email = 'farrukh@alriyady.ae';
```

If that reports `0 rows`, you have not signed up in the app yet — create the
account first, then run it again.

**3. Deploy the function.** Either

- **Dashboard:** Edge Functions → Deploy a new function → name it exactly
  `admin-stats` → paste the contents of
  `supabase/functions/admin-stats/index.ts` → Deploy. Leave "Verify JWT" on.
- **CLI:** `supabase functions deploy admin-stats`

No keys to set: Supabase injects `SUPABASE_URL`, `SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` into every function's environment automatically.

**4. Sign in to the editor.** An **Admin** entry appears at the bottom of the
left rail. Open it and press *Load figures*.

If you host the editor anywhere besides signvel.com or the workers.dev URL, add
that origin to `ALLOWED_ORIGINS` at the top of the function — it does not use a
wildcard, so an unlisted origin is refused.

## Notes on the schema

- **`signatures.state` is one jsonb column.** The editor's settings object goes
  in whole. While the product is young and controls change weekly, that avoids
  a migration every time you add a slider. Anything you need to query or bill
  on gets a real column instead.
- **Row Level Security is the enforcement**, not the JavaScript. Every table is
  locked to `auth.uid()`.
- **The browser cannot change its own plan.** `profiles.plan`,
  `stripe_customer_id` and `is_admin` are reset by a trigger on any
  authenticated update, so only a service-role connection can move them. A
  column that decides what someone may see or be charged is not one the client
  gets to write.
- **The free-plan limit lives in the database**, so it holds even if someone
  calls the REST API directly rather than using the interface.
