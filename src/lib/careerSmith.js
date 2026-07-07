// Career-Smith ritual engine — Fae's first real high-value skill.
//
// Offline, deterministic, ZERO network. The user pastes a job post; Fae
// evaluates fit against Amara's specific rubric (remote-only, energy-cost,
// alignment with game-dev / AI-agent building), Selena scans red flags, and
// Fae can forge an application PACKET (draft only — never submitted).
//
// This is the v0.5 "real agent" slice: it does actual work for Amara's
// job search without reducing her to a resume or acting without consent.
//
// Optional live-LLM enhancement: when modelMode === 'local' and Ollama is
// running, callers may pass an `aiAnalyze` function to enrich `applicationAngle`
// and `gaps`. The template path always works offline.

// Amara's durable profile (mirrors selfModel CORE_SEEDS). Used to score fit.
const AMARA = {
  name: 'Amara',
  remoteOnly: true,
  strengths: [
    'game development', 'gamedev', 'worldbuilding', 'narrative', 'design',
    'AI agents', 'agent building', 'prototyping', 'product', 'community',
    'creative direction', 'build-in-public', 'autonomous systems', 'no-code'
  ],
  // signals that indicate alignment with what she actually wants to build
  alignmentKeywords: [
    'game', 'gamedev', 'indie', 'world', 'agent', 'ai', 'prototype', 'product',
    'design', 'narrative', 'community', 'creator', 'build', 'autonomous',
    'no-code', 'creative', 'simulation', 'rpg', 'mmo', 'unity', 'unreal',
    'pixi', 'webgl', 'react', 'typescript', 'automation'
  ]
};

const RED_FLAG_PATTERNS = [
  { re: /commission\s*only/i, label: 'Commission-only pay', severity: 'high' },
  { re: /equity\s*only/i, label: 'Equity-only (no salary)', severity: 'high' },
  { re: /no\s*(base\s*)?salary/i, label: 'No salary disclosed', severity: 'med' },
  { re: /unlimited\s*pto/i, label: 'Unlimited PTO used as pay substitute', severity: 'low' },
  { re: /(crypto|web3|blockchain).*(pump|moon|lambo|get rich)/i, label: 'Crypto hype / get-rich framing', severity: 'high' },
  { re: /must\s*relocate/i, label: 'Requires relocation', severity: 'med' },
  { re: /on-?site|in-?office|in office/i, label: 'On-site / in-office (violates remote-only)', severity: 'med' },
  { re: /fast-?paced|wear\s*many\s*hats|always on/i, label: 'Burnout-language (fast-paced / always-on)', severity: 'low' },
  { re: /(passion|love).*(but|however).*(low|little|unpaid|small)/i, label: 'Asks for passion but signals low pay', severity: 'med' }
];

function firstMatch(text, patterns) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1] || m[0];
  }
  return '';
}

export function detectRemote(text) {
  if (/fully\s*remote|100%\s*remote|remote\s*(role|position)?\s*[-:]?\s*(yes|worldwide|global)/i.test(text)) return 'remote';
  if (/remote/i.test(text) && !/on-?site|in-?office|hybrid|relocate/i.test(text)) return 'remote';
  if (/hybrid/i.test(text)) return 'hybrid';
  if (/must\s*relocate|relocation\s*required|on-?site|in[- ]?office|our office|the office|office-?based/i.test(text)) return 'onsite';
  if (/remote/i.test(text)) return 'remote';
  return 'unspecified';
}

export function detectSalary(text) {
  const m = text.match(/(?:\$|\u20ac|\u00a3)\s?\d[\d,]*\s*(?:k|,\d{3})?(?:\s*[-–]\s*(?:\$|\u20ac|\u00a3)?\s?\d[\d,]*\s*(?:k|,\d{3}))?(?:\s*(?:per yr|\/yr|year|annually|pa|a year))?/i);
  return m ? m[0].trim() : '';
}

export function extractRole(text) {
  const m = text.match(/(?:role|title|position)\s*[:\-]\s*([^\n]{3,80})/i)
    || text.match(/\b( senior | junior | lead | staff | principal )?([A-Z][A-Za-z0-9 +\/&]{3,40}(?:engineer|developer|designer|manager|builder|smith|architect|artist|writer|producer|founder|lead|creator|agent|specialist))/);
  if (m) return m[1] ? m[1].trim() : m[0].trim();
  return (text.split('\n').find((l) => l.trim().length > 4) || '').trim().slice(0, 80);
}

export function extractCompany(text) {
  const m = text.match(/(?:at|@|company)\s*[:\-]?\s*([A-Z][A-Za-z0-9 &]{2,40})/i)
    || text.match(/([A-Z][A-Za-z0-9]*(?:[\s&][A-Z][A-Za-z0-9]*){0,3})/);
  return m ? m[1].trim() : 'Unknown';
}

function extractSkillLines(text) {
  const lines = text.split('\n');
  const must = [];
  const nice = [];
  let mode = null;
  for (const raw of lines) {
    const l = raw.toLowerCase();
    if (/must[- ]have|required|qualification|you (will|should) have|what you('|’)?ll need/i.test(l)) mode = 'must';
    else if (/nice[- ]to-?have|preferred|bonus|plus|would be an? (advantage|plus)/i.test(l)) mode = 'nice';
    if (mode && /[a-z]{3,}/i.test(raw) && raw.trim().length > 3) {
      const cleaned = raw.replace(/^[-*•\d.\s]+/, '').trim();
      if (cleaned.length > 3 && cleaned.length < 90) (mode === 'must' ? must : nice).push(cleaned);
    }
  }
  return { must, nice };
}

export function scoreEnergyCost(text, remote) {
  let cost = 2;
  if (remote === 'onsite') cost += 2;
  else if (remote === 'hybrid') cost += 1;
  if (/travel\s*(required|up to|frequently)/i.test(text)) cost += 1;
  if (/fast-?paced|wear many hats|always on|high pressure|demanding/i.test(text)) cost += 1;
  if (remote === 'remote' && /(game|agent|ai|creative|prototyp|design|build)/i.test(text)) cost = Math.max(1, cost - 1);
  return Math.min(5, Math.max(1, cost));
}

export function selenaScanRedFlags(text) {
  const hits = [];
  for (const p of RED_FLAG_PATTERNS) {
    if (p.re.test(text)) hits.push({ label: p.label, severity: p.severity });
  }
  return hits;
}

// Main entry: evaluate a pasted job post against Amara's rubric.
export function evaluateJobPost(text, opts = {}) {
  const clean = (text || '').trim();
  if (!clean) return null;
  const remote = detectRemote(clean);
  const salary = detectSalary(clean);
  const role = extractRole(clean);
  const company = extractCompany(clean);
  const { must, nice } = extractSkillLines(clean);

  const lc = clean.toLowerCase();
  const matched = AMARA.alignmentKeywords.filter((k) => lc.includes(k));
  const matchEvidence = matched.length
    ? `Aligns with your build path: ${matched.slice(0, 6).join(', ')}.`
    : 'Limited direct alignment with game-dev / AI-agent building.';

  const gaps = must.filter((s) => !AMARA.strengths.some((st) => s.toLowerCase().includes(st.split(' ')[0]) && lc.includes(st.split(' ')[0])))
    .slice(0, 6);
  const gapNote = gaps.length ? `Gaps vs your profile: ${gaps.slice(0, 4).join('; ')}.` : 'No major gaps vs your stated strengths.';

  const fitScore = Math.min(5, Math.max(1, 1 + matched.length + (salary ? 1 : 0) - (remote === 'onsite' ? 1 : 0)));
  const energyCost = scoreEnergyCost(clean, remote);
  const redFlags = selenaScanRedFlags(clean);

  const highFlags = redFlags.filter((r) => r.severity === 'high').length;
  let recommended;
  if (highFlags > 0) recommended = 'Skip or negotiate hard — hard red flags present.';
  else if (fitScore >= 3 && energyCost <= 3) recommended = 'Apply — strong alignment, reasonable energy cost.';
  else if (fitScore >= 2) recommended = 'Apply selectively — tailor the angle to your builder narrative.';
  else recommended = 'Skip — weak alignment with what you want to build.';

  const angle = opts.aiAngle
    ? opts.aiAngle
    : `Frame as a builder/operator: you ship local-first agent systems and living-world game prototypes; position the role as the next world to forge.`;

  return {
    role, company, remote, salary,
    mustHave: must, niceToHave: nice,
    matchEvidence, gaps: gapNote,
    fitScore, energyCost,
    redFlags,
    applicationAngle: angle,
    recommendedAction: recommended,
    evaluatedAt: new Date().toISOString()
  };
}

// Forge a draft application packet (text only). Never written to disk or
// submitted without explicit user approval.
export function forgePacket(report, { resumeNotes = '', name = AMARA.name } = {}) {
  const rp = report || {};
  const safe = (s) => (s || '').toString().replace(/[<>]/g, '');
  const tracker = {
    company: safe(rp.company),
    role: safe(rp.role),
    remote: rp.remote,
    salary: rp.salary || null,
    fitScore: rp.fitScore,
    energyCost: rp.energyCost,
    redFlags: (rp.redFlags || []).map((r) => r.label),
    recommendedAction: rp.recommendedAction,
    status: 'draft',
    createdAt: new Date().toISOString()
  };
  const fitReport = `# Fit Report — ${safe(rp.role)} @ ${safe(rp.company)}

- **Remote:** ${rp.remote}
- **Salary:** ${rp.salary || 'not disclosed'}
- **Fit score:** ${rp.fitScore}/5
- **Energy cost:** ${rp.energyCost}/5
- **Match:** ${rp.matchEvidence}
- **Gaps:** ${rp.gaps}
- **Red flags:** ${(rp.redFlags || []).map((r) => `${r.label} (${r.severity})`).join('; ') || 'none'}
- **Application angle:** ${rp.applicationAngle}
- **Recommended action:** ${rp.recommendedAction}
`;
  const resume = `# Tailored Resume Notes — ${safe(rp.role)} @ ${safe(rp.company)}

Lead with builder/operator proof:
- Local-first Fairy OS: 9 specialized AI agents, live Hub, local LLM adapter (Ollama + GGUF).
- Living-world RPG/MMO hybrid prototype (PixiJS/HD-2D court, agent economies).
- Build-in-public on @GoddessAther; 29/29 green local test suite.

User notes:
${resumeNotes || '(paste resume bullets or portfolio highlights here)'}
`;
  const cover = `# Cover Letter Draft — ${safe(rp.role)} @ ${safe(rp.company)}

Hi ${safe(rp.company)} team,

I build local-first agent systems and living-world game worlds. Your role caught my eye because ${rp.matchEvidence.toLowerCase()}

${rp.applicationAngle}

I'd love to show how I'd forge value here. Open to a conversation.

— ${safe(name)}
`;
  const prep = `# Interview Prep — ${safe(rp.role)} @ ${safe(rp.company)}

**Likely questions**
- Walk through a system you shipped end-to-end.
- How do you scope when resources are tight (budget-free by design)?
- Where do you draw the line on autonomy vs consent?

**Your asks**
- Remote-only confirmation.
- Comp structure (base + anything else).
- What "success" looks like in 90 days.

**Red-flag watch (Selena)**
${(rp.redFlags || []).map((r) => `- ${r.label} (${r.severity})`).join('\n') || '- none flagged'}
`;
  return {
    'fit_report.md': fitReport,
    'tailored_resume_notes.md': resume,
    'cover_letter.md': cover,
    'interview_prep.md': prep,
    'tracker_entry.json': JSON.stringify(tracker, null, 2)
  };
}
