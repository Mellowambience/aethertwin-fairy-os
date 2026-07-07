// Weekly narrative-thread generator for @GoddessAther.
//
// ZERO credentials, ZERO network, ZERO cost. Builds ONE connected thread
// (5 posts) from the week's drafts in content/queue.json + real Hub signal in
// content/hub-activity.json. A thread outperforms scattered posts because it
// tells a story (build-in-public best practice: narrative > noise).
//
// Usage:
//   node scripts/x-weekly-thread.mjs            # write content/weekly-thread.json
//   node scripts/x-weekly-thread.mjs --print    # print to stdout
//
// Run: npm run weekly

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'content');
const queuePath = join(outDir, 'queue.json');
const hubPath = join(outDir, 'hub-activity.json');
const threadPath = join(outDir, 'weekly-thread.json');

const doPrint = process.argv.slice(2).includes('--print');

const VOICE = {
  handle: '@GoddessAther',
  name: 'Amara',
  brand: 'AetherTwin Fairy OS — local-first living-world game + autonomous agent OS.',
};

function readJSON(p) {
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

// Pull the strongest themes from the week's drafts + real activity.
function gatherThemes() {
  const q = readJSON(queuePath);
  const hub = readJSON(hubPath);
  const drafts = (q && Array.isArray(q.queue)) ? q.queue : [];
  const evs = hub ? (Array.isArray(hub) ? hub : hub.events || []) : [];

  const buckets = {};
  for (const d of drafts) {
    const c = d.category || 'misc';
    (buckets[c] = buckets[c] || []).push(d);
  }
  if (evs.length) {
    const counts = {};
    for (const e of evs) counts[e.kind] = (counts[e.kind] || 0) + 1;
    buckets.activity = [{ summary: `Real Hub activity: ${evs.length} events — ${Object.entries(counts).map(([k, n]) => `${n} ${k}`).join(', ')}.`, categories: evs.map((e) => e.kind) }];
  }
  return { buckets, draftCount: drafts.length, eventCount: evs.length };
}

function buildThread(themes) {
  const { buckets, draftCount, eventCount } = themes;
  const today = new Date().toISOString().slice(0, 10);
  const arc = [];

  // 1. Hook — the week's headline.
  const devlog = (buckets.devlog && buckets.devlog[0]) || null;
  arc.push({
    n: 1,
    role: 'hook',
    text:
      `This week on the Fairy OS court 🧵\n\n` +
      (devlog ? devlog.hook + '\n\n' + devlog.text.split('\n\n')[1] : `Shipped ${draftCount} build-in-public drafts and logged ${eventCount} real agent actions.`) +
      `\n\nA thread on building a local-first agent OS in public — no paid APIs, no VC.`,
  });

  // 2. The real work (from Hub activity if present).
  if (buckets.activity) {
    const a = buckets.activity[0].summary;
    arc.push({ n: 2, role: 'proof', text: `What actually happened (not a demo):\n\n${a}\n\nThe Hub makes the work watchable — orbs pulse when agents channel, perceive, or evolve.` });
  } else if (buckets.metric && buckets.metric[0]) {
    arc.push({ n: 2, role: 'proof', text: `The constraint that shaped it:\n\n${buckets.metric[0].text}` });
  }

  // 3. The lesson.
  if (buckets.lesson && buckets.lesson[0]) {
    arc.push({ n: arc.length + 1, role: 'lesson', text: buckets.lesson[0].text });
  }

  // 4. The decision / craft.
  if (buckets.decision && buckets.decision[0]) {
    arc.push({ n: arc.length + 1, role: 'decision', text: buckets.decision[0].text });
  }

  // 5. The ask / close.
  const community = (buckets.community && buckets.community[0]) || null;
  arc.push({
    n: arc.length + 1,
    role: 'close',
    text:
      `The point: an agent OS you can watch, audit, and that earns in public — built budget-free.\n\n` +
      (community ? community.text + '\n\n' : "If you are building in public too — what is your week's win?\n\n") +
      `Follow ${VOICE.handle} for the next chapter.`,
  });

  return { date: today, handle: VOICE.handle, brand: VOICE.brand, posts: arc };
}

function main() {
  mkdirSync(outDir, { recursive: true });
  const themes = gatherThemes();
  const thread = buildThread(themes);
  writeFileSync(threadPath, JSON.stringify(thread, null, 2) + '\n', 'utf8');
  if (doPrint) {
    console.log(`\n=== ${VOICE.handle} weekly thread (${thread.posts.length} posts) ===\n`);
    for (const p of thread.posts) {
      console.log(`[${p.n}/${thread.posts.length}] (${p.role}) ${p.text.length} chars`);
      console.log(p.text);
      console.log('—'.repeat(48));
    }
  } else {
    console.log(`Wrote ${thread.posts.length}-post weekly thread to content/weekly-thread.json`);
    console.log('Review, then post as a connected thread from @GoddessAther. Never auto-posted.');
  }
}

main();
