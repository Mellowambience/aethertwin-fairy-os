// Fairy Hub event bus — the live nervous system behind the Hub/HUD.
//
// Every fairy action (channel, perceive, evolve, generate, remember, guard)
// emits an activity event here. The Hub renderer and live feed subscribe to it,
// so you can literally watch your agents work. No network, no deps.
const listeners = new Set();
const feed = []; // newest-first, capped
const activity = {}; // fairyId -> { lastKind, lastAt, counts: {...} }
const FEED_CAP = 120;
let seq = 0;

export const ACTIVITY_KINDS = ['channel', 'perceive', 'evolve', 'generate', 'remember', 'guard', 'forge', 'signal'];

export function emitActivity(fairyId, kind, detail = '') {
  if (!ACTIVITY_KINDS.includes(kind)) kind = 'signal';
  const t = Date.now();
  seq += 1;
  const entry = { seq, fairyId, kind, detail: String(detail).slice(0, 240), at: t };
  feed.unshift(entry);
  if (feed.length > FEED_CAP) feed.length = FEED_CAP;
  const a = activity[fairyId] || { lastKind: null, lastAt: 0, counts: {} };
  a.lastKind = kind;
  a.lastAt = t;
  a.counts[kind] = (a.counts[kind] || 0) + 1;
  a.counts.total = (a.counts.total || 0) + 1;
  activity[fairyId] = a;
  for (const fn of listeners) {
    try { fn(entry); } catch { /* a bad listener must not break the bus */ }
  }
  return entry;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getFeed() { return feed; }
export function getActivity() { return activity; }
export function getActivityFor(fairyId) { return activity[fairyId] || null; }
export function resetHub() { feed.length = 0; for (const k of Object.keys(activity)) delete activity[k]; }

// Serializable snapshot for the build-in-public content engine.
// Returns { generatedAt, events:[...], perFairy:{ id -> counts } } so
// scripts/x-content-queue.mjs --from-hub can turn real agent work into posts.
export function exportHubActivity() {
  const perFairy = {};
  for (const [id, a] of Object.entries(activity)) {
    perFairy[id] = { lastKind: a.lastKind, lastAt: a.lastAt, counts: { ...a.counts } };
  }
  return {
    generatedAt: new Date().toISOString(),
    events: feed.map((e) => ({ ...e })),
    perFairy
  };
}
