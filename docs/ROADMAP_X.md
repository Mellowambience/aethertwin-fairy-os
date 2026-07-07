# Roadmap — AetherTwin Fairy OS + X revenue

Last updated: 2026-07-06. Two tracks running in parallel: **build the OS** and
**build the audience that pays for it**. Both are budget-free.

## Track A — Audience & revenue (X, @GoddessAther)
Goal: compound a build-in-public audience that funds the game, on a 60/20/20 split
(60% checking / 20% savings / 20% Polymarket). No paid API, no auto-posting.

- [x] Local content engine (`npm run content` → `content/queue.json`) — drafts, never posts
- [x] `docs/X_REVENUE_PLAYBOOK.md` — strategy, cadence, guardrails
- [ ] Post 1 devlog/day from real Hub activity (start now)
- [ ] Weekly architecture thread
- [ ] Screenshotsaturday every week (HUD/court capture)
- [ ] Ko-fi at 500 followers
- [ ] Patreon / agent-template sales at 2k followers
- [ ] Polymarket bankroll once revenue self-funds (20% slice)
- [ ] Revisit X API automation ONLY if revenue covers the ~$100/mo cost

## Track B — Fairy OS core
### Done (v0.4)
- [x] Local LLM adapter (Ollama + GGUF; Qwen3-14B / Devstral / 8B fallback), template fallback
- [x] Self-model + Memory Tree personalization (`selfModel.js`)
- [x] Evolution engine: feedback → reflection → XP/trait tuning (`evolution.js`)
- [x] Consent-gated desktop perception stubs + Tauri scaffold (`desktopSense.js`, `src-tauri/`)
- [x] **Fairy Hub** (Hub tab): live animated court + event bus (`fairyHub.js`, `fairyHubRenderer.js`)
- [x] 29/29 local tests green; zero network calls

### Next (v0.5 — make it actually agent)
- [ ] Pin npm deps (replace `latest`), add lockfile, run `npm run build` on networked machine
- [x] **Fae Career-Smith slice** (`docs/CAREER_SMITH.md` → `src/lib/careerSmith.js` + `CareerSmith` tab): paste job post → Fae fit report (remote-only, energy-cost, alignment), Selena red-flag scan, draft packet, save to Memory Tree. No submission. 14 tests.
- [ ] Retire `nexus-mvp` into Fairy OS
- [ ] Real AetherSense consent watcher (filesystem/clipboard/screen) behind Tauri Rust shell
- [ ] Export Hub activity → `content/hub-activity.json` so the content engine uses real signal
- [ ] Multiplayer-ready state model (optional, single-player-first)

### Later
- [ ] Living-world sim: tribes/civilizations that evolve
- [ ] In-game economies + agent-to-agent value
- [ ] Autonomous earning loop (Coinmoth) under consent

## Principles (non-negotiable)
- Local-first, budget-free. No paid API until revenue pays for it.
- Consent law: sense & suggest; ask before file/edit/post/spend/delete/submit.
- Memory + shipped work are sacred; models are replaceable.
- Account stays 100% Amara's. Engine drafts; human posts.
