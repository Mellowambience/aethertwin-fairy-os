# Architecture

## Current MVP architecture

```txt
React UI
  -> in-memory state
  -> LocalStorage persistence
  -> static fairy data
  -> static skill registry
  -> simulated routing + council outputs
```

## Target architecture

```txt
Renderer UI
  -> Fairy OS Client State
  -> Local Vault Service
      -> SQLite
      -> Markdown files
      -> Embeddings index
  -> AetherSense Service
      -> clipboard watcher
      -> screenshot/region capture
      -> active window title
      -> browser extension bridge
      -> folder/project watcher
  -> Skill Router
      -> fairy selection
      -> command selection
      -> permission check
  -> Model Adapter
      -> OpenAI / other BYO API
      -> local Ollama
      -> fallback rules
  -> Tool Executor
      -> files
      -> git
      -> browser
      -> job search repo
      -> exports
  -> Event + Reflection Log
  -> Evolution Engine
```

## Recommended implementation phases

### Phase A — Web prototype

Keep current React/Vite app. Build UI and data model.

### Phase B — Local vault

Add a backend/service layer.

Tables:

- fairies
- skills
- memories
- events
- permissions
- reflections
- tool_runs

### Phase C — LLM adapter

Create one interface:

```ts
interface ModelAdapter {
  complete(request: ModelRequest): Promise<ModelResponse>
}
```

Implement:

- mock adapter
- OpenAI compatible adapter
- Ollama adapter

### Phase D — Desktop shell

Use Electron or Tauri for local OS capabilities.

Capabilities must be explicitly permissioned.

### Phase E — Browser extension wings

Connect web context with Fairy OS through a local bridge.

## Dataflow

```txt
Signal captured
  -> classify signal type
  -> route to fairy
  -> gather memory/context
  -> generate suggestion
  -> ask permission if action is requested
  -> run tool
  -> log outcome
  -> fairy reflection updates growth profile
```

