# HANDOFF-EPICS Protocol

A lightweight scrum-style protocol for managing epics and stories within the agent handoff workflow. Lives under `.handoff/WORK/` and is designed to work alongside the main handoff protocol in `CLAUDE.md`.

**Status:** In use; may be extracted as a standalone project if it proves useful.

**Last updated:** 2026-02-28 by cursor (added story prioritization)

---

## Directory Structure

```
.handoff/
  WORK/
    EPICS/
      epic{YYMMDD}-{slug}/           # One dir per epic
        epic-definition.md           # Epic overview, goal, scope
        {state}-{state-name}-{task}.md   # Stories
```

---

## Epic Naming

- **Directory:** `epic{YYMMDD}-{slug}` — e.g. `epic0228-theme-catalog`
- **Definition file:** `epic-definition.md` (naming may change; this is the canonical epic doc for now)

---

## Story Naming

Stories use a **state prefix** so they sort by workflow stage:

| Prefix | State | Meaning |
|--------|-------|---------|
| `0-` | backlog | Not started |
| `1-` | in-progress | Currently being worked on |
| `2-` | finished | Done |
| (future) | blocked, cancelled | As needed |

**Format:** `{prefix}-{state-name}-{task-slug}.md`

**Examples:**
- `0-backlog-api-discovery.md`
- `1-in-progress-build-scraper.md`
- `2-finished-catalog-schema.md`

Renaming a file (e.g. `0-backlog-*` → `2-finished-*`) updates its state. The prefix drives sort order in file listings and makes workflow visible at a glance.

---

## Epic Definition

`epic-definition.md` should include:

- **Goal** — What the epic achieves
- **Scope** — In/out of scope
- **Data sources / approach** — How we'll get there
- **Risks & considerations**
- **Definition of done** — Checklist for epic completion

---

## Story Format

Each story file should include:

- **Story ID** — Short slug (e.g. `catalog-schema`)
- **Epic** — Parent epic ID
- **Status** — `backlog` | `in-progress` | `finished` (redundant with filename but useful in content)
- **Points** — Optional; small/medium/large or numeric
- **Description** — What the story is
- **Tasks** — Checklist of work items
- **Acceptance criteria** — Definition of done for the story
- **Dependencies** — Other stories that must complete first (optional)
- **Reference** — Links to DOC files, prior handoffs (optional)

---

## Story Prioritization (Product Owner)

Story **filenames do not imply order**. Prioritization is managed separately:

**Recommended: Backlog order in epic definition**

Add a `## Backlog order` section to `epic-definition.md` (or a sibling `backlog-order.md`). List story IDs in priority order. The product owner edits this when reordering.

```markdown
## Backlog order
1. api-discovery
2. build-scraper
3. download-screenshots
4. validate-catalog
5. document-process
```

**Alternative: Numeric prefix in filename**

Use `0-backlog-01-api-discovery.md`, `0-backlog-02-build-scraper.md`, etc. The number is priority within backlog. Downside: inserting a new story requires renumbering. When moving to in-progress, drop the number: `1-in-progress-api-discovery.md`.

**Alternative: Priority field in story**

Each story has `Priority: 1` (or `Order: 1`). Product owner sorts by that when picking work. Requires parsing story content to determine order.

---

## Workflow

1. **Create epic** — Add `EPICS/epic{YYMMDD}-{slug}/` with `epic-definition.md`
2. **Add stories** — Create `0-backlog-{task}.md` files
3. **Set backlog order** — Add/update `Backlog order` in epic definition
4. **Pick up work** — Rename to `1-in-progress-{task}.md` when starting
5. **Complete** — Rename to `2-finished-{task}.md` when done
6. **Handoff** — Session handoffs (`.handoff/handoff-*.md`) reference the epic and note which stories were touched

---

## Relation to Main Handoff Protocol

- **`.handoff/`** — Session journals (chronological); created per `CLAUDE.md`
- **`.handoff/WORK/EPICS/`** — Epics and stories (task-oriented); this protocol
- **`DOC/`** — Persistent reference docs; both protocols may add/update DOC files

Session handoffs should reference relevant epics and stories when work touches them.

---

## Future / Extraction

If this protocol works well, it may be extracted into its own project (e.g. `handoff-epics`) with its own repo, docs, and tooling. For now it lives as `DOC/handoff-epics-protocol.md` and is applied within Theme Machine.
