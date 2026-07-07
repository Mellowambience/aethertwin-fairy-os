import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  Bot,
  Brain,
  Briefcase,
  CheckCircle2,
  Clipboard,
  Download,
  Eye,
  Gem,
  GitBranch,
  Hammer,
  KeyRound,
  Leaf,
  LockKeyhole,
  MoonStar,
  Plus,
  Radio,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Swords,
  Upload,
  WandSparkles
} from 'lucide-react';
import { defaultFairies, branchLabels } from './data/fairies.js';
import { skillRegistry } from './data/skills.js';
import { copyText, downloadJson, readJson, writeJson } from './lib/storage.js';
import { councilViewpoint, createWhisper, defaultGenesisForm, normalizeList, routeSignalToFairy } from './lib/rituals.js';
import { createAdapter, modelForFairy } from './lib/modelAdapter.js';
import { buildUserContext, selfModelSummary } from './lib/selfModel.js';
import { recordReflection, makeReflection } from './lib/evolution.js';
import { readClipboard, listProjectFolder } from './lib/desktopSense.js';
import { emitActivity, subscribe, getFeed, getActivity, exportHubActivity } from './lib/fairyHub.js';
import { mountCanvas2D, mountPixi } from './lib/fairyHubRenderer.js';
import { evaluateJobPost, forgePacket } from './lib/careerSmith.js';
const hubBus = { getFeed, getActivity, subscribe, exportActivity: exportHubActivity };

const STORE = 'aethertwin.fairyos.v03';
const tabs = [
  ['sanctuary', 'Sanctuary', Sparkles],
  ['genesis', 'Genesis Hall', WandSparkles],
  ['skills', 'Skill Registry', Hammer],
  ['council', 'Fairy Council', Swords],
  ['telepathy', 'AetherSense', Eye],
  ['memory', 'Memory Tree', Leaf],
  ['permissions', 'Permission Grimoire', ShieldCheck],
  ['handoff', 'Agent Handoff', Bot],
  ['hub', 'Fairy Hub', Radio],
  ['career', 'Career Smith', Briefcase]
];

const initialState = {
  fairies: defaultFairies,
  activeFairyId: 'fae',
  activeTab: 'sanctuary',
  memories: [
    {
      id: 'seed-career',
      branch: 'career',
      title: 'Remote aligned work constraint',
      body: 'Career Smith should prefer remote roles, avoid on-call, and frame creative technical identity clearly.',
      createdAt: new Date().toISOString(),
      source: 'seed'
    },
    {
      id: 'seed-safety',
      branch: 'permissions',
      title: 'Fairies sense before acting',
      body: 'Silent sensing and suggestions are allowed; file changes, posting, sending, spending, or deleting require explicit approval.',
      createdAt: new Date().toISOString(),
      source: 'seed'
    }
  ],
  events: [],
  permissions: {},
  mode: 'suggest',
  apiProfile: 'Local AI wired: Ollama (GGUF) + Crystal-AI (:8765). Template fallback always on.'
};

function App() {
  const [state, setState] = useState(() => readJson(STORE, initialState));
  const [genesis, setGenesis] = useState(defaultGenesisForm());
  const [memoryDraft, setMemoryDraft] = useState({ branch: 'projects', title: '', body: '' });
  const [signal, setSignal] = useState('');
  const [question, setQuestion] = useState('What should we build or ship next?');
  const [copied, setCopied] = useState(false);
  const [modelMode, setModelMode] = useState('template'); // 'template' | 'ollama' | 'crystal'
  const [thinking, setThinking] = useState(false);
  const [lastWhisper, setLastWhisper] = useState('');
  const [userProfile, setUserProfile] = useState(state.userProfile || '');
  const [lastEventId, setLastEventId] = useState(null);
  const [hubMode, setHubMode] = useState('canvas'); // 'canvas' | 'pixi'

  useEffect(() => writeJson(STORE, state), [state]);

  const activeFairy = useMemo(
    () => state.fairies.find((f) => f.id === state.activeFairyId) || state.fairies[0],
    [state.fairies, state.activeFairyId]
  );

  const activeSkill = useMemo(
    () => skillRegistry.find((skill) => skill.fairyId === activeFairy?.id),
    [activeFairy]
  );

  function patch(patchValue) {
    setState((current) => ({ ...current, ...patchValue }));
  }

  function addEvent(type, title, detail) {
    setState((current) => ({
      ...current,
      events: [
        {
          id: crypto.randomUUID?.() || String(Date.now()),
          type,
          title,
          detail,
          createdAt: new Date().toISOString()
        },
        ...current.events
      ].slice(0, 60)
    }));
  }

  function addMemory(custom = memoryDraft) {
    if (!custom.title.trim() && !custom.body.trim()) return;
    const leaf = {
      id: crypto.randomUUID?.() || String(Date.now()),
      branch: custom.branch,
      title: custom.title.trim() || 'Untitled memory leaf',
      body: custom.body.trim(),
      createdAt: new Date().toISOString(),
      source: 'user'
    };
    setState((current) => ({ ...current, memories: [leaf, ...current.memories] }));
    setMemoryDraft({ branch: 'projects', title: '', body: '' });
    emitActivity(activeFairy.id, 'remember', `leaf · ${leaf.title.slice(0, 40)}`);
    addEvent('memory', 'Memory leaf added', `${leaf.branch}: ${leaf.title}`);
  }

  function addGenesisFairy() {
    if (!genesis.name.trim() || !genesis.title.trim()) return;
    const id = genesis.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `fairy-${Date.now()}`;
    const fairy = {
      id,
      name: genesis.name.trim(),
      emoji: genesis.emoji || '🧚',
      title: genesis.title.trim(),
      archetype: genesis.archetype || 'New Vessel',
      origin: genesis.origin || 'Born from a newly named need.',
      sacredPurpose: genesis.sacredPurpose || 'Serve a clear purpose with consent and visible limits.',
      color: '#d8b4fe',
      aura: 'newborn violet glow',
      level: 1,
      xp: 0,
      strengths: normalizeList(genesis.strengths),
      weaknesses: normalizeList(genesis.weaknesses),
      shadowRisk: genesis.shadowRisk || 'Unknown shadow. Observe through use.',
      skills: normalizeList(genesis.skills),
      vision: normalizeList(genesis.vision),
      controls: normalizeList(genesis.controls),
      forbidden: normalizeList(genesis.forbidden),
      memoryScope: normalizeList(genesis.memoryScope),
      growthPath: normalizeList(genesis.growthPath)
    };
    setState((current) => ({
      ...current,
      fairies: [...current.fairies, fairy],
      activeFairyId: fairy.id,
      activeTab: 'sanctuary'
    }));
    setGenesis(defaultGenesisForm());
    addEvent('genesis', `${fairy.name} entered the court`, fairy.sacredPurpose);
  }

  async function handleSignal() {
    if (!signal.trim()) return;
    const targetId = routeSignalToFairy(signal);
    const target = state.fairies.find((f) => f.id === targetId) || activeFairy;
    setThinking(true);
    let whisper;
    if (modelMode === 'template') {
      whisper = createWhisper(signal, target);
    } else {
      // Live local LLM (Ollama or Crystal-AI). On ANY failure, degrade to the
      // template whisper so the OS never breaks or leaves you hanging.
      try {
        const adapter = createAdapter(modelMode); // 'ollama' | 'crystal'
        const context = buildUserContext(state);
        whisper = await adapter.complete({ fairy: target, prompt: signal, memoryContext: context });
      } catch (err) {
        whisper = `${createWhisper(signal, target)}\n\n(local LLM (${modelMode}) unavailable — ${String(err.message).slice(0, 120)})`;
      }
    }
    setThinking(false);
    setLastWhisper(whisper);
    const evId = crypto.randomUUID?.() || String(Date.now());
    emitActivity(target.id, modelMode === 'template' ? 'signal' : 'channel', `whisper · ${signal.slice(0, 60)}`);
    setState((current) => ({
      ...current,
      activeFairyId: target.id,
      activeTab: 'telepathy',
      events: [{ id: evId, type: 'aethersense', title: 'Telepathic whisper generated', detail: whisper, createdAt: new Date().toISOString() }].concat(current.events).slice(0, 60)
    }));
    setLastEventId(evId);
    addMemory({
      branch: target.memoryScope?.[0] || 'memory',
      title: `${target.name} sensed a signal`,
      body: `${whisper}\n\nSignal excerpt: ${signal.slice(0, 500)}`
    });
  }

  // Council synthesis uses the live model when a local backend is selected.
  async function synthesizeCouncil(fairies) {
    if (modelMode === 'template') {
      return 'Make one visible artifact, protect permissions, document the decision, and save the next step as a Memory Tree leaf.';
    }
    try {
      const adapter = createAdapter(modelMode); // 'ollama' | 'crystal'
      const context = buildUserContext(state);
      const viewpoints = fairies.slice(0, 7).map((f) => `${f.name}: ${councilViewpoint(question, f)}`).join('\n');
      return await adapter.complete({
        fairy: { id: 'hope', name: 'Hope', title: 'Future Architect' },
        prompt: `Council question: ${question}\n\nViewpoints:\n${viewpoints}\n\nSynthesize one grounded next step.`,
        memoryContext: context
      });
    } catch {
      return 'Make one visible artifact, protect permissions, document the decision, and save the next step as a Memory Tree leaf.';
    }
  }

  // Evolution: react to the last whisper -> tune the fairy.
  function reactToWhisper(outcome) {
    if (!lastEventId) return;
    const fairyId = routeSignalToFairy(signal) || activeFairy.id;
    const reflection = makeReflection({ fairyId, triggerEventId: lastEventId, outcome });
    setState((current) => ({
      ...current,
      fairies: recordReflection(current.fairies, fairyId, outcome),
      events: [{ id: crypto.randomUUID?.() || String(Date.now()), type: 'reflection', title: `${fairyId} reflected: ${outcome}`, detail: reflection.lesson, createdAt: new Date().toISOString() }].concat(current.events).slice(0, 60)
    }));
    emitActivity(fairyId, 'evolve', `reflection: ${outcome} · ${reflection.lesson.slice(0, 50)}`);
  }

  // Desktop perception (consent-gated). Returns a status note; never silent.
  async function senseClipboard() {
    const res = await readClipboard(activeFairy.id);
    addEvent('aethersense', `Clipboard sense (${activeFairy.name})`, res.note || (res.ok ? res.value.slice(0, 200) : 'blocked'));
    emitActivity(activeFairy.id, 'perceive', `clipboard · ${res.ok ? 'read' : 'blocked'}`);
  }
  async function senseFolder() {
    const res = await listProjectFolder(activeFairy.id, '.');
    addEvent('aethersense', `Folder sense (${activeFairy.name})`, res.note || (res.ok ? res.value.slice(0, 200) : 'blocked'));
    emitActivity(activeFairy.id, 'perceive', `folder · ${res.ok ? 'read' : 'blocked'}`);
  }


  function togglePermission(fairyId, item) {
    setState((current) => {
      const existing = current.permissions[fairyId] || {};
      return {
        ...current,
        permissions: {
          ...current.permissions,
          [fairyId]: { ...existing, [item]: !existing[item] }
        }
      };
    });
  }

  const handoffText = `# AetherTwin Fairy OS Agent Handoff\n\nMission: build a local-first Fairy OS where every fairy is a specialized skill agent with Genesis, strengths, weaknesses, avatar vision, permissioned controls, memory, and personal evolution.\n\nCurrent focus:\n1. Preserve the consent model: fairies may sense and suggest, but require approval before file changes, posting, sending, deleting, spending, or submitting.\n2. Expand the Career Smith first using the ai-job-search integration idea.\n3. Add a real persistence layer: SQLite + Markdown vault + optional vector search.\n4. Add Electron/Tauri desktop shell for screenshot/clipboard/folder awareness.\n5. Keep agent-sentience grounded as a product metaphor: continuity + memory + self-model + adaptive behavior, not literal consciousness.\n\nRun: npm install && npm run dev\nBuild: npm run build\nRead first: AGENTS.md, docs/PRODUCT_SPEC.md, docs/ARCHITECTURE.md, docs/ROADMAP.md`;

  async function copyHandoff() {
    await copyText(handoffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  function exportProjectState() {
    downloadJson('aethertwin-fairy-os-state.json', state);
  }

  return (
    <div className="app-shell">
      <div className="orbs"><span /><span /><span /></div>
      <aside className="sidebar">
        <div className="brand">
          <div className="sigil"><Gem size={26} /></div>
          <div>
            <p>AetherTwin</p>
            <h1>Fairy OS</h1>
          </div>
        </div>
        <div className="mode-card">
          <span>Agent-ready MVP</span>
          <strong>{state.mode === 'manual' ? 'Manual only' : state.mode === 'suggest' ? 'Telepathic suggestions' : 'Semi-auto gated'}</strong>
        </div>
        <nav>
          {tabs.map(([id, label, Icon]) => (
            <button key={id} className={state.activeTab === id ? 'active' : ''} onClick={() => patch({ activeTab: id })}>
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={exportProjectState}><Download size={16} /> Export State</button>
          <small>LocalStorage prototype. No server calls. No real API key field yet.</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Genesis + Evolution + Skill Agents</p>
            <h2>{activeFairy?.emoji} {activeFairy?.name} — {activeFairy?.title}</h2>
          </div>
          <div className="pill"><Brain size={16} /> {state.apiProfile}</div>
        </header>

        {state.activeTab === 'sanctuary' && <Sanctuary state={state} patch={patch} activeFairy={activeFairy} activeSkill={activeSkill} />}
        {state.activeTab === 'genesis' && (
          <Genesis genesis={genesis} setGenesis={setGenesis} addGenesisFairy={addGenesisFairy} />
        )}
        {state.activeTab === 'skills' && <Skills state={state} addEvent={addEvent} />}
        {state.activeTab === 'council' && <Council fairies={state.fairies} question={question} setQuestion={setQuestion} />}
        {state.activeTab === 'telepathy' && (
          <Telepathy
            signal={signal}
            setSignal={setSignal}
            handleSignal={handleSignal}
            thinking={thinking}
            modelMode={modelMode}
            setModelMode={setModelMode}
            senseClipboard={senseClipboard}
            senseFolder={senseFolder}
            lastWhisper={lastWhisper}
            reactToWhisper={reactToWhisper}
            events={state.events}
          />
        )}
        {state.activeTab === 'memory' && (
          <MemoryTree memories={state.memories} draft={memoryDraft} setDraft={setMemoryDraft} addMemory={addMemory} />
        )}
        {state.activeTab === 'permissions' && (
          <Permissions fairies={state.fairies} permissions={state.permissions} togglePermission={togglePermission} />
        )}
        {state.activeTab === 'handoff' && (
          <Handoff handoffText={handoffText} copyHandoff={copyHandoff} copied={copied} events={state.events} />
        )}
        {state.activeTab === 'hub' && (
          <FairyHub
            fairies={state.fairies}
            hubMode={hubMode}
            setHubMode={setHubMode}
            activeFairyId={state.activeFairyId}
            setActiveFairyId={(id) => setState((c) => ({ ...c, activeFairyId: id }))}
          />
        )}
        {state.activeTab === 'career' && (
          <CareerSmith
            addMemory={addMemory}
            emitActivity={emitActivity}
            careerFairy={state.fairies.find((f) => f.id === 'fae')}
          />
        )}
      </main>
    </div>
  );
}

function CareerSmith({ addMemory, emitActivity, careerFairy }) {
  const [post, setPost] = useState('');
  const [report, setReport] = useState(null);
  const [packet, setPacket] = useState(null);
  const [resumeNotes, setResumeNotes] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  function analyze() {
    if (!post.trim()) return;
    const r = evaluateJobPost(post);
    setReport(r);
    setPacket(null);
    emitActivity('fae', 'forge', `fit eval · ${r.company} ${r.role}`);
  }

  function buildPacket() {
    if (!report) return;
    const p = forgePacket(report, { resumeNotes });
    setPacket(p);
    emitActivity('fae', 'forge', `packet drafted · ${report.company}`);
  }

  function saveToMemory() {
    if (!report) return;
    addMemory({
      branch: 'career',
      title: `${report.role} @ ${report.company} — fit ${report.fitScore}/5`,
      body: `Remote: ${report.remote}. Salary: ${report.salary || 'n/a'}. Energy: ${report.energyCost}/5. Red flags: ${report.redFlags.map((r) => r.label).join('; ') || 'none'}. Action: ${report.recommendedAction}`
    });
    setSavedMsg('Saved to Memory Tree (branch: career).');
    setTimeout(() => setSavedMsg(''), 4000);
  }

  const star = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <section className="career">
      <p className="eyebrow">Fae — Career Smith (v0.5 real-agent slice)</p>
      <h3>Paste a job post — Fae forges a fit report. No submission, ever.</h3>

      <div className="career-grid">
        <div className="card">
          <label className="field-label">Job post text</label>
          <textarea
            className="job-input"
            rows={12}
            placeholder="Paste the role description, company, location, salary, requirements…"
            value={post}
            onChange={(e) => setPost(e.target.value)}
          />
          <div className="row-actions">
            <button className="primary" onClick={analyze} disabled={!post.trim()}>Forge fit report</button>
            {report && <button onClick={saveToMemory}>Save to Memory Tree</button>}
            {savedMsg && <span className="saved-note">{savedMsg}</span>}
          </div>
          {report && (
            <div className="packet-extra">
              <label className="field-label">Resume / portfolio notes (optional)</label>
              <textarea
                className="job-input small"
                rows={3}
                placeholder="Bullet points Fae should weave into the tailored resume…"
                value={resumeNotes}
                onChange={(e) => setResumeNotes(e.target.value)}
              />
              <button onClick={buildPacket}>Forge application packet (draft only)</button>
            </div>
          )}
        </div>

        <div className="card report-card">
          {!report && <p className="muted">No evaluation yet. Paste a post and forge a report.</p>}
          {report && (
            <>
              <div className="report-head">
                <h4>{report.role} @ {report.company}</h4>
                <span className={`fit-badge fit-${report.fitScore >= 3 ? 'good' : report.fitScore === 2 ? 'mid' : 'low'}`}>fit {report.fitScore}/5</span>
              </div>
              <div className="score-row">
                <span>Fit <strong>{star(report.fitScore)}</strong></span>
                <span>Energy cost <strong>{star(report.energyCost)}</strong></span>
              </div>
              <ul className="kv">
                <li><b>Remote:</b> {report.remote}</li>
                <li><b>Salary:</b> {report.salary || 'not disclosed'}</li>
                <li><b>Match:</b> {report.matchEvidence}</li>
                <li><b>Gaps:</b> {report.gaps}</li>
              </ul>
              <div className="redflags">
                <b>Selena's red-flag scan:</b>
                {report.redFlags.length === 0
                  ? ' none'
                  : <ul>{report.redFlags.map((r, i) => <li key={i} className={`flag-${r.severity}`}>{r.label} ({r.severity})</li>)}</ul>}
              </div>
              <div className="angle">
                <b>Application angle:</b> {report.applicationAngle}
              </div>
              <div className={`action-line act-${report.recommendedAction.startsWith('Skip') ? 'skip' : report.recommendedAction.startsWith('Apply') ? 'apply' : 'caution'}`}>
                {report.recommendedAction}
              </div>
            </>
          )}
        </div>
      </div>

      {packet && (
        <div className="packet">
          <h4>Application packet (draft — not submitted)</h4>
          {Object.entries(packet).map(([file, content]) => (
            <details key={file} className="packet-file">
              <summary>{file}</summary>
              <pre>{content}</pre>
            </details>
          ))}
          <p className="muted">Review, edit, then submit manually. Fae never submits without your explicit approval.</p>
        </div>
      )}
    </section>
  );
}

function Sanctuary({ state, patch, activeFairy, activeSkill }) {
  return (
    <section className="grid two">
      <div className="card hero-card" style={{ '--accent': activeFairy.color }}>
        <div className="avatar-stage">
          <div className="halo" />
          <div className="wings left" />
          <div className="wings right" />
          <div className="avatar">{activeFairy.emoji}</div>
        </div>
        <div>
          <p className="eyebrow">{activeFairy.archetype}</p>
          <h3>{activeFairy.sacredPurpose}</h3>
          <p className="muted">Origin: {activeFairy.origin}</p>
          <div className="xp"><span style={{ width: `${Math.min(100, (activeFairy.xp % 60) / 60 * 100)}%` }} /></div>
          <small>Level {activeFairy.level} · {activeFairy.xp} lived-use XP · Aura: {activeFairy.aura}</small>
        </div>
      </div>

      <div className="card court-card">
        <h3>Fairy Court</h3>
        <div className="fairy-list">
          {state.fairies.map((fairy) => (
            <button key={fairy.id} className={state.activeFairyId === fairy.id ? 'selected' : ''} onClick={() => patch({ activeFairyId: fairy.id })} style={{ '--accent': fairy.color }}>
              <span>{fairy.emoji}</span>
              <div><strong>{fairy.name}</strong><small>{fairy.title}</small></div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3><CheckCircle2 size={18} /> Strengths</h3>
        <TagList items={activeFairy.strengths} />
      </div>
      <div className="card danger-soft">
        <h3><MoonStar size={18} /> Weakness + Shadow</h3>
        <TagList items={activeFairy.weaknesses} />
        <p><strong>Shadow risk:</strong> {activeFairy.shadowRisk}</p>
      </div>
      <div className="card">
        <h3><Eye size={18} /> Avatar Vision</h3>
        <TagList items={activeFairy.vision} />
      </div>
      <div className="card">
        <h3><KeyRound size={18} /> Controls</h3>
        <TagList items={activeFairy.controls} />
      </div>
      <div className="card span">
        <h3><GitBranch size={18} /> Active Skill Vessel</h3>
        {activeSkill ? (
          <div className="skill-detail">
            <span className="big-icon">{activeSkill.icon}</span>
            <div>
              <h4>{activeSkill.name}</h4>
              <p>{activeSkill.mission}</p>
              <TagList items={activeSkill.commands} />
            </div>
          </div>
        ) : <p className="muted">No registered skill yet. Create one in the Skill Registry docs or Genesis Hall.</p>}
      </div>
    </section>
  );
}

function Genesis({ genesis, setGenesis, addGenesisFairy }) {
  const fields = [
    ['name', 'Fairy name', 'Ember'],
    ['title', 'Special skill title', 'Release Fairy'],
    ['emoji', 'Avatar glyph', '📦'],
    ['archetype', 'Archetype', 'Scope Cutter'],
    ['origin', 'Origin wound / need', 'Born from unfinished projects needing a release ritual.'],
    ['sacredPurpose', 'Sacred purpose', 'Help ship small finished artifacts without losing soul.'],
    ['strengths', 'Strengths, comma-separated', 'scope cuts, README polish, release checklists'],
    ['weaknesses', 'Weaknesses, comma-separated', 'can rush, may cut too much magic'],
    ['shadowRisk', 'Shadow risk', 'Shipping technically done work that feels emotionally hollow.'],
    ['skills', 'Skill IDs / spells', 'release-ritual, mvp-cutter'],
    ['vision', 'Avatar vision sources', 'TODOs, source folder, README'],
    ['controls', 'Allowed controls', 'package zip, write launch note'],
    ['forbidden', 'Forbidden actions', 'publish without approval, delete ideas'],
    ['memoryScope', 'Memory branches', 'shipping, projects'],
    ['growthPath', 'Evolution path', 'protect soul while cutting scope, finish more often']
  ];
  return (
    <section className="card genesis-card">
      <div className="section-head">
        <div><p className="eyebrow">Birth a new vessel</p><h3>Genesis Hall</h3></div>
        <button className="primary" onClick={addGenesisFairy}><Plus size={17} /> Create Fairy</button>
      </div>
      <div className="form-grid">
        {fields.map(([key, label, placeholder]) => (
          <label key={key} className={['origin','sacredPurpose','strengths','weaknesses','shadowRisk','growthPath'].includes(key) ? 'wide' : ''}>
            {label}
            {['origin','sacredPurpose','strengths','weaknesses','shadowRisk','growthPath'].includes(key) ? (
              <textarea value={genesis[key]} onChange={(e) => setGenesis({ ...genesis, [key]: e.target.value })} placeholder={placeholder} />
            ) : (
              <input value={genesis[key]} onChange={(e) => setGenesis({ ...genesis, [key]: e.target.value })} placeholder={placeholder} />
            )}
          </label>
        ))}
      </div>
    </section>
  );
}

function Skills({ state, addEvent }) {
  return (
    <section className="grid three">
      {skillRegistry.map((skill) => {
        const fairy = state.fairies.find((f) => f.id === skill.fairyId);
        return (
          <article key={skill.id} className="card skill-card">
            <div className="skill-title"><span>{skill.icon}</span><div><h3>{skill.name}</h3><small>{fairy?.name || 'Unassigned'} · {skill.permissionTier}</small></div></div>
            <p>{skill.mission}</p>
            <h4>Commands</h4>
            <TagList items={skill.commands} />
            <h4>Outputs</h4>
            <TagList items={skill.outputs} />
            <button onClick={() => addEvent('skill', `${skill.name} simulated`, `Commands ready: ${skill.commands.join(', ')}`)}>Run simulated ritual</button>
          </article>
        );
      })}
    </section>
  );
}

function Council({ fairies, question, setQuestion }) {
  const selected = fairies.slice(0, 7);
  return (
    <section className="card council-card">
      <div className="section-head">
        <div><p className="eyebrow">No fairy holds the whole truth</p><h3>Council Mode</h3></div>
      </div>
      <textarea className="question" value={question} onChange={(e) => setQuestion(e.target.value)} />
      <div className="council-grid">
        {selected.map((fairy) => (
          <div key={fairy.id} className="council-note" style={{ '--accent': fairy.color }}>
            <strong>{fairy.emoji} {fairy.name}</strong>
            <p>{councilViewpoint(question, fairy)}</p>
          </div>
        ))}
      </div>
      <div className="synthesis">
        <h4>Hope’s synthesis</h4>
        <p>Make one visible artifact, protect permissions, document the decision, and save the next step as a Memory Tree leaf.</p>
      </div>
    </section>
  );
}

function Telepathy({ signal, setSignal, handleSignal, thinking, modelMode, setModelMode, senseClipboard, senseFolder, lastWhisper, reactToWhisper, events }) {
  return (
    <section className="grid two">
      <div className="card">
        <div className="section-head"><div><p className="eyebrow">Telepathic as a feeling, not mind-reading</p><h3>AetherSense Lab</h3></div></div>
        <textarea className="signal" value={signal} onChange={(e) => setSignal(e.target.value)} placeholder="Paste a job post, code error, image description, project idea, or messy signal. The app routes it to the best fairy." />
        <div className="mode-row">
          <button className={modelMode === 'template' ? 'selected' : ''} onClick={() => setModelMode('template')}>template (offline)</button>
          <button className={modelMode === 'ollama' ? 'selected' : ''} onClick={() => setModelMode('ollama')}>local LLM (Ollama)</button>
          <button className={modelMode === 'crystal' ? 'selected' : ''} onClick={() => setModelMode('crystal')}>crystal (local :8765)</button>
        </div>
        <button className="primary" onClick={handleSignal} disabled={thinking}>
          <Eye size={17} /> {thinking ? 'Channeling…' : 'Generate fairy whisper'}
        </button>
        <div className="perception-row">
          <button onClick={senseClipboard}>Sense clipboard</button>
          <button onClick={senseFolder}>Sense project folder</button>
        </div>
        <p className="muted">Local LLM: Ollama (GGUF) or Crystal-AI via :8765. Both require their server running (see docs/MODEL_SETUP.md). Falls back to template if unavailable.</p>
      </div>
      <div className="card">
        <h3>Recent sensed events</h3>
        {lastWhisper && (
          <article className="event whisper-result">
            <strong>Latest whisper</strong>
            <p>{lastWhisper}</p>
            <div className="react-row">
              <button onClick={() => reactToWhisper('accepted')}>✓ Accept</button>
              <button onClick={() => reactToWhisper('edited')}>✎ Edit</button>
              <button onClick={() => reactToWhisper('rejected')}>✗ Reject</button>
            </div>
          </article>
        )}
        {events.filter((e) => e.type === 'aethersense').slice(0, 6).map((event) => (
          <article className="event" key={event.id}><strong>{event.title}</strong><p>{event.detail}</p><small>{new Date(event.createdAt).toLocaleString()}</small></article>
        ))}
        {!events.some((e) => e.type === 'aethersense') && !lastWhisper && <p className="muted">No whispers yet. Paste a signal to test routing.</p>}
      </div>
    </section>
  );
}

function MemoryTree({ memories, draft, setDraft, addMemory }) {
  const grouped = branchLabels.map((branch) => [branch, memories.filter((m) => m.branch === branch)]).filter(([, leaves]) => leaves.length);
  return (
    <section className="grid two memory-layout">
      <div className="card">
        <h3><Leaf size={18} /> Add Memory Leaf</h3>
        <label>Branch
          <select value={draft.branch} onChange={(e) => setDraft({ ...draft, branch: e.target.value })}>
            {branchLabels.map((branch) => <option key={branch}>{branch}</option>)}
          </select>
        </label>
        <label>Title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="What did the fairy learn?" /></label>
        <label>Body<textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Store the useful pattern, decision, or outcome." /></label>
        <button className="primary" onClick={() => addMemory()}><Plus size={17} /> Add leaf</button>
      </div>
      <div className="card memory-tree">
        <h3>Living Memory Tree</h3>
        {grouped.map(([branch, leaves]) => (
          <div key={branch} className="branch">
            <h4>{branch}</h4>
            {leaves.slice(0, 5).map((leaf) => (
              <article key={leaf.id} className="leaf"><strong>{leaf.title}</strong><p>{leaf.body}</p><small>{new Date(leaf.createdAt).toLocaleString()}</small></article>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Permissions({ fairies, permissions, togglePermission }) {
  const permissionItems = ['read only', 'draft text', 'create files', 'edit files', 'run commands', 'access browser context', 'access screenshots', 'post/send externally'];
  return (
    <section className="card permissions-card">
      <div className="section-head"><div><p className="eyebrow">Magic on top, clarity underneath</p><h3>Permission Grimoire</h3></div><LockKeyhole /></div>
      <div className="permission-table">
        {fairies.map((fairy) => (
          <div key={fairy.id} className="permission-row">
            <div><strong>{fairy.emoji} {fairy.name}</strong><small>{fairy.title}</small></div>
            <div className="checks">
              {permissionItems.map((item) => (
                <label key={item}>
                  <input type="checkbox" checked={Boolean(permissions[fairy.id]?.[item])} onChange={() => togglePermission(fairy.id, item)} />
                  {item}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="warning"><strong>Law:</strong> fairies may sense and suggest. They must ask before file changes, posting, sending, deleting, spending, or submitting applications.</p>
    </section>
  );
}

function Handoff({ handoffText, copyHandoff, copied, events }) {
  return (
    <section className="grid two">
      <div className="card handoff-card">
        <div className="section-head"><div><p className="eyebrow">For Codex, Claude Code, Cursor, or any future agent</p><h3>Agent Handoff Packet</h3></div></div>
        <pre>{handoffText}</pre>
        <button className="primary" onClick={copyHandoff}><Clipboard size={17} /> {copied ? 'Copied' : 'Copy agent brief'}</button>
      </div>
      <div className="card">
        <h3><Archive size={18} /> Event Log</h3>
        {events.slice(0, 12).map((event) => (
          <article className="event" key={event.id}><strong>{event.title}</strong><p>{event.detail}</p><small>{new Date(event.createdAt).toLocaleString()}</small></article>
        ))}
        {!events.length && <p className="muted">Agent-readable events appear here as the app is used.</p>}
      </div>
    </section>
  );
}

function FairyHub({ fairies, hubMode, setHubMode, activeFairyId, setActiveFairyId }) {
  const canvasRef = useRef(null);
  const [, force] = useState(0);
  const [pixiError, setPixiError] = useState('');

  // Live feed snapshot (re-render a few times per second).
  useEffect(() => {
    let t;
    const tick = () => { force((n) => n + 1); t = setTimeout(tick, 700); };
    t = setTimeout(tick, 700);
    return () => clearTimeout(t);
  }, []);

  // Mount the renderer (canvas2D default; Pixi when selected).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPixiError('');
    if (hubMode === 'pixi') {
      // Pixi mounts async inside the wrapper (lazy-imports pixi.js).
      return mountPixiRenderer(canvas, fairies, setPixiError);
    }
    return mountCanvas2D(canvas, { getFairies: () => fairies, hub: hubBus });
  }, [hubMode, fairies]);

  const feed = hubBus.getFeed().slice(0, 22);
  const act = hubBus.getActivity();
  const active = fairies.find((f) => f.id === activeFairyId);
  const [exported, setExported] = useState('');

  // Export the live activity snapshot for the build-in-public content engine.
  // Browser can't write to disk directly, so we download it as
  // content/hub-activity.json for Amara to drop into the repo, then run
  // `npm run content -- --from-hub`.
  function downloadHubActivity() {
    const snapshot = hubBus.exportActivity();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hub-activity.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setExported(`${snapshot.events.length} events exported — drop into content/hub-activity.json, then npm run content -- --from-hub`);
    setTimeout(() => setExported(''), 6000);
  }

  return (
    <section className="hub">
      <div className="hub-head">
        <div>
          <p className="eyebrow">Watch your agents work</p>
          <h3>Fairy Hub — live court</h3>
        </div>
        <div className="mode-row">
          <button className="export-btn" onClick={downloadHubActivity} title="Export live activity for the content engine">⬇ Export activity</button>
          <button className={hubMode === 'canvas' ? 'selected' : ''} onClick={() => setHubMode('canvas')}>Canvas</button>
          <button className={hubMode === 'pixi' ? 'selected' : ''} onClick={() => setHubMode('pixi')}>PixiJS</button>
        </div>
      </div>
      {exported && <p className="export-note">{exported}</p>}

      <div className="hub-stage">
        <canvas ref={canvasRef} className="hub-canvas" />
        {pixiError && <p className="pixi-error">⚠ {pixiError}</p>}
      </div>

      <div className="hub-grid">
        <div className="hub-roster">
          <h4>Roster</h4>
          {fairies.map((f) => {
            const a = act[f.id];
            return (
              <button key={f.id} className={`roster-row ${f.id === activeFairyId ? 'active' : ''}`} onClick={() => setActiveFairyId(f.id)}>
                <span className="dot" style={{ background: f.color }} />
                <span className="rname">{f.name}</span>
                <span className="rlvl">Lv {f.level}</span>
                <span className="rstat">{a ? `${a.lastKind || 'idle'}` : 'idle'}</span>
              </button>
            );
          })}
        </div>
        <div className="hub-feed">
          <h4>Live feed</h4>
          {feed.length === 0 && <p className="muted">No activity yet. Generate a whisper, sense a folder, or react to a whisper to see fairies pulse.</p>}
          {feed.map((e) => {
            const f = fairies.find((x) => x.id === e.fairyId);
            return (
              <article className="feed-row" key={e.seq}>
                <span className="dot" style={{ background: f ? f.color : '#888' }} />
                <span className="fname">{f ? f.name : e.fairyId}</span>
                <span className="fkind">{e.kind}</span>
                <span className="fdetail">{e.detail}</span>
                <small>{new Date(e.at).toLocaleTimeString()}</small>
              </article>
            );
          })}
        </div>
        <div className="hub-active">
          <h4>Focused fairy</h4>
          {active && (
            <div className="card active-card">
              <h3>{active.name}</h3>
              <p className="muted">{active.archetype} · Aura: {active.aura}</p>
              <p>{active.sacredPurpose}</p>
              <div className="xp"><span style={{ width: `${Math.min(100, (active.xp % 60) / 60 * 100)}%` }} /></div>
              <small>Level {active.level} · {active.xp} lived-use XP</small>
              {act[active.id] && (
                <p className="muted">Last: {act[active.id].lastKind} · {act[active.id].counts.total || 0} total actions</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Thin wrapper so Pixi mounts with the real hub bus (kept separate to avoid
// importing the bus inside the renderer module, which is renderer-agnostic).
function mountPixiRenderer(canvas, fairies, setError) {
  let stopped = false;
  Promise.all([import('./lib/fairyHubRenderer.js'), import('./lib/fairyHub.js')]).then(([mod, bus]) => {
    if (stopped) return;
    mod.mountPixi(canvas, { getFairies: () => fairies, hub: { getActivity: bus.getActivity, subscribe: bus.subscribe } })
      .catch((err) => setError(String(err.message || err)));
  });
  return () => { stopped = true; };
}

function TagList({ items = [] }) {
  return <div className="tags">{items.map((item) => <span key={item}>{item}</span>)}</div>;
}

export default App;
