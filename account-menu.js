// ═══════════════════════════════════════════════════════════
// The account menu in the top bar of the dashboard and the profile page.
//
// The pages carry only the avatar button and an empty menu (#dbAvatar,
// #dbAccountMenu); this draws what goes inside, so the two pages cannot drift
// apart. The editor draws the same menu itself, in renderAccount().
//
//   who is signed in   photo or initials, name, email
//   the plan           in words, with the way to a bigger one
//   where to go        My signatures, Profile settings, Admin panel
//   the way out        Help, Sign out
// ═══════════════════════════════════════════════════════════
window.AccountMenu = (function () {
  'use strict';

  const el = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

  const PLAN_NAMES = {solo: 'Solo plan', team: 'Team plan', org: 'Business plan'};

  // Initials from the name where there is one, the address where there is not.
  function initials(name, email) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return String(email || '?').split('@')[0].slice(0, 2).toUpperCase();
  }

  // The picture where there is one, the initials on the brand tint where not.
  function face(c) {
    return c.avatarUrl ? `<img src="${esc(c.avatarUrl)}" alt="">` : esc(initials(c.fullName, c.email));
  }

  function planLine(c) {
    if (PLAN_NAMES[c.plan]) return PLAN_NAMES[c.plan];
    if (c.trialActive) return `Free trial · ${c.trialDaysLeft} day${c.trialDaysLeft === 1 ? '' : 's'} left`;
    return 'Free plan';
  }

  const ICON = {
    sigs: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17c3-6 5-9 7-8 2 1 0 6 2 6s3-4 5-4"/><path d="M4 21h16"/></svg>',
    profile: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="9" r="3.5"/><path d="M5.5 20a7 7 0 0 1 13 0"/><circle cx="12" cy="12" r="10"/></svg>',
    admin: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>',
  };

  function here(page) {
    return (location.pathname.split('/').pop() || '') === page ? ' aria-current="page"' : '';
  }

  function menuHTML(c) {
    return `<div class="am-head">
        <span class="am-face${c.avatarUrl ? ' has-photo' : ''}" aria-hidden="true">${face(c)}</span>
        <span class="am-id" id="dbWho"><strong>${esc(c.fullName || c.email || '')}</strong>${c.fullName && c.email ? `<span>${esc(c.email)}</span>` : ''}</span>
      </div>
      <a class="am-plan" href="pricing.html" role="menuitem"><span>${esc(planLine(c))}</span><em>${c.plan === 'org' ? 'Plans' : 'Upgrade'}</em></a>
      <div class="am-links">
        <a role="menuitem" href="signatures.html"${here('signatures.html')}>${ICON.sigs}My signatures</a>
        <a role="menuitem" href="account.html"${here('account.html')}>${ICON.profile}Profile settings</a>
        ${c.isAdmin ? `<a role="menuitem" href="admin.html">${ICON.admin}Admin panel</a>` : ''}
      </div>
      <div class="am-foot">
        <a role="menuitem" href="help.html">Help</a>
        <button role="menuitem" type="button" data-signout>Sign out</button>
      </div>`;
  }

  function paint() {
    const c = (window.Cloud && Cloud.state()) || {};
    const btn = el('dbAvatar');
    const menu = el('dbAccountMenu');
    if (!btn || !menu) return;
    btn.innerHTML = face(c);
    btn.classList.toggle('has-photo', !!c.avatarUrl);
    btn.setAttribute('aria-label', 'Account menu' + (c.email ? ' for ' + c.email : ''));
    menu.innerHTML = menuHTML(c);
  }

  function close() {
    const m = el('dbAccountMenu');
    if (m) m.hidden = true;
    const b = el('dbAvatar');
    if (b) b.setAttribute('aria-expanded', 'false');
  }

  function wire() {
    const btn = el('dbAvatar');
    const menu = el('dbAccountMenu');
    if (!btn || !menu) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open) { const first = menu.querySelector('.am-links a'); if (first) first.focus(); }
    });
    // Delegated: the menu is redrawn whenever the account changes.
    menu.addEventListener('click', (e) => {
      if (!e.target.closest('[data-signout]')) return;
      Cloud.signOut().then(() => (window.__navigate || ((u) => location.replace(u)))('signin.html'));
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.db-account')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    if (window.Cloud && Cloud.onChange) Cloud.onChange(paint);
  }

  wire();
  return {paint, close, initials, face, planLine};
})();
