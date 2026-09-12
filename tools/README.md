# Tools

Three headless-browser harnesses. None of them ship — `tools` is listed in
`.assetsignore`, so Cloudflare never serves this directory.

Open them from a local server or straight off disk. Each reports its result in
`document.title`, so a check can be read without a screenshot:

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
& $edge --headless=new --disable-gpu --virtual-time-budget=10000 `
        --dump-dom "file:///$PWD/tools/editor-checks.html" |
  Select-String '<title>(.*?)</title>'
```

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
