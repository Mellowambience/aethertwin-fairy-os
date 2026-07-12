import { useEffect, useMemo, useState } from 'react'

type Receipt = { id:string; project:string; kind:string; audience:string; link:string; changed:string; built:string; learned:string; matters:string; date:string }
const seed: Receipt[] = [
  { id:'fairy-os', project:'Fairy OS', kind:'devlog', audience:'recruiter', link:'soul.md + agent registry', changed:'Built the first local-first agent OS blueprint.', built:'A Helm, agent roster, permissions model, Genesis Profile system, and v0.1 scope.', learned:'Receipts should come before autonomy.', matters:'It turns ideas into evidence and gives future agents continuity.', date:'2026-07-07' },
  { id:'qi-games', project:'QI-Games', kind:'screenshot', audience:'player', link:'sprite art direction', changed:'Defined quantum fairy sprite assets.', built:'A readable HD-2D pixel-art asset brief for fairy, mana berry, and rune grass.', learned:'Tiny assets need strong silhouettes.', matters:'Production specs make the magic executable.', date:'2026-07-07' },
  { id:'magic-machine', project:'Magic Meets Machine', kind:'product', audience:'myself', link:'creator business notes', changed:'Outlined a fantasy/AI creator business.', built:'A platform concept for products, memberships, blog, newsletter, and automation.', learned:'One sellable artifact beats a giant platform first.', matters:'It links creative output to income experiments.', date:'2026-06-26' }
]
const blank = { project:'', kind:'devlog', audience:'recruiter', link:'', changed:'', built:'', learned:'', matters:'' }

function proof(r: Receipt) {
  const angle: Record<string,string> = { recruiter:'technical ownership, product thinking, communication, and shipping judgment', player:'player fantasy, feel, visual clarity, and production awareness', follower:'story, momentum, and creative evolution', collaborator:'shared context, direction, and handoff quality', myself:'memory, proof, and sustainable momentum' }
  const proves = `Shows ${angle[r.audience] ?? 'project ownership and follow-through'}. This is no longer just an idea; it has a trace.`
  return {
    summary: `Created a ${r.kind} receipt for ${r.project}: ${r.built}`,
    proves,
    portfolio: `${r.project} can become a case study around ${r.built.toLowerCase()} with constraints, iteration, and proof-of-work framing.`,
    job: `Designed and documented ${r.built.toLowerCase()} for ${r.project}, demonstrating ${proves.toLowerCase()}`,
    post: `New receipt from ${r.project}: ${r.changed}\n\nWhat I built: ${r.built}\n\nWhy it matters: ${r.matters}\n\nNo tax. Only trace.`,
    readme: `## ${r.project}\n\n**What changed:** ${r.changed}\n\n**What I built:** ${r.built}\n\n**What I learned:** ${r.learned}\n\n**Why it matters:** ${r.matters}`,
    devlog: `# Devlog — ${r.project}\n\n## What changed\n${r.changed}\n\n## What I built\n${r.built}\n\n## What I learned\n${r.learned}\n\n## Why it matters\n${r.matters}`
  }
}
function load(){ try{return JSON.parse(localStorage.getItem('aethertwin.receipts.v1')||'') as Receipt[]} catch{return seed} }

export default function App(){
  const [receipts,setReceipts]=useState<Receipt[]>(load)
  const [tab,setTab]=useState('dashboard')
  const [selected,setSelected]=useState<Receipt|null>(receipts[0]??null)
  const [filter,setFilter]=useState('All')
  const [form,setForm]=useState(blank)
  const projects=['All',...Array.from(new Set(receipts.map(r=>r.project)))]
  const visible=filter==='All'?receipts:receipts.filter(r=>r.project===filter)
  const output=useMemo(()=>selected?proof(selected):null,[selected])
  useEffect(()=>localStorage.setItem('aethertwin.receipts.v1',JSON.stringify(receipts)),[receipts])
  function add(e:React.FormEvent){e.preventDefault(); const next={...form,id:crypto.randomUUID(),date:new Date().toISOString().slice(0,10)}; setReceipts([next,...receipts]); setSelected(next); setForm(blank); setTab('composer')}
  function exportMd(){const md=receipts.map(r=>`## ${r.project} — ${r.date}\n\nType: ${r.kind}\nLink/Note: ${r.link}\nWhat changed: ${r.changed}\nWhat I built: ${r.built}\nWhat I learned: ${r.learned}\nWhy it matters: ${r.matters}\nWhat this proves: ${proof(r).proves}\n`).join('\n---\n'); const url=URL.createObjectURL(new Blob([`# AetherTwin Receipts\n\n${md}`],{type:'text/markdown'})); const a=document.createElement('a'); a.href=url; a.download='aethertwin-receipts.md'; a.click(); URL.revokeObjectURL(url)}
  return <div className="shell"><header className="top"><div className="sigil">✦</div><div><p>No tax. Only trace.</p><h1>AetherTwin Receipts Forge</h1></div><button onClick={exportMd}>Export Markdown</button></header>
    <nav>{['dashboard','forge','library','composer','timeline'].map(t=><button key={t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</nav>
    {tab==='dashboard'&&<main className="grid"><section className="hero"><p>AetherTwin Receipts Forge</p><h2>Turn scattered work into proof.</h2><span>Every repo, demo, screenshot, devlog, and half-finished prototype leaves a trace. Forge those traces into portfolio proof, job-search ammo, devlogs, and visibility.</span><div><button onClick={()=>setTab('forge')}>Forge New Receipt</button><button className="ghost" onClick={()=>setTab('library')}>View Library</button></div></section><section className="stat"><b>{receipts.length}</b><span>Total receipts</span></section><section className="stat"><b>{projects.length-1}</b><span>Projects</span></section><section className="stat"><b>{receipts[0]?.project}</b><span>Latest proof</span></section><section className="panel wide"><h3>Strongest proof</h3><p>{receipts[0]&&proof(receipts[0]).portfolio}</p></section></main>}
    {tab==='forge'&&<main className="panel"><h2>Forge a new proof card</h2><form onSubmit={add}>{(['project','kind','audience','link','changed','built','learned','matters'] as const).map(k=><label key={k}>{k}<textarea required={['project','changed','built'].includes(k)} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}<button>Forge Receipt</button></form></main>}
    {tab==='library'&&<main><div className="toolbar"><h2>Proof Library</h2><select value={filter} onChange={e=>setFilter(e.target.value)}>{projects.map(p=><option key={p}>{p}</option>)}</select></div><div className="cards">{visible.map(r=><article className="card" key={r.id}><small>{r.kind} · {r.date}</small><h3>{r.project}</h3><p>{proof(r).summary}</p><em>{proof(r).proves}</em><div><button onClick={()=>{setSelected(r);setTab('composer')}}>Compose</button><button className="danger" onClick={()=>setReceipts(receipts.filter(x=>x.id!==r.id))}>Delete</button></div></article>)}</div></main>}
    {tab==='composer'&&<main className="split"><section className="panel"><h2>{selected?.project??'Select a receipt'}</h2><p>{selected&&proof(selected).summary}</p></section><section className="panel"><h2>Outputs</h2>{output?Object.entries({'X Post':output.post,'Portfolio Blurb':output.portfolio,'README Section':output.readme,'Job Bullet':output.job,'Devlog':output.devlog}).map(([k,v])=><details open key={k}><summary>{k}</summary><pre>{v}</pre><button onClick={()=>navigator.clipboard.writeText(v)}>Copy</button></details>):<p>Choose a receipt from the library.</p>}</section></main>}
    {tab==='timeline'&&<main className="cards">{projects.filter(p=>p!=='All').map(project=><article className="card" key={project}><h3>{project}</h3>{receipts.filter(r=>r.project===project).map(r=><p key={r.id}><b>{r.date}</b> — {r.changed}</p>)}</article>)}</main>}
  </div>
}
