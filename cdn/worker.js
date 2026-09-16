/* ═══════════════════════════════════════════════════════════
   Signvel — cdn.signvel.com

   Serves hosted logos and portraits, and stops serving them when the account
   behind them no longer has a plan.

   Why this exists rather than a plain public URL: a public Supabase bucket
   ignores its own RLS policies. /storage/v1/object/public/… hands the bytes to
   anyone holding the address, so there is no point at which a lapsed plan can
   be noticed. The `assets` bucket is private instead, which means nothing
   reaches it without a key, and this is the only thing holding one.

   A signed URL would be the usual answer for a private bucket and is no answer
   here. These addresses are pasted into a signature and then sit in mail for
   years; an address that expires in an hour expires in the recipient's inbox.

   Request:   https://cdn.signvel.com/<user-id>/<file>
   Upstream:  <SUPABASE_URL>/storage/v1/object/assets/<user-id>/<file>

   Secrets (wrangler secret put):
     SUPABASE_URL           https://<ref>.supabase.co
     SUPABASE_SERVICE_KEY   the service-role key — bypasses RLS, server only
   ═══════════════════════════════════════════════════════════ */

// 1×1 transparent PNG. What a lapsed account's recipients get: the logo is
// simply absent rather than broken. A 404 would show every recipient a torn
// image in correspondence the customer has already sent, which punishes the
// wrong people; the customer sees it missing the next time they look at their
// own signature.
const PIXEL = Uint8Array.from(atob(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
), c => c.charCodeAt(0));

// How long an entitlement answer is reused. The trade the whole design turns
// on: longer means fewer lookups, and a lapse that takes longer to bite.
const ENTITLEMENT_TTL = 300;         // 5 minutes

// The bytes never change — every upload is written under its own timestamped
// name — so they are cached hard. Access is re-decided per request regardless,
// which is what keeps a long cache here safe.
const OBJECT_TTL = 86400;            // 1 day at the edge

function pixel() {
  return new Response(PIXEL, {
    status: 200,
    headers: {
      'content-type': 'image/png',
      // Never cached: the moment a plan is paid, the logo has to come back.
      'cache-control': 'no-store, max-age=0',
      'x-signvel-asset': 'inactive',
    },
  });
}

// Cached in the edge's own store rather than a module variable, because an
// isolate is per-colo and short-lived — a variable would be re-fetched far
// more often than it looks.
async function entitled(uid, env, ctx) {
  const cache = caches.default;
  const key = new Request('https://cdn.signvel.internal/entitlement/' + uid);

  const hit = await cache.match(key);
  if (hit) return (await hit.text()) === 'true';

  let ok = false;
  try {
    const r = await fetch(env.SUPABASE_URL + '/rest/v1/rpc/has_paid_access', {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_KEY,
        'authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ uid }),
    });
    if (!r.ok) return false;          // not cached: a failed lookup must not stick
    ok = (await r.json()) === true;
  } catch (e) {
    return false;                     // same for a network fault
  }

  ctx.waitUntil(cache.put(key, new Response(String(ok), {
    headers: { 'cache-control': 'max-age=' + ENTITLEMENT_TTL },
  })));
  return ok;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);

    // A deployment probe. Without it, a missing secret is invisible: the
    // entitlement lookup fails, every request falls through to the pixel, and
    // that looks exactly like a lapsed plan. Names only — no values, no
    // lengths, nothing that narrows a guess.
    if (url.pathname === '/__health') {
      return Response.json({
        worker: 'signvel-cdn',
        supabaseUrl: !!env.SUPABASE_URL,
        serviceKey: !!env.SUPABASE_SERVICE_KEY,
      }, { headers: { 'cache-control': 'no-store' } });
    }

    // <user-id>/<file>, and nothing else. The uuid is matched rather than
    // trusted so a path cannot be walked into another bucket or another
    // account's folder.
    const m = url.pathname.match(
      /^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/([A-Za-z0-9._-]{1,128})$/
    );
    if (!m) return new Response('Not found', { status: 404 });

    const [, uid, file] = m;

    if (!(await entitled(uid, env, ctx))) return pixel();

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: 'GET' });
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const upstream = await fetch(
      env.SUPABASE_URL + '/storage/v1/object/assets/' + uid + '/' + file,
      { headers: {
          'apikey': env.SUPABASE_SERVICE_KEY,
          'authorization': 'Bearer ' + env.SUPABASE_SERVICE_KEY,
        } }
    );

    // A missing object is a missing object — a pixel here would disguise a
    // genuine fault as an expired plan, which is the confusing failure.
    if (!upstream.ok) return new Response('Not found', { status: 404 });

    const res = new Response(upstream.body, {
      status: 200,
      headers: {
        'content-type': upstream.headers.get('content-type') || 'application/octet-stream',
        // Short for the recipient, long for us. A mail client that cached this
        // for a year would keep showing a logo the account has stopped paying
        // for; the edge copy below is what spares Supabase the traffic.
        'cache-control': 'public, max-age=300',
        'x-signvel-asset': 'active',
      },
    });

    ctx.waitUntil(cache.put(cacheKey, new Response(res.clone().body, {
      headers: {
        'content-type': res.headers.get('content-type'),
        'cache-control': 'public, max-age=' + OBJECT_TTL,
      },
    })));

    return res;
  },
};
