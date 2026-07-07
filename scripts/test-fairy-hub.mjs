// Verifies the Fairy Hub event bus WITHOUT DOM or network.
// Run: node scripts/test-fairy-hub.mjs
import { emitActivity, getFeed, getActivity, subscribe, resetHub, exportHubActivity, ACTIVITY_KINDS } from '../src/lib/fairyHub.js';

let pass = 0, fail = 0;
function check(cond, name) { if (cond) { pass++; console.log(`  PASS ${name}`); } else { fail++; console.log(`  FAIL ${name}`); } }

resetHub();
check(ACTIVITY_KINDS.includes('channel'), 'activity kinds include channel');
check(ACTIVITY_KINDS.includes('evolve'), 'activity kinds include evolve');

emitActivity('fae', 'channel', 'whisper test');
emitActivity('glint', 'forge', 'wrote a file');
emitActivity('fae', 'evolve', 'accepted');
const feed = getFeed();
check(feed.length === 3, 'feed captured 3 events');
check(feed[0].fairyId === 'fae' && feed[0].kind === 'evolve', 'newest event first (fae/evolve)');

const actFae = getActivity()['fae'];
check(actFae.counts.total === 2, 'fae total actions = 2');
check(actFae.counts.channel === 1 && actFae.counts.evolve === 1, 'fae per-kind counts correct');
check(getActivity()['glint'].counts.forge === 1, 'glint forge count = 1');

// subscription
let got = null;
const unsub = subscribe((e) => { got = e; });
emitActivity('nova', 'signal', 'hi');
unsub();
check(got && got.fairyId === 'nova', 'subscriber received new event');
emitActivity('nova', 'signal', 'after unsub');
check(got.fairyId === 'nova' && got.detail === 'hi', 'subscriber NOT called after unsubscribe');

// invalid kind normalized
emitActivity('stella', 'bogus', 'x');
check(getFeed()[0].kind === 'signal', 'invalid kind normalized to signal');

// export snapshot for the content engine
const snap = exportHubActivity();
check(snap && Array.isArray(snap.events), 'export returns events array');
check(snap.perFairy.fae && snap.perFairy.fae.counts.total === 2, 'export per-fairy totals correct');
check(typeof snap.generatedAt === 'string' && snap.generatedAt.includes('T'), 'export has ISO timestamp');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
