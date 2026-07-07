# AGENTS.md — Read First

You are working on **AetherTwin Fairy OS**, a local-first app where every fairy is a specialized skill agent.

## Non-negotiable principles

1. **Consent before control**
   - Fairies may sense context and suggest actions.
   - Fairies must ask before editing files, deleting, sending, posting, submitting applications, running destructive commands, spending money, or using private data.

2. **Grounded magic**
   - Keep the mystical interface.
   - Keep the practical action visible underneath.
   - Example: “Forge Application” should also show “Creates fit_report.md, cover_letter.md, resume_notes.md”.

3. **Agent-sentience is a product metaphor**
   - Do not claim the fairies are literally alive or conscious.
   - Define them as adaptive, memory-rich, permissioned AI companions.

4. **Every fairy has strengths and weaknesses**
   - Never make a fairy perfect.
   - Weaknesses drive council collaboration.
   - A fairy’s shadow risk should be visible in the UI.

5. **Local-first by default**
   - Store sensitive data locally unless the user explicitly connects a provider.
   - API keys must be stored securely; do not hardcode keys.

6. **User voice and aesthetic matter**
   - Keep the fantasy-tech, cozy, magical, purple/pink/gold, fairy-library feel.
   - Avoid sterile enterprise dashboard tone.

## Architecture intent

```txt
User signals
  -> AetherSense perception layer
  -> Fairy skill router
  -> Fairy soul profile + memory tree
  -> API/local model adapter
  -> Permission gate
  -> Tool/action execution
  -> Outcome + reflection log
  -> Fairy evolution update
```

## File map

```txt
src/App.jsx                 main UI and interaction state
src/styles.css              visual system
src/data/fairies.js         default fairy Genesis profiles
src/data/skills.js          skill registry
src/lib/storage.js          LocalStorage + export helpers
src/lib/rituals.js          routing, council, genesis utilities
docs/PRODUCT_SPEC.md        product requirements
docs/ARCHITECTURE.md        system design
docs/ROADMAP.md             build phases
docs/SECURITY_PERMISSIONS.md safety and permission model
docs/CAREER_SMITH.md        ai-job-search integration plan
docs/DATA_SCHEMA.md         local schema proposal
prompts/AGENT_BUILD_PROMPT.md handoff prompt for another agent
examples/fairy-soul.example.json example generated vessel
```

## Current tech

- React + Vite
- LocalStorage persistence
- Local LLM adapter (Ollama) — `template` offline mode + `local` model mode, graceful fallback
- Self-model + Memory Tree personalization (`src/lib/selfModel.js`)
- Evolution engine: feedback -> reflection -> fairy XP/trait tuning (`src/lib/evolution.js`)
- Consent-gated desktop perception stubs + Tauri shell scaffold (`src/lib/desktopSense.js`, `src-tauri/`)
- Live **Fairy Hub** (Hub tab): animated court renderer + event bus so you watch agents work (`src/lib/fairyHub.js`, `src/lib/fairyHubRenderer.js`)
- No backend network calls (Ollama is localhost only)
- No real irreversible actions without a permission prompt

## Recommended next implementation

Build the local vault:

```txt
Electron/Tauri shell
SQLite database
Markdown vault
LLM adapter interface
Tool permission registry
Fairy evolution log
```

## Acceptance criteria for any change

- `npm run build` passes.
- No hidden network calls.
- No irreversible action without a permission prompt.
- New fairy features update the agent docs if they alter architecture.
- UI remains usable on desktop and mobile widths.

