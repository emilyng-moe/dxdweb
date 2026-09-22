# DESIGN.md - DXD Website

## Essence
Clean, minimal, modern — a calm technical confidence. Cream paper, black ink,
one lime accent. Structure over decoration: grid lines and hairline dividers
do the work that boxes and shadows usually do. When unsure, choose the
quieter option, but let the illustrations carry warmth and personality.

## Colour
- background: --cream #F6F5F0 (dark mode: #121309)
- ink (foreground): --ink #16170F
- accent: --lime #C6E84E, hover --lime-dark #A9CC2E
- line/olive accent (tags, labels, dashed guides): --olive #7C8B4A / --olive-line #A8B57A
- surface: #FFFFFF, surface-2 (on-cream panels): --cream-1 #F1F0EA
- border: #E1DFD3, hairline throughout — grid lines, card dividers, section rules
- pairs: [["--foreground", "--background"], ["--muted-foreground", "--background"]]

## Typography
- display (headings, buttons): Space Grotesk 700 — geometric, bold, tight tracking (-0.02em)
- body: Inter 400/500/600
- mono (eyebrows, tags, pills, stat labels' badges): IBM Plex Mono 500/600, uppercase, tracked
- base: 16/24
- scale: 12, 14, 16, 20, 24, 32, 48, 68

## Tokens
- source: css/tokens.css
- spacing: space-1 to space-24 (4px base)
- dark-mode: class strategy, `.dark` on <html>

## Illustration system
- Style: hand-drawn line art, 2–2.5px ink stroke, rounded joins/caps, lime fill accents only — original artwork (not copied from any reference site's mascot/marks).
- Sprite: img/illustrations.svg holds all <symbol> definitions; inlined into each page's <body> (no build step, so no cross-file <use> — CSS custom properties and animation classes need same-document scope).
- Hero mark: `mark-compass`, a 4-point astroid star (DXD's own geometric motif) inside a blueprint grid, slowly rotating.
- Scene illustrations: `illus-build`, `illus-ai`, `illus-empower`, `illus-people-cta`, `illus-story-featured`, `illus-photo-generic` — used in split-row features, CTA, and story placeholders.
- Animation classes (base.css): `.draw-line` (stroke draw-in), `.float-slow`/`.float-slower` (gentle bob), `.spin-slow`/`.spin-slower` (slow rotation), `.pulse-soft` (opacity breathe). All respect `prefers-reduced-motion`.

## Layout system
- columns: 12, maxContentWidth: 1280px
- breakpoints: [360, 767, 900, 1024]
- Structural motifs borrowed from the reference aesthetic: `.blueprint` grid backdrop on hero/page-intro sections; `.split-row` alternating 2-col feature rows with a vertical divider; `.divider-grid` — cards without borders, just shared hairlines (used for product/people grids and stat rows).

## Components
- manifest: none (hand-built static site, no component library)
- buttons: solid lime + black text + black border (primary), outline ghost (secondary); never two primary side by side
- tags/pills: monospace, pill-shaped; olive-on-lime-tint for category tags, ink-on-cream for path-style pills
- cards: used sparingly (people/product bordered variant, story cards) — prefer divider-grid where content is homogeneous

## Motion
- entrance: fade + 6px rise, 200ms, standard ease-out
- illustration draw-in: stroke-dashoffset animation, ~1.4s, staggered via --delay
- ambient: float/spin/pulse on illustration accents, 3–34s loops, subtle — never distracting from content

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
