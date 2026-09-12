/* ═══════════════════════════════════════════════════════════
   Signature Studio — app.js
   Full single-page email-signature editor
   ═══════════════════════════════════════════════════════════ */

// ───────────── SVG Icons ─────────────
const icons = {
  // Signvel brand mark — editor chrome only, never used inside a signature.
  logo: `<svg width="34" height="14.3" viewBox="0 0 88 37" aria-hidden="true"><defs><linearGradient id="sv-editor-grad" x1="0" x2="1"><stop offset="0" stop-color="#5B2EFF"/><stop offset="1" stop-color="#00E5A0"/></linearGradient></defs><path d="M8 22c7-16 12-21 16-19 5 2 3 18 7 19s8-13 13-13 4 13 15 9" fill="none" stroke="url(#sv-editor-grad)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="76" cy="27" r="5" fill="#9D4EDD"/></svg>`,
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
};

// Single-letter prefixes for the 'letters' display mode: E: M: T: A:
const contactLetters = {email:'E',mobile:'M',phone:'T',address:'A',website:'W',office:'O',pronouns:'P',booking:'B'};

// ───────────── Demo logo ─────────────
// The stock logo that ships as the default. Recognising it is what lets the
// generator tell "the user picked this" apart from "nobody has chosen yet".
const DEFAULT_LOGO_URL = 'https://alriyady.ae/wp-content/uploads/2023/10/Al-Riyady-Corporate-Services-Proerties-Logo-400x163.png';

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
  editorial:  {accent:'#C8B99C', accent2:'#F5F1E6', panel:'#1E2B4D', social:'circle', icons:'icons', cols:2, role:'plain', caps:true, track:10, shape:'square', heading:'Georgia'},
  grid:       {accent:'#3FCF8E', accent2:'#111614', panel:'#0D0F0E', social:'filled', icons:'labels', cols:2, role:'caps', caps:false, track:-1, shape:'circle'},
  feature:    {accent:'#8FCBFF', accent2:'#0E4FA8', panel:'#1668D8', social:'filled', icons:'icons', cols:2, role:'pill', caps:false, track:0, shape:'circle', ring:4},
  minimal:    {accent:'#475569', accent2:'#1F2937', panel:null, social:'plain',  icons:'icons',   cols:1, role:'plain', caps:false, track:0},
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

const sampleBanners = [
  {id:'b1', label:'Travel',  url:'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1040&h=260&fit=crop'},
  {id:'b2', label:'Desk',    url:'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1040&h=260&fit=crop'},
  {id:'b3', label:'Team',    url:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1040&h=260&fit=crop'},
  {id:'b4', label:'Meeting', url:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1040&h=260&fit=crop'},
];

const DEFAULT_HEADSHOT_URL = sampleHeadshots[0].url;

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
// Signvel's own brand. The layouts double as the product's showcase, so the
// mark, company and links they preview with are Signvel's — the generated
// monogram picks the company name up from here, which is what puts "SV ·
// Signvel" in each layout's theme colour rather than a placeholder.
//
// The person is a stand-in, deliberately. These details sit on sixteen demo
// layouts and on the public showcase page, and a real name, mobile and street
// address do not belong there.
const SAMPLE_IDENTITY = {
  name: 'Daniel Reyes',
  title: 'Head of Partnerships',
  company: 'Signvel',
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

// The sample identity that shipped before the layouts carried Signvel branding.
// Saved state holding it is still a copy of the demo, so it has to keep
// counting as stock — otherwise anyone who opened the editor while that set
// was live gets Northwind Studio frozen onto every layout.
// The Signvel-branded sample that preceded the current one, retired when the
// demo portrait changed and the name had to follow it.
const LEGACY_SIGNVEL_IDENTITY = {
  name: 'Elena Marsh',
  title: 'Head of Partnerships',
  company: 'Signvel',
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
const socialIcons = {linkedin:icons.linkedin,x:icons.x,instagram:icons.instagram,youtube:icons.youtube,facebook:icons.facebook,tiktok:icons.tiktok};

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
  mobile: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#fff"/><rect x="7.5" y="3.4" width="9" height="17.2" rx="2.4" fill="none" stroke="#6B6880" stroke-width="1.7"/><path d="M10.6 17.8h2.8" stroke="#6B6880" stroke-width="1.7" stroke-linecap="round"/></svg>`,
};

// ───────────── Disclaimer presets ─────────────
const disclaimerPresets = {
  standard: 'This email and any attachments are confidential and intended solely for the addressee. If you have received this email in error, please notify the sender immediately and delete this email.',
  short: 'This email is confidential. If received in error, please delete and notify the sender.',
  regulated: 'This email and any attachments are confidential and may be legally privileged. Any unauthorized use, disclosure, or distribution is strictly prohibited. If you are not the intended recipient, please contact the sender immediately and delete all copies. This communication does not constitute legal, financial, or professional advice.',
};

// ───────────── Compatibility notes ─────────────
const compatNotes = {
  gmail:       {icon:'ℹ', text:'Gmail strips background images and clips messages over ~102KB.', warning:false},
  outlook:     {icon:'⚠', text:'Outlook renders through Word — no border-radius, and inline SVG does not display.', warning:true},
  apple:       {icon:'✓', text:'Apple Mail has the best rendering engine — full CSS support.', warning:false},
  yahoo:       {icon:'⚠', text:'Yahoo Mail drops <style> blocks — only inline styles survive.', warning:true},
  thunderbird: {icon:'✓', text:'Thunderbird uses Gecko — strong CSS support, close to a browser.', warning:false},
  proton:      {icon:'ℹ', text:'Proton Mail sanitises remote content; images may need approval per sender.', warning:false},
  mobile:      {icon:'ℹ', text:'Responsive rendering varies by client and OS version.', warning:false},
};

// Preview tabs, in the order they appear above the stage.
const previewClients = [
  {id:'gmail',       label:'Gmail'},
  {id:'outlook',     label:'Outlook'},
  {id:'apple',       label:'Apple Mail'},
  {id:'yahoo',       label:'Yahoo'},
  {id:'thunderbird', label:'Thunderbird'},
  {id:'proton',      label:'Proton'},
  {id:'mobile',      label:'Mobile'},
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
  // Served from alriyady.ae, so it is already a public URL — the one form that
  // survives being emailed. Kept in sync with DEFAULT_LOGO_URL, which is how the
  // generator knows this is still the stock logo and not one the user chose.
  logoUrl: DEFAULT_LOGO_URL,
  logoName: 'Al Riyady Group',
  logoHeight: 40,

  // A sample portrait ships by default so the photo layouts look like the
  // designs they were drawn from before anyone uploads anything.
  headshotUrl: DEFAULT_HEADSHOT_URL,
  headshotName: 'Sample portrait',
  headshotShape: 'circle',
  headshotZoom: 100,
  // Ring drawn around the portrait. 0 is no ring.
  photoRing: 0,
  photoRingColor: '#FFFFFF',
  // 0 follows the per-template default; anything else overrides it.
  headshotSize: 0,

  uploadError: '',
  storageError: '',

  // Admin figures. Transient — they come from the server on request and a
  // saved copy would only ever be shown out of date.
  adminStats: null,
  adminError: '',
  adminLoading: false,
  adminUsers: null,
  adminUsersLoading: false,
  adminBusy: '',

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
  socialLinks: [
    {type:'facebook',  label:'Facebook',  handle:SAMPLE_IDENTITY.socials.facebook,  enabled:true},
    {type:'linkedin',  label:'LinkedIn',  handle:SAMPLE_IDENTITY.socials.linkedin,  enabled:true},
    {type:'instagram', label:'Instagram', handle:SAMPLE_IDENTITY.socials.instagram, enabled:true},
    {type:'youtube',   label:'YouTube',   handle:SAMPLE_IDENTITY.socials.youtube,   enabled:true},
    {type:'tiktok',    label:'TikTok',    handle:SAMPLE_IDENTITY.socials.tiktok,    enabled:true},
    {type:'x',         label:'X',         handle:'',            enabled:false},
  ],

  bannerEnabled: false,
  bannerMessage: '',
  bannerSubtext: '',
  bannerImage: '',
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

// Short status line shown at the right of each section header.
function sectionMeta(id) {
  switch (id) {
    case 'templates':  return `${S.template} · ${S.alignment}`;
    case 'design':     return `${S.font} · ${S.bodySize}px`;
    case 'media':      return `${S.logoUrl?'Logo':'No logo'} · ${S.headshotUrl?'Photo':'Initials'}`;
    case 'contacts':   return `${S.contactFields.filter(f=>f.enabled && f.value).length} of ${S.contactFields.length} shown`;
    case 'social':     return `${S.socialLinks.filter(s=>s.enabled).length} active`;
    case 'banner':     return S.bannerEnabled ? 'Banner on' : 'Banner off';
    case 'disclaimer': return S.disclaimerEnabled ? `${S.disclaimerText.length} chars` : 'Hidden';
    case 'rollout':    return `${Object.values(S.rolloutLocks).filter(v=>v==='locked').length} locked`;
    default: return '';
  }
}

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

// Who has signed up, and what each of them is on.
function loadAdminUsers() {
  if (S.adminUsersLoading || !isAdmin()) return;
  S.adminUsersLoading = true;
  S.adminError = '';
  renderPanel();
  Cloud.adminUsers().then(r => {
    S.adminUsersLoading = false;
    if (r.ok) { S.adminUsers = r.users; S.adminError = ''; }
    else { S.adminError = r.error; }
    renderPanel();
  });
}

// Grants or removes paid access. The row is updated from what the server
// returns rather than from what was asked for — if the function refused, or
// clamped the value, the list shows what is actually stored.
function setUserPlan(userId, plan) {
  if (!userId || !plan || S.adminBusy || !isAdmin()) return;
  S.adminBusy = userId;
  S.adminError = '';
  renderPanel();
  Cloud.adminSetPlan(userId, plan).then(r => {
    S.adminBusy = '';
    if (r.ok && r.user && S.adminUsers) {
      S.adminUsers = S.adminUsers.map(u => u.id === r.user.id ? r.user : u);
      // The plan mix in the figures above is now out of date.
      S.adminStats = null;
    } else if (!r.ok) {
      S.adminError = r.error;
    }
    renderPanel();
  });
}

// Fetches the account figures. Guarded against a second click while one is in
// flight, since the button stays on screen during the request.
function loadAdminStats() {
  if (S.adminLoading || !isAdmin()) return;
  S.adminLoading = true;
  S.adminError = '';
  renderPanel();
  Cloud.adminStats().then(r => {
    S.adminLoading = false;
    if (r.ok) { S.adminStats = r.stats; S.adminError = ''; }
    else { S.adminError = r.error; }
    renderPanel();
  });
}

function renderRail() {
  let html = `<a class="rail-brand" href="index.html" title="Back to signvel.com home">${icons.logo}</a>
    <nav class="rail-nav">`;
  let lastCat = '';
  sections.forEach((sec, i) => {
    // Skipping rather than filtering keeps `i` equal to the real index in
    // `sections`, which is what data-goto and renderSectionContent both use.
    if (sec.adminOnly && !isAdmin()) return;
    if (sec.cat !== lastCat) {
      html += `<div class="rail-cat">${sec.cat}</div>`;
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
  const scopeLabel = S.scope === 'default' ? 'Brand default' : `${S.scope} override`;

  $panel.innerHTML = `
    <div class="sheet">
      <p class="sheet-eyebrow">${sec.cat}</p>
      <h1 class="sheet-title">${sec.title}</h1>
      <div class="sheet-status">
        <span class="status-pill${S.scope!=='default'?' is-override':''}"><span class="status-dot"></span>${esc(scopeLabel)}</span>
        <span class="status-meta">${esc(sectionMeta(sec.id))}</span>
      </div>
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
  };
}

function renderTemplates() {
  const P = tmplPreviews();
  const labels = {
    corporate:'Corporate', spotlight:'Spotlight', split:'Split', directory:'Directory',
    accentbar:'Accent bar', colorblock:'Colour block', darkcard:'Dark card', connect:'Connect bar',
    ribbon:'Ribbon', brandmark:'Brandmark', inline:'Inline', labelled:'Labelled',
    band:'Banner band', editorial:'Editorial', grid:'Grid', feature:'Feature', minimal:'Minimal',
  };
  const order = ['corporate','spotlight','split','directory','accentbar','colorblock','darkcard',
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
function colorRow(label, key) {
  return `<div class="opt-row">
    <span class="opt-label">${label}</span>
    <span class="opt-control">
      <span class="color-hex">${esc(String(S[key]).toUpperCase())}</span>
      <input type="color" class="color-input" value="${esc(S[key])}" data-bind="${key}" title="${label}">
    </span>
  </div>`;
}

// ── Shared image uploader (drop zone + preview) ──
// `kind` is 'logo' or 'headshot'; state lives at S[kind+'Url'] / S[kind+'Name'].
const UPLOAD_ACCEPT = 'image/png,image/jpeg,image/gif,image/svg+xml,image/webp';

function renderUploader(kind, hint) {
  const action = kind + 'Upload';
  const url = S[kind + 'Url'];
  const input = `<input type="file" accept="${UPLOAD_ACCEPT}" data-action="${action}" hidden>`;
  let h;
  if (url) {
    h = `<div class="uploader is-loaded" data-drop="${action}">
      <span class="uploader-thumb"><img src="${esc(url)}" alt=""></span>
      <span class="uploader-meta">
        <span class="uploader-name">${esc(S[kind + 'Name'] || 'Image loaded')}</span>
        <span class="uploader-hint">${hint}</span>
      </span>
      <label class="btn uploader-action">Replace${input}</label>
      <button class="btn uploader-action" data-action="remove${kind.charAt(0).toUpperCase()+kind.slice(1)}">Remove</button>
    </div>`;
  } else {
    h = `<label class="uploader" data-drop="${action}">
      ${input}
      <span class="uploader-icon">${icons.upload}</span>
      <span class="uploader-text">Drop an image here, or <u>browse</u></span>
      <span class="uploader-hint">${hint}</span>
    </label>`;
  }
  // The single most important thing to know about an image here: will it
  // survive being emailed? A data: URI will not.
  if (url) {
    const isHosted = /^https?:\/\//i.test(url);
    h += isHosted
      ? `<div class="asset-state is-hosted">${icons.check} Hosted — this URL works in sent mail.</div>`
      : `<div class="asset-state is-local">Local copy only. Gmail and Outlook strip embedded images, so recipients will see it broken. ${window.Cloud && Cloud.isReady && !Cloud.state().signedIn ? 'Sign in to host it.' : 'Paste a hosted URL below.'}</div>`;
  }
  if (S.uploadError) h += `<div class="uploader-error">${esc(S.uploadError)}</div>`;
  if (S.storageError) h += `<div class="uploader-error">${esc(S.storageError)}</div>`;
  // A hosted URL is both tiny to store and the only form that survives being
  // sent — email clients strip the data: URIs that uploads produce.
  const link = url && /^https?:\/\//i.test(url) ? url : '';
  h += `<div class="uploader-url">
    <span class="uploader-url-label">or paste an image URL</span>
    <input class="input" type="url" placeholder="https://example.com/logo.png" value="${esc(link)}" data-action="${kind}Url">
  </div>`;
  return h;
}

// ── Section 1: Design ──
// Every visual control in one place: type, colour, icon treatment, rules and
// spacing. The content sections keep only the values that go in the signature.
function renderDesign() {
  const fonts = ['Helvetica Neue','Georgia','Verdana','Trebuchet MS','Courier New'];
  const accents = ['#C9962B','#1F5E4E','#2B4C7E','#8B4513','#6B4E71','#5B2EFF'];
  let h = '';

  h += `<div class="opt-group">Type</div>`;
  h += `<div class="field-row"><label class="field-label">Font family</label><select class="input" data-bind="font">`;
  fonts.forEach(f => { h += `<option value="${f}"${S.font===f?' selected':''}>${f}</option>`; });
  h += `</select></div>`;
  h += `<div class="field-row"><label class="field-label">Display font<span class="field-hint">Used for the name. Falls back to the body font.</span></label><select class="input" data-bind="headingFont">`;
  h += `<option value=""${S.headingFont===''?' selected':''}>Same as body</option>`;
  fonts.forEach(f => { h += `<option value="${f}"${S.headingFont===f?' selected':''}>${f}</option>`; });
  h += `</select></div>`;
  h += `<div class="field-row"><label class="field-label">Font size</label><div class="slider-row"><input type="range" min="11" max="18" value="${S.bodySize}" data-bind="bodySize"><span class="slider-val">${S.bodySize}px</span></div></div>`;
  h += `<div class="field-row"><label class="field-label">Weight</label><div class="toggle-group" data-action="fontWeight"><button class="${S.fontWeight==='regular'?'active':''}" data-val="regular">Regular</button><button class="${S.fontWeight==='semibold'?'active':''}" data-val="semibold">Semibold</button></div></div>`;

  h += `<div class="opt-group">Name &amp; role</div>`;
  h += `<div class="field-row"><label class="field-label">Name size</label><div class="slider-row"><input type="range" min="70" max="200" step="5" value="${S.nameScale}" data-bind="nameScale"><span class="slider-val">${S.nameScale}%</span></div></div>`;
  h += `<div class="field-row"><label class="field-label">Letter spacing</label><div class="slider-row"><input type="range" min="-3" max="24" value="${S.nameTracking}" data-bind="nameTracking"><span class="slider-val">${(S.nameTracking/100).toFixed(2)}em</span></div></div>`;
  h += `<div class="opt-list"><div class="opt-row">
    <span class="opt-label">Name in capitals</span>
    <span class="opt-control"><div class="toggle-switch${S.nameUppercase?' on':''}" data-action="toggleNameCaps"></div></span>
  </div></div>`;
  h += `<div class="field-row"><label class="field-label">Role style</label><div class="toggle-group" data-action="roleStyle">
    <button class="${S.roleStyle==='plain'?'active':''}" data-val="plain">Plain</button>
    <button class="${S.roleStyle==='caps'?'active':''}" data-val="caps">Tracked</button>
    <button class="${S.roleStyle==='chip'?'active':''}" data-val="chip">Chip</button>
    <button class="${S.roleStyle==='pill'?'active':''}" data-val="pill">Pill</button>
  </div></div>`;

  h += `<div class="opt-group">Colour</div>`;
  h += `<div class="field-row"><label class="field-label">Theme presets</label><div class="swatch-row">`;
  accents.forEach(c => { h += `<div class="swatch${S.accentColor===c?' active':''}" style="background:${c}" data-color="${c}" data-action="accentColor"></div>`; });
  h += `</div></div>`;
  h += `<div class="opt-list">
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
    h += `<div class="field-row"><label class="field-label">Panel presets</label><div class="swatch-row">`;
    bgPresets.forEach(c => { h += `<div class="swatch${S.bgColor===c?' active':''}" style="background:${c}" data-color="${c}" data-action="bgColorPreset"></div>`; });
    h += `</div></div>`;
    h += `<div class="opt-list">${colorRow('Panel colour', 'bgColor')}</div>`;
    h += `<div class="field-row"><label class="field-label">Panel padding</label><div class="slider-row"><input type="range" min="0" max="48" value="${S.bgPadding}" data-bind="bgPadding"><span class="slider-val">${S.bgPadding}px</span></div></div>`;
    h += `<div class="field-row"><label class="field-label">Corner radius</label><div class="slider-row"><input type="range" min="0" max="28" value="${S.bgRadius}" data-bind="bgRadius"><span class="slider-val">${S.bgRadius}px</span></div></div>`;
    if (isDarkColor(S.bgColor)) h += `<div class="inline-note">Dark panel detected — text is switched to a light colour automatically. Your saved text colours return if you turn the panel off.</div>`;
    h += `<div class="inline-note">Solid panel colours survive in email. Background <em>images</em> do not — Gmail and Outlook strip them.</div>`;
  }

  h += `<div class="opt-group">Contact details</div>`;
  h += `<div class="field-row"><label class="field-label">Columns</label><div class="toggle-group" data-action="contactColumns">
    <button class="${S.contactColumns===1?'active':''}" data-val="1">One</button>
    <button class="${S.contactColumns===2?'active':''}" data-val="2">Two</button>
  </div></div>`;
  h += `<div class="opt-list"><div class="opt-row">
    <span class="opt-label">Show icons</span>
    <span class="opt-control"><div class="toggle-switch${S.showContactIcons?' on':''}" data-action="toggleContactIcons"></div></span>
  </div></div>`;
  if (S.showContactIcons) {
    h += `<div class="field-row"><label class="field-label">Icon type</label><div class="toggle-group" data-action="contactIconMode"><button class="${S.contactIconMode==='circle'?'active':''}" data-val="circle">Circles</button><button class="${S.contactIconMode==='filled'?'active':''}" data-val="filled">Filled</button><button class="${S.contactIconMode==='icons'?'active':''}" data-val="icons">Plain</button><button class="${S.contactIconMode==='letters'?'active':''}" data-val="letters">Letters</button><button class="${S.contactIconMode==='labels'?'active':''}" data-val="labels">Labels</button></div></div>`;
    if (S.contactIconMode !== 'labels' && S.contactIconMode !== 'letters') {
      h += `<div class="field-row"><label class="field-label">Icon size</label><div class="slider-row"><input type="range" min="14" max="34" value="${S.contactIconSize}" data-bind="contactIconSize"><span class="slider-val">${S.contactIconSize}px</span></div></div>`;
    }
  }

  h += `<div class="opt-group">Social icons</div>`;
  h += `<div class="field-row"><label class="field-label">Icon type</label><div class="chip-row">`;
  ['chip','circle','filled','plain','outline'].forEach(s => {
    h += `<button class="chip${S.socialStyle===s?' active':''}" data-action="socialStyle" data-val="${s}">${s.charAt(0).toUpperCase()+s.slice(1)}</button>`;
  });
  h += `</div></div>`;
  h += `<div class="field-row"><label class="field-label">Icon size</label><div class="slider-row"><input type="range" min="14" max="40" value="${S.socialIconSize}" data-bind="socialIconSize"><span class="slider-val">${S.socialIconSize}px</span></div></div>`;

  h += `<div class="opt-group">Lines &amp; spacing</div>`;
  h += `<div class="opt-list"><div class="opt-row">
    <span class="opt-label">Show dividing lines</span>
    <span class="opt-control"><div class="toggle-switch${S.dividerEnabled?' on':''}" data-action="toggleDivider"></div></span>
  </div></div>`;
  if (S.dividerEnabled) {
    h += `<div class="field-row"><label class="field-label">Line width</label><div class="slider-row"><input type="range" min="1" max="6" value="${S.dividerWidth}" data-bind="dividerWidth"><span class="slider-val">${S.dividerWidth}px</span></div></div>`;
  }
  h += `<div class="field-row"><label class="field-label">Block spacing</label><div class="slider-row"><input type="range" min="2" max="20" value="${S.blockSpacing}" data-bind="blockSpacing"><span class="slider-val">${S.blockSpacing}px</span></div></div>`;
  return h;
}

// ── Section 2: Logo & headshot ──
// Which layouts actually read each image. Kept beside the templates rather than
// inside the panel, because the signature builder needs the same answer.
const LOGO_TEMPLATES = ['corporate','split','directory','accentbar','colorblock','connect','ribbon','brandmark','inline','band','card'];
const PHOTO_TEMPLATES = ['spotlight','darkcard','connect','ribbon','labelled','band','editorial','grid','feature'];

function renderMedia() {
  // Not every layout has a slot for both images — say so rather than letting
  // someone upload a photo and wonder why nothing changed.
  const usesLogo = LOGO_TEMPLATES.includes(S.template);
  const usesHeadshot = PHOTO_TEMPLATES.includes(S.template);
  const notUsed = (what) => `<div class="inline-note">The <strong>${esc(S.template)}</strong> template has no ${what} slot. These settings are saved, and apply as soon as you pick a layout that uses one.</div>`;

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
  if (!usesLogo) h += notUsed('logo');
  h += `<div class="field-row">${renderUploader('logo', 'PNG or SVG with a transparent background works best. Max 1&nbsp;MB.')}</div>`;
  h += `<div class="field-row"><label class="field-label">Logo height</label><div class="slider-row"><input type="range" min="20" max="72" value="${S.logoHeight}" data-bind="logoHeight"><span class="slider-val">${S.logoHeight}px</span></div></div>`;

  h += `<div class="opt-group">Headshot</div>`;
  if (!usesHeadshot) h += notUsed('headshot');
  h += `<div class="field-row">${renderUploader('headshot', 'A square image crops best. Max 1&nbsp;MB.')}</div>`;
  // Hosted sample portraits. Picking one is the quickest way to see a photo
  // layout as it was designed, and because they are real URLs they survive
  // being emailed — unlike anything uploaded before signing in.
  h += `<div class="field-row"><label class="field-label">Sample portraits<span class="field-hint">Hosted images, safe to send. Swap in your own any time.</span></label><div class="sample-row">`;
  sampleHeadshots.forEach(s => {
    h += `<button class="sample-thumb${S.headshotUrl===s.url?' active':''}" data-action="sampleHeadshot" data-url="${esc(s.url)}" data-label="${esc(s.label)}" title="${esc(s.label)}"><img src="${esc(s.url)}" alt="${esc(s.label)}" loading="lazy"></button>`;
  });
  h += `</div></div>`;
  h += `<div class="field-row"><label class="field-label">Shape</label><div class="toggle-group" data-action="headshotShape"><button class="${S.headshotShape==='circle'?'active':''}" data-val="circle">Circle</button><button class="${S.headshotShape==='rounded'?'active':''}" data-val="rounded">Rounded</button><button class="${S.headshotShape==='square'?'active':''}" data-val="square">Square</button></div></div>`;
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
    // Which set is stored changes what needs explaining: a saved Al Riyady
    // state is the one that looks wrong without a word, because the fields say
    // one thing and sixteen of the seventeen previews say another.
    h += matchesIdentity(CORPORATE_IDENTITY)
      ? `<div class="inline-note" id="stockNote">These are the Al&nbsp;Riyady details, and the <strong>Corporate</strong> template shows them. Every other layout previews on Signvel branding instead, so the gallery reads as a set of designs rather than the same signature seventeen times. Type over any field above and yours are used on all of them.</div>`
      : `<div class="inline-note" id="stockNote">Every layout except <strong>Corporate</strong> previews on Signvel branding, with a stand-in name — so the gallery reads as a set of designs rather than as one person's signature. Corporate reproduces the Al&nbsp;Riyady signature. Type over any field above and your own details are used on all seventeen.</div>`;
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
    if (S.bannerImage) h += `<div class="inline-note">A wide image replaces the text banner. Host it publicly — an uploaded copy will be stripped in transit.</div>`;
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

// ── Section 8: Rollout & install ──
// ── Section 8: Admin ──
// Figures about the account as a whole. Everything here arrives from the
// admin-stats Edge Function; nothing is computed in the browser, because
// nothing in the browser is allowed to see it.
function renderAdmin() {
  if (!isAdmin()) {
    return `<div class="inline-note">This section is only available to an administrator.</div>`;
  }

  const s = S.adminStats;
  let h = `<div class="opt-group">Accounts</div>`;

  if (S.adminLoading && !s) {
    h += `<div class="inline-note">Fetching…</div>`;
  } else if (!s) {
    h += `<div class="inline-note">Counting users means reading the auth table, which no browser key can do. These figures come from the <strong>admin-stats</strong> function instead.</div>`;
  } else {
    const stat = (label, value, hint) => `<div class="opt-row">
      <span class="opt-label">${label}${hint ? `<span class="opt-hint">${hint}</span>` : ''}</span>
      <span class="opt-control"><span class="admin-num">${esc(String(value))}</span></span>
    </div>`;

    h += `<div class="opt-list">
      ${stat('Signed-up users', s.users, 'Rows in the auth table')}
      ${stat('Profiles', s.profiles, 'One per user, created on sign-up')}
      ${stat('New this week', s.newLast7, 'Last 7 days')}
      ${stat('New this month', s.newLast30, 'Last 30 days')}
      ${stat('Saved signatures', s.signatures)}
    </div>`;

    // Only shown once the function has been redeployed with the trial counts;
    // an older deployment simply omits them rather than showing zeros.
    if (typeof s.onTrial === 'number') {
      h += `<div class="opt-group">Trials</div><div class="opt-list">
        ${stat('On trial now', s.onTrial, 'Free accounts inside their 30 days')}
        ${stat('Trial ended', s.expired, 'Past it, and not yet on a plan')}
      </div>`;
    }

    const plans = Object.keys(s.byPlan || {});
    if (plans.length) {
      h += `<div class="opt-group">By plan</div><div class="opt-list">`;
      plans.sort().forEach(p => { h += stat(p.charAt(0).toUpperCase() + p.slice(1), s.byPlan[p]); });
      h += `</div>`;
    }

    // A stale number presented without its timestamp is worse than no number.
    if (s.generatedAt) {
      const t = new Date(s.generatedAt);
      h += `<div class="inline-note">Measured ${esc(t.toLocaleString())}.</div>`;
    }
    // profiles should track users exactly; a gap means the sign-up trigger
    // missed someone, which is worth knowing about rather than averaging over.
    if (typeof s.users === 'number' && typeof s.profiles === 'number' && s.users !== s.profiles) {
      h += `<div class="inline-note"><strong>${Math.abs(s.users - s.profiles)}</strong> user${Math.abs(s.users - s.profiles) === 1 ? '' : 's'} without a matching profile row — the sign-up trigger may not have fired for them.</div>`;
    }
  }

  if (S.adminError) h += `<div class="uploader-error">${esc(S.adminError)}</div>`;

  h += `<div class="add-chips"><button class="chip accent" data-action="refreshAdminStats">${S.adminLoading ? 'Fetching…' : (s ? 'Refresh' : 'Load figures')}</button></div>`;

  // ── Granting paid access ──
  h += `<div class="opt-group">Accounts &amp; access</div>`;
  const me = (window.Cloud && Cloud.isReady) ? Cloud.state().userId : null;

  if (!S.adminUsers) {
    h += `<div class="inline-note">Everyone who has signed up, and what each of them is on. Changing a plan takes effect the next time they load the editor.</div>`;
  } else if (!S.adminUsers.length) {
    h += `<div class="inline-note">No accounts yet.</div>`;
  } else {
    h += `<div class="user-list">`;
    S.adminUsers.forEach(u => {
      const self = u.id === me;
      const joined = u.created_at ? new Date(u.created_at).toLocaleDateString() : '';
      // Where the account stands, said once: a paid plan speaks for itself, so
      // the trial is only worth mentioning on a free one.
      let standing = '';
      if (u.plan === 'free' && u.trial_ends_at) {
        const left = Math.ceil((new Date(u.trial_ends_at).getTime() - Date.now()) / 864e5);
        standing = left > 0 ? ` · trial, ${left} day${left === 1 ? '' : 's'} left` : ' · trial ended';
      }
      h += `<div class="user-row${self ? ' is-self' : ''}">
        <span class="user-id">
          <span class="user-email">${esc(u.email || '(no email)')}</span>
          <span class="user-meta">${self ? 'you' : 'joined ' + esc(joined)}${u.is_admin ? ' · admin' : ''}${standing}</span>
        </span>
        <span class="user-plan">`;
      if (self) {
        // Changing your own plan here would make the panel a way to upgrade
        // yourself. The function refuses it too; this just says so.
        h += `<span class="plan-tag">${esc(u.plan)}</span>`;
      } else {
        ['free', 'team', 'org'].forEach(p => {
          h += `<button class="plan-btn${u.plan === p ? ' active' : ''}"
            data-action="setUserPlan" data-user="${esc(u.id)}" data-plan="${p}"
            ${S.adminBusy === u.id ? 'disabled' : ''}>${p}</button>`;
        });
      }
      h += `</span></div>`;
    });
    h += `</div>`;
  }

  h += `<div class="add-chips"><button class="chip accent" data-action="loadAdminUsers">${S.adminUsersLoading ? 'Fetching…' : (S.adminUsers ? 'Refresh list' : 'Load accounts')}</button></div>`;
  h += `<div class="inline-note">Administrator rights are not granted here — that stays a SQL statement someone has to write deliberately.</div>`;
  return h;
}

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
  const cn = compatNotes[S.client] || compatNotes.gmail;
  // Check for pill CTA + Outlook warning
  let warningOverride = null;
  if (S.client === 'outlook' && S.bannerEnabled && S.ctaStyle === 'pill') {
    warningOverride = {icon:'⚠', text:'Pill CTA loses its border-radius in Outlook.', warning:true};
  }
  const note = warningOverride || cn;

  let h = `<div class="stage-toolbar">
    <div class="client-tabs" id="clientTabs">`;
  clients.forEach(c => {
    h += `<button class="client-tab${S.client===c.id?' active':''}" data-client="${c.id}" title="${esc(c.label)}">
      <span class="client-tab-logo">${mailLogos[c.id]||''}</span><span>${esc(c.label)}</span>
    </button>`;
  });
  h += `</div><div class="toggle-group" id="deviceTabs">
    <button class="${S.device==='desktop'?'active':''}" data-device="desktop">Desktop</button>
    <button class="${S.device==='mobile'?'active':''}" data-device="mobile">Mobile</button>
  </div>
  <div class="toggle-row gap-6"><label class="field-label" style="margin:0;font-size:11px">Dark</label><div class="toggle-switch${S.darkMode?' on':''}" data-action="toggleDark"></div></div>
  <div class="compat-note${note.warning?' warning':''}"><span class="compat-icon">${note.icon}</span> ${note.text}</div>
  </div>`;

  h += `<div class="preview-wrapper"><div class="email-mock${S.darkMode?' dark':''}${S.device==='mobile'?' mobile-view':''}">
    <div class="email-mock-body">
      <div class="signature-container">${generateSignaturePreview()}</div>
    </div>
  </div></div>`;

  $stage.innerHTML = h;
  scheduleAllSaves();
}

// ═══════════════════════════════════════
// Signature Preview HTML (table-based)
// ═══════════════════════════════════════
// Relative luminance, so a dark background can flip the text to light without
// the user having to notice and fix it themselves.
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

// Resolves one of the five shipped font names to a full email-safe stack.
function fontStack(name) {
  return name === 'Georgia' ? "Georgia, 'Times New Roman', serif" :
         name === 'Verdana' ? "Verdana, Geneva, sans-serif" :
         name === 'Trebuchet MS' ? "'Trebuchet MS', Helvetica, sans-serif" :
         name === 'Courier New' ? "'Courier New', Courier, monospace" :
         "'Helvetica Neue', Helvetica, Arial, sans-serif";
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
                         feature:620, colorblock:600, darkcard:600, labelled:560, inline:560};
  const layoutW = S.panelWidth || templateWidth[S.template] || 0;
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
  const who = identityIsStock()
    ? (S.template === 'corporate' ? CORPORATE_IDENTITY : SAMPLE_IDENTITY)
    : null;
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
  const mutedStyle = `font-family:${ff};font-size:${bs - 2}px;color:${onDark ? '#8F8CA3' : '#999'};line-height:1.4;`;

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
      return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;margin:0 0 ${mb}px;"${al === 'center' ? ' align="center"' : ''}><tr>
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
    return `<div style="width:${box}px;height:${box}px;border-radius:${radius};${ring}box-sizing:border-box;overflow:hidden;">${img}</div>`;
  }
  const headshotHTML = photoHTML();

  // ── Logo ──
  // The real company logo is reserved for Corporate. Every other layout shows a
  // generated mark instead, so the gallery reads as a set of designs rather
  // than the same logo seventeen times. A logo the user chose always wins.
  const usingStockLogo = S.logoUrl === DEFAULT_LOGO_URL;
  // A real logo is an image, so it waits for a subscription too. The generated
  // mark is table markup rather than a file, so it still draws.
  const showRealLogo = showImages && S.logoUrl && (!usingStockLogo || S.template === 'corporate');

  function logoAs(opts) {
    if (!S.logoUrl) return '';
    if (showRealLogo) {
      const hh = (opts && opts.size) || S.logoHeight;
      return `<img src="${esc(S.logoUrl)}" height="${hh}" style="display:block;height:${hh}px;width:auto;" alt="${esc(pCompany)} logo">`;
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
  const circleIcon = (svg, filled, colour) => {
    const cc = colour || ic;
    const sz = S.contactIconSize || 22;
    const inner = Math.round(sz * 0.5);
    const scaled = (svg||'')
      .replace(/width="14"/, `width="${inner}"`)
      .replace(/height="14"/, `height="${inner}"`)
      .replace(/<svg /, '<svg style="display:block;margin:0 auto;" ');
    const glyph = filled ? '#ffffff' : cc;
    const bg = filled ? `background-color:${cc};` : '';
    const bgAttr = filled ? ` bgcolor="${cc}"` : '';
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tr><td width="${sz}" height="${sz}"${bgAttr} style="box-sizing:border-box;width:${sz}px;min-width:${sz}px;max-width:${sz}px;height:${sz}px;padding:0;${bg}border:1.5px solid ${cc};border-radius:50%;color:${glyph};text-align:center;vertical-align:middle;font-size:0;line-height:0;">${scaled}</td></tr></table>`;
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
    const lead = badged
      ? circleIcon(contactIcons[f.type], mode === 'filled', badgeColor)
      : `<span style="display:inline-block;vertical-align:middle;color:${badgeColor};width:${Math.round(S.contactIconSize * 0.64)}px;height:${Math.round(S.contactIconSize * 0.64)}px;">${contactIcons[f.type] || ''}</span>`;
    return {lead, leadPad: badged ? '3px 10px 3px 0' : '1px 7px 1px 0', val, valPad: '3px 0', align: 'middle', raw: true};
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
    const cell = (f, last) => {
      const p = contactParts(f, o);
      const rightPad = last ? 0 : gap;
      if (!p.lead) return `<td colspan="2" style="padding:${p.valPad};padding-right:${rightPad}px;vertical-align:${p.align};">${p.val}</td>`;
      return `<td style="padding:${p.leadPad};vertical-align:${p.align};${p.raw ? 'font-size:0;line-height:0;' : ''}">${p.lead}</td>
              <td style="padding:${p.valPad};padding-right:${rightPad}px;vertical-align:${p.align};">${p.val}</td>`;
    };
    let rows = '';
    // A single row with every field laid across it — the shallow inline layout
    // is the whole point of this mode.
    if (o.row) {
      rows = `<tr>` + list.map((f, i) => cell(f, i === list.length - 1)).join('') + `</tr>`;
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
    const style = o.style || S.socialStyle;
    const colour = o.color || sc;
    const sz = o.size || S.socialIconSize;
    const iconSz = sz + 'px';
    let out = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${al === 'center' ? ' align="center"' : ''}><tbody><tr>`;
    activeSocials.forEach((sl, idx) => {
      const gap = idx > 0 ? `padding-left:${o.gap != null ? o.gap : (style === 'plain' ? 10 : 6)}px;` : '';
      const svgIcon = socialIcons[sl.type] || '';
      if (style === 'circle' || style === 'filled' || style === 'glyph') {
        const iconScale = Math.round(sz * (style === 'glyph' ? 0.78 : 0.55));
        const scaledSvg = svgIcon
          .replace(/width="16"/, `width="${iconScale}"`)
          .replace(/height="16"/, `height="${iconScale}"`)
          .replace(/<svg /, '<svg style="display:block;margin:0 auto;" ');
        // Bare glyph, no ring — the treatment the minimal reference layouts use.
        if (style === 'glyph') {
          out += `<td style="${gap}vertical-align:middle;font-size:0;line-height:0;"><a href="${socialHref(sl)}" style="display:block;text-decoration:none;color:${colour};font-size:0;line-height:0;">${scaledSvg}</a></td>`;
          return;
        }
        const solid = style === 'filled';
        const glyph = solid ? (o.glyphColor || '#ffffff') : colour;
        const bg = solid ? `background-color:${colour};` : '';
        const bgAttr = solid ? ` bgcolor="${colour}"` : '';
        out += `<td style="${gap}vertical-align:middle;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tr><td width="${sz}" height="${sz}"${bgAttr} style="box-sizing:border-box;width:${sz}px;min-width:${sz}px;max-width:${sz}px;height:${sz}px;padding:0;${bg}border:2px solid ${colour};border-radius:50%;color:${glyph};text-align:center;vertical-align:middle;font-size:0;line-height:0;"><a href="${socialHref(sl)}" style="display:block;text-decoration:none;color:${glyph};font-size:0;line-height:0;">${scaledSvg}</a></td></tr></table></td>`;
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
  const bannerImgHTML = (S.bannerEnabled && S.bannerImage && showImages)
    ? `<img src="${esc(S.bannerImage)}" width="520" style="display:block;width:100%;max-width:520px;height:auto;border-radius:6px;" alt="${esc(S.bannerMessage || 'Campaign')}">`
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
      ? logoAs({size: 58, colour: '#FFFFFF', hollow: true, mono: true})
      : `<div style="font-family:${ff};font-size:${bs + 10}px;font-weight:800;letter-spacing:.04em;color:#ffffff;line-height:1.2;">${esc((pCompany || 'Logo').split(' ')[0].toUpperCase())}</div>`;
    return outer(`
      <tr>
        <td width="${blockW}" bgcolor="${ac}" style="width:${blockW}px;background-color:${ac};text-align:center;vertical-align:middle;padding:30px 18px;">${mark}</td>
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
        ${S.headshotUrl ? `<td style="vertical-align:top;padding-right:26px;">${photoHTML({ring: S.photoRing || 5, ringColor: S.photoRing ? S.photoRingColor : '#FFFFFF'})}</td>` : ''}
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
        ${logoHTML ? `<td style="vertical-align:middle;padding-right:26px;">${logoAs({stack: true, size: Math.max(40, S.logoHeight)})}</td>` : ''}
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
        <td style="vertical-align:middle;padding-right:30px;">
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
        ${logoHTML ? `<td style="vertical-align:top;padding:2px 0 0 28px;">${logoAs({stack: true, size: Math.max(44, S.logoHeight)})}</td>` : ''}
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
        <td style="vertical-align:top;padding:2px 22px 0 0;">${headshotHTML}</td>
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
        <td style="vertical-align:top;padding:0 22px 0 0;">${headshotHTML}</td>
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
        <td style="vertical-align:middle;padding-right:24px;">${photoHTML({ring: S.photoRing || 5, ringColor: S.photoRing ? S.photoRingColor : ac})}</td>
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
        ${logoHTML ? `<td style="vertical-align:top;padding:2px 26px 0 0;">${logoAs({stack: true, size: Math.max(40, S.logoHeight)})}</td>` : ''}
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
        ${logoHTML ? `<td style="vertical-align:middle;padding-right:22px;">${logoAs({mono: !showRealLogo, size: Math.max(38, S.logoHeight)})}</td>` : ''}
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
        <td style="vertical-align:top;padding:0 28px 0 0;">${photoHTML({fallback: ac})}</td>
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
        <td width="100%" style="width:100%;vertical-align:middle;">${logoHTML ? logoAs({size: Math.max(30, S.logoHeight - 8)}) : ''}</td>
        <td style="vertical-align:middle;text-align:right;">${socialHTML}</td>
      </tr>
      <tr><td colspan="2" style="padding-top:${parseInt(sp) + 8}px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;"><tr>
          <td bgcolor="${ac}" style="background-color:${ac};border-radius:8px;padding:20px 26px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
              <td style="vertical-align:middle;font-family:${hf};font-size:${nameAt(bs + 12)}px;font-weight:800;color:#ffffff;line-height:1.1;${track}">${eName}</td>
              <td style="vertical-align:middle;text-align:right;padding-left:20px;font-family:${ff};font-size:${bs}px;color:rgba(255,255,255,.9);white-space:nowrap;">${esc(pTitle)}</td>
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
          <td style="vertical-align:top;padding-left:26px;text-align:right;">${headshotHTML}</td>
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
          <p style="font-family:${hf};font-size:${nameAt(bs + 16)}px;font-weight:400;color:${onDark ? '#F3EEE2' : nameColor};line-height:1.1;${track}margin:0 0 10px;">${eName}</p>
          ${hairline(onDark ? 'rgba(255,255,255,.35)' : ruleColor)}
          <p style="font-family:${hf};font-size:${bs + 5}px;font-weight:400;color:${soft};line-height:1.3;margin:10px 0 0;">${esc(pCompany)}</p>
          ${roleHTML({size: bs - 1, color: soft, mb: 0})}
          ${taglineHTML}
          <div style="padding-top:${parseInt(sp) + 10}px;">${contactTable({color: soft, icon: ac, linkColor: ac, gap: 30})}</div>
          ${socialHTML ? `<div style="padding-top:${parseInt(sp) + 8}px;">${socialHTML}</div>` : ''}
        </td>
        <td style="vertical-align:top;width:1px;">${photoHTML({size: S.headshotSize || 130})}</td>
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
        <td style="vertical-align:top;padding-left:30px;">${photoHTML({ring: S.photoRing || 3, ringColor: S.photoRing ? S.photoRingColor : ac})}</td>
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
        <td style="vertical-align:middle;padding-right:28px;">${photoHTML({ring: S.photoRing || 4, ringColor: S.photoRing ? S.photoRingColor : '#FFFFFF'})}</td>
        <td width="100%" style="width:100%;vertical-align:middle;">
          <p style="${nameStyleAt(bs + 14, light)}">${eName}</p>
          ${roleHTML({mb: 14, chipBg: onDark ? 'rgba(255,255,255,.18)' : a2, chipFg: '#FFFFFF', color: soft, capsColor: ac})}
          ${taglineHTML}
          ${contactTable({color: soft, icon: onDark ? '#FFFFFF' : ic, linkColor: ac, gap: 28})}
          ${socialHTML ? `<div style="padding-top:${parseInt(sp) + 8}px;">${socialBlock({color: onDark ? '#FFFFFF' : sc, glyphColor: S.bgColor})}</div>` : ''}
        </td>
        ${logoHTML ? `<td style="vertical-align:top;padding-left:26px;text-align:right;">${logoAs({size: Math.max(30, S.logoHeight - 8), colour: onDark ? '#FFFFFF' : undefined, hollow: onDark && !showRealLogo})}</td>` : ''}
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="3" style="padding-top:${parseInt(sp) + 8}px;">${bannerImgHTML}</td></tr>` : ''}
      ${discRow(3)}`);
  }

  if (S.template === 'corporate') {
    // Full-width accent rule, reused above and below the logo/contact band.
    const rule = hairline(ac, S.dividerWidth);
    const discStyle = `font-family:${ff};font-size:${Math.max(9, bs - 4)}px;color:${ac};line-height:1.5;margin:0;`;
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${S.panelWidth || 560}" style="width:${S.panelWidth || 560}px;max-width:100%;text-align:${al};"><tbody>
      <tr><td style="padding-bottom:${sp};">
        <p style="${nameStyle}">${eName}</p>
        <p style="${titleStyle}">${esc(pTitle)}</p>
        <p style="${titleStyle}">${esc(pCompany)}</p>
      </td></tr>
      ${S.dividerEnabled ? `<tr><td style="padding-bottom:${sp};">${rule}</td></tr>` : ''}
      <tr><td>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tbody><tr>
          <td style="vertical-align:middle;padding-right:28px;">${logoHTML}</td>
          <td style="vertical-align:middle;width:100%;">${contactHTML}</td>
        </tr></tbody></table>
      </td></tr>
      ${S.dividerEnabled ? `<tr><td style="padding:${sp} 0;">${rule}</td></tr>` : ''}
      ${socialHTML ? `<tr><td style="padding-bottom:${sp};">${socialHTML}</td></tr>` : ''}
      ${bannerHTML}
      ${S.disclaimerEnabled && S.disclaimerText ? `<tr><td><p style="${discStyle}">${esc(S.disclaimerText)}</p></td></tr>` : ''}
    </tbody></table>`;
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
function generateExportHTML() {
  const html = generateSignaturePreview();
  return `<!-- Signature Studio Export -->\n${html}`;
}

// ═══════════════════════════════════════
// Copy & Export
// ═══════════════════════════════════════
function copySignature() {
  const html = generateSignaturePreview();
  const el = document.createElement('div');
  el.contentEditable = 'true';
  el.innerHTML = html;
  el.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
  document.body.appendChild(el);

  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  let ok = false;
  try { ok = document.execCommand('copy'); } catch(e) {}

  document.body.removeChild(el);
  sel.removeAllRanges();

  if (ok) {
    showCopyFeedback('Copied ✓');
  } else {
    navigator.clipboard.writeText(html).then(() => {
      showCopyFeedback('Copied ✓');
    }).catch(() => {
      showCopyFeedback('Blocked — use Export HTML');
    });
  }
}

function showCopyFeedback(msg) {
  const el = document.getElementById('copyFeedback');
  if (el) { el.textContent = msg; setTimeout(() => { el.textContent = ''; }, 2500); }
}

function showExport() {
  const html = generateExportHTML();
  $exportCode.textContent = html;
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
    if (e.target.closest('#signInBtn')) { openAuth('signin'); return; }
    if (e.target.closest('#signOutBtn')) {
      Cloud.signOut().then(() => { renderHeader(); showCopyFeedback('Signed out'); });
      return;
    }
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
        case 'refreshAdminStats': loadAdminStats(); break;
        case 'loadAdminUsers': loadAdminUsers(); break;
        case 'setUserPlan': setUserPlan(togAction.dataset.user, togAction.dataset.plan); break;
        case 'sampleHeadshot':
          S.headshotUrl = togAction.dataset.url;
          S.headshotName = togAction.dataset.label + ' (sample)';
          S.uploadError = ''; S.storageError = '';
          break;
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
    // Image URL fields commit on blur/Enter, not per keystroke — a half-typed
    // URL would just render as a broken image.
    if (upAction === 'logoUrl' || upAction === 'headshotUrl') {
      const kind = upAction === 'logoUrl' ? 'logo' : 'headshot';
      const v = e.target.value.trim();
      S.uploadError = '';
      if (!v) {
        S[kind + 'Url'] = null;
        S[kind + 'Name'] = '';
      } else if (!/^https?:\/\//i.test(v)) {
        S.uploadError = 'Enter a full URL starting with http:// or https://';
      } else {
        S[kind + 'Url'] = v;
        S[kind + 'Name'] = v.split('/').pop().split('?')[0] || v;
      }
      renderPanel();
      renderStage();
      return;
    }

    // Also handle select changes with data-bind
    const bind = e.target.dataset.bind;
    if (bind && e.target.tagName === 'SELECT') {
      S[bind] = e.target.value;
      renderStage();
    }
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

  // Stage events
  $stage.addEventListener('click', e => {
    const clientBtn = e.target.closest('#clientTabs button');
    if (clientBtn) { S.client = clientBtn.dataset.client; renderStage(); return; }
    const deviceBtn = e.target.closest('#deviceTabs button');
    if (deviceBtn) { S.device = deviceBtn.dataset.device; renderStage(); return; }
    const darkToggle = e.target.closest('[data-action="toggleDark"]');
    if (darkToggle) { S.darkMode = !S.darkMode; renderStage(); return; }
  });

  // Auth modal
  const $auth = document.getElementById('authOverlay');
  if ($auth) {
    document.getElementById('authClose').addEventListener('click', closeAuth);
    $auth.addEventListener('click', e => { if (e.target === $auth) closeAuth(); });
    document.getElementById('authSubmit').addEventListener('click', submitAuth);
    document.getElementById('authForgot').addEventListener('click', forgotPassword);
    document.getElementById('authToggle').addEventListener('click', () => {
      openAuth(authMode === 'signup' ? 'signin' : 'signup');
    });
    $auth.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitAuth();
      if (e.key === 'Escape') closeAuth();
    });
  }

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
// Email + password auth. The modal doubles as sign-up and password reset so
// there is only one place to maintain.
let authMode = 'signin';

function openAuth(mode) {
  authMode = mode || 'signin';
  const signup = authMode === 'signup';
  document.getElementById('authTitle').textContent = signup ? 'Create an account' : 'Sign in';
  document.getElementById('authSub').textContent = signup
    ? 'Your signatures sync across devices, and uploaded logos get hosted so they survive being emailed.'
    : 'Access your saved signatures.';
  document.getElementById('authSubmit').textContent = signup ? 'Create account' : 'Sign in';
  document.getElementById('authToggle').textContent = signup ? 'I already have an account' : 'Create an account';
  document.getElementById('authPassword').setAttribute('autocomplete', signup ? 'new-password' : 'current-password');
  authMessage('');
  document.getElementById('authOverlay').classList.remove('hidden');
  document.getElementById('authEmail').focus();
}

function closeAuth() {
  // While the editor is locked there is nothing behind this panel to return
  // to, so the close button, the backdrop and Escape all do nothing.
  if (authRequired) return;
  document.getElementById('authOverlay').classList.add('hidden');
  document.getElementById('authPassword').value = '';
}

function authMessage(text, kind) {
  const el = document.getElementById('authMsg');
  el.textContent = text || '';
  el.className = 'auth-msg' + (text ? '' : ' hidden') + (kind ? ' is-' + kind : '');
}

function submitAuth() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  if (!email) { authMessage('Enter your email address.', 'error'); return; }
  if (!password) { authMessage('Enter your password.', 'error'); return; }
  if (authMode === 'signup' && password.length < 8) {
    authMessage('Use at least 8 characters.', 'error');
    return;
  }

  const btn = document.getElementById('authSubmit');
  btn.disabled = true;
  authMessage('Working…');

  const done = (r) => {
    btn.disabled = false;
    if (!r.ok) { authMessage(r.error, 'error'); return; }
    if (r.needsConfirm) {
      authMessage('Account created. Check your email to confirm the address, then sign in.', 'ok');
      return;
    }
    closeAuth();
    renderHeader();
    showCopyFeedback('Signed in');
  };

  if (authMode === 'signup') Cloud.signUp(email, password).then(done);
  else Cloud.signInPassword(email, password).then(done);
}

function forgotPassword() {
  const email = document.getElementById('authEmail').value.trim();
  if (!email) { authMessage('Enter your email address first.', 'error'); return; }
  authMessage('Sending…');
  Cloud.resetPassword(email).then(r => {
    authMessage(r.ok ? 'Reset link sent — check your email.' : r.error, r.ok ? 'ok' : 'error');
  });
}

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

function lockEditor() {
  authRequired = true;
  document.body.classList.add('app-locked');
  document.getElementById('authOverlay').classList.add('is-required');
  openAuth('signin');
}

function unlockEditor() {
  authRequired = false;
  document.body.classList.remove('app-locked');
  document.getElementById('authOverlay').classList.remove('is-required');
  closeAuth();
}

function startCloud() {
  if (!window.Cloud || !Cloud.isReady) return;
  // The rail has to redraw too: the Admin button appears and disappears with
  // the signed-in profile, and signing out must take its contents with it.
  Cloud.onChange(() => {
    const c = Cloud.state();
    // Signing out has to close the editor behind you, not leave it open.
    if (!c.signedIn) { lockEditor(); }
    else if (authRequired) { unlockEditor(); }
    if (!isAdmin() && sections[S.openSection] && sections[S.openSection].adminOnly) {
      S.openSection = 0;
      S.adminStats = null;
      S.adminUsers = null;
      S.adminError = '';
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
const TRANSIENT_KEYS = ['uploadError', 'storageError', 'adminStats', 'adminError',
  'adminLoading', 'adminUsers', 'adminUsersLoading', 'adminBusy'];

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
  openAuthFromHash();
}

// The marketing pages link here for "Sign in" and "Get started". Without this
// those links just drop someone into the editor with the panel they were
// after nowhere in sight — they have to find the button in the top bar and
// press it themselves, which is not what they clicked.
//
// Cloud may still be starting up, so this waits for it rather than opening a
// sign-in panel over an editor that turns out to be signed in already.
function openAuthFromHash() {
  const want = (location.hash || '').replace('#', '');
  if (want !== 'signin' && want !== 'signup') return;
  // Clear it straight away, so a refresh does not reopen the panel and the
  // fragment does not linger in the address bar.
  history.replaceState(null, '', location.pathname + location.search);
  if (!window.Cloud || !Cloud.isReady) return;

  const show = () => { if (!Cloud.state().signedIn) openAuth(want); };
  // init() runs before Cloud.init() has resolved, so ask once it has.
  Cloud.init().then(show);
}

init();
