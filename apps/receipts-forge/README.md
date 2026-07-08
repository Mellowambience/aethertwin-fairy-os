# AetherTwin Receipts Forge

Turn scattered work into proof.

AetherTwin Receipts Forge is a local-first React/Vite app for transforming repos, demos, screenshots, devlogs, posts, and project notes into proof-of-work cards, portfolio blurbs, README sections, job-search bullets, devlogs, and X post drafts.

**Tagline:** No tax. Only trace.

## What works in v0.1

- Add new receipts
- Save receipts to `localStorage`
- View a proof library
- Filter by project
- Compose output formats from any receipt
- Copy generated outputs
- Delete receipts
- Export all receipts as Markdown
- View project proof timelines
- Includes starter receipts for Fairy OS, QI-Games, and Magic Meets Machine

## Intentionally mocked

There are no real AI API calls yet. Output generation is deterministic template logic inside `src/App.tsx`.

## Run locally

```bash
cd apps/receipts-forge
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Next upgrades

1. Add BYO API key support with safe local secret handling warnings.
2. Add GitHub URL inspection and README export.
3. Add weekly recap mode that turns selected receipts into an X thread.
