/* ═══════════════════════════════════════════════════════════
   Signature Studio — app.js
   Full single-page email-signature editor
   ═══════════════════════════════════════════════════════════ */

// ───────────── SVG Icons ─────────────
const icons = {
  // Sign Vel brand mark — editor chrome only, never used inside a signature.
  // White, not the gradient the marketing pages use. This sits inside
  // .rail-brand, which is filled with var(--accent) — the same #5B2EFF the
  // gradient starts from, so the left half of the stroke was invisible and
  // the mark read as half a squiggle. The favicon solved this the same way:
  // solid white on purple, with the mint dot for the one point of colour.
  logo: `<svg width="34" height="14.3" viewBox="0 0 88 37" aria-hidden="true"><path d="M8 22c7-16 12-21 16-19 5 2 3 18 7 19s8-13 13-13 4 13 15 9" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="76" cy="27" r="5" fill="#00E5A0"/></svg>`,
  chevron: `<svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  email: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 8L2 4"/></svg>`,
  // Landline: the classic handset receiver. A single closed shape, so it stays
  // crisp at the ~11px the circle badges render it at.
  landline: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
  mobile: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10.5 18.5h3"/></svg>`,
  globe: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
  mappin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  building: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22V12h6v10M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01"/></svg>`,
  user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  arrowUp: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8V2M2 4l3-2.5L8 4"/></svg>`,
  arrowDown: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 2v6M2 6l3 2.5L8 6"/></svg>`,
  trash: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1.5 2.5h7M3.5 2.5V1.5h3v1M3.5 4v4M6.5 4v4M2.5 2.5l.5 6h4l.5-6"/></svg>`,
  upload: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>`,
  check: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6l3 3 5-5"/></svg>`,
  lock: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
  linkedin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  x: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.933zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404z"/></svg>`,
  instagram: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  youtube: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  facebook: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  tiktok: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg>`,
  // Pinterest's own glyph — the looping P inside the disc. Drawn as one filled
  // path like Facebook and LinkedIn rather than as an outline, because these
  // land at 16px in the panel and 14px inside a circle badge in the signature,
  // and a hairline outline of this shape turns to mush at that size.
  pinterest: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146A12 12 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>`,
};

// Single-letter prefixes for the 'letters' display mode: E: M: T: A:
const contactLetters = {email:'E',mobile:'M',phone:'T',address:'A',website:'W',office:'O',pronouns:'P',booking:'B'};

// ───────────── SVG → PNG for email clients ─────────────
// Outlook (both classic and New) strips inline <svg> from HTML emails.
// ───────────── Export targets ─────────────
// Which client the markup is being written for. null is the live preview and
// the ordinary copy, where an <svg> glyph is fine.
//
// Both Outlooks strip <svg> out of a message, so neither ever sees the icons —
// the new one leaves the ring standing empty, and Word's engine drops the
// border-radius as well, so classic shows an empty square. A letter is text:
// it survives both, in the icon's own colour, and needs nothing hosted.
//
//   'newoutlook' — keeps the round badge, puts a letter in it
//   'classic'    — drops the badge entirely rather than ship a square
let EXPORT_TARGET = null;

const EXPORT_TARGETS = [
  {id: '',           label: 'Standard',        note: 'Gmail, Apple Mail, and anything that renders SVG.'},
  {id: 'newoutlook', label: 'New Outlook',     note: 'The same design as Standard. New Outlook draws a remote image and a round badge perfectly well — only the inline SVG had to go, so the glyphs are served from signvel.com.'},
  {id: 'classic',    label: 'Outlook classic', note: 'Word draws this one, and throws away a rounded corner — so the badge is drawn into the picture instead, circle and all. Letters until that set is made.'},
];

// Hosted glyphs, for the clients that will not draw an <svg>.
//
// New Outlook is a browser and renders a remote image and a border-radius
// perfectly well — it is only inline SVG it strips out. So it gets the same
// design as Standard, with the drawing served from here instead of written
// into the message. data: would not do: Gmail and Outlook both strip it.
//
// Two tones rather than a colour per theme, because the theme colour is the
// person's own and no set of files can cover it: white for a filled badge,
// ink for an open one, where the themed ring is doing the colouring anyway.
//
// tools/make-icons.html regenerates icons/ from these same SVGs.
const ICON_HOST = 'https://signvel.com/icons/';
const HOSTED_ICONS = {
  email: 'c-email', mobile: 'c-mobile', phone: 'c-phone', website: 'c-website',
  address: 'c-address', office: 'c-office', pronouns: 'c-pronouns', booking: 'c-booking',
  linkedin: 's-linkedin', x: 's-x', instagram: 's-instagram', youtube: 's-youtube',
  facebook: 's-facebook', tiktok: 's-tiktok', pinterest: 's-pinterest',
};
function hostedIcon(name, tone, size, extraStyle) {
  const file = HOSTED_ICONS[name];
  if (!file) return '';
  return iconImgTag(`${ICON_HOST}${file}-${tone}.png`, size, extraStyle);
}

function iconImgTag(url, size, extraStyle) {
  return `<img src="${url}" width="${size}" height="${size}" alt=""`
    + ` style="display:block;width:${size}px;height:${size}px;border:0;outline:none;text-decoration:none;${extraStyle || ''}">`;
}

// ───────────── Glyphs in the theme colour ─────────────
// The two hosted tones cannot carry a colour the person chose themselves, and
// new Outlook strips an embedded image, so an exactly coloured glyph has to be
// a file somewhere. It gets drawn here and uploaded to the account's own
// storage — the same path a logo upload takes — and the URL is kept in the
// signature, so it is drawn and sent once per glyph per colour.
//
// Everything below degrades: no account, no plan, an upload that fails, or a
// colour whose set is still being made all fall back to the white glyph on a
// filled badge, which needs nothing hosted beyond the files in icons/.
const iconAssetPending = {};

// The version is part of the key so a change to how the glyph is drawn makes
// a new file rather than reusing one already uploaded in the old shape.
const ICON_ASSET_VERSION = 'v2';

const hex6 = h => String(h || '').replace('#', '').toLowerCase();

function iconAssetKey(name, hex) {
  return name + '-' + hex6(hex) + '-' + ICON_ASSET_VERSION;
}

// A whole badge is keyed by everything drawn into it, so changing any of it
// makes a new file rather than showing the old one at the wrong size or on
// the wrong ground.
function badgeAssetKey(name, hex, filled, px, ground) {
  return 'badge-' + name + '-' + hex6(hex) + '-' + (filled ? 'fill' : 'ring')
    + '-' + px + '-' + hex6(ground) + '-' + ICON_ASSET_VERSION;
}

function hostedBadgeFor(name, hex, filled, px, ground) {
  const map = S.iconAssets || {};
  return map[badgeAssetKey(name, hex, filled, px, ground)] || '';
}

function hostedIconFor(name, hex) {
  const map = S.iconAssets || {};
  return map[iconAssetKey(name, hex)] || '';
}

// Draws one glyph at 72px — 3x the largest the editor uses — in the colour
// asked for, and hands back a PNG blob.
//
// The drawing is then normalised: each glyph is scaled so its ink fills the
// same share of the canvas and centred on that ink. Left alone they do not
// match — the map pin's ink fills the full 72, the envelope's only 54 — so
// inside a badge the pin reads as too big for its ring and the envelope as
// adrift in it. Normalising makes every glyph sit in the circle the same way.
const ICON_INK_SHARE = 0.78;

function drawIconBlob(svgStr, colour) {
  return new Promise(resolve => {
    let s = String(svgStr || '').replace(/currentColor/g, colour);
    if (!/xmlns=/.test(s)) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    s = s.replace(/width="\d+"/, 'width="72"').replace(/height="\d+"/, 'height="72"');
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = 72;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 72, 72);

      const box = inkBounds(ctx, 72, 72);
      if (box) {
        const span = Math.max(box.w, box.h);
        const scale = (72 * ICON_INK_SHARE) / span;
        const w = 72 * scale, h = 72 * scale;
        // Where the ink's own centre lands once scaled, moved to the middle.
        const cx = (box.x + box.w / 2) * scale, cy = (box.y + box.h / 2) * scale;
        ctx.clearRect(0, 0, 72, 72);
        ctx.drawImage(img, 36 - cx, 36 - cy, w, h);
      }
      c.toBlob(b => resolve(b), 'image/png');
    };
    img.onerror = () => resolve(null);
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s)));
  });
}

// Draws a whole badge — the ring or the filled disc, with the glyph centred
// inside it — as one image, at 3x the size it is shown at.
//
// This is for classic Outlook, which renders through Word: it draws an image
// perfectly well but throws away border-radius, so a badge built out of CSS
// arrives square. Baked into the picture, the circle is just part of the
// drawing and there is nothing left for Word to discard.
//
// The open style is given a real ground rather than left transparent, because
// Outlook's handling of PNG alpha has a history of rendering as a black box —
// the same reason the email logo is drawn on a flat ground.
function drawBadgeBlob(svgStr, colour, filled, px, ground) {
  return new Promise(resolve => {
    const S3 = px * 3;
    let s = String(svgStr || '').replace(/currentColor/g, filled ? '#FFFFFF' : colour);
    if (!/xmlns=/.test(s)) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    s = s.replace(/width="\d+"/, 'width="72"').replace(/height="\d+"/, 'height="72"');
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = S3;
      const ctx = c.getContext('2d');
      const r = S3 / 2;

      ctx.beginPath();
      ctx.arc(r, r, r - 2.25, 0, Math.PI * 2);
      ctx.fillStyle = filled ? colour : (ground || '#FFFFFF');
      ctx.fill();
      if (!filled) {
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = colour;
        ctx.stroke();
      }

      // The glyph, normalised the same way the bare ones are, at half the
      // badge — which is the proportion the CSS badge uses.
      const g = document.createElement('canvas');
      g.width = g.height = 72;
      const gx = g.getContext('2d');
      gx.drawImage(img, 0, 0, 72, 72);
      const box = inkBounds(gx, 72, 72);
      const inner = S3 * 0.5;
      if (box) {
        const scale = (72 * ICON_INK_SHARE) / Math.max(box.w, box.h);
        const drawn = 72 * scale;
        const cx = (box.x + box.w / 2) * scale, cy = (box.y + box.h / 2) * scale;
        const k = inner / (72 * ICON_INK_SHARE);
        ctx.drawImage(img, r - cx * k, r - cy * k, drawn * k, drawn * k);
      } else {
        ctx.drawImage(img, r - inner / 2, r - inner / 2, inner, inner);
      }
      c.toBlob(b => resolve(b), 'image/png');
    };
    img.onerror = () => resolve(null);
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(s)));
  });
}

// The ground a badge is drawn against, which is the signature's own panel
// when it has one and the message behind it otherwise.
function badgeGround() {
  return (S.bgEnabled && S.bgColor) ? S.bgColor : '#FFFFFF';
}

// The rectangle the drawing actually occupies, ignoring transparent margin.
function inkBounds(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let p = 3, i = 0; p < d.length; p += 4, i++) {
    if (d[p] > 16) {
      const px = i % w, py = (i / w) | 0;
      if (px < x0) x0 = px;
      if (px > x1) x1 = px;
      if (py < y0) y0 = py;
      if (py > y1) y1 = py;
    }
  }
  return x1 < 0 ? null : {x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1};
}

// Which glyphs the signature is actually using, and in which colour. Only the
// ones drawn in a colour need a file: a filled badge already has the white one.
function neededIconAssets(target) {
  const want = [];
  const mode = S.contactIconMode || 'circle';
  const sStyle = S.socialStyle || 'circle';
  const cColour = S.iconColor || S.accentColor;
  const sColour = S.socialIconColor || S.accentColor;
  const contacts = (S.contactFields || []).filter(f => f.enabled && contactIcons[f.type]);
  const socials = (S.socialLinks || []).filter(sl => sl.enabled && socialIcons[sl.type]);

  if (target === 'classic') {
    // Word discards the CSS badge, so the badge itself has to be the picture.
    const ground = badgeGround();
    if (mode === 'circle' || mode === 'filled') {
      const px = S.contactIconSize || 22;
      contacts.forEach(f => want.push({
        badge: true, name: f.type, svg: contactIcons[f.type], hex: cColour,
        filled: mode === 'filled', px, ground,
        key: badgeAssetKey(f.type, cColour, mode === 'filled', px, ground),
      }));
    } else if (mode !== 'letters' && mode !== 'labels') {
      contacts.forEach(f => want.push({name: f.type, svg: contactIcons[f.type], hex: cColour, key: iconAssetKey(f.type, cColour)}));
    }
    if (sStyle === 'circle' || sStyle === 'filled') {
      const px = S.socialIconSize || 24;
      socials.forEach(sl => want.push({
        badge: true, name: sl.type, svg: socialIcons[sl.type], hex: sColour,
        filled: sStyle === 'filled', px, ground,
        key: badgeAssetKey(sl.type, sColour, sStyle === 'filled', px, ground),
      }));
    } else if (sStyle === 'glyph') {
      socials.forEach(sl => want.push({name: sl.type, svg: socialIcons[sl.type], hex: sColour, key: iconAssetKey(sl.type, sColour)}));
    }
    return want.filter(w => !(S.iconAssets || {})[w.key] && !iconAssetPending[w.key]);
  }

  // New Outlook draws the badge itself, so only the glyph needs a file — and
  // only where it is drawn in a colour, since a filled badge keeps the white.
  if (mode !== 'letters' && mode !== 'labels' && mode !== 'filled') {
    contacts.forEach(f => want.push({name: f.type, svg: contactIcons[f.type], hex: cColour, key: iconAssetKey(f.type, cColour)}));
  }
  if (sStyle === 'circle' || sStyle === 'glyph') {
    socials.forEach(sl => want.push({name: sl.type, svg: socialIcons[sl.type], hex: sColour, key: iconAssetKey(sl.type, sColour)}));
  }
  return want.filter(w => !(S.iconAssets || {})[w.key] && !iconAssetPending[w.key]);
}

// Makes and uploads whatever is missing, then redraws once at the end rather
// than once per glyph. Never throws: a failure just leaves the fallback.
let iconAssetRun = null;
function syncIconAssets(target) {
  if (iconAssetRun) return iconAssetRun;
  const want = neededIconAssets(target);
  if (!want.length || !window.Cloud || !Cloud.isReady) return Promise.resolve(false);
  const c = Cloud.state();
  if (!c || !c.signedIn) return Promise.resolve(false);
  want.forEach(w => { iconAssetPending[w.key] = true; });
  iconAssetRun = (async () => {
    let added = false;
    for (const w of want) {
      const key = w.key;
      try {
        const blob = w.badge
          ? await drawBadgeBlob(w.svg, w.hex, w.filled, w.px, w.ground)
          : await drawIconBlob(w.svg, w.hex);
        if (!blob) continue;
        const file = new File([blob], key + '.png', {type: 'image/png'});
        const res = await Cloud.uploadAsset(file, 'icon-' + key);
        if (res && res.ok && res.url) {
          S.iconAssets = S.iconAssets || {};
          S.iconAssets[key] = res.url;
          added = true;
        }
      } catch (e) { /* the fallback stands */ }
      delete iconAssetPending[key];
    }
    iconAssetRun = null;
    if (added) { saveState(); renderStage(); }
    return added;
  })();
  return iconAssetRun;
}

// Which target is in force. Derived from the selected client tab rather than
// held alongside it: the two were separate state, and a reload restored the
// tab without the target, so New Outlook sat selected while the preview, the
// copy and the export were all still Standard.
function currentTarget() {
  const c = previewClients.find(x => x.id === S.client);
  return (c && c.target) || '';
}

// These helpers render SVGs onto a canvas and emit <img> tags with PNG
// data URIs, which every email client renders.
const _pngIconCache = new Map();

// Renders an SVG string to a PNG data-URI through a canvas.
// Returns a cached PNG if available; otherwise kicks off background
// rendering (Image load → canvas draw → toDataURL) and returns an
// SVG-in-img fallback that works in browsers for the live preview.
// By the next renderStage() cycle the PNG is cached and the copy/export
// path hands Outlook a real image.
function svgToImgTag(svgStr, width, height, color, extraStyle) {
  if (!svgStr) return '';
  const w = Math.round(width);
  const h = Math.round(height);
  const key = svgStr + '|' + w + '|' + h + '|' + color;

  // Prepare a standalone SVG with explicit colour, size, and namespace.
  let svg = svgStr.replace(/currentColor/g, color || '#000000');
  svg = svg.replace(/width="14"/, 'width="' + w + '"').replace(/height="14"/, 'height="' + h + '"');
  svg = svg.replace(/width="16"/, 'width="' + w + '"').replace(/height="16"/, 'height="' + h + '"');
  if (!svg.includes('xmlns=')) svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');

  const cached = _pngIconCache.get(key);
  if (cached) {
    return '<img src="' + cached + '" width="' + w + '" height="' + h + '" alt="" style="display:block;' + (extraStyle || '') + '">';
  }

  // Not yet cached — render to PNG asynchronously via Image + canvas.
  const svgUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const img = new Image();
  img.onload = function () {
    var s = 2;  // 2× for retina sharpness
    var c = document.createElement('canvas');
    c.width = w * s; c.height = h * s;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, w * s, h * s);
    _pngIconCache.set(key, c.toDataURL('image/png'));
  };
  img.src = svgUri;

  // Fallback: SVG data URI in an <img> — works in browsers for the live
  // preview while the PNG renders in the background.
  return '<img src="' + svgUri + '" width="' + w + '" height="' + h + '" alt="" style="display:block;' + (extraStyle || '') + '">';
}

// ───────────── Demo logo ─────────────
// The logo every layout shows until somebody uploads their own — this
// product's own lockup, drawn by tools/make-sample-logo.ps1 and served from
// this site. Recognising it is what lets the renderer tell "the user picked
// this" apart from "nobody has chosen yet".
//
// It used to be a real company's logo pulled from that company's WordPress
// install, which made the sample signature depend on somebody else's site
// staying up and put their mark in front of every visitor.
const DEFAULT_LOGO_URL = 'https://signvel.com/sample-logo.png';

// The same lockup for the grounds it has to survive. A layout that asks for a
// white treatment gets the white file, and one whose slot is built around a
// square mark rather than a lockup gets the mark alone — Colour block's panel
// is 136px wide, and a wordmark squeezed into it is a smudge.
//
// Only the sample swaps like this. An uploaded logo is used exactly as
// uploaded: guessing at a white version of somebody's mark is not this
// product's business.
const SAMPLE_LOGO_WHITE_URL = 'https://signvel.com/sample-logo-white.png';
const SAMPLE_MARK_WHITE_URL = 'https://signvel.com/sample-mark-white.png';

// Al Riyady's own mark. Used by the identity below and nowhere else: the
// Corporate layout reproduces that signature, and reproducing it under
// another company's logo would defeat the point of having it.
const CORPORATE_LOGO_URL = 'https://alriyady.ae/wp-content/uploads/2023/10/Al-Riyady-Corporate-Services-Proerties-Logo-400x163.png';

// What the default logo used to be. A saved signature still pointing at it
// was never a choice anybody made, so it follows the default forward.
const RETIRED_DEFAULT_LOGOS = [CORPORATE_LOGO_URL];

function ensureDefaultLogo() {
  if (RETIRED_DEFAULT_LOGOS.indexOf(S.logoUrl) !== -1) S.logoUrl = DEFAULT_LOGO_URL;
}

// ───────────── Template themes ─────────────
// Each layout was drawn against a particular palette and a particular set of
// treatments, and reads as a different design because of both. Switching
// template loads the whole record when "Match template design" is on, which is
// what makes the gallery look like the set it was drawn from rather than
// seventeen variations on one colour.
//
// Everything here is a starting point, never a constraint: every field maps to
// a control in the Design panel, so a loaded theme can be overridden field by
// field afterwards and the override survives until the template changes again.
//
//   accent   – theme colour: icons, rules, links
//   accent2  – second colour: chips, bands, campaign cards
//   panel    – null leaves the background panel alone; a colour switches it on
//   heading  – display face for the name, '' inherits the body font
//   social   – social treatment (chip | circle | filled | plain | outline | glyph)
//   icons    – contact treatment (circle | filled | icons | letters | labels)
//   cols     – contact columns, 1 or 2
//   role     – job-title treatment (plain | caps | chip | pill)
//   caps     – name in capitals
//   track    – name letter-spacing, in hundredths of an em
//   shape    – headshot shape, where the layout depends on one
//   ring     – headshot ring width in px
const templateThemes = {
  // The brand layout. Left on Al Riyady gold, and never re-themed.
  corporate:  {accent:'#C9962B', accent2:'#141220', panel:null, social:'circle', icons:'circle',  cols:1, role:'plain', caps:false, track:0},
  spotlight:  {accent:'#2563EB', accent2:'#141220', panel:null, social:'plain',  icons:'icons',   cols:1, role:'plain', caps:false, track:0,  shape:'circle'},
  split:      {accent:'#2E7D74', accent2:'#1F3B37', panel:null, social:'filled', icons:'letters', cols:1, role:'plain', caps:false, track:0},
  directory:  {accent:'#12A594', accent2:'#0E3B36', panel:null, social:'circle', icons:'letters', cols:1, role:'plain', caps:false, track:0},
  accentbar:  {accent:'#2FBF71', accent2:'#14532D', panel:null, social:'filled', icons:'letters', cols:1, role:'plain', caps:false, track:0},
  colorblock: {accent:'#E8342A', accent2:'#1A1A1A', panel:null, social:'glyph',  icons:'letters', cols:2, role:'plain', caps:true,  track:14},
  darkcard:   {accent:'#3ED6A0', accent2:'#22365C', panel:null, social:'glyph',  icons:'letters', cols:2, role:'chip',  caps:false, track:0,  shape:'rounded'},
  connect:    {accent:'#1B4FA0', accent2:'#123B7A', panel:null, social:'filled', icons:'icons',   cols:1, role:'caps',  caps:false, track:0,  shape:'circle'},
  ribbon:     {accent:'#9B7BE8', accent2:'#2C3142', panel:null, social:'filled', icons:'filled',  cols:1, role:'chip',  caps:true,  track:16, shape:'circle', ring:5},
  brandmark:  {accent:'#2D7FF9', accent2:'#123B7A', panel:null, social:'glyph',  icons:'icons',   cols:1, role:'plain', caps:false, track:0},
  inline:     {accent:'#2D7FF9', accent2:'#123B7A', panel:null, social:'glyph',  icons:'icons',   cols:1, role:'plain', caps:false, track:0},
  labelled:   {accent:'#E8553A', accent2:'#7A2415', panel:null, social:'filled', icons:'labels',  cols:1, role:'plain', caps:false, track:0,  shape:'circle'},
  band:       {accent:'#2563EB', accent2:'#1B49B8', panel:null, social:'filled', icons:'icons',   cols:1, role:'plain', caps:true,  track:2,  shape:'rounded'},
  editorial:  {accent:'#FFFFFF', accent2:'#F5F1E6', panel:'#1E2B4D', social:'circle', icons:'icons', cols:2, role:'plain', caps:true, track:10, shape:'square', heading:'Georgia'},
  grid:       {accent:'#3FCF8E', accent2:'#111614', panel:'#0D0F0E', social:'filled', icons:'labels', cols:2, role:'caps', caps:false, track:-1, shape:'circle'},
  feature:    {accent:'#8FCBFF', accent2:'#0E4FA8', panel:'#1668D8', social:'filled', icons:'icons', cols:2, role:'pill', caps:false, track:0, shape:'circle', ring:4},
  minimal:    {accent:'#475569', accent2:'#1F2937', panel:null, social:'plain',  icons:'icons',   cols:1, role:'plain', caps:false, track:0},
  // The only one that stacks. Every other layout sets the portrait or the logo
  // beside the text, which needs width to work; this one runs down a single
  // narrow column, so it holds its shape in a phone's mail app and in the
  // reading pane of a client that gives a message half a window.
  stacked:    {accent:'#7E22CE', accent2:'#3B0764', panel:null, social:'circle', icons:'icons',   cols:1, role:'plain', caps:false, track:0,  shape:'circle'},
  // The portrait and the mark share a column of their own, which no other
  // layout does: everywhere else the logo sits opposite the portrait or beside
  // the name, and this stacks the two so the identity reads as one block with
  // the details ruled off beside it.
  profile:    {accent:'#15803D', accent2:'#052E16', panel:null, social:'filled', icons:'icons',   cols:1, role:'plain', caps:false, track:0,  shape:'circle'},
  // Corporate's shape — who you are on top, then the mark beside the details —
  // but carrying a portrait above it, which Corporate has no slot for. The one
  // layout in the set that shows a face and a mark without setting them
  // opposite each other.
  letterhead: {accent:'#9F1239', accent2:'#4C0519', panel:null, social:'circle', icons:'circle',  cols:1, role:'plain', caps:false, track:0,  shape:'circle'},
  // A portrait across the top, then who you are and how to reach you set as
  // two columns under it, ruled above and below. Split and Directory pair those
  // same two columns but lead with the name; leading with the face instead
  // makes the rule a masthead rather than a divider.
  masthead:   {accent:'#B45309', accent2:'#451A03', panel:null, social:'glyph',  icons:'icons',   cols:1, role:'plain', caps:false, track:0,  shape:'circle'},
  // Stacked's sequence at full width, with the mark carried high — directly
  // under the name rather than down beside the social icons. Stacked is drawn
  // narrow so it survives a phone; this one spends the width instead, and the
  // brand arrives before the details rather than after them.
  bulletin:   {accent:'#0E7490', accent2:'#083344', panel:null, social:'circle', icons:'icons',   cols:1, role:'plain', caps:false, track:0,  shape:'circle'},
  // A rule standing on its end. Accent bar has a coloured edge, but it marks
  // the outside of the whole block; this one divides, with the portrait and
  // the mark on one side of it and everything else on the other.
  aside:      {accent:'#4338CA', accent2:'#1E1B4B', panel:null, social:'filled', icons:'icons',   cols:1, role:'plain', caps:false, track:0,  shape:'circle'},
  // Three panels across: the picture, who you are, how to reach you — ruled
  // underneath. The set had two-column pairings and one three-column layout
  // that ends in a call to action; this one gives the three equal standing.
  triptych:   {accent:'#7C2D12', accent2:'#431407', panel:null, social:'circle', icons:'icons',   cols:1, role:'plain', caps:false, track:0,  shape:'circle'},
};

// Falls back to the theme accent, so a layout added later still gets a mark.
function themeOf(id) { return templateThemes[id] || templateThemes.minimal; }

// ───────────── Sample images ─────────────
// Real hosted URLs, not data: URIs — these are what a signature needs to
// survive being emailed, and they let someone see a photo layout as it was
// designed before they have uploaded anything of their own.
// Ordered deliberately: the first entry is what every photo layout ships with,
// so it leads with the most signature-like portrait in the set — a collared
// shirt, an even background and a warm, level expression. The second is the
// same brief in a jacket, for anyone who wants the formal version.
//
// fit=facearea rather than fit=crop: the plain crop centres the frame, which
// leaves the face small and low once a layout renders it as a 78px circle.
// facearea crops around the detected face instead, so every portrait arrives
// framed the same way whatever the original composition was.
const SAMPLE_HEADSHOT_CROP = 'w=400&h=400&fit=facearea&facepad=3';
const unsplash = (id) => `https://images.unsplash.com/${id}?${SAMPLE_HEADSHOT_CROP}`;

const sampleHeadshots = [
  {id:'m1', label:'Daniel', url:unsplash('photo-1531427186611-ecfd6d936c79')},
  {id:'m2', label:'Victor', url:unsplash('photo-1560250097-0b93528c311a')},
  {id:'m3', label:'Marco',  url:unsplash('photo-1507003211169-0a1dd7228f2d')},
  {id:'h1', label:'Zoe',    url:unsplash('photo-1494790108377-be9c29b29330')},
  {id:'h3', label:'Amelia', url:unsplash('photo-1438761681033-6461ffad8d80')},
  {id:'h5', label:'Priya',  url:unsplash('photo-1573497019940-1c28c88b4f3e')},
  {id:'h7', label:'Nadia',  url:unsplash('photo-1534528741775-53994a69daeb')},
  {id:'h8', label:'Oliver', url:unsplash('photo-1506794778202-cad84cf45f1d')},
];

const DEFAULT_BANNER_URL = 'https://signvel.com/sample-banner.png';

// One placeholder, and nothing else. The banner slot is for the company's own
// artwork; a stock photograph of somebody else's office sitting in it reads as
// part of a design that is about to be sent, the same way a stock face did in
// the portrait slot.
const sampleBanners = [
  {id:'b0', label:'Placeholder', url:DEFAULT_BANNER_URL},
];

// The stock photographs that used to be offered here. A saved signature still
// carrying one was picked from a list this product no longer stands behind, so
// it follows the placeholder forward. An uploaded image is left alone.
const RETIRED_SAMPLE_BANNERS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1040&h=260&fit=crop',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1040&h=260&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1040&h=260&fit=crop',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1040&h=260&fit=crop',
];

// What every layout previews with until somebody uploads their own. A drawn
// placeholder, not a photograph: it shows the shape and size the slot gives a
// portrait without putting a stranger's face in a signature that is about to
// carry somebody else's name. Served from this site rather than a stock host,
// and absolute rather than relative on purpose — the same URL has to work
// inside an exported signature sitting in a mail client, where a relative path
// resolves against nothing.
const DEFAULT_HEADSHOT_URL = 'https://signvel.com/sample-portrait.png';

// What the default used to be. A saved signature still pointing at one of
// these was never a choice anybody made — it is whatever the editor happened
// to ship that day — so it follows the default forward. Anything uploaded or
// picked deliberately is left exactly as it is.
const RETIRED_DEFAULT_HEADSHOTS = [sampleHeadshots[0].url, 'https://signvel.com/admin-portrait.jpg'];

function ensureDefaultPortrait() {
  if (RETIRED_DEFAULT_HEADSHOTS.indexOf(S.headshotUrl) !== -1) {
    S.headshotUrl = DEFAULT_HEADSHOT_URL;
  }
}

// Two cases follow the placeholder forward. One of the stock photographs that
// used to be offered, wherever it appears — that list is gone, and a signature
// still carrying one is showing an image this product no longer offers. And a
// banner nobody has touched at all: no image, no message, no subtext, no call
// to action, which is an empty slot rather than a choice.
//
// A banner with words in it keeps its empty image slot: the image wins over
// the text banner in several layouts, so filling it would quietly replace what
// somebody wrote — the sales scope preset is exactly that case.
function ensureDefaultBanner() {
  if (RETIRED_SAMPLE_BANNERS.indexOf(S.bannerImage) !== -1) {
    S.bannerImage = DEFAULT_BANNER_URL;
    return;
  }
  if (!S.bannerImage && !S.bannerMessage && !S.bannerSubtext && !S.ctaLabel) {
    S.bannerImage = DEFAULT_BANNER_URL;
  }
}

// ───────────── Identities ─────────────
// The editor ships with sample details, so the gallery reads as seventeen
// layouts rather than as one person's signature repeated seventeen times —
// and so nobody's real address and phone number are the first thing a new
// user sees.
//
// Corporate is the exception. It is the brand signature the app was built to
// reproduce, so it shows the real Al Riyady details and the real mark, in the
// same way and for the same reason it is the only layout that shows the real
// logo. That substitution lasts exactly as long as the shipped sample is
// untouched: type your own name and it is used on every layout, Corporate
// included.
// Sign Vel's own brand. The layouts double as the product's showcase, so the
// mark, company and links they preview with are Sign Vel's — the generated
// monogram picks the company name up from here, which is what puts "SV ·
// Sign Vel" in each layout's theme colour rather than a placeholder.
//
// The person is a stand-in, deliberately. These details sit on sixteen demo
// layouts and on the public showcase page, and a real name, mobile and street
// address do not belong there.
const SAMPLE_IDENTITY = {
  name: 'Daniel Reyes',
  title: 'Head of Partnerships',
  company: 'Sign Vel',
  contacts: {
    email:   'daniel@signvel.com',
    mobile:  '+971 50 123 4567',
    phone:   '+971 4 123 4567',
    address: 'Business Bay, Dubai, UAE',
    website: 'signvel.com',
  },
  socials: {
    facebook:'signvel', linkedin:'signvel', instagram:'signvel',
    youtube:'signvel', tiktok:'signvel', x:'signvel',
  },
};

// The sample identity that shipped before the layouts carried Sign Vel branding.
// Saved state holding it is still a copy of the demo, so it has to keep
// counting as stock — otherwise anyone who opened the editor while that set
// was live gets Northwind Studio frozen onto every layout.
// The Sign Vel-branded sample that preceded the current one, retired when the
// demo portrait changed and the name had to follow it.
const LEGACY_SIGNVEL_IDENTITY = {
  name: 'Elena Marsh',
  title: 'Head of Partnerships',
  company: 'Sign Vel',
  contacts: {
    email:   'elena@signvel.com',
    mobile:  '+971 50 123 4567',
    phone:   '+971 4 123 4567',
    address: 'Business Bay, Dubai, UAE',
    website: 'signvel.com',
  },
  socials: {
    facebook:'signvel', linkedin:'signvel', instagram:'signvel',
    youtube:'signvel', tiktok:'signvel', x:'signvel',
  },
};

const LEGACY_SAMPLE_IDENTITY = {
  name: 'Elena Marsh',
  title: 'Head of Partnerships',
  company: 'Northwind Studio',
  contacts: {
    email:   'elena@northwind.com',
    mobile:  '+44 20 7946 0812',
    phone:   '+44 20 7946 0900',
    address: '12 Wharf Road, London N1',
    website: 'northwind.com',
  },
  socials: {
    facebook:'northwind', linkedin:'northwind', instagram:'northwind',
    youtube:'northwind', tiktok:'northwind', x:'northwind',
  },
};

const CORPORATE_IDENTITY = {
  name: 'Farrukh Shahzad',
  title: 'Marketing Manager',
  company: 'Al Riyady Group',
  contacts: {
    email:   'farrukh@alriyady.ae',
    mobile:  '+971 50 274 9769',
    phone:   '+971 4 591 8185',
    address: 'The Curve Building - Office No. M 47, Dubai - UAE',
    website: 'alriyadygroup.ae',
  },
  socials: {
    facebook:'alriyady', linkedin:'alriyady', instagram:'alriyady.ae',
    youtube:'alriyady', tiktok:'alriyady', x:'alriyady',
  },
};

// True while the identity is still exactly what shipped. One edited character
// anywhere is enough to stop the Corporate substitution — at that point the
// details belong to the user, not to the demo.
function matchesIdentity(id) {
  if (S.name !== id.name || S.title !== id.title || S.company !== id.company) return false;
  return S.contactFields.every(f => !(f.type in id.contacts) || f.value === id.contacts[f.type]);
}

// Every identity the app has ever shipped counts as "nobody has typed their
// own details yet". A saved state holding one of them is a copy of the demo
// rather than a choice — the same reasoning that makes the stock logo
// recognisable as stock. Anything not on this list belongs to the user, and is
// then shown on every layout, Corporate included.
//
// Retiring a shipped identity means moving it here, never deleting it:
// whatever is dropped from this list gets frozen onto the layouts of everyone
// still carrying it.
const STOCK_IDENTITIES = [SAMPLE_IDENTITY, CORPORATE_IDENTITY, LEGACY_SIGNVEL_IDENTITY, LEGACY_SAMPLE_IDENTITY];

function identityIsStock() {
  return STOCK_IDENTITIES.some(matchesIdentity);
}
const contactIcons = {email:icons.email,mobile:icons.mobile,phone:icons.landline,website:icons.globe,address:icons.mappin,office:icons.building,pronouns:icons.user,booking:icons.calendar};
const socialIcons = {linkedin:icons.linkedin,x:icons.x,instagram:icons.instagram,youtube:icons.youtube,facebook:icons.facebook,tiktok:icons.tiktok,pinterest:icons.pinterest};

// Every platform the editor offers, in the order the panel lists them. This is
// the catalogue as well as the default: a saved signature written before a
// platform existed is topped up from here (see ensureSocialCatalogue), because
// otherwise adding one would only ever reach people who had never opened the
// editor before — everyone else carries their own saved array.
//
// A new entry goes in switched off with no handle. Appearing in someone's
// signature uninvited is worse than being one toggle away.
const DEFAULT_SOCIAL_LINKS = [
  {type:'facebook',  label:'Facebook',  handle:SAMPLE_IDENTITY.socials.facebook,  enabled:true},
  {type:'linkedin',  label:'LinkedIn',  handle:SAMPLE_IDENTITY.socials.linkedin,  enabled:true},
  {type:'instagram', label:'Instagram', handle:SAMPLE_IDENTITY.socials.instagram, enabled:true},
  {type:'youtube',   label:'YouTube',   handle:SAMPLE_IDENTITY.socials.youtube,   enabled:true},
  {type:'tiktok',    label:'TikTok',    handle:SAMPLE_IDENTITY.socials.tiktok,    enabled:true},
  {type:'pinterest', label:'Pinterest', handle:'',                                enabled:false},
  {type:'x',         label:'X',         handle:'',                                enabled:false},
];

// Adds anything the catalogue has and the loaded state does not. Order and
// handles the user chose are left exactly as they were; new platforms land at
// the end, which is also where they can be moved from.
function ensureSocialCatalogue() {
  if (!Array.isArray(S.socialLinks)) {
    S.socialLinks = DEFAULT_SOCIAL_LINKS.map(sl => Object.assign({}, sl));
    return;
  }
  const have = {};
  S.socialLinks.forEach(sl => { if (sl && sl.type) have[sl.type] = true; });
  DEFAULT_SOCIAL_LINKS.forEach(sl => {
    if (!have[sl.type]) {
      S.socialLinks.push({type:sl.type, label:sl.label, handle:'', enabled:false});
    }
  });
}

// ───────────── Mail client logos ─────────────
// Gmail, Thunderbird, Proton, iCloud and Zoho use the official marks from
// simple-icons. Outlook and Yahoo were withdrawn from that set over trademark,
// so those two are brand-coloured approximations — swap in official assets if
// you have licence to.
const mailLogos = {
  gmail: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#fff"/><g transform="translate(3 3) scale(.75)"><path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></g></svg>`,
  outlook: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#fff"/><path d="M13.4 7.1h8.1c.4 0 .7.3.7.7v8.4c0 .4-.3.7-.7.7h-8.1z" fill="#28A8EA"/><path d="M13.9 8.9l4.1 2.7 4.1-2.7" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><rect x="1.6" y="4.6" width="11.8" height="14.8" rx="1.8" fill="#0364B8"/><ellipse cx="7.5" cy="12" rx="3" ry="3.9" fill="none" stroke="#fff" stroke-width="2"/></svg>`,
  apple: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#fff"/><rect x="2.4" y="6" width="19.2" height="12" rx="3" fill="#1F8DF5"/><path d="M5.2 9.1l6.8 5 6.8-5" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  yahoo: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#fff"/><rect x="2.4" y="6" width="19.2" height="12" rx="2.6" fill="#6001D2"/><path d="M5.4 9l6.6 4.6L18.6 9" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  thunderbird: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#fff"/><g transform="translate(2.4 2.4) scale(.8)"><path fill="#0A84FF" d="M9.948 4.444h-.005c-1.92.788-2.126 2.55-1.817 3.499v.02C9.236 7.18 10.658 6.76 12 6.76c3.26 0 5.902 2.156 5.902 4.815 0 2.66-2.643 4.816-5.902 4.816l-.083-.002c-.155-.006-.354-.013-.435.118-.096.156.116.397.238.536 1.274 1.441 3.123 1.622 3.608 1.67l.076.008c-4.281.414-9.304-2.32-9.306-7.076 0-1.12.414-2.073 1.075-2.83l-.005-.002h-.003C7.31 6.38 6.376 3.47 4.629 2.898c-.124-.04-.246.054-.262.183-.23 1.924-.727 2.59-1.264 3.31-.805 1.08-1.39 2.328-1.365 3.698a10.99 10.99 0 0 1-.705-1.91c-.024-.09-.17-.365-.333-.272-.13.072-.227.274-.296.485A12.137 12.137 0 0 0 0 11.489c0 6.536 5.475 12 12 12 6.627 0 12-5.372 12-12 0-2.526-.781-4.87-2.115-6.805l.167-.002c.518 0 1.024.045 1.51.129-.734-.816-1.724-1.475-2.877-1.904a8.54 8.54 0 0 1 2.494-.495c-1.426-1.166-3.508-1.9-5.827-1.9-3.355 0-6.648 1.29-7.404 3.93z"/></g></svg>`,
  proton: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#fff"/><g transform="translate(2.4 2.4) scale(.8)"><path fill="#6D4AFF" d="m15.24 8.998 3.656-3.073v15.81H2.482C1.11 21.735 0 20.609 0 19.223V6.944l7.58 6.38a2.186 2.186 0 0 0 2.871-.042l4.792-4.284h-.003zm-5.456 3.538 1.809-1.616a2.438 2.438 0 0 1-1.178-.533L.905 2.395A.552.552 0 0 0 0 2.826v2.811l8.226 6.923a1.186 1.186 0 0 0 1.558-.024zM23.871 2.463a.551.551 0 0 0-.776-.068l-3.199 2.688v16.653h1.623c1.371 0 2.481-1.127 2.481-2.513V2.824a.551.551 0 0 0-.129-.36z"/></g></svg>`,
  icloud: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#fff"/><g transform="translate(2.4 2.4) scale(.8)"><path fill="#3693F3" d="M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z"/></g></svg>`,
  // The clients with no mark in this file get one of their own rather than a
  // shared envelope: five identical grey icons told you nothing about which
  // tab was which. Each is a plain glyph in the product's own colour — near
  // enough to tell them apart at 20px, and not a copy of anyone's logo.
  airmail: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#1B8CF3"/><path d="M5 12.4 19 5.5l-4.6 13.2-2.6-4.9-4.4 2.3.8-3z" fill="#fff"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#E8453C"/><path d="M13.4 4 7 13.2h4l-1.2 6.8 6.6-9.4h-4.2z" fill="#fff"/></svg>`,
  windowsmail: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#0078D4"/><g transform="translate(4 7)"><rect x=".6" y=".6" width="14.8" height="10.8" rx="1.6" fill="#fff"/><path d="M2 2.6 8 7l6-4.4" fill="none" stroke="#0078D4" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`,
  mailbird: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#1F3A63"/><path d="M6 15.8c3.6.9 7-.6 8.7-3.6l2.1.5-1.3-2 1.5-1.9-2.4.2C13.5 6.6 11 5.4 8.7 6.2c2.2.5 3 1.9 3.2 3.4-1.9.4-4.2 1.7-5.9 6.2z" fill="#fff"/></svg>`,
  emclient: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#F4900C"/><path d="M12 5.4A6.6 6.6 0 1 0 17.4 16l-1.9-1.2A4.4 4.4 0 1 1 12 7.6a4.4 4.4 0 0 1 4.3 3.3H10v2.2h8.5A6.6 6.6 0 0 0 12 5.4z" fill="#fff"/></svg>`,
  mobile: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#fff"/><rect x="7.5" y="3.4" width="9" height="17.2" rx="2.4" fill="none" stroke="#6B6880" stroke-width="1.7"/><path d="M10.6 17.8h2.8" stroke="#6B6880" stroke-width="1.7" stroke-linecap="round"/></svg>`,
};

// ───────────── Disclaimer presets ─────────────
const disclaimerPresets = {
  standard: 'This email and any attachments are confidential and intended solely for the addressee. If you have received this email in error, please notify the sender immediately and delete this email.',
  short: 'This email is confidential. If received in error, please delete and notify the sender.',
  regulated: 'This email and any attachments are confidential and may be legally privileged. Any unauthorized use, disclosure, or distribution is strictly prohibited. If you are not the intended recipient, please contact the sender immediately and delete all copies. This communication does not constitute legal, financial, or professional advice.',
};

// Preview tabs, in the order they appear above the stage.
//
// Outlook is three tabs rather than one, because it is three renderers and a
// signature cannot be written for all of them at once. Each carries the export
// target it previews, and picking the tab is what chooses that target — for
// every other client it is Standard, which is what they all render.
// How each client frames a message: the font it reads in, the width of its
// reading pane, and the tint behind the message. Naming the client over a
// preview that looked the same for all fifteen was a claim the preview did
// not back up — these are what actually differ between them.
//
// The font matters most. Anything in the signature that does not name its own
// face inherits the client's, which is Calibri in Word and a system face in
// Apple Mail, and that is a visible difference in the same signature.
// The bar across the top of the preview, drawn as that kind of program draws
// it: a Mac window, a Windows one, a browser tab, or a phone. It carries no
// words — the client is named beside the Install button, and repeating it
// over the message was noise.
function windowChrome(client) {
  const kind = (CHROME[client.chrome] || {}).frame || 'web';
  const mark = mailLogos[client.logo || client.id] || '';
  if (kind === 'macos') {
    return `<div class="mock-chrome is-macos"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="mock-chrome-mark">${mark}</span></div>`;
  }
  if (kind === 'windows') {
    return `<div class="mock-chrome is-windows"><span class="mock-chrome-mark">${mark}</span><span class="win-btns"><i class="min"></i><i class="max"></i><i class="cls"></i></span></div>`;
  }
  if (kind === 'phone') {
    return `<div class="mock-chrome is-phone"><span class="phone-bar"></span><span class="mock-chrome-mark">${mark}</span></div>`;
  }
  return `<div class="mock-chrome is-web"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="url-pill"><span class="mock-chrome-mark">${mark}</span></span></div>`;
}

const CHROME = {
  apple:   {font:"-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif", width:680, bg:'#FFFFFF', frame:'macos'},
  ios:     {font:"-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif", width:390, bg:'#FFFFFF', frame:'phone'},
  gmail:   {font:"Roboto, Arial, Helvetica, sans-serif", width:640, bg:'#FFFFFF', frame:'web'},
  yahoo:   {font:"'Helvetica Neue', Helvetica, Arial, sans-serif", width:640, bg:'#FFFFFF', frame:'web'},
  word:    {font:"Calibri, 'Segoe UI', Arial, sans-serif", width:580, bg:'#FFFFFF', frame:'windows'},
  segoe:   {font:"'Segoe UI', Tahoma, Arial, sans-serif", width:640, bg:'#FFFFFF', frame:'windows'},
  linuxy:  {font:"'Segoe UI', Ubuntu, Cantarell, Arial, sans-serif", width:660, bg:'#FFFFFF', frame:'windows'},
  proton:  {font:"Inter, 'Segoe UI', Arial, sans-serif", width:640, bg:'#F5F5F7', frame:'web'},
};

// Every client the signature is claimed to work in gets a tab, so the claim
// can be checked rather than taken on trust. Only the three Outlooks need
// markup of their own; the rest all render the Standard form, which is what
// having no target means.
const previewClients = [
  {id:'apple',           label:'Apple Mail (macOS)',   logo:'apple',       install:'applemail', chrome:'apple'},
  {id:'ios-mail',        label:'Mail (iOS)',           logo:'apple',       install:'applemail', chrome:'ios'},
  {id:'airmail',         label:'Airmail (macOS)',      logo:'airmail',     chrome:'apple'},
  {id:'spark',           label:'Spark (macOS)',        logo:'spark',       chrome:'apple'},
  {id:'gmail',           label:'Gmail (web)',          logo:'gmail',       install:'gmail',     chrome:'gmail'},
  {id:'gmail-ios',       label:'Gmail (iOS)',          logo:'gmail',       install:'gmail',     chrome:'gmail'},
  {id:'yahoo',           label:'Yahoo (web)',          logo:'yahoo',       install:'yahoo',     chrome:'yahoo'},
  // The three renderers, kept together: a browser, Word, and a WebView.
  {id:'outlook-new',     label:'Outlook modern',       logo:'outlook', target:'newoutlook', install:'outlook365', chrome:'segoe'},
  {id:'outlook-classic', label:'Outlook classic',      logo:'outlook', target:'classic', install:'outlook365', chrome:'word'},
  {id:'outlook',         label:'Outlook (iOS)',        logo:'outlook', target:'', install:'outlook365', chrome:'segoe'},
  {id:'windows-mail',    label:'Mail (Windows)',       logo:'windowsmail', chrome:'segoe'},
  {id:'mailbird',        label:'Mailbird',             logo:'mailbird',    chrome:'segoe'},
  {id:'emclient',        label:'eM Client',            logo:'emclient',    chrome:'segoe'},
  {id:'thunderbird',     label:'Thunderbird',          logo:'thunderbird', install:'thunderbird', chrome:'linuxy'},
  {id:'proton',          label:'Proton Mail',          logo:'proton',      install:'proton',    chrome:'proton'},
];

// ───────────── Install hints ─────────────
// Install targets: the logo, the steps, and which clipboard action each needs.
const installTargets = [
  {id:'gmail',       logo:'gmail',       label:'Gmail',        time:'1 min', use:'Copy signature',
   steps:['Settings → See all settings → General.','Scroll to Signature, click Create new, name it.','Paste with Ctrl/Cmd+V.','Set the defaults for new mail and replies.','Save Changes at the bottom of the page.'],
   note:'Keep the whole signature under ~10,000 characters or Gmail clips it. A hosted logo URL is the main saving.'},
  {id:'outlook365',  logo:'outlook',     label:'Outlook 365',  time:'2 min', use:'Copy signature',
   steps:['Settings → Mail → Compose and reply.','Paste into the Email signature box.','Name it, then choose new messages, replies, or both.','Save, and send yourself a test.'],
   note:'Word renders the message, so rounded icon badges arrive square and inline SVG will not show at all.'},
  {id:'applemail',   logo:'apple',       label:'Apple Mail',   time:'1 min', use:'Copy signature',
   steps:['Mail → Settings → Signatures.','Pick the account, click + to add one.','Clear the placeholder, paste with Cmd+V.','Untick "Always match my default message font".'],
   note:'The most faithful of the desktop clients — if it looks right here, the design is sound.'},
  {id:'yahoo',       logo:'yahoo',       label:'Yahoo Mail',   time:'1 min', use:'Copy signature',
   steps:['Settings → More Settings → Mailboxes.','Select your address, toggle the signature on.','Paste into the box.','Changes save on their own.'],
   note:'Yahoo strips <style> blocks. Everything here is inline already, so it comes through intact.'},
  {id:'thunderbird', logo:'thunderbird', label:'Thunderbird',  time:'2 min', use:'Export HTML',
   steps:['Account Settings → select your account.','Tick "Use HTML".','Paste the exported source into the signature box.'],
   note:'Thunderbird wants raw HTML rather than a rich paste, so use Export HTML for this one.'},
  {id:'proton',      logo:'proton',      label:'Proton Mail',  time:'1 min', use:'Export HTML',
   steps:['Settings → All settings → Identity and addresses.','Edit your address, enable the signature.','Switch the box to code view and paste the source.'],
   note:'Proton sanitises remote content — recipients may need to allow images from your address once.'},
  {id:'icloud',      logo:'icloud',      label:'iCloud Mail',  time:'1 min', use:'Copy signature',
   steps:['iCloud Mail → Settings (gear) → Preferences.','Open Composing and tick the signature box.','Paste with Cmd+V.'],
   note:'Web iCloud Mail accepts a rich paste but strips some spacing — check a test send.'},
  {id:'workspace',   logo:'gmail',       label:'Workspace push', time:'Admin', use:'Export HTML',
   steps:['Admin console → Apps → Google Workspace → Gmail.','Open Compliance, find Append footer.','Choose the organisational unit.','Paste the exported HTML and save.'],
   note:'Server-side footers append once per thread and staff cannot edit them, so personal details still need per-user signatures.'},
];

// ───────────── State ─────────────
const S = {
  scope: 'default',
  scopeData: {},
  // Glyphs drawn in a theme colour and uploaded, keyed name-hex. A cache of
  // URLs rather than settings: safe to lose, rebuilt on demand.
  iconAssets: {},
  panelCollapsed: false,
  client: 'gmail',
  device: 'desktop',
  darkMode: false,
  openSection: 0,

  template: 'corporate',
  alignment: 'left',
  blockSpacing: 8,
  dividerEnabled: true,
  dividerWidth: 2,
  // 0 means "as wide as the content needs". Anything else caps the signature so
  // it cannot blow out a narrow reading pane.
  panelWidth: 0,
  // Carry a layout's palette across when the template changes. Off keeps your
  // own colours whatever you switch to.
  matchTemplateTheme: true,

  font: 'Helvetica Neue',
  // Empty inherits the body font. A separate display face is what makes the
  // editorial layouts read differently from the rest.
  headingFont: '',
  bodySize: 14,
  fontWeight: 'regular',
  textColor: '#4A4A48',
  nameColor: '#4A4A48',
  titleColor: '#666666',

  // Name treatment, shared by every layout that prints a name.
  nameScale: 100,
  nameUppercase: false,
  nameTracking: 0,
  // How the job title is drawn: plain text, a rounded chip, a full pill, or
  // wide-tracked capitals.
  roleStyle: 'plain',

  accentColor: '#C9962B',
  // Chips, bands and campaign cards. Distinct from the theme colour so a
  // layout can carry two without either being guessed from the other.
  accent2Color: '#141220',

  // Contacts in one column or two. Two is what the wide layouts were drawn for.
  contactColumns: 1,

  bgEnabled: false,
  bgColor: '#14121F',
  bgPadding: 24,
  bgRadius: 12,
  // A public https URL, which is the one form that survives being emailed.
  // Kept in sync with DEFAULT_LOGO_URL, which is how the renderer tells the
  // sample apart from a logo somebody chose.
  logoUrl: DEFAULT_LOGO_URL,
  logoName: 'Sample logo',
  logoHeight: 40,
  // Where the logo sits against the text beside it, for the layouts that give
  // it a cell of its own. Middle for the same reason the portrait is.
  logoAlign: 'middle',

  // A sample portrait ships by default so the photo layouts look like the
  // designs they were drawn from before anyone uploads anything.
  headshotUrl: DEFAULT_HEADSHOT_URL,
  headshotName: 'Sample portrait',
  headshotShape: 'circle',
  headshotZoom: 100,
  // Where the portrait sits against the text beside it: top, middle or
  // bottom. Middle by default, because a portrait pinned to the top of a
  // block that grows with every contact row and a disclaimer ends up marooned
  // at the top of a tall signature. Each layout used to hard-code its own.
  photoAlign: 'middle',
  // Ring drawn around the portrait. 0 is no ring.
  photoRing: 0,
  photoRingColor: '#FFFFFF',
  // 0 follows the per-template default; anything else overrides it.
  headshotSize: 0,

  uploadError: '',
  storageError: '',

  // Sample details, not anyone's real ones. Corporate substitutes the brand
  // identity for as long as these are untouched — see identityIsStock.
  name: SAMPLE_IDENTITY.name,
  title: SAMPLE_IDENTITY.title,
  company: SAMPLE_IDENTITY.company,
  tagline: '',

  contactIconMode: 'circle',
  showContactIcons: true,
  contactIconSize: 22,
  iconColor: '#C9962B',
  socialIconColor: '#C9962B',
  contactFields: [
    {type:'email',   label:'Email',   value:SAMPLE_IDENTITY.contacts.email,   enabled:true,  removable:false},
    {type:'mobile',  label:'Mobile',  value:SAMPLE_IDENTITY.contacts.mobile,  enabled:true,  removable:false},
    {type:'phone',   label:'Phone',   value:SAMPLE_IDENTITY.contacts.phone,   enabled:true,  removable:true},
    {type:'address', label:'Address', value:SAMPLE_IDENTITY.contacts.address, enabled:true,  removable:false},
    {type:'website', label:'Website', value:SAMPLE_IDENTITY.contacts.website, enabled:true,  removable:false},
  ],

  socialStyle: 'circle',
  socialIconSize: 28,
  socialLinks: DEFAULT_SOCIAL_LINKS.map(sl => Object.assign({}, sl)),

  bannerEnabled: false,
  bannerMessage: '',
  bannerSubtext: '',
  // The slot arrives filled, so switching the banner on shows the shape and
  // proportion it gives an image straight away rather than an empty strip.
  // Still off by default: a placeholder that shipped switched on would be
  // pasted into a mail client and sent as a grey box by whoever did not look.
  bannerImage: DEFAULT_BANNER_URL,
  // Small by default. A campaign image used to render 520px wide, which is the
  // width of the signature itself, so it read as a picture with a signature
  // underneath rather than a signature with an image in it.
  bannerWidth: 140,
  ctaLabel: '',
  ctaUrl: '',
  ctaStyle: 'solid',

  disclaimerEnabled: true,
  disclaimerPreset: 'standard',
  disclaimerText: 'The content of this email is confidential and intended for the recipient specified in message only. It is strictly forbidden to share any part of this message with any third party, without a written consent of the sender. If you received this message by mistake, please reply to this message and follow with its deletion, so that we can ensure such a mistake does not occur in the future.',

  // Everything editable by default. Locks are opt-in from Rollout & install —
  // shipping sections pre-locked just blocks the person setting up their own
  // signature.
  rolloutLocks: {typography:'editable',disclaimer:'editable',banner:'editable',contactFields:'editable'},
  installTarget: 'outlook365',
};

// ───────────── Scopes ─────────────
// A scope is a departmental override sitting on top of the brand default.
// Switching scopes stashes whatever you had under the outgoing scope, then loads
// the incoming one: your previous edits if you've been there before, otherwise
// the preset, otherwise the brand default.
const SCOPED_KEYS = [
  'template','alignment','font','headingFont','bodySize','fontWeight','textColor','accentColor',
  'accent2Color','nameScale','nameUppercase','nameTracking','roleStyle','contactColumns','panelWidth',
  'contactIconMode','socialStyle','bannerEnabled','bannerMessage','ctaLabel','ctaUrl',
  'ctaStyle','bannerSubtext','bgEnabled','bgColor','bgPadding','bgRadius','disclaimerEnabled','disclaimerPreset','disclaimerText',
];

const scopePresets = {
  sales: {
    bannerEnabled:true, bannerMessage:'Book a 15-minute intro call',
    bannerSubtext:'No obligation — we will map out your setup options.',
    ctaLabel:'Book time', ctaUrl:'https://alriyadygroup.ae/contact', ctaStyle:'pill',
  },
  legal: {
    disclaimerEnabled:true, disclaimerPreset:'regulated',
    disclaimerText:disclaimerPresets.regulated, socialStyle:'plain', contactIconMode:'labels',
  },
  engineering: {
    template:'minimal', contactIconMode:'labels', socialStyle:'plain', bannerEnabled:false,
  },
  executive: {
    template:'editorial', fontWeight:'semibold', socialStyle:'outline', bannerEnabled:false,
  },
};

// Snapshot of the shipped brand values, taken before any saved state loads.
const brandDefaults = {};
SCOPED_KEYS.forEach(k => { brandDefaults[k] = S[k]; });

function applyScope(next) {
  const current = {};
  SCOPED_KEYS.forEach(k => { current[k] = S[k]; });
  S.scopeData[S.scope] = current;

  S.scope = next;
  const source = S.scopeData[next] || Object.assign({}, brandDefaults, scopePresets[next] || {});
  SCOPED_KEYS.forEach(k => { if (k in source) S[k] = source[k]; });
}

// ───────────── Rollout locks ─────────────
// Maps a panel section to the lock that governs it. A locked section renders
// dimmed and non-interactive until it is unlocked in Rollout & install.
const sectionLocks = {
  design:'typography', disclaimer:'disclaimer', banner:'banner', contacts:'contactFields',
};

// ───────────── Sections meta ─────────────
const sections = [
  {id:'templates',  title:'Templates & layout', short:'Layout',   cat:'Design'},
  {id:'design',     title:'Design',             short:'Design',   cat:'Design'},
  {id:'media',      title:'Logo & headshot',    short:'Media',    cat:'Design'},
  {id:'contacts',   title:'Contact fields',     short:'Contact',  cat:'Content'},
  {id:'social',     title:'Social links',       short:'Social',   cat:'Content'},
  {id:'banner',     title:'Banner & CTA',       short:'Campaign', cat:'Content'},
  {id:'disclaimer', title:'Disclaimer',         short:'Legal',    cat:'Content'},
  {id:'rollout',    title:'Rollout & install',  short:'Rollout',  cat:'Content'},
  // Hidden from the rail unless the signed-in profile carries is_admin. That
  // is presentation only — the figures come from an Edge Function that checks
  // the same flag server-side, so an unhidden button would still get nothing.
  {id:'admin',      title:'Admin',              short:'Admin',    cat:'Account', adminOnly:true},
];

// ───────────── Rail icons ─────────────
const railIcons = {
  admin:      `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20v-1.5a4.5 4.5 0 0 1 4.5-4.5h3A4.5 4.5 0 0 1 15 18.5V20"/><circle cx="9" cy="7.5" r="3.5"/><path d="M18 10.5v4M16 12.5h4"/></svg>`,
  templates:  `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  design: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6V4h16v2M12 4v16M9 20h6"/></svg>`,
  media:      `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10z"/></svg>`,
  contacts:   `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M21 7l-9 6-9-6"/></svg>`,
  social:     `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="17" cy="6" r="2.6"/><circle cx="6.5" cy="12" r="2.6"/><circle cx="17" cy="18" r="2.6"/><path d="M8.9 10.8l5.7-3.3M8.9 13.2l5.7 3.3"/></svg>`,
  banner:     `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg>`,
  disclaimer: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>`,
  rollout:    `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11M8 10.5l4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>`,
};

// ───────────── DOM refs ─────────────
const $header = document.getElementById('header');
const $panel  = document.getElementById('panel');
const $stage  = document.getElementById('stage');
const $body   = document.getElementById('appBody');
const $exportOverlay = document.getElementById('exportOverlay');
const $exportCode    = document.getElementById('exportCode');

// ═══════════════════════════════════════
// RENDER: Header
// ═══════════════════════════════════════
function renderHeader() {
  const collapseIcon = S.panelCollapsed
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`;
  const collapseTitle = S.panelCollapsed ? 'Show panel' : 'Hide panel';
  $header.innerHTML = `
    <button class="panel-collapse-btn${S.panelCollapsed?' collapsed':''}" id="panelCollapseBtn" title="${collapseTitle}">${collapseIcon}</button>
    <span class="topbar-title">Signature editor</span>
    <div class="scope-wrap">
      <select class="scope-select" id="scopeSelect">
        <option value="default">Brand default</option>
        <option value="sales">Sales</option>
        <option value="legal">Legal</option>
        <option value="engineering">Engineering</option>
        <option value="executive">Executive</option>
      </select>
      <span class="override-pill${S.scope!=='default'?' visible':''}" id="overridePill">override active</span>
    </div>
    <div class="header-spacer"></div>
    ${renderAccount()}
    <button class="btn" id="resetBtn" title="Clear saved settings and start from the defaults">Reset</button>
    <button class="btn" id="shareBtn" title="Make a link to this signature that anyone can open">Share</button>
    <button class="btn" id="copyBtn">Copy signature</button>
    <span class="copy-feedback" id="copyFeedback"></span>
    <button class="btn btn-accent" id="exportBtn">Export HTML</button>
  `;
  document.getElementById('scopeSelect').value = S.scope;
}

// Account control in the top bar. Renders nothing at all when the cloud layer
// is absent, so the editor looks unchanged if config.js is missing.
function renderAccount() {
  if (!window.Cloud || !Cloud.isReady) return '';
  const c = Cloud.state();
  if (!c.signedIn) {
    return `<button class="btn" id="signInBtn">Sign in</button>`;
  }
  // What the account is on, in the words that matter to the person: a live
  // plan by name, a trial by how long is left, or nothing once both are gone.
  let badge;
  if (c.plan && c.plan !== 'free') {
    badge = `<span class="account-plan">${esc(c.plan)}</span>`;
  } else if (c.trialActive) {
    const d = c.trialDaysLeft;
    badge = `<span class="account-plan is-trial" title="Your trial ends ${esc(new Date(c.trialEndsAt).toLocaleDateString())}">trial · ${d} day${d === 1 ? '' : 's'}</span>`;
  } else {
    badge = `<a class="account-plan is-ended" href="pricing.html">trial ended</a>`;
  }
  return `<span class="account-chip" title="${esc(c.email)}">
      <span class="account-dot"></span>${esc(c.email.split('@')[0])}
      ${badge}
    </span>
    <button class="btn" id="signOutBtn">Sign out</button>`;
}

// ═══════════════════════════════════════
// RENDER: Rail + settings sheet
// ═══════════════════════════════════════
// Dark icon rail — one entry per section, grouped by category.
// Cloud may be absent entirely (offline, or no config), so this has to answer
// false rather than throw.
function isAdmin() {
  return !!(window.Cloud && Cloud.isReady && Cloud.state().isAdmin);
}

// ───────────── Images as a paid feature ─────────────
// Photographs and uploaded logos render only while a subscription is active.
// Without one the layouts fall back to what they already do when no image has
// been chosen — a generated monogram for the company, initials for the person
// — so a free signature is complete rather than visibly broken.
//
// Be clear about what this is: the signature is assembled in the visitor's own
// browser and copied to their clipboard, so this gate is a product boundary,
// not a security one. Anyone determined can read the markup and put the image
// back. The enforcement that actually holds is in the database — the storage
// policy in schema.sql refuses uploads from a free plan, so a free user cannot
// get a hosted URL, and an un-hosted image is stripped by Gmail and Outlook
// before a recipient ever sees it.
//
// window.SIGNVEL_SHOW_IMAGES overrides the answer. The marketing pages and the
// showcase generator set it true, because they are advertising what a paid
// signature looks like. Nothing in the editor's own interface sets it.
function imagesUnlocked() {
  if (typeof window.SIGNVEL_SHOW_IMAGES === 'boolean') return window.SIGNVEL_SHOW_IMAGES;
  // No cloud configured at all means no billing exists to gate against — a
  // local checkout or a self-hosted copy stays fully usable.
  if (!(window.Cloud && Cloud.isReady)) return true;
  const c = Cloud.state();
  // A live plan or an unexpired trial. Both, not one — a new account gets
  // thirty days of the paid features before anything has been bought.
  return !!(c.signedIn && c.entitled);
}

function renderRail() {
  let html = `<a class="rail-brand" href="index.html" title="Back to signvel.com home">${icons.logo}</a>
    <nav class="rail-nav">`;
  let lastCat = '';
  sections.forEach((sec, i) => {
    // Skipping rather than filtering keeps `i` equal to the real index in
    // `sections`, which is what data-goto and renderSectionContent both use.
    if (sec.adminOnly && !isAdmin()) return;
    // A gap where the category used to be named. The word still appears, as
    // the eyebrow above the section's own title — saying it twice put two
    // pieces of chrome in the rail for every one thing you can click.
    if (sec.cat !== lastCat) {
      if (lastCat) html += `<div class="rail-gap"></div>`;
      lastCat = sec.cat;
    }
    const lockKey = sectionLocks[sec.id];
    const locked = lockKey && S.rolloutLocks[lockKey] === 'locked';
    html += `<button class="rail-item${S.openSection===i?' active':''}" data-goto="${i}" title="${esc(sec.title)}">
        <span class="rail-ico">${railIcons[sec.id]||''}</span>
        <span class="rail-label">${sec.short}</span>
        ${locked?`<span class="rail-lock">${icons.lock}</span>`:''}
      </button>`;
  });
  html += `</nav><div class="rail-foot"><span class="rail-avatar">FS</span></div>`;
  document.getElementById('rail').innerHTML = html;
}

// Settings column — the active section only, with a titled header.
function renderPanel() {
  renderRail(); // keeps the active highlight and lock badges in step
  let i = Math.max(0, Math.min(S.openSection, sections.length - 1));
  // A saved openSection can point at the Admin section on a browser that is no
  // longer signed in as an admin — its rail button is gone, so land somewhere
  // reachable rather than on a panel with no way out.
  if (sections[i].adminOnly && !isAdmin()) { i = 0; S.openSection = 0; }
  const sec = sections[i];
  const lockKey = sectionLocks[sec.id];
  const locked = lockKey && S.rolloutLocks[lockKey] === 'locked';
  $panel.innerHTML = `
    <div class="sheet">
      <p class="sheet-eyebrow">${sec.cat}</p>
      <h1 class="sheet-title">${sec.title}</h1>
      <div class="sheet-body${locked?' locked':''}">
        ${locked?`<div class="sheet-locked-tag">${icons.lock} Locked</div>`:''}
        ${renderSectionContent(i)}
      </div>
    </div>`;
  scheduleAllSaves();
}

function renderSectionContent(i) {
  switch(i) {
    case 0: return renderTemplates();
    case 1: return renderDesign();
    case 2: return renderMedia();
    case 3: return renderContacts();
    case 4: return renderSocial();
    case 5: return renderBanner();
    case 6: return renderDisclaimer();
    case 7: return renderRollout();
    case 8: return renderAdmin();
    default: return '';
  }
}

// ── Section 0: Templates & layout ──
// Each card is a miniature of the layout drawn in its own theme colour, so the
// grid reads as a set of designs rather than seventeen grey wireframes.
function tmplPreviews() {
  const A = id => themeOf(id).accent;
  const B = id => themeOf(id).accent2;
  const bar = (w, h, c, mb) => `<div style="width:${w}px;height:${h}px;background:${c||'var(--tmpl-ink)'};border-radius:1px;${mb?`margin-bottom:${mb}px`:''}"></div>`;
  const dot = (s, c) => `<div style="width:${s}px;height:${s}px;border-radius:50%;background:${c};flex-shrink:0"></div>`;
  const rows = (n, w, c) => Array.from({length:n}, (_, i) => bar(w - i % 2 * 4, 2, c, 2)).join('');
  return {
    corporate: `<div style="width:40px">${bar(26,3,0,2)}${bar(18,2,0,3)}<div style="height:2px;background:${A('corporate')};margin-bottom:3px"></div><div style="display:flex;gap:3px"><div style="width:9px;height:9px;background:var(--tmpl-ink);border-radius:1px"></div><div>${rows(3,22)}</div></div></div>`,
    spotlight: `<div style="width:42px"><div style="display:flex;gap:4px;align-items:center;margin-bottom:4px">${dot(14,'var(--tmpl-ink)')}<div style="width:1px;height:14px;background:var(--border)"></div><div>${bar(18,3,0,2)}${bar(12,2,A('spotlight'))}</div></div><div style="height:12px;background:${B('spotlight')};border-radius:3px"></div></div>`,
    split: `<div style="display:flex;gap:4px;align-items:center">${dot(12,A('split'))}<div>${bar(15,3,0,2)}${bar(10,2,A('split'))}</div><div style="width:1px;height:16px;background:var(--border)"></div><div>${rows(4,14)}</div></div>`,
    directory: `<div style="display:flex;gap:5px;align-items:center"><div>${bar(17,3,A('directory'),2)}${bar(11,2,0,4)}${bar(20,4,A('directory'))}</div><div style="width:1px;height:18px;background:var(--border)"></div><div>${rows(3,14)}<div style="display:flex;gap:2px;margin-top:2px">${dot(5,A('directory'))}${dot(5,A('directory'))}${dot(5,A('directory'))}</div></div></div>`,
    accentbar: `<div style="display:flex;gap:5px"><div style="width:3px;background:${A('accentbar')};border-radius:1px"></div><div>${bar(20,3,A('accentbar'),2)}${bar(15,2,0,3)}${rows(3,18)}<div style="display:flex;gap:2px;margin-top:2px">${dot(5,A('accentbar'))}${dot(5,'#E4A11B')}${dot(5,'#D1568B')}</div></div></div>`,
    colorblock: `<div style="display:flex;gap:5px;align-items:stretch"><div style="width:16px;height:26px;background:${A('colorblock')};border-radius:2px"></div><div style="padding-top:2px">${bar(22,3,0,3)}${bar(14,2,0,3)}<div style="display:flex;gap:4px">${rows(3,10)}<div>${rows(3,10)}</div></div></div></div>`,
    darkcard: `<div style="background:${B('darkcard')};border-radius:4px;padding:5px;display:flex;gap:4px;align-items:center;width:44px">${dot(13,'#4A5B7E')}<div>${bar(10,2,A('darkcard'),2)}${bar(19,3,'#fff',2)}<div style="display:flex;gap:3px">${bar(8,2,'#7C89A8')}${bar(8,2,'#7C89A8')}</div></div></div>`,
    connect: `<div style="width:46px"><div style="display:flex;gap:4px;align-items:center;margin-bottom:3px">${dot(14,'var(--tmpl-ink)')}<div>${bar(16,3,0,2)}${rows(2,14)}</div><div style="margin-left:auto">${dot(6,A('connect'))}</div></div><div style="height:7px;background:${A('connect')};border-radius:2px"></div></div>`,
    ribbon: `<div style="display:flex;gap:4px;align-items:center"><div style="width:16px;height:16px;border-radius:50%;border:2px solid ${A('ribbon')};background:var(--tmpl-ink);box-sizing:border-box"></div><div>${bar(20,3,A('ribbon'),2)}${bar(12,3,B('ribbon'),2)}${rows(2,18)}</div><div style="background:${A('ribbon')};border-radius:9px;padding:2px 3px;display:flex;gap:2px">${dot(4,'#fff')}${dot(4,'#fff')}</div></div>`,
    brandmark: `<div style="display:flex;gap:5px"><div>${dot(11,A('brandmark'))}${bar(13,3,A('brandmark'),0)}</div><div>${bar(18,3,0,2)}${bar(12,2,0,3)}${rows(3,20)}</div></div>`,
    inline: `<div style="width:46px"><div style="display:flex;gap:4px;align-items:center;margin-bottom:3px">${dot(11,A('inline'))}<div>${bar(16,3,0,2)}${bar(11,2)}</div></div><div style="display:flex;gap:3px;margin-bottom:3px">${bar(12,2,A('inline'))}${bar(12,2,A('inline'))}${bar(12,2,A('inline'))}</div><div style="height:1px;background:var(--border);margin-bottom:3px"></div>${bar(20,2)}</div>`,
    labelled: `<div style="display:flex;gap:5px;align-items:center">${dot(18,A('labelled'))}<div>${bar(18,3,A('labelled'),3)}<div style="display:flex;gap:3px">${rows(3,8,A('labelled'))}<div>${rows(3,14)}</div></div></div></div>`,
    band: `<div style="width:46px"><div style="display:flex;margin-bottom:3px">${bar(12,4,A('band'))}<div style="margin-left:auto;display:flex;gap:2px">${dot(5,A('band'))}${dot(5,A('band'))}</div></div><div style="height:10px;background:${A('band')};border-radius:2px;margin-bottom:3px"></div><div style="display:flex;gap:4px">${rows(3,14)}<div style="margin-left:auto">${dot(12,'var(--tmpl-ink)')}</div></div></div>`,
    editorial: `<div style="background:${themeOf('editorial').panel};border-radius:3px;padding:5px;width:44px;display:flex;gap:4px"><div><div style="font:700 7px Georgia,serif;color:${A('editorial')};letter-spacing:.5px;margin-bottom:2px">Aa</div><div style="height:1px;background:${A('editorial')};margin-bottom:3px"></div>${rows(2,16,'#8E97AD')}</div><div style="width:12px;height:22px;background:#7F8CA6;border-radius:2px;flex-shrink:0"></div></div>`,
    grid: `<div style="background:${themeOf('grid').panel};border-radius:3px;padding:5px;width:44px"><div style="display:flex;gap:4px;align-items:center">${bar(20,4,'#fff',0)}<div style="margin-left:auto">${dot(12,'#2A3B33')}</div></div><div style="height:1px;background:${A('grid')};margin:4px 0"></div><div style="display:flex;gap:4px">${rows(2,10,'#5F6E67')}<div>${rows(2,10,'#5F6E67')}</div></div></div>`,
    feature: `<div style="background:${themeOf('feature').panel};border-radius:3px;padding:5px;width:44px;display:flex;gap:4px;align-items:center"><div style="width:15px;height:15px;border-radius:50%;border:2px solid #fff;background:#5B9BEA;box-sizing:border-box;flex-shrink:0"></div><div>${bar(18,4,'#fff',2)}${bar(10,3,A('feature'),2)}<div style="display:flex;gap:3px">${bar(7,2,'#A9CCF4')}${bar(7,2,'#A9CCF4')}</div></div></div>`,
    minimal: `<div>${bar(34,3,0,3)}${bar(24,2)}</div>`,
    stacked: `<div style="width:26px">${dot(13,'var(--tmpl-ink)')}<div style="height:3px"></div>${bar(20,3,0,2)}${bar(13,2,0,3)}<div style="height:1px;background:var(--border);margin-bottom:3px"></div>${rows(3,22)}<div style="height:2px;background:${A('stacked')};margin:3px 0"></div><div style="display:flex;gap:2px">${dot(5,A('stacked'))}${dot(5,A('stacked'))}${dot(5,A('stacked'))}</div></div>`,
    profile: `<div style="display:flex;gap:5px"><div style="flex-shrink:0">${dot(13,'var(--tmpl-ink)')}<div style="height:3px"></div><div style="width:13px;height:7px;background:var(--tmpl-ink);opacity:.45;border-radius:1px"></div></div><div style="flex:1">${bar(18,3,0,2)}${bar(12,2,0,3)}<div style="height:2px;background:${A('profile')};margin-bottom:3px"></div>${rows(3,24)}<div style="height:2px;background:${A('profile')};margin:3px 0"></div><div style="display:flex;gap:2px">${dot(5,A('profile'))}${dot(5,A('profile'))}${dot(5,A('profile'))}</div></div></div>`,
    letterhead: `<div style="width:44px">${dot(12,'var(--tmpl-ink)')}<div style="height:3px"></div>${bar(20,3,0,2)}${bar(13,2,0,3)}<div style="height:2px;background:${A('letterhead')};margin-bottom:3px"></div><div style="display:flex;gap:4px;align-items:center"><div style="width:11px;height:6px;background:var(--tmpl-ink);opacity:.45;border-radius:1px;flex-shrink:0"></div><div style="flex:1">${rows(3,26)}</div></div><div style="height:2px;background:${A('letterhead')};margin:3px 0"></div><div style="display:flex;gap:2px">${dot(5,A('letterhead'))}${dot(5,A('letterhead'))}${dot(5,A('letterhead'))}</div></div>`,
    masthead: `<div style="width:44px">${dot(12,'var(--tmpl-ink)')}<div style="height:2px"></div><div style="height:2px;background:${A('masthead')};margin-bottom:3px"></div><div style="display:flex;gap:5px"><div style="flex-shrink:0">${bar(15,3,0,2)}${bar(10,2)}</div><div style="flex:1">${rows(3,20)}</div></div><div style="height:2px;background:${A('masthead')};margin:3px 0"></div><div style="display:flex;gap:2px">${dot(5,A('masthead'))}${dot(5,A('masthead'))}${dot(5,A('masthead'))}</div></div>`,
    bulletin: `<div style="width:44px">${dot(12,'var(--tmpl-ink)')}<div style="height:3px"></div>${bar(19,3,0,2)}${bar(12,2,0,3)}<div style="width:14px;height:7px;background:var(--tmpl-ink);opacity:.45;border-radius:1px;margin-bottom:3px"></div><div style="height:2px;background:${A('bulletin')};margin-bottom:3px"></div>${rows(3,34)}<div style="height:2px;background:${A('bulletin')};margin:3px 0"></div><div style="display:flex;gap:2px">${dot(5,A('bulletin'))}${dot(5,A('bulletin'))}${dot(5,A('bulletin'))}</div></div>`,
    aside: `<div style="display:flex;gap:5px;align-items:stretch"><div style="flex-shrink:0">${dot(12,'var(--tmpl-ink)')}<div style="height:3px"></div><div style="width:12px;height:7px;background:var(--tmpl-ink);opacity:.45;border-radius:1px"></div></div><div style="width:2px;background:${A('aside')};border-radius:1px;flex-shrink:0"></div><div style="flex:1">${bar(16,3,0,2)}${bar(11,2,0,3)}${rows(3,22)}<div style="display:flex;gap:2px;margin-top:3px">${dot(5,A('aside'))}${dot(5,A('aside'))}${dot(5,A('aside'))}</div></div></div>`,
    triptych: `<div style="width:46px"><div style="display:flex;gap:4px"><div style="flex-shrink:0">${dot(11,'var(--tmpl-ink)')}<div style="height:2px"></div><div style="width:11px;height:6px;background:var(--tmpl-ink);opacity:.45;border-radius:1px"></div></div><div style="flex:1">${bar(13,3,0,2)}${bar(9,2)}</div><div style="flex:1">${rows(3,15)}</div></div><div style="height:2px;background:${A('triptych')};margin:3px 0"></div><div style="display:flex;gap:3px;align-items:center"><div style="width:12px;height:6px;background:var(--tmpl-ink);opacity:.45;border-radius:1px"></div><div style="display:flex;gap:2px;margin-left:auto">${dot(5,A('triptych'))}${dot(5,A('triptych'))}${dot(5,A('triptych'))}</div></div></div>`,
  };
}

function renderTemplates() {
  const P = tmplPreviews();
  const labels = {
    corporate:'Corporate', spotlight:'Spotlight', split:'Split', directory:'Directory',
    accentbar:'Accent bar', colorblock:'Colour block', darkcard:'Dark card', connect:'Connect bar',
    ribbon:'Ribbon', brandmark:'Brandmark', inline:'Inline', labelled:'Labelled',
    band:'Banner band', editorial:'Editorial', grid:'Grid', feature:'Feature', minimal:'Minimal',
    stacked:'Stacked', profile:'Profile', letterhead:'Letterhead', masthead:'Masthead', bulletin:'Bulletin', aside:'Aside', triptych:'Triptych',
  };
  const order = ['corporate','spotlight','stacked','profile','letterhead','masthead','bulletin','aside','triptych','split','directory','accentbar','colorblock','darkcard',
                 'connect','ribbon','brandmark','inline','labelled','band','editorial','grid','feature','minimal'];

  let h = `<div class="field-row"><label class="field-label">Template</label><div class="template-grid">`;
  order.forEach(id => {
    h += `<div class="template-card${S.template===id?' active':''}" data-tmpl="${id}"><div class="tmpl-preview">${P[id]||''}</div><div class="tmpl-label">${labels[id]}</div></div>`;
  });
  h += `</div></div>`;

  h += `<div class="opt-list">
    <div class="opt-row">
      <span class="opt-label">Match template design<span class="opt-hint">Loads each layout's colours, icon style and name treatment when you switch. Every one stays editable afterwards.</span></span>
      <span class="opt-control"><div class="toggle-switch${S.matchTemplateTheme?' on':''}" data-action="toggleMatchTheme"></div></span>
    </div>
  </div>`;
  h += `<div class="add-chips"><button class="chip accent" data-action="applyTheme">Reset to this template's design</button></div>`;

  h += `<div class="field-row"><label class="field-label">Alignment</label><div class="toggle-group" data-action="alignment">
    <button class="${S.alignment==='left'?'active':''}" data-val="left">Left</button>
    <button class="${S.alignment==='center'?'active':''}" data-val="center">Centre</button>
    <button class="${S.alignment==='right'?'active':''}" data-val="right">Right</button>
  </div></div>`;

  h += `<div class="field-row"><label class="field-label">Maximum width</label><div class="slider-row"><input type="range" min="0" max="720" step="20" value="${S.panelWidth}" data-bind="panelWidth"><span class="slider-val">${S.panelWidth ? S.panelWidth + 'px' : 'Auto'}</span></div></div>`;

  return h;
}


// Loads a layout's palette into the live state. Corporate is the one layout
// that keeps its own colours whatever else happens — it is the brand signature,
// not a design in the gallery.
function applyTemplateTheme(id) {
  const t = templateThemes[id];
  if (!t) return;
  setAccent(t.accent);
  S.accent2Color = t.accent2;
  S.headingFont = t.heading || '';
  if (t.social) S.socialStyle = t.social;
  if (t.icons) S.contactIconMode = t.icons;
  if (t.cols) S.contactColumns = t.cols;
  if (t.role) S.roleStyle = t.role;
  if (t.shape) S.headshotShape = t.shape;
  S.nameUppercase = !!t.caps;
  S.nameTracking = t.track || 0;
  S.photoRing = t.ring || 0;
  // A layout drawn on a dark ground needs the panel on to look like itself.
  // One drawn on white turns it back off — but only if the panel colour is one
  // a theme set, so a colour the user chose themselves is never thrown away.
  if (t.panel) {
    S.bgEnabled = true;
    S.bgColor = t.panel;
    if (!S.bgPadding) S.bgPadding = 28;
    if (!S.bgRadius) S.bgRadius = 14;
  } else if (S.bgEnabled && Object.keys(templateThemes).some(k => templateThemes[k].panel === S.bgColor)) {
    S.bgEnabled = false;
  }
}

// Changing the theme colour drags the icon colours along, but only while they
// still match it — once either has been set deliberately, it stays put.
function setAccent(next) {
  const prev = S.accentColor;
  if (S.iconColor === prev) S.iconColor = next;
  if (S.socialIconColor === prev) S.socialIconColor = next;
  S.accentColor = next;
}

// Sliders do not all measure pixels. Two of them mean "follow the template"
// at zero, and showing "0px" there reads as a broken control.
function sliderLabel(bind, v) {
  if (bind === 'nameTracking') return (v / 100).toFixed(2) + 'em';
  if (bind === 'nameScale' || bind.includes('Zoom')) return v + '%';
  if (bind === 'panelWidth' || bind === 'headshotSize') return v ? v + 'px' : 'Auto';
  return v + 'px';
}

// A labelled row with a free colour picker on the right, matching the compact
// "label left, control right" rows in the reference design.
// ───────────── Colour picker ─────────────
// The native <input type="color"> opened the operating system's colour dialog:
// a different window on Windows, Mac and Linux, none of them shaped like this
// product, and on Windows a modal that covers the signature you are choosing
// the colour for. This is the picker drawn in the panel instead, so the
// preview stays visible the whole time a colour is being chosen.
//
// Which row is open lives here rather than in S: it is a state of the
// interface, not of the signature, and it must never be saved or synced.
const PICKER = {key: null};

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return {r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255};
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Hue 0-360, saturation and value 0-100 — the axes the picker is drawn on.
function hexToHsv(hex) {
  const rgb = hexToRgb(hex) || {r: 0, g: 0, b: 0};
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return {h, s: max ? (d / max) * 100 : 0, v: max * 100};
}

function hsvToHex(h, s, v) {
  const S1 = s / 100, V = v / 100;
  const c = V * S1, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = V - c;
  const seg = Math.floor(((h % 360) + 360) % 360 / 60);
  const rgb = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][seg];
  return rgbToHex((rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255);
}

// ── Compact rows ──
// A control per line, showing only its current value until it is asked for.
// The panel had every slider, button group and menu open at once, which made
// thirty controls compete for attention with the one being looked for; a
// colour row already worked this way and was the quietest thing on the page.
//
// Which row is open lives here rather than in S, for the same reason PICKER
// does: it is a state of the interface, not of the signature, and it must
// never be saved or synced.
const OPENROW = {key: null};

// The control itself is always rendered, and hidden with CSS rather than left
// out. Anything driving the panel — the checks, a keyboard, an assistive
// technology walking the tree — still finds it where it expects to.
function optRow(key, label, value, control, hint) {
  const open = OPENROW.key === key;
  return `<div class="opt-row is-openable${open ? ' open' : ''}" data-action="toggleRow" data-row="${esc(key)}"
      role="button" tabindex="0" aria-expanded="${open}">
      <span class="opt-label">${label}</span>
      <span class="opt-control"><span class="row-value">${value}</span>${icons.chevron}</span>
    </div>
    <div class="row-body${open ? '' : ' is-shut'}">
      ${hint ? `<span class="field-hint">${hint}</span>` : ''}${control}
    </div>`;
}

// Several rows are a group of buttons whose selected one is the value shown.
// An option may carry a `swatch`: a miniature of what it actually produces,
// shown in place of its name. The name then becomes the button's accessible
// name and its tooltip, so nothing is lost by not printing it.
function pickRow(key, label, action, options, current, hint) {
  const chosen = options.find(o => String(o.val) === String(current));
  const swatched = options.some(o => o.swatch);
  // Where the options are drawn, the closed row shows the drawing too: the
  // name was only ever a stand-in for the thing it could not show.
  const value = chosen ? (chosen.swatch || chosen.label) : '';
  const buttons = options.map(o => {
    const on = String(o.val) === String(current);
    // A drawn option is marked by a tick and nothing else, so the chosen one
    // has to say so itself — there is no fill or frame left to infer it from.
    return `<button class="${on ? 'active' : ''}" data-val="${esc(String(o.val))}"${
      o.swatch ? ` title="${esc(o.label)}" aria-label="${esc(o.label)}" aria-pressed="${on}"` : ''
    }>${o.swatch || o.label}</button>`;
  }).join('');
  return optRow(key, label, value,
    `<div class="toggle-group${swatched ? ' is-swatches' : ''}" data-action="${action}">${buttons}</div>`, hint);
}

// ── Treatment miniatures ──
// A name for a treatment only means something to somebody who already knows
// what the treatment looks like. These draw it instead, at the size the row
// allows, from the same rules the signature is built with — a ring, a solid
// disc, a boxed word, a bare word — so the choice is made by eye.
//
// Three of the five social treatments set the platform's name rather than its
// glyph, which is the thing worth seeing: "in" stands in for the label there,
// short enough to sit in a 5-across row.
function swatchSocial(style) {
  const c = S.socialIconColor || S.accentColor;
  const glyph = (socialIcons.linkedin || '')
    .replace(/width="16"/, 'width="12"').replace(/height="16"/, 'height="12"');
  if (style === 'circle')  return `<span class="sw-ring" style="border-color:${c};color:${c}">${glyph}</span>`;
  if (style === 'filled')  return `<span class="sw-ring" style="background:${c};border-color:${c};color:#fff">${glyph}</span>`;
  if (style === 'chip')    return `<span class="sw-box" style="background:${c};border-color:${c};color:#fff">in</span>`;
  if (style === 'outline') return `<span class="sw-box" style="border-color:${c};color:${c}">in</span>`;
  return `<span class="sw-bare" style="color:${c}">in</span>`;
}

function swatchContactIcon(mode) {
  const c = S.iconColor || S.accentColor;
  // Thicker than the icon it stands for. These glyphs are drawn on a 24 grid
  // with a 2px stroke, which lands under a pixel once the miniature scales it
  // down — thin enough that the envelope closed up into a blob and the whole
  // swatch read as a grey dot, worst of all as white on a filled disc.
  const glyph = (contactIcons.email || '')
    .replace(/width="14"/, 'width="12"').replace(/height="14"/, 'height="12"')
    .replace(/stroke-width="2"/, 'stroke-width="2.6"');
  if (mode === 'circle')  return `<span class="sw-ring" style="border-color:${c};color:${c}">${glyph}</span>`;
  if (mode === 'filled')  return `<span class="sw-ring" style="background:${c};border-color:${c};color:#fff">${glyph}</span>`;
  if (mode === 'icons')   return `<span class="sw-bare" style="color:${c}">${glyph}</span>`;
  if (mode === 'letters') return `<span class="sw-bare" style="color:${c};font-weight:700">E.</span>`;
  return `<span class="sw-bare" style="color:${c};font-weight:600">Email</span>`;
}

// And several are a slider, whose value is already the label.
function sliderRow(key, label, bind, min, max, step, hint) {
  const control = `<div class="slider-row"><input type="range" min="${min}" max="${max}"${step ? ` step="${step}"` : ''} value="${S[bind]}" data-bind="${bind}"><span class="slider-val">${sliderLabel(bind, S[bind])}</span></div>`;
  return optRow(key, label, sliderLabel(bind, S[bind]), control, hint);
}

function colorRow(label, key) {
  const val = String(S[key] || '#000000').toUpperCase();
  const open = PICKER.key === key;
  let h = `<div class="opt-row">
    <span class="opt-label">${label}</span>
    <span class="opt-control">
      <span class="color-hex">${esc(val)}</span>
      <button type="button" class="color-swatch${open ? ' open' : ''}" style="background:${esc(val)}"
        data-action="togglePicker" data-key="${esc(key)}" aria-expanded="${open}" title="${esc(label)}"></button>
    </span>
  </div>`;
  if (open) h += pickerPanel(key, val);
  return h;
}

// The saturation/value square is two gradients over the pure hue — white
// across, black down — which is the same construction every picker uses and
// needs no canvas to draw or read back.
function pickerPanel(key, val) {
  const hsv = hexToHsv(val);
  return `<div class="picker" data-picker="${esc(key)}">
    <div class="picker-top">
      <input class="picker-hex" type="text" value="${esc(val)}" maxlength="7" spellcheck="false"
        autocomplete="off" aria-label="Hex colour" data-action="pickerHex" data-key="${esc(key)}">
      <span class="picker-tag">HEX</span>
    </div>
    <div class="picker-sv" data-action="pickerSV" data-key="${esc(key)}"
      style="background-color:${hsvToHex(hsv.h, 100, 100)}">
      <span class="picker-sv-white"></span>
      <span class="picker-sv-black"></span>
      <span class="picker-dot" style="left:${hsv.s}%;top:${100 - hsv.v}%;background:${esc(val)}"></span>
    </div>
    <input type="range" class="picker-hue" min="0" max="360" value="${Math.round(hsv.h)}"
      aria-label="Hue" data-action="pickerHue" data-key="${esc(key)}">
  </div>`;
}

// Applies a colour the same way the rest of the panel does, so the accent
// keeps its side effects rather than being written past them.
function applyColor(key, hex) {
  if (key === 'accentColor') setAccent(hex);
  else S[key] = hex;
  renderStage();
}

// Live update without a re-render: rebuilding the panel on every pointermove
// would drop the pointer out of the element being dragged, and re-rendering a
// text field under a cursor loses the caret.
function paintPicker(key, hex) {
  const wrap = document.querySelector(`.picker[data-picker="${key}"]`);
  const row = wrap && wrap.previousElementSibling;
  if (row) {
    const hexLabel = row.querySelector('.color-hex');
    const swatch = row.querySelector('.color-swatch');
    if (hexLabel) hexLabel.textContent = hex;
    if (swatch) swatch.style.background = hex;
  }
  if (!wrap) return;
  const hsv = hexToHsv(hex);
  const sv = wrap.querySelector('.picker-sv');
  const dot = wrap.querySelector('.picker-dot');
  const field = wrap.querySelector('.picker-hex');
  if (sv) sv.style.backgroundColor = hsvToHex(hsv.h, 100, 100);
  if (dot) { dot.style.left = hsv.s + '%'; dot.style.top = (100 - hsv.v) + '%'; dot.style.background = hex; }
  if (field && document.activeElement !== field) field.value = hex;
}

// ── Shared image uploader (drop zone + preview) ──
// `kind` is 'logo' or 'headshot'; state lives at S[kind+'Url'] / S[kind+'Name'].
const UPLOAD_ACCEPT = 'image/png,image/jpeg,image/gif,image/svg+xml,image/webp';

function renderUploader(kind, hint) {
  const action = kind + 'Upload';
  const url = S[kind + 'Url'];
  const input = `<input type="file" accept="${UPLOAD_ACCEPT}" data-action="${action}" hidden>`;
  // What ships in the slot needs no name. "Sample logo" printed under the
  // sample logo says only what the picture already says, and reads as a label
  // on something you might have chosen — nobody needs telling that dropping a
  // file replaces it. A name someone uploaded is worth showing: it is the one
  // way to tell which of two similar marks is actually in there.
  const sample = kind === 'logo' ? DEFAULT_LOGO_URL : DEFAULT_HEADSHOT_URL;
  const named = url !== sample ? esc(S[kind + 'Name'] || 'Image loaded') : '';
  let h;
  // One box, and it says one thing whether the slot is full or empty: drop a
  // file here. It holds no picture of what is in the slot — the signature
  // beside it is already showing that, at the size it will actually be sent,
  // and a thumbnail was a second, smaller, worse copy of the same answer.
  //
  // What the slot holds is said in words underneath, next to Remove, which
  // sits outside the label: a click anywhere inside a label reaches its file
  // input, so Remove in there would open the file dialog on its way out.
  const zone = `<label class="uploader" data-drop="${action}">
    ${input}
    <span class="uploader-icon">${icons.upload}</span>
    <span class="uploader-text">Drag and drop an image here to upload, or <u>select a file</u></span>
    <span class="uploader-hint">${hint}</span>
  </label>`;

  if (url) {
    h = `<div class="uploader-wrap">
      ${zone}
      <div class="uploader-foot">
        <span class="uploader-name">${named || 'Image in place'}</span>
        <button class="btn uploader-action" data-action="remove${kind.charAt(0).toUpperCase()+kind.slice(1)}">Remove</button>
      </div>
    </div>`;
  } else {
    h = zone;
  }
  // Only the bad news. A hosted image is the expected case and does not need
  // announcing — every upload is hosted now. A local copy is the one that
  // arrives broken, so that is the only state that says anything.
  if (url && !/^https?:\/\//i.test(url)) {
    h += `<div class="asset-state is-local">Local copy only. Gmail and Outlook strip embedded images, so recipients will see it broken. ${window.Cloud && Cloud.isReady && !Cloud.state().signedIn ? 'Sign in to host it.' : 'Paste a hosted URL below.'}</div>`;
  }
  if (S.uploadError) h += `<div class="uploader-error">${esc(S.uploadError)}</div>`;
  if (S.storageError) h += `<div class="uploader-error">${esc(S.storageError)}</div>`;

  // A way back to the sample. Without this, removing an image leaves an empty
  // slot with nothing to undo it: the sample is only a default, so it applies
  // to an account that has never chosen, and never again after that. Anyone
  // who cleared a logo in an earlier version was stuck with a blank space and
  // no control that said otherwise.
  if (url !== sample) {
    h += `<div class="add-chips"><button class="chip accent" data-action="useSample" data-kind="${kind}">
      Use the sample ${kind === 'logo' ? 'logo' : 'portrait'}</button></div>`;
  }
  // No paste-a-URL field. Upload is the only way in, which is the point: an
  // uploaded file goes to the gated bucket and comes back as a cdn.signvel.com
  // address that stops being served when a plan lapses. A pasted URL is
  // somebody else's server, outside all of that, and breaks when they move it.
  return h;
}

// ── Section 1: Design ──
// Every visual control in one place: type, colour, icon treatment, rules and
// spacing. The content sections keep only the values that go in the signature.
function renderDesign() {
  const accents = ['#C9962B','#1F5E4E','#2B4C7E','#8B4513','#6B4E71','#5B2EFF'];
  let h = '';

  // Each option is set in its own face, so the list is a specimen sheet rather
  // than fourteen names in the panel's font. Grouped by kind, because the
  // choice being made is really how formal the signature should read.
  const fontOptions = (selected, blank) => {
    let o = blank ? `<option value=""${selected === '' ? ' selected' : ''}>${blank}</option>` : '';
    FONT_CHOICES.forEach(g => {
      o += `<optgroup label="${esc(g.group)}">`;
      g.items.forEach(f => {
        o += `<option value="${esc(f.name)}" style="font-family:${esc(f.stack)}"${selected === f.name ? ' selected' : ''}>${esc(f.name)}</option>`;
      });
      o += `</optgroup>`;
    });
    return o;
  };

  h += `<div class="opt-group">Type</div>`;
  h += `<div class="opt-list">
    ${optRow('font', 'Font family', esc(S.font),
      `<select class="input" data-bind="font">${fontOptions(S.font)}</select>`,
      'All of these are already on the reader’s machine — mail clients will not fetch a font.')}
    ${optRow('headingFont', 'Display font', S.headingFont ? esc(S.headingFont) : 'Same as body',
      `<select class="input" data-bind="headingFont">${fontOptions(S.headingFont, 'Same as body')}</select>`,
      'Used for the name. Falls back to the body font.')}
    ${sliderRow('bodySize', 'Font size', 'bodySize', 11, 18)}
    ${pickRow('fontWeight', 'Weight', 'fontWeight', [
      {val:'regular', label:'Regular'}, {val:'semibold', label:'Semibold'},
    ], S.fontWeight)}
  </div>`;

  h += `<div class="opt-group">Name &amp; role</div>`;
  h += `<div class="opt-list">
    ${sliderRow('nameScale', 'Name size', 'nameScale', 70, 200, 5)}
    ${sliderRow('nameTracking', 'Letter spacing', 'nameTracking', -3, 24)}
    <div class="opt-row">
      <span class="opt-label">Name in capitals</span>
      <span class="opt-control"><div class="toggle-switch${S.nameUppercase?' on':''}" data-action="toggleNameCaps"></div></span>
    </div>
    ${pickRow('roleStyle', 'Role style', 'roleStyle', [
      {val:'plain', label:'Plain'}, {val:'caps', label:'Tracked'},
      {val:'chip', label:'Chip'}, {val:'pill', label:'Pill'},
    ], S.roleStyle, 'Minimal sets the role inline in one line, so it stays plain there.')}
  </div>`;

  h += `<div class="opt-group">Colour</div>`;
  let presetSwatches = '';
  accents.forEach(c => { presetSwatches += `<div class="swatch${S.accentColor===c?' active':''}" style="background:${c}" data-color="${c}" data-action="accentColor"></div>`; });
  h += `<div class="opt-list">
    ${optRow('accentPresets', 'Theme presets', accents.indexOf(S.accentColor) !== -1 ? 'In use' : 'Custom',
      `<div class="swatch-row">${presetSwatches}</div>`)}
    ${colorRow('Theme colour', 'accentColor')}
    ${colorRow('Second colour', 'accent2Color')}
    ${colorRow('Name colour', 'nameColor')}
    ${colorRow('Title colour', 'titleColor')}
    ${colorRow('Text colour', 'textColor')}
    ${colorRow('Icon colour', 'iconColor')}
    ${colorRow('Social icon colour', 'socialIconColor')}
  </div>`;

  h += `<div class="opt-group">Background</div>`;
  h += `<div class="opt-list"><div class="opt-row">
    <span class="opt-label">Background panel</span>
    <span class="opt-control"><div class="toggle-switch${S.bgEnabled?' on':''}" data-action="toggleBg"></div></span>
  </div></div>`;
  if (S.bgEnabled) {
    const bgPresets = ['#14121F','#1B2A4A','#0F3D33','#B3221E','#5B2EFF','#F5F4FB'];
    let bgSwatches = '';
    bgPresets.forEach(c => { bgSwatches += `<div class="swatch${S.bgColor===c?' active':''}" style="background:${c}" data-color="${c}" data-action="bgColorPreset"></div>`; });
    h += `<div class="opt-list">
      ${optRow('bgPresets', 'Panel presets', bgPresets.indexOf(S.bgColor) !== -1 ? 'In use' : 'Custom',
        `<div class="swatch-row">${bgSwatches}</div>`)}
      ${colorRow('Panel colour', 'bgColor')}
      ${sliderRow('bgPadding', 'Panel padding', 'bgPadding', 0, 48)}
      ${sliderRow('bgRadius', 'Corner radius', 'bgRadius', 0, 28)}
    </div>`;
    if (isDarkColor(S.bgColor)) h += `<div class="inline-note">Dark panel detected — text is switched to a light colour automatically. Your saved text colours return if you turn the panel off.</div>`;
    h += `<div class="inline-note">Solid panel colours survive in email. Background <em>images</em> do not — Gmail and Outlook strip them.</div>`;
  }

  const iconModes = ['circle','filled','icons','letters','labels'].map(m => ({
    val: m,
    label: {circle:'Circles', filled:'Filled', icons:'Plain', letters:'Letters', labels:'Labels'}[m],
    swatch: swatchContactIcon(m),
  }));
  h += `<div class="opt-group">Contact details</div>`;
  h += `<div class="opt-list">
    ${pickRow('contactColumns', 'Columns', 'contactColumns', [
      {val:1, label:'One'}, {val:2, label:'Two'},
    ], S.contactColumns)}
    <div class="opt-row">
      <span class="opt-label">Show icons</span>
      <span class="opt-control"><div class="toggle-switch${S.showContactIcons?' on':''}" data-action="toggleContactIcons"></div></span>
    </div>
    ${S.showContactIcons ? pickRow('contactIconMode', 'Icon type', 'contactIconMode', iconModes, S.contactIconMode) : ''}
    ${S.showContactIcons && S.contactIconMode !== 'labels' && S.contactIconMode !== 'letters'
      ? sliderRow('contactIconSize', 'Icon size', 'contactIconSize', 14, 34) : ''}
  </div>`;

  // The two that carry a glyph lead, because they are what a signature with
  // social icons usually wants; the three that set the platform's name follow.
  let socialChips = '';
  ['circle','filled','chip','plain','outline'].forEach(s => {
    const name = s.charAt(0).toUpperCase() + s.slice(1);
    const on = S.socialStyle === s;
    socialChips += `<button class="chip is-swatch${on?' active':''}" data-action="socialStyle" data-val="${s}" title="${name}" aria-label="${name}" aria-pressed="${on}">${swatchSocial(s)}</button>`;
  });
  h += `<div class="opt-group">Social icons</div>`;
  h += `<div class="opt-list">
    ${optRow('socialStyle', 'Icon type', swatchSocial(S.socialStyle),
      `<div class="chip-row">${socialChips}</div>`)}
    ${sliderRow('socialIconSize', 'Icon size', 'socialIconSize', 14, 40)}
  </div>`;

  h += `<div class="opt-group">Lines &amp; spacing</div>`;
  h += `<div class="opt-list">
    <div class="opt-row">
      <span class="opt-label">Show dividing lines</span>
      <span class="opt-control"><div class="toggle-switch${S.dividerEnabled?' on':''}" data-action="toggleDivider"></div></span>
    </div>
    ${S.dividerEnabled ? sliderRow('dividerWidth', 'Line width', 'dividerWidth', 1, 6) : ''}
    ${sliderRow('blockSpacing', 'Block spacing', 'blockSpacing', 2, 20)}
  </div>`;
  return h;
}

// ── Section 2: Logo & headshot ──
// Which layouts actually read each image. Kept beside the templates rather than
// inside the panel, because the signature builder needs the same answer.
// Which layouts have a slot for each image, so the Media panel can say when a
// setting will not show anywhere. Both lists have to match the layouts
// themselves: 'card' was in here long after that template was retired, and
// 'feature' draws a logo but was missing, so the panel told anyone on it that
// there was no logo slot while the layout was rendering one.
const LOGO_TEMPLATES = ['corporate','split','directory','accentbar','colorblock','connect','ribbon','brandmark','inline','band','feature','stacked','profile','letterhead','masthead','bulletin','aside','triptych'];
const PHOTO_TEMPLATES = ['spotlight','darkcard','connect','ribbon','labelled','band','editorial','grid','feature','stacked','profile','letterhead','masthead','bulletin','aside','triptych'];

// The ones that give the portrait a row of its own, with nothing beside it.
const PHOTO_ON_ITS_OWN_ROW = ['stacked', 'letterhead', 'masthead', 'bulletin'];

// So these are the ones that set it beside the text. "Photo position" aligns
// the picture against the block next to it, so it only means anything here —
// on the layouts above there is nothing to align it against.
const PHOTO_BESIDE_TEXT = PHOTO_TEMPLATES.filter(t => !PHOTO_ON_ITS_OWN_ROW.includes(t));

function renderMedia() {
  let h = '';

  // Without this the preview looks broken rather than gated: you pick a photo,
  // nothing changes, and there is no way to tell why.
  if (!imagesUnlocked()) {
    h += `<div class="inline-note is-locked">
      <strong>Your trial has ended.</strong>
      Photographs and uploaded logos appear in your signature while a trial or a plan is running. For now the layouts use a generated mark and your initials, and everything you set here is saved and waiting.
      <a class="note-link" href="pricing.html">See plans &rarr;</a>
    </div>`;
  }

  h += `<div class="opt-group">Logo</div>`;
  h += `<div class="field-row">${renderUploader('logo', 'PNG or SVG with a transparent background works best. Max 1&nbsp;MB.')}</div>`;
  // Named for what it does rather than for the mechanism: in the layouts that
  // stack the logo with text in one cell there is nothing to align it against,
  // and the hint is what stops that reading as a broken control.
  h += `<div class="field-row"><label class="field-label">Logo position<span class="field-hint">Where a layout sets the logo beside the text.</span></label><div class="toggle-group" data-action="logoAlign"><button class="${S.logoAlign==='top'?'active':''}" data-val="top">Top</button><button class="${S.logoAlign==='middle'?'active':''}" data-val="middle">Middle</button><button class="${S.logoAlign==='bottom'?'active':''}" data-val="bottom">Bottom</button></div></div>`;
  h += `<div class="field-row"><label class="field-label">Logo height</label><div class="slider-row"><input type="range" min="20" max="72" value="${S.logoHeight}" data-bind="logoHeight"><span class="slider-val">${S.logoHeight}px</span></div></div>`;

  h += `<div class="opt-group">Headshot</div>`;
  h += `<div class="field-row">${renderUploader('headshot', 'A square image crops best. Max 1&nbsp;MB.')}</div>`;
  // No picker of stock faces here, on purpose — it invited people to ship a
  // stranger's photograph as their own. There is one default portrait, and the
  // uploader above is how anyone replaces it.

  h += `<div class="field-row"><label class="field-label">Shape</label><div class="toggle-group" data-action="headshotShape"><button class="${S.headshotShape==='circle'?'active':''}" data-val="circle">Circle</button><button class="${S.headshotShape==='rounded'?'active':''}" data-val="rounded">Rounded</button><button class="${S.headshotShape==='square'?'active':''}" data-val="square">Square</button></div></div>`;
  // Shown on every layout, like the rest of the photo settings: they are saved
  // whether or not the current one draws a portrait, and apply the moment a
  // layout that does is picked.
  h += `<div class="field-row"><label class="field-label">Photo position<span class="field-hint">Against the text beside it.</span></label><div class="toggle-group" data-action="photoAlign"><button class="${S.photoAlign==='top'?'active':''}" data-val="top">Top</button><button class="${S.photoAlign==='middle'?'active':''}" data-val="middle">Middle</button><button class="${S.photoAlign==='bottom'?'active':''}" data-val="bottom">Bottom</button></div></div>`;
  h += `<div class="field-row"><label class="field-label">Photo size<span class="field-hint">Auto follows the template.</span></label><div class="slider-row"><input type="range" min="0" max="140" step="4" value="${S.headshotSize}" data-bind="headshotSize"><span class="slider-val">${S.headshotSize ? S.headshotSize + 'px' : 'Auto'}</span></div></div>`;
  h += `<div class="field-row"><label class="field-label">Ring width</label><div class="slider-row"><input type="range" min="0" max="10" value="${S.photoRing}" data-bind="photoRing"><span class="slider-val">${S.photoRing}px</span></div></div>`;
  if (S.photoRing) h += `<div class="opt-list">${colorRow('Ring colour', 'photoRingColor')}</div>`;
  h += `<div class="field-row"><label class="field-label">Crop / zoom</label><div class="slider-row"><input type="range" min="100" max="200" value="${S.headshotZoom}" data-bind="headshotZoom"><span class="slider-val">${S.headshotZoom}%</span></div></div>`;
  return h;
}

// ── Section 3: Contact fields ──
function renderContacts() {
  // Values and ordering only — how these rows look lives in Design.
  let h = `<div class="opt-group">Who you are</div>`;
  h += `<div class="field-row"><label class="field-label">Full name</label><input class="input" value="${esc(S.name)}" data-bind="name" placeholder="Your name"></div>`;
  h += `<div class="field-row"><label class="field-label">Job title</label><input class="input" value="${esc(S.title)}" data-bind="title" placeholder="Your role"></div>`;
  h += `<div class="field-row"><label class="field-label">Company</label><input class="input" value="${esc(S.company)}" data-bind="company" placeholder="Your company"></div>`;
  h += `<div class="field-row"><label class="field-label">Tagline</label><input class="input" value="${esc(S.tagline)}" data-bind="tagline" placeholder="Optional strapline, shown in italics"></div>`;

  // Say plainly that these are not real details yet, and what the one exception
  // is — otherwise picking Corporate and seeing different details on it looks
  // like a bug rather than the point.
  if (identityIsStock()) {
    // A saved state carrying the old Al Riyady details is the one that needs
    // a word: the fields say one thing and every preview says another.
    h += matchesIdentity(CORPORATE_IDENTITY)
      ? `<div class="inline-note" id="stockNote">These are the Al&nbsp;Riyady details from an earlier version. Every layout previews on Sign Vel branding instead, so the gallery reads as a set of designs rather than the same signature seventeen times. Type over any field above and yours are used on all of them.</div>`
      : `<div class="inline-note" id="stockNote">Every layout previews on Sign Vel branding with a stand-in name, so the gallery reads as a set of designs rather than as one person's signature. Type over any field above and your own details are used on all seventeen.</div>`;
  }

  h += `<div class="opt-group">Contact details</div>`;
  S.contactFields.forEach((f, i) => {
    h += `<div class="list-item${f.enabled?'':' disabled'}">
      <div class="toggle-switch list-check${f.enabled?' on':''}" data-action="toggleContact" data-idx="${i}"></div>
      <span class="list-label">${f.label}</span>
      <div class="list-input"><input class="input" value="${esc(f.value)}" data-action="editContact" data-idx="${i}" placeholder="${f.label}"></div>
      <button class="list-btn" data-action="moveContactUp" data-idx="${i}" title="Move up">${icons.arrowUp}</button>
      <button class="list-btn" data-action="moveContactDown" data-idx="${i}" title="Move down">${icons.arrowDown}</button>
      ${f.removable?`<button class="list-btn" data-action="removeContact" data-idx="${i}" title="Remove">${icons.trash}</button>`:''}
    </div>`;
  });
  // Add-back chips
  const addable = ['phone','office','pronouns','booking'];
  const existing = S.contactFields.map(f=>f.type);
  const chips = addable.filter(a => !existing.includes(a));
  if (chips.length) {
    h += `<div class="add-chips">`;
    chips.forEach(c => { h += `<button class="chip accent" data-action="addContact" data-type="${c}">+ ${c.charAt(0).toUpperCase()+c.slice(1)}</button>`; });
    h += `</div>`;
  }
  return h;
}

// ── Section 5: Social icons ──
function renderSocial() {
  // Handles and ordering only — icon style, size and colour live in Design.
  let h = '';
  S.socialLinks.forEach((sl, i) => {
    h += `<div class="list-item${sl.enabled?'':' disabled'}">
      <div class="toggle-switch list-check${sl.enabled?' on':''}" data-action="toggleSocial" data-idx="${i}"></div>
      <span class="list-label">${sl.label}</span>
      <div class="list-input"><input class="input" value="${esc(sl.handle)}" data-action="editSocial" data-idx="${i}" placeholder="handle"></div>
      <button class="list-btn" data-action="moveSocialUp" data-idx="${i}" title="Move up">${icons.arrowUp}</button>
      <button class="list-btn" data-action="moveSocialDown" data-idx="${i}" title="Move down">${icons.arrowDown}</button>
    </div>`;
  });
  return h;
}

// ── Section 6: Banner & CTA ──
function renderBanner() {
  let h = `<div class="field-row"><div class="toggle-row"><label class="field-label">Show banner</label><div class="toggle-switch${S.bannerEnabled?' on':''}" data-action="toggleBanner"></div></div></div>`;
  if (S.bannerEnabled) {
    h += `<div class="field-row"><label class="field-label">Banner message</label><input class="input" value="${esc(S.bannerMessage)}" data-bind="bannerMessage"></div>`;
    h += `<div class="field-row"><label class="field-label">Banner subtext</label><input class="input" value="${esc(S.bannerSubtext)}" data-bind="bannerSubtext" placeholder="Optional second line"></div>`;
    if (!imagesUnlocked()) h += `<div class="inline-note is-locked">A campaign image needs a trial or a plan. The message, subtext and button below work either way.</div>`;
    h += `<div class="field-row"><label class="field-label">Banner image URL</label><input class="input" type="url" value="${esc(S.bannerImage)}" data-bind="bannerImage" placeholder="https://example.com/campaign.png"></div>`;
    h += `<div class="field-row"><label class="field-label">Sample banners<span class="field-hint">Hosted images, safe to send.</span></label><div class="sample-row is-wide">`;
    sampleBanners.forEach(b => {
      h += `<button class="sample-thumb is-wide${S.bannerImage===b.url?' active':''}" data-action="sampleBanner" data-url="${esc(b.url)}" title="${esc(b.label)}"><img src="${esc(b.url)}" alt="${esc(b.label)}" loading="lazy"></button>`;
    });
    if (S.bannerImage) h += `<button class="sample-thumb is-clear" data-action="sampleBanner" data-url="" title="No image">None</button>`;
    h += `</div></div>`;
    if (S.bannerImage) h += `<div class="field-row"><label class="field-label">Image width</label><div class="slider-row"><input type="range" min="80" max="520" step="10" value="${S.bannerWidth}" data-bind="bannerWidth"><span class="slider-val">${S.bannerWidth}px</span></div></div>`;
    if (S.bannerImage) h += `<div class="inline-note">An image replaces the text banner. Host it publicly — an uploaded copy will be stripped in transit.</div>`;
    h += `<div class="field-row"><label class="field-label">Button label</label><input class="input" value="${esc(S.ctaLabel)}" data-bind="ctaLabel"></div>`;
    h += `<div class="field-row"><label class="field-label">Button URL</label><input class="input" value="${esc(S.ctaUrl)}" data-bind="ctaUrl"></div>`;
    h += `<div class="field-row"><label class="field-label">Button style</label><div class="toggle-group" data-action="ctaStyle"><button class="${S.ctaStyle==='solid'?'active':''}" data-val="solid">Solid</button><button class="${S.ctaStyle==='outline'?'active':''}" data-val="outline">Outline</button><button class="${S.ctaStyle==='pill'?'active':''}" data-val="pill">Pill</button></div></div>`;
  }
  return h;
}

// ── Section 7: Disclaimer ──
function renderDisclaimer() {
  let h = `<div class="field-row"><div class="toggle-row"><label class="field-label">Show disclaimer</label><div class="toggle-switch${S.disclaimerEnabled?' on':''}" data-action="toggleDisclaimer"></div></div></div>`;
  if (S.disclaimerEnabled) {
    h += `<div class="field-row"><label class="field-label">Preset</label><div class="chip-row">`;
    ['standard','short','regulated'].forEach(p => {
      h += `<button class="chip${S.disclaimerPreset===p?' active':''}" data-action="disclaimerPreset" data-val="${p}">${p.charAt(0).toUpperCase()+p.slice(1)}</button>`;
    });
    h += `</div></div>`;
    h += `<div class="field-row"><label class="field-label">Text</label><textarea class="input" data-bind="disclaimerText" rows="4">${esc(S.disclaimerText)}</textarea><div class="char-count">${S.disclaimerText.length} chars</div></div>`;
  }
  return h;
}

// ── Section 8: Admin ──
// The panel itself is a page of its own at /admin, not a section here. It
// outgrew this column: a 392px strip beside the canvas cannot hold an account
// table, and the figures and the grants it carries are not part of building a
// signature. What is left is the door.
function renderAdmin() {
  if (!isAdmin()) {
    return `<div class="inline-note">This section is only available to an administrator.</div>`;
  }
  return `<div class="inline-note">Accounts, figures, complimentary access and the state of billing
    live in the admin panel, which has room for them.</div>
    <div class="add-chips"><a class="chip accent" href="admin.html">Open the admin panel</a></div>
    <div class="inline-note">Everything there is read and written by the <strong>admin-stats</strong>
    function, which checks <strong>is_admin</strong> again server-side on every request.</div>`;
}

// ── Section 7: Rollout & install ──
function renderRollout() {
  const items = [{key:'typography',label:'Design'},{key:'disclaimer',label:'Disclaimer'},{key:'banner',label:'Banner'},{key:'contactFields',label:'Contact fields'}];
  let h = `<div class="field-row"><label class="field-label">Section permissions</label>`;
  items.forEach(it => {
    const v = S.rolloutLocks[it.key];
    h += `<div class="rollout-row"><span>${it.label}</span><div class="rollout-pills">
      <button class="rollout-pill${v==='locked'?' active-locked':''}" data-action="rolloutLock" data-key="${it.key}" data-val="locked">Locked</button>
      <button class="rollout-pill${v==='editable'?' active-editable':''}" data-action="rolloutLock" data-key="${it.key}" data-val="editable">Editable</button>
    </div></div>`;
  });
  h += `</div>`;
  h += `<div class="field-row mt-8"><label class="field-label">Install target</label><div class="client-grid">`;
  installTargets.forEach(t => {
    h += `<button class="client-tile${S.installTarget===t.id?' active':''}" data-action="installTarget" data-val="${t.id}" title="${esc(t.label)}">
      <span class="client-logo">${mailLogos[t.logo]||''}</span>
      <span class="client-name">${esc(t.label)}</span>
      <span class="client-time">${esc(t.time)}</span>
    </button>`;
  });
  h += `</div></div>`;

  const target = installTargets.find(t => t.id === S.installTarget) || installTargets[0];
  h += `<div class="install-hint">
    <div class="install-hint-head">${mailLogos[target.logo]||''}<strong>${esc(target.label)}</strong><span class="install-use">${esc(target.use)}</span></div>
    <ol>${target.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <p class="install-note">${esc(target.note)}</p>
  </div>`;
  return h;
}

// ═══════════════════════════════════════
// RENDER: Stage (toolbar + email mock)
// ═══════════════════════════════════════
function renderStage() {
  const clients = previewClients;
  // A tab saved before the list changed no longer exists, which would leave
  // none of them marked and the target silently Standard.
  if (!clients.some(c => c.id === S.client)) S.client = 'gmail';
  // Two deliberate rows rather than one row left to wrap: the clients on top,
  // and everything that changes how the signature is drawn underneath. Where
  // the wrap fell otherwise depended on the window, and the target picker
  // landed in a different place on every screen.
  const current = clients.find(c => c.id === S.client) || clients[0];
  let h = `<div class="stage-toolbar">
    <div class="stage-toolbar-row">
    <button class="btn btn-accent" id="installBtn">Install signature</button>
    <span class="stage-client"><span class="stage-client-logo">${mailLogos[current.logo || current.id] || ''}</span>${esc(current.label)}</span>
  <div class="toggle-group" id="deviceTabs">
    <button class="${S.device==='desktop'?'active':''}" data-device="desktop">Desktop</button>
    <button class="${S.device==='mobile'?'active':''}" data-device="mobile">Mobile</button>
  </div>
  </div>
  <div class="stage-toolbar-row">
    <div class="toggle-row gap-6"><label class="field-label" style="margin:0;font-size:11px">Dark</label><div class="toggle-switch${S.darkMode?' on':''}" data-action="toggleDark"></div></div>
    <span class="stage-target-note">${esc((EXPORT_TARGETS.find(t => t.id === currentTarget()) || EXPORT_TARGETS[0]).note)}</span>
  </div>
  </div>`;

  // The preview is drawn for the chosen target, so this control shows its own
  // effect: pick Classic and the badges go, which is what the paste will do.
  // Framed as that client frames it: its reading width, its default face, and
  // a header saying whose window this is meant to be.
  const ch = CHROME[current.chrome] || CHROME.gmail;
  const mockStyle = S.device === 'mobile'
    ? `font-family:${ch.font};`
    : `max-width:${ch.width}px;font-family:${ch.font};${S.darkMode ? '' : `background:${ch.bg};`}`;
  h += `<div class="preview-wrapper"><div class="email-mock${S.darkMode?' dark':''}${S.device==='mobile'?' mobile-view':''}" style="${mockStyle}">
    ${windowChrome(current)}
    <div class="email-mock-body">
      <div class="signature-container">${withExportTarget(currentTarget(), generateSignaturePreview)}</div>
    </div>
  </div></div>`;

  $stage.innerHTML = h;
  // Only the Outlook variants need files, and each needs a different set —
  // glyphs for New Outlook, whole badges for classic — so nothing is drawn or
  // uploaded until one of those tabs is in use. It redraws when a set arrives.
  if (currentTarget()) syncIconAssets(currentTarget());
  scheduleAllSaves();
}

// ═══════════════════════════════════════
// Signature Preview HTML (table-based)
// ═══════════════════════════════════════
// Relative luminance, so a dark background can flip the text to light without
// the user having to notice and fix it themselves.
// A solid colour some way between two others. Used for quiet text on a
// coloured panel: rgba() would say the same thing more directly, but Word
// does not parse it, so classic Outlook would drop the colour and fall back
// to something of its own choosing on a dark ground.
function mixHex(from, to, amount) {
  const parse = (h) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '').trim());
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const a = parse(from), b = parse(to);
  if (!a || !b) return to;
  const mix = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return '#' + mix.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function isDarkColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 0.4;
}

// Wraps whatever the template produced in a background panel. Solid colours are
// safe in email — it is background *images* that get stripped — so this is done
// with bgcolor plus an inline background-color for the clients that ignore one.
function generateSignaturePreview() {
  const body = buildSignatureBody();
  if (!S.bgEnabled) return body;
  const pad = S.bgPadding;
  const radius = S.bgRadius ? `border-radius:${S.bgRadius}px;` : '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tbody><tr>
    <td bgcolor="${S.bgColor}" style="background-color:${S.bgColor};padding:${pad}px;${radius}">${body}</td>
  </tr></tbody></table>`;
}

// Built from nested tables rather than SVG, so the demo mark renders in Outlook
// too — the icon sets elsewhere in this file do not.
//
// `stack` puts the wordmark under the mark instead of beside it, which is what
// the logo-in-a-column layouts were drawn with. `mono` drops the wordmark
// entirely, for the layouts where the company name is already set in type.
function generatedLogoHTML(ff, opts) {
  const o = opts || {};
  const colour = o.colour || themeOf(S.template).accent;
  const words = String(o.company || S.company || 'Company').trim().split(/\s+/).filter(Boolean);
  const initials = words.map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CO';
  const box = Math.max(28, o.size || S.logoHeight);
  const mark = Math.round(box * 0.42);
  const word = esc(words.slice(0, 2).join(' ') || 'Company');
  const tile = `<td width="${box}" height="${box}"${o.hollow ? '' : ` bgcolor="${colour}"`} style="width:${box}px;height:${box}px;${o.hollow ? `border:2px solid ${colour};box-sizing:border-box;color:${colour};` : `background-color:${colour};color:#ffffff;`}border-radius:${o.round ? '50%' : Math.round(box * 0.24) + 'px'};text-align:center;vertical-align:middle;font-family:${ff};font-size:${mark}px;font-weight:700;letter-spacing:.02em;line-height:${box - (o.hollow ? 4 : 0)}px;">${esc(initials)}</td>`;
  const wordStyle = `font-family:${ff};font-size:${Math.round(box * (o.stack ? 0.30 : 0.34))}px;font-weight:800;letter-spacing:${o.stack ? '.06em' : '-.01em'};color:${colour};white-space:nowrap;`;

  if (o.mono) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate;border-spacing:0;"><tr>${tile}</tr></table>`;
  }
  if (o.stack) {
    // The tile has to live in a table of its own: sharing a column with the
    // wider wordmark below makes the cell inherit that width and the square
    // stretches into a slab.
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;">
      <tr><td style="text-align:center;padding:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate;border-spacing:0;"><tr>${tile}</tr></table></td></tr>
      <tr><td style="padding-top:7px;text-align:center;${wordStyle}">${word}</td></tr></table>`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tr>
    ${tile}
    <td style="padding-left:10px;vertical-align:middle;${wordStyle}">${word}</td>
  </tr></table>`;
}

// ───────────── Type ─────────────
// The fonts on offer, and the only fonts worth offering: a signature is read
// in a mail client, and no mail client will fetch a webfont for it. Gmail
// strips @font-face outright and Outlook draws with Word, which uses what is
// installed on the reader's machine and nothing else. So every name here is a
// face that ships with Windows, macOS, or Microsoft Office — the three places
// corporate mail is actually read — and each carries a stack that degrades to
// something close rather than to Times.
//
// Grouped because the choice is really "how formal", and a list of fourteen
// names in one column does not say that.
const FONT_CHOICES = [
  {group: 'Sans-serif', items: [
    // The two safest things in email, and the defaults of Gmail and Outlook.
    {name: 'Arial',          stack: "Arial, Helvetica, sans-serif"},
    {name: 'Helvetica Neue', stack: "'Helvetica Neue', Helvetica, Arial, sans-serif"},
    // Office's own faces. Calibri has been the Word and Outlook default since
    // 2007, so a signature set in it matches the message it sits under.
    {name: 'Calibri',        stack: "Calibri, 'Segoe UI', Candara, Optima, sans-serif"},
    {name: 'Segoe UI',       stack: "'Segoe UI', Tahoma, 'Helvetica Neue', Arial, sans-serif"},
    {name: 'Tahoma',         stack: "Tahoma, Verdana, Geneva, sans-serif"},
    {name: 'Trebuchet MS',   stack: "'Trebuchet MS', 'Lucida Grande', Helvetica, sans-serif"},
    // Drawn wide for screens, which is why it survives small sizes.
    {name: 'Verdana',        stack: "Verdana, Geneva, sans-serif"},
  ]},
  {group: 'Serif', items: [
    {name: 'Georgia',          stack: "Georgia, 'Times New Roman', serif"},
    {name: 'Times New Roman',  stack: "'Times New Roman', Times, serif"},
    {name: 'Cambria',          stack: "Cambria, Georgia, 'Times New Roman', serif"},
    {name: 'Garamond',         stack: "Garamond, 'Palatino Linotype', Palatino, 'Times New Roman', serif"},
    // Palatino on a Mac, Palatino Linotype on Windows, Book Antiqua where
    // Office installed that instead — the same design under three names.
    {name: 'Palatino',         stack: "Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif"},
  ]},
  {group: 'Monospace', items: [
    {name: 'Courier New', stack: "'Courier New', Courier, monospace"},
    {name: 'Consolas',    stack: "Consolas, 'Lucida Console', Monaco, monospace"},
  ]},
];

// Flattened for lookup. Built once rather than searched each render.
const FONT_STACKS = (function () {
  const map = {};
  FONT_CHOICES.forEach(g => g.items.forEach(f => { map[f.name] = f.stack; }));
  return map;
})();

// Resolves a shipped font name to a full stack. See FONT_CHOICES for why the
// list is what it is; anything unrecognised — a name from an older build, or
// one that has since been dropped — lands on the default rather than on
// whatever the mail client feels like.
function fontStack(name) {
  const found = FONT_STACKS[name];
  return found || FONT_STACKS['Helvetica Neue'];
}

function buildSignatureBody() {
  const ff = fontStack(S.font);
  // The display face. Falls back to the body font, which is what makes
  // "Same as body" a real choice rather than a no-op.
  const hf = S.headingFont ? fontStack(S.headingFont) : ff;
  const fw = S.fontWeight === 'semibold' ? '600' : '400';
  const fs = S.bodySize + 'px';
  // On a dark panel the saved text colours would be unreadable, so they are
  // lifted to light values for the duration of the build. The user's own
  // settings are untouched — switch the background off and they return.
  const onDark = S.bgEnabled && isDarkColor(S.bgColor);
  const tc = onDark ? '#F2F1F7' : S.textColor;
  const ac = S.accentColor;
  const a2 = S.accent2Color || '#141220';
  const sp = S.blockSpacing + 'px';
  const al = S.alignment;
  const bs = parseInt(fs);
  // Layouts with a full-width band, a ruled grid or a panel need a width to
  // stretch to, or the table shrink-wraps its content and the design collapses.
  // A width set in the panel always wins.
  const templateWidth = {band:600, connect:600, spotlight:560, editorial:620, grid:620, accentbar:560,
                         feature:620, colorblock:600, darkcard:600, labelled:560, inline:560,
                         // These four had no width at all, which is only
                         // invisible while the signature is short. Add a
                         // disclaimer and the table stretches to whatever it
                         // is pasted into, the browser hands the spare room to
                         // the column with the longest text, and the identity
                         // column is squeezed until the name wraps mid-name.
                         split:600, directory:600, brandmark:560, ribbon:600,
                         // Corporate draws its own table rather than going
                         // through outer(), and used to carry its own copy of
                         // this number. Listed here so one rule governs them all.
                         corporate:560,
                         // Narrow on purpose: this one stacks, so the width is
                         // what makes it a column rather than a wide block with
                         // the parts stranded at the top.
                         stacked:340,
                         profile:560,
                         letterhead:560,
                         masthead:560,
                         bulletin:560,
                         aside:560, triptych:620};
  // The background panel wraps the whole signature and adds its padding
  // outside it, so a 600px layout in a panel padded 24px is 648px wide — wider
  // than the layout was drawn for, wider than the preview column, and wider
  // than the roughly 600px most mail clients give a message before they start
  // cutting. Take the padding out of the layout instead of adding it on, so
  // turning the panel on changes the colour behind a signature and not its
  // size. Floored, so a heavy padding cannot squeeze the content to nothing.
  //
  // The floor is half the layout's own width rather than a fixed 320px. A flat
  // floor is above some layouts entirely — the stacked one is drawn at 340 —
  // so the subtraction hit the floor, stopped, and the panel's padding went
  // back to being added on top: switching the panel on made that layout wider
  // than it is without one, which is the exact thing this was written to stop.
  const baseW = S.panelWidth || templateWidth[S.template] || 0;
  const layoutW = baseW
    ? Math.max(Math.round(baseW / 2), baseW - (S.bgEnabled ? S.bgPadding * 2 : 0))
    : 0;
  const widthAttr = layoutW ? ` width="${layoutW}"` : '';
  const widthCss = layoutW ? `width:${layoutW}px;max-width:100%;` : '';

  // ── Identity ──
  // While nothing has been personalised, each layout previews with the identity
  // it is meant to carry: Corporate reproduces the real brand signature, and
  // every other layout shows sample details so the gallery reads as a set of
  // designs rather than one signature repeated. Type your own details anywhere
  // and both substitutions stop — from then on the layouts show you.
  //
  // Only the values are swapped. Which rows exist, their order and whether each
  // is switched on all still come from the panel, so no control is made inert
  // by the layout you happen to be on.
  // Every layout previews on the same sample identity now. Corporate used to
  // reproduce a real company's signature — name, contacts and logo — from the
  // days when this was that company's internal tool. With the sample logo
  // being this product's own, that layout was the one place the old branding
  // survived, and it is also the layout the editor opens on: the first thing
  // anybody saw was somebody else's company.
  //
  // Nothing is lost by dropping it. The substitution only ever applied while
  // the details were untouched, so anyone who types their own details sees
  // theirs on all seventeen layouts exactly as before.
  const who = identityIsStock() ? SAMPLE_IDENTITY : null;
  const pName = who ? who.name : S.name;
  const pTitle = who ? who.title : S.title;
  const pCompany = who ? who.company : S.company;
  const pFields = who
    ? S.contactFields.map(f => (f.type in who.contacts) ? Object.assign({}, f, {value: who.contacts[f.type]}) : f)
    : S.contactFields;
  const pSocials = who
    ? S.socialLinks.map(sl => (sl.handle && sl.type in who.socials) ? Object.assign({}, sl, {handle: who.socials[sl.type]}) : sl)
    : S.socialLinks;

  // ── Name treatment ──
  // Scale, tracking and capitals are shared by every layout, so a design choice
  // made once carries across the whole gallery rather than only the layout it
  // was made on.
  const nameText = S.nameUppercase ? pName.toUpperCase() : pName;
  const track = S.nameTracking ? `letter-spacing:${(S.nameTracking / 100).toFixed(2)}em;` : '';
  const nameAt = (base) => Math.max(11, Math.round(base * (S.nameScale / 100)));
  const nameColor = onDark ? '#FFFFFF' : (S.nameColor || tc);
  const nameStyleAt = (base, color) => `font-family:${hf};font-size:${nameAt(base)}px;font-weight:700;color:${color || nameColor};line-height:1.25;${track}margin:0;`;
  const nameStyle = nameStyleAt(bs + 2);
  const titleStyle = `font-family:${ff};font-size:${fs};font-weight:${fw};color:${onDark ? '#B9B6C9' : (S.titleColor || '#666')};line-height:1.3;margin:0;`;
  const fieldStyle = `font-family:${ff};font-size:${bs - 1}px;font-weight:${fw};color:${tc};line-height:1.6;margin:0;text-decoration:none;`;
  // Quiet text — the disclaimer, mostly. On a light ground a grey is right. On
  // a coloured one it cannot be a fixed grey: #8F8CA3 was picked against a
  // near-black panel and turns to mud on a saturated blue, which is what a
  // disclaimer set in it looked like. Mixed most of the way to white from
  // whatever the panel actually is, it stays quiet without going unreadable,
  // on any colour anybody picks.
  const mutedColor = onDark ? mixHex(S.bgColor, '#FFFFFF', 0.82) : '#999';
  const mutedStyle = `font-family:${ff};font-size:${bs - 2}px;color:${mutedColor};line-height:1.4;`;

  // ── Role treatment ──
  // Four ways to draw the job title. A chip or pill needs a table cell to hold
  // its background in Outlook, so it cannot just be a styled span.
  function roleHTML(opts) {
    const o = opts || {};
    const text = esc(o.text != null ? o.text : pTitle);
    if (!text) return '';
    const style = o.style || S.roleStyle;
    const size = o.size || bs;
    const fgPlain = o.color || (onDark ? '#B9B6C9' : (S.titleColor || '#666'));
    const mb = o.mb != null ? o.mb : 0;
    if (style === 'caps') {
      return `<p style="font-family:${ff};font-size:${Math.max(9, size - 2)}px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:${o.capsColor || ac};line-height:1.4;margin:0 0 ${mb}px;">${text}</p>`;
    }
    if (style === 'chip' || style === 'pill') {
      const bg = o.chipBg || a2;
      const radius = style === 'pill' ? '9999px' : '4px';
      // A chip is a table, and a table does not inherit the text-align of the
      // cell it sits in — it needs telling. `align` is how a layout that sets
      // its role against the right edge says so.
      const chipAlign = o.align || (al === 'center' ? 'center' : '');
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;margin:0 0 ${mb}px;"${chipAlign ? ` align="${chipAlign}"` : ''}><tr>
        <td bgcolor="${bg}" style="background-color:${bg};border-radius:${radius};padding:4px 12px;font-family:${ff};font-size:${Math.max(9, size - 3)}px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:${o.chipFg || '#FFFFFF'};line-height:1.3;white-space:nowrap;">${text}</td>
      </tr></table>`;
    }
    return `<p style="font-family:${ff};font-size:${size}px;font-weight:${fw};color:${fgPlain};line-height:1.35;margin:0 0 ${mb}px;">${text}</p>`;
  }

  // Photographs and uploaded logos are gated on an active subscription; see
  // imagesUnlocked. Resolved once here so every image path agrees.
  const showImages = imagesUnlocked();

  // ── Headshot ──
  // Photo-led layouts need a bigger portrait; 64px looks like an afterthought
  // when it is the main visual element. An explicit size overrides all of it.
  const photoDefaults = {darkcard:110, spotlight:96, feature:104, grid:96, band:104, editorial:140, ribbon:88, labelled:86, connect:78};
  const photoSize = S.headshotSize || photoDefaults[S.template] || 64;
  const borderRadius = S.headshotShape === 'circle' ? '50%' : S.headshotShape === 'rounded' ? '10px' : '0';

  // `ring` and `shape` let a layout override the shared photo settings where its
  // design depends on them — the blue feature panel is not itself without the
  // white ring, whatever shape the user last picked.
  function photoHTML(opts) {
    const o = opts || {};
    const box = o.size || photoSize;
    const radius = o.shape ? (o.shape === 'circle' ? '50%' : o.shape === 'rounded' ? '10px' : '0') : borderRadius;
    const ringW = o.ring != null ? o.ring : S.photoRing;
    const ringC = o.ringColor || S.photoRingColor;
    const ring = ringW ? `border:${ringW}px solid ${ringC};` : '';
    const inner = box - ringW * 2;
    let img;
    if (S.headshotUrl && showImages) {
      // Crop/zoom: the image is scaled past the frame and pulled back by half
      // the overflow, so it stays centred while the frame keeps its box.
      const scaled = Math.round(inner * (S.headshotZoom / 100));
      const offset = Math.round((scaled - inner) / 2);
      img = `<img src="${esc(S.headshotUrl)}" width="${scaled}" height="${scaled}" style="display:block;width:${scaled}px;height:${scaled}px;margin:-${offset}px 0 0 -${offset}px;object-fit:cover;object-position:center;" alt="${esc(pName)}">`;
    } else {
      const initials = pName.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
      img = `<div style="width:${inner}px;height:${inner}px;background:${o.fallback || ac};color:#fff;text-align:center;font-family:${ff};font-size:${Math.round(inner * 0.34)}px;font-weight:700;line-height:${inner}px;">${esc(initials)}</div>`;
    }
    // Filled with the ring's own colour, not left transparent. A rounded frame
    // antialiases the inner edge of its border, and every pixel that curve only
    // half-covers shows whatever lies behind the frame — on the dark card that
    // read as a black hairline inside the white ring, worst at three and nine
    // o'clock where the curve runs closest to straight. Painting the ring's
    // colour underneath means the half-covered pixels blend into the ring.
    const seam = ringW ? `background-color:${ringC};` : '';
    const framed = `<div style="width:${box}px;height:${box}px;border-radius:${radius};${ring}${seam}box-sizing:border-box;overflow:hidden;">${img}</div>`;

    // ── Classic Outlook ──
    // Outlook on Windows renders mail through Word, which ignores
    // border-radius outright: a round portrait arrives square, which is what
    // it has always done here. No amount of CSS changes that.
    //
    // VML does. It is Word's own vector language, it is what Outlook has drawn
    // shapes with since 2007, and a v:oval filled with the photograph is a
    // circle there. So the signature carries both: Outlook takes the VML and
    // ignores the div, every other client takes the div and never sees the
    // VML. One signature, not two — there is nothing to keep in step.
    //
    //   <!--[if mso]>      … only Outlook reads this
    //   <!--[if !mso]><!-->… everyone else reads this, Outlook skips it
    //
    // Only for a real photograph in a shaped frame. A square frame needs
    // nothing, and the initials fallback is already a plain box.
    const shape = o.shape || S.headshotShape;
    if (!(S.headshotUrl && showImages) || shape === 'square') return framed;

    const stroke = ringW
      ? ` strokecolor="${esc(ringC)}" strokeweight="${ringW}px"`
      : ' stroked="f"';
    // type="frame" scales the image to fill the shape, which is what the CSS
    // side does with object-fit: cover.
    const fill = `<v:fill type="frame" src="${esc(S.headshotUrl)}"/>`;
    const vmlBox = `style="width:${box}px;height:${box}px;"`;
    const vml = shape === 'circle'
      ? `<v:oval xmlns:v="urn:schemas-microsoft-com:vml" ${vmlBox}${stroke}>${fill}</v:oval>`
      // arcsize is a proportion of the shorter side, so 10px on a 78px box is
      // about 13% — the same corner the CSS draws.
      : `<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" ${vmlBox} arcsize="${Math.round((10 / box) * 100)}%"${stroke}>${fill}</v:roundrect>`;

    return `<!--[if mso]>${vml}<![endif]--><!--[if !mso]><!-->${framed}<!--<![endif]-->`;
  }
  const headshotHTML = photoHTML();

  // Where the portrait's cell sits against the text beside it. One value, used
  // by every layout that puts a photo next to something, so the control means
  // the same thing wherever you are. vertical-align on a table cell is the one
  // way to do this that Outlook honours — flexbox and margin:auto do not
  // survive the Word rendering engine.
  const pv = ['top', 'middle', 'bottom'].indexOf(S.photoAlign) === -1 ? 'middle' : S.photoAlign;
  // The same question for the logo, and the same answer. A logo beside a block
  // of five contact rows, a social row and a disclaimer sits alone at the top
  // of a tall signature unless something says otherwise.
  //
  // It only reaches the layouts where the logo has a cell to itself. Where a
  // layout stacks the logo with text in one cell — Directory, Ribbon, Colour
  // block — there is nothing for vertical-align to move it against, and the
  // control says so rather than pretending.
  const lv = ['top', 'middle', 'bottom'].indexOf(S.logoAlign) === -1 ? 'middle' : S.logoAlign;

  // ── Logo ──
  // Every layout with a logo slot shows one: the sample lockup until somebody
  // uploads their own, and theirs the moment they do. The generated mark is
  // now only what stands in when there is no logo at all — or when images are
  // switched off, since a logo is a file and a mark is table markup.
  //
  // The one exception is an identity that carries its own: Corporate
  // reproduces a real company's signature, so while the logo is still the
  // untouched sample it shows that company's mark instead.
  const logoSrc = S.logoUrl;
  const showRealLogo = showImages && !!logoSrc;

  function logoAs(opts) {
    if (!logoSrc) return '';
    if (showRealLogo) {
      const hh = (opts && opts.size) || S.logoHeight;
      // Logos are not all square. A wordmark at 58px tall is over 200px wide,
      // and dropped into a slot designed around a monogram it pushes the
      // column out and squeezes everything beside it — which is what happened
      // to Colour block the moment the sample stopped being a square mark.
      // The cap is per slot, and the fallback is wide enough that an ordinary
      // lockup is never touched by it.
      //
      // height="" is for Outlook, which ignores max-width and scales from the
      // attribute. Everything else takes the CSS, where height:auto lets the
      // width cap bind without squashing the mark out of proportion.
      const mw = (opts && opts.maxw) || 240;
      // A slot that asks for white is drawn on a dark panel or a colour block,
      // and the ink lockup vanishes into it. mono means that slot wants a mark
      // rather than a lockup.
      let src = logoSrc;
      if (src === DEFAULT_LOGO_URL && opts && opts.colour === '#FFFFFF') {
        src = opts.mono ? SAMPLE_MARK_WHITE_URL : SAMPLE_LOGO_WHITE_URL;
      }
      return `<img src="${esc(src)}" height="${hh}" style="display:block;height:auto;max-height:${hh}px;width:auto;max-width:${mw}px;" alt="${esc(pCompany)} logo">`;
    }
    // The generated mark is built from the company name, so it has to read the
    // same resolved identity the rest of the layout does.
    return generatedLogoHTML(ff, Object.assign({company: pCompany}, opts));
  }
  const logoHTML = logoAs();

  // Contact fields
  // Circle-wrapped icon: outlined ring with the glyph centred, built from nested
  // tables so Outlook keeps the cell dimensions (it drops border-radius, not size).
  // A cell's `height` is only a minimum, so any line-box strut (line-height,
  // font-size) makes it grow taller than its pinned width and the ring turns
  // oval. Zero both out and centre the glyph as a block instead.
  // `filled` swaps the open ring for a solid accent disc with a white glyph. The
  // glyphs all draw with currentColor, so setting the cell colour is enough.
  const ic = S.iconColor || ac;          // contact icon colour
  const sc = S.socialIconColor || ac;    // social icon colour
  // Divider rules. The old flat #DDDBE4 was invisible at 1px, and vanished
  // completely once a dark background panel was switched on.
  const ruleColor = onDark ? 'rgba(255,255,255,.22)' : '#C6C3D4';
  const circleIcon = (svg, filled, colour, letter, hosted, exactUrl) => {
    const cc = colour || ic;
    const sz = S.contactIconSize || 22;
    const inner = Math.round(sz * 0.5);
    const glyphColor = filled ? '#ffffff' : cc;
    const bg = filled ? `background-color:${cc};` : '';
    const bgAttr = filled ? ` bgcolor="${cc}"` : '';
    // A drawing needs the line box zeroed or the badge grows taller than it is
    // wide and the circle turns oval. A letter needs the opposite: the line box
    // is what centres it.
    const body = (hosted && exactUrl && !filled)
      ? {content: iconImgTag(exactUrl, inner, 'margin:0 auto;'), type: 'font-size:0;line-height:0;'}
      // Only a filled badge can take a hosted glyph without a coloured set:
      // white on the themed ground. An open one would need an ink glyph, and
      // that is the black-in-a-blue-ring fault, so it takes the letter instead.
      : (hosted && filled)
      ? {content: hostedIcon(hosted, 'white', inner, 'margin:0 auto;'),
         type: 'font-size:0;line-height:0;'}
      : letter
      ? {content: esc(letter),
         type: `color:${glyphColor};font-family:${ff};font-size:${Math.round(sz * 0.46)}px;font-weight:700;line-height:${sz - 3}px;`}
      : {content: svgToImgTag(svg, inner, inner, glyphColor, 'margin:0 auto;'),
         type: 'font-size:0;line-height:0;'};
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tr><td width="${sz}" height="${sz}"${bgAttr} style="box-sizing:border-box;width:${sz}px;min-width:${sz}px;max-width:${sz}px;height:${sz}px;padding:0;${bg}border:1.5px solid ${cc};border-radius:50%;text-align:center;vertical-align:middle;${body.type}">${body.content}</td></tr></table>`;
  };

  const activeContacts = pFields.filter(f => f.enabled && f.value);

  // One contact row broken into its two halves, so the same row can be laid out
  // down a single column or paired across two without duplicating the logic.
  // `opts` lets a layout override the colours its own ground demands.
  function contactParts(f, opts) {
    const o = opts || {};
    const valueColor = o.color || tc;
    const badgeColor = o.icon || ic;
    const vs = `font-family:${ff};font-size:${bs - 1}px;font-weight:${fw};color:${valueColor};line-height:1.6;margin:0;text-decoration:none;`;
    let val;
    if (f.type === 'email') val = `<a href="mailto:${esc(f.value)}" style="${vs}">${esc(f.value)}</a>`;
    else if (f.type === 'website') val = `<a href="https://${esc(f.value.replace(/^https?:\/\//, ''))}" style="${vs}color:${o.linkColor || ac};font-weight:600;">${esc(f.value)}</a>`;
    else if (f.type === 'mobile' || f.type === 'phone') val = `<a href="tel:${esc(f.value.replace(/\s/g, ''))}" style="${vs}">${esc(f.value)}</a>`;
    else val = `<span style="${vs}">${esc(f.value)}</span>`;

    const mode = o.mode || S.contactIconMode;
    if (!S.showContactIcons && !o.mode) return {lead: '', leadPad: '', val, valPad: '3px 0', align: 'middle'};

    if (mode === 'letters') {
      const lower = o.lowercase;
      const letter = (contactLetters[f.type] || '•');
      return {
        lead: `<span style="font-family:${ff};font-size:${bs - 1}px;font-weight:700;color:${badgeColor};line-height:1.6;">${esc(lower ? letter.toLowerCase() : letter)}.</span>`,
        leadPad: '3px 8px 3px 0', val, valPad: '3px 0', align: 'top',
      };
    }
    if (mode === 'labels') {
      return {
        lead: `<span style="${mutedStyle}color:${o.labelColor || badgeColor};font-weight:600;white-space:nowrap;">${esc(f.label)}:</span>`,
        leadPad: '3px 10px 3px 0', val, valPad: '3px 0', align: 'middle',
      };
    }
    const badged = mode === 'circle' || mode === 'filled';
    const letter = contactLetters[f.type] || '•';
    // Written for classic Outlook, the badge goes: Word squares it off, and a
    // row of squares looks like a fault rather than a choice. The letter alone
    // carries it, which is what the Letters treatment already does.
    if (EXPORT_TARGET === 'classic') {
      // The badge drawn into the picture, which is the only kind Word keeps.
      const sz = S.contactIconSize || 22;
      const baked = badged ? hostedBadgeFor(f.type, badgeColor, mode === 'filled', sz, badgeGround()) : '';
      if (baked) {
        return {lead: iconImgTag(baked, sz), leadPad: '3px 10px 3px 0', val, valPad: '3px 0', align: 'middle'};
      }
      // A bare glyph needs no badge, so the coloured drawing alone will do.
      const flat = !badged && mode !== 'letters' && mode !== 'labels' ? hostedIconFor(f.type, badgeColor) : '';
      if (flat) {
        const gp = Math.round(sz * 0.64);
        return {lead: iconImgTag(flat, gp, 'display:inline-block;vertical-align:middle;'),
                leadPad: '1px 7px 1px 0', val, valPad: '3px 0', align: 'middle'};
      }
      return {
        lead: `<span style="font-family:${ff};font-size:${bs - 1}px;font-weight:700;color:${badgeColor};line-height:1.6;">${esc(letter)}.</span>`,
        leadPad: '3px 8px 3px 0', val, valPad: '3px 0', align: 'top',
      };
    }
    // New Outlook gets the drawing, served from signvel.com — the design is
    // the same as Standard's, only the glyph arrives as an image.
    const hosted = EXPORT_TARGET === 'newoutlook' ? f.type : '';
    const glyphPx = Math.round(S.contactIconSize * 0.64);
    // A glyph drawn in the theme colour and uploaded to the account keeps the
    // design exactly: an open badge stays open, with the colour in the glyph.
    // Without one, the badge is filled instead, so the colour is at least in
    // the ground and the white glyph reads against it.
    const exact = hosted ? hostedIconFor(hosted, badgeColor) : '';
    const lead = badged
      ? circleIcon(contactIcons[f.type], mode === 'filled' || (!!hosted && !exact), badgeColor,
                   EXPORT_TARGET ? letter : '', hosted, exact)
      // A bare glyph has no ground to colour, so either it is the theme colour
      // or it is not an icon at all. The ink one was black against the ring's
      // blue, which read as a fault; the letter at least belongs to the design.
      : (exact
          ? iconImgTag(exact, glyphPx, 'display:inline-block;vertical-align:middle;')
          : EXPORT_TARGET
          ? `<span style="font-family:${ff};font-size:${bs - 1}px;font-weight:700;color:${badgeColor};line-height:1.6;">${esc(letter)}.</span>`
          : svgToImgTag(contactIcons[f.type], glyphPx, glyphPx, badgeColor, 'vertical-align:middle;'));
    return {lead, leadPad: badged ? '3px 10px 3px 0' : '1px 7px 1px 0', val, valPad: '3px 0', align: 'middle', raw: !EXPORT_TARGET};
  }

  // Lays the active contacts out as a table. `cols` of 2 pairs them across,
  // which is what the wide layouts were drawn with; `gap` is the space between
  // the two halves.
  function contactTable(opts) {
    const o = opts || {};
    const list = o.fields || activeContacts;
    if (!list.length) return '';
    const cols = o.cols || S.contactColumns || 1;
    const gap = o.gap != null ? o.gap : 26;
    // Laid across the width, a value must never break inside itself: the table
    // is held to the layout, so the browser squeezes each cell to its share and
    // wraps whatever will not fit, which turned a phone number into
    // "+971 / 50 / 123 / 4567", one fragment per line. Held on one line, the
    // cell asks for the width it needs instead.
    //
    // Only while it can have it, though. A value longer than the whole layout
    // has nowhere to go, and holding that on one line would push the signature
    // off the edge — worse than the break it avoids.
    const rowMax = layoutW || 560;
    const fieldWidth = f => String(f.value || '').length * (bs - 1) * 0.55 + 46;
    const cell = (f, last) => {
      const p = contactParts(f, o);
      const rightPad = last ? 0 : gap;
      const noWrap = o.row && fieldWidth(f) <= rowMax ? 'white-space:nowrap;' : '';
      if (!p.lead) return `<td colspan="2" style="padding:${p.valPad};padding-right:${rightPad}px;vertical-align:${p.align};${noWrap}">${p.val}</td>`;
      return `<td style="padding:${p.leadPad};vertical-align:${p.align};${p.raw ? 'font-size:0;line-height:0;' : ''}">${p.lead}</td>
              <td style="padding:${p.valPad};padding-right:${rightPad}px;vertical-align:${p.align};${noWrap}">${p.val}</td>`;
    };
    let rows = '';
    // Laid across the width, wrapping between fields rather than inside one.
    // Forcing every field onto a single row is what broke: the table is held
    // to the layout's width, so four of them were squeezed until the phone
    // numbers came apart. Packed instead — as many to a line as the width
    // takes, then a new line — so each value stays whole and the block still
    // reads as two or three shallow rows rather than a column.
    //
    // Widths are estimated from the text rather than measured, because this
    // markup is built once and has to hold up in a mail client where nothing
    // can be measured. 0.55em per character is a deliberate over-estimate for
    // the faces on offer; erring wide costs a line break, erring narrow costs
    // an overflowing signature.
    if (o.row) {
      const lines = [];
      let line = [], used = 0;
      list.forEach(f => {
        const w = fieldWidth(f);
        if (line.length && used + w > rowMax) { lines.push(line); line = []; used = 0; }
        line.push(f);
        used += w;
      });
      if (line.length) lines.push(line);
      rows = lines.map(ln =>
        `<tr>` + ln.map((f, i) => cell(f, i === ln.length - 1)).join('') + `</tr>`
      ).join('');
    } else if (cols === 2) {
      for (let i = 0; i < list.length; i += 2) {
        const pair = list.slice(i, i + 2);
        rows += `<tr>${cell(pair[0], false)}${pair[1] ? cell(pair[1], true) : '<td></td><td></td>'}</tr>`;
      }
    } else {
      rows = list.map(f => `<tr>${cell(f, true)}</tr>`).join('');
    }
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody>${rows}</tbody></table>`;
  }

  const contactHTML = contactTable();

  // Social
  // Turn the handle typed in the panel into a real profile URL. A handle that
  // is already a full URL is used as-is; an empty one falls back to '#'.
  const socialBases = {
    facebook:'https://facebook.com/', linkedin:'https://linkedin.com/company/',
    instagram:'https://instagram.com/', youtube:'https://youtube.com/@',
    tiktok:'https://tiktok.com/@', x:'https://x.com/',
    pinterest:'https://pinterest.com/',
  };
  const socialHref = (sl) => {
    const h = (sl.handle || '').trim().replace(/^@/, '');
    if (!h) return '#';
    if (/^https?:\/\//i.test(h)) return esc(h);
    return esc((socialBases[sl.type] || 'https://') + h);
  };

  const activeSocials = pSocials.filter(sl => sl.enabled);

  // `opts` exists so a layout drawn on a coloured ground can force the treatment
  // its design needs — white glyphs inside a purple pill, say — without the user
  // having to reconfigure the shared social settings each time they switch.
  function socialBlock(opts) {
    const o = opts || {};
    if (!activeSocials.length) return '';
    // The glyph treatments are drawings, so they go the same way the contact
    // icons do. Classic Outlook takes the plain name, which needs no shape at
    // all; new Outlook keeps its ring and carries the platform's initial.
    let style = o.style || S.socialStyle;
    const colour = o.color || sc;
    const sz = o.size || S.socialIconSize;
    // Word throws the CSS badge away, so a badged style only survives as a
    // picture with the badge drawn into it. Where there is no such picture
    // there is nothing to show but the name, which is the plain treatment.
    if (EXPORT_TARGET === 'classic') {
      const ground = badgeGround();
      const haveAll = (list) => list.every(sl => (style === 'glyph')
        ? hostedIconFor(sl.type, colour)
        : hostedBadgeFor(sl.type, colour, style === 'filled', sz, ground));
      if ((style === 'circle' || style === 'filled' || style === 'glyph') && !haveAll(activeSocials)) style = 'plain';
    }
    const iconSz = sz + 'px';
    let out = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${al === 'center' ? ' align="center"' : ''}><tbody><tr>`;
    activeSocials.forEach((sl, idx) => {
      const gap = idx > 0 ? `padding-left:${o.gap != null ? o.gap : (style === 'plain' ? 10 : 6)}px;` : '';
      const svgIcon = socialIcons[sl.type] || '';
      if (style === 'circle' || style === 'filled' || style === 'glyph') {
        const iconScale = Math.round(sz * (style === 'glyph' ? 0.78 : 0.55));
        // Bare glyph, no ring — the treatment the minimal reference layouts use.
        // Classic gets the badge as a picture; nothing else it draws survives.
        if (EXPORT_TARGET === 'classic') {
          const baked = style === 'glyph'
            ? hostedIconFor(sl.type, colour)
            : hostedBadgeFor(sl.type, colour, style === 'filled', sz, badgeGround());
          if (baked) {
            const px = style === 'glyph' ? iconScale : sz;
            out += `<td style="${gap}vertical-align:middle;font-size:0;line-height:0;"><a href="${socialHref(sl)}" style="display:block;text-decoration:none;font-size:0;line-height:0;">${iconImgTag(baked, px)}</a></td>`;
            return;
          }
        }
        const hostedMark = EXPORT_TARGET === 'newoutlook' ? sl.type : '';
        const exactMark = hostedMark ? hostedIconFor(hostedMark, colour) : '';
        if (style === 'glyph') {
          if (hostedMark) {
            // Coloured or not at all — a bare glyph has nothing behind it to
            // carry the colour, so an ink one would just be black.
            const img = exactMark ? iconImgTag(exactMark, iconScale, 'margin:0 auto;') : '';
            if (img) {
              out += `<td style="${gap}vertical-align:middle;font-size:0;line-height:0;"><a href="${socialHref(sl)}" style="display:block;text-decoration:none;font-size:0;line-height:0;">${img}</a></td>`;
              return;
            }
          }
          if (EXPORT_TARGET) {
            out += `<td style="${gap}vertical-align:middle;"><a href="${socialHref(sl)}" style="font-family:${ff};font-size:${parseInt(iconSz)-2}px;color:${colour};text-decoration:none;font-weight:600;">${esc(sl.label)}</a></td>`;
            return;
          }
          const glyphImg = svgToImgTag(svgIcon, iconScale, iconScale, colour, 'margin:0 auto;');
          out += `<td style="${gap}vertical-align:middle;font-size:0;line-height:0;"><a href="${socialHref(sl)}" style="display:block;text-decoration:none;font-size:0;line-height:0;">${glyphImg}</a></td>`;
          return;
        }
        // Filled only when there is no exactly coloured glyph to put in an
        // open ring — the same trade as the contact badges.
        const solid = style === 'filled' || (!!hostedMark && !exactMark);
        const glyphColor = solid ? (o.glyphColor || '#ffffff') : colour;
        const initial = (sl.label || sl.type || '?').charAt(0).toUpperCase();
        const hostedBadge = !hostedMark ? ''
          : (exactMark && !solid) ? iconImgTag(exactMark, iconScale, 'margin:0 auto;')
          : solid ? hostedIcon(hostedMark, 'white', iconScale, 'margin:0 auto;')
          : '';
        const inner = hostedBadge
          ? {mark: hostedBadge, type: 'font-size:0;line-height:0;'}
          : EXPORT_TARGET
          ? {mark: esc(initial), type: `color:${glyphColor};font-family:${ff};font-size:${Math.round(sz * 0.46)}px;font-weight:700;line-height:${sz - 4}px;`}
          : {mark: svgToImgTag(svgIcon, iconScale, iconScale, glyphColor, 'margin:0 auto;'), type: 'font-size:0;line-height:0;'};
        const bg = solid ? `background-color:${colour};` : '';
        const bgAttr = solid ? ` bgcolor="${colour}"` : '';
        out += `<td style="${gap}vertical-align:middle;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tr><td width="${sz}" height="${sz}"${bgAttr} style="box-sizing:border-box;width:${sz}px;min-width:${sz}px;max-width:${sz}px;height:${sz}px;padding:0;${bg}border:2px solid ${colour};border-radius:50%;text-align:center;vertical-align:middle;${inner.type}"><a href="${socialHref(sl)}" style="display:block;text-decoration:none;color:${glyphColor};${inner.type}">${inner.mark}</a></td></tr></table></td>`;
      } else if (style === 'chip') {
        out += `<td style="${gap}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${colour}" style="background-color:${colour};border-radius:4px;padding:3px 10px;"><a href="${socialHref(sl)}" style="font-family:${ff};font-size:${parseInt(iconSz)-4}px;color:#fff;text-decoration:none;font-weight:500;white-space:nowrap;">${sl.label}</a></td></tr></table></td>`;
      } else if (style === 'outline') {
        out += `<td style="${gap}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:1px solid ${colour};border-radius:4px;padding:3px 10px;"><a href="${socialHref(sl)}" style="font-family:${ff};font-size:${parseInt(iconSz)-4}px;color:${colour};text-decoration:none;font-weight:500;white-space:nowrap;">${sl.label}</a></td></tr></table></td>`;
      } else {
        out += `<td style="${gap}"><a href="${socialHref(sl)}" style="font-family:${ff};font-size:${parseInt(iconSz)-2}px;color:${colour};text-decoration:none;font-weight:500;">${sl.label}</a></td>`;
      }
    });
    return out + `</tr></tbody></table>`;
  }
  const socialHTML = socialBlock();

  // Divider
  const dividerHTML = S.dividerEnabled ? `<tr><td style="padding:${sp} 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:${S.dividerWidth}px solid ${ac};font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td></tr>` : '';

  // Banner & CTA
  let bannerHTML = '';
  let bannerInner = '';
  if (S.bannerEnabled && (S.bannerMessage || S.bannerSubtext || S.ctaLabel)) {
    let btnHTML = '';
    if (S.ctaLabel) {
      const btnRadius = S.ctaStyle === 'pill' ? '20px' : '4px';
      const btnBg = S.ctaStyle === 'solid' || S.ctaStyle === 'pill' ? ac : 'transparent';
      const btnColor = S.ctaStyle === 'solid' || S.ctaStyle === 'pill' ? '#fff' : ac;
      const btnBorder = S.ctaStyle === 'outline' ? `1px solid ${ac}` : S.ctaStyle === 'solid' || S.ctaStyle === 'pill' ? 'none' : 'none';
      btnHTML = `<td style="padding-left:10px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${btnBg};border:${btnBorder};border-radius:${btnRadius};padding:6px 16px;"><a href="${esc(S.ctaUrl)}" style="font-family:${ff};font-size:${parseInt(fs)-1}px;color:${btnColor};text-decoration:none;font-weight:600;white-space:nowrap;">${esc(S.ctaLabel)}</a></td></tr></table></td>`;
    }
    // Kept as a separate inner block so the card template can re-wrap it in its
    // own cell. Regex-splicing the finished row produced nested <td>s.
    bannerInner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody><tr>
        <td style="font-family:${ff};font-size:${parseInt(fs)-1}px;color:${tc};font-weight:${fw};">${esc(S.bannerMessage)}${S.bannerSubtext ? `<span style="display:block;font-size:${parseInt(fs)-2}px;color:#8B8898;font-weight:400;line-height:1.45;padding-top:2px;">${esc(S.bannerSubtext)}</span>` : ''}</td>
        ${btnHTML}
      </tr></tbody></table>`;
    bannerHTML = `<tr><td style="padding-top:${sp};">${bannerInner}</td></tr>`;
  }

  // Disclaimer
  let disclaimerHTML = '';
  if (S.disclaimerEnabled && S.disclaimerText) {
    disclaimerHTML = `<tr><td style="padding-top:${sp};"><p style="${mutedStyle}">${esc(S.disclaimerText)}</p></td></tr>`;
  }

  const taglineHTML = S.tagline
    ? `<p style="font-family:${ff};font-size:${fs};font-style:italic;color:${tc};line-height:1.4;margin:0 0 10px;">${esc(S.tagline)}</p>`
    : '';

  // A hosted campaign image, used in place of the text banner where a template
  // supports it. Width is capped so it cannot blow out a narrow reading pane.
  const bannerW = S.bannerWidth || 140;
  const bannerImgHTML = (S.bannerEnabled && S.bannerImage && showImages)
    ? `<img src="${esc(S.bannerImage)}" width="${bannerW}" style="display:block;width:100%;max-width:${bannerW}px;height:auto;border-radius:6px;" alt="${esc(S.bannerMessage || 'Campaign')}">`
    : '';

  // ── Assemble by template ──
  // Shared wrappers. `outer` applies the alignment and the optional maximum
  // width once, so no individual layout has to remember either.
  const outer = (rows, extra) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${widthAttr} style="border-collapse:separate;border-spacing:0;${widthCss}text-align:${al};${extra || ''}"><tbody>${rows}</tbody></table>`;
  const discRow = (span, pad) => (S.disclaimerEnabled && S.disclaimerText)
    ? `<tr><td${span ? ` colspan="${span}"` : ''} style="padding:${pad || sp + ' 0 0'};"><p style="${mutedStyle}margin:0;">${esc(S.disclaimerText)}</p></td></tr>`
    : '';
  const hairline = (colour, w) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:${w || 1}px solid ${colour || ruleColor};font-size:1px;line-height:1px;">&nbsp;</td></tr></table>`;
  const eName = esc(nameText);
  // Split for the layouts drawn with a two-weight name.
  const nameWords = pName.trim().split(/\s+/);
  const firstWord = nameWords.shift() || '';
  const restWords = nameWords.join(' ');

  // Solid brand-colour block on the left holding the mark, details on the right.
  if (S.template === 'colorblock') {
    const blockW = 136;
    const mark = S.logoUrl
      ? logoAs({size: Math.max(44, S.logoHeight + 18), maxw: blockW - 40, colour: '#FFFFFF', hollow: true, mono: true})
      : `<div style="font-family:${ff};font-size:${bs + 10}px;font-weight:800;letter-spacing:.04em;color:#ffffff;line-height:1.2;">${esc((pCompany || 'Logo').split(' ')[0].toUpperCase())}</div>`;
    return outer(`
      <tr>
        <td valign="${lv}" width="${blockW}" bgcolor="${ac}" style="width:${blockW}px;background-color:${ac};text-align:center;vertical-align:${lv};padding:30px 18px;">${mark}</td>
        <td style="vertical-align:middle;padding:26px 30px;">
          <p style="${nameStyleAt(bs + 4)}">${eName}</p>
          ${roleHTML({size: bs - 1, mb: 12})}
          <p style="font-family:${ff};font-size:${bs - 1}px;font-weight:700;letter-spacing:.06em;color:${nameColor};margin:0 0 12px;">${esc(String(pCompany).toUpperCase())}</p>
          ${taglineHTML}
          ${contactTable({gap: 34})}
          ${socialHTML ? `<div style="padding-top:${parseInt(sp) + 8}px;">${socialHTML}</div>` : ''}
        </td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${sp};">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(2, `12px 30px 0`)}`);
  }

  // Everything on a dark card: portrait left, two-weight name, role chip, and
  // the contacts paired across two columns.
  if (S.template === 'darkcard') {
    const card = (S.bgEnabled && isDarkColor(S.bgColor)) ? 'transparent' : a2;
    const solid = card !== 'transparent';
    const light = '#E8EEF9';
    const inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;width:100%;"><tbody><tr>
        ${S.headshotUrl ? `<td valign="${pv}" style="vertical-align:${pv};padding-right:26px;">${photoHTML({ring: S.photoRing || 5, ringColor: S.photoRing ? S.photoRingColor : '#FFFFFF'})}</td>` : ''}
        <td width="100%" style="width:100%;vertical-align:middle;">
          <p style="${nameStyleAt(bs + 11, '#FFFFFF')}"><span style="font-weight:400;color:${ac};">${esc(firstWord)}</span>${restWords ? ' ' + esc(restWords) : ''}</p>
          ${roleHTML({mb: 14, chipBg: solid ? '#33507F' : 'rgba(255,255,255,.16)', capsColor: ac, color: light})}
          ${taglineHTML}
          ${contactTable({color: light, icon: ac, linkColor: ac, gap: 30})}
          ${socialHTML ? `<div style="padding-top:${parseInt(sp) + 8}px;">${socialBlock({color: ac})}</div>` : ''}
        </td>
      </tr></tbody></table>`;

    const wrapped = solid
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;width:100%;"><tbody><tr><td bgcolor="${card}" style="background-color:${card};padding:28px 30px;border-radius:14px;">${inner}</td></tr></tbody></table>`
      : inner;

    return outer(`
      <tr><td>${wrapped}</td></tr>
      ${bannerImgHTML ? `<tr><td style="padding-top:${sp};">${bannerImgHTML}</td></tr>` : ''}
      ${discRow()}`);
  }

  // Mark left, identity centre, a vertical rule, then the contacts on the right.
  if (S.template === 'split') {
    const rule = `<td style="width:1px;background-color:${ruleColor};font-size:1px;line-height:1px;">&nbsp;</td>`;
    const site = activeContacts.find(f => f.type === 'website');
    return outer(`
      <tr>
        ${logoHTML ? `<td valign="${lv}" style="vertical-align:${lv};padding-right:26px;">${logoAs({stack: true, size: Math.max(40, S.logoHeight)})}</td>` : ''}
        <td style="vertical-align:middle;padding-right:28px;">
          <p style="${nameStyle}">${eName}</p>
          ${roleHTML({mb: 4})}
          ${taglineHTML}
          ${site ? `<p style="font-family:${ff};font-size:${fs};font-weight:700;margin:6px 0 0;"><a href="https://${esc(site.value.replace(/^https?:\/\//, ''))}" style="color:${ac};text-decoration:none;">${esc(site.value)}</a></p>` : ''}
          ${socialHTML ? `<div style="padding-top:${parseInt(sp) + 4}px;">${socialHTML}</div>` : ''}
        </td>
        ${rule}
        <td style="vertical-align:middle;padding-left:28px;">${contactTable({fields: activeContacts.filter(f => f.type !== 'website')})}</td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="4" style="padding-top:${parseInt(sp) + 8}px;">${bannerImgHTML}</td></tr>` : bannerInner ? `<tr><td colspan="4" style="padding-top:${sp};">${bannerInner}</td></tr>` : ''}
      ${discRow(4)}`);
  }

  // Name-led sibling of Split: identity and mark stacked on the left, contacts
  // right, socials tucked under them.
  if (S.template === 'directory') {
    const rule = `<td style="width:1px;background-color:${ruleColor};font-size:1px;line-height:1px;">&nbsp;</td>`;
    const site = activeContacts.find(f => f.type === 'website');
    return outer(`
      <tr>
        <td width="210" style="width:210px;vertical-align:middle;padding-right:30px;">
          <p style="${nameStyleAt(bs + 3, ac)}">${eName}</p>
          ${roleHTML({mb: 14})}
          ${logoHTML ? `<div style="padding-bottom:12px;">${logoAs({size: Math.max(38, S.logoHeight)})}</div>` : ''}
          ${taglineHTML}
          ${site ? `<p style="font-family:${ff};font-size:${bs - 1}px;font-weight:700;margin:0;"><a href="https://${esc(site.value.replace(/^https?:\/\//, ''))}" style="color:${ac};text-decoration:none;">${esc(site.value)}</a></p>` : ''}
        </td>
        ${rule}
        <td style="vertical-align:middle;padding-left:30px;">
          ${contactTable({fields: activeContacts.filter(f => f.type !== 'website')})}
          ${socialHTML ? `<div style="padding-top:${parseInt(sp) + 8}px;">${socialHTML}</div>` : ''}
        </td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="3" style="padding-top:${parseInt(sp) + 8}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(3)}`);
  }

  // Thick accent bar down the left edge, mark on the right, campaign strip below.
  if (S.template === 'accentbar') {
    const barW = Math.max(3, S.dividerWidth + 1);
    return outer(`
      <tr>
        <td width="${barW}" bgcolor="${ac}" style="width:${barW}px;background-color:${ac};font-size:1px;line-height:1px;">&nbsp;</td>
        <td width="100%" style="width:100%;vertical-align:top;padding-left:20px;">
          <p style="${nameStyleAt(bs + 3, ac)}">${eName}</p>
          <p style="font-family:${ff};font-size:${bs + 1}px;font-weight:700;color:${nameColor};line-height:1.3;margin:0 0 8px;">${esc(pCompany)}</p>
          ${roleHTML({mb: 8})}
          ${taglineHTML}
          ${contactTable({lowercase: true})}
          ${socialHTML ? `<div style="padding-top:${parseInt(sp) + 6}px;">${socialHTML}</div>` : ''}
        </td>
        ${logoHTML ? `<td valign="${lv}" style="vertical-align:${lv};padding:2px 0 0 28px;">${logoAs({stack: true, size: Math.max(44, S.logoHeight)})}</td>` : ''}
      </tr>
      ${(S.bannerEnabled && (S.bannerMessage || S.ctaLabel)) ? `<tr><td colspan="3" style="padding-top:${parseInt(sp) + 8}px;">
        <p style="font-family:${ff};font-size:${fs};color:${tc};line-height:1.5;margin:0;">${esc(S.bannerMessage)}${S.ctaLabel ? ` <a href="${esc(S.ctaUrl)}" style="color:${ac};text-decoration:underline;font-weight:600;">${esc(S.ctaLabel)}</a>` : ''}</p>
      </td></tr>` : ''}
      ${bannerImgHTML ? `<tr><td colspan="3" style="padding-top:${sp};">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(3)}`);
  }

  // Portrait, a vertical rule, then the details — with the campaign banner as a
  // full-width card underneath rather than an inline row.
  if (S.template === 'spotlight') {
    const lineStyle = `font-family:${ff};font-size:${bs - 1}px;color:${tc};line-height:1.65;`;
    // Everything except the website stacks; the website shares its line with the
    // call to action, separated by a rule, as in the reference.
    const stacked = activeContacts.filter(f => f.type !== 'website');
    const site = activeContacts.find(f => f.type === 'website');
    let lines = stacked.map(f => `<div style="${lineStyle}">${esc(f.value)}</div>`).join('');
    if (site || (S.bannerEnabled && S.ctaLabel)) {
      const parts = [];
      if (site) parts.push(`<a href="https://${esc(site.value.replace(/^https?:\/\//, ''))}" style="${lineStyle}color:${tc};text-decoration:underline;">${esc(site.value)}</a>`);
      if (S.bannerEnabled && S.ctaLabel) parts.push(`<a href="${esc(S.ctaUrl)}" style="${lineStyle}color:${tc};text-decoration:underline;">${esc(S.ctaLabel)}</a>`);
      lines += `<div style="${lineStyle}">${parts.join(`<span style="color:${ruleColor};padding:0 9px;">|</span>`)}</div>`;
    }

    const bannerCard = (S.bannerEnabled && (S.bannerMessage || S.bannerSubtext || S.ctaLabel)) ? `
      <tr><td colspan="3" style="padding-top:${parseInt(sp) + 12}px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;">
          <tr><td bgcolor="${a2}" style="background-color:${a2};border-radius:12px;padding:24px 26px;">
            <p style="font-family:${hf};font-size:${bs + 8}px;font-weight:700;color:#ffffff;line-height:1.2;margin:0;">${esc(S.bannerMessage || 'Email campaign')}</p>
            ${S.bannerSubtext ? `<p style="font-family:${ff};font-size:${bs - 1}px;font-weight:400;color:rgba(255,255,255,.72);line-height:1.45;margin:6px 0 0;">${esc(S.bannerSubtext)}</p>` : ''}
            ${S.ctaLabel ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr><td bgcolor="${ac}" style="background-color:${ac};border-radius:9999px;padding:8px 20px;"><a href="${esc(S.ctaUrl)}" style="font-family:${ff};font-size:${bs - 1}px;font-weight:600;color:#ffffff;text-decoration:none;white-space:nowrap;">${esc(S.ctaLabel)}</a></td></tr></table>` : ''}
          </td></tr>
        </table>
      </td></tr>` : '';

    return outer(`
      <tr>
        <td valign="${pv}" style="vertical-align:${pv};padding:2px 22px 0 0;">${headshotHTML}</td>
        <td style="width:1px;background-color:${ruleColor};font-size:1px;line-height:1px;">&nbsp;</td>
        <td width="100%" style="width:100%;vertical-align:middle;padding-left:22px;">
          <p style="${nameStyleAt(bs + 5)}">${eName}</p>
          ${roleHTML({size: bs + 1, mb: 10})}
          ${taglineHTML}
          ${lines}
        </td>
      </tr>
      ${bannerCard}
      ${discRow(3)}`);
  }

  // Portrait and details left, brand and socials right, with a full-width
  // invitation bar closing the block.
  if (S.template === 'connect') {
    const barText = S.bannerMessage || "Let's connect!";
    const barCta = S.ctaLabel || 'Schedule a meeting with me';
    return outer(`
      <tr>
        <td valign="${pv}" style="vertical-align:${pv};padding:0 22px 0 0;">${headshotHTML}</td>
        <td width="100%" style="width:100%;vertical-align:top;">
          <p style="${nameStyleAt(bs + 4)}">${eName}</p>
          ${roleHTML({mb: 12, capsColor: ac})}
          ${taglineHTML}
          ${contactTable()}
        </td>
        <td style="vertical-align:top;padding-left:30px;text-align:right;">
          ${logoHTML ? `<div style="padding-bottom:16px;">${logoAs({stack: true, size: Math.max(38, S.logoHeight)})}</div>` : ''}
          ${socialHTML}
        </td>
      </tr>
      <tr><td colspan="3" style="padding-top:${parseInt(sp) + 10}px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;"><tr>
          <td bgcolor="${ac}" style="background-color:${ac};border-radius:6px;padding:12px 22px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="font-family:${hf};font-size:${bs + 1}px;font-style:italic;font-weight:600;color:#ffffff;white-space:nowrap;">${esc(barText)}</td>
              <td style="padding:0 18px;color:rgba(255,255,255,.45);font-size:${bs + 2}px;line-height:1;">|</td>
              <td style="font-family:${ff};font-size:${bs - 1}px;color:#ffffff;"><a href="${esc(S.ctaUrl || '#')}" style="color:#ffffff;text-decoration:none;">${esc(barCta)} &nbsp;&rarr;</a></td>
            </tr></table>
          </td>
        </tr></table>
      </td></tr>
      ${bannerImgHTML ? `<tr><td colspan="3" style="padding-top:${sp};">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(3)}`);
  }

  // Ringed portrait, tracked capitals, and the socials gathered into a pill.
  if (S.template === 'ribbon') {
    const pill = socialHTML ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"${al === 'right' ? '' : ' align="right"'}><tr>
        <td bgcolor="${ac}" style="background-color:${ac};border-radius:9999px;padding:9px 18px;">${socialBlock({style: 'glyph', color: '#FFFFFF', size: 18, gap: 16})}</td>
      </tr></table>` : '';
    return outer(`
      <tr>
        <td valign="${pv}" style="vertical-align:${pv};padding-right:24px;">${photoHTML({ring: S.photoRing || 5, ringColor: S.photoRing ? S.photoRingColor : ac})}</td>
        <td width="100%" style="width:100%;vertical-align:middle;">
          <p style="${nameStyleAt(bs + 6, ac)}">${eName}</p>
          ${roleHTML({mb: 12, chipFg: '#FFFFFF'})}
          ${taglineHTML}
          ${contactTable({gap: 24})}
        </td>
        <td style="vertical-align:middle;padding-left:30px;text-align:right;">
          ${logoHTML ? `<div style="padding-bottom:18px;">${logoAs({size: Math.max(32, S.logoHeight - 6)})}</div>` : ''}
          ${pill}
        </td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="3" style="padding-top:${parseInt(sp) + 8}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(3)}`);
  }

  // Mark stacked in its own column, details beside it, socials as bare glyphs.
  if (S.template === 'brandmark') {
    return outer(`
      <tr>
        ${logoHTML ? `<td valign="${lv}" style="vertical-align:${lv};padding:2px 26px 0 0;">${logoAs({stack: true, size: Math.max(40, S.logoHeight)})}</td>` : ''}
        <td style="vertical-align:top;">
          <p style="${nameStyleAt(bs + 3)}">${eName}</p>
          ${roleHTML({size: bs - 1, mb: 12})}
          ${taglineHTML}
          ${contactTable()}
          ${socialHTML ? `<div style="padding-top:${parseInt(sp) + 8}px;">${socialHTML}</div>` : ''}
        </td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${parseInt(sp) + 8}px;">${bannerImgHTML}</td></tr>` : bannerInner ? `<tr><td colspan="2" style="padding-top:${sp};">${bannerInner}</td></tr>` : ''}
      ${discRow(2)}`);
  }

  // The same brand column, but the details run across instead of down — the
  // shallowest layout in the set, for people who want two lines and no more.
  if (S.template === 'inline') {
    const wide = activeContacts.filter(f => f.type !== 'address');
    const addr = activeContacts.filter(f => f.type === 'address');
    return outer(`
      <tr>
        ${logoHTML ? `<td valign="${lv}" style="vertical-align:${lv};padding-right:22px;">${logoAs({mono: !showRealLogo, size: Math.max(38, S.logoHeight)})}</td>` : ''}
        <td width="100%" style="width:100%;vertical-align:middle;">
          <p style="${nameStyleAt(bs + 3)}">${eName}</p>
          ${roleHTML({size: bs - 1})}
        </td>
      </tr>
      <tr><td colspan="2" style="padding-top:${parseInt(sp) + 6}px;">
        ${contactTable({row: true, fields: wide, gap: 24})}
        ${addr.length ? `<div style="padding-top:2px;">${contactTable({fields: addr})}</div>` : ''}
      </td></tr>
      ${socialHTML ? `<tr><td colspan="2" style="padding-top:${parseInt(sp) + 6}px;">${hairline()}</td></tr>
      <tr><td colspan="2" style="padding-top:${parseInt(sp) + 6}px;">${socialHTML}</td></tr>` : ''}
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${sp};">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(2)}`);
  }

  // Every row carries its own label, set in the theme colour — the most
  // explicit layout in the set, and the easiest to scan.
  if (S.template === 'labelled') {
    const followRow = socialHTML ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding:3px 10px 3px 0;${mutedStyle}color:${ac};font-weight:600;white-space:nowrap;vertical-align:middle;">follow me:</td>
        <td style="vertical-align:middle;">${socialHTML}</td>
      </tr></table>` : '';
    return outer(`
      <tr>
        <td valign="${pv}" style="vertical-align:${pv};padding:0 28px 0 0;">${photoHTML({fallback: ac})}</td>
        <td width="100%" style="width:100%;vertical-align:top;">
          <p style="${nameStyleAt(bs + 5, ac)}">${eName}</p>
          ${roleHTML({size: bs, mb: 14})}
          ${taglineHTML}
          ${contactTable({labelColor: ac})}
          ${followRow ? `<div style="padding-top:${parseInt(sp) + 6}px;">${followRow}</div>` : ''}
        </td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${parseInt(sp) + 8}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(2)}`);
  }

  // Brand row, a full-width name band, then details beside the portrait.
  if (S.template === 'band') {
    const site = activeContacts.find(f => f.type === 'website');
    return outer(`
      <tr>
        <td valign="${lv}" width="100%" style="width:100%;vertical-align:${lv};">${logoHTML ? logoAs({size: Math.max(30, S.logoHeight - 8)}) : ''}</td>
        <td style="vertical-align:middle;text-align:right;">${socialHTML}</td>
      </tr>
      <tr><td colspan="2" style="padding-top:${parseInt(sp) + 8}px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;"><tr>
          <td bgcolor="${ac}" style="background-color:${ac};border-radius:8px;padding:20px 26px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
              <td style="vertical-align:middle;font-family:${hf};font-size:${nameAt(bs + 12)}px;font-weight:800;color:#ffffff;line-height:1.1;${track}">${eName}</td>
              <td style="vertical-align:middle;text-align:right;padding-left:20px;white-space:nowrap;">${roleHTML({align: 'right', color: '#EEF2FB', capsColor: '#FFFFFF', chipBg: 'rgba(255,255,255,.22)', chipFg: '#FFFFFF'})}</td>
            </tr></table>
          </td>
        </tr></table>
      </td></tr>
      <tr><td colspan="2" style="padding-top:${parseInt(sp) + 10}px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td width="100%" style="width:100%;vertical-align:top;">
            ${taglineHTML}
            ${contactTable({fields: activeContacts.filter(f => f.type !== 'website')})}
            ${site ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;margin-top:${parseInt(sp) + 6}px;"><tr>
              <td bgcolor="${ac}" style="background-color:${ac};border-radius:9999px;padding:7px 18px;"><a href="https://${esc(site.value.replace(/^https?:\/\//, ''))}" style="font-family:${ff};font-size:${bs - 2}px;font-weight:600;color:#ffffff;text-decoration:none;white-space:nowrap;">${esc(site.value)}</a></td>
            </tr></table>` : ''}
          </td>
          <td valign="${pv}" style="vertical-align:${pv};padding-left:26px;text-align:right;">${headshotHTML}</td>
        </tr></table>
      </td></tr>
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${sp};">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(2)}`);
  }

  // Set in a display face on a deep ground, with the portrait squared off at the
  // right edge. The one layout in the set that reads as printed rather than sent.
  if (S.template === 'editorial') {
    const soft = onDark ? 'rgba(255,255,255,.78)' : tc;
    return outer(`
      <tr>
        <td width="100%" style="width:100%;vertical-align:middle;padding-right:30px;">
          <p style="font-family:${hf};font-size:${nameAt(bs + 16)}px;font-weight:400;color:${onDark ? '#FFFFFF' : nameColor};line-height:1.1;${track}margin:0 0 10px;">${eName}</p>
          ${hairline(onDark ? 'rgba(255,255,255,.35)' : ruleColor)}
          <p style="font-family:${hf};font-size:${bs + 5}px;font-weight:400;color:${soft};line-height:1.3;margin:10px 0 0;">${esc(pCompany)}</p>
          ${roleHTML({size: bs - 1, color: soft, mb: 0})}
          ${taglineHTML}
          <div style="padding-top:${parseInt(sp) + 10}px;">${contactTable({color: soft, icon: ac, linkColor: ac, gap: 30})}</div>
          ${socialHTML ? `<div style="padding-top:${parseInt(sp) + 8}px;">${socialHTML}</div>` : ''}
        </td>
        <td valign="${pv}" style="vertical-align:${pv};width:1px;">${photoHTML({size: S.headshotSize || 130})}</td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${parseInt(sp) + 8}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(2)}`);
  }

  // Contacts laid into a ruled grid, each cell labelled above its value.
  if (S.template === 'grid') {
    const line = onDark ? 'rgba(255,255,255,.22)' : ruleColor;
    const labelC = ac;
    const valueC = onDark ? '#EDEFEE' : tc;
    const cols = S.contactColumns === 1 ? 1 : 2;
    const cells = activeContacts.map(f => `<td style="border-top:1px solid ${line};padding:12px 24px 12px 0;vertical-align:top;">
        <div style="font-family:${ff};font-size:${bs - 3}px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${labelC};line-height:1.4;margin-bottom:3px;">${esc(f.label)}</div>
        <div style="font-family:${ff};font-size:${bs - 1}px;color:${valueC};line-height:1.5;">${esc(f.value)}</div>
      </td>`);
    let gridRows = '';
    for (let i = 0; i < cells.length; i += cols) {
      const row = cells.slice(i, i + cols);
      while (row.length < cols) row.push(`<td style="border-top:1px solid ${line};">&nbsp;</td>`);
      gridRows += `<tr>${row.join('')}</tr>`;
    }
    return outer(`
      <tr>
        <td width="100%" style="width:100%;vertical-align:top;">
          ${roleHTML({size: bs - 1, mb: 6, capsColor: ac})}
          <p style="${nameStyleAt(bs + 18, onDark ? '#FFFFFF' : nameColor)}">${eName}</p>
          ${taglineHTML}
          <div style="padding-top:${parseInt(sp) + 8}px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tbody>${gridRows}</tbody></table></div>
        </td>
        <td valign="${pv}" style="vertical-align:${pv};padding-left:30px;">${photoHTML({ring: S.photoRing || 3, ringColor: S.photoRing ? S.photoRingColor : ac})}</td>
      </tr>
      ${socialHTML ? `<tr><td colspan="2" style="padding-top:${parseInt(sp) + 10}px;text-align:right;">${socialHTML}</td></tr>` : ''}
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${sp};">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(2)}`);
  }

  // The boldest of the set: a ringed portrait against a saturated ground, with
  // the name carrying the whole block.
  if (S.template === 'feature') {
    const light = onDark ? '#FFFFFF' : nameColor;
    const soft = onDark ? 'rgba(255,255,255,.86)' : tc;
    return outer(`
      <tr>
        <td valign="${pv}" style="vertical-align:${pv};padding-right:28px;">${photoHTML({ring: S.photoRing || 4, ringColor: S.photoRing ? S.photoRingColor : '#FFFFFF'})}</td>
        <td width="100%" style="width:100%;vertical-align:middle;">
          <p style="${nameStyleAt(bs + 14, light)}">${eName}</p>
          ${roleHTML({mb: 14, chipBg: onDark ? 'rgba(255,255,255,.18)' : a2, chipFg: '#FFFFFF', color: soft, capsColor: ac})}
          ${taglineHTML}
          ${contactTable({color: soft, icon: onDark ? '#FFFFFF' : ic, linkColor: ac, gap: 28})}
          ${socialHTML ? `<div style="padding-top:${parseInt(sp) + 8}px;">${socialBlock({color: onDark ? '#FFFFFF' : sc, glyphColor: S.bgColor})}</div>` : ''}
        </td>
        ${logoHTML ? `<td valign="${lv}" style="vertical-align:${lv};padding-left:26px;text-align:right;">${logoAs({size: Math.max(30, S.logoHeight - 8), colour: onDark ? '#FFFFFF' : undefined, hollow: onDark && !showRealLogo})}</td>` : ''}
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="3" style="padding-top:${parseInt(sp) + 8}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(3)}`);
  }

  if (S.template === 'corporate') {
    // Full-width accent rule, reused above and below the logo/contact band.
    const rule = hairline(ac, S.dividerWidth);
    const discStyle = `font-family:${ff};font-size:${Math.max(9, bs - 4)}px;color:${ac};line-height:1.5;margin:0;`;
    // Uses the shared width rather than its own copy of it, so the background
    // panel takes its padding out of this layout too instead of adding 48px
    // to it — this was the one place that still grew.
    const corpW = layoutW || 560;
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${corpW}" style="width:${corpW}px;max-width:100%;text-align:${al};"><tbody>
      <tr><td style="padding-bottom:${sp};">
        <p style="${nameStyle}">${eName}</p>
        ${roleHTML({mb: 2})}
        <p style="${titleStyle}">${esc(pCompany)}</p>
      </td></tr>
      ${S.dividerEnabled ? `<tr><td style="padding-bottom:${sp};">${rule}</td></tr>` : ''}
      <tr><td>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tbody><tr>
          <td valign="${lv}" style="vertical-align:${lv};padding-right:28px;">${logoHTML}</td>
          <td style="vertical-align:middle;width:100%;">${contactHTML}</td>
        </tr></tbody></table>
      </td></tr>
      ${S.dividerEnabled ? `<tr><td style="padding:${sp} 0;">${rule}</td></tr>` : ''}
      ${socialHTML ? `<tr><td style="padding-bottom:${sp};">${socialHTML}</td></tr>` : ''}
      ${bannerHTML}
      ${S.disclaimerEnabled && S.disclaimerText ? `<tr><td><p style="${discStyle}">${esc(S.disclaimerText)}</p></td></tr>` : ''}
    </tbody></table>`;
  }

  // ── Stacked ──
  // One narrow column, read top to bottom: portrait, who you are, a rule, the
  // contacts under one another, a rule in the theme colour, then the mark and
  // the social icons. The only layout in the set that does not put something
  // beside something else, which is what lets it hold together at 340px — a
  // phone, or a reading pane given half a window.
  if (S.template === 'stacked') {
    const gap = parseInt(sp);
    return outer(`
      ${S.headshotUrl && showImages ? `<tr><td style="padding-bottom:${gap + 4}px;">${photoHTML({shape: 'circle', size: S.headshotSize || 72, ring: S.photoRing, ringColor: S.photoRingColor})}</td></tr>` : ''}
      <tr><td>
        <p style="${nameStyleAt(bs + 5)}">${eName}</p>
        ${roleHTML({mb: 2})}
        <p style="${titleStyle}">${esc(pCompany)}</p>
        ${taglineHTML}
      </td></tr>
      ${S.dividerEnabled ? `<tr><td style="padding:${gap + 2}px 0;">${hairline(ac, S.dividerWidth)}</td></tr>` : `<tr><td style="height:${gap + 2}px;"></td></tr>`}
      <tr><td>${contactHTML}</td></tr>
      ${S.dividerEnabled ? `<tr><td style="padding:${gap + 2}px 0;">${hairline(ac, S.dividerWidth)}</td></tr>` : `<tr><td style="height:${gap + 2}px;"></td></tr>`}
      ${logoHTML ? `<tr><td style="padding-bottom:${gap}px;">${logoAs({size: Math.max(26, S.logoHeight - 8)})}</td></tr>` : ''}
      ${socialHTML ? `<tr><td>${socialHTML}</td></tr>` : ''}
      ${bannerImgHTML ? `<tr><td style="padding-top:${gap + 4}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(1, `${gap + 6}px 0 0`)}`);
  }

  // ── Profile ──
  // The portrait and the mark share a column, one under the other, and the
  // details sit beside them ruled top and bottom. Everywhere else the logo is
  // opposite the portrait or tucked beside the name; keeping the two together
  // makes the left edge read as one identity block rather than two things that
  // happen to be on the same row.
  if (S.template === 'profile') {
    const gap = parseInt(sp);
    const media = `${S.headshotUrl && showImages ? photoHTML({shape: 'circle', size: S.headshotSize || 78, ring: S.photoRing, ringColor: S.photoRingColor}) : ''}${
      logoHTML ? `<div style="padding-top:${S.headshotUrl && showImages ? gap + 4 : 0}px;">${logoAs({size: Math.max(26, S.logoHeight - 8)})}</div>` : ''}`;
    return outer(`
      <tr>
        ${media.trim() ? `<td valign="${pv}" style="vertical-align:${pv};padding-right:26px;">${media}</td>` : ''}
        <td width="100%" style="width:100%;vertical-align:top;">
          <p style="${nameStyleAt(bs + 4)}">${eName}</p>
          ${roleHTML({mb: 2})}
          <p style="${titleStyle}">${esc(pCompany)}</p>
          ${taglineHTML}
          ${S.dividerEnabled ? `<div style="padding:${gap + 2}px 0;">${hairline(ac, S.dividerWidth)}</div>` : `<div style="height:${gap + 2}px;"></div>`}
          ${contactHTML}
          ${S.dividerEnabled ? `<div style="padding:${gap + 2}px 0;">${hairline(ac, S.dividerWidth)}</div>` : `<div style="height:${gap + 2}px;"></div>`}
          ${socialHTML}
        </td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${gap + 4}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(2, `${gap + 6}px 0 0`)}`);
  }

  // ── Letterhead ──
  // Who you are across the top under a portrait, then a rule, then the mark
  // beside the details, then a rule and the social icons. Corporate's skeleton,
  // which has no slot for a face; this is the one layout that carries both a
  // portrait and a mark without setting them opposite one another.
  if (S.template === 'letterhead') {
    const gap = parseInt(sp);
    const rule = S.dividerEnabled
      ? `<tr><td colspan="2" style="padding:${gap + 2}px 0;">${hairline(ac, S.dividerWidth)}</td></tr>`
      : `<tr><td colspan="2" style="height:${gap + 2}px;"></td></tr>`;
    return outer(`
      ${S.headshotUrl && showImages ? `<tr><td colspan="2" style="padding-bottom:${gap + 2}px;">${photoHTML({shape: 'circle', size: S.headshotSize || 76, ring: S.photoRing, ringColor: S.photoRingColor})}</td></tr>` : ''}
      <tr><td colspan="2">
        <p style="${nameStyleAt(bs + 4)}">${eName}</p>
        ${roleHTML({mb: 2})}
        <p style="${titleStyle}">${esc(pCompany)}</p>
        ${taglineHTML}
      </td></tr>
      ${rule}
      <tr>
        ${logoHTML ? `<td valign="${lv}" style="vertical-align:${lv};padding-right:26px;">${logoAs({size: Math.max(30, S.logoHeight)})}</td>` : ''}
        <td width="100%" style="width:100%;vertical-align:middle;">${contactHTML}</td>
      </tr>
      ${rule}
      ${socialHTML ? `<tr><td colspan="2">${socialHTML}</td></tr>` : ''}
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${gap + 4}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(2, `${gap + 6}px 0 0`)}`);
  }

  // ── Masthead ──
  // The portrait runs across the top with a rule under it, and who you are sits
  // beside how to reach you below that. Split and Directory pair those same two
  // columns but lead with the name; leading with the face turns the rule into a
  // masthead rather than a divider between two halves.
  if (S.template === 'masthead') {
    const gap = parseInt(sp);
    const rule = S.dividerEnabled
      ? `<tr><td colspan="2" style="padding:${gap + 2}px 0;">${hairline(ac, S.dividerWidth)}</td></tr>`
      : `<tr><td colspan="2" style="height:${gap + 2}px;"></td></tr>`;
    return outer(`
      ${S.headshotUrl && showImages ? `<tr><td colspan="2">${photoHTML({shape: 'circle', size: S.headshotSize || 80, ring: S.photoRing, ringColor: S.photoRingColor})}</td></tr>` : ''}
      ${rule}
      <tr>
        <td width="200" valign="top" style="width:200px;vertical-align:top;padding-right:26px;">
          <p style="${nameStyleAt(bs + 2)}">${eName}</p>
          ${roleHTML({mb: 2})}
          <p style="${titleStyle}">${esc(pCompany)}</p>
          ${taglineHTML}
          ${logoHTML ? `<div style="padding-top:${gap + 2}px;">${logoAs({size: Math.max(24, S.logoHeight - 10)})}</div>` : ''}
        </td>
        <td style="vertical-align:top;">${contactHTML}</td>
      </tr>
      ${rule}
      ${socialHTML ? `<tr><td colspan="2">${socialHTML}</td></tr>` : ''}
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${gap + 4}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(2, `${gap + 6}px 0 0`)}`);
  }

  // ── Bulletin ──
  // Stacked's sequence spent across the full width, with the mark carried high:
  // directly under the name, before the rule, so the brand arrives ahead of the
  // details rather than after them. Stacked is drawn narrow to survive a phone;
  // this one uses the room instead.
  if (S.template === 'bulletin') {
    const gap = parseInt(sp);
    const rule = S.dividerEnabled
      ? `<tr><td style="padding:${gap + 2}px 0;">${hairline(ac, S.dividerWidth)}</td></tr>`
      : `<tr><td style="height:${gap + 2}px;"></td></tr>`;
    return outer(`
      ${S.headshotUrl && showImages ? `<tr><td style="padding-bottom:${gap + 2}px;">${photoHTML({shape: 'circle', size: S.headshotSize || 80, ring: S.photoRing, ringColor: S.photoRingColor})}</td></tr>` : ''}
      <tr><td>
        <p style="${nameStyleAt(bs + 4)}">${eName}</p>
        ${roleHTML({mb: 2})}
        <p style="${titleStyle}">${esc(pCompany)}</p>
        ${taglineHTML}
      </td></tr>
      ${logoHTML ? `<tr><td style="padding-top:${gap + 2}px;">${logoAs({size: Math.max(30, S.logoHeight - 4)})}</td></tr>` : ''}
      ${rule}
      <tr><td>${contactHTML}</td></tr>
      ${rule}
      ${socialHTML ? `<tr><td>${socialHTML}</td></tr>` : ''}
      ${bannerImgHTML ? `<tr><td style="padding-top:${gap + 4}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(1, `${gap + 6}px 0 0`)}`);
  }

  // ── Aside ──
  // A rule standing on its end, with the picture and the mark on one side of it
  // and everything else on the other. Accent bar also carries a coloured bar,
  // but that one marks the outer edge of the whole block; this one divides two
  // halves, which is why it sits between the columns rather than before them.
  if (S.template === 'aside') {
    const gap = parseInt(sp);
    const barW = Math.max(2, S.dividerWidth);
    return outer(`
      <tr>
        ${S.headshotUrl && showImages ? `<td valign="${pv}" style="vertical-align:${pv};padding-right:22px;">${photoHTML({shape: 'circle', size: S.headshotSize || 84, ring: S.photoRing, ringColor: S.photoRingColor})}${
          logoHTML ? `<div style="padding-top:${gap + 4}px;">${logoAs({size: Math.max(26, S.logoHeight - 8)})}</div>` : ''}</td>`
        : logoHTML ? `<td valign="${lv}" style="vertical-align:${lv};padding-right:22px;">${logoAs({size: Math.max(26, S.logoHeight - 8)})}</td>` : ''}
        ${S.dividerEnabled ? `<td width="${barW}" bgcolor="${ac}" style="width:${barW}px;background-color:${ac};font-size:1px;line-height:1px;">&nbsp;</td>` : ''}
        <td width="100%" style="width:100%;vertical-align:middle;padding-left:${S.dividerEnabled ? 22 : 0}px;">
          <p style="${nameStyleAt(bs + 3)}">${eName}</p>
          ${roleHTML({mb: 2})}
          <p style="${titleStyle}">${esc(pCompany)}</p>
          ${taglineHTML}
          <div style="padding-top:${gap + 2}px;">${contactHTML}</div>
          ${socialHTML ? `<div style="padding-top:${gap + 2}px;">${socialHTML}</div>` : ''}
        </td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="3" style="padding-top:${gap + 4}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(3, `${gap + 6}px 0 0`)}`);
  }

  // ── Triptych ──
  // Three panels across — the picture, who you are, how to reach you — ruled
  // underneath, with the mark and the social icons sharing the line below. The
  // set pairs two columns in several ways and runs three only where the third
  // is a call to action; here the three carry equal weight.
  if (S.template === 'triptych') {
    const gap = parseInt(sp);
    return outer(`
      <tr>
        ${S.headshotUrl && showImages ? `<td valign="${pv}" style="vertical-align:${pv};padding-right:24px;">${photoHTML({shape: 'circle', size: S.headshotSize || 82, ring: S.photoRing, ringColor: S.photoRingColor})}</td>` : ''}
        <td width="190" valign="top" style="width:190px;vertical-align:top;padding-right:24px;">
          <p style="${nameStyleAt(bs + 2)}">${eName}</p>
          ${roleHTML({mb: 2})}
          <p style="${titleStyle}">${esc(pCompany)}</p>
          ${taglineHTML}
        </td>
        <td style="vertical-align:top;">${contactHTML}</td>
      </tr>
      ${S.dividerEnabled ? `<tr><td colspan="3" style="padding:${gap + 2}px 0;">${hairline(ac, S.dividerWidth)}</td></tr>` : `<tr><td colspan="3" style="height:${gap + 2}px;"></td></tr>`}
      <tr>
        <td colspan="3">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tbody><tr>
            ${logoHTML ? `<td valign="${lv}" style="vertical-align:${lv};padding-right:24px;">${logoAs({size: Math.max(26, S.logoHeight - 8)})}</td>` : ''}
            ${socialHTML ? `<td width="100%" style="width:100%;vertical-align:middle;">${socialHTML}</td>` : '<td></td>'}
          </tr></tbody></table>
        </td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="3" style="padding-top:${gap + 4}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(3, `${gap + 6}px 0 0`)}`);
  }

  // minimal
  return outer(`
    <tr><td><span style="${nameStyle}">${eName}</span><span style="${titleStyle}"> · ${esc(pTitle)} · ${esc(pCompany)}</span></td></tr>
    ${dividerHTML}
    <tr><td style="padding-top:${sp};">
      ${activeContacts.map(f => {
        if (f.type === 'email') return `<a href="mailto:${esc(f.value)}" style="${fieldStyle}color:${ac};">${esc(f.value)}</a>`;
        if (f.type === 'website') return `<a href="https://${esc(f.value.replace(/^https?:\/\//, ''))}" style="${fieldStyle}color:${ac};">${esc(f.value)}</a>`;
        return `<span style="${fieldStyle}">${esc(f.value)}</span>`;
      }).join(`<span style="color:${ruleColor};margin:0 6px;">·</span>`)}
    </td></tr>
    ${socialHTML ? `<tr><td style="padding-top:${sp};">${socialHTML}</td></tr>` : ''}
    ${bannerHTML}
    ${disclaimerHTML}`);
}

// ═══════════════════════════════════════
// Export HTML (fully inlined, table-based)
// ═══════════════════════════════════════
// Renders with a target set, and puts it back afterwards, so the live preview
// beside the dialog is never left showing a client's variant.
function withExportTarget(target, fn) {
  const before = EXPORT_TARGET;
  EXPORT_TARGET = target || null;
  try { return fn(); } finally { EXPORT_TARGET = before; }
}

function generateExportHTML(target) {
  const html = withExportTarget(target, generateSignaturePreview);
  const note = (EXPORT_TARGETS.find(t => t.id === (target || '')) || EXPORT_TARGETS[0]).label;
  return `<!-- Sign Vel signature — ${note} -->\n${html}`;
}

// ═══════════════════════════════════════
// Copy & Export
// ═══════════════════════════════════════
// Puts the markup on the clipboard as markup, rather than copying a rendered
// selection. Selecting a node and calling execCommand('copy') hands WebKit a
// DOM fragment, and what it serialises is the *computed* style — so the
// editor's own page background came along with it and every Mac paste arrived
// on a lilac ground. It also serialises images from what it has rendered, and
// the element here is filled and copied in one tick, so a remote logo has not
// loaded yet and is dropped.
//
// ClipboardItem has neither problem: these exact bytes are what lands. It
// needs a secure context and the user gesture that is already in hand, so it
// is called straight from the click without awaiting anything first — an await
// would spend the activation and the write would be refused.
function copySignature() {
  // Written for whichever target the toolbar has chosen, so pasting straight
  // into Outlook carries the same markup the export dialog would hand over.
  const html = withExportTarget(currentTarget(), generateSignaturePreview);

  if (navigator.clipboard && window.ClipboardItem) {
    const item = new ClipboardItem({
      'text/html': new Blob([html], {type: 'text/html'}),
      'text/plain': new Blob([html], {type: 'text/plain'}),
    });
    navigator.clipboard.write([item])
      .then(() => showCopyFeedback('Copied ✓'))
      .catch(() => copyBySelection(html));
    return;
  }
  copyBySelection(html);
}

// The old path, kept for browsers without ClipboardItem. It carries the same
// background problem, so the element is given its own white ground rather than
// inheriting the editor's — wrong for a signature meant to sit on a coloured
// background, but closer than lilac, and only ever reached on old browsers.
function copyBySelection(html) {
  const el = document.createElement('div');
  el.contentEditable = 'true';
  el.innerHTML = html;
  el.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;background:#FFFFFF;';
  document.body.appendChild(el);

  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) {}

  document.body.removeChild(el);
  sel.removeAllRanges();

  if (ok) { showCopyFeedback('Copied ✓'); return; }

  navigator.clipboard.writeText(html)
    .then(() => showCopyFeedback('Copied ✓'))
    .catch(() => showCopyFeedback('Blocked — use Export HTML'));
}

function showCopyFeedback(msg) {
  const el = document.getElementById('copyFeedback');
  if (el) { el.textContent = msg; setTimeout(() => { el.textContent = ''; }, 2500); }
}

// (the chosen target is derived by currentTarget(), beside EXPORT_TARGETS,
// because the stage reads it long before this point in the file.)

// The dialog exports for the client being previewed, and says which. It used
// to offer the three targets again, which was the same choice in a second
// place — and a confusing one, since it could disagree with the tab you had
// picked. The tab is the choice; this only reports what it means.
function renderExportTargets() {
  const picker = document.getElementById('exportTargets');
  const client = previewClients.find(c => c.id === S.client) || previewClients[0];
  if (picker) picker.innerHTML = `<span class="export-for">for ${esc(client.label)}</span>`;
  const note = document.getElementById('exportNote');
  const chosen = EXPORT_TARGETS.find(t => t.id === currentTarget()) || EXPORT_TARGETS[0];
  if (note) note.textContent = chosen.note;
}

// ═══════════════════════════════════════
// Share: a link to this signature
// ═══════════════════════════════════════
// The signature travels in the link itself rather than in a database, so
// there is nothing to store, nothing to expire, and the person opening it
// needs no account — which is the whole point of sending someone a link.
//
// It rides in the fragment, after the #, which browsers never send to the
// server. A shared signature holds someone's name, address and phone number;
// keeping it out of the request means it stays out of server logs.
//
// Deflate where the browser has it, which takes a signature of some six
// thousand characters down to under two, and plain base64 where it does not.
function toBase64Url(bytes) {
  let s = '';
  bytes.forEach(b => { s += String.fromCharCode(b); });
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// What travels in a shared link: the signature's own settings, not a picture
// of it. The page at the other end draws it, which is what lets whoever opens
// it pick their own client and get markup written for that one — a finished
// drawing could only ever have been right for a single client.
//
// The editor's own furniture is left out: which tab was open, which client was
// being previewed, whether the panel was collapsed. None of that is the
// signature, and all of it would make the link longer.
const SHARE_SKIP = new Set([
  'openSection', 'panelCollapsed', 'client', 'device', 'darkMode', 'scope', 'scopeData',
]);

function shareState() {
  const out = {};
  Object.keys(S).forEach(k => {
    if (SHARE_SKIP.has(k)) return;
    const v = S[k];
    if (v === undefined || v === null) return;
    out[k] = v;
  });
  return out;
}

async function buildShareLink() {
  const raw = new TextEncoder().encode(JSON.stringify(shareState()));
  let payload, mark;
  if (window.CompressionStream) {
    try {
      const packed = new Response(
        new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))
      );
      payload = toBase64Url(new Uint8Array(await packed.arrayBuffer()));
      mark = 'z';
    } catch (e) { payload = null; }
  }
  if (!payload) { payload = toBase64Url(raw); mark = 'r'; }
  const url = new URL('share.html', location.href);
  url.hash = mark + ':' + payload;
  return url.href;
}

function showShare() {
  const overlay = document.getElementById('shareOverlay');
  const field = document.getElementById('shareUrl');
  if (!overlay || !field) return;
  field.value = 'Building the link…';
  overlay.classList.remove('hidden');
  buildShareLink().then(url => {
    field.value = url;
    field.select();
    const size = document.getElementById('shareSize');
    if (size) size.textContent = url.length.toLocaleString() + ' characters — the signature travels in the link, so nothing is stored and it never expires.';
  }).catch(() => { field.value = ''; });
}

// ═══════════════════════════════════════
// Install: pick the client, then its steps
// ═══════════════════════════════════════
// The client list used to be fifteen tabs across the top of the preview,
// which is a lot of chrome for something chosen once. It lives behind one
// button now: pick where the signature is going, and the steps for that
// client follow — with the preview and the export markup set to match.
let installPicked = '';

function renderInstall() {
  const body = document.getElementById('installBody');
  const title = document.getElementById('installTitle');
  if (!body) return;
  const client = previewClients.find(c => c.id === installPicked);

  if (!client) {
    if (title) title.textContent = 'Where is this signature going?';
    body.innerHTML = `<div class="install-grid">${previewClients.map(c =>
      `<button class="install-card${S.client === c.id ? ' current' : ''}" data-client="${c.id}">
        <span class="install-card-logo">${mailLogos[c.logo || c.id] || ''}</span>
        <span class="install-card-name">${esc(c.label)}</span>
      </button>`).join('')}</div>`;
    return;
  }

  // Chosen: the steps for that client, and the button that does the work.
  const t = installTargets.find(i => i.id === client.install);
  const steps = t ? t.steps : [
    'Open your mail client and find its signature settings.',
    'Create a signature, or edit the one you have.',
    'Paste with Ctrl+V, or Cmd+V on a Mac.',
    'Save, and send yourself a test message to check it.',
  ];
  const note = t ? t.note : 'No step-by-step for this one yet — the paste is the same everywhere, and the markup is already written for it.';
  const useExport = t && t.use === 'Export HTML';
  if (title) title.textContent = 'Install in ' + client.label;
  body.innerHTML = `
    <div class="install-steps-head">
      <span class="install-card-logo">${mailLogos[client.logo || client.id] || ''}</span>
      <div>
        <p class="install-steps-for">${esc(client.label)}${t && t.time ? ' · about ' + esc(t.time) : ''}</p>
        <p class="install-steps-note">${esc((EXPORT_TARGETS.find(x => x.id === currentTarget()) || EXPORT_TARGETS[0]).note)}</p>
      </div>
    </div>
    <ol class="install-steps">${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    <p class="install-steps-note">${esc(note)}</p>
    <div class="install-actions">
      <button class="btn" id="installBack">Choose another client</button>
      <button class="btn btn-accent" id="installCopy">${useExport ? 'Export HTML' : 'Copy signature'}</button>
    </div>`;
}

function showInstall(picked) {
  installPicked = picked || '';
  renderInstall();
  const overlay = document.getElementById('installOverlay');
  if (overlay) overlay.classList.remove('hidden');
}

function showExport() {
  renderExportTargets();
  $exportCode.textContent = generateExportHTML(currentTarget());
  $exportOverlay.classList.remove('hidden');
}

// ═══════════════════════════════════════
// Event delegation
// ═══════════════════════════════════════
function setupEvents() {
  // Header events
  $header.addEventListener('click', e => {
    if (e.target.closest('#panelCollapseBtn')) {
      S.panelCollapsed = !S.panelCollapsed;
      syncBodyClass();
      renderHeader();
      return;
    }
    if (e.target.closest('#resetBtn')) {
      if (confirm('Clear your saved signature settings and start over from the defaults?')) resetState();
      return;
    }
    if (e.target.closest('#signInBtn')) { location.href = 'signin.html'; return; }
    if (e.target.closest('#signOutBtn')) {
      Cloud.signOut().then(() => { renderHeader(); showCopyFeedback('Signed out'); });
      return;
    }
    if (e.target.closest('#shareBtn')) { showShare(); return; }
    if (e.target.closest('#copyBtn')) { copySignature(); return; }
    if (e.target.closest('#exportBtn')) { showExport(); return; }
  });

  $header.addEventListener('change', e => {
    if (e.target.id === 'scopeSelect') {
      applyScope(e.target.value);
      renderHeader();
      renderPanel();
      renderStage();
    }
  });

  // Rail navigation
  document.getElementById('rail').addEventListener('click', e => {
    const item = e.target.closest('[data-goto]');
    if (!item) return;
    S.openSection = parseInt(item.dataset.goto);
    // Picking a section while the panel is hidden should bring it back —
    // otherwise the click looks like it did nothing.
    if (S.panelCollapsed) {
      S.panelCollapsed = false;
      syncBodyClass();
      renderHeader();
    }
    renderPanel();
  });

  // Panel events
  $panel.addEventListener('click', e => {
    // Leave form controls alone — they carry data-action for the input/change
    // listeners, and re-rendering the panel on click would swap the element out
    // from under the user: a file input loses its dialog result, a text input
    // loses focus and caret position mid-edit.
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    const fileLabel = e.target.closest('label');
    if (fileLabel && fileLabel.querySelector('input[type=file]')) return;

    // Locked sections are dimmed and pointer-events:none in CSS; this also blocks
    // anything that reaches them by keyboard or synthetic event.
    if (e.target.closest('.sheet-body.locked')) return;


    // Template card
    const tmplCard = e.target.closest('[data-tmpl]');
    if (tmplCard) {
      S.template = tmplCard.dataset.tmpl;
      // Corporate is the brand signature and keeps its own colours; every other
      // layout was drawn against a palette, and looks wrong without it.
      if (S.matchTemplateTheme) applyTemplateTheme(S.template);
      renderPanel(); renderStage(); return;
    }

    // Toggle groups with data-val. Must be checked BEFORE the generic [data-action]
    // lookup below: the action lives on the wrapping .toggle-group, so closest()
    // would match the wrapper and swallow the click.
    const tgBtn = e.target.closest('.toggle-group button[data-val]');
    if (tgBtn) {
      const group = tgBtn.closest('.toggle-group');
      const val = tgBtn.dataset.val;
      switch (group.dataset.action) {
        case 'alignment':       S.alignment = val; break;
        case 'fontWeight':      S.fontWeight = val; break;
        case 'headshotShape':   S.headshotShape = val; break;
        case 'photoAlign':      S.photoAlign = val; break;
        case 'logoAlign':       S.logoAlign = val; break;
        case 'ctaStyle':        S.ctaStyle = val; break;
        case 'contactIconMode': S.contactIconMode = val; break;
        case 'roleStyle':       S.roleStyle = val; break;
        case 'contactColumns':  S.contactColumns = parseInt(val); break;
        default: break;
      }
      renderPanel();
      renderStage();
      return;
    }

    // Toggle switches
    const togAction = e.target.closest('[data-action]');
    if (togAction) {
      const action = togAction.dataset.action;
      switch(action) {
        case 'toggleDivider': S.dividerEnabled = !S.dividerEnabled; break;
        case 'toggleContactIcons': S.showContactIcons = !S.showContactIcons; break;
        case 'toggleBg': S.bgEnabled = !S.bgEnabled; break;
        case 'toggleMatchTheme': S.matchTemplateTheme = !S.matchTemplateTheme; break;
        case 'toggleNameCaps': S.nameUppercase = !S.nameUppercase; break;
        case 'applyTheme': applyTemplateTheme(S.template); break;
        case 'sampleHeadshot':
          S.headshotUrl = togAction.dataset.url;
          S.headshotName = togAction.dataset.label + ' (sample)';
          S.uploadError = ''; S.storageError = '';
          break;
        case 'togglePicker':
          PICKER.key = PICKER.key === togAction.dataset.key ? null : togAction.dataset.key;
          break;
        case 'toggleRow':
          // One open at a time, so the panel cannot creep back to being a wall
          // of controls by opening them one by one.
          OPENROW.key = OPENROW.key === togAction.dataset.row ? null : togAction.dataset.row;
          break;
        case 'useSample': {
          const kind = togAction.dataset.kind;
          if (kind === 'logo') { S.logoUrl = DEFAULT_LOGO_URL; S.logoName = 'Sample logo'; }
          else { S.headshotUrl = DEFAULT_HEADSHOT_URL; S.headshotName = 'Sample portrait'; }
          S.uploadError = ''; S.storageError = '';
          break;
        }
        case 'sampleBanner': S.bannerImage = togAction.dataset.url; break;
        case 'bgColorPreset': S.bgColor = togAction.dataset.color; break;
        case 'toggleBanner': S.bannerEnabled = !S.bannerEnabled; break;
        case 'toggleDisclaimer': S.disclaimerEnabled = !S.disclaimerEnabled; break;
        case 'toggleContact': {
          const i = parseInt(togAction.dataset.idx);
          S.contactFields[i].enabled = !S.contactFields[i].enabled;
          break;
        }
        case 'toggleSocial': {
          const i = parseInt(togAction.dataset.idx);
          S.socialLinks[i].enabled = !S.socialLinks[i].enabled;
          break;
        }
        case 'moveContactUp': {
          const i = parseInt(togAction.dataset.idx);
          if (i > 0) [S.contactFields[i-1], S.contactFields[i]] = [S.contactFields[i], S.contactFields[i-1]];
          break;
        }
        case 'moveContactDown': {
          const i = parseInt(togAction.dataset.idx);
          if (i < S.contactFields.length-1) [S.contactFields[i], S.contactFields[i+1]] = [S.contactFields[i+1], S.contactFields[i]];
          break;
        }
        case 'removeContact': {
          const i = parseInt(togAction.dataset.idx);
          S.contactFields.splice(i, 1);
          break;
        }
        case 'addContact': {
          const type = togAction.dataset.type;
          const labels = {phone:'Phone',office:'Office',pronouns:'Pronouns',booking:'Booking'};
          S.contactFields.push({type, label:labels[type], value:'', enabled:true, removable:true});
          break;
        }
        case 'moveSocialUp': {
          const i = parseInt(togAction.dataset.idx);
          if (i > 0) [S.socialLinks[i-1], S.socialLinks[i]] = [S.socialLinks[i], S.socialLinks[i-1]];
          break;
        }
        case 'moveSocialDown': {
          const i = parseInt(togAction.dataset.idx);
          if (i < S.socialLinks.length-1) [S.socialLinks[i], S.socialLinks[i+1]] = [S.socialLinks[i+1], S.socialLinks[i]];
          break;
        }
        case 'textColor': S.textColor = togAction.dataset.color; break;
        case 'accentColor': setAccent(togAction.dataset.color); break;
        case 'removeLogo': S.logoUrl = null; S.logoName = ''; S.uploadError = ''; break;
        case 'removeHeadshot': S.headshotUrl = null; S.headshotName = ''; S.uploadError = ''; break;
        case 'disclaimerPreset': {
          S.disclaimerPreset = togAction.dataset.val;
          S.disclaimerText = disclaimerPresets[S.disclaimerPreset];
          break;
        }
        case 'socialStyle': S.socialStyle = togAction.dataset.val; break;
        case 'rolloutLock': S.rolloutLocks[togAction.dataset.key] = togAction.dataset.val; break;
        case 'installTarget': S.installTarget = togAction.dataset.val; break;
        default: break;
      }
      renderPanel();
      renderStage();
      return;
    }

  });

  // Panel input events (sliders, text inputs, selects)
  $panel.addEventListener('input', e => {
    if (e.target.closest('.sheet-body.locked')) return;
    const bind = e.target.dataset.bind;
    if (bind) {
      if (e.target.type === 'range') {
        S[bind] = parseInt(e.target.value);
        const valSpan = e.target.nextElementSibling;
        if (valSpan) valSpan.textContent = sliderLabel(bind, S[bind]);
      } else if (e.target.tagName === 'SELECT') {
        S[bind] = e.target.value;
      } else if (e.target.tagName === 'TEXTAREA') {
        S[bind] = e.target.value;
        // update char count
        const cc = e.target.parentElement.querySelector('.char-count');
        if (cc) cc.textContent = e.target.value.length + ' chars';
      } else if (bind === 'accentColor') {
        setAccent(e.target.value);
      } else {
        S[bind] = e.target.value;
      }
      renderStage();
      dropStockNote();
    }

    // ── Colour picker ──
    // Both of these write the colour and repaint the picker by hand rather
    // than re-rendering the panel: a full render would replace the slider
    // mid-drag and the field mid-keystroke.
    if (e.target.dataset.action === 'pickerHue') {
      const key = e.target.dataset.key;
      const cur = hexToHsv(S[key] || '#000000');
      // A colour with no saturation has no hue to move, and one at zero value
      // is black whatever the hue — so dragging the bar would do nothing at
      // all. Lift both to something visible, which is what the bar implies.
      const hex = hsvToHex(Number(e.target.value), cur.s || 85, cur.v || 90);
      applyColor(key, hex);
      paintPicker(key, hex);
      dropStockNote();
    }
    if (e.target.dataset.action === 'pickerHex') {
      const key = e.target.dataset.key;
      const typed = e.target.value.trim();
      // Only once it is a colour. Repainting on every keystroke would fight
      // whoever is halfway through typing one.
      if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(typed)) {
        const rgb = hexToRgb(typed);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        applyColor(key, hex);
        paintPicker(key, hex);
        dropStockNote();
      }
    }

    // Contact field editing
    if (e.target.dataset.action === 'editContact') {
      const i = parseInt(e.target.dataset.idx);
      S.contactFields[i].value = e.target.value;
      renderStage();
      dropStockNote();
    }
    // Social handle editing
    if (e.target.dataset.action === 'editSocial') {
      const i = parseInt(e.target.dataset.idx);
      S.socialLinks[i].handle = e.target.value;
      renderStage();
    }
  });

  // The "these are sample details" note stops being true the moment anything
  // is typed over. Removing just that element beats re-rendering the panel,
  // which would pull the input out from under the caret mid-word.
  function dropStockNote() {
    const note = $panel.querySelector('#stockNote');
    if (note && !identityIsStock()) note.remove();
  }

  // File uploads
  $panel.addEventListener('change', e => {
    if (e.target.closest('.sheet-body.locked')) return;
    const upAction = e.target.dataset.action;
    if ((upAction === 'logoUpload' || upAction === 'headshotUpload') && e.target.files[0]) {
      acceptUpload(upAction, e.target.files[0]);
      return;
    }

    // Also handle select changes with data-bind
    const bind = e.target.dataset.bind;
    if (bind && e.target.tagName === 'SELECT') {
      S[bind] = e.target.value;
      renderStage();
    }
  });

  // ── Dragging in the saturation square ──
  // Pointer events rather than mouse: the panel is used on tablets, and
  // setPointerCapture is what keeps a drag alive when the finger or cursor
  // leaves the square, which is exactly what happens when you push into a
  // corner to reach pure white or full saturation.
  $panel.addEventListener('pointerdown', e => {
    const sv = e.target.closest('.picker-sv');
    if (!sv) return;
    e.preventDefault();
    const key = sv.dataset.key;
    const move = (ev) => {
      const r = sv.getBoundingClientRect();
      const s = Math.max(0, Math.min(100, ((ev.clientX - r.left) / r.width) * 100));
      const v = Math.max(0, Math.min(100, 100 - ((ev.clientY - r.top) / r.height) * 100));
      const hue = hexToHsv(S[key] || '#000000').h;
      const hex = hsvToHex(hue, s, v);
      applyColor(key, hex);
      paintPicker(key, hex);
    };
    const up = () => {
      sv.removeEventListener('pointermove', move);
      sv.removeEventListener('pointerup', up);
      sv.removeEventListener('pointercancel', up);
      dropStockNote();
      // Re-rendered once at the end so everything the colour touches —
      // presets, swatches elsewhere — catches up.
      renderPanel();
    };
    sv.setPointerCapture(e.pointerId);
    sv.addEventListener('pointermove', move);
    sv.addEventListener('pointerup', up);
    sv.addEventListener('pointercancel', up);
    move(e);
  });

  // A click anywhere else closes the open picker. Inside it, and on the
  // swatch that opens it, are the two exceptions.
  document.addEventListener('pointerdown', e => {
    if (!PICKER.key) return;
    // A pointer event does not always land on an element — document itself has
    // no closest() — and one that lands nowhere is still a click outside.
    const t = e.target;
    if (t && t.closest && (t.closest('.picker') || t.closest('.color-swatch'))) return;
    PICKER.key = null;
    renderPanel();
  });

  // Drag & drop onto either uploader
  $panel.addEventListener('dragover', e => {
    const zone = e.target.closest('[data-drop]');
    if (!zone) return;
    e.preventDefault();
    zone.classList.add('is-dragover');
  });
  $panel.addEventListener('dragleave', e => {
    const zone = e.target.closest('[data-drop]');
    if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove('is-dragover');
  });
  $panel.addEventListener('drop', e => {
    const zone = e.target.closest('[data-drop]');
    if (!zone) return;
    e.preventDefault();
    zone.classList.remove('is-dragover');
    const file = e.dataTransfer && e.dataTransfer.files[0];
    if (file) acceptUpload(zone.dataset.drop, file);
  });

  // Share dialog. Guarded like the rest: app.js runs on pages without it.
  const shareOverlay = document.getElementById('shareOverlay');
  if (shareOverlay) {
    const closeShare = () => shareOverlay.classList.add('hidden');
    document.getElementById('shareClose').addEventListener('click', closeShare);
    shareOverlay.addEventListener('click', e => {
      if (e.target === shareOverlay) { closeShare(); return; }
      const open = e.target.closest('#shareOpen');
      if (open) { open.href = document.getElementById('shareUrl').value || '#'; return; }
      if (!e.target.closest('#shareCopyLink')) return;
      const btn = e.target.closest('#shareCopyLink');
      const url = document.getElementById('shareUrl').value;
      const said = (t) => { btn.textContent = t; setTimeout(() => { btn.textContent = 'Copy link'; }, 2000); };
      if (!url || !navigator.clipboard || !navigator.clipboard.writeText) { said('Not available'); return; }
      navigator.clipboard.writeText(url).then(() => said('Copied ✓')).catch(() => said('Not available'));
    });
  }

  // Install picker. Guarded, because app.js is loaded by pages that have no
  // install markup at all — the check harnesses among them — and a throw here
  // takes every listener after it down with it.
  const installOverlay = document.getElementById('installOverlay');
  const installCloseBtn = document.getElementById('installClose');
  if (installCloseBtn) installCloseBtn.addEventListener('click', () => installOverlay.classList.add('hidden'));
  if (installOverlay) installOverlay.addEventListener('click', e => {
    if (e.target === installOverlay) { installOverlay.classList.add('hidden'); return; }
    const card = e.target.closest('.install-card[data-client]');
    if (card) {
      // Picking the client is what sets the target: the preview, the copy and
      // the export all follow from it, exactly as the tabs used to do.
      S.client = card.dataset.client;
      installPicked = S.client;
      renderStage();
      renderInstall();
      if (!$exportOverlay.classList.contains('hidden')) {
        renderExportTargets();
        $exportCode.textContent = generateExportHTML(currentTarget());
      }
      return;
    }
    if (e.target.closest('#installBack')) { installPicked = ''; renderInstall(); return; }
    if (e.target.closest('#installCopy')) {
      const t = installTargets.find(i => i.id === (previewClients.find(c => c.id === installPicked) || {}).install);
      if (t && t.use === 'Export HTML') { installOverlay.classList.add('hidden'); showExport(); return; }
      copySignature();
      const btn = e.target.closest('#installCopy');
      btn.textContent = 'Copied ✓';
      setTimeout(() => { btn.textContent = 'Copy signature'; }, 2000);
      return;
    }
  });

  // Stage events
  $stage.addEventListener('click', e => {
    if (e.target.closest('#installBtn')) { showInstall(); return; }
    const deviceBtn = e.target.closest('#deviceTabs button');
    if (deviceBtn) { S.device = deviceBtn.dataset.device; renderStage(); return; }
    const darkToggle = e.target.closest('[data-action="toggleDark"]');
    if (darkToggle) { S.darkMode = !S.darkMode; renderStage(); return; }
  });


  // Export overlay
  document.getElementById('exportClose').addEventListener('click', () => { $exportOverlay.classList.add('hidden'); });

  $exportOverlay.addEventListener('click', e => { if (e.target === $exportOverlay) $exportOverlay.classList.add('hidden'); });
  document.getElementById('exportCopyBtn').addEventListener('click', () => {
    const text = $exportCode.textContent;
    navigator.clipboard.writeText(text).then(() => {
      document.getElementById('exportCopyBtn').textContent = 'Copied ✓';
      setTimeout(() => { document.getElementById('exportCopyBtn').textContent = 'Copy HTML'; }, 2000);
    });
  });
}

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════
function syncBodyClass() {
  let cls = 'body';
  if (S.panelCollapsed) cls += ' panel-collapsed';
  $body.className = cls;
}

// ═══════════════════════════════════════
// Cloud sync
// ═══════════════════════════════════════
// Signing in and creating an account are pages now — signin.html, signup.html
// and reset.html, driven by auth.js. They used to be a modal here, which put
// the only way into the product inside the product: the editor is locked to
// account holders, so the panel floated over an application the visitor had
// never been allowed to see.
//

// What remains on this side is the lock itself.
// Push the local state up. Debounced separately from the localStorage save so
// typing does not fire a request per keystroke.
let cloudTimer = null;
function scheduleCloudSave() {
  if (!window.Cloud || !Cloud.isReady || !Cloud.state().signedIn) return;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(() => {
    const persist = {};
    Object.keys(S).forEach(k => { if (!TRANSIENT_KEYS.includes(k)) persist[k] = S[k]; });
    Cloud.saveSignature(persist, S.name);
  }, 1500);
}

// Called once the session resolves. A stored signature wins over whatever
// localStorage had, because the account is the source of truth across devices.
function adoptCloudState(row) {
  if (!row || !row.state) return false;
  Object.keys(row.state).forEach(k => {
    if (Object.prototype.hasOwnProperty.call(S, k) && !TRANSIENT_KEYS.includes(k)) S[k] = row.state[k];
  });
  // Same reason as in loadState: a signature saved to the account before a
  // platform existed has a social list that predates it, and a headshot that
  // was never chosen should follow the default rather than pin it.
  ensureSocialCatalogue();
  ensureDefaultPortrait();
  ensureDefaultLogo();
  ensureDefaultBanner();
  return true;
}

// ── The editor is for account holders ──────────────────────
// Locked until a session is confirmed. The lock is applied synchronously in
// init(), before anything renders, so the editor never flashes on screen for
// someone who is not signed in.
//
// Where no cloud is configured there is no account to hold, so nothing locks —
// a local checkout and a self-hosted copy both stay usable.
let authRequired = false;

// Leaving rather than overlaying. ?next= brings them back here once there is
// a session, so a bookmark straight to the editor still ends up at the editor.
// replace() rather than assign() keeps the locked editor out of the back
// stack: pressing Back from the sign-in page should reach wherever they came
// from, not bounce off this redirect again.
// init() sets authRequired before the session resolves, to keep the editor
// off screen while the answer is still in flight. So the guard against
// redirecting twice needs a flag of its own — reusing authRequired here
// would make this a no-op every time, and nobody would ever leave.
let leavingForSignIn = false;

function lockEditor() {
  authRequired = true;
  document.body.classList.add('app-locked');
  if (leavingForSignIn) return;
  leavingForSignIn = true;
  // A seam for tools/gate-check.html, which has to see where this goes without
  // the harness navigating away in the middle of its own assertions.
  (window.__navigate || function (u) { location.replace(u); })('signin.html?next=editor.html');
}

function unlockEditor() {
  authRequired = false;
  document.body.classList.remove('app-locked');
}

function startCloud() {
  if (!window.Cloud || !Cloud.isReady) return;
  // The rail has to redraw too: the Admin button appears and disappears with
  // the signed-in profile, and signing out must take its contents with it.
  //
  // So does the panel. is_admin is not known at boot — the profile arrives one
  // request later — so the first panel is always drawn as a non-admin, and
  // anything an admin gets is missing from it. The rail redrew and the panel
  // did not, so the Admin entry appeared while the admin portrait in Media
  // silently did not, and clicking away and back was the only cure.
  let lastAdmin = isAdmin();
  Cloud.onChange(() => {
    const c = Cloud.state();
    // Signing out has to close the editor behind you, not leave it open.
    if (!c.signedIn) { lockEditor(); }
    else if (authRequired) { unlockEditor(); }

    const nowAdmin = isAdmin();
    const adminChanged = nowAdmin !== lastAdmin;
    lastAdmin = nowAdmin;

    if (!nowAdmin && sections[S.openSection] && sections[S.openSection].adminOnly) {
      S.openSection = 0;
      renderPanel();
    } else if (adminChanged) {
      renderPanel();
    }
    renderHeader();
    renderRail();
  });
  Cloud.init().then(c => {
    renderHeader();
    if (!c.signedIn) { lockEditor(); return; }
    unlockEditor();
    return Cloud.loadSignature().then(row => {
      if (adoptCloudState(row)) {
        if (!(S.openSection >= 0 && S.openSection < sections.length)) S.openSection = 0;
        renderPanel();
        renderStage();
        showCopyFeedback('Loaded from account');
      } else {
        // First sign-in on this account: keep what is on screen and store it.
        scheduleCloudSave();
      }
    });
  });
}

// ═══════════════════════════════════════
// Persistence
// ═══════════════════════════════════════
const STORAGE_KEY = 'signature-studio-v1';
// Transient UI state — recomputed each session, never written to storage.
const TRANSIENT_KEYS = ['uploadError', 'storageError'];

function saveState() {
  try {
    const persist = {};
    Object.keys(S).forEach(k => { if (!TRANSIENT_KEYS.includes(k)) persist[k] = S[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
    if (S.storageError) { S.storageError = ''; renderPanel(); }
  } catch (e) {
    // Quota is the likely cause: a 1MB upload becomes ~1.4MB of base64.
    const msg = 'Could not save your settings — the uploaded image is too large for browser storage. Use an image URL instead to keep it between visits.';
    if (S.storageError !== msg) { S.storageError = msg; renderPanel(); }
  }
}

let saveTimer = null;
function scheduleSave() {
  // Renders fire on every keystroke; stringifying a data URI that often is slow.
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 400);
}

// Local save and cloud push are debounced independently: 400ms is right for
// localStorage, far too chatty for a network round trip.
function scheduleAllSaves() {
  scheduleSave();
  scheduleCloudSave();
}

function loadState() {
  let saved;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    saved = JSON.parse(raw);
  } catch (e) {
    return; // unavailable or corrupt — fall back to defaults
  }
  if (!saved || typeof saved !== 'object') return;
  // Copy only keys the current build knows about, so a newer app version keeps
  // its own defaults for anything added since this state was written.
  Object.keys(saved).forEach(k => {
    if (Object.prototype.hasOwnProperty.call(S, k) && !TRANSIENT_KEYS.includes(k)) S[k] = saved[k];
  });

  // One-time migration. Earlier builds shipped with three sections pre-locked
  // and nothing enforcing it, so a saved copy of that value was never a real
  // choice by the user — clear it rather than suddenly blocking their panel.
  const L = S.rolloutLocks;
  if (L && L.typography === 'locked' && L.disclaimer === 'locked' && L.banner === 'locked') {
    S.rolloutLocks = {
      typography:'editable', disclaimer:'editable', banner:'editable',
      contactFields: L.contactFields || 'editable',
    };
  }

  // Three early layouts were replaced by the designs that superseded them.
  // Without this, a saved state naming one of them falls through the template
  // chain and silently lands on Minimal — which looks like the editor lost
  // their signature. Point each at its closest replacement instead, and load
  // that layout's design so it arrives looking finished.
  const retired = {'side-by-side':'connect', stacked:'brandmark', card:'labelled'};
  if (retired[S.template]) {
    S.template = retired[S.template];
    if (S.matchTemplateTheme) applyTemplateTheme(S.template);
  }
  // Scopes carry their own template, and can strand the same retired names.
  Object.keys(S.scopeData || {}).forEach(k => {
    const d = S.scopeData[k];
    if (d && retired[d.template]) d.template = retired[d.template];
  });

  // A saved social list is whatever the catalogue held the day it was written.
  ensureSocialCatalogue();
  // And a saved headshot or logo may be the default from a day when the
  // default was something else.
  ensureDefaultPortrait();
  ensureDefaultLogo();
  ensureDefaultBanner();
}

function resetState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  location.reload();
}

// ═══════════════════════════════════════
// Helpers
// ═══════════════════════════════════════
function esc(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Data URIs inflate the source bytes by ~33%, and oversized logos bloat every
// signature they end up in, so cap the input well below any client limit.
const MAX_UPLOAD_BYTES = 1024 * 1024;        // signed out: must fit localStorage
const MAX_HOSTED_BYTES = 5 * 1024 * 1024;    // signed in: goes to Storage

function acceptUpload(action, file) {
  const kind = action === 'logoUpload' ? 'logo' : 'headshot';
  S.uploadError = '';

  if (!file.type || !file.type.startsWith('image/')) {
    S.uploadError = `“${file.name}” is not an image file.`;
    renderPanel();
    return;
  }
  // Signed in, the file goes to Storage and the size cap is generous. Signed
  // out it has to live in localStorage as a data URI, which is why the local
  // cap is so much tighter.
  const hosted = !!(window.Cloud && Cloud.isReady && Cloud.state().signedIn);
  const cap = hosted ? MAX_HOSTED_BYTES : MAX_UPLOAD_BYTES;
  if (file.size > cap) {
    S.uploadError = `“${file.name}” is ${(file.size / 1048576).toFixed(1)} MB — the limit is ${cap / 1048576} MB${hosted ? '.' : ' while signed out. Sign in to host larger images.'}`;
    renderPanel();
    return;
  }

  // Local copy first: it shows instantly and is the fallback if the upload
  // fails, so the editor never sits there with nothing to preview.
  const useLocalCopy = (after) => readFile(file, (url) => {
    if (url) { S[kind + 'Url'] = url; S[kind + 'Name'] = file.name; }
    else { S.uploadError = `Could not read “${file.name}”. Try another file.`; }
    if (after) after();
    renderPanel();
    renderStage();
  });

  if (!hosted) { useLocalCopy(); return; }

  S[kind + 'Name'] = 'Uploading…';
  renderPanel();
  Cloud.uploadAsset(file, kind).then((r) => {
    if (r.ok) {
      S[kind + 'Url'] = r.url;      // a real https URL — survives being emailed
      S[kind + 'Name'] = file.name;
      S.uploadError = '';
      renderPanel();
      renderStage();
    } else {
      useLocalCopy(() => {
        S.uploadError = `Upload failed (${r.error}). Using a local copy — it will preview fine but break when sent.`;
      });
    }
  });
}

function readFile(file, cb) {
  const r = new FileReader();
  r.onload = () => cb(r.result);
  r.onerror = () => cb(null);
  r.readAsDataURL(file);
}

// ═══════════════════════════════════════
// Init
// ═══════════════════════════════════════
function init() {
  // A page that only needs the drawing — the shared-link page — says so
  // before loading this file. None of the editor exists there: no rail, no
  // panel, no saved state of its own, and above all no sign-in gate, because
  // the whole point of a shared link is that the person opening it has no
  // account. It takes the render functions and nothing else.
  if (window.SIGNVEL_MODE === 'share') return;
  loadState();
  if (!(S.openSection >= 0 && S.openSection < sections.length)) S.openSection = 0;
  // Locked before the first render, not after the session resolves — otherwise
  // the editor is briefly on screen for someone who is not signed in. The
  // session check below either confirms it or lifts it.
  if (window.Cloud && Cloud.isReady) {
    authRequired = true;
    document.body.classList.add('app-locked');
  }
  syncBodyClass(); // apply a collapsed state restored from storage
  renderRail();
  renderHeader();
  renderPanel();
  renderStage();
  setupEvents();
  startCloud();
}

init();
