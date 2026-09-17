/* ═══════════════════════════════════════════════════════════
   Sign Vel — cloud layer (Supabase)

   Everything that talks to the network lives here, so app.js stays a pure
   local editor. If this file, its config, or the network is missing, the
   editor still works: it falls back to localStorage and simply never signs
   anyone in. That is deliberate — a signature builder that breaks when
   offline would be worse than one that cannot sync.

   Exposes window.Cloud. Every method resolves rather than throws, and
   reports failure through the returned object, so callers never need a
   try/catch around routine use.
   ═══════════════════════════════════════════════════════════ */

window.Cloud = (function () {
  const cfg = window.SIGNVEL_CONFIG || {};
  const lib = window.supabase;

  // Present only when the library loaded AND config was filled in.
  const ready = !!(lib && cfg.supabaseUrl && cfg.supabaseKey);
  const db = ready ? lib.createClient(cfg.supabaseUrl, cfg.supabaseKey) : null;

  let session = null;
  let profile = null;
  const listeners = [];

  function emit() {
    listeners.forEach(fn => { try { fn(state()); } catch (e) { /* a bad listener must not stop the others */ } });
  }

  function state() {
    return {
      ready,
      signedIn: !!session,
      email: session ? session.user.email : null,
      userId: session ? session.user.id : null,
      plan: profile ? profile.plan : 'free',
      // Only decides whether the panel is offered. The figures themselves come
      // from an Edge Function that checks this again server-side, so faking it
      // here reveals nothing.
      isAdmin: !!(profile && profile.is_admin),
      // Trial. trialDaysLeft is rounded up, so the last part-day still reads
      // as "1 day left" rather than "0" while access is genuinely live.
      trialEndsAt: profile ? profile.trial_ends_at : null,
      trialActive: trialActive(),
      trialDaysLeft: trialDaysLeft(),
      // What the interface actually asks. The same question is asked again by
      // the storage policies, which is where it is enforced.
      entitled: !!(profile && (profile.plan !== 'free' || trialActive())),
    };
  }

  function trialActive() {
    if (!profile || !profile.trial_ends_at) return false;
    return new Date(profile.trial_ends_at).getTime() > Date.now();
  }

  function trialDaysLeft() {
    if (!profile || !profile.trial_ends_at) return 0;
    const ms = new Date(profile.trial_ends_at).getTime() - Date.now();
    return ms > 0 ? Math.ceil(ms / 864e5) : 0;
  }

  async function loadProfile() {
    if (!session) { profile = null; return; }
    const { data } = await db.from('profiles').select('*').eq('id', session.user.id).single();
    profile = data || null;
  }

  // ── Startup ──────────────────────────────────────────────
  async function init() {
    if (!ready) return state();
    try {
      const { data } = await db.auth.getSession();
      session = data.session || null;
      await loadProfile();
      db.auth.onAuthStateChange(async (_evt, s) => {
        session = s || null;
        await loadProfile();
        emit();
      });
    } catch (e) {
      session = null;
    }
    emit();
    return state();
  }

  // ── Auth ─────────────────────────────────────────────────
  // Every link mailed out has to return to a page chosen on purpose, not to
  // whichever page happened to send it. A confirmation opened from signup.html
  // would otherwise land back on the form the account no longer needs, and a
  // reset link would land somewhere with no field to type a new password into.
  function pageUrl(file) {
    const dir = window.location.pathname.replace(/[^/]*$/, '');
    return window.location.origin + dir + file;
  }

  // Magic link: no password to forget, and no password for us to store.
  async function signIn(email) {
    if (!ready) return { ok: false, error: 'Cloud is not configured.' };
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: pageUrl('editor.html') },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  async function signInPassword(email, password) {
    if (!ready) return { ok: false, error: 'Cloud is not configured.' };
    const { error } = await db.auth.signInWithPassword({ email, password });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // With "Confirm email" on, signUp returns no session — the address has to be
  // verified first. needsConfirm tells the caller which message to show.
  async function signUp(email, password) {
    if (!ready) return { ok: false, error: 'Cloud is not configured.' };
    const { data, error } = await db.auth.signUp({
      email, password, options: { emailRedirectTo: pageUrl('editor.html') },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, needsConfirm: !data.session };
  }

  // Sends the reset link. It returns to reset.html, which is the only page
  // that offers a new-password field.
  async function resetPassword(email) {
    if (!ready) return { ok: false, error: 'Cloud is not configured.' };
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: pageUrl('reset.html') });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // Sets a new password on the session already in hand. Following a reset link
  // that session is the recovery one Supabase established from the URL; from
  // inside the account it is the ordinary one. Either way the check that the
  // caller is who they say they are has already happened.
  async function updatePassword(password) {
    if (!ready) return { ok: false, error: 'Cloud is not configured.' };
    const { error } = await db.auth.updateUser({ password });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  async function signOut() {
    if (!ready) return { ok: false };
    await db.auth.signOut();
    session = null; profile = null;
    emit();
    return { ok: true };
  }

  // ── Signature persistence ────────────────────────────────
  // One default signature per user for now; the schema already supports
  // several, and the free plan is capped at one by a database trigger.
  async function loadSignature() {
    if (!ready || !session) return null;
    const { data, error } = await db
      .from('signatures')
      .select('id, name, state')
      .eq('user_id', session.user.id)
      .order('is_default', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(1);
    if (error || !data || !data.length) return null;
    return data[0];
  }

  async function saveSignature(stateObj, name) {
    if (!ready || !session) return { ok: false, error: 'Not signed in.' };
    const existing = await loadSignature();
    const row = {
      user_id: session.user.id,
      name: name || 'My signature',
      state: stateObj,
      is_default: true,
    };
    const q = existing
      ? db.from('signatures').update(row).eq('id', existing.id)
      : db.from('signatures').insert(row);
    const { error } = await q;
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // ── Storage ──────────────────────────────────────────────
  // This is the fix for logos breaking in sent mail. An upload here becomes
  // a real https URL; the data: URIs the browser produces are stripped by
  // Gmail and Outlook before the recipient ever sees them.
  // Hosted images. Which bucket depends on whether the cdn worker is in front:
  //
  //   assetHost set    → the private `assets` bucket, reachable only through
  //                      the worker, which checks the owner still has a plan
  //                      before it serves anything.
  //   assetHost empty  → the public `brand` bucket and its supabase.co URL.
  //                      Serves the same bytes and cannot be switched off — a
  //                      public bucket does not consult its own RLS policies,
  //                      so a lapsed plan goes unnoticed there.
  //
  // Empty is the fallback rather than an error so this file works before the
  // worker exists, and keeps working if it is ever taken away.
  async function uploadAsset(file, kind) {
    if (!ready || !session) return { ok: false, error: 'Sign in to host images.' };
    const host = (cfg.assetHost || '').replace(/\/+$/, '');
    const bucket = host ? 'assets' : 'brand';
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const path = `${session.user.id}/${kind}-${Date.now()}.${ext}`;
    const { error } = await db.storage.from(bucket).upload(path, file, {
      cacheControl: '31536000',
      upsert: true,
      contentType: file.type || undefined,
    });
    if (error) {
      // The storage policy refuses uploads from a free plan. Postgres reports
      // that as a row-level security violation, which is accurate and useless
      // to the person reading it.
      const denied = /row-level security|violates|not authorized|403/i.test(error.message || '');
      return {
        ok: false,
        error: denied
          ? 'Hosting images needs an active plan. Your upload was not saved.'
          : error.message,
      };
    }
    if (host) return { ok: true, url: `${host}/${path}`, path };
    const { data } = db.storage.from('brand').getPublicUrl(path);
    return { ok: true, url: data.publicUrl, path };
  }

  // ── Admin figures ────────────────────────────────────────
  // Counting users needs to read auth.users, which no browser key can do —
  // and should not be able to. The numbers come from the admin-stats Edge
  // Function, which holds the service-role key in its own environment and
  // re-checks is_admin before answering.
  // Every admin call goes through the same function, which re-checks is_admin
  // server-side before doing anything. `action` picks the job.
  async function adminCall(action, payload) {
    if (!ready) return { ok: false, error: 'Cloud is not configured.' };
    if (!session) return { ok: false, error: 'Sign in first.' };
    try {
      const { data, error } = await db.functions.invoke('admin-stats', {
        method: 'POST',
        body: Object.assign({ action }, payload || {}),
      });
      if (error) {
        // invoke() reports any non-2xx as a generic FunctionsHttpError, so the
        // real reason is in the response body rather than the error itself.
        let detail = error.message;
        try {
          const body = await error.context.json();
          if (body && body.error) detail = body.error;
        } catch (e) { /* no JSON body — keep the generic message */ }
        return { ok: false, error: detail };
      }
      return { ok: true, data: data };
    } catch (e) {
      return { ok: false, error: e.message || 'Could not reach the server.' };
    }
  }

  const adminStats = () =>
    adminCall('stats').then(r => r.ok ? { ok: true, stats: r.data } : r);

  // `q` is matched against the address server-side, so searching still works
  // once there are more accounts than the function will return in one page.
  const adminUsers = (q) =>
    adminCall('users', q ? { q } : null).then(r => r.ok ? { ok: true, list: r.data } : r);

  // One account in full — profile, auth record, saved signatures, whatever
  // billing has recorded.
  const adminUser = (userId) =>
    adminCall('user', { userId }).then(r => r.ok ? { ok: true, detail: r.data } : r);

  // Grants or removes paid access for someone else. The function refuses a
  // plan outside the allowed set, and refuses the caller's own account.
  const adminSetPlan = (userId, plan) =>
    adminCall('setPlan', { userId, plan }).then(r => r.ok ? { ok: true, user: r.data.user } : r);

  // Complimentary access: moves trial_ends_at rather than the plan, because
  // nobody paid and the plan column should not say otherwise. days: 0 ends it.
  const adminSetTrial = (userId, days) =>
    adminCall('setTrial', { userId, days }).then(r => r.ok ? { ok: true, user: r.data.user } : r);

  return {
    init, signIn, signInPassword, signUp, resetPassword, updatePassword, signOut,
    loadSignature, saveSignature, uploadAsset,
    adminStats, adminUsers, adminUser, adminSetPlan, adminSetTrial,
    state,
    onChange(fn) { listeners.push(fn); },
    get isReady() { return ready; },
  };
})();
