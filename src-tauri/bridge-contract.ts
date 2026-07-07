// Tauri desktop bridge: the real "intimate with the PC" implementation.
//
// This runs INSIDE the Tauri Rust app (via tauri://ipc) ONLY after the user
// grants permission per fairy. Every function is gated by the Permission
// Grimoire state passed from the front end. Nothing runs silently.
//
// This file is the contract the Swift/Rust (src-tauri) side implements. The
// React app talks to it through `window.__fairyOS`. For the browser prototype,
// src/lib/desktopSense.js returns honest stubs (see that file).

export interface FairyOSBridge {
  // Returns clipboard text ONLY if fairyId has 'access browser context' style grant.
  readClipboard(payload: { fairyId: string }): Promise<PerceptionResult>;
  // Captures a screen region chosen by the user; gated by 'access screenshots'.
  captureScreenRegion(payload: { fairyId: string; region?: { x: number; y: number; w: number; h: number } }): Promise<PerceptionResult>;
  // Lists a folder the user picked; gated by 'create files' / project scope.
  listProjectFolder(payload: { fairyId: string; path: string }): Promise<PerceptionResult>;
  // Active window title; gated by 'access browser context'.
  activeWindowTitle(payload: { fairyId: string }): Promise<PerceptionResult>;
  // Apply an APPROVED edit/write. Gated by 'edit files' + one-time confirm.
  applyPatch(payload: { fairyId: string; path: string; patch: string; confirmToken: string }): Promise<ToolResult>;
}

interface PerceptionResult {
  ok: boolean;
  source: string;
  value: string;
  consentRequired: boolean;
  note?: string;
}
interface ToolResult {
  ok: boolean;
  path?: string;
  note?: string;
}

// --- Illustrative Rust handlers (src-tauri/src/main.rs) ---------------------
//
// #[tauri::command]
// async fn read_clipboard(fairy_id: String, state: State<'_, Perms>) -> PerceptionResult {
//     if !state.granted(&fairy_id, "access browser context") {
//         return PerceptionResult { ok: false, source: "clipboard",
//             value: "", consent_required: true, note: "Permission not granted." };
//     }
//     // read clipboard via arboard crate, return text
// }
//
// Each handler re-checks the permission map before touching the OS. The front
// end must send the latest permissions snapshot with every request; the Rust
// side is the final gate. See docs/SECURITY_PERMISSIONS.md for the full law.
