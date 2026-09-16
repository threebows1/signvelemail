# Auth email templates

Two things decide what an auth email looks like, and they are separate:

| | Where it is set | What it controls |
|---|---|---|
| **Sender** | Authentication → Emails → **SMTP Settings** | The `From` address — whether it reads `signvel.com` or Supabase's own domain |
| **Content** | Authentication → Emails → template tabs | The wording and design, the files in this folder |

Changing the templates alone will not change who the mail is from. Supabase's
built-in sender cannot be re-addressed, so a custom SMTP provider is the only
way to send as `signvel.com`.

There is a second reason to do it: the built-in sender is rate-limited to a
handful of messages an hour and is explicitly not for production. With more
than a couple of sign-ups an hour, people simply stop receiving mail.

## Applying the templates

Authentication → Emails → pick the tab → paste the file into **Message body** →
Save. All three tabs need doing; a tab left untouched keeps Supabase's stock
design, which carries no Sign Vel branding at all.

| File | Tab | Subject to use | Sent by |
|---|---|---|---|
| `confirm-signup.html` | Confirm signup | Confirm your email for Sign Vel | `Cloud.signUp` |
| `magic-link.html` | Magic Link | Your Sign Vel sign-in link | `Cloud.signIn` |
| `reset-password.html` | Reset Password | Reset your Sign Vel password | `Cloud.resetPassword` |

`{{ .ConfirmationURL }}` is substituted by Supabase at send time. Leave it
exactly as written — everything else is ordinary text and safe to edit.

The other tabs (Invite user, Change email address, Reauthentication) have no
file here because nothing in `cloud.js` triggers them yet. Add one when a
flow starts using it.

## Sending as signvel.com

`signvel.com` publishes **no MX and no SPF record** — the domain has never sent
or received mail. Nothing carries over from a mailbox on another domain, so
this is a clean setup.

The route below is **Resend**, chosen because it is free and purpose-built for
transactional mail. Cloudflare Email Service would sit more naturally beside
the Worker, but sending there requires the Workers Paid plan; if this account
ever moves to Paid, that becomes the better option and only steps 1–3 change.

Resend's free tier: 3,000 emails a month, **capped at 100 a day**, 3 domains.
The daily cap is the one to watch — it is a hard ceiling, not a soft throttle.

### 1 — Verify a sending domain (Resend)

Sign up at resend.com, then **Domains** → **Add Domain** → `send.signvel.com`.

A subdomain rather than the apex, deliberately. Resend puts an MX record on the
verified domain to catch bounces; on the apex that would claim inbound mail for
`signvel.com` outright. Keeping it on `send.` leaves the apex free for
Cloudflare Email Routing later, and isolates this sender's reputation from
anything the domain sends in future. The cost is the visible From address:
`no-reply@send.signvel.com` rather than `no-reply@signvel.com`. Verify the
apex instead if that address matters more than the flexibility.

### 2 — Add the records in Cloudflare

Resend shows an MX record, an SPF `TXT`, and a DKIM `TXT` on
`resend._domainkey`. Add all three in the Cloudflare DNS tab for `signvel.com`.

**Set every record to "DNS only" — the grey cloud, not the orange one.** A
proxied record does not resolve the way Resend needs, and verification silently
never completes. It is the single most common reason this step fails.

DMARC is offered too. Resend verifies on SPF, DKIM and MX alone, so a missing
DMARC record will not block sending, but it is worth adding.

Back in Resend, **Verify DNS Records**. Records on Cloudflare DNS usually
resolve within minutes.

### 3 — Create the API key (Resend)

**API Keys** → **Create API Key**, sending permission only. It is shown once,
and it is the SMTP password.

### 4 — Point Supabase at it

Authentication → **SMTP Settings** (`/project/_/auth/smtp`), enable custom SMTP:

| Field | Value |
|---|---|
| Host | `smtp.resend.com` |
| Port | `587` (STARTTLS) — `465` also works for implicit TLS |
| Username | `resend` — the literal string, not an address |
| Password | the API key from step 3 |
| Sender email | `no-reply@send.signvel.com` |
| Sender name | `Sign Vel` |

### 5 — Raise the rate limit

Supabase drops auth email to **30 messages per hour** the moment custom SMTP is
enabled, to protect a new sender's reputation. Left alone it is barely better
than the built-in sender this whole exercise replaces.

Authentication → **Rate Limits** (`/project/_/auth/rate-limits`) → raise the
email limit, but keep it under Resend's 100-a-day ceiling.

### 6 — Test

Trigger a password reset against a real address and check three things: it
arrives, the `From` line reads `Sign Vel <no-reply@send.signvel.com>`, and the
design is the one in this folder rather than Supabase's stock layout. Gmail's
**Show original** will confirm SPF, DKIM and DMARC all pass.

### Replies

The sending address only needs to send — nothing has to receive there. If you
want replies to reach you, Cloudflare Email Routing forwards inbound mail on
the apex to an existing mailbox for free, which is exactly what step 1 kept the
apex free for.

The API key is a credential. It belongs in that Supabase dashboard field and
nowhere else: not in this repo, not in `config.js`, not in `wrangler.jsonc`.

## Why they are built like signatures

Nested tables, inline styles, `bgcolor` beside `background-color`, no `<style>`
block, no web fonts. Outlook renders mail through Word, which ignores most of
what a browser accepts — the same constraint the editor works under, so the
same shape of markup.

## The header logo

The header is a lockup, not a single image: the mark is a hosted PNG, the name
beside it is live text. That split is deliberate. Outlook and most corporate
clients block remote images by default, and an all-image header in those
clients is an empty box — this way the name always renders and only the mark
goes missing. The `<img>` carries `alt=""` for the same reason: the text next
to it already says Sign Vel, so a second reading would be noise.

The site draws that mark as an inline `<svg>`. Mail cannot: Gmail, Outlook and
Yahoo all strip SVG out. So it has to be a raster, served over HTTPS from a
public URL — `https://signvel.com/email-logo.png`.

### Regenerating it

`tools/make-email-logo.ps1` renders the mark headlessly and writes the file
straight to the repository root, which is what Cloudflare serves:

```powershell
powershell -ExecutionPolicy Bypass -File tools/make-email-logo.ps1
```

Or open `tools/make-email-logo.html` and click **Download**, saving it to the
repository root as `email-logo.png`. Either way, deploy afterwards.

It renders at 144×60 and the templates display it at 48×20 — drawn at 3x so it
stays sharp on a retina screen. The ground is filled with `#F5F4FB` to match
the header rather than left transparent, because Outlook's handling of PNG
alpha is the one thing here with a history of rendering as a black box.

Replacing it with a different logo is a matter of dropping a PNG at that same
path. Keep it around 3x its display size, on a flat `#F5F4FB` ground, and
adjust the `width`/`height` attributes in all three templates if the aspect
ratio changes — mail clients need both, and they must match the `style` values
beside them.

**Changing any template means pasting it into Supabase again.** The dashboard
holds its own copy; these files are the source, not the live version.
