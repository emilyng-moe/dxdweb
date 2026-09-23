# DESIGN.md - DXD Website

## Essence
Clean, minimal, modern — a calm technical confidence. Cream paper, black ink,
one lime accent. Structure over decoration: grid lines and hairline dividers
do the work that boxes and shadows usually do. When unsure, choose the
quieter option, but let the illustrations carry warmth and personality.

## Colour
- background: --cream #FFFFFF (dark mode: #121309)
- ink (foreground): --ink #16170F
- accent: --lime #C6E84E, hover --lime-dark #A9CC2E
- line/olive accent (tags, labels, dashed guides): --olive #7C8B4A / --olive-line #A8B57A
- surface: #FFFFFF, surface-2 (on-cream panels): --cream-1 #FFFFF2
- border: #E1DFD3, hairline throughout — grid lines, card dividers, section rules
- pairs: [["--foreground", "--background"], ["--muted-foreground", "--background"]]

## Typography
- display (headings, buttons): Red Hat Display 700 — geometric, bold, tight tracking (-0.02em)
- body: Inter 400/500/600
- mono (eyebrows, tags, pills, stat labels' badges): IBM Plex Mono 500/600, uppercase, tracked
- base: 16/24
- scale: 12, 14, 16, 20, 24, 32, 48, 68

## Tokens
- source: css/tokens.css
- spacing: space-1 to space-24 (4px base)
- dark-mode: class strategy, `.dark` on <html>

## Illustration system
- Style: loose, sketchy hand-drawn ink linework — not clean/geometric vector icons. 2–2.5px ink stroke, rounded joins/caps, lime fill accents only — original artwork (not copied from any reference site's mascot/marks).
- Wobble: every large illustration carries `.illus-sketchy`, which applies an SVG turbulence filter (`#sketchy-anim` in each page's sprite defs) to the whole rendered shape — uneven line weight and a gentle "boiling ink" redraw, rather than hand-plotting irregular bezier points per path. `#sketchy-still` (a frozen, unanimated version) swaps in under `prefers-reduced-motion`. Don't apply `.illus-sketchy` to small functional UI icons (cell-icon, nav toggle) — the wobble is for decorative illustration only, not interface icons, which stay crisp.
- Character faces: figures (illus-empower, illus-people-cta) get dot eyes (`r="1.8" fill="var(--ink)"`) plus a simple curved-line mouth (`stroke-width:1.6`, no fill) — minimal, not cartoonish. No eyebrows, no detailed features.
- Sprite: the full symbol set (plus both sketchy filters) is duplicated in every page's hidden `<svg>` block near the top of `<body>` (no build step, so no cross-file `<use>` — CSS custom properties, animation classes, and filters need same-document scope).
- Hero mark: `mark-compass`, a 4-point astroid star (DXD's own geometric motif) inside a blueprint grid, slowly rotating.
- Scene illustrations: `illus-build`, `illus-ai`, `illus-empower`, `illus-people-cta`, `illus-story-featured`, `illus-photo-generic` — used in split-row features, CTA, and story/article placeholders.
- **Draw → react → rest model**: `.draw-line` (stroke draw-in, staggered via `--delay`) is the DRAW phase. `.doodle-pop` (accent dots/highlights — overshoots on scale-in: 0 → 1.22 → 0.93 → 1 — then settles into the existing opacity-breathe loop; stagger multiple instances with `--pop-delay`) and `.doodle-react` (one small asymmetric rotate on a character's gesture arm, fired once via `--react-delay` ≈ the draw duration, `--react-origin` sets the pivot point) are the REACT moment. Ambient `.float-slow`/`.float-slower` (gentle bob) and `.spin-slow`/`.spin-slower` (slow rotation) are REST. `.illus-sketchy` (hand-drawn wobble, via SVG turbulence filter) runs underneath all of it. All respect `prefers-reduced-motion`.
- **Hover redraw**: opt a small icon into `.icon-redraw` (needs `pathLength="1"` on each shape inside it) to replay its stroke draw-in on hover — used on the three Featured Products icons on the homepage as their "tiny action." Don't apply broadly; it's for icons that are worth a second look, not a default.

## Layout system
- columns: 12, maxContentWidth: 1280px
- breakpoints: [360, 767, 900, 1024]
- **Editorial canvas frame** (`.canvas`, wraps all of `<main>` on every page): a persistent
  pair of 1px vertical hairlines at the content max-width, off below 900px. Full-bleed
  section backgrounds (`.on-surface`, `.blueprint`) and the blueprint grid sit *inside* this
  frame rather than the raw viewport, so every section — hero, stats, mission, split-rows,
  Featured Products — reads as one continuous structured canvas instead of stacked,
  disconnected blocks. This is the main structural device: prefer extending it (a new
  section just needs to sit inside `.canvas` and use `.container`/`.divider-grid`/
  `.split-row` for its internal alignment) over introducing a new floating, individually
  bordered/rounded container for homogeneous content — that reads as a "card" and breaks
  the frame's continuity. `.card` still exists for genuinely one-off content, used sparingly.
- Structural motifs borrowed from the reference aesthetic: `.blueprint` grid backdrop on hero/page-intro sections — faded out at the top and bottom edges (not just toward the center) so it never visually collides with a bordered element immediately below, like a `.rule-major` or a `.divider-grid`; `.split-row` alternating 2-col feature rows with a vertical divider; `.divider-grid` — cards without borders, just shared hairlines (used for product/people grids and stat rows), hover is a background/border tint only, never a transform on the cell itself (that would break alignment with the neighbouring shared hairlines).
- **Rule: any decorative grid must mathematically coincide with real dividers, never just visually approximate them.** `background-position: center` on a repeating tile centers the *gap* between two grid lines on the container midpoint, not a line itself — lines land half a tile-width to either side. Wherever `.blueprint`'s grid shares a section with a real structural divider (e.g. `.hero-left`'s border-right, or the bridged hero→stats line), the grid's vertical-line layer is offset by `calc(50% + <half the tile size>)` so an actual grid line lands exactly on the divider, not near it — see `.blueprint`'s `background-position` and main.js's scroll-driven `updateGrid()` (which sets the same background-position inline and must stay in sync with the CSS, or it silently overrides it on scroll). A "close but not exact" line is worse than no line: it reads as a rendering bug rather than a design choice.

## Components
- manifest: none (hand-built static site, no component library)
- buttons: solid lime + black text + black border (primary), outline ghost (secondary); never two primary side by side
- tags/pills: monospace, pill-shaped; olive-on-lime-tint for category tags, ink-on-cream for path-style pills
- cards: used sparingly (people/product bordered variant, story cards) — prefer divider-grid where content is homogeneous

## Motion
- entrance: fade + 6px rise, 200ms, standard ease-out
- illustration draw-in: stroke-dashoffset animation, ~1.4s, staggered via --delay
- ambient: float/spin/pulse on illustration accents, 3–34s loops, subtle — never distracting from content
- **scroll-reveal utilities** (base.css, triggered once by a shared IntersectionObserver
  in main.js): `.reveal`/`.reveal-up`/`.reveal-left`/`.reveal-right`/`.reveal-scale` (opacity
  + transform), `.reveal-mask` (clipped upward text reveal — wrap the text in a `<span>`,
  the mask goes on the parent). `.stagger` on a parent sequences its direct children via an
  inherited `--stagger-i` custom property × `--stagger-step` (default 90ms, override inline).
  transform/opacity only — never layout properties.
- **hero entrance** (page load, not scroll-triggered): eyebrow → masked headline → lede →
  CTAs stagger in over ~900ms via `.hero-enter-*` classes + `.hero-headline`.
- **parallax** (`[data-parallax]`/`[data-parallax-x]`, main.js): elements drift based on
  distance from viewport-center, at rest when centered. Desktop + `(hover:hover) and
  (pointer:fine)` only — fully off on touch/mobile and `prefers-reduced-motion`. A static
  base transform (e.g. centering) survives via `data-parallax-base`, composed with the
  dynamic offset rather than overwritten.

## Voice & Tone
Neutral, steady, quietly confident. Second person, plain language, Singapore
English. Empty/placeholder states say so plainly (orange mono "placeholder" badge) rather than pretending to be real.

## Guardrails
- This is a public-facing marketing/informational site: no login, no personal data collection.
- Content in products/people/stories pages is placeholder pending real data — every placeholder entry is visibly badged, never silently passed off as real.
- No build step: plain HTML/CSS/JS, no npm dependency (npm registry is blocked on this account's network) — the SVG sprite is duplicated inline per page rather than fetched, to keep CSS variables/animation classes in the same document scope.
- Every page must be usable at 360px width.
- Illustrations are original work inspired by, but not copied from, any reference site's specific character art or exact mark geometry.

## Overrides
(none)
