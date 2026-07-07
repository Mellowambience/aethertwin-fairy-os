# X Revenue Playbook — build in public, earn in public

**Operator:** Amara (@GoddessAther) · **Goal:** a living-world RPG/MMO hybrid +
local-first Fairy OS, monetized via build-in-public while building.
**Constraint:** budget-free. **Rule:** account stays 100% yours; the engine
drafts, you post. Nothing is auto-posted.

---

## 1. The thesis (why this works)
Build audience *before* product. Documented cases: indie hackers who build in
public launch with **500–5,000 invested followers**; one grew to 2,400 followers
in 4 months and launched at **$8,000 MRR on day one**. The dev work *is* the
content — you are not doing marketing on top of building, you are narrating the
build. Your Fairy Hub (live agent court) is uniquely postable: almost nobody
shows autonomous agents actually working.

## 2. What to post (categories that convert)
Mix these five. Short, high-value, 2–5 posts/day. Threads + visuals + insights
beat highlight reels.
- **Devlog** — what shipped (e.g. the pulsing Fairy Hub). *Pull real signal from
  the Hub activity feed.*
- **Lesson** — a hard-won architectural/design call.
- **Metric** — a no-investment progress number (tests green, $0 API spend).
- **Decision** — a CEO call + rationale (PixiJS vs Canvas2D, model tiers).
- **Community** — an open question that invites replies (reply velocity = reach).
- **Game design** — living-world / agent-economy notes.

## 3. Posting cadence (safe for 2025+ X)
- **2–5 posts/day**, short. No hashtag spam (low signal now). Use a few targeted
  tags only (#indiedev, #gamedev, #buildinpublic, #screenshotsaturday,
  #AIagents).
- **Weekly thread** — one narrative arc (e.g. "building an agent OS from zero").
- **Screenshotsaturday** — every Sat, a court/HUD visual. Visuals drive reach.
- **Avoid:** like/DM automation, mass-follow, engagement pods → shadowban risk.

## 4. Revenue layers (map to 60/20/20)
| Layer | Vehicle | When | Split |
|---|---|---|---|
| Checking (60%) | Ko-fi / Patreon for the game; agent templates & services | from day 1 (tips) | 60% operating |
| Savings (20%) | held | once revenue flows | 20% buffer |
| Polymarket (20%) | info-betting bankroll from proceeds | once self-funded | 20% upside |

Do **not** spend on X API (Basic ~$100/mo) until revenue covers it. Manual
posting + this local engine is $0 and safer for a money account.

## 5. The local engine (this repo)
`npm run content` → drafts 6 posts into `content/queue.json` (status `draft`).
With `--from-hub` it reads `content/hub-activity.json` (exported from the Hub
feed) so dev-logs reflect *real* agent activity. You review, set status to
`posted`, and post from @GoddessAther. Zero credentials, zero network, zero cost.

## 6. Guardrails (consent law)
- The engine never authenticates to X. No tokens, no sessions.
- Only Amara changes post `status` and hits Post.
- A fairy may *suggest* a post (perception) but must ask before any posting.

## 7. 30-day launch checklist
1. Run `npm run content`, post 1 devlog/day from real Hub activity.
2. Weekly thread on the Fairy OS architecture.
3. Screenshotsaturday every week with a HUD/court capture.
4. Reply to 10 builders/day (genuine, not spam).
5. Stand up Ko-fi at first 500 followers.
6. At 2k followers: open Patreon / agent-template sales.
