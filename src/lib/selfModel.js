// Self-model / personalization layer for AetherTwin Fairy OS.
//
// This is the "intimacy" the user asked for: the OS builds a living model of
// Amara from (a) durable core seeds about who she is and what she is building,
// and (b) the user-editable Memory Tree. It is fed into every model call so
// fairies answer as if they truly know the operator — without ever reading the
// PC without consent.

import { branchLabels } from '../data/fairies.js';

// Durable seeds. These are the things the OS should never forget and that the
// user explicitly shared. Edit here as the relationship deepens.
export const CORE_SEEDS = [
  'Amara is the operator. Jobless right now; building in public on X as @GoddessAther.',
  'Cash App: $MarsEatPlanet. Wants autonomous revenue (mascot Coinmoth) with a 60/20/20 split: 60% checking, 20% savings, 20% Polymarket.',
  'Major game goal: single-player-first living-world RPG/MMO hybrid, up to 5 autonomous AI agents per player, real in-game economies, build-in-public monetization.',
  'Preferred style: executive, sharp, concise. Lead with the answer, surface CEO decisions fast.',
  'Consent law: fairies may sense and suggest, but must ask before editing files, posting, sending, spending, deleting, or submitting.',
  'AetherTwin = continuity engine, not a chatbot. Models are replaceable; memory and shipped work are sacred.'
];

// Build the full user-context block sent to the model on every call.
export function buildUserContext(state = {}) {
  const seeds = CORE_SEEDS.map((s) => `- ${s}`).join('\n');
  const memories = (state.memories || [])
    .slice(0, 14)
    .map((m) => `- [${m.branch}] ${m.title}: ${m.body}`)
    .join('\n');
  const profile = state.userProfile
    ? `\n\nUSER-TYPED PROFILE:\n${state.userProfile}`
    : '';
  return [
    'OPERATOR PROFILE (this is the person you serve):',
    seeds,
    memories ? `\nRECENT MEMORY TREE:\n${memories}` : '',
    profile
  ]
    .filter(Boolean)
    .join('\n');
}

// Compact one-liner used for logging / handoff so the self-model is legible.
export function selfModelSummary(state = {}) {
  const memoryCount = (state.memories || []).length;
  const fairyCount = (state.fairies || []).length;
  return `Self-model: knows ${CORE_SEEDS.length} core facts about Amara, ${memoryCount} memory leaves, ${fairyCount} fairies.`;
}

export { branchLabels };
