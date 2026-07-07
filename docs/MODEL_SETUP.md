# Model Setup — AetherTwin Fairy OS

Local-first LLM wiring (v0.5). No cloud, no API keys in repo, no billing.

Two local backends are supported. Pick one in the Telepathy Lab selector
(`template` / `local LLM (Ollama)` / `crystal (local :8765)`):

- **Ollama** (primary, GGUF) on `localhost:11434` — full model control, your chosen quants.
- **Crystal-AI** (optional, already-live fallback) on `http://127.0.0.1:8765` — a local
  LiteRT-LM server (e.g. `gemma-4-E2B-it.litertlm`). Zero install if it's already running.
- **template** (default) — offline canned whispers, always works, no server needed.

Any backend failure degrades gracefully to `template` so the OS never breaks.

## Chosen models (decision: 2026-07-06)

| Role | Model | HF GGUF | RAM (Q4_K_M) | License |
|------|-------|---------|--------------|---------|
| Court (Fae, Stella, Lyra, Selena, Hope, Moss, Nova, Rune) | Qwen3-14B | `unsloth/Qwen3-14B-GGUF` | ~9 GB | Apache-2.0 |
| Code (Glint) | Devstral-Small-2505 | `unsloth/Devstral-Small-2505-GGUF` | ~14 GB | Apache-2.0 |
| Fallback (low RAM) | Qwen3-8B | `unsloth/Qwen3-8B-GGUF` | ~5.5 GB | Apache-2.0 |

Devstral is the #1 open-source coding-agent model (46.8% SWE-bench Verified)
and is text-only — perfect for Glint's scaffold/repair/refactor work.
Qwen3-14B is the best all-around local family and Apache-2.0, so it is
commercial-safe for the build-in-public / revenue path.

## Install Ollama

Windows: download from https://ollama.com/download and install.
Verify: `ollama --version`.

## Pull the models (directly from Hugging Face GGUF)

```bash
# Primary court model
ollama run hf.co/unsloth/Qwen3-14B-GGUF:Q4_K_M

# Code specialist for Glint
ollama run hf.co/unsloth/Devstral-Small-2505-GGUF:Q4_K_M

# Optional low-RAM fallback
ollama run hf.co/unsloth/Qwen3-8B-GGUF:Q4_K_M
```

The first `run` downloads the quant; later runs are instant. Ollama keeps the
model loaded and serves it at `http://localhost:11434`.

## Enable in the app

1. `npm install && npm run dev`.
2. Open the **AetherSense** tab.
3. Flip the model toggle from `template (offline)` to `local LLM`.
4. Paste a signal (job post, code error, idea). The app calls Ollama locally.

If Ollama is not running, the app automatically falls back to the built-in
template whispers — it never breaks.

## Router

`src/lib/modelAdapter.js` maps each fairy to a model via `modelForFairy()`:

- `glint` -> Devstral-24B
- everything else -> Qwen3-14B

To change a mapping, edit `FAIRY_MODEL_MAP` in that file. To point at a
different provider, implement the `ModelAdapter` interface (mock + Ollama
adapters already exist) and swap `createAdapter()`.

## Verify the router without Ollama

```bash
node scripts/test-model-router.mjs
```

This asserts the routing table, the grounded system prompt, the mock adapter,
and the graceful-fallback path — no network required.
