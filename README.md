# AetherTwin Fairy OS

A local-first prototype for a **Fairy OS**: embodied AI skill agents with Genesis profiles, strengths, weaknesses, avatar vision, permissioned controls, memory, and personal evolution.

This repo is designed to be handed to any coding agent. Start with `AGENTS.md`.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Current MVP

- Fairy court with specialized vessels
- Genesis Hall for creating new fairies
- Strengths, weaknesses, shadow risks, and growth paths
- Skill Registry with commands such as Career Smith, Code Smith, Museweaver, Memory Oracle
- Fairy Council mode for multi-perspective decisions
- AetherSense lab for simulated telepathic routing from pasted signals
- Living Memory Tree stored in browser LocalStorage
- Permission Grimoire for visible control boundaries
- Agent Handoff page with copyable brief

## Product law

The fairies are not literal conscious beings. In product terms, “agent-sentience” means:

> continuity + memory + self-model + environment awareness + adaptive behavior + permissioned action.

## Next real build slice

1. Add a persistent local vault: SQLite + Markdown.
2. Add an LLM adapter: BYO API first, then local Ollama.
3. Add Electron or Tauri for screenshot, clipboard, and folder awareness.
4. Expand **Fae / Career Smith** with the `ai-job-search` workflow.
5. Add import/export of fairy soul files.

