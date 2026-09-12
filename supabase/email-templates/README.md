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

## Sending as signvel.com

1. Create an account with an email provider and verify `signvel.com` there.
   Resend, Mailgun, SendGrid and Amazon SES all work; so does the mailbox you
   already have with your domain host, if it offers SMTP.
2. Add the DNS records the provider gives you (SPF, DKIM, usually DMARC) to
   `signvel.com` in Cloudflare. Without them the mail sends but lands in spam.
3. Supabase → Authentication → Emails → **SMTP Settings** → enable custom SMTP
   and fill in the host, port, username and password from the provider.
   - Sender email: `no-reply@signvel.com`
   - Sender name: `Signvel`
4. Send yourself a password reset and check the `From` line.

The SMTP password is a credential. It belongs in that dashboard field and
nowhere else — not in this repo, not in `config.js`.

## Applying the templates

Authentication → Emails → pick the tab → paste the file into **Message body** →
Save.

| File | Tab | Subject to use |
|---|---|---|
| `reset-password.html` | Reset Password | Reset your Signvel password |
| `confirm-signup.html` | Confirm signup | Confirm your email for Signvel |

`{{ .ConfirmationURL }}` is substituted by Supabase at send time. Leave it
exactly as written — everything else is ordinary text and safe to edit.

## Why they are built like signatures

Nested tables, inline styles, `bgcolor` beside `background-color`, no `<style>`
block, no web fonts. Outlook renders mail through Word, which ignores most of
what a browser accepts — the same constraint the editor works under, so the
same shape of markup.

The wordmark is set in type rather than as an image. A logo file would be one
more thing to host, and a blocked image would leave the header empty in
precisely the clients that block images by default.
