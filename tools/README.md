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

A harness that loads a page which may redirect has to read the source with
`fetch()` rather than off the frame — see `templates-gate-check.html`, where by
the time the frame is worth inspecting it is already showing the editor.

### `editor-checks.html` — functional suite
Boots the real editor, clicks through every rail section and template card, and
asserts the design controls actually reach the output. Title reads `PASS`, or
`FAIL n` with the failures listed in the report block at the bottom of the page.

### `template-sheet.html` — visual contact sheet
Renders all seventeen layouts one above another for side-by-side comparison.
`#a` and `#b` in the URL split it in half, which is what makes a full-height
screenshot possible — Edge caps how tall a `--screenshot` can be.

### `regenerate-showcase.html` — showcase generator
Prints the markup for the gallery on `templates.html`. Run it after changing any
template, copy the contents of the `<pre>`, and replace the cards between
`<div class="tmpl-gallery">` and its closing `</div>`. The page holds static
copies so it has no dependency on `app.js` at runtime; regenerating from here is
what keeps those copies honest rather than hand-edited.

### `regenerate-home-showcase.html` — home page signatures
Prints the three signatures shown on the home page's dark band (Spotlight,
Dark card, Ribbon). Run it after changing those templates, then paste each into
the matching `.sig-slab-canvas` in `index.html`.

### `gallery-check.html` — home page signature gallery
Drives the tabbed gallery on the home page: that each tab shows its own panel
and only its own, that `aria-selected` and the roving tabindex follow, that the
arrow keys move and wrap, and that every panel holds real signature markup.

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

### `templates-gate-check.html` — the templates gate
`templates.html` carries a `noindex` and is held behind sign-in. This checks the
source for the meta tag, the cloud scripts, the redirect target and the reveal
fallback, then watches what the framed page actually does. A redirect and a
reveal are both correct outcomes — the failure it is looking for is neither,
which leaves a permanently blank page.

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
