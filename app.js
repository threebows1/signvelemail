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

// A colour per layout, so the templates read as a varied set. Chosen to sit
// comfortably beside the gold accent without competing with it.
const demoLogoPalette = {
  spotlight:'#4F46E5', split:'#0D9488', accentbar:'#059669', darkcard:'#0EA5E9',
  colorblock:'#E11D48', 'side-by-side':'#7C3AED', stacked:'#D97706',
  card:'#0891B2', minimal:'#475569',
};
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

  font: 'Helvetica Neue',
  bodySize: 14,
  fontWeight: 'regular',
  textColor: '#4A4A48',
  nameColor: '#4A4A48',
  titleColor: '#666666',

  accentColor: '#C9962B',

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

  headshotUrl: null,
  headshotName: '',
  headshotShape: 'square',
  headshotZoom: 100,

  uploadError: '',
  storageError: '',

  name: 'Farrukh Shahzad',
  title: 'Marketing Manager',
  company: 'Al Riyady Group',
  tagline: '',

  contactIconMode: 'circle',
  showContactIcons: true,
  contactIconSize: 22,
  iconColor: '#C9962B',
  socialIconColor: '#C9962B',
  contactFields: [
    {type:'email',   label:'Email',   value:'farrukh@alriyady.ae',                             enabled:true,  removable:false},
    {type:'mobile',  label:'Mobile',  value:'+971 50 274 9769',                                enabled:true,  removable:false},
    {type:'phone',   label:'Phone',   value:'+971 4 591 8185',                                 enabled:true,  removable:true},
    {type:'address', label:'Address', value:'The Curve Building - Office No. M 47, Dubai - UAE', enabled:true, removable:false},
    {type:'website', label:'Website', value:'alriyadygroup.ae',                                enabled:true,  removable:false},
  ],

  socialStyle: 'circle',
  socialIconSize: 28,
  socialLinks: [
    {type:'facebook',  label:'Facebook',  handle:'alriyady',    enabled:true},
    {type:'linkedin',  label:'LinkedIn',  handle:'alriyady',    enabled:true},
    {type:'instagram', label:'Instagram', handle:'alriyady.ae', enabled:true},
    {type:'youtube',   label:'YouTube',   handle:'alriyady',    enabled:true},
    {type:'tiktok',    label:'TikTok',    handle:'alriyady',    enabled:true},
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
  'template','alignment','font','bodySize','fontWeight','textColor','accentColor',
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
    template:'card', fontWeight:'semibold', socialStyle:'outline', bannerEnabled:false,
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
];

// ───────────── Rail icons ─────────────
const railIcons = {
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
  return `<span class="account-chip" title="${esc(c.email)}">
      <span class="account-dot"></span>${esc(c.email.split('@')[0])}
      <span class="account-plan">${esc(c.plan)}</span>
    </span>
    <button class="btn" id="signOutBtn">Sign out</button>`;
}

// ═══════════════════════════════════════
// RENDER: Rail + settings sheet
// ═══════════════════════════════════════
// Dark icon rail — one entry per section, grouped by category.
function renderRail() {
  let html = `<a class="rail-brand" href="landing.html" title="Back to signvel.com home">${icons.logo}</a>
    <nav class="rail-nav">`;
  let lastCat = '';
  sections.forEach((sec, i) => {
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
  const i = Math.max(0, Math.min(S.openSection, sections.length - 1));
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
    default: return '';
  }
}

// ── Section 0: Templates & layout ──
function renderTemplates() {
  const tmpls = [
    {id:'colorblock', label:'Colour block', preview:`<div style="display:flex;gap:5px;align-items:stretch"><div style="width:14px;height:22px;background:var(--accent);border-radius:2px"></div><div style="padding-top:2px"><div class="tmpl-block" style="width:22px;height:3px;margin-bottom:2px"></div><div class="tmpl-block" style="width:15px;height:2px;margin-bottom:3px"></div><div class="tmpl-block" style="width:20px;height:2px;margin-bottom:2px"></div><div class="tmpl-block" style="width:17px;height:2px"></div></div></div>`},
    {id:'darkcard', label:'Dark card', preview:`<div style="background:#1B2A4A;border-radius:4px;padding:5px;display:flex;gap:4px;align-items:center;width:42px"><div style="width:11px;height:11px;border-radius:50%;background:#4A5B7E;flex-shrink:0"></div><div><div style="width:18px;height:3px;background:#fff;border-radius:1px;margin-bottom:2px"></div><div style="width:13px;height:2px;background:var(--accent);border-radius:1px"></div></div></div>`},
    {id:'split', label:'Split', preview:`<div style="display:flex;gap:4px;align-items:center"><div class="tmpl-block" style="width:11px;height:11px"></div><div><div class="tmpl-block" style="width:16px;height:3px;margin-bottom:2px"></div><div class="tmpl-block" style="width:11px;height:2px"></div></div><div style="width:1px;height:15px;background:var(--border)"></div><div><div class="tmpl-block" style="width:15px;height:2px;margin-bottom:2px"></div><div class="tmpl-block" style="width:15px;height:2px;margin-bottom:2px"></div><div class="tmpl-block" style="width:12px;height:2px"></div></div></div>`},
    {id:'accentbar', label:'Accent bar', preview:`<div style="display:flex;gap:5px;align-items:center"><div style="width:2px;height:20px;background:var(--accent);border-radius:1px"></div><div><div class="tmpl-block" style="width:20px;height:3px;margin-bottom:2px"></div><div class="tmpl-block" style="width:15px;height:2px;margin-bottom:3px"></div><div class="tmpl-block" style="width:22px;height:2px;margin-bottom:2px"></div><div class="tmpl-block" style="width:18px;height:2px"></div></div><div class="tmpl-block" style="width:10px;height:10px"></div></div>`},
    {id:'spotlight', label:'Spotlight', preview:`<div style="width:40px"><div style="display:flex;gap:4px;align-items:center;margin-bottom:4px"><div class="tmpl-block" style="width:13px;height:13px;border-radius:50%"></div><div style="width:1px;height:13px;background:var(--border)"></div><div><div class="tmpl-block" style="width:18px;height:3px;margin-bottom:2px"></div><div class="tmpl-block" style="width:13px;height:2px"></div></div></div><div style="height:11px;background:#141220;border-radius:3px"></div></div>`},
    {id:'corporate', label:'Corporate', preview:`<div style="width:38px"><div class="tmpl-block" style="width:26px;height:3px;margin-bottom:2px"></div><div class="tmpl-block" style="width:18px;height:2px;margin-bottom:3px"></div><div style="height:2px;background:var(--accent);margin-bottom:3px"></div><div style="display:flex;gap:3px;align-items:flex-start"><div class="tmpl-block" style="width:9px;height:9px"></div><div><div class="tmpl-block" style="width:22px;height:2px;margin-bottom:2px"></div><div class="tmpl-block" style="width:22px;height:2px;margin-bottom:2px"></div><div class="tmpl-block" style="width:16px;height:2px"></div></div></div></div>`},
    {id:'side-by-side', label:'Side by side', preview:`<div style="display:flex;gap:3px;align-items:center"><div class="tmpl-block" style="width:16px;height:16px;border-radius:50%"></div><div><div class="tmpl-block" style="width:28px;height:3px;margin-bottom:2px"></div><div class="tmpl-block" style="width:20px;height:3px"></div></div></div>`},
    {id:'stacked', label:'Stacked', preview:`<div style="text-align:center"><div class="tmpl-block" style="width:16px;height:16px;border-radius:50%;margin:0 auto 3px"></div><div class="tmpl-block" style="width:28px;height:3px;margin:0 auto 2px"></div><div class="tmpl-block" style="width:20px;height:3px;margin:0 auto"></div></div>`},
    {id:'card', label:'Card', preview:`<div style="border:1px solid var(--border);border-radius:3px;padding:4px;text-align:center"><div class="tmpl-block" style="width:28px;height:3px;margin:0 auto 2px"></div><div class="tmpl-block" style="width:20px;height:3px;margin:0 auto"></div></div>`},
    {id:'minimal', label:'Minimal', preview:`<div><div class="tmpl-block" style="width:34px;height:3px;margin-bottom:2px"></div><div class="tmpl-block" style="width:24px;height:2px"></div></div>`},
  ];
  let h = `<div class="field-row"><label class="field-label">Template</label><div class="template-grid">`;
  tmpls.forEach(t => {
    h += `<div class="template-card${S.template===t.id?' active':''}" data-tmpl="${t.id}"><div class="tmpl-preview">${t.preview}</div><div class="tmpl-label">${t.label}</div></div>`;
  });
  h += `</div></div>`;

  h += `<div class="field-row"><label class="field-label">Alignment</label><div class="toggle-group" data-action="alignment">
    <button class="${S.alignment==='left'?'active':''}" data-val="left">Left</button>
    <button class="${S.alignment==='center'?'active':''}" data-val="center">Centre</button>
    <button class="${S.alignment==='right'?'active':''}" data-val="right">Right</button>
  </div></div>`;

  return h;
}

// Changing the theme colour drags the icon colours along, but only while they
// still match it — once either has been set deliberately, it stays put.
function setAccent(next) {
  const prev = S.accentColor;
  if (S.iconColor === prev) S.iconColor = next;
  if (S.socialIconColor === prev) S.socialIconColor = next;
  S.accentColor = next;
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
  h += `<div class="field-row"><label class="field-label">Font size</label><div class="slider-row"><input type="range" min="11" max="18" value="${S.bodySize}" data-bind="bodySize"><span class="slider-val">${S.bodySize}px</span></div></div>`;
  h += `<div class="field-row"><label class="field-label">Weight</label><div class="toggle-group" data-action="fontWeight"><button class="${S.fontWeight==='regular'?'active':''}" data-val="regular">Regular</button><button class="${S.fontWeight==='semibold'?'active':''}" data-val="semibold">Semibold</button></div></div>`;

  h += `<div class="opt-group">Colour</div>`;
  h += `<div class="field-row"><label class="field-label">Theme presets</label><div class="swatch-row">`;
  accents.forEach(c => { h += `<div class="swatch${S.accentColor===c?' active':''}" style="background:${c}" data-color="${c}" data-action="accentColor"></div>`; });
  h += `</div></div>`;
  h += `<div class="opt-list">
    ${colorRow('Theme colour', 'accentColor')}
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

  h += `<div class="opt-group">Contact icons</div>`;
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
function renderMedia() {
  // Not every layout has a slot for both images — say so rather than letting
  // someone upload a photo and wonder why nothing changed.
  const usesLogo = ['corporate','side-by-side','stacked','card'].includes(S.template);
  const usesHeadshot = ['side-by-side','stacked','card'].includes(S.template);
  const notUsed = (what) => `<div class="inline-note">The <strong>${esc(S.template)}</strong> template has no ${what} slot. These settings are saved, and apply as soon as you pick a layout that uses one.</div>`;

  let h = `<div class="opt-group">Logo</div>`;
  if (!usesLogo) h += notUsed('logo');
  h += `<div class="field-row">${renderUploader('logo', 'PNG or SVG with a transparent background works best. Max 1&nbsp;MB.')}</div>`;
  h += `<div class="field-row"><label class="field-label">Logo height</label><div class="slider-row"><input type="range" min="20" max="72" value="${S.logoHeight}" data-bind="logoHeight"><span class="slider-val">${S.logoHeight}px</span></div></div>`;

  h += `<div class="opt-group">Headshot</div>`;
  if (!usesHeadshot) h += notUsed('headshot');
  h += `<div class="field-row">${renderUploader('headshot', 'A square image crops best. Max 1&nbsp;MB.')}</div>`;
  h += `<div class="field-row"><label class="field-label">Shape</label><div class="toggle-group" data-action="headshotShape"><button class="${S.headshotShape==='circle'?'active':''}" data-val="circle">Circle</button><button class="${S.headshotShape==='rounded'?'active':''}" data-val="rounded">Rounded</button><button class="${S.headshotShape==='square'?'active':''}" data-val="square">Square</button></div></div>`;
  h += `<div class="field-row"><label class="field-label">Crop / zoom</label><div class="slider-row"><input type="range" min="100" max="200" value="${S.headshotZoom}" data-bind="headshotZoom"><span class="slider-val">${S.headshotZoom}%</span></div></div>`;
  return h;
}

// ── Section 3: Contact fields ──
function renderContacts() {
  // Values and ordering only — how these rows look lives in Design.
  let h = `<div class="field-row"><label class="field-label">Tagline</label><input class="input" value="${esc(S.tagline)}" data-bind="tagline" placeholder="Optional strapline, shown in italics"></div>`;
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
    h += `<div class="field-row"><label class="field-label">Banner image URL</label><input class="input" type="url" value="${esc(S.bannerImage)}" data-bind="bannerImage" placeholder="https://example.com/campaign.png"></div>`;
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
function generatedLogoHTML(ff) {
  const colour = demoLogoPalette[S.template] || '#4F46E5';
  const words = String(S.company || 'Company').trim().split(/\s+/).filter(Boolean);
  const initials = words.map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CO';
  const box = Math.max(28, S.logoHeight);
  const mark = Math.round(box * 0.42);

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tr>
    <td width="${box}" height="${box}" bgcolor="${colour}" style="width:${box}px;height:${box}px;background-color:${colour};border-radius:${Math.round(box * 0.24)}px;text-align:center;vertical-align:middle;font-family:${ff};font-size:${mark}px;font-weight:700;letter-spacing:.02em;color:#ffffff;line-height:${box}px;">${esc(initials)}</td>
    <td style="padding-left:10px;vertical-align:middle;font-family:${ff};font-size:${Math.round(box * 0.34)}px;font-weight:800;letter-spacing:-.01em;color:${colour};white-space:nowrap;">${esc(words.slice(0, 2).join(' ') || 'Company')}</td>
  </tr></table>`;
}

function buildSignatureBody() {
  const ff = S.font === 'Helvetica Neue' ? "'Helvetica Neue', Helvetica, Arial, sans-serif" :
             S.font === 'Georgia' ? "Georgia, 'Times New Roman', serif" :
             S.font === 'Verdana' ? "Verdana, Geneva, sans-serif" :
             S.font === 'Trebuchet MS' ? "'Trebuchet MS', Helvetica, sans-serif" :
             "'Courier New', Courier, monospace";
  const fw = S.fontWeight === 'semibold' ? '600' : '400';
  const fs = S.bodySize + 'px';
  // On a dark panel the saved text colours would be unreadable, so they are
  // lifted to light values for the duration of the build. The user's own
  // settings are untouched — switch the background off and they return.
  const onDark = S.bgEnabled && isDarkColor(S.bgColor);
  const tc = onDark ? '#F2F1F7' : S.textColor;
  const ac = S.accentColor;
  const sp = S.blockSpacing + 'px';
  const al = S.alignment;

  const nameStyle = `font-family:${ff};font-size:${parseInt(fs)+2}px;font-weight:700;color:${onDark ? "#FFFFFF" : (S.nameColor||tc)};line-height:1.3;margin:0;`;
  const titleStyle = `font-family:${ff};font-size:${fs};font-weight:${fw};color:${onDark ? "#B9B6C9" : (S.titleColor||"#666")};line-height:1.3;margin:0;`;
  const fieldStyle = `font-family:${ff};font-size:${parseInt(fs)-1}px;font-weight:${fw};color:${tc};line-height:1.6;margin:0;text-decoration:none;`;
  const mutedStyle = `font-family:${ff};font-size:${parseInt(fs)-2}px;color:${onDark ? '#8F8CA3' : '#999'};line-height:1.4;`;

  // Headshot cell
  let headshotHTML = '';
  // Photo-led layouts need a bigger portrait; 64px looks like an afterthought
  // when it is the main visual element.
  const headshotSize = S.template === 'darkcard' ? 96
                     : S.template === 'spotlight' ? 84
                     : 64;
  const borderRadius = S.headshotShape === 'circle' ? '50%' : S.headshotShape === 'rounded' ? '8px' : '0';
  if (S.headshotUrl) {
    // Crop/zoom: the image is scaled past the frame and pulled back by half the
    // overflow, so it stays centred while the frame keeps its 64px box.
    const scaled = Math.round(headshotSize * (S.headshotZoom / 100));
    const offset = Math.round((scaled - headshotSize) / 2);
    headshotHTML = `<div style="width:${headshotSize}px;height:${headshotSize}px;border-radius:${borderRadius};overflow:hidden;"><img src="${esc(S.headshotUrl)}" width="${scaled}" height="${scaled}" style="display:block;width:${scaled}px;height:${scaled}px;margin:-${offset}px 0 0 -${offset}px;object-fit:cover;object-position:center;" alt="${esc(S.name)}"></div>`;
  } else {
    const initials = S.name.split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase();
    headshotHTML = `<div style="width:${headshotSize}px;height:${headshotSize}px;border-radius:${borderRadius};background:${ac};color:#fff;display:flex;align-items:center;justify-content:center;font-family:${ff};font-size:22px;font-weight:700;line-height:1;">${esc(initials)}</div>`;
  }

  // Logo
  // The real company logo is reserved for Corporate. Every other layout shows a
  // generated monogram instead, so the gallery reads as a set of designs rather
  // than the same mark nine times. A logo the user actually chose always wins.
  let logoHTML = '';
  const usingStockLogo = S.logoUrl === DEFAULT_LOGO_URL;
  const showRealLogo = S.logoUrl && (!usingStockLogo || S.template === 'corporate');

  if (showRealLogo) {
    logoHTML = `<img src="${esc(S.logoUrl)}" height="${S.logoHeight}" style="display:block;height:${S.logoHeight}px;width:auto;" alt="${esc(S.company)} logo">`;
  } else if (S.logoUrl) {
    logoHTML = generatedLogoHTML(ff);
  }

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
  const circleIcon = (svg, filled) => {
    const sz = S.contactIconSize || 22;
    const inner = Math.round(sz * 0.5);
    const scaled = (svg||'')
      .replace(/width="14"/, `width="${inner}"`)
      .replace(/height="14"/, `height="${inner}"`)
      .replace(/<svg /, '<svg style="display:block;margin:0 auto;" ');
    const glyph = filled ? '#ffffff' : ic;
    const bg = filled ? `background-color:${ic};` : '';
    const bgAttr = filled ? ` bgcolor="${ic}"` : '';
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tr><td width="${sz}" height="${sz}"${bgAttr} style="box-sizing:border-box;width:${sz}px;min-width:${sz}px;max-width:${sz}px;height:${sz}px;padding:0;${bg}border:1.5px solid ${ic};border-radius:50%;color:${glyph};text-align:center;vertical-align:middle;font-size:0;line-height:0;">${scaled}</td></tr></table>`;
  };

  let contactHTML = '';
  const activeContacts = S.contactFields.filter(f=>f.enabled && f.value);
  if (activeContacts.length) {
    contactHTML = activeContacts.map(f => {
      let val;
      if (f.type === 'email') val = `<a href="mailto:${esc(f.value)}" style="${fieldStyle}text-decoration:none;color:${tc};">${esc(f.value)}</a>`;
      else if (f.type === 'website') val = `<a href="https://${esc(f.value.replace(/^https?:\/\//,''))}" style="${fieldStyle}text-decoration:none;color:${ac};font-weight:600;">${esc(f.value)}</a>`;
      else if (f.type === 'mobile' || f.type === 'phone') val = `<a href="tel:${esc(f.value.replace(/\s/g,''))}" style="${fieldStyle}text-decoration:none;color:${tc};">${esc(f.value)}</a>`;
      else val = `<span style="${fieldStyle}">${esc(f.value)}</span>`;

      if (!S.showContactIcons) {
        return `<tr><td style="padding:3px 0;${fieldStyle}vertical-align:middle;">${val}</td></tr>`;
      }
      // Letters mode: a bold single-letter prefix instead of an icon. Renders
      // everywhere, including Outlook, because it is just text.
      if (S.contactIconMode === 'letters') {
        return `<tr><td style="padding:3px 7px 3px 0;font-family:${ff};font-size:${parseInt(fs)-1}px;font-weight:700;color:${ic};line-height:1.6;vertical-align:top;white-space:nowrap;">${esc(contactLetters[f.type]||'•')}:</td><td style="padding:3px 0;${fieldStyle}vertical-align:top;">${val}</td></tr>`;
      }
      if (S.contactIconMode === 'labels') {
        return `<tr><td style="padding:3px 8px 3px 0;${mutedStyle}white-space:nowrap;vertical-align:middle;">${esc(f.label)}:</td><td style="padding:3px 0;${fieldStyle}vertical-align:middle;">${val}</td></tr>`;
      }
      const badged = S.contactIconMode === 'circle' || S.contactIconMode === 'filled';
      const iconCell = badged
        ? circleIcon(contactIcons[f.type], S.contactIconMode === 'filled')
        : `<span style="display:inline-block;vertical-align:middle;color:${ic};width:${Math.round(S.contactIconSize*0.64)}px;height:${Math.round(S.contactIconSize*0.64)}px;">${contactIcons[f.type]||''}</span>`;
      const pad = badged ? '3px 10px 3px 0' : '1px 6px 1px 0';
      return `<tr><td style="padding:${pad};vertical-align:middle;font-size:0;line-height:0;">${iconCell}</td><td style="padding:3px 0;${fieldStyle}vertical-align:middle;">${val}</td></tr>`;
    }).join('');
    contactHTML = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody>${contactHTML}</tbody></table>`;
  }

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

  let socialHTML = '';
  const activeSocials = S.socialLinks.filter(sl=>sl.enabled);
  if (activeSocials.length) {
    const iconSz = S.socialIconSize + 'px';
    socialHTML = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody><tr>`;
    activeSocials.forEach((sl, idx) => {
      const gap = idx > 0 ? `padding-left:${S.socialStyle==='plain'?'10':'6'}px;` : '';
      const svgIcon = socialIcons[sl.type] || '';
      if (S.socialStyle === 'circle' || S.socialStyle === 'filled') {
        // Circle outline style matching Al Riyady signature
        // Dynamically resize the SVG to fill the icon area correctly
        const sz = S.socialIconSize;
        const iconScale = Math.round(sz * 0.55);
        const scaledSvg = svgIcon
          .replace(/width="16"/, `width="${iconScale}"`)
          .replace(/height="16"/, `height="${iconScale}"`)
          .replace(/<svg /, '<svg style="display:block;margin:0 auto;" ');
        const solid = S.socialStyle === 'filled';
        const glyph = solid ? '#ffffff' : ac;
        const bg = solid ? `background-color:${sc};` : '';
        const bgAttr = solid ? ` bgcolor="${sc}"` : '';
        socialHTML += `<td style="${gap}vertical-align:middle;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tr><td width="${sz}" height="${sz}"${bgAttr} style="box-sizing:border-box;width:${sz}px;min-width:${sz}px;max-width:${sz}px;height:${sz}px;padding:0;${bg}border:2px solid ${sc};border-radius:50%;color:${glyph};text-align:center;vertical-align:middle;font-size:0;line-height:0;"><a href="${socialHref(sl)}" style="display:block;text-decoration:none;color:${glyph};font-size:0;line-height:0;">${scaledSvg}</a></td></tr></table></td>`;
      } else if (S.socialStyle === 'chip') {
        socialHTML += `<td style="${gap}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${sc};border-radius:4px;padding:3px 10px;"><a href="${socialHref(sl)}" style="font-family:${ff};font-size:${parseInt(iconSz)-4}px;color:#fff;text-decoration:none;font-weight:500;white-space:nowrap;">${sl.label}</a></td></tr></table></td>`;
      } else if (S.socialStyle === 'outline') {
        socialHTML += `<td style="${gap}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:1px solid ${sc};border-radius:4px;padding:3px 10px;"><a href="${socialHref(sl)}" style="font-family:${ff};font-size:${parseInt(iconSz)-4}px;color:${sc};text-decoration:none;font-weight:500;white-space:nowrap;">${sl.label}</a></td></tr></table></td>`;
      } else {
        socialHTML += `<td style="${gap}"><a href="${socialHref(sl)}" style="font-family:${ff};font-size:${parseInt(iconSz)-2}px;color:${sc};text-decoration:none;font-weight:500;">${sl.label}</a></td>`;
      }
    });
    socialHTML += `</tr></tbody></table>`;
  }

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
  const bannerImgHTML = (S.bannerEnabled && S.bannerImage)
    ? `<img src="${esc(S.bannerImage)}" width="520" style="display:block;width:100%;max-width:520px;height:auto;border-radius:6px;" alt="${esc(S.bannerMessage || 'Campaign')}">`
    : '';

  // ── Assemble by template ──
  // Solid brand-colour block on the left holding the logo, content on the right.
  if (S.template === 'colorblock') {
    const blockW = 140;
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;text-align:${al};"><tbody>
      <tr>
        <td width="${blockW}" bgcolor="${ac}" style="width:${blockW}px;background-color:${ac};text-align:center;vertical-align:middle;padding:20px 14px;">
          ${logoHTML
            ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:separate;border-spacing:0;"><tr><td bgcolor="#FFFFFF" style="background-color:#FFFFFF;border-radius:8px;padding:10px 12px;">${logoHTML}</td></tr></table>`
            : `<div style="font-family:${ff};font-size:${parseInt(fs)+6}px;font-weight:800;letter-spacing:.04em;color:#ffffff;line-height:1.25;">${esc((S.company||'Logo').split(' ')[0].toUpperCase())}</div>`}
          <div style="font-family:${ff};font-size:${parseInt(fs)-3}px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.82);margin-top:12px;">${esc(S.title)}</div>
        </td>
        <td style="vertical-align:middle;padding:22px 24px;">
          <p style="font-family:${ff};font-size:${parseInt(fs)+4}px;font-weight:700;letter-spacing:.06em;color:${onDark ? '#FFFFFF' : (S.nameColor||tc)};line-height:1.25;margin:0;">${esc(S.name.toUpperCase())}</p>
          <p style="${titleStyle}">${esc(S.title)}</p>
          <p style="font-family:${ff};font-size:${fs};font-weight:700;color:${onDark ? '#FFFFFF' : (S.nameColor||tc)};margin:10px 0 8px;">${esc(S.company.toUpperCase())}</p>
          ${taglineHTML}
          ${contactHTML}
          ${socialHTML ? `<div style="padding-top:${sp};">${socialHTML}</div>` : ''}
        </td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="2" style="padding-top:${sp};">${bannerImgHTML}</td></tr>` : ''}
      ${S.disclaimerEnabled && S.disclaimerText ? `<tr><td colspan="2" style="padding:10px 24px 0;"><p style="${mutedStyle}">${esc(S.disclaimerText)}</p></td></tr>` : ''}
    </tbody></table>`;
  }

  // Everything on a dark card: headshot left, oversized name, contacts in two
  // columns. Reads as a designed block rather than a list of details.
  if (S.template === 'darkcard') {
    const card = isDarkColor(S.bgColor) && S.bgEnabled ? 'transparent' : '#1B2A4A';
    const solid = card !== 'transparent';
    const light = '#F2F1F7';
    const dim = '#A7A4BC';
    const pairs = [];
    for (let i = 0; i < activeContacts.length; i += 2) pairs.push(activeContacts.slice(i, i + 2));
    const grid = pairs.map(row => `<tr>${row.map(f => `<td style="padding:4px 18px 4px 0;font-family:${ff};font-size:${parseInt(fs)-1}px;color:${light};line-height:1.5;vertical-align:top;">
        <span style="color:${ac};font-weight:700;">${esc(contactLetters[f.type]||'•')}</span>&nbsp;&nbsp;${esc(f.value)}</td>`).join('')}${row.length < 2 ? '<td></td>' : ''}</tr>`).join('');

    const inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tbody><tr>
        ${S.headshotUrl ? `<td style="vertical-align:top;padding:2px 24px 0 0;">${headshotHTML}</td>` : ''}
        <td style="vertical-align:middle;">
          <p style="font-family:${ff};font-size:${parseInt(fs)-2}px;letter-spacing:.16em;text-transform:uppercase;color:${ac};margin:0 0 4px;">${esc(S.title)}</p>
          <p style="font-family:${ff};font-size:${parseInt(fs)+11}px;font-weight:700;color:#ffffff;line-height:1.1;margin:0 0 12px;">${esc(S.name)}</p>
          ${taglineHTML}
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody>${grid}</tbody></table>
          ${socialHTML ? `<div style="padding-top:${parseInt(sp)+4}px;">${socialHTML}</div>` : ''}
        </td>
      </tr></tbody></table>`;

    const wrapped = solid
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;"><tbody><tr><td bgcolor="${card}" style="background-color:${card};padding:26px 28px;border-radius:14px;">${inner}</td></tr></tbody></table>`
      : inner;

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="text-align:${al};"><tbody>
      <tr><td>${wrapped}</td></tr>
      ${bannerImgHTML ? `<tr><td style="padding-top:${sp};">${bannerImgHTML}</td></tr>` : ''}
      ${S.disclaimerEnabled && S.disclaimerText ? `<tr><td style="padding-top:${sp};"><p style="${mutedStyle}">${esc(S.disclaimerText)}</p></td></tr>` : ''}
    </tbody></table>`;
  }

  // Logo left, identity centre, a vertical rule, then contacts on the right.
  if (S.template === 'split') {
    const rule = `<td style="width:1px;background-color:${ruleColor};font-size:1px;line-height:1px;">&nbsp;</td>`;
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="text-align:${al};"><tbody>
      <tr>
        ${logoHTML ? `<td style="vertical-align:middle;padding-right:22px;">${logoHTML}</td>` : ''}
        <td style="vertical-align:middle;padding-right:26px;">
          <p style="${nameStyle}">${esc(S.name)}</p>
          <p style="${titleStyle}">${esc(S.title)}</p>
          ${taglineHTML}
          ${activeContacts.find(f=>f.type==='website') ? `<p style="font-family:${ff};font-size:${fs};font-weight:700;color:${ac};margin:6px 0 0;"><a href="https://${esc(activeContacts.find(f=>f.type==='website').value.replace(/^https?:\/\//,''))}" style="color:${ac};text-decoration:none;">${esc(activeContacts.find(f=>f.type==='website').value)}</a></p>` : ''}
          ${socialHTML ? `<div style="padding-top:${sp};">${socialHTML}</div>` : ''}
        </td>
        ${rule}
        <td style="vertical-align:middle;padding-left:26px;">${contactHTML}</td>
      </tr>
      ${bannerImgHTML ? `<tr><td colspan="4" style="padding-top:${parseInt(sp)+8}px;">${bannerImgHTML}</td></tr>` : bannerHTML ? `<tr><td colspan="4">${bannerInner}</td></tr>` : ''}
      ${S.disclaimerEnabled && S.disclaimerText ? `<tr><td colspan="4" style="padding-top:${sp};"><p style="${mutedStyle}">${esc(S.disclaimerText)}</p></td></tr>` : ''}
    </tbody></table>`;
  }

  // Thick accent bar down the left edge, logo on the right, campaign strip below.
  if (S.template === 'accentbar') {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="text-align:${al};"><tbody>
      <tr>
        <td width="4" style="width:4px;background-color:${ac};font-size:1px;line-height:1px;">&nbsp;</td>
        <td style="vertical-align:top;padding-left:18px;">
          <p style="font-family:${ff};font-size:${parseInt(fs)+3}px;font-weight:700;color:${ac};line-height:1.25;margin:0;">${esc(S.name)}</p>
          <p style="font-family:${ff};font-size:${parseInt(fs)+1}px;font-weight:700;color:${onDark ? "#FFFFFF" : (S.nameColor||tc)};line-height:1.3;margin:0 0 8px;">${esc(S.company)}</p>
          ${taglineHTML}
          ${contactHTML}
          ${socialHTML ? `<div style="padding-top:${sp};">${socialHTML}</div>` : ''}
        </td>
        ${logoHTML ? `<td style="vertical-align:top;padding:2px 0 0 20px;">${logoHTML}</td>` : ''}
      </tr>
      ${(S.bannerEnabled && (S.bannerMessage || S.ctaLabel)) ? `<tr><td colspan="3" style="padding-top:${parseInt(sp)+6}px;">
        <p style="font-family:${ff};font-size:${fs};color:${tc};line-height:1.5;margin:0;">${esc(S.bannerMessage)}${S.ctaLabel ? ` <a href="${esc(S.ctaUrl)}" style="color:${ac};text-decoration:underline;font-weight:600;">${esc(S.ctaLabel)}</a>` : ''}</p>
      </td></tr>` : ''}
      ${bannerImgHTML ? `<tr><td colspan="3" style="padding-top:${sp};">${bannerImgHTML}</td></tr>` : ''}
      ${S.disclaimerEnabled && S.disclaimerText ? `<tr><td colspan="3" style="padding-top:${sp};"><p style="${mutedStyle}">${esc(S.disclaimerText)}</p></td></tr>` : ''}
    </tbody></table>`;
  }

  if (S.template === 'spotlight') {
    // Headshot, a vertical rule, then the details — with the campaign banner as
    // a full-width card underneath rather than an inline row.
    const nameBig = `font-family:${ff};font-size:${parseInt(fs)+5}px;font-weight:700;color:${onDark ? "#FFFFFF" : (S.nameColor||tc)};line-height:1.25;margin:0;`;
    const roleBig = `font-family:${ff};font-size:${parseInt(fs)+1}px;font-weight:${fw};color:${onDark ? "#B9B6C9" : (S.titleColor||"#666")};line-height:1.35;margin:0 0 10px;`;
    const lineStyle = `font-family:${ff};font-size:${parseInt(fs)-1}px;color:${tc};line-height:1.65;`;

    // Everything except the website stacks; the website shares its line with the
    // call to action, separated by a rule, as in the reference.
    const stacked = activeContacts.filter(f => f.type !== 'website');
    const site = activeContacts.find(f => f.type === 'website');
    let lines = stacked.map(f => `<div style="${lineStyle}">${esc(f.value)}</div>`).join('');
    if (site || (S.bannerEnabled && S.ctaLabel)) {
      const parts = [];
      if (site) parts.push(`<a href="https://${esc(site.value.replace(/^https?:\/\//,''))}" style="${lineStyle}color:${tc};text-decoration:underline;">${esc(site.value)}</a>`);
      if (S.bannerEnabled && S.ctaLabel) parts.push(`<a href="${esc(S.ctaUrl)}" style="${lineStyle}color:${tc};text-decoration:underline;">${esc(S.ctaLabel)}</a>`);
      lines += `<div style="${lineStyle}">${parts.join(`<span style="color:#C9C7D2;padding:0 9px;">|</span>`)}</div>`;
    }

    const bannerCard = (S.bannerEnabled && (S.bannerMessage || S.bannerSubtext || S.ctaLabel)) ? `
      <tr><td colspan="3" style="padding-top:${parseInt(sp)+10}px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;">
          <tr><td bgcolor="#141220" style="background-color:#141220;border-radius:12px;padding:22px 24px;">
            <p style="font-family:${ff};font-size:${parseInt(fs)+7}px;font-weight:700;color:#ffffff;line-height:1.2;margin:0;">${esc(S.bannerMessage || 'Email campaign')}</p>
            ${S.bannerSubtext ? `<p style="font-family:${ff};font-size:${parseInt(fs)-1}px;font-weight:400;color:#B4B1C4;line-height:1.45;margin:6px 0 0;">${esc(S.bannerSubtext)}</p>` : ''}
            ${S.ctaLabel ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;"><tr><td bgcolor="${ac}" style="background-color:${ac};border-radius:9999px;padding:8px 20px;"><a href="${esc(S.ctaUrl)}" style="font-family:${ff};font-size:${parseInt(fs)-1}px;font-weight:600;color:#ffffff;text-decoration:none;white-space:nowrap;">${esc(S.ctaLabel)}</a></td></tr></table>` : ''}
          </td></tr>
        </table>
      </td></tr>` : '';

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="text-align:${al};"><tbody>
      <tr>
        <td style="vertical-align:top;padding:2px 20px 0 0;">${headshotHTML}</td>
        <td style="width:1px;background-color:${ruleColor};font-size:1px;line-height:1px;">&nbsp;</td>
        <td style="vertical-align:middle;padding-left:20px;">
          <p style="${nameBig}">${esc(S.name)}</p>
          <p style="${roleBig}">${esc(S.title)}</p>
          ${lines}
        </td>
      </tr>
      ${bannerCard}
      ${S.disclaimerEnabled && S.disclaimerText ? `<tr><td colspan="3" style="padding-top:${sp};"><p style="${mutedStyle}">${esc(S.disclaimerText)}</p></td></tr>` : ''}
    </tbody></table>`;
  }

  if (S.template === 'corporate') {
    // Full-width accent rule, reused above and below the logo/contact band.
    const rule = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:${S.dividerWidth}px solid ${ac};font-size:1px;line-height:1px;">&nbsp;</td></tr></table>`;
    const discStyle = `font-family:${ff};font-size:${Math.max(9, parseInt(fs)-4)}px;color:${ac};line-height:1.5;margin:0;`;
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="width:560px;max-width:100%;text-align:${al};"><tbody>
      <tr><td style="padding-bottom:${sp};">
        <p style="${nameStyle}">${esc(S.name)}</p>
        <p style="${titleStyle}">${esc(S.title)}</p>
        <p style="${titleStyle}">${esc(S.company)}</p>
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

  if (S.template === 'side-by-side') {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="text-align:${al};"><tbody>
      <tr>
        <td style="vertical-align:top;padding-right:${parseInt(sp)+6}px;">${headshotHTML}</td>
        <td style="vertical-align:top;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody>
            <tr><td><p style="${nameStyle}">${esc(S.name)}</p></td></tr>
            <tr><td><p style="${titleStyle}">${esc(S.title)} · ${esc(S.company)}</p></td></tr>
            ${logoHTML ? `<tr><td style="padding:${parseInt(sp)+6}px 0 ${parseInt(sp)+2}px;">${logoHTML}</td></tr>` : ''}
            ${dividerHTML}
            <tr><td style="padding-top:${S.dividerEnabled?'0':sp};">${contactHTML}</td></tr>
            ${socialHTML ? `<tr><td style="padding-top:${sp};">${socialHTML}</td></tr>` : ''}
            ${bannerHTML}
            ${disclaimerHTML}
          </tbody></table>
        </td>
      </tr>
    </tbody></table>`;
  }

  if (S.template === 'stacked') {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="text-align:${al};${al==='center'?'margin:0 auto;':''}"><tbody>
      <tr><td style="padding-bottom:${sp};${al==='center'?'text-align:center;':''}">${headshotHTML}</td></tr>
      ${logoHTML ? `<tr><td style="padding:${parseInt(sp)+4}px 0 ${parseInt(sp)+2}px;${al==='center'?'text-align:center;':''}">${logoHTML}</td></tr>` : ''}
      <tr><td><p style="${nameStyle}">${esc(S.name)}</p></td></tr>
      <tr><td><p style="${titleStyle}">${esc(S.title)} · ${esc(S.company)}</p></td></tr>
      ${dividerHTML}
      <tr><td style="padding-top:${S.dividerEnabled?'0':sp};">${contactHTML}</td></tr>
      ${socialHTML ? `<tr><td style="padding-top:${sp};">${socialHTML}</td></tr>` : ''}
      ${bannerHTML}
      ${disclaimerHTML}
    </tbody></table>`;
  }

  if (S.template === 'card') {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="text-align:${al};"><tbody><tr><td>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0;border:1px solid ${ruleColor};border-radius:10px;"><tbody>
        <tr>
          <td style="vertical-align:top;padding:20px 0 0 20px;">${headshotHTML}</td>
          <td style="vertical-align:top;padding:20px 20px 0 14px;">
            <p style="${nameStyle}">${esc(S.name)}</p>
            <p style="${titleStyle}">${esc(S.title)} · ${esc(S.company)}</p>
            ${logoHTML ? `<div style="padding-top:${parseInt(sp)+4}px;">${logoHTML}</div>` : ''}
          </td>
        </tr>
        <tr><td colspan="2" style="padding:${parseInt(sp)+6}px 20px 0;">${contactHTML}</td></tr>
        ${socialHTML ? `<tr><td colspan="2" style="padding:${sp} 20px 0;">${socialHTML}</td></tr>` : ''}
        ${bannerInner ? `<tr><td colspan="2" style="padding:${sp} 20px 0;">${bannerInner}</td></tr>` : ''}
        <tr><td colspan="2" style="height:20px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
      </tbody></table>
      ${disclaimerHTML ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tbody>${disclaimerHTML}</tbody></table>` : ''}
    </td></tr></tbody></table>`;
  }

  // minimal
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="text-align:${al};"><tbody>
    <tr><td><span style="${nameStyle}">${esc(S.name)}</span><span style="${titleStyle}"> · ${esc(S.title)} · ${esc(S.company)}</span></td></tr>
    ${dividerHTML}
    <tr><td style="padding-top:${sp};">
      ${activeContacts.map(f => {
        if (f.type==='email') return `<a href="mailto:${f.value}" style="${fieldStyle}text-decoration:none;color:${ac};">${f.value}</a>`;
        if (f.type==='website') return `<a href="https://${f.value.replace(/^https?:\/\//,'')}" style="${fieldStyle}text-decoration:none;color:${ac};">${f.value}</a>`;
        return `<span style="${fieldStyle}">${esc(f.value)}</span>`;
      }).join(`<span style="color:#ccc;margin:0 6px;">·</span>`)}
    </td></tr>
    ${socialHTML ? `<tr><td style="padding-top:${sp};">${socialHTML}</td></tr>` : ''}
    ${bannerHTML}
    ${disclaimerHTML}
  </tbody></table>`;
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
    if (tmplCard) { S.template = tmplCard.dataset.tmpl; renderPanel(); renderStage(); return; }

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
        if (valSpan) {
          const suffix = bind.includes('Zoom') ? '%' : 'px';
          valSpan.textContent = S[bind] + suffix;
        }
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
    }

    // Contact field editing
    if (e.target.dataset.action === 'editContact') {
      const i = parseInt(e.target.dataset.idx);
      S.contactFields[i].value = e.target.value;
      renderStage();
    }
    // Social handle editing
    if (e.target.dataset.action === 'editSocial') {
      const i = parseInt(e.target.dataset.idx);
      S.socialLinks[i].handle = e.target.value;
      renderStage();
    }
  });

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

function startCloud() {
  if (!window.Cloud || !Cloud.isReady) return;
  Cloud.onChange(() => renderHeader());
  Cloud.init().then(c => {
    renderHeader();
    if (!c.signedIn) return;
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
  syncBodyClass(); // apply a collapsed state restored from storage
  renderRail();
  renderHeader();
  renderPanel();
  renderStage();
  setupEvents();
  startCloud();
}

init();
