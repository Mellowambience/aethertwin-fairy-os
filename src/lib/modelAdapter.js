// ModelAdapter — the v0.5 LLM wiring for AetherTwin Fairy OS.
//
// Decision (delegated by Amara, 2026-07-06): local-first, no cloud billing.
//   Primary court model : Qwen3-14B (Q4_K_M) — Apache-2.0 all-rounder
//     HF GGUF: unsloth/Qwen3-14B-GGUF
//   Code specialist    : Devstral-Small-2505 (Q4_K_M, 24B) — #1 open coding agent
//     HF GGUF: unsloth/Devstral-Small-2505-GGUF
//   8B fallback        : Qwen3-8B (Q4_K_M) if machine has <12 GB free RAM
//     HF GGUF: unsloth/Qwen3-8B-GGUF
//
// Served locally through Ollama (http://localhost:11434). No API keys in repo,
// no hidden network calls: the only outbound traffic is to localhost when the
// user explicitly enables "local LLM" mode.

const OLLAMA_BASE = 'http://localhost:11434';

// fairyId -> Ollama model tag (HF GGUF pulled via `ollama run hf.co/...`)
const FAIRY_MODEL_MAP = {
  fae: 'hf.co/unsloth/Qwen3-14B-GGUF:Q4_K_M',
  stella: 'hf.co/unsloth/Qwen3-14B-GGUF:Q4_K_M',
  lyra: 'hf.co/unsloth/Qwen3-14B-GGUF:Q4_K_M',
  selena: 'hf.co/unsloth/Qwen3-14B-GGUF:Q4_K_M',
  hope: 'hf.co/unsloth/Qwen3-14B-GGUF:Q4_K_M',
  moss: 'hf.co/unsloth/Qwen3-14B-GGUF:Q4_K_M',
  nova: 'hf.co/unsloth/Qwen3-14B-GGUF:Q4_K_M',
  rune: 'hf.co/unsloth/Qwen3-14B-GGUF:Q4_K_M',
  glint: 'hf.co/unsloth/Devstral-Small-2505-GGUF:Q4_K_M'
};

export function modelForFairy(fairyId) {
  return FAIRY_MODEL_MAP[fairyId] || FAIRY_MODEL_MAP.fae;
}

// Build a grounded system prompt that preserves each fairy's distinct voice
// and the consent model (sense/suggest, never claim irreversible action).
export function systemPromptForFairy(fairy) {
  if (!fairy) return 'You are a helpful assistant inside AetherTwin Fairy OS.';
  const parts = [
    `You are ${fairy.name}, the ${fairy.title} of AetherTwin Fairy OS — a local-first companion where AI agents are embodied as fairies.`,
    fairy.sacredPurpose ? `Sacred purpose: ${fairy.sacredPurpose}` : '',
    fairy.strengths?.length ? `Strengths: ${fairy.strengths.join(', ')}.` : '',
    fairy.weaknesses?.length ? `Weaknesses to guard against: ${fairy.weaknesses.join(', ')}.` : '',
    fairy.shadowRisk ? `Shadow risk (distortion of your gift): ${fairy.shadowRisk}.` : '',
    fairy.forbidden?.length
      ? `Forbidden actions: ${fairy.forbidden.join('; ')}. Never perform these without explicit user approval.`
      : '',
    'Speak in a warm, grounded, slightly mystical voice. Keep responses concise and actionable. You may suggest actions but must NOT claim to have performed irreversible ones (no real file changes, posts, spending, or submissions).'
  ];
  return parts.filter(Boolean).join('\n');
}

export function buildFairyMessages(fairy, userText, memoryContext = '') {
  const user = memoryContext
    ? `Memory context:\n${memoryContext}\n\nSignal:\n${userText}`
    : userText;
  return [
    { role: 'system', content: systemPromptForFairy(fairy) },
    { role: 'user', content: user || '' }
  ];
}

// Adapter that returns a canned whisper with no network. Used as the default
// offline mode and as the safety net when Ollama is unavailable.
export class MockAdapter {
  constructor(opts = {}) {
    this.latency = opts.latency ?? 120;
    this.name = 'mock';
  }
  async complete({ fairy, prompt, memoryContext = '' } = {}) {
    await new Promise((r) => setTimeout(r, this.latency));
    const name = fairy?.name || 'Fairy';
    const excerpt = (prompt || '').slice(0, 140);
    return `${name} senses: ${excerpt}${excerpt.length >= 140 ? '…' : ''}`;
  }
}

// Adapter that calls a local Ollama server (no cloud, no billing).
export class OllamaAdapter {
  constructor({ base = OLLAMA_BASE, fairyModelMap = FAIRY_MODEL_MAP } = {}) {
    this.base = base;
    this.fairyModelMap = fairyModelMap;
    this.name = 'ollama';
  }
  async complete({ fairy, prompt, model, signal, temperature = 0.7, memoryContext = '' } = {}) {
    const modelTag = model || modelForFairy(fairy?.id);
    const messages = buildFairyMessages(fairy, prompt || '', memoryContext);
    let res;
    try {
      res = await fetch(`${this.base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelTag, messages, stream: false, options: { temperature } }),
        signal
      });
    } catch (err) {
      throw new Error(`Ollama unreachable at ${this.base}: ${err.message}`);
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    const content = data?.message?.content;
    if (!content) throw new Error('Ollama returned empty content');
    return content.trim();
  }
}

// Adapter that calls a local Crystal-AI server (no cloud, no billing).
// Discovered live at http://127.0.0.1:8765 (Professor Gibberlink, model
// gemma-4-E2B-it.litertlm). Lightweight fallback / second local backend
// behind Ollama. Protocol: POST /chat { message } -> { reply }.
export class CrystalAdapter {
  constructor({ base = 'http://127.0.0.1:8765' } = {}) {
    this.base = base;
    this.name = 'crystal';
  }
  async complete({ fairy, prompt, memoryContext = '', signal } = {}) {
    const sys = systemPromptForFairy(fairy);
    const message = memoryContext
      ? `${sys}\n\nUser: ${prompt || ''}`
      : `${sys}\n\n${prompt || ''}`;
    let res;
    try {
      res = await fetch(`${this.base}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        signal
      });
    } catch (err) {
      throw new Error(`Crystal-AI unreachable at ${this.base}: ${err.message}`);
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Crystal-AI HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    const reply = data?.reply;
    if (!reply) throw new Error('Crystal-AI returned empty reply');
    return reply.trim();
  }
}

export function createAdapter(kind = 'mock', opts = {}) {
  if (kind === 'ollama') return new OllamaAdapter(opts);
  if (kind === 'crystal') return new CrystalAdapter(opts);
  return new MockAdapter(opts);
}
