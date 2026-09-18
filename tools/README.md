# Tools

Headless-browser harnesses. None of them ship — `tools` is listed in
`.assetsignore`, so Cloudflare never serves this directory.

Each reports its result in `document.title`, so a check can be read without a
screenshot. Run one with:

```powershell
powershell -ExecutionPolicy Bypass -File tools/run-check.ps1 home-check.html
```

`run-check.ps1` launches Edge, redirects the DOM to a file and prints the title
plus the report block. Two details in it are load-bearing, and both were learnt
the hard way:

* **The redirect to a file.** Edge's stdout does not reach PowerShell's
  pipeline when it is started with the call operator here. `--dump-dom` then
  returns nothing at all, which reads as "the suite never ran" rather than as a
  failure.
* **`--allow-file-access-from-files`.** Without it a harness cannot read into
  the page it frames, so every assertion about the framed document throws.

A harness that drives a page far enough to be worth asserting about often finds
it has navigated somewhere else by then, so the source is read with `fetch()`
rather than off the frame — see `auth-pages-check.html`.

### `editor-checks.html` — functional suite
Boots the real editor, clicks through every rail section and template card, and
asserts the design controls actually reach the output. Title reads `PASS`, or
`FAIL n` with the failures listed in the report block at the bottom of the page.

### `template-sheet.html` — visual contact sheet
Renders all seventeen layouts one above another for side-by-side comparison.
`#a` and `#b` in the URL split it in half, which is what makes a full-height
screenshot possible — Edge caps how tall a `--screenshot` can be.

### `regenerate-showcase.html` — the seventeen layouts
Prints every layout's real output as a set of gallery cards. It fed the gallery
on `templates.html`, and that page has been removed, so nothing consumes this
now — it is kept because it is the quickest way to see what all seventeen
actually produce without clicking through the editor one template at a time.

### `regenerate-home-showcase.html` — home page signatures
Prints the three signatures shown on the home page's dark band (Spotlight,
Dark card, Ribbon). Run it after changing those templates, then paste each into
the matching `.sig-slab-canvas` in `index.html`.

### `gallery-check.html` — home page signature gallery
Drives the tabbed gallery on the home page: that each tab shows its own panel
and only its own, that `aria-selected` and the roving tabindex follow, that the
arrow keys move and wrap, and that every panel holds real signature markup.

It also measures the white card on every tab and fails if it is not the same
size each time. The layouts run from 440×199 to 668×360, so a card sized to its
contents jumped on every press and moved the rest of the section with it. The
card is measured as rendered rather than read off the stylesheet, so a change
to its padding or to any one signature's width is caught as well — and a second
assertion catches the opposite mistake, a card too small for the widest layout
scrolling sideways instead.

Both are asked at whatever width this happens to run at.
`gallery-fit-check.html` is the one that walks the viewport.

### `home-check.html` — home page, everything below the hero
Drives the three tablists (gallery, how-it-works stepper, before/after toggle)
through the same generic implementation they share, then the layout thumbnails,
the swatches and typeface pills — asserting the miniature signature's *computed*
colour and font actually changed, not just that a custom property was set — and
the copy button's feedback. Also asserts the page no longer claims a 7-day
trial, and measures `scrollWidth` against `clientWidth` in exact-width frames at
360, 768 and 1280. Overflow is measured, never screenshotted: headless Edge
clamps its viewport to 504px, so a narrow window renders a cropped 504px layout
and reports a width that was never used.

### `make-email-logo.html` — auth email logo
Draws the mark from `index.html` onto a canvas and hands back a PNG. The auth
email templates cannot use the inline `<svg>`: Gmail, Outlook and Yahoo all
strip SVG out of mail, so the mark has to be a raster served over HTTPS.

Rendered at 144×60 and displayed at 48×20, so it stays sharp on a retina
screen. The ground is filled with `#F5F4FB` to match the email header rather
than left transparent — Outlook's handling of PNG alpha is the one thing here
with a history of rendering as a black box.

Either open it and click **Download**, or run it headlessly, which writes the
file straight to the repository root where Cloudflare serves it from:

```powershell
powershell -ExecutionPolicy Bypass -File tools/make-email-logo.ps1
```

### `auth-pages-check.html` — signin, signup and reset
Reads the source of all three pages for the ids `auth.js` reaches for and the
script order it depends on, then drives `auth.js` itself against a stubbed
Cloud: validation, the confirm-email branch, an error coming back from the
server, and a reset link arriving without a recovery session.

The last block is the one worth keeping. `?next=` is how the editor sends
somebody to sign in and gets them back, and a query string is attacker-supplied
— so five hostile values are pushed through it and the destination has to come
out as `editor.html` every time.

### `pricing-check.html` — the billing toggle
Flips the toggle in a frame and checks the figures, not the classes. The yearly
column is asserted as arithmetic — monthly × 12 × 0.75 — so editing a monthly
price without editing its yearly twin fails here rather than on the page.

### `site-check.html` — every page, shallow and wide
The other harnesses drive one thing deeply. This one loads each page in turn
and asks what goes wrong quietly between releases: did every image arrive
(`naturalWidth`, because a 404 still leaves the element in the DOM), did every
stylesheet load, did the page's own script run (the copyright year is the
tell), does every internal link point at a file that exists, does every
fragment link have something to land on, and does anything scroll sideways.

CSS background images are fetched separately — they are invisible to the DOM,
so an unreachable one would otherwise pass.

`editor.html` and `admin.html` are deliberately excluded: both send a visitor
without a session to `signin.html`, so an iframe of either ends up somewhere
else mid-assertion. `gate-check`, `editor-checks` and `admin-check` cover them
against a stubbed Cloud instead.

```powershell
powershell -File tools/run-check.ps1 site-check.html 90000
```

### `admin-check.html` — the admin panel
Two halves, like `auth-pages-check.html`: the source of `admin.html` (script
chain, `noindex`, and the deliberate absence of analytics on a page carrying
customer addresses), then the behaviour of `admin.js` against a stubbed Cloud.

The markup is not copied into the harness — it is fetched from `admin.html`
and mounted, so a renamed id fails here instead of quietly breaking the panel.
`admin.js` is loaded once and then driven through `ADMIN.start()`, because it
binds its listeners to the document and a second evaluation would double every
click; the three cases are the three answers `Cloud.init()` can give.

The assertions worth keeping honest are the ones about authority: a visitor
with no session is sent to sign in rather than shown a panel that asks for
customer data, a signed-in non-admin triggers no admin calls at all, and no
plan button anywhere targets the signed-in admin's own account. The export is
checked for formula injection too — an address is attacker-supplied text, and
`=cmd|...` in a CSV cell is a real attack on whoever opens it.

Both halves were confirmed to fail before being trusted: removing the self-row
guard produced four failures, and removing the formula guard produced a fifth.

### `gate-check.html` — the editor lock
The editor is for account holders, so it locks before the first render and
sends anyone without a session to `signin.html?next=editor.html`. Run it with
`#out`, `#in` and `#off` — signed out, signed in, and no cloud configured at
all, the local-checkout case that must not lock anyone out of their own copy.

`window.__navigate` is how it reads the destination: `lockEditor()` calls that
seam instead of `location.replace` when a harness has provided one, so the
redirect can be asserted without the harness leaving the page mid-run.

```powershell
powershell -ExecutionPolicy Bypass -File tools/run-check.ps1 "gate-check.html#out"
```

### `gallery-fit-check.html` — the gallery card at every width
`gallery-check.html` asserts the card holds one size and does not scroll, but
only at the width it happens to run at. The signatures are 440–668px of
fixed-width table, so whether they fit is entirely a question of viewport —
which is the part that broke: fine on a desktop, scrolling sideways with the
photo cut off on a narrower window.

`home.css` scales the signature down in steps below 820px. This walks both
sides of every step and fails if any layout makes the card scroll. Changing a
zoom value without re-running this is how the steps drift out of agreement with
the widths they were cut for.

Note that the overflow is asked of the card, the element that actually scrolls.
The obvious check — the frame's `scrollWidth` against the card's `clientWidth`
— is wrong twice: `clientWidth` includes the card's padding, and `scrollWidth`
is in the frame's own pre-zoom coordinate space, so it cannot see the scaling
at all. That version passed while the card was visibly scrolling.

### `encoding-check.html` — source files are UTF-8
Reads every source file as raw bytes and fails on three things: the byte
patterns left behind when a UTF-8 file is read as ANSI and written back as
UTF-8, a byte-order mark, and anything that is not strictly valid UTF-8. The
decode uses `fatal: true`, so a broken file errors rather than quietly turning
into replacement characters.

This exists because it happened. `app.js` was edited with a tool that rewrote
its encoding, shipped with 1,664 doubled sequences, and stayed live until the
editor's own warning strip was noticed rendering as mojibake — every other
check passed the whole time, because doubled characters still parse.

The repair then went wrong in the opposite direction: reversing the damage also
converted lines added *after* it, which were already correct, leaving one
CP1252 byte that made the file invalid UTF-8. `editor-checks.html` passed —
a stray byte in a comment does not stop JavaScript parsing — and this caught it.

The signatures are why it matters more here than in most projects. They are
copied into someone's mail client and sent to their customers, so a mangled
character does not stay in our interface; it goes out under their name.

### `editor-fit-check.html` — the editor at narrow widths
`styles.css` carried no media query at all, and the shell is two fixed columns
— an 84px rail and a 392px panel — with the stage taking what is left. Below
about 1000px the top bar's buttons ran past the right edge, and since `.body`
is `overflow:hidden` they were not cramped but gone: **Export HTML could not be
reached**.

This is the editor's own shell with the cloud stubbed as a signed-in account,
so the rail and the account control render at their widest. It measures its own
viewport rather than an iframe's, so pass the width through Edge:

```powershell
powershell -File tools/run-check.ps1 editor-fit-check.html    # add --window-size
```

It fails on anything that overflows, on the page scrolling sideways, and on any
top-bar button whose right edge sits past the bar's — a button half off-screen
is still unreachable.

Two things to know. A portrait monitor is the obvious way to reach these
widths; **display scaling is the quiet one** — Windows at 125% turns a 1080px
screen into 864 CSS pixels, which is inside the range that broke, and is how
this was found. And headless Edge clamps its viewport at 504px, so asking for
less than that measures 504 and reports it: the narrow end is covered down to
roughly there, not to a phone.

### `make-favicon.html` — the site icon
Rasterises the mark for the sizes that still want a bitmap: 180px for iOS home
screens, and as the fallback for browsers that ignore an SVG icon. `favicon.svg`
is the primary and is hand-written; this produces `favicon.png` beside it.

```powershell
powershell -ExecutionPolicy Bypass -File tools/make-favicon.ps1
```

The three previews are the reason it is a page rather than a one-liner. A
favicon is judged at 16px, and the gradient the site uses on white turns to mud
at that size — so the icon uses the masthead's treatment instead, solid white
on purple, which is the one version of the mark drawn for a saturated ground.

### `make-headshot.html` — a square crop of a wide portrait
The editor cannot do this itself: its Crop/zoom slider scales from the centre
and stops at 200%, so on a full-length office photograph it enlarges the chest
rather than reaching the face. The stock portraits dodge the problem by having
Unsplash crop them server-side (`fit=facearea`); this does the same locally for
an image of your own.

Put the original at `tools/source-portrait.jpg`, then:

```powershell
powershell -File tools/make-headshot.ps1
powershell -File tools/make-headshot.ps1 -X 2295 -Y 480 -S 2200   # nudge the box
```

It writes `admin-portrait.jpg` to the repository root — the portrait the editor
offers an administrator in the Media section. The crop box is in the source
image's own pixels and is clamped to it, so a number past the edge is reported
rather than drawn as transparent bands.

JPEG rather than PNG because it is a photograph that ends up in email: the same
400px square is about 50KB as JPEG against 400KB as PNG, and Gmail clips a
message over roughly 102KB. The runner says so if the file creeps past 120KB.

Three previews, and the 78px one is the one that decides it — that is the size a
signature actually renders a headshot at, and a crop that reads well at 400 can
put the chin on the edge at 78. The third shows the box drawn on the whole
frame, so a bad number is obvious before a deploy rather than after.
