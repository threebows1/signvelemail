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
      // What the person calls themselves and looks like, for the account menu
      // and the profile page. Theirs to change; neither is billing state.
      fullName: profile ? (profile.full_name || '') : '',
      avatarUrl: profile ? (profile.avatar_url || '') : '',
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

  // The person's own details. Only these two columns, whatever is passed —
  // plan, admin and the rest are trigger-protected anyway, but a function
  // that forwarded any field would invite somebody to try.
  async function updateProfile(fields) {
    if (!ready || !session) return { ok: false, error: 'Not signed in.' };
    const row = {};
    if (fields && 'fullName' in fields) row.full_name = String(fields.fullName || '').trim().slice(0, 120);
    if (fields && 'avatarUrl' in fields) row.avatar_url = fields.avatarUrl || null;
    const { error } = await db.from('profiles').update(row).eq('id', session.user.id);
    if (error) {
      if (/avatar_url/i.test(error.message || '')) return { ok: false, error: 'Profile pictures need schema.sql re-run first.' };
      return { ok: false, error: error.message };
    }
    await loadProfile();
    emit();
    return { ok: true };
  }

  // A new address has to be confirmed from that inbox before it takes over;
  // until then sign-in stays on the old one. Supabase sends the link.
  async function changeEmail(email) {
    if (!ready || !session) return { ok: false, error: 'Not signed in.' };
    const { error } = await db.auth.updateUser({ email: String(email || '').trim() });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  async function signOut() {
    if (!ready) return { ok: false };
    await db.auth.signOut();
    session = null; profile = null;
    emit();
    return { ok: true };
  }

  // ── Signatures ─────────────────────────────────────────
  // An account keeps several signatures — one on Solo, five on a trial, ten
  // across a Team, twenty on Business, more by allowance — and one of them is
  // the default. These used to be a single "load the default, save over it"
  // pair, which is how the editor had no way to open any other.

  // Every signature the account keeps, the default first, then newest.
  async function listSignatures() {
    if (!ready || !session) return { ok: false, error: 'Not signed in.' };
    const { data, error } = await db
      .from('signatures')
      .select('id, name, is_default, created_at, updated_at, state')
      .eq('user_id', session.user.id)
      .order('is_default', { ascending: false })
      .order('updated_at', { ascending: false });
    return error ? { ok: false, error: error.message } : { ok: true, list: data || [] };
  }

  // One signature: the one asked for, or the default when none is named — so
  // opening the editor with no ?sig= still lands where it always did.
  async function loadSignature(id) {
    if (!ready || !session) return null;
    let q = db.from('signatures').select('id, name, state, is_default').eq('user_id', session.user.id);
    q = id
      ? q.eq('id', id)
      : q.order('is_default', { ascending: false }).order('updated_at', { ascending: false });
    const { data, error } = await q.limit(1);
    if (error || !data || !data.length) return null;
    return data[0];
  }

  // Saves what the editor has open over the signature it came from. Only the
  // state is written — the name is the dashboard's to set, and overwriting it
  // on every keystroke would undo a rename. An account with nothing saved yet
  // gets its first signature here, and that one is the default.
  async function saveSignature(stateObj, name, id) {
    if (!ready || !session) return { ok: false, error: 'Not signed in.' };
    const target = id ? { id } : await loadSignature();
    if (target && target.id) {
      const { error } = await db.from('signatures')
        .update({ state: stateObj })
        .eq('id', target.id).eq('user_id', session.user.id);
      return error ? { ok: false, error: error.message } : { ok: true, id: target.id };
    }
    const { data, error } = await db.from('signatures')
      .insert({ user_id: session.user.id, name: name || 'My signature', state: stateObj, is_default: true })
      .select('id').single();
    return error ? { ok: false, error: quotaMessage(error) } : { ok: true, id: data.id };
  }

  // The database refuses a signature past the limit with a check_violation
  // that already says the number. Passed through as it is; anything else keeps
  // its own message.
  function quotaMessage(error) {
    return (error && error.code === '23514') ? error.message : (error && error.message) || 'Could not save.';
  }

  // A new signature. The default only when it is the account's first — adding
  // a second must not quietly move which one everything else uses.
  async function createSignature(name, stateObj) {
    if (!ready || !session) return { ok: false, error: 'Not signed in.' };
    const { count } = await db.from('signatures')
      .select('id', { count: 'exact', head: true }).eq('user_id', session.user.id);
    const { data, error } = await db.from('signatures')
      .insert({ user_id: session.user.id, name: name || 'New signature', state: stateObj || {}, is_default: !count })
      .select('id').single();
    return error ? { ok: false, error: quotaMessage(error) } : { ok: true, id: data.id };
  }

  async function duplicateSignature(id) {
    const src = await loadSignature(id);
    if (!src) return { ok: false, error: 'That signature is not there any more.' };
    return createSignature((src.name || 'Signature') + ' copy', src.state);
  }

  async function renameSignature(id, name) {
    if (!ready || !session) return { ok: false, error: 'Not signed in.' };
    const clean = String(name || '').trim().slice(0, 80);
    if (!clean) return { ok: false, error: 'Give it a name.' };
    const { error } = await db.from('signatures')
      .update({ name: clean }).eq('id', id).eq('user_id', session.user.id);
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // Deleting the default hands the role to the newest one left, so there is
  // always a default while there is anything at all.
  async function deleteSignature(id) {
    if (!ready || !session) return { ok: false, error: 'Not signed in.' };
    const gone = await loadSignature(id);
    const { error } = await db.from('signatures').delete().eq('id', id).eq('user_id', session.user.id);
    if (error) return { ok: false, error: error.message };
    if (gone && gone.is_default) {
      const next = await loadSignature();
      if (next) await setDefaultSignature(next.id);
    }
    return { ok: true };
  }

  // Through the database, not two updates from here: one default per account
  // is a unique index, and clearing the old and setting the new as separate
  // requests can arrive in the wrong order and trip it.
  async function setDefaultSignature(id) {
    if (!ready || !session) return { ok: false, error: 'Not signed in.' };
    const { error } = await db.rpc('set_default_signature', { sig: id });
    if (error && /set_default_signature|function/i.test(error.message || '')) {
      return { ok: false, error: 'Making a default needs schema.sql re-run first.' };
    }
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  // How many the account has used and of how many — the same answer the
  // insert rule works from, so the bar and the limit cannot disagree. Without
  // the function yet, the count is still honest and the limit is left unsaid.
  async function signatureUsage() {
    if (!ready || !session) return { ok: false, error: 'Not signed in.' };
    const { data, error } = await db.rpc('signature_usage');
    if (!error && data) return { ok: true, used: data.used, cap: data.cap };
    const { count } = await db.from('signatures')
      .select('id', { count: 'exact', head: true }).eq('user_id', session.user.id);
    return { ok: true, used: count || 0, cap: null, stale: true };
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

  // The campaign's end date, on the profile where the CDN worker can see it.
  // The editor keeps its own copy in the signature's state — that is what stops
  // the banner going out in new copies — but the worker knows only an account
  // id and a file name, so the date has to exist somewhere it can ask about.
  // Not billing, so the account writes its own: RLS allows it and
  // protect_billing_columns leaves it alone.
  async function saveBannerExpiry(date) {
    if (!ready || !session) return { ok: false, error: 'Sign in first.' };
    const value = date ? new Date(date + 'T23:59:59').toISOString() : null;
    const { error } = await db.from('profiles')
      .update({ banner_expires_at: value }).eq('id', session.user.id);
    if (error) {
      // The column arrives with a migration; until it is run this is the one
      // thing that does not work, and saying which is better than a raw error.
      if (/banner_expires_at|column/i.test(error.message || '')) {
        return { ok: false, error: 'Campaign expiry needs schema.sql re-run.' };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }
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

  // How many signatures one account may keep, regardless of its plan. null
  // clears the allowance and puts the account back on what its plan gives.
  const adminSetSignatureLimit = (userId, limit) =>
    adminCall('setSignatureLimit', { userId, limit }).then(r => r.ok ? { ok: true, user: r.data.user } : r);

  // Which team an account belongs to. 'new' starts one owned by them, null
  // takes them out of one. Membership never moves from the browser — the
  // column is trigger-protected — so it moves here or not at all.
  const adminSetTeam = (userId, teamId, name) =>
    adminCall('setTeam', { userId, teamId, name }).then(r => r.ok ? { ok: true, user: r.data.user } : r);

  return {
    init, signIn, signInPassword, signUp, resetPassword, updatePassword, signOut,
    updateProfile, changeEmail,
    loadSignature, saveSignature, uploadAsset, saveBannerExpiry,
    listSignatures, createSignature, duplicateSignature, renameSignature,
    deleteSignature, setDefaultSignature, signatureUsage,
    adminStats, adminUsers, adminUser, adminSetPlan, adminSetTrial, adminSetSignatureLimit, adminSetTeam,
    state,
    onChange(fn) { listeners.push(fn); },
    get isReady() { return ready; },
  };
})();
