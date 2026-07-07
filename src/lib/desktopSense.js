// Desktop perception client — the "intimate with the PC" surface.
//
// IMPORTANT (consent law from AGENTS.md / docs/SECURITY_PERMISSIONS.md):
// This module NEVER reads the PC silently. In the browser prototype these
// calls are stubs that explain what the desktop shell WOULD do; in the Tauri
// shell they only fire when the user has explicitly granted the permission for
// that fairy and confirmed the specific action. Sense -> suggest -> ask -> run.
//
// The desktop shell (src-tauri) exposes a `window.__fairyOS` bridge. We detect
// it lazily and degrade to clear, honest stubs otherwise.

function hasBridge() {
  return typeof window !== 'undefined' && window.__fairyOS;
}

// Each perception returns { ok, source, value, consentRequired, note }.
// consentRequired is always true for anything beyond the active signal text.

export async function readClipboard(fairyId) {
  if (!hasBridge()) {
    return {
      ok: false,
      source: 'clipboard',
      value: '',
      consentRequired: true,
      note: 'Desktop shell not active. In the Tauri build, this asks permission then reads clipboard on approval.'
    };
  }
  return window.__fairyOS.readClipboard({ fairyId });
}

export async function captureScreenRegion(fairyId, region) {
  if (!hasBridge()) {
    return {
      ok: false,
      source: 'screen',
      value: '',
      consentRequired: true,
      note: 'Desktop shell not active. In the Tauri build, this prompts for a region and captures on approval.'
    };
  }
  return window.__fairyOS.captureScreenRegion({ fairyId, region });
}

export async function listProjectFolder(fairyId, path) {
  if (!hasBridge()) {
    return {
      ok: false,
      source: 'folder',
      value: '',
      consentRequired: true,
      note: `Desktop shell not active. Would list "${path}" only after folder-permission granted to this fairy.`
    };
  }
  return window.__fairyOS.listProjectFolder({ fairyId, path });
}

export async function activeWindowTitle(fairyId) {
  if (!hasBridge()) {
    return {
      ok: false,
      source: 'window',
      value: '',
      consentRequired: true,
      note: 'Desktop shell not active. Would read active window title on approval.'
    };
  }
  return window.__fairyOS.activeWindowTitle({ fairyId });
}

// Did the user grant this fairy the specific control? Mirrors Permission
// Grimoire checkboxes. Without it, nothing runs.
export function canAct(fairy, permissionItem, permissions) {
  if (!permissions || !fairy) return false;
  const granted = permissions[fairy.id] || {};
  return Boolean(granted[permissionItem]);
}
