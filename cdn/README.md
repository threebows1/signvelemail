# cdn.signvel.com

Serves hosted logos and portraits, and stops serving them when the account
behind them no longer has a plan.

## Why a worker and not a URL

A public Supabase bucket does not consult its own RLS policies. The address
`…/storage/v1/object/public/brand/<uid>/logo.png` hands over the bytes to
anyone holding it, forever, plan or no plan — the `select` policy on that
bucket is never asked. So gating reads means the bucket has to be private, and
a private bucket serves nothing without a key.

The usual answer for a private bucket is a signed URL, and it is no answer
here. These addresses are pasted into a signature and then sit in sent mail for
years. An address that expires in an hour expires in somebody's inbox.

So: the bucket is private, this worker holds the key, and it decides per
request whether to stream the object or return a transparent pixel.

## Deploying

From this directory:

```bash
wrangler deploy
wrangler secret put SUPABASE_URL           # https://<ref>.supabase.co
wrangler secret put SUPABASE_SERVICE_KEY   # the service-role key
```

The service key bypasses RLS entirely. It belongs in a worker secret and
nowhere else — never in `config.js`, which ships to the browser.

Then attach the hostname: **Workers → signvel-cdn → Settings → Domains &
Routes → Add custom domain → `cdn.signvel.com`**. That writes the DNS record
itself. A plain CNAME pointed at Supabase does not work: Supabase routes by
hostname, and overriding the `Host` header is Enterprise-only on Cloudflare.

Last, set `assetHost: 'https://cdn.signvel.com'` in `config.js`. Until that is
set, uploads keep going to the old public bucket and nothing changes — which is
the intended order, so the worker can be proved before anything depends on it.

## What it does

```
GET https://cdn.signvel.com/<user-id>/<file>
  → has_paid_access(<user-id>)?  yes → stream from the private `assets` bucket
                                 no  → 1×1 transparent pixel
```

Entitlement comes from `has_paid_access()`, the same function the storage
policies use, asked over PostgREST — so there is one definition of "entitled"
rather than a second one drifting out here.

## The caching, which is the whole design

Three separate lifetimes, and they are not the same number by accident:

| What | For how long | Why |
|---|---|---|
| Entitlement answer | 5 minutes | How long a lapse takes to bite |
| Object bytes, at the edge | 1 day | Uploads are timestamped and never change |
| `Cache-Control` sent to the recipient | 5 minutes | A mail client that cached it for a year would keep showing a logo that has stopped being paid for |

Access is re-decided on every request regardless of the object cache, which is
what makes the long cache on the bytes safe.

## What this cannot do

**Gmail proxies images through `googleusercontent.com` and caches them on its
own side.** For mail already sitting in a Gmail inbox, the logo can keep
appearing after a plan lapses, for as long as Google keeps its copy. Nothing
reachable from here changes that. Newly sent mail fetches fresh and is gated
normally.

The honest summary: this stops *new* impressions, quickly and reliably. It does
not reach back into mail that has already been delivered and cached elsewhere.

**Free-plan ceiling.** Every image view is one worker request — 100k/day on
Workers Free. The caching above keeps Supabase egress down but does not reduce
worker invocations, because a route runs the worker before the cache. Workers
Paid is $5/month for 10M.

## The old bucket

`brand` is still public and still there, on purpose. Addresses issued from it
are in mail that has been sent, and making it private would take images out of
correspondence already in other people's inboxes. Nothing new is written to it;
everything from here goes to `assets`.
