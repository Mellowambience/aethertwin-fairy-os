# Integrations

## Model adapters

Use a single adapter interface so the Fairy OS can support multiple brains.

Targets:

- mock adapter for development
- OpenAI-compatible BYO API
- Ollama local model
- future provider adapters

## Desktop shell

Electron or Tauri can provide:

- current folder
- selected screenshot region
- clipboard watcher
- active window title
- local file writes
- secure storage for keys

All capabilities must pass through the Permission Grimoire.

## Browser extension wings

Future extension context:

- job posts
- GitHub repos
- X drafts
- Google Docs text selection
- portfolio pages

Right-click actions:

- Ask Fae
- Ask Stella
- Ask Glint
- Ask Lyra
- Save to Memory Tree
- Forge into Project

## GitHub / agent handoff

For coding agents:

- `AGENTS.md` is the first file to read.
- `docs/ROADMAP.md` contains next milestones.
- `docs/SECURITY_PERMISSIONS.md` defines action boundaries.

