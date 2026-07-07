# Fairy Hub — watch your agents work

A live **Hub** tab (radio icon) renders the fairy court as an animated
constellation. Each fairy is an orb; when it channels, perceives, evolves, or
remembers, its orb pulses in a color unique to the activity kind.

## What you see
- **Court canvas** (center): orbs arranged in a ring around the AetherTwin
  core. Orb size scales with fairy level. Recent activity sends a colored pulse
  ring outward.
- **Roster** (left): each fairy, its level, and its current/latest activity
  state. Click to focus.
- **Live feed** (center-right): a timestamped stream of every action emitted by
  any fairy, newest first.
- **Focused fairy** (right): the selected fairy's purpose, XP bar, and total
  action count.

## How it's driven (no fakery)
`src/lib/fairyHub.js` is a tiny event bus. Every fairy action in `App.jsx`
emits to it:
- `handleSignal` → `channel` (local LLM) or `signal` (template)
- `reactToWhisper` → `evolve`
- `senseClipboard` / `senseFolder` → `perceive`
- `addMemory` → `remember`

The renderer (`src/lib/fairyHubRenderer.js`) reads `getActivity()` every frame,
so the visualization is a truthful reflection of actual app state — not a canned
animation.

## Renderer choice (you pointed at PixiJS)
- **Canvas** (default): pure Canvas2D, **zero dependencies**, works immediately
  on `npm install && npm run dev`.
- **PixiJS** (toggle): real PixiJS v8 WebGL renderer, your attached preference.
  It lazy-imports `pixi.js`, so the app never breaks if Pixi isn't installed.
  After `npm install pixi.js`, flip the toggle to see the same court on the
  WebGL pipeline. If Pixi is missing, the Hub shows an inline error instead of
  crashing.

## Tests
`npm test` includes `scripts/test-fairy-hub.mjs` (feed capture, per-fairy
counts, subscribe/unsubscribe, kind normalization) — 10 assertions.
