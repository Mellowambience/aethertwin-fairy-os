// Fairy Hub renderer — animated court view. Canvas2D by default (zero deps),
// PixiJS v8 when available and selected. Both are driven by the same live
// state: each fairy is an orb; recent activity makes it pulse.
//
// Driven by:
//   getFairies() -> [{ id, name, color, level }]
//   hub          -> the fairyHub module (getActivity / subscribe)

function layout(fairies, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.min(w, h) * 0.34;
  return fairies.map((f, i) => {
    const ang = (i / Math.max(1, fairies.length)) * Math.PI * 2 - Math.PI / 2;
    return { ...f, x: cx + Math.cos(ang) * radius, y: cy + Math.sin(ang) * radius };
  });
}

function kindColor(kind) {
  switch (kind) {
    case 'channel': return 'rgba(123,90,255,0.9)';
    case 'perceive': return 'rgba(119,230,255,0.9)';
    case 'evolve': return 'rgba(116,240,167,0.9)';
    case 'generate': return 'rgba(255,211,110,0.9)';
    case 'remember': return 'rgba(255,122,200,0.85)';
    case 'guard': return 'rgba(177,140,255,0.9)';
    case 'forge': return 'rgba(255,189,138,0.9)';
    default: return 'rgba(200,200,255,0.8)';
  }
}
function kindStrength(kind) {
  return kind === 'channel' || kind === 'forge' ? 1 : kind === 'perceive' || kind === 'guard' ? 0.7 : 0.5;
}

// ---- Canvas2D renderer (default, no install needed) ----
export function mountCanvas2D(canvas, { getFairies, hub }) {
  const ctx = canvas.getContext('2d');
  let raf = 0;
  const unsub = hub.subscribe(() => {}); // keep bus alive; we read getActivity() each frame
  function resize() {
    const parent = canvas.parentElement;
    canvas.width = parent ? parent.clientWidth : canvas.clientWidth;
    canvas.height = Math.max(320, (parent ? parent.clientHeight : 420) - 8);
  }
  resize();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (ro && canvas.parentElement) ro.observe(canvas.parentElement);

  function frame() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const fairies = layout(getFairies(), w, h);
    const act = hub.getActivity();

    // center core
    ctx.save();
    ctx.fillStyle = 'rgba(123,90,255,0.18)';
    ctx.beginPath(); ctx.arc(w / 2, h / 2, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(232,221,255,0.85)';
    ctx.font = '600 13px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('AetherTwin Court', w / 2, h / 2 - 4);
    const total = Object.values(act).reduce((s, a) => s + (a.counts.total || 0), 0);
    ctx.fillStyle = 'rgba(199,184,216,0.8)';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.fillText(`${total} actions`, w / 2, h / 2 + 12);
    ctx.restore();

    const now = Date.now();
    fairies.forEach((f) => {
      const a = act[f.id];
      const lvl = Math.max(1, f.level || 1);
      const baseR = 14 + Math.min(22, lvl * 1.2);
      // pulse
      let pulse = 0;
      if (a && a.lastAt) {
        const dt = now - a.lastAt;
        if (dt < 900) {
          const p = 1 - dt / 900;
          pulse = p * kindStrength(a.lastKind) * (baseR * 1.8);
        }
      }
      // connector
      ctx.strokeStyle = 'rgba(184,140,255,0.18)';
      ctx.beginPath(); ctx.moveTo(w / 2, h / 2); ctx.lineTo(f.x, f.y); ctx.stroke();
      // pulse ring
      if (pulse > 0 && a) {
        ctx.strokeStyle = kindColor(a.lastKind);
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(f.x, f.y, baseR + pulse, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // orb
      const grad = ctx.createRadialGradient(f.x, f.y, 2, f.x, f.y, baseR);
      grad.addColorStop(0, f.color || '#b18cff');
      grad.addColorStop(1, 'rgba(20,8,30,0.2)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(f.x, f.y, baseR, 0, Math.PI * 2); ctx.fill();
      // label
      ctx.fillStyle = 'rgba(255,247,255,0.92)';
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(f.name, f.x, f.y + baseR + 4);
      ctx.fillStyle = 'rgba(199,184,216,0.75)';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillText(`Lv ${lvl}`, f.x, f.y + baseR + 18);
    });
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    unsub();
    if (ro) ro.disconnect();
  };
}

// ---- PixiJS v8 renderer (your attached preference) ----
// Only invoked when the user toggles Pixi AND `pixi.js` is installed.
// We lazy-import so the app never breaks if Pixi isn't installed yet.
export async function mountPixi(canvas, { getFairies, hub }) {
  let PIXI;
  try {
    const spec = ['pixi', 'js'].join('.'); // built at runtime so no static scanner resolves it
    PIXI = await import(/* @vite-ignore */ spec);
  } catch (err) {
    throw new Error('pixi.js not installed — run `npm install pixi.js` then reselect Pixi. ' + err.message);
  }
  const app = new PIXI.Application();
  await app.init({ canvas, backgroundAlpha: 0, resizeTo: canvas.parentElement || canvas, antialias: true });
  const stage = app.stage;
  const orbs = new Map();
  const ringLayer = new PIXI.Container();
  stage.addChild(ringLayer);

  function rebuild() {
    orbs.forEach((o) => o.gfx.destroy());
    orbs.clear();
    ringLayer.removeChildren();
    const fairies = getFairies();
    const w = app.renderer.width;
    const h = app.renderer.height;
    const placed = layout(fairies, w, h);
    placed.forEach((f) => {
      const gfx = new PIXI.Graphics();
      gfx.x = f.x; gfx.y = f.y;
      stage.addChild(gfx);
      orbs.set(f.id, { gfx, fairy: f });
    });
  }
  rebuild();
  hub.subscribe(rebuild);

  app.ticker.add(() => {
    const act = hub.getActivity();
    const now = Date.now();
    orbs.forEach((o, id) => {
      const f = o.fairy;
      const lvl = Math.max(1, f.level || 1);
      const baseR = 14 + Math.min(22, lvl * 1.2);
      const a = act[id];
      let pulse = 0;
      let col = f.color || 0xb18cff;
      if (a && a.lastAt) {
        const dt = now - a.lastAt;
        if (dt < 900) pulse = (1 - dt / 900) * kindStrength(a.lastKind) * (baseR * 1.8);
      }
      o.gfx.clear();
      if (pulse > 0 && a) {
        o.gfx.circle(f.x, f.y, baseR + pulse).stroke({ width: 2, color: col, alpha: 0.6 });
      }
      o.gfx.circle(f.x, f.y, baseR).fill({ color: col, alpha: 0.85 });
    });
  });

  return () => {
    try { app.destroy(true, { children: true }); } catch { /* ignore */ }
  };
}
