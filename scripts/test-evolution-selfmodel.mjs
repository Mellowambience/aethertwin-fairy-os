// Verifies self-model + evolution engine WITHOUT network or DOM.
// Run: node scripts/test-evolution-selfmodel.mjs
import { buildUserContext, selfModelSummary, CORE_SEEDS } from '../src/lib/selfModel.js';
import { recordReflection, makeReflection, reflectOnOutcome } from '../src/lib/evolution.js';

let pass = 0, fail = 0;
const check = (c, l) => (c ? (pass++, console.log('  PASS', l)) : (fail++, console.error('  FAIL', l)));

// --- self-model ---
const ctx = buildUserContext({ memories: [{ branch: 'career', title: 'Remote only', body: 'Avoid on-call.' }], userProfile: 'Am. concise.' });
check(ctx.includes('Amara') && ctx.includes('Cash App: $MarsEatPlanet'), 'self-model injects core operator facts');
check(ctx.includes('[career] Remote only'), 'self-model includes memory tree leaf');
check(ctx.includes('Am. concise.'), 'self-model includes user-typed profile');
check(selfModelSummary({ memories: [{}, {}], fairies: [{}, {}, {}] }).includes('2 core facts') === false && selfModelSummary({ memories: [{}, {}], fairies: [{}, {}, {}] }).includes('2 memory leaves'), 'summary counts memory leaves');

// --- evolution: XP + level tuning ---
const base = [{ id: 'fae', xp: 180, level: 3, growthPath: [] }];
const afterAccept = recordReflection(base, 'fae', 'accepted');
check(afterAccept[0].xp === 192, 'accepted +12 xp');
check(afterAccept[0].level === 4, 'level 4 at 192 xp (floor(192/60)+1=4)');

const afterReject = recordReflection(base, 'fae', 'rejected');
check(afterReject[0].xp === 177, 'rejected -3 xp');

const afterMany = recordReflection(base, 'fae', 'accepted');
// simulate 10 accepts from 180 -> 180+120 = 300 -> level 6
let f = base;
for (let i = 0; i < 10; i++) f = recordReflection(f, 'fae', 'accepted');
check(f[0].xp === 300 && f[0].level === 6, 'level scales with xp (300 -> lvl 6)');

// --- reflection object shape matches DATA_SCHEMA.md ---
const refl = makeReflection({ fairyId: 'glint', triggerEventId: 'evt-1', outcome: 'edited' });
check(refl.id && refl.fairyId === 'glint' && refl.outcome === 'edited' && refl.lesson, 'reflection object well-formed');
check(reflectOnOutcome('rejected').length > 0, 'reject lesson non-empty');

// --- growth path dedup ---
const g1 = recordReflection([{ id: 'x', xp: 0, growthPath: [] }], 'x', 'accepted');
const g2 = recordReflection(g1, 'x', 'accepted');
check(g2[0].growthPath.length === g1[0].growthPath.length, 'growth path lessons do not duplicate');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
