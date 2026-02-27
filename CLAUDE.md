# Agent Handoff Protocol

Follow this protocol to maintain context across sessions.

## First-Time Setup

If this project doesn't already have a tool-specific instruction file, ask the user which AI tools they use and create the matching files:

| Tool | Create file |
|------|------------|
| Claude Code | `CLAUDE.md` |
| OpenCode / Codex | `AGENTS.md` |
| Cursor | `.cursorrules` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `.gemini/styleguide.md` |

Each file should contain: `Read and follow AGENT.md in this project's root directory.`

## Directories

- `.handoff/` — Session journals, chronological (hidden; internal AI tooling, not part of Theme Machine)
- `DOC/` — Reference docs, persistent knowledge by topic
- `TOOLING/` — Internal working data: theme catalogs, triage sheets, test run output

Create these directories if they don't exist.

## Starting a Session

1. Read recent files in `.handoff/` (newest first)
2. Read relevant files in `DOC/`
3. Summarize current project state for the user
4. Ask what to work on next

## Ending a Session

Create a handoff document before the session ends.

**File:** `.handoff/handoff-[yyyy-mm-dd]-[task]-[author].md`

No spaces in filenames. Examples:
- `handoff-2026-01-20-auth-bug-claude.md`
- `handoff-2026-01-21-api-refactor-gemini.md`
- `handoff-2026-01-22-review-jane.md`

**Include:**
- What was attempted and the outcome
- What worked, what didn't
- Current state and blockers
- Open questions
- Files created or modified
- References to `DOC/` files and prior handoffs

## Updating DOC Files

When you learn something persistent about the project — architecture decisions, deploy steps, conventions, known issues — update or create a relevant file in `DOC/`. Prefer updating existing files over creating new ones.

When updating a DOC file, add or update a `Last updated: yyyy-mm-dd by [author]` line at the bottom.

## Git (how we apply it here)

- **Commits:** Use multi-line commit messages. Line 1 is a summary, body lines list tasks (one per line), and the final line is the agent signature. Use at least 3 lines; rarely more than 6-7.
- **Staging:** Stage selectively. Never use `git add .` or `git add -A`. Every commit with substantive work should include an updated handoff for the current day (create or update).
- **Pushing:** Never push without explicit user approval. When ready, provide the push command or offer to push.

## Version History

Source: https://github.com/cellear/agent-handoff

- **1.2** (2026-02-27) — Added project-specific Git workflow rules for commits, staging, and pushing approval
- **1.1** (2026-02-16) — Split into README + AGENT.md; added tool-specific setup; simplified DOC guidance
- **1.0** (2026-01-25) — Initial protocol: HANDOFF/ and DOC/ directories, session workflow, naming convention
