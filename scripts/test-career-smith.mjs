// Verifies the Career-Smith ritual engine WITHOUT DOM or network.
// Run: node scripts/test-career-smith.mjs
import { evaluateJobPost, forgePacket, detectRemote, selenaScanRedFlags } from '../src/lib/careerSmith.js';

let pass = 0, fail = 0;
function check(cond, name) { if (cond) { pass++; console.log(`  PASS ${name}`); } else { fail++; console.log(`  FAIL ${name}`); } }

const goodPost = `Role: Senior Game Developer (Remote)
Company: PixelForge Studios
Location: Fully remote, worldwide
Salary: $120,000 - $150,000 per year
We build living-world RPGs with autonomous agent economies.
Must-have: TypeScript, React, PixiJS, worldbuilding, agent systems.
Nice-to-have: Unity, WebGL.`;

const scamPost = `Crypto get-rich role! Commission only.
Must relocate to our office. Wear many hats, always on.`;

check(detectRemote(goodPost) === 'remote', 'detectRemote: fully remote post');
check(detectRemote(scamPost) === 'onsite', 'detectRemote: on-site/relocate post');

const rGood = evaluateJobPost(goodPost);
check(rGood && rGood.fitScore >= 3, 'good game-dev post scores fit >= 3');
check(rGood.remote === 'remote', 'good post remote flag carried');
check(rGood.salary.includes('120'), 'salary extracted');
check(rGood.redFlags.length === 0, 'good post has no red flags');
check(rGood.recommendedAction.startsWith('Apply'), 'good post recommends apply');

const rScam = evaluateJobPost(scamPost);
check(rScam.redFlags.length >= 2, 'scam post flags multiple red flags');
check(rScam.recommendedAction.startsWith('Skip'), 'scam post recommends skip');

const flags = selenaScanRedFlags(scamPost);
check(flags.some((f) => f.severity === 'high'), 'Selena catches a high-severity flag');

// Packet forging (draft only)
const pkt = forgePacket(rGood, { resumeNotes: 'Shipped local-first agent OS.' });
check(pkt['fit_report.md'] && pkt['cover_letter.md'] && pkt['tracker_entry.json'], 'packet has fit/cover/tracker files');
const tracker = JSON.parse(pkt['tracker_entry.json']);
check(tracker.status === 'draft' && tracker.fitScore === rGood.fitScore, 'tracker entry is draft with correct score');
check(pkt['cover_letter.md'].includes('PixelForge'), 'cover letter names the company');

// Null / empty guard
check(evaluateJobPost('   ') === null, 'empty post returns null');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
