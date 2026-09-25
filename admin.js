/* ═══════════════════════════════════════════════════════════
   Sign Vel — admin panel (/admin)

   Drives admin.html. Every figure and every row on this page comes from the
   admin-stats Edge Function, which holds the service-role key in its own
   environment and re-checks is_admin server-side on every call. Nothing here
   is trusted with anything: is_admin in the browser only decides whether the
   tabs are drawn, and a visitor who forces it sees a panel whose every
   request comes back 403.

   Two rules this file keeps to:

     * Nothing is computed from data the browser was not given. Counts,
       series and totals arrive finished, so two people looking at the same
       moment see the same numbers.

     * Nothing is claimed that is not true. Billing is empty because nothing
       writes the subscriptions table yet, and the Billing tab says exactly
       that rather than deriving revenue from plan names.

   window.__navigate and window.ADMIN are seams for tools/admin-check.html.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const cfg = window.SIGNVEL_CONFIG || {};

  // ── State ───────────────────────────────────────────────
  const A = {
    tab: 'overview',
    me: null,              // the signed-in admin's own user id
    email: '',

    stats: null,
    statsLoading: false,
    statsError: '',

    users: null,           // rows as the function returned them
    usersMeta: null,       // { capped, limit, query }
    usersLoading: false,
    usersError: '',

    query: '',             // filters the loaded rows in the browser
    filter: 'all',         // all | paid | trial | expired | comp | admin
    busy: '',              // the row currently being written
    rowError: '',

    detailId: '',
    detail: null,
    detailLoading: false,
    detailError: '',

    // Set when the deployed function does not know an action this page sends,
    // which means the panel is newer than the function.
    needsDeploy: false,
  };

  const PLANS = ['free', 'solo', 'team', 'org'];

  // Grants offered in the drawer. Days, because trial_ends_at is a date —
  // see the setTrial comment in the function for why this is not a plan.
  const GRANTS = [
    {days: 30,   label: '+30 days'},
    {days: 90,   label: '+90 days'},
    {days: 365,  label: '+1 year'},
    {days: 3650, label: '+10 years'},
    {days: 0,    label: 'End now', danger: true},
  ];

  // ── Helpers ─────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function navigate(url) {
    (window.__navigate || function (u) { window.location.replace(u); })(url);
  }

  function el(id) { return document.getElementById(id); }

  function n(v) { return typeof v === 'number' ? v.toLocaleString() : '—'; }

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'});
  }

  function fmtStamp(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleString();
  }

  // "4 days ago" rather than a date, for the columns that are read as a
  // question about recency rather than about the calendar.
  function ago(iso) {
    if (!iso) return 'never';
    const ms = Date.now() - new Date(iso).getTime();
    if (isNaN(ms)) return '—';
    const mins = Math.floor(ms / 6e4);
    if (mins < 2) return 'just now';
    if (mins < 60) return mins + ' min ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + ' hr ago';
    const days = Math.floor(hrs / 24);
    if (days < 31) return days + ' day' + (days === 1 ? '' : 's') + ' ago';
    const months = Math.floor(days / 30);
    if (months < 24) return months + ' mo ago';
    return Math.floor(days / 365) + ' yr ago';
  }

  function daysLeft(iso) {
    if (!iso) return 0;
    return Math.ceil((new Date(iso).getTime() - Date.now()) / 864e5);
  }

  // Where an account stands, in one place, because the table, the drawer and
  // the filters must agree about it.
  //
  // A grant is detected rather than stored: every account is created with
  // trial_ends_at at signup + 30 days, so an end date more than a month past
  // the day the account was made can only have been put there deliberately.
  function standing(u) {
    const live = !!u.trial_ends_at && new Date(u.trial_ends_at).getTime() > Date.now();
    const comped = !!(u.trial_ends_at && u.created_at &&
      new Date(u.trial_ends_at).getTime() - new Date(u.created_at).getTime() > 31 * 864e5);
    if (u.plan && u.plan !== 'free') return {key: 'paid', cls: 'is-paid', label: u.plan, live, comped};
    if (live) return {key: 'trial', cls: 'is-trial', label: 'trial, ' + daysLeft(u.trial_ends_at) + 'd', live, comped};
    return {key: 'expired', cls: 'is-expired', label: 'expired', live, comped};
  }

  // ── Loading ─────────────────────────────────────────────
  function noteDeploy(err) {
    if (/unknown action/i.test(err || '')) A.needsDeploy = true;
  }

  function loadStats() {
    if (A.statsLoading) return;
    A.statsLoading = true;
    A.statsError = '';
    paint();
    Cloud.adminStats().then(function (r) {
      A.statsLoading = false;
      if (r.ok) { A.stats = r.stats; } else { A.statsError = r.error; noteDeploy(r.error); }
      paint();
    });
  }

  function loadUsers(query) {
    if (A.usersLoading) return;
    A.usersLoading = true;
    A.usersError = '';
    paint();
    Cloud.adminUsers(query || '').then(function (r) {
      A.usersLoading = false;
      if (r.ok) {
        // The older deployment answered { users: [...] } with nothing else;
        // this keeps working against it rather than rendering an empty table.
        const list = r.list || {};
        A.users = list.users || [];
        A.usersMeta = {capped: !!list.capped, limit: list.limit || 0, query: list.query || ''};
      } else {
        A.usersError = r.error;
        noteDeploy(r.error);
      }
      paint();
    });
  }

  function loadDetail(userId) {
    A.detailId = userId;
    A.detail = null;
    A.detailError = '';
    A.detailLoading = true;
    paintDrawer();
    Cloud.adminUser(userId).then(function (r) {
      if (A.detailId !== userId) return;     // a different row was opened meanwhile
      A.detailLoading = false;
      if (r.ok) { A.detail = r.detail; } else { A.detailError = r.error; noteDeploy(r.error); }
      paintDrawer();
    });
  }

  // ── Writes ──────────────────────────────────────────────
  function applyUser(row) {
    if (!row || !A.users) return;
    A.users = A.users.map(function (u) {
      // The write returns the profile columns only; the signature count and
      // the auth facts came from elsewhere and are still true.
      return u.id === row.id ? Object.assign({}, u, row) : u;
    });
    if (A.detail && A.detail.user && A.detail.user.id === row.id) {
      A.detail = Object.assign({}, A.detail, {user: Object.assign({}, A.detail.user, row)});
    }
    // Every figure on the overview is derived from these rows server-side, so
    // it is now stale. Dropped rather than adjusted by hand.
    A.stats = null;
  }

  function setPlan(userId, plan) {
    if (!userId || A.busy) return;
    A.busy = userId;
    A.rowError = '';
    paint();
    Cloud.adminSetPlan(userId, plan).then(function (r) {
      A.busy = '';
      if (r.ok) { applyUser(r.user); } else { A.rowError = r.error; noteDeploy(r.error); }
      paint();
      paintDrawer();
    });
  }

  function setTrial(userId, days) {
    if (!userId || A.busy) return;
    A.busy = userId;
    A.rowError = '';
    paint();
    Cloud.adminSetTrial(userId, days).then(function (r) {
      A.busy = '';
      if (r.ok) { applyUser(r.user); } else { A.rowError = r.error; noteDeploy(r.error); }
      paint();
      paintDrawer();
    });
  }

  // An allowance, in signatures, for one account. Empty clears it.
  // Join the id in the box, start a fresh team, or take them out of one.
  function setTeam(userId, teamId) {
    if (!userId || A.busy) return;
    A.busy = userId;
    A.rowError = '';
    paint();
    Cloud.adminSetTeam(userId, teamId, null).then(function (r) {
      A.busy = '';
      if (r.ok) { applyUser(r.user); } else { A.rowError = r.error; noteDeploy(r.error); }
      paint();
      paintDrawer();
    });
  }

  function setSignatureLimit(userId, limit) {
    if (!userId || A.busy) return;
    A.busy = userId;
    A.rowError = '';
    paint();
    Cloud.adminSetSignatureLimit(userId, limit).then(function (r) {
      A.busy = '';
      if (r.ok) { applyUser(r.user); } else { A.rowError = r.error; noteDeploy(r.error); }
      paint();
      paintDrawer();
    });
  }

  // ── Rows on show ────────────────────────────────────────
  // Filtering happens in the browser over the page the function returned, so
  // typing is instant. The search box also re-asks the server on Enter, which
  // is what finds an address beyond the page limit.
  function rows() {
    if (!A.users) return [];
    const q = A.query.trim().toLowerCase();
    return A.users.filter(function (u) {
      if (q && String(u.email || '').toLowerCase().indexOf(q) === -1 &&
               String(u.id || '').toLowerCase().indexOf(q) === -1) return false;
      if (A.filter === 'all') return true;
      const st = standing(u);
      if (A.filter === 'admin') return !!u.is_admin;
      if (A.filter === 'comp') return st.comped;
      return st.key === A.filter;
    });
  }

  // ── Overview ────────────────────────────────────────────
  function tile(value, label, hint, cls) {
    return '<div class="adm-stat' + (cls ? ' ' + cls : '') + '">' +
      '<span class="adm-stat-num">' + esc(value) + '</span>' +
      '<span class="adm-stat-label">' + esc(label) + '</span>' +
      (hint ? '<span class="adm-stat-hint">' + esc(hint) + '</span>' : '') +
      '</div>';
  }

  function chart(series) {
    if (!series || !series.length) return '';
    let max = 0;
    series.forEach(function (d) { if (d.count > max) max = d.count; });
    let h = '<div class="adm-chart">';
    series.forEach(function (d) {
      const pct = max ? Math.max(3, Math.round((d.count / max) * 100)) : 0;
      h += '<span class="adm-bar' + (d.count ? '' : ' is-zero') + '" title="' + esc(d.date) + ': ' +
           esc(d.count) + '"><i style="height:' + (d.count ? pct : 2) + '%"></i></span>';
    });
    h += '</div><div class="adm-chart-axis"><span>' + esc(series[0].date) + '</span>' +
         '<span>' + esc('peak ' + max + ' a day') + '</span>' +
         '<span>' + esc(series[series.length - 1].date) + '</span></div>';
    return h;
  }

  function planMix(byPlan, total) {
    const keys = PLANS.filter(function (p) { return (byPlan[p] || 0) > 0; });
    const others = Object.keys(byPlan).filter(function (p) { return PLANS.indexOf(p) === -1; });
    if (!total) return '';
    let h = '<div class="adm-mix">';
    keys.concat(others).forEach(function (p) {
      const pct = ((byPlan[p] || 0) / total) * 100;
      const cls = PLANS.indexOf(p) === -1 ? 'adm-mix-free' : 'adm-mix-' + p;
      h += '<span class="adm-mix-seg ' + cls + '" style="width:' + pct.toFixed(2) + '%" title="' +
           esc(p + ': ' + byPlan[p]) + '"></span>';
    });
    h += '</div><div class="adm-legend">';
    keys.concat(others).forEach(function (p) {
      const colour = p === 'team' ? 'var(--accent)' : (p === 'org' ? '#00B37E' : '#C9C4DD');
      h += '<span><i class="adm-dot" style="background:' + colour + '"></i>' +
           esc(p) + ' — ' + esc(byPlan[p]) + '</span>';
    });
    h += '</div>';
    return h;
  }

  function renderOverview() {
    const s = A.stats;
    let h = '<div class="adm-head"><div><h1 class="adm-h">Overview</h1>' +
      '<p class="adm-sub">Counted server-side when you loaded this, not averaged or estimated.</p></div>' +
      '<span class="adm-spacer"></span>' +
      '<button class="adm-mini" data-act="refreshStats"' + (A.statsLoading ? ' disabled' : '') + '>' +
      (A.statsLoading ? 'Counting…' : 'Refresh') + '</button></div>';

    if (A.statsError) h += '<div class="adm-note is-error">' + esc(A.statsError) + '</div>';
    if (A.needsDeploy) h += deployNote();

    if (!s) {
      h += '<div class="adm-card"><div class="adm-empty">' +
           (A.statsLoading ? '<strong>Counting…</strong>Reading the auth table takes a moment.'
                           : '<strong>No figures yet</strong>Nothing has been counted for this session.') +
           '</div></div>';
      return h;
    }

    h += '<div class="adm-stats">' +
      tile(n(s.profiles), 'Accounts', 'Profile rows, one per sign-up', 'is-accent') +
      tile(n(s.newLast7), 'New this week', 'Last 7 days') +
      tile(n(s.newLast30), 'New this month', 'Last 30 days') +
      tile(n(s.signatures), 'Signatures saved', (typeof s.withSignatures === 'number' ? s.withSignatures + ' accounts have at least one' : '')) +
      '</div>';

    h += '<div class="adm-stats">' +
      tile(n(s.onTrial), 'On trial now', 'Free accounts inside their 30 days') +
      tile(n(s.expired), 'Trial ended', 'Past it, and not on a plan', s.expired ? 'is-warn' : '') +
      tile(n(typeof s.activeLast7 === 'number' ? s.activeLast7 : null), 'Signed in this week', 'Actually used the product') +
      tile(n(typeof s.granted === 'number' ? s.granted : null), 'Complimentary', 'Access granted, not paid for') +
      '</div>';

    h += '<div class="adm-card"><div class="adm-card-head"><h2 class="adm-card-h">Sign-ups, last 30 days</h2>' +
      '<span class="adm-spacer"></span><p class="adm-card-note">' + esc(n(s.newLast30)) + ' in the window</p></div>' +
      (s.series ? chart(s.series) : '<div class="adm-empty">This needs the updated function deployed.</div>') +
      '</div>';

    const total = Object.keys(s.byPlan || {}).reduce(function (t, k) { return t + s.byPlan[k]; }, 0);
    h += '<div class="adm-card"><div class="adm-card-head"><h2 class="adm-card-h">Plan mix</h2>' +
      '<span class="adm-spacer"></span><p class="adm-card-note">' + esc(n(total)) + ' accounts</p></div>' +
      planMix(s.byPlan || {}, total) + '</div>';

    h += '<div class="adm-card"><div class="adm-card-head"><h2 class="adm-card-h">Worth knowing</h2></div>';

    // profiles should track users exactly; a gap means the sign-up trigger
    // missed someone, which is worth knowing about rather than averaging over.
    if (typeof s.users === 'number' && typeof s.profiles === 'number' && s.users !== s.profiles) {
      const gap = Math.abs(s.users - s.profiles);
      h += '<div class="adm-note is-warn"><strong>' + gap + ' user' + (gap === 1 ? '' : 's') +
        '</strong> in the auth table without a matching profile row. The sign-up trigger ' +
        '(<code>on_auth_user_created</code>) may not have fired for them — they will have no plan and no trial date.</div>';
    }
    if (s.unconfirmed) {
      h += '<div class="adm-note"><strong>' + esc(n(s.unconfirmed)) + '</strong> account' +
        (s.unconfirmed === 1 ? '' : 's') + ' never confirmed the email address. They cannot sign in until they do.</div>';
    }
    if (s.authTruncated) {
      h += '<div class="adm-note is-warn">There are more accounts than this page reads in one go. ' +
        'Last-seen figures cover the first few thousand only.</div>';
    }
    if (!s.unconfirmed && s.users === s.profiles && !s.authTruncated) {
      h += '<div class="adm-note is-ok">Nothing looks wrong: every auth user has a profile, and every address is confirmed.</div>';
    }
    h += '<p class="adm-card-note">Measured ' + esc(fmtStamp(s.generatedAt)) + '.</p></div>';

    return h;
  }

  // ── Accounts ────────────────────────────────────────────
  function chip(key, label, count) {
    return '<button class="adm-chip" data-act="filter" data-filter="' + key + '" aria-pressed="' +
      (A.filter === key ? 'true' : 'false') + '">' + esc(label) +
      (count == null ? '' : ' <span class="adm-count">' + esc(count) + '</span>') + '</button>';
  }

  function renderAccounts() {
    let h = '<div class="adm-head"><div><h1 class="adm-h">Accounts</h1>' +
      '<p class="adm-sub">Everyone who has signed up. A plan change or a grant takes effect the next time they load the editor.</p></div></div>';

    if (A.usersError) h += '<div class="adm-note is-error">' + esc(A.usersError) + '</div>';
    if (A.rowError) h += '<div class="adm-note is-error">' + esc(A.rowError) + '</div>';
    if (A.needsDeploy) h += deployNote();

    const all = A.users || [];
    const counts = {paid: 0, trial: 0, expired: 0, comp: 0, admin: 0};
    all.forEach(function (u) {
      const st = standing(u);
      counts[st.key]++;
      if (st.comped) counts.comp++;
      if (u.is_admin) counts.admin++;
    });

    h += '<div class="adm-tools">' +
      '<input class="adm-search" id="admSearch" type="search" placeholder="Search an address or account id" ' +
      'value="' + esc(A.query) + '" autocomplete="off">' +
      chip('all', 'All', all.length) +
      chip('paid', 'Paid', counts.paid) +
      chip('trial', 'On trial', counts.trial) +
      chip('expired', 'Expired', counts.expired) +
      chip('comp', 'Comped', counts.comp) +
      chip('admin', 'Admins', counts.admin) +
      '<span class="adm-spacer"></span>' +
      '<button class="adm-mini" data-act="exportCsv"' + (all.length ? '' : ' disabled') + '>Export CSV</button>' +
      '<button class="adm-mini" data-act="refreshUsers"' + (A.usersLoading ? ' disabled' : '') + '>' +
      (A.usersLoading ? 'Loading…' : 'Refresh') + '</button>' +
      '</div>';

    if (!A.users) {
      h += '<div class="adm-table-wrap"><div class="adm-empty">' +
        (A.usersLoading ? '<strong>Loading accounts…</strong>' : '<strong>No accounts loaded</strong>Press Refresh.') +
        '</div></div>';
      return h;
    }

    const list = rows();
    if (!list.length) {
      h += '<div class="adm-table-wrap"><div class="adm-empty"><strong>Nothing matches</strong>' +
        (A.query ? 'No loaded account matches “' + esc(A.query) + '”. Press Enter to search the server for it.'
                 : 'No account is in that state.') + '</div></div>';
      return h;
    }

    h += '<div class="adm-table-wrap"><table class="adm-table"><thead><tr>' +
      '<th>Account</th><th>Standing</th><th>Plan</th><th style="text-align:right">Sigs</th>' +
      '<th>Last seen</th><th>Joined</th><th></th></tr></thead><tbody>';

    list.forEach(function (u) {
      const st = standing(u);
      const self = u.id === A.me;
      const busy = A.busy === u.id;

      h += '<tr' + (self ? ' class="is-self"' : '') + '>';

      h += '<td><span class="adm-email">' + esc(u.email || '(no address)') + '</span>' +
        '<span class="adm-meta">' + esc(String(u.id).slice(0, 8)) + (self ? ' · you' : '') +
        (u.confirmed === false ? ' · unconfirmed' : '') + '</span></td>';

      h += '<td><span class="adm-badges"><span class="adm-badge ' + st.cls + '">' + esc(st.label) + '</span>' +
        (st.comped ? '<span class="adm-badge is-grant">comped</span>' : '') +
        (u.is_admin ? '<span class="adm-badge is-admin">admin</span>' : '') +
        (u.confirmed === false ? '<span class="adm-badge is-flag">unconfirmed</span>' : '') +
        '</span></td>';

      h += '<td>';
      if (self) {
        // Changing your own plan here would make the panel a way to upgrade
        // yourself. The function refuses it too; this just says so.
        h += '<span class="adm-badge is-expired">' + esc(u.plan) + '</span>';
      } else {
        h += '<span class="adm-plans">';
        PLANS.forEach(function (p) {
          h += '<button class="adm-mini' + (u.plan === p ? ' is-on' : '') + '" data-act="setPlan" ' +
            'data-user="' + esc(u.id) + '" data-plan="' + p + '"' + (busy ? ' disabled' : '') + '>' + p + '</button>';
        });
        h += '</span>';
      }
      h += '</td>';

      h += '<td class="adm-num">' + esc(typeof u.signatures === 'number' ? u.signatures : '—') + '</td>';
      h += '<td class="adm-when">' + esc(u.last_sign_in_at === undefined ? '—' : ago(u.last_sign_in_at)) + '</td>';
      h += '<td class="adm-when">' + esc(fmtDate(u.created_at)) + '</td>';
      h += '<td><span class="adm-acts"><button class="adm-mini" data-act="detail" data-user="' + esc(u.id) + '">Details</button></span></td>';
      h += '</tr>';
    });

    h += '</tbody></table></div>';

    h += '<p class="adm-card-note" style="margin-top:12px">Showing ' + list.length + ' of ' + all.length +
      ' loaded.' + (A.usersMeta && A.usersMeta.capped
        ? ' The server returned its maximum of ' + A.usersMeta.limit + ' — search to reach the rest.' : '') +
      '</p>';
    h += '<div class="adm-note">Administrator rights are not granted here, and no account can be deleted here. ' +
      'Both stay SQL statements someone has to write on purpose — one hands over this whole panel, ' +
      'and the other destroys work that cannot be recovered.</div>';

    return h;
  }

  // ── Billing ─────────────────────────────────────────────
  function check(done, title, detail) {
    return '<li><span class="adm-state ' + (done ? 'is-yes' : 'is-no') + '">' + (done ? '✓' : '·') + '</span>' +
      '<span><strong>' + esc(title) + '</strong>' + detail + '</span></li>';
  }

  function renderBilling() {
    const s = A.stats;
    const subs = (s && s.subscriptions) || null;
    const hasKey = !!cfg.stripeKey;
    // The keys exist in config.js from the start; what matters is whether any
    // of them has been filled in.
    const prices = cfg.prices || {};
    const priceKeys = Object.keys(prices);
    const filled = priceKeys.filter(function (k) { return !!prices[k]; });
    const hasPrices = filled.length > 0;
    const written = !!(subs && subs.total);

    let h = '<div class="adm-head"><div><h1 class="adm-h">Billing</h1>' +
      '<p class="adm-sub">What is actually connected, and what is not.</p></div></div>';

    h += '<div class="adm-note is-warn"><strong>No payment gateway is connected.</strong> ' +
      'Nobody can be charged yet, and nothing has ever written to the <code>subscriptions</code> table. ' +
      'Everything below is read from the real configuration and the real table, so this page will start ' +
      'filling in on its own the moment a gateway is wired.</div>';

    h += '<div class="adm-stats">' +
      tile(subs ? n(subs.active) : '—', 'Active subscriptions', 'status active or trialing') +
      tile(subs ? n(subs.total) : '—', 'Subscription rows', 'Written only by a webhook') +
      tile(subs ? n(subs.cancelling) : '—', 'Cancelling', 'Ends at period end') +
      tile(s ? n(s.granted) : '—', 'Complimentary', 'Access without a payment') +
      '</div>';

    h += '<div class="adm-card"><div class="adm-card-head"><h2 class="adm-card-h">Gateway wiring</h2></div>' +
      '<ul class="adm-check">' +
      check(hasKey, 'Publishable key in config.js',
        hasKey ? '<span>Set. Only the publishable key belongs in the browser.</span>'
               : '<span>Empty — <code>stripeKey</code> in <code>config.js</code>.</span>') +
      check(hasPrices, 'Price ids for each plan',
        hasPrices ? '<span>' + filled.length + ' of ' + priceKeys.length + ' set.</span>'
                  : '<span>All ' + priceKeys.length + ' empty — <code>prices</code> in <code>config.js</code>.</span>') +
      check(false, 'Checkout session endpoint',
        '<span>A Stripe checkout session has to be created server-side, so this needs its own Edge Function. ' +
        'There is none.</span>') +
      check(written, 'Webhook writing the subscriptions table',
        written ? '<span>Rows exist, so something is writing them.</span>'
                : '<span>Nothing has ever written a row. Until it does, a cancellation cannot move an ' +
                  'account back to free — the only thing that currently ends access is a trial date passing.</span>') +
      check(false, 'Customer portal link',
        '<span>Where somebody changes their own card or cancels. Needs the gateway first.</span>') +
      '</ul></div>';

    if (subs && subs.total) {
      h += '<div class="adm-card"><div class="adm-card-head"><h2 class="adm-card-h">By status</h2></div><ul class="adm-list">';
      Object.keys(subs.byStatus).sort().forEach(function (k) {
        h += '<li><span>' + esc(k) + '</span><span class="adm-when">' + esc(subs.byStatus[k]) + '</span></li>';
      });
      h += '</ul></div>';
    }

    h += '<div class="adm-card"><div class="adm-card-head"><h2 class="adm-card-h">Gaps between what is sold and what is enforced</h2>' +
      '<span class="adm-spacer"></span><p class="adm-card-note">Read from the schema, not opinion</p></div>' +
      '<div class="adm-note">The pricing page sells three paid tiers — one signature at $1.99, ten at $4.99, ' +
      'twenty or more at $16.99 — and the <code>plan</code> column now has a value for each: <code>solo</code>, ' +
      '<code>team</code> and <code>org</code>, beside <code>free</code>.</div>' +
      '<div class="adm-note">What the database gives, in order: an allowance if one is set, then one on ' +
      '<code>solo</code>, ten on <code>team</code>, no ceiling on <code>org</code>, five on a live trial, and ' +
      'one otherwise. A team spends one budget between its members rather than one each. So the numbers on the ' +
      'page are enforced now, not merely printed.</div>' +
      '<div class="adm-note">Still sold and not built: campaign banner expiry, directory sync, and Microsoft 365 ' +
      'transport rules. Shared brand defaults and section locks have a home on the team but the editor does not ' +
      'read them yet.</div>' +
      '<div class="adm-note">Nobody can buy any of it either: <code>stripeKey</code> is empty and every plan ' +
      'button goes to signup. Until a webhook writes the table above, the way to give somebody paid access is ' +
      'the grant in a row’s Details — it moves the trial date, which is what entitlement is checked against.</div>' +
      '</div>';

    return h;
  }

  // ── System ──────────────────────────────────────────────
  function renderSystem() {
    const s = A.stats;
    let h = '<div class="adm-head"><div><h1 class="adm-h">System</h1>' +
      '<p class="adm-sub">What this panel is talking to, and how to change who may see it.</p></div></div>';

    if (A.needsDeploy) h += deployNote();

    h += '<div class="adm-card"><div class="adm-card-head"><h2 class="adm-card-h">Services</h2></div>' +
      '<dl class="adm-kv">' +
      '<dt>Supabase project</dt><dd class="adm-mono">' + esc(cfg.supabaseUrl || 'not configured') + '</dd>' +
      '<dt>Browser key</dt><dd>' + (cfg.supabaseKey ? 'present (publishable)' : 'missing') + '</dd>' +
      '<dt>Admin function</dt><dd class="adm-mono">admin-stats' +
        (A.stats ? ' — answered ' + esc(fmtStamp(s.generatedAt)) : (A.statsError ? ' — ' + esc(A.statsError) : '')) + '</dd>' +
      '<dt>Image host</dt><dd class="adm-mono">' + esc(cfg.assetHost || 'off — images come straight from Supabase') + '</dd>' +
      '<dt>Service-role key</dt><dd>Lives in the function environment and the CDN worker only. Never in this page.</dd>' +
      '</dl></div>';

    h += '<div class="adm-card"><div class="adm-card-head"><h2 class="adm-card-h">Access</h2></div>' +
      '<div class="adm-note">You are signed in as <strong>' + esc(A.email || '—') + '</strong>. ' +
      'This panel is drawn because your profile carries <code>is_admin</code>, and every request it makes is ' +
      'checked against that column again server-side.</div>' +
      '<p class="adm-card-note" style="margin-bottom:8px">To make somebody else an administrator, run this in the Supabase SQL editor:</p>' +
      '<p class="adm-code">update public.profiles set is_admin = true where email = \'them@example.com\';</p>' +
      '<p class="adm-card-note" style="margin-top:14px">To take it away, the same statement with <code>false</code>.</p>' +
      '</div>';

    h += '<div class="adm-card"><div class="adm-card-head"><h2 class="adm-card-h">Limits worth knowing</h2></div>' +
      '<ul class="adm-check">' +
      check(true, 'The account table returns 500 rows at a time',
        '<span>Search re-asks the server, so an address past that is still findable.</span>') +
      check(true, 'Last-seen covers the first 5,000 accounts',
        '<span>Reading auth.users is paged, and this stops one page view becoming fifty requests.</span>') +
      check(true, 'Grants are capped at ten years',
        '<span>Long enough to be permanent, short enough that a typo is not.</span>') +
      check(!!(s && s.series), 'The sign-up series is 30 daily buckets',
        '<span>Counted from profile rows, in the function.</span>') +
      '</ul></div>';

    h += '<div class="adm-card"><div class="adm-card-head"><h2 class="adm-card-h">Deploying the function</h2></div>' +
      '<p class="adm-card-note" style="margin-bottom:8px">This page and <code>supabase/functions/admin-stats</code> ship together. After changing it:</p>' +
      '<p class="adm-code">supabase functions deploy admin-stats</p></div>';

    return h;
  }

  function deployNote() {
    return '<div class="adm-note is-warn"><strong>The deployed function is older than this page.</strong> ' +
      'It rejected an action this panel sends, so some figures and controls will not work until you run ' +
      '<code>supabase functions deploy admin-stats</code>.</div>';
  }

  // ── The drawer ──────────────────────────────────────────
  function renderDetail() {
    if (A.detailLoading) return '<div class="adm-empty"><strong>Loading…</strong></div>';
    // The drawer is where a stale deploy is most likely to be met — Details is
    // one of the newer actions — and it was the one place the explanation was
    // never shown. A bare "Unknown action." in a panel that already knows what
    // that means, and knows the command to fix it, is a wasted error.
    if (A.detailError) {
      return '<div class="adm-note is-error">' + esc(A.detailError) + '</div>' +
        (A.needsDeploy ? deployNote() : '');
    }
    if (!A.detail) return '';

    const d = A.detail;
    const u = d.user || {};
    const st = standing(u);
    const self = u.id === A.me;

    let h = '<div class="adm-badges" style="margin-bottom:18px">' +
      '<span class="adm-badge ' + st.cls + '">' + esc(st.label) + '</span>' +
      (st.comped ? '<span class="adm-badge is-grant">comped</span>' : '') +
      (u.is_admin ? '<span class="adm-badge is-admin">admin</span>' : '') +
      (d.auth && d.auth.confirmed === false ? '<span class="adm-badge is-flag">unconfirmed</span>' : '') +
      '</div>';

    h += '<dl class="adm-kv">' +
      '<dt>Address</dt><dd>' + esc(u.email || '—') + '</dd>' +
      '<dt>Name</dt><dd>' + esc(u.full_name || '—') + '</dd>' +
      '<dt>Account id</dt><dd class="adm-mono">' + esc(u.id || '—') + '</dd>' +
      '<dt>Plan</dt><dd>' + esc(u.plan || '—') + '</dd>' +
      '<dt>Access until</dt><dd>' + esc(fmtStamp(u.trial_ends_at)) +
        (st.live ? ' <span class="adm-badge is-trial">' + daysLeft(u.trial_ends_at) + 'd left</span>' : '') + '</dd>' +
      '<dt>Joined</dt><dd>' + esc(fmtStamp(u.created_at)) + '</dd>' +
      '<dt>Profile changed</dt><dd>' + esc(fmtStamp(u.updated_at)) + '</dd>' +
      '<dt>Last signed in</dt><dd>' + (d.auth ? esc(ago(d.auth.lastSignIn)) : '—') + '</dd>' +
      '<dt>Sign-in method</dt><dd>' + (d.auth ? esc(d.auth.provider) : '—') + '</dd>' +
      '<dt>Stripe customer</dt><dd class="adm-mono">' + esc(u.stripe_customer_id || 'none') + '</dd>' +
      '</dl>';

    // ── Complimentary access ──
    h += '<div class="adm-sec"><h3 class="adm-sec-h">Complimentary access</h3>';
    if (self) {
      h += '<div class="adm-note">This is your own account. Grants and plan changes for it are a SQL statement, ' +
        'not a button here — that keeps “I upgraded myself” out of the trail.</div>';
    } else {
      h += '<div class="adm-note">Moves the access date rather than the plan, because nobody paid: the plan ' +
        'column stays honest and every figure derived from it stays true. Counted from now, not added to what is left.</div>' +
        '<div class="adm-grantrow">';
      GRANTS.forEach(function (g) {
        h += '<button class="adm-mini' + (g.danger ? ' is-danger' : '') + '" data-act="grant" ' +
          'data-user="' + esc(u.id) + '" data-days="' + g.days + '"' +
          (A.busy === u.id ? ' disabled' : '') + '>' + esc(g.label) + '</button>';
      });
      h += '</div>';
      if (A.rowError) h += '<div class="adm-note is-error" style="margin-top:12px">' + esc(A.rowError) + '</div>';
    }
    h += '</div>';

    // ── Team ──
    // A team is what the Team plan actually sells: one brand and one budget of
    // ten signatures shared by the people in it, rather than ten each.
    h += '<div class="adm-sec"><h3 class="adm-sec-h">Team</h3>';
    if (self) {
      h += '<div class="adm-note">Your own account. Move yourself from the SQL editor.</div>';
    } else {
      var team = u.team_id;
      h += '<div class="adm-note">Everyone in a team draws on one budget of ten signatures and, once the ' +
        'editor reads it, one set of brand defaults. The owner’s plan is what decides for all of them.</div>' +
        '<div class="adm-grantrow">' +
        '<input class="adm-input adm-team" id="admTeam" type="text" placeholder="team id" ' +
        'value="' + (team ? esc(String(team)) : '') + '"' + (A.busy === u.id ? ' disabled' : '') + '>' +
        '<button class="adm-mini" data-act="team" data-user="' + esc(u.id) + '"' +
        (A.busy === u.id ? ' disabled' : '') + '>Join</button>' +
        '<button class="adm-mini" data-act="team" data-user="' + esc(u.id) + '" data-new="1"' +
        (A.busy === u.id ? ' disabled' : '') + '>Start a team</button>' +
        '<button class="adm-mini is-danger" data-act="team" data-user="' + esc(u.id) + '" data-leave="1"' +
        (A.busy === u.id || !team ? ' disabled' : '') + '>Remove</button>' +
        '</div>' +
        '<p class="adm-card-note" style="margin-top:8px">' +
        (team ? 'In team ' + esc(String(team).slice(0, 8)) + '…' : 'Not in a team — this account has its own budget.') +
        '</p>';
    }
    h += '</div>';

    // ── Signature allowance ──
    // Deliberately its own section rather than another grant button: a grant is
    // a date and this is a number, and reading them as one control is how you
    // end up giving somebody thirty days when you meant a hundred signatures.
    h += '<div class="adm-sec"><h3 class="adm-sec-h">Signature allowance</h3>';
    if (self) {
      h += '<div class="adm-note">Your own account. Set this from the SQL editor.</div>';
    } else {
      var lim = u.signature_limit;
      h += '<div class="adm-note">How many signatures this one account may keep, whatever its plan says. ' +
        'Leave it empty for the plan default — one on Solo, ten across a Team, no ceiling on Business, five on a live trial, one on free. ' +
        'The database enforces this on every insert, so it holds even against the API.</div>' +
        '<div class="adm-grantrow">' +
        '<input class="adm-input adm-limit" id="admLimit" type="number" min="1" max="100000" ' +
        'placeholder="plan default" value="' + (lim == null ? '' : esc(String(lim))) + '"' +
        (A.busy === u.id ? ' disabled' : '') + '>' +
        '<button class="adm-mini" data-act="limit" data-user="' + esc(u.id) + '"' +
        (A.busy === u.id ? ' disabled' : '') + '>Set</button>' +
        '<button class="adm-mini is-danger" data-act="limit" data-user="' + esc(u.id) + '" data-clear="1"' +
        (A.busy === u.id || lim == null ? ' disabled' : '') + '>Clear</button>' +
        '</div>' +
        '<p class="adm-card-note" style="margin-top:8px">' +
        (lim == null
          ? 'No allowance set — this account follows its plan.'
          : 'Allowance: ' + esc(String(lim)) + ' signature' + (lim === 1 ? '' : 's') + '.') +
        '</p>';
    }
    h += '</div>';

    // ── What they have built ──
    h += '<div class="adm-sec"><h3 class="adm-sec-h">Signatures (' + (d.signatures || []).length + ')</h3>';
    if (!(d.signatures || []).length) {
      h += '<p class="adm-card-note">None saved.</p>';
    } else {
      h += '<ul class="adm-list">';
      d.signatures.forEach(function (sig) {
        h += '<li><span>' + esc(sig.name || 'Untitled') +
          (sig.is_default ? ' <span class="adm-badge is-trial">default</span>' : '') + '</span>' +
          '<span class="adm-when">' + esc(ago(sig.updated_at)) + '</span></li>';
      });
      h += '</ul>';
    }
    h += '</div>';

    // ── Billing against this account ──
    h += '<div class="adm-sec"><h3 class="adm-sec-h">Billing</h3>';
    if (!(d.subscriptions || []).length) {
      h += '<p class="adm-card-note">No subscription rows. Nothing has ever been charged to this account — ' +
        'no gateway is connected yet.</p>';
    } else {
      h += '<ul class="adm-list">';
      d.subscriptions.forEach(function (sub) {
        h += '<li><span>' + esc(sub.status || 'unknown') + ' · ' + esc(sub.stripe_price_id || 'no price') +
          (sub.cancel_at_period_end ? ' · cancelling' : '') + '</span>' +
          '<span class="adm-when">' + esc(fmtDate(sub.current_period_end)) + '</span></li>';
      });
      h += '</ul>';
    }
    h += '</div>';

    return h;
  }

  function paintDrawer() {
    const body = el('admDrawerBody');
    if (!body) return;
    body.innerHTML = renderDetail();
    const title = el('admDrawerTitle');
    if (title) {
      const u = A.detail && A.detail.user;
      title.textContent = u ? (u.email || 'Account') : 'Account';
    }
  }

  function openDrawer(userId) {
    const d = el('admDrawer'), sc = el('admScrim');
    if (d) { d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false'); }
    if (sc) sc.classList.add('is-open');
    loadDetail(userId);
  }

  function closeDrawer() {
    const d = el('admDrawer'), sc = el('admScrim');
    if (d) { d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); }
    if (sc) sc.classList.remove('is-open');
    A.detailId = '';
    A.detail = null;
  }

  // ── Export ──────────────────────────────────────────────
  // Built from the rows on screen, so what is exported is what was being
  // looked at. Assembled in the browser because the rows are already here;
  // asking the server again would risk exporting something else.
  //
  // Split in two so the lines can be asserted without a download starting.
  function csvLines() {
    const list = rows();
    if (!list.length) return [];
    const head = ['email', 'plan', 'standing', 'comped', 'signatures', 'joined', 'access_until', 'last_sign_in', 'confirmed', 'is_admin', 'id'];
    const cell = function (v) {
      const s = v == null ? '' : String(v);
      // A leading =, + or - makes a spreadsheet treat a cell as a formula.
      const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
      return /[",\n]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe;
    };
    const lines = [head.join(',')];
    list.forEach(function (u) {
      const st = standing(u);
      lines.push([
        u.email, u.plan, st.key, st.comped ? 'yes' : 'no',
        typeof u.signatures === 'number' ? u.signatures : '',
        u.created_at, u.trial_ends_at, u.last_sign_in_at, u.confirmed === false ? 'no' : 'yes',
        u.is_admin ? 'yes' : 'no', u.id,
      ].map(cell).join(','));
    });
    return lines;
  }

  function exportCsv() {
    const lines = csvLines();
    if (!lines.length) return lines;

    const blob = new Blob([lines.join('\r\n')], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'signvel-accounts-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    return lines;
  }

  // ── Paint ───────────────────────────────────────────────
  const PANELS = {overview: renderOverview, accounts: renderAccounts, billing: renderBilling, system: renderSystem};

  function paint() {
    Object.keys(PANELS).forEach(function (key) {
      const panel = el('panel-' + key);
      if (!panel) return;
      const on = key === A.tab;
      panel.hidden = !on;
      // Only the visible panel is drawn: the account table is the expensive
      // one, and there is no reason to build it while Billing is on screen.
      if (on) panel.innerHTML = PANELS[key]();
    });

    document.querySelectorAll('.adm-tab').forEach(function (b) {
      b.setAttribute('aria-selected', b.dataset.tab === A.tab ? 'true' : 'false');
    });

    const who = el('admWho');
    if (who) who.textContent = A.email || '';

    // Typing must not be interrupted by a repaint triggered from elsewhere.
    const search = el('admSearch');
    if (search && A.focusSearch) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
    A.focusSearch = false;
  }

  function gate(html) {
    const g = el('admGate');
    if (g) g.innerHTML = html || '';
  }

  function showTabs(on) {
    const t = el('admTabs');
    if (t) t.hidden = !on;
    if (!on) {
      Object.keys(PANELS).forEach(function (key) {
        const p = el('panel-' + key);
        if (p) { p.hidden = true; p.innerHTML = ''; }
      });
    }
  }

  // ── Events ──────────────────────────────────────────────
  function onClick(e) {
    const tab = e.target.closest ? e.target.closest('.adm-tab') : null;
    if (tab && tab.dataset.tab) {
      A.tab = tab.dataset.tab;
      paint();
      // Both of the data tabs need the figures; fetch them once, on arrival.
      if ((A.tab === 'billing' || A.tab === 'system' || A.tab === 'overview') && !A.stats && !A.statsError) loadStats();
      return;
    }

    const btn = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!btn) return;
    const act = btn.dataset.act;

    if (act === 'refreshStats') { A.stats = null; loadStats(); return; }
    if (act === 'refreshUsers') { loadUsers(A.query); return; }
    if (act === 'filter') { A.filter = btn.dataset.filter; paint(); return; }
    if (act === 'setPlan') { setPlan(btn.dataset.user, btn.dataset.plan); return; }
    if (act === 'grant') { setTrial(btn.dataset.user, Number(btn.dataset.days)); return; }
    // Cleared, or whatever is in the box. An empty box is a clear too, so the
    // Set button cannot quietly do nothing when somebody has emptied it.
    if (act === 'team') {
      var tbox = document.getElementById('admTeam');
      var val = btn.dataset.new ? 'new'
        : btn.dataset.leave ? null
        : (tbox ? tbox.value.trim() : '');
      setTeam(btn.dataset.user, val === '' ? null : val);
      return;
    }
    if (act === 'limit') {
      var box = document.getElementById('admLimit');
      var raw = btn.dataset.clear ? '' : (box ? box.value.trim() : '');
      setSignatureLimit(btn.dataset.user, raw === '' ? null : Number(raw));
      return;
    }
    if (act === 'detail') { openDrawer(btn.dataset.user); return; }
    if (act === 'exportCsv') { exportCsv(); return; }
  }

  function onInput(e) {
    if (e.target && e.target.id === 'admSearch') {
      A.query = e.target.value;
      A.focusSearch = true;
      paint();
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && e.target && e.target.id === 'admSearch') {
      e.preventDefault();
      // Reaches past the page the server returned in one go.
      loadUsers(A.query);
      return;
    }
    if (e.key === 'Escape') closeDrawer();
  }

  function bind() {
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('keydown', onKey);
    const close = el('admClose');
    if (close) close.addEventListener('click', closeDrawer);
    const scrim = el('admScrim');
    if (scrim) scrim.addEventListener('click', closeDrawer);
    const out = el('admSignOut');
    if (out) out.addEventListener('click', function () {
      if (window.Cloud && Cloud.isReady) Cloud.signOut().then(function () { navigate('index.html'); });
      else navigate('index.html');
    });
  }

  // ── Start ───────────────────────────────────────────────
  function start(st) {
    if (!st.signedIn) {
      // Sent to sign in and brought back. The allowlist in auth.js accepts a
      // bare .html filename, which this is.
      navigate('signin.html?next=admin.html');
      return;
    }

    A.me = st.userId;
    A.email = st.email || '';

    if (!st.isAdmin) {
      showTabs(false);
      gate('<div class="adm-card"><div class="adm-empty"><strong>Not an administrator</strong>' +
        'This account cannot see the panel. If that is wrong, the <code>is_admin</code> column on your profile ' +
        'is what decides it.</div></div>');
      const who = el('admWho');
      if (who) who.textContent = A.email;
      return;
    }

    gate('');
    showTabs(true);
    paint();
    loadStats();
    loadUsers('');
  }

  function boot() {
    bind();

    if (!window.Cloud || !Cloud.isReady) {
      showTabs(false);
      gate('<div class="adm-card"><div class="adm-empty"><strong>Not connected</strong>' +
        'The Supabase keys in <code>config.js</code> are missing, so there is nothing to administer.</div></div>');
      return;
    }

    showTabs(false);
    gate('<div class="adm-card"><div class="adm-empty"><strong>Checking…</strong>Confirming this account may see the panel.</div></div>');
    Cloud.init().then(start);
  }

  // A test seam, and the only thing this file puts on window. tools/admin-
  // check.html drives the panel through the DOM and reads state back here.
  window.ADMIN = {
    state: A, paint: paint, rows: rows, standing: standing,
    csvLines: csvLines, exportCsv: exportCsv, start: start,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
