# Security and Permissions

## Core law

Fairies may sense and suggest. They must ask before they act.

## Permission tiers

### Read-only

Allowed:

- inspect provided text
- summarize uploaded/pasted context
- read approved local files in future desktop version

Requires clear UI indicator.

### Soft actions

Allowed:

- draft text
- create plans
- generate prompts
- prepare code snippets

Does not modify user files automatically.

### Approved actions

Requires explicit confirmation:

- create files
- edit files
- run commands
- update tracker
- create project folders

### High-risk actions

Requires strong explicit confirmation every time:

- submit application
- send email
- post online
- delete files
- spend money
- change account settings
- install packages globally
- share private data with third-party APIs

## Forbidden defaults

- No hidden network calls.
- No auto-posting.
- No auto-emailing.
- No deleting without confirmation.
- No storing sensitive personal details permanently without consent.
- No API keys in repo.

## Privacy design

- Local-first storage.
- Memory editing and pruning must be available.
- Every tool run should be logged.
- Permissions should be visible per fairy.

## Selena review

Any feature that touches files, accounts, personal data, job submissions, or public posting should go through the Boundary Witch design checklist:

1. What can it read?
2. What can it write?
3. What can it send?
4. What can go wrong?
5. What confirmation is required?
6. How can the user undo it?
7. Where is the log?

