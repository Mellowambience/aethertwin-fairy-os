export const skillRegistry = [
  {
    id: 'career-smith',
    name: 'Career Smith',
    fairyId: 'fae',
    icon: '🔨',
    mission: 'Evaluate roles, forge applications, and protect aligned career momentum.',
    inputs: ['job post', 'resume', 'portfolio notes', 'work constraints'],
    outputs: ['fit report', 'tailored resume outline', 'cover letter draft', 'interview prep'],
    commands: ['/evaluate-job', '/forge-application', '/prep-interview', '/track-application'],
    permissionTier: 'approved-actions'
  },
  {
    id: 'code-smith',
    name: 'Code Smith',
    fairyId: 'glint',
    icon: '⚒️',
    mission: 'Turn ideas into working app slices and agent-readable implementation plans.',
    inputs: ['feature brief', 'project folder', 'error log', 'repo context'],
    outputs: ['scaffold plan', 'source files', 'README', 'agent handoff'],
    commands: ['/scaffold', '/repair', '/refactor', '/write-readme'],
    permissionTier: 'approved-actions'
  },
  {
    id: 'museweaver',
    name: 'Museweaver',
    fairyId: 'stella',
    icon: '🌸',
    mission: 'Convert feeling into style systems, prompts, lore, and visual direction.',
    inputs: ['image', 'mood phrase', 'palette', 'symbol'],
    outputs: ['style card', 'image prompt', 'moodboard brief', 'caption'],
    commands: ['/summon-style', '/remaster-vibe', '/write-lore', '/polish-post'],
    permissionTier: 'soft-actions'
  },
  {
    id: 'memory-oracle',
    name: 'Memory Oracle',
    fairyId: 'lyra',
    icon: '📚',
    mission: 'Recover, connect, prune, and summarize approved memories.',
    inputs: ['notes', 'exports', 'file names', 'conversation summaries'],
    outputs: ['timeline', 'memory leaf', 'pattern map', 'recap'],
    commands: ['/recall', '/timeline', '/connect', '/prune'],
    permissionTier: 'read-only-first'
  },
  {
    id: 'boundary-witch',
    name: 'Boundary Witch',
    fairyId: 'selena',
    icon: '🛡️',
    mission: 'Guard consent, privacy, risk, and scope.',
    inputs: ['permissions', 'terms', 'job post', 'email', 'contract'],
    outputs: ['risk report', 'permission request', 'red-flag note', 'firm response draft'],
    commands: ['/risk-scan', '/permission-check', '/say-no', '/red-flags'],
    permissionTier: 'guardian'
  },
  {
    id: 'future-architect',
    name: 'Future Architect',
    fairyId: 'hope',
    icon: '🕯️',
    mission: 'Turn chaos into quests and sustainable next steps.',
    inputs: ['goals', 'mood', 'calendar context', 'project state'],
    outputs: ['quest list', 'roadmap', 'priority decision', 'weekly plan'],
    commands: ['/next-quest', '/roadmap', '/weekly-plan', '/choose'],
    permissionTier: 'soft-actions'
  },
  {
    id: 'game-warden',
    name: 'Game Warden',
    fairyId: 'moss',
    icon: '🎮',
    mission: 'Playtest, patch, and protect game feel.',
    inputs: ['game build', 'screenshot', 'controls', 'mechanic idea'],
    outputs: ['playtest notes', 'patch plan', 'loop critique', 'mechanic spec'],
    commands: ['/playtest', '/patch-notes', '/balance-loop', '/mechanic-spec'],
    permissionTier: 'read-only-first'
  },
  {
    id: 'signal-seer',
    name: 'Signal Seer',
    fairyId: 'nova',
    icon: '🐦',
    mission: 'Turn real progress into public signal without fake hype.',
    inputs: ['weekly notes', 'project updates', 'screenshots', 'draft post'],
    outputs: ['X thread', 'launch announcement', 'recap', 'portfolio blurb'],
    commands: ['/weekly-thread', '/launch-post', '/portfolio-blurb', '/signal-check'],
    permissionTier: 'draft-only'
  },
  {
    id: 'ship-sprite',
    name: 'Ship Sprite',
    fairyId: 'rune',
    icon: '📦',
    mission: 'Package the smallest finished version today.',
    inputs: ['project status', 'TODOs', 'source folder', 'release goal'],
    outputs: ['release checklist', 'zip plan', 'README draft', 'launch note'],
    commands: ['/mvp-cut', '/release-check', '/package', '/ship-note'],
    permissionTier: 'approved-actions'
  }
];
