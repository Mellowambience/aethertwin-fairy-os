# AetherTwin Fairy OS — v0.4 Intimacy + Evolution Layer

Built on top of the v0.3 MVP. This release makes the OS *know you* and *improve
itself* — locally, with consent gates, no cloud billing.

## What changed

### 1. Intimacy (self-model) — `src/lib/selfModel.js`
- `buildUserContext(state)` assembles a durable operator profile from:
  - **CORE_SEEDS** — facts Amara explicitly shared (Cash App, job status, the
    living-world RPG/MMO goal, the 60/20/20 split, voice preferences, the
    consent law). Edit `CORE_SEEDS` as the relationship deepens.
  - The live **Memory Tree** (user-editable leaves).
  - An optional **user-typed profile** string stored in state.
- This context is injected into *every* model call, so fairies answer as if
  they truly know the operator. No PC filesystem is read to build it — it is
  explicit, editable, and local.

### 2. Live local model — `src/lib/modelAdapter.js` + AetherSense tab
- `template` (offline) mode: instant hardcoded whispers (default).
- `local LLM` mode: calls Ollama at localhost:11434 (Qwen3-14B court / Devstral
  code). On ANY failure it falls back to the template whisper — the OS never
  breaks. See `docs/MODEL_SETUP.md`.
- `synthesizeCouncil()` uses the live model for a grounded next-step when in
  local mode.

### 3. Evolution — `src/lib/evolution.js`
- After each whisper you can **Accept / Edit / Reject**. Each reaction records a
  `reflection` (matches `docs/DATA_SCHEMA.md`) and tunes that fairy's **XP and
  level** and appends a `growthPath` lesson. The XP formula: `level =
  floor(xp/60)+1`; accept +12, edit +6, save +4, reject -3, ignored 0.
- This is the self-improve loop: the OS patches/tunes itself from your feedback.

### 4. Desktop perception (consent-gated) — `src/lib/desktopSense.js` + `src-tauri/`
- `Sense clipboard` / `Sense project folder` buttons exist in AetherSense. In the
  browser prototype they return honest stubs explaining what the desktop shell
  *would* do. In the Tauri build they only fire when the user has granted that
  fairy the permission and confirmed the specific action.
- `src-tauri/bridge-contract.ts` defines the IPC contract; `src-tauri/README.md`
  explains the layered safety (front-end grant → permission snapshot → Rust
  re-verify → one-time confirm token for irreversible actions).

## Honest boundary
The OS knows *you* (goals, constraints, voice, the game design) and can patch,
debug, and evolve itself. It does **not** silently read your PC. Every
filesystem / clipboard / screen / account action is gated by the Permission
Grimoire + a one-time confirm — that is the product's core law, not a limitation
to remove.

## Tests
```bash
npm test
```
- `scripts/test-model-router.mjs` — routing table, grounded prompt, mock adapter,
  graceful fallback (8 assertions).
- `scripts/test-evolution-selfmodel.mjs` — self-model injection, XP/level tuning,
  reflection shape, growth-path dedup (11 assertions).
