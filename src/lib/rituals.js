export function inferSignalType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('remote') || lower.includes('salary') || lower.includes('job') || lower.includes('requirements')) return 'job-post';
  if (lower.includes('error') || lower.includes('vite') || lower.includes('react') || lower.includes('function') || lower.includes('bug')) return 'code';
  if (lower.includes('palette') || lower.includes('image') || lower.includes('style') || lower.includes('aesthetic')) return 'art';
  if (lower.includes('quest') || lower.includes('plan') || lower.includes('roadmap') || lower.includes('overwhelmed')) return 'planning';
  return 'general';
}

export function routeSignalToFairy(text) {
  const type = inferSignalType(text);
  const map = {
    'job-post': 'fae',
    code: 'glint',
    art: 'stella',
    planning: 'hope',
    general: 'lyra'
  };
  return map[type];
}

export function createWhisper(text, fairy) {
  const type = inferSignalType(text);
  const snippets = {
    'job-post': `I sense a role. I can score fit, energy cost, red flags, and draft an application packet.`,
    code: `I sense code or project friction. I can inspect structure, propose a repair path, and prepare an agent handoff.`,
    art: `I sense a visual spell. I can extract style traits and turn this into an art direction card.`,
    planning: `I sense many branches. I can reduce this to one reachable quest.`,
    general: `I caught a fragment. I can archive it, tag it, and connect it to the Memory Tree.`
  };
  return `${fairy.name} sensed: ${snippets[type]}`;
}

export function councilViewpoint(question, fairy) {
  const q = question.trim() || 'this next move';
  const tone = {
    fae: `This can become opportunity if we turn it into proof, portfolio language, or an application angle.`,
    glint: `Cut it into a buildable slice: one screen, one data object, one export, one README.`,
    stella: `Protect the vibe. The soul of ${q} needs a recognizable visual signature, not generic polish.`,
    lyra: `Archive the decision. What matters is why this path was chosen, so future agents do not repeat the debate.`,
    selena: `Check permissions, privacy, scope, and energy cost before giving any agent more control.`,
    hope: `Choose the next quest, not the entire destiny. Make the first step small enough to complete.`,
    moss: `Test the loop. Does the user feel rewarded after one minute? If not, simplify.`,
    nova: `If it ships, turn it into a visible signal: screenshot, thread, demo note, and ask.`,
    rune: `What is the smallest finished artifact we can package today? Start there.`
  };
  return tone[fairy.id] || `I would help by applying my gift to ${q}.`;
}

export function defaultGenesisForm() {
  return {
    name: '',
    title: '',
    emoji: '🧚',
    archetype: '',
    origin: '',
    sacredPurpose: '',
    strengths: '',
    weaknesses: '',
    shadowRisk: '',
    skills: '',
    vision: '',
    controls: '',
    forbidden: '',
    memoryScope: '',
    growthPath: ''
  };
}

export function normalizeList(text) {
  return String(text || '')
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
