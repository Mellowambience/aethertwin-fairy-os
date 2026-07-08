import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type ReceiptType = 'repo' | 'demo' | 'screenshot' | 'post' | 'devlog' | 'job-proof' | 'other';
type Audience = 'recruiter' | 'player' | 'follower' | 'collaborator' | 'myself';
type View = 'dashboard' | 'forge' | 'library' | 'composer' | 'timeline';

interface Receipt {
  id: string;
  projectName: string;
  type: ReceiptType;
  linkOrNote: string;
  date: string;
  whatChanged: string;
  whatBuilt: string;
  whatLearned: string;
  whyItMatters: string;
  audience: Audience;
  proofSummary: string;
  whatThisProves: string;
  portfolioValue: string;
  jobSearchValue: string;
  postIdea: string;
}

const STORAGE_KEY = 'aethertwin.receipts.v1';

const starters: Receipt[] = [
  forgeReceipt({ projectName: 'Fairy OS', type: 'devlog', linkOrNote: 'Local blueprint', whatChanged: 'Created the first local-first blueprint, agent registry, permissions model, and Genesis Profile structure.', whatBuilt: 'A practical foundation for a fairy-agent operating system.', whatLearned: 'Receipts need to come before autonomy because visible proof keeps projects from disappearing.', whyItMatters: 'The system can become a portfolio-grade AI workflow product instead of remaining a giant prompt.', audience: 'recruiter' }),
  forgeReceipt({ projectName: 'QI-Games', type: 'screenshot', linkOrNote: 'Sprite/art direction notes', whatChanged: 'Defined a consistent HD-2D / modern pixel-art direction for quantum fairy game assets.', whatBuilt: 'A game-ready asset brief for fairy, mana berry, and rune grass tile sprites.', whatLearned: 'Small readable assets need stronger silhouette rules than large concept art.', whyItMatters: 'Clear asset constraints make the project easier for coding agents and art tools to execute.', audience: 'player' }),
  forgeReceipt({ projectName: 'AetherTwin Helm', type: 'devlog', linkOrNote: 'Master blueprint markdown', whatChanged: 'Compiled the Helm persona, agent system, permissions, schemas, and workflows into one master blueprint.', whatBuilt: 'A reusable operating blueprint for creative AI project routing and memory.', whatLearned: 'The Helm needs a conductor, not infinite agents shouting at once.', whyItMatters: 'It creates a repeatable pattern for turning ideas into prompts, builds, posts, and portfolio proof.', audience: 'collaborator' }),
  forgeReceipt({ projectName: 'Magic Meets Machine', type: 'other', linkOrNote: 'Creator business concept', whatChanged: 'Framed the brand as a fantasy/AI creator business with digital products, memberships, newsletter, and automation.', whatBuilt: 'A product direction that can convert creative systems into sellable artifacts.', whatLearned: 'The offer must stay small enough to ship before becoming a whole platform.', whyItMatters: 'It can become the monetization layer for the broader creative ecosystem.', audience: 'follower' }),
];

function forgeReceipt(input: Omit<Receipt, 'id' | 'date' | 'proofSummary' | 'whatThisProves' | 'portfolioValue' | 'jobSearchValue' | 'postIdea'>): Receipt {
  const id = crypto.randomUUID?.() ?? `receipt-${Date.now()}`;
  const angle: Record<Audience, string> = {
    recruiter: 'technical ownership, product thinking, clear communication, and a shipping mindset',
    player: 'player fantasy, game feel, clarity, and the experience of the build',
    follower: 'story, momentum, creative evolution, and behind-the-scenes honesty',
    collaborator: 'handoff clarity, shared vision, scope control, and an implementation path',
    myself: 'continuity, self-trust, learning, and visible momentum',
  };
  return {
    ...input,
    id,
    date: new Date().toISOString().slice(0, 10),
    proofSummary: `Created a ${input.type} receipt for ${input.projectName}: ${input.whatBuilt}`,
    whatThisProves: `Shows ${angle[input.audience]}. It turns scattered progress into a traceable proof artifact.`,
    portfolioValue: `${input.projectName} can become a case-study beat about what was built, why it matters, and how the work changed through iteration.`,
    jobSearchValue: `Use as evidence of project ownership, systems thinking, written communication, and follow-through.`,
    postIdea: `I’m logging a new receipt for ${input.projectName}: ${input.whatChanged} No tax. Only trace.`,
  };
}

function loadReceipts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as Receipt[] : starters;
  } catch {
    return starters;
  }
}

function generateOutput(receipt: Receipt, kind: string) {
  if (kind === 'thread') return `1/ New receipt from ${receipt.projectName}.\n\n${receipt.whatChanged}\n\n2/ What I built:\n${receipt.whatBuilt}\n\n3/ What I learned:\n${receipt.whatLearned}\n\n4/ Why it matters:\n${receipt.whyItMatters}\n\n5/ What this proves:\n${receipt.whatThisProves}\n\nNo tax. Only trace.`;
  if (kind === 'portfolio') return `${receipt.projectName} — ${receipt.proofSummary}\n\n${receipt.portfolioValue}\n\nImpact: ${receipt.whatThisProves}`;
  if (kind === 'readme') return `## Latest Receipt\n\n**What changed:** ${receipt.whatChanged}\n\n**What I built:** ${receipt.whatBuilt}\n\n**Why it matters:** ${receipt.whyItMatters}`;
  if (kind === 'job') return `- Built and documented ${receipt.projectName}, demonstrating ${receipt.whatThisProves.toLowerCase()}`;
  if (kind === 'devlog') return `# Devlog — ${receipt.projectName}\n\n## What changed\n${receipt.whatChanged}\n\n## What I built\n${receipt.whatBuilt}\n\n## What I learned\n${receipt.whatLearned}\n\n## Why it matters\n${receipt.whyItMatters}`;
  return `${receipt.postIdea}\n\nProof: ${receipt.whatThisProves}`;
}

function App() {
  const [receipts, setReceipts] = useState<Receipt[]>(loadReceipts);
  const [view, setView] = useState<View>('dashboard');
  const [selected, setSelected] = useState<Receipt | undefined>(receipts[0]);
  const [filter, setFilter] = useState('All');
  const [outputKind, setOutputKind] = useState('post');
  const projects = useMemo(() => ['All', ...Array.from(new Set(receipts.map(r => r.projectName)))], [receipts]);
  const visible = filter === 'All' ? receipts : receipts.filter(r => r.projectName === filter);
  const output = selected ? generateOutput(selected, outputKind) : 'Select a receipt first.';

  function persist(next: Receipt[]) { setReceipts(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  function addReceipt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const receipt = forgeReceipt({
      projectName: String(data.get('projectName') || 'Untitled Project'),
      type: String(data.get('type') || 'devlog') as ReceiptType,
      linkOrNote: String(data.get('linkOrNote') || ''),
      whatChanged: String(data.get('whatChanged') || ''),
      whatBuilt: String(data.get('whatBuilt') || ''),
      whatLearned: String(data.get('whatLearned') || ''),
      whyItMatters: String(data.get('whyItMatters') || ''),
      audience: String(data.get('audience') || 'recruiter') as Audience,
    });
    persist([receipt, ...receipts]);
    setSelected(receipt);
    setView('composer');
    event.currentTarget.reset();
  }
  function remove(id: string) { if (confirm('Delete this local receipt?')) persist(receipts.filter(r => r.id !== id)); }
  function exportMarkdown() {
    const markdown = '# AetherTwin Receipts\n\n' + receipts.map(r => `## ${r.projectName}\n\nType: ${r.type}\nLink / Note: ${r.linkOrNote}\nWhat changed: ${r.whatChanged}\nWhat I built: ${r.whatBuilt}\nWhat I learned: ${r.whatLearned}\nWhy it matters: ${r.whyItMatters}\nWhat this proves: ${r.whatThisProves}\nPortfolio value: ${r.portfolioValue}\nJob-search value: ${r.jobSearchValue}\nPost idea: ${r.postIdea}\n`).join('\n---\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'aethertwin-receipts.md'; a.click(); URL.revokeObjectURL(url);
  }

  return <main className="shell">
    <header className="topbar"><div className="sigil">✦</div><div><strong>AetherTwin Receipts Forge</strong><span>Turn scattered work into proof.</span></div><nav>{(['dashboard','forge','library','composer','timeline'] as View[]).map(v => <button className={view === v ? 'active' : ''} onClick={() => setView(v)} key={v}>{v}</button>)}</nav><button onClick={exportMarkdown}>Export Markdown</button></header>
    {view === 'dashboard' && <section className="hero"><p className="eyebrow">No tax. Only trace.</p><h1>Turn scattered work into proof.</h1><p>Every repo, post, demo, screenshot, and half-finished prototype leaves a trace. Forge those traces into portfolio proof, job-search ammo, devlogs, and visibility.</p><div className="actions"><button onClick={() => setView('forge')}>Forge New Receipt</button><button onClick={() => setView('library')}>View Proof Library</button></div><div className="stats"><b>{receipts.length}<span>Total receipts</span></b><b>{projects.length - 1}<span>Active projects</span></b><b>{receipts[0]?.projectName ?? 'None'}<span>Latest trace</span></b></div></section>}
    {view === 'forge' && <form className="panel form" onSubmit={addReceipt}><h2>Forge a new proof card</h2><input name="projectName" placeholder="Project name" required /><select name="type"><option value="repo">repo</option><option value="demo">demo</option><option value="screenshot">screenshot</option><option value="post">post</option><option value="devlog">devlog</option><option value="job-proof">job proof</option><option value="other">other</option></select><select name="audience"><option value="recruiter">recruiter</option><option value="player">player</option><option value="follower">follower</option><option value="collaborator">collaborator</option><option value="myself">myself</option></select><input name="linkOrNote" placeholder="Link or note" /><textarea name="whatChanged" placeholder="What changed?" required /><textarea name="whatBuilt" placeholder="What did I build?" required /><textarea name="whatLearned" placeholder="What did I learn?" /><textarea name="whyItMatters" placeholder="Why does this matter?" /><button>Forge Receipt</button></form>}
    {view === 'library' && <section><div className="toolbar"><h2>Receipts Library</h2><select value={filter} onChange={e => setFilter(e.target.value)}>{projects.map(p => <option key={p}>{p}</option>)}</select></div><div className="grid">{visible.map(r => <article className="card" key={r.id}><div className="meta"><span>{r.type}</span><span>{r.date}</span></div><h3>{r.projectName}</h3><p>{r.proofSummary}</p><small>{r.whatThisProves}</small><div className="actions"><button onClick={() => { setSelected(r); setView('composer'); }}>Compose</button><button onClick={() => remove(r.id)}>Delete</button></div></article>)}</div></section>}
    {view === 'composer' && <section className="panel composer"><aside><p className="eyebrow">Selected Receipt</p><h2>{selected?.projectName ?? 'None selected'}</h2><p>{selected?.proofSummary ?? 'Pick a receipt from the library.'}</p><select value={outputKind} onChange={e => setOutputKind(e.target.value)}><option value="post">X post</option><option value="thread">X thread</option><option value="portfolio">Portfolio blurb</option><option value="readme">README section</option><option value="job">Job bullet</option><option value="devlog">Devlog</option></select><button onClick={() => navigator.clipboard.writeText(output)}>Copy Output</button></aside><pre>{output}</pre></section>}
    {view === 'timeline' && <section>{projects.filter(p => p !== 'All').map(project => <article className="panel timeline" key={project}><h2>{project}</h2>{receipts.filter(r => r.projectName === project).map(r => <div className="line" key={r.id}><span>{r.date}</span><strong>{r.whatChanged}</strong><p>{r.whatThisProves}</p></div>)}</article>)}</section>}
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
