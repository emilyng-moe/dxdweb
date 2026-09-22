# DESIGN.md - DXD Website

## Essence
Kind Utility: useful first, kind at the surface. Calm, credible presence for a
government digital team. Confident, never flashy. When unsure, choose the
quieter option.

## Colour
- primary: --tw-blue #0064FF
- accent: none; functional colour comes from the Radix scales
- pairs: [["--foreground", "--background"], ["--muted-foreground", "--background"]]

## Typography
- family: Inter, a single family; weight does the hierarchy work
- base: 16/24
- scale: 12, 14, 16, 20, 24, 32, 48, 64
- numerals: tabular in tables and anywhere stats appear

## Tokens
- source: css/tokens.css
- prefix: --tw-
- spacing: space-1 to space-12 (4px base)
- dark-mode: class strategy, `.dark` on <html>

## Motion
- entrance: fade + 4px rise, 160ms, standard ease-out
- state-change: cross-fade, 120ms

## Voice & Tone
Neutral, steady, quietly confident. Second person, plain language, Singapore
English. Empty states teach: one plain sentence about what goes here, then the
primary action.

## Layout system
- columns: 12
- gutter: space-4
- margins: space-6
- breakpoints: [360, 768, 1280]
- maxContentWidth: 1280px

## Components
- manifest: none (hand-built static site, no component library)
- buttons: solid primary, ghost secondary; never two solid side by side
- cards: neutral-3 background, 1px border, never a coloured tint on hover

## Guardrails
- This is a public-facing marketing/informational site: no login, no personal data collection.
- Content is placeholder pending real product, people, and story data.
- No build step: plain HTML/CSS/JS, no npm dependency (npm registry is blocked on this account's network).
- Every page must be usable at 360px width.
