// Local build-in-public content engine for @GoddessAther.
//
// ZERO credentials, ZERO network, ZERO cost. It does NOT post. It drafts
// post-ready content + hooks into a review queue (content/queue.json) that
// Amara reviews and posts manually. The account stays 100% hers.
//
// It can pull REAL signal from the Fairy Hub activity feed so dev-logs reflect
// actual work the OS did — not invented milestones.
//
// Usage:
//   node scripts/x-content-queue.mjs            # generate a fresh day's queue
//   node scripts/x-content-queue.mjs --from-hub # read ./content/hub-activity.json
//   node scripts/x-content-queue.mjs --print    # print queue to stdout
//
// Run: npm run content

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'content');
const queuePath = join(outDir, 'queue.json');
const hubPath = join(outDir, 'hub-activity.json');

const args = process.argv.slice(2);
const fromHub = args.includes('--from-hub');
const doPrint = args.includes('--print');

// ---- Voice + brand seeds (from selfModel CORE_SEEDS) -------------------------
const VOICE = {
  handle: '@GoddessAther',
  name: 'Amara',
  style: 'executive, sharp, concise. Lead with the answer. Surface decisions fast.',
  brand: 'AetherTwin Fairy OS — local-first living-world game + autonomous agent OS.',
};

// ---- Hook templates, grounded in real build-in-public patterns --------------
// Categories proven to convert (2025): wins, losses/lessons, metrics,
// behind-the-scenes decisions, community questions. Post 2-5/day, short,
// threads + visuals, ignore hashtags.
const TEMPLATES = [
  {
    category: 'devlog',
    hook: 'Shipped something today on the Fairy OS court.',
    body: (a) =>
      `Wired a live Hub so I can literally watch my 9 AI agents work — orbs pulse when they channel, perceive, or evolve.\n\n${a || 'Local-first, zero cloud calls. Building in public.'}\n\nWhat would you automate first?`,
    tags: ['#indiedev', '#buildinpublic'],
  },
  {
    category: 'lesson',
    hook: 'Hard-won lesson from building a local-first agent OS:',
    body: (a) =>
      `Models are replaceable. Memory and shipped work are sacred.\n\n${a || 'Swappable LLMs, durable continuity. That is the whole architecture.'}\n\nSteal this framing.`,
    tags: ['#AIagents', '#buildinpublic'],
  },
  {
    category: 'metric',
    hook: 'No-investment progress metric:',
    body: (a) =>
      `${a || '29/29 local tests green. Zero paid API. Zero network calls.'}\n\nConstraints force better architecture. Budget-free is a feature, not a bug.`,
    tags: ['#indiedev', '#soloDEV'],
  },
  {
    category: 'decision',
    hook: 'CEO decision of the day:',
    body: (a) =>
      `${a || 'PixiJS for the HUD — but Canvas2D as the zero-dep default so it runs anywhere.'}\n\nPick the dependency that pays rent. Everything else is optional polish.`,
    tags: ['#gamedev', '#buildinpublic'],
  },
  {
    category: 'community',
    hook: 'Open question for the build-in-public crowd:',
    body: (a) =>
      `${a || 'If your agents could earn for you autonomously, what is the FIRST thing you would have them do?'}\n\nAsking because I am wiring exactly that.`,
    tags: ['#AIagents', '#indiedev'],
  },
  {
    category: 'game',
    hook: 'Game design note — living-world RPG/MMO hybrid:',
    body: (a) =>
      `${a || 'Up to 5 autonomous AI agents per player. Real in-game economies. Tribes that evolve.'}\n\nSingle-player-first, optional multiplayer. The world keeps living when you log off.`,
    tags: ['#gamedev', '#screenshotsaturday'],
  },
];

function readHubActivity() {
  if (!existsSync(hubPath)) return [];
  try {
    const j = JSON.parse(readFileSync(hubPath, 'utf8'));
    return Array.isArray(j) ? j : j.events || [];
  } catch {
    return [];
  }
}

function latestActivitySummary() {
  const evs = readHubActivity();
  if (!evs.length) return '';
  const counts = {};
  for (const e of evs) counts[e.kind] = (counts[e.kind] || 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? `Last session: ${top[1]} ${top[0]} events across the court.` : '';
}

function buildQueue() {
  const summary = fromHub ? latestActivitySummary() : '';
  const today = new Date().toISOString().slice(0, 10);
  const queue = TEMPLATES.map((t, i) => {
    const body = t.body(summary).trim();
    return {
      id: `${today}-${String(i + 1).padStart(2, '0')}`,
      date: today,
      category: t.category,
      status: 'draft', // draft -> reviewed -> posted (you change this)
      handle: VOICE.handle,
      hook: t.hook,
      text: `${t.hook}\n\n${body}`,
      charCount: t.hook.length + 2 + body.length,
      tags: t.tags,
      source: fromHub ? 'hub-activity' : 'seed-template',
      note: 'Reviewed-and-posted by Amara. Engine never posts autonomously.',
    };
  });
  return { generatedAt: new Date().toISOString(), voice: VOICE, queue };
}

function main() {
  mkdirSync(outDir, { recursive: true });
  const result = buildQueue();
  writeFileSync(queuePath, JSON.stringify(result, null, 2) + '\n', 'utf8');
  if (doPrint) {
    console.log(`\n=== ${VOICE.handle} content queue (${result.queue.length} drafts) ===\n`);
    for (const item of result.queue) {
      console.log(`[${item.id}] (${item.charCount} chars) ${item.category}`);
      console.log(item.text);
      console.log('—'.repeat(40));
    }
  } else {
    console.log(`Wrote ${result.queue.length} drafts to content/queue.json`);
    console.log('Review, then post manually from @GoddessAther. Nothing is auto-posted.');
  }
}

main();
