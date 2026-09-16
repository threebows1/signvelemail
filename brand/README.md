# Brand marks

The source files the site's marks are cut from. Nothing loads them — `brand` is
in `.assetsignore`, so Cloudflare never serves this folder. The site draws the
mark as inline `<svg>` in each page instead, because a mark that arrives with
the markup cannot be the thing that fails to load.

Keeping the source here is what makes it possible to tell whether the inline
copies have drifted.

| File | Stroke | Dot |
|---|---|---|
| `signvel-mark-dark.svg` | `#8B6BFF` → `#00E5A0` | `#C08CEE` |

## Where it is used

Every footer: `index.html` plus the six pages that share `site.css`. Seven
copies in all.

It is lighter than the mark above it in the nav, which still runs
`#5B2EFF` → `#00E5A0` with a `#9D4EDD` dot. On white the new purple end reads
at about 3.7:1 against the old 6.4:1 — softer, which suits a footer, and worth
knowing if it is ever asked to carry more weight than that.

## Where it is not

**The navs.** Six pages, still the older mark. There is no light-ground source
file to check them against.

**The home masthead.** Solid white on the purple hero, and deliberately so:
`#8B6BFF` on that `#5B2EFF` ground is 1.7:1 and all but vanishes. White is
6.4:1.

**The editor rail.** Worth knowing about, because there is a real problem
there. The mark sits in a `#5B2EFF` tile and is drawn in a `#5B2EFF` gradient,
so the purple half of the squiggle is the same colour as what is behind it and
simply is not visible — only the mint half survives. Two ways out: drop the
tile and let the mark sit on the rail's own `#161422`, which is the ground this
dark variant is drawn for and where it looks best; or keep the tile and draw
the mark in white, as the masthead already does. Neither has been done.
