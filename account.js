// ═══════════════════════════════════════════════════════════
// Account page — the person's picture, name, email and password, and what
// their plan gives them.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const el = (id) => document.getElementById(id);
  const PLAN_NAMES = {solo: 'Solo', team: 'Team', org: 'Business'};
  const PHOTO_PX = 192;              // drawn at twice the largest place it shows
  const MAX_INPUT = 10 * 1024 * 1024;

  // The picture as it will be saved — null means take it away. undefined
  // means nothing has been chosen since the page loaded, so Save leaves the
  // stored one as it is.
  let pendingPhoto;

  const go = (u) => (window.__navigate || ((x) => location.replace(x)))(u);

  function say(id, text, kind) {
    const m = el(id);
    m.textContent = text || '';
    m.className = 'ac-msg' + (kind ? ' is-' + kind : '');
  }

  function toast(text) {
    const t = el('dbToast');
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { t.hidden = true; }, 2600);
  }

  function paintPhoto(url) {
    const c = Cloud.state() || {};
    const box = el('acPhoto');
    // Built rather than written as HTML: the address comes back from the
    // profile, and a stored value is not somewhere to take markup from.
    box.textContent = '';
    if (url) {
      const img = new Image();
      img.alt = '';
      img.src = url;
      box.appendChild(img);
    } else {
      box.textContent = AccountMenu.initials(el('acName').value || c.fullName, c.email);
    }
    box.classList.toggle('has-photo', !!url);
    el('acRemove').hidden = !url;
  }

  // ── The picture ──────────────────────────────────────────
  // Cropped square from the middle and drawn at 192 px before it is saved, so
  // what is stored is a few kilobytes whatever the camera produced. White
  // under it first: a transparent PNG would otherwise turn black as a JPEG.
  function shrink(file) {
    return new Promise((resolve, reject) => {
      if (!/^image\//.test(file.type)) return reject(new Error('That is not an image.'));
      if (file.size > MAX_INPUT) return reject(new Error('That image is over 10 MB.'));
      const r = new FileReader();
      r.onerror = () => reject(new Error('The image could not be read.'));
      r.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('The image could not be opened.'));
        img.onload = () => {
          const side = Math.min(img.naturalWidth, img.naturalHeight);
          const sx = (img.naturalWidth - side) / 2;
          const sy = (img.naturalHeight - side) / 2;
          const c = document.createElement('canvas');
          c.width = c.height = PHOTO_PX;
          const ctx = c.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, PHOTO_PX, PHOTO_PX);
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, side, side, 0, 0, PHOTO_PX, PHOTO_PX);
          resolve(c.toDataURL('image/jpeg', 0.86));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  el('acFile').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    // Save waits for the picture. Reading and redrawing a photo takes a
    // moment, and a Save pressed inside it would store the name and drop the
    // picture that was on its way.
    el('acSaveProfile').disabled = true;
    say('acProfileMsg', 'Preparing the picture…');
    shrink(file).then((url) => {
      el('acSaveProfile').disabled = false;
      pendingPhoto = url;
      paintPhoto(url);
      say('acProfileMsg', 'Save changes to keep it.');
    }, (err) => {
      el('acSaveProfile').disabled = false;
      say('acProfileMsg', err.message, 'error');
    });
  });

  el('acRemove').addEventListener('click', () => {
    pendingPhoto = null;
    paintPhoto('');
    say('acProfileMsg', 'Save changes to keep it.');
  });

  // The summary card follows the name as it is typed, so the change is seen
  // where it will show before it is saved.
  el('acName').addEventListener('input', () => {
    const c = Cloud.state() || {};
    el('acSideName').textContent = el('acName').value.trim() || c.email || '';
    if (!el('acPhoto').classList.contains('has-photo')) paintPhoto('');
  });

  el('acSaveProfile').addEventListener('click', () => {
    const fields = {fullName: el('acName').value};
    if (pendingPhoto !== undefined) fields.avatarUrl = pendingPhoto;
    el('acSaveProfile').disabled = true;
    say('acProfileMsg', 'Saving…');
    Cloud.updateProfile(fields).then((r) => {
      el('acSaveProfile').disabled = false;
      if (!r.ok) { say('acProfileMsg', r.error, 'error'); return; }
      pendingPhoto = undefined;
      say('acProfileMsg', '');
      toast('Changes saved');
    });
  });

  // ── Email ────────────────────────────────────────────────
  el('acSaveEmail').addEventListener('click', () => {
    const next = el('acEmail').value.trim();
    const now = (Cloud.state() || {}).email || '';
    if (!next || next === now) { say('acEmailMsg', 'That is the address you have.', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) { say('acEmailMsg', 'That does not look like an email address.', 'error'); return; }
    el('acSaveEmail').disabled = true;
    say('acEmailMsg', 'Sending…');
    Cloud.changeEmail(next).then((r) => {
      el('acSaveEmail').disabled = false;
      if (!r.ok) { say('acEmailMsg', r.error, 'error'); return; }
      say('acEmailMsg', `Check ${next} for a confirmation link. Until you follow it, you still sign in with ${now}.`, 'ok');
    });
  });

  // ── Password ─────────────────────────────────────────────
  el('acSavePass').addEventListener('click', () => {
    const a = el('acPass').value, b = el('acPass2').value;
    if (a.length < 8) { say('acPassMsg', 'Use at least 8 characters.', 'error'); el('acPass').focus(); return; }
    if (a !== b) { say('acPassMsg', 'The two do not match.', 'error'); el('acPass2').focus(); return; }
    el('acSavePass').disabled = true;
    say('acPassMsg', 'Saving…');
    Cloud.updatePassword(a).then((r) => {
      el('acSavePass').disabled = false;
      if (!r.ok) { say('acPassMsg', r.error, 'error'); return; }
      el('acPass').value = el('acPass2').value = '';
      say('acPassMsg', '');
      toast('Password changed');
    });
  });

  // ── Plan ─────────────────────────────────────────────────
  function paintPlan() {
    const c = Cloud.state() || {};
    const plan = PLAN_NAMES[c.plan];
    el('acPlanName').textContent = plan ? plan : c.trialActive ? 'Free trial' : 'Free';
    el('acPlanNote').textContent = plan ? ''
      : c.trialActive && c.trialEndsAt
      ? 'Ends ' + new Date(c.trialEndsAt).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'}) + '.'
      : '';
    Cloud.signatureUsage().then((u) => {
      if (!u || !u.ok) { el('acUsage').innerHTML = ''; return; }
      if (u.cap == null) {
        el('acUsage').innerHTML = `<div class="db-usage-line"><span><strong>${u.used}</strong> ${u.used === 1 ? 'signature' : 'signatures'}</span></div>`;
        return;
      }
      const pct = u.cap ? Math.min(100, Math.round(u.used / u.cap * 100)) : 0;
      el('acUsage').innerHTML = `<div class="db-usage-line"><span><strong>${u.used}</strong> of ${u.cap} ${u.cap === 1 ? 'signature' : 'signatures'} used</span><a href="signatures.html">Manage</a></div>
        <div class="db-bar" role="progressbar" aria-label="Signatures used" aria-valuemin="0" aria-valuemax="${u.cap}" aria-valuenow="${u.used}"><i style="width:${pct}%"></i></div>`;
    });
  }

  // ── Start ────────────────────────────────────────────────
  function fill() {
    const c = Cloud.state() || {};
    if (document.activeElement !== el('acName')) el('acName').value = c.fullName || '';
    if (document.activeElement !== el('acEmail')) el('acEmail').value = c.email || '';
    el('acSideName').textContent = c.fullName || c.email || '';
    el('acSideEmail').textContent = c.fullName ? (c.email || '') : '';
    if (pendingPhoto === undefined) paintPhoto(c.avatarUrl || '');
    AccountMenu.paint();
    paintPlan();
  }

  function start() {
    if (!(window.Cloud && Cloud.isReady)) {
      document.body.classList.remove('db-loading');
      el('acProfileMsg').textContent = 'This copy has no account service configured.';
      return;
    }
    Cloud.init().then((c) => {
      if (!c.signedIn) { go('signin.html?next=account.html'); return; }
      document.body.classList.remove('db-loading');
      fill();
      // The profile arrives a request after the session; fill again when it does.
      Cloud.onChange(fill);
    });
  }

  window.__account = {fill, shrink, start};
  start();
})();
