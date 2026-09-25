# Sign Vel — backend setup

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

## Admin panel

The panel lives at **signvel.com/admin** — its own page, because an account
table does not fit in the editor's 392px column. The editor's **Admin** rail
entry is now just the door to it.

Four tabs:

- **Overview** — accounts, new this week and month, signatures saved, how many
  are on trial, how many have lapsed, how many signed in this week, and how
  many have complimentary access. Plus a thirty-day sign-up chart and the plan
  mix. Everything is counted in the function, so two people looking at the same
  moment see the same figures.
- **Accounts** — every account, searchable, filterable by standing, with plan
  changes inline and a detail drawer per row (auth record, last sign-in,
  saved signatures, billing rows). Exports what is on screen as CSV.
- **Billing** — what is wired and what is not. Nothing is connected yet, so
  this tab says so and fills in on its own once something is.
- **System** — which services the panel talks to, how admin rights are granted,
  and the limits the function works within.

It only appears for a profile marked `is_admin`, and every figure and every
write goes through an Edge Function rather than the browser.

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

**4. Open signvel.com/admin.** It loads the figures and the account list by
itself. If the deployed function is older than the page, the panel says so and
names the command above rather than showing blanks.

If you host the site anywhere besides signvel.com or the workers.dev URL, add
that origin to `ALLOWED_ORIGINS` at the top of the function — it does not use a
wildcard, so an unlisted origin is refused.

### Giving somebody complimentary access

Open their row's **Details** and use the grant buttons: +30 days, +90 days,
+1 year, +10 years, or *End now* to take it back. Counted from now, not added
to whatever is left.

It moves `trial_ends_at`, not `plan`, and that is deliberate. Entitlement is
the OR of the two — see `has_paid_access` in `supabase/schema.sql` — so a date
in the future grants everything a paid plan grants, including hosted images
through the CDN worker. Writing `team` onto an account that never paid would
make the plan column lie, and every figure derived from it would lie too.

The column is trigger-protected against the browser, which is why the grant
goes through the function: `protect_billing_columns` strips `trial_ends_at`,
`plan` and `is_admin` from any update made with the authenticated role.


## Giving one account more signatures

A **Signature allowance** sits in each account's drawer in the admin panel.
Type a number and press **Set**; **Clear** removes it. Empty means the plan
default — one on Solo, ten across a Team, twenty on Business, five on a
live trial, one on free.

It is enforced by the database, on every insert, by `enforce_signature_quota`
in `supabase/schema.sql`. That is the point of doing it there rather than in
the panel: it holds even if somebody calls the API directly.

The allowance is deliberately not a fourth plan value. `plan` says what was
bought and every figure in the panel is derived from it; an allowance is a
number somebody set by hand, so it lives in its own column and leaves the
billing state alone. Same reasoning as the complimentary grant above, which
moves a date rather than the plan.

It overrides the plan **in both directions**. Setting 100 on an organisation
account does not only raise a limit — it replaces "no ceiling" with a hundred.
Clear it to go back to uncapped.

**This needs two steps before the control works:**

1. **Re-run `supabase/schema.sql`** (SQL Editor → paste → Run). Safe to re-run;
   it adds the `signature_limit` column, protects it from the browser, and
   replaces the quota trigger.
2. **Redeploy the function:** `supabase functions deploy admin-stats` — it
   serves the new `setSignatureLimit` action. Until it is deployed the panel
   shows the control and the Set button reports an unknown action.


If **Details** reports an error on every account, the function has been
deployed but `schema.sql` has not been re-run. The panel now works either way
— it asks for the allowance and drops it if the column is not there — but the
allowance itself cannot be set until step 1 above is done, and saying so is
what the Set button will tell you.
To set one without the panel:

```sql
update public.profiles set signature_limit = 100
where email = 'hashir@example.com';   -- their real address
```

## The trial gets five signatures

`enforce_signature_quota` gives a live trial five, a free account one, and a
paid plan no ceiling. An allowance overrides all three.

Five because that is what the site offers — the home page, the pricing page and
both auth pages have said "five signatures" throughout. The trial was held to
one alongside every other free account, so what the offer actually bought was a
wall in the middle of the trial with nothing warning about it.

Applied by re-running `supabase/schema.sql`, or the extract in
`Downloads/signvel-trial-five.sql`. Safe to run more than once. Nothing else
changes: existing rows are untouched, since the rule runs on insert.


### The four tiers, and what enforces each

| Plan | Signatures | Hosted images |
|---|---|---|
| `free`, trial over | 1 | no |
| `free`, trial live | 5 | yes |
| `solo` | 1 | yes |
| `team` | 10, shared across the team | yes |
| `org` | 20 | yes |

The count is `enforce_signature_quota`; the images are `has_paid_access`, which
is `plan <> 'free' or trial_ends_at > now()` — so Solo gets them by being a
plan at all, which is what the card promises.


No plan is uncapped. A subscription buys a fixed number, and anything past it
is a decision made by hand: set a **Signature allowance** on that one account
in the admin drawer and it overrides the plan, for that account only. The
subscription tiers do not move.

A plan the rule has not been taught about falls to 1 rather than to no
ceiling, so a tier added to the constraint and forgotten here is visibly too
small instead of silently unlimited.
## Teams

The Team plan sells three things that all needed the same missing piece:
shared brand defaults, section locks that reach other people, and ten
signatures across a company rather than ten each. None of them mean anything
without somewhere to say who is in the company. `public.teams` is that.

A team has an owner, a name, and two jsonb columns — `brand_defaults` and
`rollout_locks` — that mirror the editor's own state, for the same reason
signatures store state that way: the shape changes often.

**Membership is not self-service.** `team_id` decides whose brand you inherit
and whose budget you spend, so `protect_billing_columns` strips it from
anything the browser writes, exactly as it does `plan` and `is_admin`. It
moves through the admin panel or it does not move.

**The budget is the team's.** `enforce_signature_quota` follows the team where
there is one: the cap comes from the owner's plan, and the tally counts every
member's signatures. Ten each was the whole company's budget multiplied by its
headcount. An allowance set on one person still overrides both, and is then
counted against that person alone — which is how somebody is given room
without moving the company.

In the admin drawer: **Start a team** makes one owned by that account, **Join**
takes a team id, **Remove** takes them out.

Needs `supabase/schema.sql` re-run, or `Downloads/signvel-teams.sql`, and
`supabase functions deploy admin-stats` for the `setTeam` action.

### What a team is, and is not

A team is one shared budget of ten signatures and one owner whose plan decides
for everyone in it. That is all.

Shared brand defaults and team-wide section locks were on the pricing page and
are not: they were taken off it rather than built, because a shared editor is a
much larger thing than a shared budget — every member's settings would have to
know which of them came from the team, what happens when the owner changes one,
and what a member may override. The columns `brand_defaults` and
`rollout_locks` exist on the table and nothing reads or writes them; they are
where that would go if it is ever wanted.

The editor's own Rollout & install locks still work, for the account that sets
them. They were never team-wide.

### What the panel deliberately cannot do

- **Grant administrator rights.** That stays the SQL statement above. A button
  for it would let one compromised admin session hand over the whole panel.
- **Delete an account.** Irreversible, and it would sit next to the buttons
  used for routine support. Do it in the dashboard, on purpose.
- **Change your own plan or your own access date.** The function refuses it and
  the interface does not offer it, so "I upgraded myself" cannot happen here.

## Images as a paid feature

Photographs and uploaded logos render in a signature only while a subscription
is active. Without one the layouts fall back to a generated monogram for the
company and initials for the person, so a free signature is complete rather
than visibly broken, and the panel says why.

Two halves, and it is worth being clear which is which:

- **In the editor** it is a product boundary, not a security one. The signature
  is assembled in the visitor's own browser and copied to their clipboard, so
  anyone determined can read the markup and put the image back.
- **In the database** it actually holds. The storage policies refuse uploads
  and replacements from a free plan, so a free user cannot obtain a hosted URL
  — and an un-hosted image is stripped by Gmail and Outlook before a recipient
  ever sees it. That is the part that matters commercially: a bypassed preview
  still does not survive being sent.

**Re-run `supabase/schema.sql`** to apply the storage policies. Safe to re-run.

To check it from the app: a free account should see the note in Logo &
headshot and get *"Hosting images needs an active plan"* on upload. To lift it
for an account before Stripe is wired up:

```sql
update public.profiles set plan = 'team' where email = 'you@example.com';
```

The marketing pages are unaffected — they hold static markup generated with
`window.SIGNVEL_SHOW_IMAGES = true`, because they advertise what a paid
signature looks like.

## Serving images from cdn.signvel.com

The section above stops a free account *obtaining* a hosted URL. It does not
stop one that already exists from working, and for a while the pricing page
claimed otherwise. A public Supabase bucket never consults its own RLS:
`/storage/v1/object/public/…` hands the bytes to anyone holding the address,
plan or no plan. The `select` policy on `brand` has never been enforced.

So an image hosted during a trial kept being served forever after it lapsed.
Closing that needs the bucket to be private, and a private bucket serves
nothing without a key — which is what `cdn/worker.js` is. It holds the service
key, asks `has_paid_access()` about the owner on each request, and either
streams the object or returns a transparent pixel.

A signed URL is the usual answer for a private bucket and the wrong one here:
these addresses sit in sent mail for years, and one that expires in an hour
expires in somebody's inbox.

### Wiring it

Nothing changes until the last step, so the order matters — the worker can be
proved before anything depends on it.

**1. Create the worker.** Cloudflare → **Workers & Pages → Create**, name it
`signvel-cdn`, **Edit code**, paste all of `cdn/worker.js`, Deploy. (Or
`wrangler deploy` from `cdn/` if you have the CLI; the dashboard needs no
tooling at all.)

**2. Give it the two secrets.** That worker → **Settings → Variables and
Secrets**, type **Secret**, not Text:

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → `service_role` |

The service key bypasses every policy in this file. It belongs here and in no
other place — never `config.js`, which ships to the browser.

**3. Attach the hostname.** **Settings → Domains & Routes → Add → Custom
domain → `cdn.signvel.com`**. The DNS record is written for you. If the free
plan will not take a custom domain, a **Route** of `cdn.signvel.com/*` does the
same job with a proxied DNS record for `cdn` added by hand.

A plain CNAME at Supabase does not work: Supabase routes by hostname, and
overriding the `Host` header is Enterprise-only on Cloudflare.

**4. Re-run `supabase/schema.sql`.** Safe to re-run; this adds the private
`assets` bucket beside the public `brand` one.

**5. Check the worker answers before switching anything on:**

```bash
curl -s https://cdn.signvel.com/__health
# {"worker":"signvel-cdn","supabaseUrl":true,"serviceKey":true}
#
# Both true means the worker is answering and its secrets are bound. A missing
# secret is otherwise invisible: the lookup fails, everything falls through to
# the pixel, and that is indistinguishable from a lapsed plan.
```

**6. Set `assetHost`** in `config.js` to `https://cdn.signvel.com`. That is the
switch. Until it is set, uploads go to the public bucket exactly as before.

### What it does not do

**Gmail proxies images through its own servers and caches them.** Mail already
sitting in a Gmail inbox can keep showing a logo after the plan behind it
lapses, for as long as Google keeps its copy. This stops new impressions
quickly and reliably; it does not reach into mail already delivered. Worth
knowing before describing the behaviour to a customer.

**`brand` stays public and stays in place.** Addresses issued from it are in
mail that has been sent, and making it private would pull images out of
correspondence already in other people's inboxes. Nothing new is written there;
everything from here goes to `assets`.

**Every image view is one worker request** — 100,000/day on Workers Free. The
caching in the worker cuts Supabase egress but not worker invocations, because
a route runs the worker ahead of the cache.

**A paused Supabase project serves nothing.** Free projects pause after a week
without activity, and hosted images stop with everything else. That is an
argument for Pro before real customers depend on this.

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
