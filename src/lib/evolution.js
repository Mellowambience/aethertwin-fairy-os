// Evolution engine for AetherTwin Fairy OS.
//
// Every time the user reacts to a fairy's output (accept / edit / reject /
// save / ignore) we record a reflection and tune that fairy's XP and growth
// path. This is the "self-improve and evolve" loop — grounded, local, and
// explainable (see data_schema reflection object).

const XP_GAIN = {
  accepted: 12,
  edited: 6,
  saved: 4,
  ignored: 0,
  rejected: -3
};

const LESSON = {
  accepted: 'This approach landed. Repeat the pattern for similar signals.',
  edited: 'Close, but the operator refined it. Tighten the default output next time.',
  saved: 'Worth keeping. Promote this to a durable memory leaf.',
  ignored: 'Not useful right now. Lower its priority for this signal type.',
  rejected: 'Missed the mark. Reconsider tone, scope, or which fairy handled it.'
};

// Pure: returns a NEW fairies array with the target fairy tuned.
export function recordReflection(fairies, fairyId, outcome, lessonText) {
  const gain = XP_GAIN[outcome] ?? 0;
  return (fairies || []).map((f) => {
    if (f.id !== fairyId) return f;
    const xp = Math.max(0, (f.xp || 0) + gain);
    const level = Math.max(1, Math.floor(xp / 60) + 1);
    const lesson = lessonText || LESSON[outcome] || '';
    const growthPath =
      lesson && !(f.growthPath || []).includes(lesson)
        ? [...(f.growthPath || []), lesson]
        : f.growthPath;
    return { ...f, xp, level, growthPath };
  });
}

export function reflectOnOutcome(outcome) {
  return LESSON[outcome] || '';
}

// Build the reflection log object (matches docs/DATA_SCHEMA.md `reflection`).
export function makeReflection({ fairyId, triggerEventId, outcome }) {
  const lesson = reflectOnOutcome(outcome);
  const traitAdjustments = {
    accepted: { usefulness: 1 },
    edited: { usefulness: 1, precision: 1 },
    saved: { usefulness: 1 },
    ignored: { usefulness: -1 },
    rejected: { usefulness: -1, caution: 1 }
  }[outcome] || {};
  return {
    id: `refl-${Date.now()}`,
    fairyId,
    triggerEventId: triggerEventId || null,
    outcome,
    lesson,
    traitAdjustments,
    createdAt: new Date().toISOString()
  };
}
