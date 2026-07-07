// Verifies the ModelAdapter routing + adapters WITHOUT any network.
// Run: node scripts/test-model-router.mjs
import { modelForFairy, createAdapter, buildFairyMessages, systemPromptForFairy } from '../src/lib/modelAdapter.js';

let pass = 0;
let fail = 0;
function check(cond, label) {
  if (cond) {
    pass++;
    console.log('  PASS', label);
  } else {
    fail++;
    console.error('  FAIL', label);
  }
}

// 1. Skill router: code fairy -> Devstral, everyone else -> Qwen3-14B
check(modelForFairy('glint').includes('Devstral'), 'glint -> Devstral-24B');
check(modelForFairy('fae').includes('Qwen3-14B'), 'fae -> Qwen3-14B');
check(modelForFairy('stella').includes('Qwen3-14B'), 'stella -> Qwen3-14B');
check(modelForFairy('unknown').includes('Qwen3-14B'), 'unknown fairy falls back to Qwen3-14B');

// 2. Grounded system prompt carries identity + forbidden guardrails
const sp = systemPromptForFairy({
  name: 'Fae',
  title: 'Career Smith',
  sacredPurpose: 'Forge aligned opportunities.',
  strengths: ['job fit analysis'],
  weaknesses: ['can overfocus'],
  shadowRisk: 'Turning job search into self-worth.',
  forbidden: ['submit applications without approval']
});
check(sp.includes('Fae') && sp.includes('submit applications without approval'), 'system prompt includes identity + forbidden');

// 3. buildFairyMessages wires system + user correctly
const msgs = buildFairyMessages({ name: 'Glint' }, 'fix the build', 'last error: vite ENOENT');
check(msgs.length === 2 && msgs[0].role === 'system' && msgs[1].content.includes('vite ENOENT'), 'messages include memory context');

// 4. Mock adapter produces a whisper with zero network
const mock = createAdapter('mock');
const out = await mock.complete({ fairy: { name: 'Fae' }, prompt: 'A remote senior frontend role at a small studio' });
check(out.startsWith('Fae senses:'), 'mock adapter produces whisper');

// 5. Ollama adapter throws when no server is running -> caller must fall back.
//    This proves the graceful-degradation path the UI relies on.
const ollama = createAdapter('ollama', { base: 'http://127.0.0.1:11434' });
let threw = false;
try {
  await ollama.complete({ fairy: { id: 'glint' }, prompt: 'fix the build' });
} catch (e) {
  threw = true;
}
check(threw, 'ollama adapter throws when server unreachable (UI falls back to template)');

// 6. Crystal-AI adapter — the live local backend (gemma-4-E2B on :8765).
//    Tests the protocol + graceful degradation. If the server is running on
//    this host we get a real reply; if not, we assert it degrades cleanly.
const crystal = createAdapter('crystal');
check(crystal.name === 'crystal', 'crystal adapter created');
let crystalOk = false, crystalDegraded = false;
try {
  const reply = await crystal.complete({ fairy: { name: 'Fae', title: 'Career Smith' }, prompt: 'Say hello in one short sentence.' });
  crystalOk = typeof reply === 'string' && reply.length > 0;
  console.log('    crystal reply:', reply.slice(0, 80).replace(/\n/g, ' '));
} catch (e) {
  crystalDegraded = /unreachable|ENOENT|ECONNREFUSED|fetch failed/i.test(e.message);
}
check(crystalOk || crystalDegraded, 'crystal adapter returns reply OR degrades cleanly when server absent');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

