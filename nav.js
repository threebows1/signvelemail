/* ═══════════════════════════════════════════════════════════
   Signvel — signed-in-only navigation

   Reveals anything marked data-auth-only, which ships hidden. The showcase is
   behind sign-in, so offering it in the nav to a signed-out visitor is an
   invitation to a redirect: they click "Showcase", land on a sign-in form, and
   learn nothing about what they were promised.

   This is a presentation hint, not a check. It reads the Supabase session key
   out of localStorage rather than loading the client library, because the
   marketing pages have no other reason to pull a CDN bundle and a token that
   turned out to be expired costs nothing here — templates.html gates itself on
   a real session, and the RLS policies gate the data. The worst case is a link
   shown to somebody who is then asked to sign in, which is what they would
   have got anyway.

   Failing closed is deliberate. A blocked or empty localStorage — a private
   window, cleared site data — leaves the links hidden, which is the state the
   markup already ships in.
   ═══════════════════════════════════════════════════════════ */

(function () {
  var signedIn = false;

  try {
    // Matched by shape rather than hardcoding the project ref, so changing
    // Supabase projects does not silently hide the nav for everyone.
    for (var i = 0; i < localStorage.length; i++) {
      if (/^sb-.+-auth-token$/.test(localStorage.key(i))) { signedIn = true; break; }
    }
  } catch (e) {
    return;   // storage unavailable: stay hidden
  }

  if (!signedIn) return;

  // hidden is removed rather than a display set, so each element goes back to
  // whatever display its own rules give it — these are inline nav links in one
  // place and a button in another.
  var els = document.querySelectorAll('[data-auth-only]');
  for (var j = 0; j < els.length; j++) els[j].hidden = false;
})();
