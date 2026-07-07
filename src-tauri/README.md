// AetherTwin Fairy OS — Desktop Shell (Tauri) scaffold
//
// The web prototype (React/Vite) is the brain. This Tauri shell is the BODY:
// it lets the fairies perceive and act on the PC — but ONLY through the
// consent gates defined in docs/SECURITY_PERMISSIONS.md and the Permission
// Grimoire. Nothing is silent.
//
// STATUS: scaffold. Wire the Rust handlers in src-tauri/src/main.rs to fulfill
// the contract in bridge-contract.ts, then `npm run tauri:dev`.

## What the shell enables (all gated)
- Clipboard read        (fairy needs 'access browser context')
- Screen region capture (fairy needs 'access screenshots')
- Folder/project listing (fairy needs project-scope grant)
- Active window title   (fairy needs 'access browser context')
- Approved file patches  (fairy needs 'edit files' + one-time confirm token)

## Why Tauri (not Electron)
- Tiny bundle, Rust backend, no Chromium tax.
- System APIs are explicit and permissioned by design — fits the consent law.

## Layered safety
1. Front-end Permission Grimoire checkboxes (user-visible).
2. Front-end sends the permission snapshot with every IPC call.
3. Rust handlers re-verify the grant before touching the OS (final gate).
4. Irreversible actions (delete, post, spend, submit) require a one-time
   confirmToken the user issues in the UI — never auto-fired.

## Build
cargo tauri dev        # dev with hot reload
cargo tauri build      # production bundle
