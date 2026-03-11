# Handoff: Sprint 2 Planning Session

**Date:** 2026-03-09
**Author:** Opus (Cursor, plan mode)
**Status:** Sprint 2 plan finalized. Ready for execution by Sonnet.

---

## What Was Done

Reviewed the Codex-authored sprint reset plan (`DOC/sprint-2-reset-plan.md`), identified gaps, and rebuilt it into a concrete story-level sprint plan with model assignments and acceptance criteria.

### Key decisions made during this session

1. **Interactive reviewer replaces pixel-diff scoring permanently.** Human review is the QA method. The reviewer is a self-contained HTML file built from pre-captured screenshots -- no server, no iframes, no live DDEV sites during review.

2. **Screenshots, not live sites.** The reviewer embeds base64 screenshots from the existing `compare.js` pipeline. Simpler, portable, works offline.

3. **45 themes first, then 761.** The 151-theme catalog was an intermediate curated set. The full D7 theme universe is ~761 from drupal.org. Sprint 2 targets the 45 already-installed common themes. Sprint 3 scales to 761 via download automation.

4. **Region labels are a real deliverable, not a blocker.** User wants the module for both D7 and Backdrop as a standalone tool, not just a debugging aid.

5. **Model tiering per story.** Haiku for mechanical edits (theme list, report template, doc cleanup, learnings). Sonnet for new code requiring design judgment (reviewer generator, region labels modules). Opus for planning only.

6. **LEARNINGS directory added.** Per-sprint "Backdrop for Drupal 7 Developers" docs, following the pattern from ddev-xdebug-tui. Sprint 2 includes a retroactive Sprint 1 learnings doc.

7. **Sprint-level demos, not story-level.** Agent executes all stories, human demos the whole sprint at the end.

### The Sprint 2 plan

Seven stories, fully specified in `SPRINTS/sprint-2.md`:

| Story | Model | Summary |
|-------|-------|---------|
| 2.1 | Haiku | Expand compare.js theme list from 10 to 45 |
| 2.2 | Haiku | Add TOC + summary counts to HTML report |
| 2.3 | Sonnet | Build interactive reviewer generator (main deliverable) |
| 2.4 | Sonnet | Region labels module for Backdrop |
| 2.5 | Sonnet | Region labels module for D7 |
| 2.6 | Haiku | Doc cleanup (implementation-plan.md, sprint-3.md) |
| 2.7 | Haiku | LEARNINGS docs (sprint-1 retroactive + sprint-2) |

---

## Files Created / Modified

- `SPRINTS/sprint-2.md` — complete rewrite with story-level plan, model assignments, acceptance criteria
- `.handoff/handoff-2026-03-09-sprint2-planning-cursor-opus.md` — this file

---

## How to Execute

Start a Sonnet session in Claude Code from the project root:

```bash
cd ~/Sites/BACKDROP/THEME-MACHINE
claude
```

Sonnet reads the plan at `SPRINTS/sprint-2.md` and executes all stories in order. See the "kick-off prompt" in the session notes or ask the user.

---

## Rhythm

- Agent executes all stories (Sonnet handles everything, including Haiku-tagged stories)
- Human demos the full sprint when all stories are complete:
  1. Run `node scripts/compare.js` (both DDEV sites must be running)
  2. Run `node scripts/build-reviewer.js`
  3. Enable region_labels on both sites
  4. Open the reviewer, test keyboard nav and verdicts
  5. Skim updated docs and learnings

---

## References

- `SPRINTS/sprint-2.md` — the authoritative sprint plan
- `DOC/sprint-2-reset-plan.md` — the Codex reset plan that prompted this session
- `.handoff/handoff-2026-03-09-sprint2-reset-plan-codex.md` — Codex's reset handoff
- `.handoff/handoff-2026-03-08-block-parity-claude.md` — Sprint 1 final state
- `.handoff/handoff-2026-03-08-report-tuning-claude.md` — Sprint 1 report improvements

---

Last updated: 2026-03-09 by Opus (Cursor)
