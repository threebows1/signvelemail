// ═══════════════════════════════════════════════════════════
// The account menu in the top bar of the dashboard and the account page:
// who is signed in, and the three places an account goes — its signatures,
// its profile, and out. One script for both pages, so the menu cannot drift
// between them.
//
// The pages carry the markup (#dbAvatar, #dbAccountMenu and what is inside
// it); this fills it in from Cloud.state() and keeps it current.
// ═══════════════════════════════════════════════════════════
window.AccountMenu = (function () {
  'use strict';

  const el = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
    ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

  // Initials from the name where there is one, the address where there is not.
  function initials(name, email) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return String(email || '?').split('@')[0].slice(0, 2).toUpperCase();
  }

  // The picture where there is one, the initials on the brand tint where not.
  function face(c, size) {
    return c.avatarUrl
      ? `<img src="${esc(c.avatarUrl)}" alt="" width="${size}" height="${size}">`
      : esc(initials(c.fullName, c.email));
  }

  function paint() {
    const c = (window.Cloud && Cloud.state()) || {};
    const btn = el('dbAvatar');
    if (!btn) return;
    btn.innerHTML = face(c, 44);
    btn.classList.toggle('has-photo', !!c.avatarUrl);
    btn.setAttribute('aria-label', 'Account menu' + (c.email ? ' for ' + c.email : ''));
    const who = el('dbWho');
    if (who) {
      who.innerHTML = `<strong>${esc(c.fullName || c.email || '')}</strong>` +
        (c.fullName && c.email ? `<span>${esc(c.email)}</span>` : '');
    }
    const admin = el('dbAdmin');
    if (admin) admin.hidden = !c.isAdmin;
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
      if (open) { const first = menu.querySelector('a, button'); if (first) first.focus(); }
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.db-account')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    const out = el('dbSignOut');
    if (out) out.addEventListener('click', () => {
      Cloud.signOut().then(() => (window.__navigate || ((u) => location.replace(u)))('signin.html'));
    });
    if (window.Cloud && Cloud.onChange) Cloud.onChange(paint);
  }

  wire();
  return {paint, close, initials, face};
})();
