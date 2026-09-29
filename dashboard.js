// ═══════════════════════════════════════════════════════════
// Signatures dashboard — every signature an account keeps, which one is the
// default, and how many more the plan allows.
//
// Thumbnails are the real signature, drawn by the editor's own renderer and
// shrunk to fit, the way the shared-link page borrows it. So app.js is loaded
// with its boot switched off (SIGNVEL_MODE = 'dashboard'), and each card
// loads that signature's state into the renderer, draws it, and moves on.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const D = {
    list: [],          // rows from Cloud.listSignatures()
    usage: null,       // {used, cap} — cap null when the limit is not known
    view: 'grid',      // 'grid' | 'list'; a phone always gets rows
    q: '',
    busy: false,
  };

  const el = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

  const SCOPE_NAMES = {sales: 'Sales', legal: 'Legal', engineering: 'Engineering', executive: 'Executive'};
  const PLAN_NAMES = {solo: 'Solo plan', team: 'Team plan', org: 'Business plan'};
  const phone = window.matchMedia('(max-width: 640px)');

  // The renderer's defaults, before any signature has been loaded into it.
  // Each card starts from these, so one signature's settings never leak into
  // the next card's drawing.
  const BASE = JSON.parse(JSON.stringify(S));

  try { D.view = localStorage.getItem('signvel:dbview') === 'list' ? 'list' : 'grid'; } catch (e) {}

  // ── Drawing one signature ────────────────────────────────
  // What arrives is saved state, taken the way the shared-link page takes it:
  // only keys the renderer already has, and only as the same kind of value.
  function loadInto(state) {
    const base = JSON.parse(JSON.stringify(BASE));
    Object.keys(S).forEach((k) => { if (!(k in base)) delete S[k]; });
    Object.assign(S, base);
    if (state && typeof state === 'object') {
      Object.keys(state).forEach((k) => {
        if (!Object.prototype.hasOwnProperty.call(S, k)) return;
        const now = S[k], next = state[k];
        if (Array.isArray(now) !== Array.isArray(next)) return;
        if (!Array.isArray(now) && now !== null && next !== null && typeof now !== typeof next) return;
        S[k] = next;
      });
    }
    ['ensureSocialCatalogue', 'ensureDefaultPortrait', 'ensureDefaultLogo', 'ensureDefaultBanner']
      .forEach((f) => { if (typeof window[f] === 'function') window[f](); });
    // A thumbnail sits on white. A signature saved while the dark preview was
    // on would otherwise be drawn in its dark-mode colours, pale on pale.
    S.darkMode = false;
    S.device = 'desktop';
    S.client = 'gmail';
  }

  // A thumbnail is the signature, not its small print. The disclaimer is a
  // paragraph of type too small to read at this size, and it shrank the rest
  // of the drawing to make room for itself; the free-plan credit line the same.
  // Both are left out of the picture only — Copy signature loads the state
  // afresh, so what is copied from here still carries them.
  function drawn(sig) {
    try {
      loadInto(sig.state);
      S.disclaimerEnabled = false;
      window.SIGNVEL_THUMBNAIL = true;
      return onScreen(() => withExportTarget('', generateSignaturePreview));
    } catch (e) {
      return '';
    } finally {
      window.SIGNVEL_THUMBNAIL = false;
    }
  }

  // inert and aria-hidden: the thumbnail is a picture of a signature, and the
  // links inside it — mailto, the website — are not controls on this page.
  function thumb(sig, cls) {
    return `<div class="db-thumb ${cls || ''}" aria-hidden="true" inert><div class="db-thumb-inner">${drawn(sig)}</div></div>`;
  }

  // Shrinks each drawing to its frame once it is on the page and has a size.
  function fitThumbs() {
    document.querySelectorAll('.db-thumb').forEach((box) => {
      const inner = box.firstElementChild;
      if (!inner) return;
      inner.style.transform = '';
      const w = inner.scrollWidth, h = inner.scrollHeight;
      if (!w || !h) return;
      const pad = box.classList.contains('is-small') ? 4 : 20;
      const k = Math.min(1, (box.clientWidth - pad * 2) / w, (box.clientHeight - pad * 2) / h);
      inner.style.transform = `translate(-50%, -50%) scale(${k})`;
    });
  }

  // ── Facts about a signature ──────────────────────────────
  function ago(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const s = (Date.now() - d.getTime()) / 1000;
    if (s < 60) return 'just now';
    if (s < 3600) { const m = Math.round(s / 60); return m + (m === 1 ? ' minute ago' : ' minutes ago'); }
    if (s < 86400) { const h = Math.round(s / 3600); return h + (h === 1 ? ' hour ago' : ' hours ago'); }
    if (s < 172800) return 'yesterday';
    if (s < 7 * 86400) return Math.floor(s / 86400) + ' days ago';
    return d.toLocaleDateString(undefined, {day: 'numeric', month: 'short'});
  }

  const scopeOf = (sig) => SCOPE_NAMES[(sig.state || {}).scope] || '';
  const personOf = (sig) => (sig.state || {}).name || '';

  const atLimit = () => !!(D.usage && D.usage.cap != null && D.usage.used >= D.usage.cap);
  const left = () => (D.usage && D.usage.cap != null) ? Math.max(0, D.usage.cap - D.usage.used) : null;

  // ── Pieces ───────────────────────────────────────────────
  const DEFAULT_BADGE = '<span class="db-badge is-default"><i aria-hidden="true"></i>Default</span>';
  const scopeChip = (sig) => scopeOf(sig) ? `<span class="db-badge">${esc(scopeOf(sig))}</span>` : '';

  const DOTS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>';
  const PLUS = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const LOCK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

  const more = (sig) => `<button type="button" class="db-icon-btn" data-act="menu" data-id="${esc(sig.id)}" aria-haspopup="menu" aria-expanded="false" aria-label="More actions for ${esc(sig.name || 'this signature')}">${DOTS}</button>`;
  const editLink = (sig, cls) => `<a class="db-btn ${cls || ''}" href="editor.html?sig=${encodeURIComponent(sig.id)}">Edit</a>`;

  // What the next plan up would give, said only where it is more than now.
  function nextPlanLine() {
    const c = Cloud.state() || {};
    const cap = D.usage && D.usage.cap;
    if (c.plan === 'org') return '';
    if (c.plan === 'team') return cap < 20 ? 'Business gives you 20.' : '';
    return cap < 10 ? 'Team gives you 10.' : '';
  }

  function limitBlock() {
    const line = nextPlanLine();
    return `<section class="db-limit" aria-label="Plan limit reached">
      <span class="db-limit-icon">${LOCK}</span>
      <h2>Limit reached</h2>
      ${line ? `<p>${esc(line)}</p>` : ''}
      <a class="db-btn db-btn-primary" href="pricing.html">Upgrade</a>
    </section>`;
  }

  function createCard() {
    if (atLimit()) return limitBlock();
    const n = left();
    return `<button type="button" class="db-create" data-act="new">
      <span class="db-create-plus">${PLUS}</span>
      <strong>Create a new signature</strong>
      ${n != null ? `<span>${n} left</span>` : ''}
    </button>`;
  }

  function card(sig) {
    const meta = sig.updated_at ? 'Edited ' + ago(sig.updated_at) : '';
    return `<article class="db-card${sig.is_default ? ' is-default' : ''}">
      ${thumb(sig)}
      <div class="db-card-body">
        <div class="db-card-title"><h2>${esc(sig.name || 'Untitled')}</h2>${sig.is_default ? DEFAULT_BADGE : scopeChip(sig)}</div>
        <p class="db-meta">${esc(meta)}</p>
        <div class="db-actions">
          ${editLink(sig, 'db-btn-primary')}
          ${sig.is_default
            ? `<button type="button" class="db-btn" data-act="copy" data-id="${esc(sig.id)}">Copy signature</button>`
            : `<button type="button" class="db-btn" data-act="default" data-id="${esc(sig.id)}">Make default</button>`}
          <span class="db-spacer"></span>
          ${more(sig)}
        </div>
      </div>
    </article>`;
  }

  function gridView(list) {
    return `<div class="db-grid">${list.map(card).join('')}${D.q ? '' : createCard()}</div>`;
  }

  function listView(list) {
    const rows = list.map((sig) => `<tr>
      <td><div class="db-cell-sig">${thumb(sig, 'is-small')}<span class="db-name">${esc(sig.name || 'Untitled')}</span>${sig.is_default ? DEFAULT_BADGE : ''}</div></td>
      <td>${esc(personOf(sig))}</td>
      <td>${scopeChip(sig)}</td>
      <td class="db-muted">${esc(ago(sig.updated_at))}</td>
      <td class="db-cell-actions">${editLink(sig, 'db-btn-sm')}${more(sig)}</td>
    </tr>`).join('');
    const foot = D.q ? ''
      : atLimit()
      ? `<div class="db-add-row is-limit">${LOCK}<span>Limit reached</span><a href="pricing.html">Upgrade</a></div>`
      : `<button type="button" class="db-add-row" data-act="new">${PLUS}Add a signature</button>`;
    return `<div class="db-table-wrap"><table class="db-table">
      <thead><tr><th scope="col">Signature</th><th scope="col">Person</th><th scope="col">Scope</th><th scope="col">Edited</th><th scope="col"><span class="db-sr">Actions</span></th></tr></thead>
      <tbody>${rows}</tbody></table>${foot}</div>`;
  }

  // A phone gets stacked rows whichever view was chosen: a grid of cards is
  // one card per screen there, and a table does not fit at all.
  function rowsView(list) {
    const rows = list.map((sig) => {
      const meta = scopeOf(sig);
      return `<li class="db-row${sig.is_default ? ' is-default' : ''}">
        ${thumb(sig, 'is-small')}
        <a class="db-row-main" href="editor.html?sig=${encodeURIComponent(sig.id)}">
          <span class="db-name">${esc(sig.name || 'Untitled')}</span>
          <span class="db-row-meta">${sig.is_default ? DEFAULT_BADGE : ''}${esc(meta)}</span>
        </a>
        ${more(sig)}
      </li>`;
    }).join('');
    const foot = D.q ? ''
      : atLimit() ? limitBlock()
      : `<button type="button" class="db-add-row is-card" data-act="new">${PLUS}Create a new signature</button>`;
    return `<ul class="db-rows">${rows}</ul>${foot}`;
  }

  function usageHTML(compact) {
    const u = D.usage;
    if (!u) return '';
    if (u.cap == null) return `<div class="db-usage-line"><span><strong>${u.used}</strong> ${u.used === 1 ? 'signature' : 'signatures'}</span></div>`;
    const pct = u.cap ? Math.min(100, Math.round(u.used / u.cap * 100)) : 0;
    const rem = Math.max(0, u.cap - u.used);
    return `<div class="db-usage-main">
        <div class="db-usage-line">
          <span><strong>${u.used}</strong> of ${u.cap} ${compact ? 'used' : (u.cap === 1 ? 'signature used' : 'signatures used')}</span>
          <span class="db-muted">${rem ? rem + ' remaining' : ''}</span>
        </div>
        <div class="db-bar" role="progressbar" aria-label="Signatures used" aria-valuemin="0" aria-valuemax="${u.cap}" aria-valuenow="${u.used}"><i style="width:${pct}%"></i></div>
      </div>
      ${compact ? '' : '<a class="db-usage-link" href="pricing.html">Upgrade</a>'}`;
  }

  // ── Page ─────────────────────────────────────────────────
  function render() {
    const q = D.q.trim().toLowerCase();
    const shown = !q ? D.list : D.list.filter((s) =>
      [s.name, personOf(s), scopeOf(s)].some((v) => String(v || '').toLowerCase().includes(q)));

    const view = phone.matches ? 'rows' : D.view;
    el('dbViews').querySelectorAll('button').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.view === D.view)));

    el('dbStatus').textContent = (q && !shown.length) ? 'Nothing matches that search.' : '';
    el('dbList').innerHTML = view === 'rows' ? rowsView(shown) : view === 'list' ? listView(shown) : gridView(shown);

    // The bar sits beside the title for a list — which can run to a hundred
    // rows — and under the cards for a grid, as the two designs have it.
    const top = view !== 'grid';
    el('dbUsageTop').hidden = !top || !D.usage;
    el('dbUsageTop').innerHTML = top ? usageHTML(true) : '';
    el('dbUsage').hidden = top || !D.usage;
    el('dbUsage').innerHTML = top ? '' : usageHTML(false);

    el('dbNew').disabled = atLimit() || D.busy;
    requestAnimationFrame(fitThumbs);
  }

  function header() {
    const c = Cloud.state() || {};
    const plan = PLAN_NAMES[c.plan];
    el('dbPlan').textContent = plan ? plan
      : c.trialActive ? `Free trial · ${c.trialDaysLeft} day${c.trialDaysLeft === 1 ? '' : 's'} left`
      : 'Free plan';

    const banner = el('dbBanner');
    const trial = !plan && c.trialActive && c.trialEndsAt;
    banner.hidden = !trial;
    if (trial) {
      const when = new Date(c.trialEndsAt).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'});
      banner.innerHTML = `<strong>Trial ends ${esc(when)}.</strong> <a href="pricing.html">See plans</a>`;
    }

    // The avatar and its menu are account-menu.js's, shared with the account page.
    if (window.AccountMenu) AccountMenu.paint();
  }

  function load() {
    el('dbStatus').textContent = D.list.length ? '' : 'Loading your signatures…';
    return Promise.all([Cloud.listSignatures(), Cloud.signatureUsage()]).then(([l, u]) => {
      if (!l.ok) { el('dbStatus').textContent = 'Could not load your signatures: ' + l.error; return; }
      D.list = l.list;
      D.usage = u && u.ok ? {used: u.used, cap: u.cap} : null;
      el('dbStatus').textContent = D.list.length ? '' : 'No signatures yet.';
      render();
    });
  }

  // ── Doing things ─────────────────────────────────────────
  function toast(msg) {
    const t = el('dbToast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { t.hidden = true; }, 2600);
  }

  // Every change goes through here: one at a time, and the list reloaded from
  // the account afterwards rather than patched by hand, so what is shown is
  // what is stored.
  function act(work, done) {
    if (D.busy) return Promise.resolve();
    D.busy = true;
    render();
    return work().then((r) => {
      D.busy = false;
      if (r && r.ok === false) { toast(r.error || 'That did not work.'); render(); return r; }
      if (done) toast(done);
      return load().then(() => r);
    });
  }

  const byId = (id) => D.list.find((s) => s.id === id);

  // Every navigation goes through one seam, so tools/dashboard-check.html can
  // see where the page would go without being taken there.
  const go = (u, replace) => (window.__navigate || ((x) => { replace ? location.replace(x) : (location.href = x); }))(u);

  // A new signature starts from the default, so the brand — logo, colours,
  // layout — carries over and only the person's details need changing.
  function createNew() {
    if (atLimit()) return;
    const base = D.list.find((s) => s.is_default) || D.list[0];
    act(() => Cloud.createSignature('New signature', base ? base.state : {})).then((r) => {
      if (r && r.ok && r.id) go('editor.html?sig=' + encodeURIComponent(r.id));
    });
  }

  function copyOne(sig) {
    loadInto(sig.state);
    try { copySignature(); toast('Copied'); } catch (e) { toast('Copying was blocked — open it and use Export HTML'); }
  }

  // ── The per-signature menu ───────────────────────────────
  // One menu, moved to whichever button opened it.
  let menuFor = null;
  const menu = document.createElement('div');
  menu.className = 'db-menu db-card-menu';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;
  document.body.appendChild(menu);

  function openMenu(btn) {
    const sig = byId(btn.dataset.id);
    if (!sig) return;
    closeMenus();
    menuFor = btn;
    btn.setAttribute('aria-expanded', 'true');
    menu.innerHTML =
      (sig.is_default ? '' : `<button type="button" role="menuitem" data-act="default" data-id="${esc(sig.id)}">Make default</button>`) +
      `<button type="button" role="menuitem" data-act="duplicate" data-id="${esc(sig.id)}"${atLimit() ? ' disabled' : ''}>Duplicate</button>` +
      `<button type="button" role="menuitem" data-act="rename" data-id="${esc(sig.id)}">Rename</button>` +
      '<hr>' +
      `<button type="button" role="menuitem" class="is-danger" data-act="delete" data-id="${esc(sig.id)}">Delete</button>`;
    menu.hidden = false;
    const r = btn.getBoundingClientRect();
    const mw = menu.offsetWidth, mh = menu.offsetHeight;
    const below = r.bottom + 6 + mh < window.innerHeight;
    menu.style.top = (window.scrollY + (below ? r.bottom + 6 : r.top - mh - 6)) + 'px';
    menu.style.left = (window.scrollX + Math.max(8, r.right - mw)) + 'px';
    const first = menu.querySelector('button:not([disabled])');
    if (first) first.focus();
  }

  function closeMenus() {
    if (menuFor) { menuFor.setAttribute('aria-expanded', 'false'); menuFor = null; }
    menu.hidden = true;
    if (window.AccountMenu) AccountMenu.close();
  }

  // ── Rename and delete ask first ──────────────────────────
  function dialog(title, bodyHTML, okLabel, danger) {
    return new Promise((resolve) => {
      el('dbDialogTitle').textContent = title;
      el('dbDialogBody').innerHTML = bodyHTML;
      const ok = el('dbDialogOk');
      ok.textContent = okLabel;
      ok.classList.toggle('is-danger', !!danger);
      el('dbDialog').hidden = false;
      el('dbScrim').hidden = false;
      const field = el('dbDialogBody').querySelector('input');
      (field || ok).focus();
      if (field) field.select();
      const finish = (v) => {
        el('dbDialog').hidden = true;
        el('dbScrim').hidden = true;
        ok.onclick = null; el('dbDialogCancel').onclick = null; el('dbScrim').onclick = null;
        el('dbDialog').onkeydown = null;
        resolve(v);
      };
      ok.onclick = () => finish(field ? field.value : true);
      el('dbDialogCancel').onclick = () => finish(null);
      el('dbScrim').onclick = () => finish(null);
      el('dbDialog').onkeydown = (e) => {
        if (e.key === 'Escape') finish(null);
        if (e.key === 'Enter' && field) finish(field.value);
      };
    });
  }

  function renameOne(sig) {
    dialog('Rename signature',
      `<label class="db-field"><span>Name</span><input type="text" maxlength="80" value="${esc(sig.name || '')}"></label>`,
      'Save').then((name) => {
        if (name == null || !name.trim() || name.trim() === sig.name) return;
        act(() => Cloud.renameSignature(sig.id, name), 'Renamed');
      });
  }

  function deleteOne(sig) {
    const note = sig.is_default && D.list.length > 1 ? ' The most recently edited one left becomes the default.' : '';
    dialog('Delete signature?',
      `<p>“${esc(sig.name || 'Untitled')}” will be deleted.${note}</p>`,
      'Delete', true).then((yes) => {
        if (yes) act(() => Cloud.deleteSignature(sig.id), 'Deleted');
      });
  }

  // ── Events ───────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) {
      if (!e.target.closest('.db-menu') && !e.target.closest('.db-account')) closeMenus();
      return;
    }
    const sig = byId(t.dataset.id);
    const a = t.dataset.act;
    if (a === 'menu') { menuFor === t ? closeMenus() : openMenu(t); return; }
    closeMenus();
    if (a === 'new') createNew();
    else if (a === 'copy' && sig) copyOne(sig);
    else if (a === 'default' && sig) act(() => Cloud.setDefaultSignature(sig.id), 'Default changed');
    else if (a === 'duplicate' && sig) act(() => Cloud.duplicateSignature(sig.id), 'Duplicated');
    else if (a === 'rename' && sig) renameOne(sig);
    else if (a === 'delete' && sig) deleteOne(sig);
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuFor) closeMenus(); });

  el('dbNew').addEventListener('click', createNew);
  el('dbSearch').addEventListener('input', (e) => { D.q = e.target.value; render(); });
  el('dbViews').addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]');
    if (!b) return;
    D.view = b.dataset.view;
    try { localStorage.setItem('signvel:dbview', D.view); } catch (err) {}
    render();
  });
  phone.addEventListener('change', render);
  window.addEventListener('resize', () => requestAnimationFrame(fitThumbs));

  // ── Start ────────────────────────────────────────────────
  // Signed out goes to sign-in and comes back here. No cloud configured at all
  // — a local checkout — has no account to keep signatures in, and says so.
  function start() {
    if (!(window.Cloud && Cloud.isReady)) {
      document.body.classList.remove('db-loading');
      el('dbStatus').textContent = 'Signatures are kept in your account, and this copy has no account service configured.';
      return;
    }
    Cloud.init().then((c) => {
      if (!c.signedIn) {
        go('signin.html?next=signatures.html', true);
        return;
      }
      document.body.classList.remove('db-loading');
      header();
      load();
      // The plan and the trial arrive with the profile, a request after the
      // session; the header and the limit follow them when they do.
      Cloud.onChange(() => { header(); Cloud.signatureUsage().then((u) => { if (u.ok) { D.usage = {used: u.used, cap: u.cap}; render(); } }); });
    });
  }

  // For tools/dashboard-check.html, which drives this page without a network.
  window.__dashboard = {D, render, load, loadInto, start};
  start();
})();
