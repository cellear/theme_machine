# Agent Delivery Conventions

**Last updated:** 2026-02-28 by cursor

---

## Output Location Reminder

When delivering files that are **not** in well-known directories (`.handoff/`, `DOC/`, `CLAUDE.md`, etc.), **remind the user where the files are** in the response. Better to be redundant than leave the user wondering where the work output lives.

**Known directories:**
- `.handoff/` — Session journals, epics, stories
- `DOC/` — Reference docs
- `TOOLING/` — Working data (theme catalogs, triage sheets, test output)
- Project root — Config files, README

**Example:** "Created `theme-catalog.md` in **`TOOLING/theme-catalog/`**."
