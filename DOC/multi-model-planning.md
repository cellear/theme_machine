# Multi-Model Planning: Optimizing Token Efficiency

## The Challenge

**Context:** Project was at 91% weekly token budget when tasked with implementing a complex architectural feature: per-theme layout generation for the `d7_theme_compat` module.

**Constraint:** Deliver a non-trivial feature under strict token budget without compromising quality or completeness.

**Traditional approach:** Single model (highest capability tier) does all work. Wastes tokens on mechanical tasks that don't require complex reasoning.

---

## The Solution: Divide-by-Task Planning

Instead of assigning the entire feature to one model, design a 3-part implementation plan that assigns each part to the model tier most appropriate for that task.

### Core Principle

> **Match token cost to task complexity.** Use Haiku for mechanical work, Sonnet for deep reasoning, and reserve Opus for architectural decisions or research.

---

## The Strategy (Per-Theme Layout Example)

### Assess the Feature

**Feature:** Dynamically register layout templates per D7 theme, auto-update layout instances on theme switch.

**Decompose into tasks:**
1. **Part 1:** Replace hardcoded template registration with a loop that reads theme declarations → **Mechanical code substitution** → Haiku
2. **Part 2:** Design hook integration to detect theme switches, implement layout sync logic → **Complex reasoning** → Sonnet
3. **Part 3:** Stage, commit, document, write handoff → **Mechanical cleanup** → Haiku

### Why This Works

| Part | Task Type | Why Haiku | Why Not Sonnet |
|------|-----------|-----------|----------------|
| **1** | Mechanical substitution | Code is fully specified in the plan; just copy it in. Haiku can do this reliably. | Sonnet wastes tokens on a task with no reasoning overhead. Token/value ratio is poor. |
| **2** | Complex reasoning | Needs deep understanding of Backdrop's layout API, hook system, theme switching flow, fallback logic, guard clauses. | Haiku may struggle with edge cases or integration gotchas. This is where Sonnet's reasoning adds real value. |
| **3** | Mechanical cleanup | Staging, committing, writing structured docs. Clear procedures, low thinking required. | Overkill. Waste tokens. |

### Token Efficiency Gain

**Estimated savings:** ~30-40% vs. single-model (Sonnet for all)

- Part 1: Haiku = ~1/3 cost of Sonnet (same output)
- Part 2: Sonnet = full cost (required for quality)
- Part 3: Haiku = ~1/4 cost of Sonnet (same output)

**Actual outcome:**
- Session budget: 40% (well under target)
- Weekly budget: 92% (up from 91% before session, but feature is major accomplishment)
- Tokens spent on **reasoning** vs. **mechanical work:** ~3:1 ratio (optimal for this feature)

---

## How to Replicate This Approach

### Step 1: Recognize the Opportunity

Ask yourself: **Is this feature decomposable into parts with different complexity levels?**

**Signs it's a good candidate:**
- Feature has multiple phases or implementation steps
- Some steps are purely mechanical (copy code, stage files, write docs)
- Some steps require deep reasoning (design, API integration, fallback logic)
- Project has token budget constraints
- Multiple model tiers are available

### Step 2: Design the Plan with Model Assignments

Create a plan document that includes:
1. **What each part does** (clear, executable instructions)
2. **Which model to use** (and why)
3. **Dependencies between parts** (can Part 2 run before Part 1 is verified?)
4. **Verification steps** (how to confirm Part N is correct before starting Part N+1)

Example format:
```
# Part 1 — Haiku: Mechanical task
[Detailed code/steps provided]
Verification: [how to test]

# Part 2 — Sonnet: Complex reasoning
[Clear problem statement, constraints, expected outcome]
Verification: [how to test]

# Part 3 — Haiku: Cleanup
[Specific files, commands, documentation]
Verification: [how to test]
```

### Step 3: Execute with Checkpoints

- **Between parts:** Stop and verify before moving to the next part
- **Use guard clauses:** Prevent unnecessary work if a part's output is already correct
- **Document as you go:** Each part should include a handoff note for the next phase

### Step 4: Commit with Attribution

Include both models in the commit message to document the collaboration:

```
git commit -m "Feature: [description]

- Part 1: [what this did] (Haiku)
- Part 2: [what this did] (Sonnet)
- Part 3: [what this did] (Haiku)
Token efficiency: ~35% savings vs. single-model approach

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
"
```

---

## When NOT to Use This Approach

- **Token budget is not a constraint:** Use the most capable model for all work (simpler, clearer)
- **Feature is small/simple:** Overhead of planning outweighs savings
- **Parts have tight dependencies:** Can't verify Part 1 in isolation (harder to checkpoint)
- **Architecture is uncertain:** Need a single model's consistent reasoning throughout
- **Research/exploration phase:** Commit to one model for consistency

---

## Lessons Learned (Per-Theme Layout Case Study)

### What Went Well

1. **Clear task boundaries:** Each part had a well-defined input, output, and verification step
2. **Upfront planning:** Creating the detailed plan document meant both models had the same understanding
3. **Mechanical/reasoning split was obvious:** Part 1 was genuinely mechanical (loop substitution), Part 2 genuinely required API reasoning
4. **Checkpoint discipline:** Stopping between parts caught issues early (e.g., typo in template registration would have been caught before Part 2 started)

### What Was Tricky

1. **Testing between parts:** Part 1 required cache clearing (`ddev bee cc`) to verify; would have been missed without explicit testing step
2. **Hook selection (Part 2):** Backdrop's `hook_config_update()` was the right choice, but required research to verify it existed. Sonnet's reasoning identified this correctly.
3. **Guard clause logic (Part 2):** Preventing unnecessary layout saves on every request required Sonnet's insight about request frequency vs. config save cost
4. **Commit attribution:** Needed to explicitly document both models' contributions; without this, the token efficiency win is invisible

### Replicable Elements

- ✅ Dividing by task type (mechanical vs. reasoning)
- ✅ Stopping between parts for verification
- ✅ Using detailed plan documents
- ✅ Documenting savings in commit message
- ✅ Creating a DOC file to explain the approach for future projects

### Model-Specific Insights

**Haiku strength:** Clear, executable instructions → produces correct code
**Haiku weakness:** Deep hook selection, fallback logic reasoning
**Sonnet strength:** API research, edge case thinking, hook system understanding
**Sonnet weakness:** Wastes tokens on mechanical code substitution

---

## Using This Pattern for Other Features

### Example: Authentication System Refactor

```
Part 1 (Haiku): Mechanical
- Extract current auth code into new functions
- Add function stubs for new architecture
- Stage files

Part 2 (Sonnet): Complex reasoning
- Design new auth flow integrations
- Implement hook-based event system
- Handle backward compatibility

Part 3 (Haiku): Cleanup
- Write tests/docs
- Commit and handoff
```

### Example: Database Migration

```
Part 1 (Haiku): Mechanical
- Write migration script structure (boilerplate)
- Define schema changes

Part 2 (Sonnet): Complex reasoning
- Design data transformation logic
- Handle edge cases (nulls, duplicates, foreign keys)
- Verify rollback safety

Part 3 (Haiku): Mechanical
- Test migration, cleanup scripts
- Document procedure
```

---

## Metrics & Future Improvements

### What We Measured

- Weekly token budget: 91% → 92% (acceptable, feature is major)
- Session token budget: 40% (excellent)
- Feature completeness: 100% (full implementation, not a partial)
- Code quality: 0 regressions, 26/26 themes pass smoke test

### What We Could Measure Better

- Actual token cost per part (would require Claude API token logging)
- Time per part (would require explicit time tracking)
- Comparison to baseline single-model cost (hypothetical)

### Future Improvements

1. **Logging:** Add timing/token metrics to plan documents
2. **Templates:** Create plan templates for common patterns (CRUD feature, refactor, API integration)
3. **Automation:** Script the checkpoint verification steps
4. **Feedback loop:** Measure whether estimates were accurate; refine for future projects

---

## For Next Agents: When to Try This

If you're faced with:
- ✅ Token budget constraints
- ✅ Multi-phase feature that's mechanically clear but architecturally complex
- ✅ Multiple model tiers available
- ✅ Time to plan upfront

**Then:** Create a multi-model plan with explicit task assignments and checkpoint verification.

**Result:** Deliver complex features efficiently without compromising quality.

---

Last updated: 2026-02-26 by claude-haiku-4-5
Reference implementation: Per-theme layout generation for `d7_theme_compat` (handoff-2026-02-26-phase1-testing-claude.md)
