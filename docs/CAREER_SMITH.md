# Career Smith Integration Plan

Fae is the first real high-value skill because she directly supports getting hired.

## Target workflow

```txt
Paste/open job post
  -> Fae evaluates fit
  -> Selena scans red flags
  -> Hope scores life/energy fit
  -> Stella protects authentic voice
  -> Fae forges application packet
  -> Rune packages files
  -> User reviews
  -> User manually submits or explicitly approves submission in future
```

## Fit report fields

- role title
- company
- remote status
- salary if visible
- must-have skills
- nice-to-have skills
- match evidence
- gaps
- energy cost
- red flags
- application angle
- recommended action

## Application packet

```txt
applications/<company>-<role>/
  job_post.md
  fit_report.md
  tailored_resume_notes.md
  cover_letter.md
  interview_prep.md
  tracker_entry.json
```

## ai-job-search repo usage

The existing `ai-job-search` style workflow can be used as a backend ritual engine. This Fairy OS app should wrap it with:

- a prettier UI
- stronger permission gates
- Amara-specific fit rubric
- energy cost scoring
- remote-only constraints
- agent-readable logs

## First implementation slice

Do not automate job submission first. Start with paste-in job post evaluation.

Acceptance criteria:

- User pastes job text.
- Fae returns fit score, energy cost, red flags, application angle, and next step.
- Selena flags concerns.
- Output can be saved to Memory Tree.
- No applications are submitted.

