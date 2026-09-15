/* ═══════════════════════════════════════════════════════════
   Signvel — auth pages (signin, signup, reset)

   One controller for all three. Each page carries data-auth-page on <body>
   and supplies the fields the flow needs; everything else here is shared, so
   a change to how errors read or how the redirect works happens once.

   This replaced a modal inside the editor. The editor is locked to account
   holders, which meant the only way to sign in was a box floating over an
   application the visitor could not see — and a sign-up form that was, in
   effect, hidden inside the product it was the gateway to.

   Loaded after config.js and cloud.js, both of which it needs.
   ═══════════════════════════════════════════════════════════ */

(function () {
  const page = document.body.dataset.authPage;   // 'signin' | 'signup' | 'reset'
  if (!page) return;

  const $ = id => document.getElementById(id);
  const form     = $('authForm');
  const email    = $('authEmail');
  const password = $('authPassword');
  const confirm  = $('authConfirm');            // signup and reset only
  const submit   = $('authSubmit');
  const msg      = $('authMsg');

  // Where to go once there is a session. ?next= lets the editor send someone
  // here and get them back, but only to a path on this site — an absolute URL
  // in a query string is somebody else's redirect, not ours.
  function destination() {
    const next = new URLSearchParams(location.search).get('next');
    if (next && /^[A-Za-z0-9._-]+\.html$/.test(next)) return next;
    return 'editor.html';
  }

  // Same seam as app.js uses for the editor lock, and for the same reason:
  // tools/auth-pages-check.html has to read where a flow ends up without the
  // harness navigating away mid-assertion.
  function go(url) { (window.__navigate || function (u) { location.replace(u); })(url); }

  function say(text, kind) {
    msg.textContent = text || '';
    msg.className = 'auth-msg' + (text ? '' : ' hidden') + (kind ? ' is-' + kind : '');
  }

  function busy(on, label) {
    submit.disabled = on;
    submit.textContent = on ? (label || 'Working…') : submit.dataset.label;
  }

  submit.dataset.label = submit.textContent;

  // ── Guards ───────────────────────────────────────────────
  if (!window.Cloud || !Cloud.isReady) {
    say('Accounts are not configured on this copy of Signvel.', 'error');
    submit.disabled = true;
    return;
  }

  // Someone already signed in has no business on a sign-in form. On reset the
  // session is the point, so that page checks for it rather than against it.
  Cloud.init().then(() => {
    const signedIn = Cloud.state().signedIn;

    if (page === 'reset') {
      if (!signedIn) {
        // Supabase establishes the recovery session from the URL as the page
        // loads. No session here means the link was already used, has expired,
        // or was opened without its fragment — a forwarded copy, usually.
        say('This reset link is no longer valid. Request a new one and use it within the hour.', 'error');
        form.hidden = true;
        $('resetExpired').hidden = false;
      }
      return;
    }

    if (signedIn) go(destination());
  });

  // ── Submit ───────────────────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (page === 'reset') return doReset();

    const addr = email.value.trim();
    const pw   = password.value;
    if (!addr) { say('Enter your email address.', 'error'); email.focus(); return; }
    if (!pw)   { say('Enter your password.', 'error'); password.focus(); return; }

    if (page === 'signup') {
      if (pw.length < 8) { say('Use at least 8 characters.', 'error'); password.focus(); return; }
      if (confirm && confirm.value !== pw) { say('Those passwords do not match.', 'error'); confirm.focus(); return; }
    }

    busy(true);
    say('Working…', 'working');

    const call = page === 'signup'
      ? Cloud.signUp(addr, pw)
      : Cloud.signInPassword(addr, pw);

    call.then(r => {
      if (!r.ok) { busy(false); say(r.error, 'error'); return; }

      // With "Confirm email" on there is no session yet, so there is nothing
      // to redirect to. The form is replaced rather than left sitting there
      // inviting a second attempt that would only resend.
      if (r.needsConfirm) {
        form.hidden = true;
        say('Account created. Check ' + addr + ' for the confirmation link, then sign in.', 'ok');
        return;
      }
      go(destination());
    });
  });

  // ── Reset ────────────────────────────────────────────────
  function doReset() {
    const pw = password.value;
    if (pw.length < 8) { say('Use at least 8 characters.', 'error'); password.focus(); return; }
    if (confirm.value !== pw) { say('Those passwords do not match.', 'error'); confirm.focus(); return; }

    busy(true, 'Saving…');
    say('Working…', 'working');

    Cloud.updatePassword(pw).then(r => {
      if (!r.ok) { busy(false); say(r.error, 'error'); return; }
      say('Password changed. Taking you to the editor…', 'ok');
      setTimeout(() => go('editor.html'), 900);
    });
  }

  // ── Forgot password (sign-in page only) ──────────────────
  const forgot = $('authForgot');
  if (forgot) {
    forgot.addEventListener('click', function () {
      const addr = email.value.trim();
      if (!addr) { say('Enter your email address first, then press this again.', 'error'); email.focus(); return; }
      say('Sending…', 'working');
      Cloud.resetPassword(addr).then(r => {
        say(r.ok ? 'Reset link sent to ' + addr + '. It is good for one hour.' : r.error, r.ok ? 'ok' : 'error');
      });
    });
  }
})();
