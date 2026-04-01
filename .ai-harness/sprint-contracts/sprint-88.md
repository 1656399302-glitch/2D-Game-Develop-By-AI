# Sprint Contract — Round 88 — REVISION REQUIRED

> **Contract Status:** REJECTED — Do not proceed to build.
> The following issues must be resolved before this contract can be approved.

---

## Critical Issues

### 1. ZERO acceptance criteria for the interactive editor's core functionality

**This is the most severe problem.** The project is the "Arcane Machine Codex Workshop" — an interactive SVG editor with modules, connections, activation animations, codex, random generation, and export. The spec describes a fully-featured creative tool with 10+ major feature areas. After 87 rounds of development, this contract contains **zero** ACs that verify the editor actually works.

Every acceptance criterion is either:
- A documentation file check (does file X exist, does it have ≥Y lines)
- A test pass / build pass check with no new functional tests

**This is a fundamental contract failure.** A builder could pass this contract while the editor itself is completely broken. You cannot verify "maintenance" without checking that the thing being maintained still functions.

**Required revision:** Add at minimum:
- One AC verifying the editor canvas loads and modules are draggable (e.g., `AC-EDITOR-001: User can drag a module from the panel onto the canvas`)
- One AC verifying connection creation between two modules works
- One AC verifying machine activation triggers animation state changes
- Coverage of codex save/load if that's in scope

---

### 2. AC-TEST-PERF-002 ("test suite completes in ≤12s") is not backed by evidence

The current test duration is ~15s (per Round 87's PERFORMANCE_BASELINE.md). The contract sets a target of ≤12s — a **20% reduction** — achieved by enabling `pool: 'forks'` or `pool: 'threads'` in vitest.

**Problems:**
- No evidence this pool configuration achieves ≤12s in this environment
- No test method actually measures the end-to-end duration after the change
- The test method in the contract only checks that `pool:` appears in the config file — it doesn't verify the speed improvement
- No consideration of test instability risk in parallel mode (the contract's own risk section acknowledges this but provides no specific mitigation beyond "run multiple times")

**Required revision:** Either:
- Provide a concrete plan for achieving ≤12s (specific pool size, test file grouping strategy) with a fallback threshold (e.g., "≤14s is acceptable if ≤12s proves unstable"), OR
- Remove the ≤12s requirement and replace with a measurable target (e.g., "parallel execution enabled, duration ≤15s")
- Add a test method that actually **measures** `time npx vitest run` and asserts the result

---

### 3. AC-BUILD-001 has no verification method

The acceptance criterion states: "Build succeeds with bundle size ≤560KB."

But **there is no test method** in the Test Methods section that verifies the bundle size. The test methods only verify:
- Line counts in docs
- `grep` counts for store/hook documentation
- `pool:` presence in vitest.config.ts
- A naked `npm run build` (no assertion on size)

The build verification is left to the QA evaluator, which is not acceptable — the contract must define its own test methods.

**Required revision:** Add a test method with an explicit assertion:
```
Command: npm run build 2>&1
Expected: Exit code 0, bundle file exists, bundle size ≤ 560KB (grep/parse output for actual size)
```

---

### 4. Test methods can be trivially gamed

**Documentation line counts:** `wc -l README.md` ≥300 lines — a builder can paste Lorem Ipsum or copy-paste existing code comments to inflate line counts without producing useful documentation.

**Store coverage verification:** `grep -c "interface.*Store" src/store/*.ts` — a builder can add fake `// FakeStore interface` comments that match this pattern without documenting any actual stores.

**Hook coverage verification:** `grep -c "export function use" src/hooks/*.ts` — counts all exported functions, not just hooks, and doesn't verify they appear in API.md.

**Required revision:** Tighten test methods:
- README content check: verify specific sections exist (e.g., `grep -E "Setup|Architecture|Contribution" README.md`)
- Store count: match actual store interface names from the codebase, not a pattern match
- API.md: verify specific store names from the source appear in the doc (e.g., `grep -E "useCodexStore|useMachineStore|useFactionStore" API.md`)

---

### 5. Done Definition conflates documentation completeness with functional correctness

The Done Definition has 8 items, all of which are either:
- File existence checks
- Line count thresholds
- "npx vitest run passes"
- "npm run build succeeds"

None of them verify that the **interactive editor works**. A sprint where every deliverable is a file with N lines and the build doesn't crash is not a valid maintenance sprint for a creative tool project.

**Required revision:** The Done Definition must include at least one item verifying functional correctness of the editor (e.g., "Editor canvas renders with at least 3 module types selectable and draggable").

---

### 6. Spec Traceability is misleading

The contract states: "P0 items covered this round: None — this is a maintenance/developer experience sprint."

This is misleading in context. The spec describes the full Arcane Machine Codex Workshop project. The spec trace should clarify **what portion** of the spec is being addressed or deferred, not just claim "none."

---

## Operator Inbox Check

Reviewed `.ai-harness/runtime/operator-inbox.json`:
- `operator-item-1774941228843`: Processed in round 51, injecting functional testing requirements into build phase. **Not applicable to round 88 contract.**
- `operator-item-1775053300925`: Processed in round 85, fixing activation time. **Not applicable to round 88 contract.**

No pending operator inbox items for this phase. ✓

---

## Summary of Required Revisions

| # | Issue | Severity |
|---|-------|----------|
| 1 | Zero ACs for editor functionality — no test that the thing being maintained actually works | **CRITICAL** |
| 2 | AC-TEST-PERF-002 ≤12s target unsupported by evidence or concrete plan | **HIGH** |
| 3 | AC-BUILD-001 bundle size ≤560KB has no verification test method | **HIGH** |
| 4 | Test methods trivially gameable (line counts, grep patterns) | **MEDIUM** |
| 5 | Done Definition lacks functional correctness checks | **HIGH** |
| 6 | Spec Traceability misleading about scope | **LOW** |

---

## Resubmission Instructions

Please revise the contract with the following changes:

1. **Add at least 3 functional ACs** verifying the editor's core capabilities (module drag, connection, activation).
2. **Fix AC-TEST-PERF-002** with either a realistic target or a concrete parallelization plan with fallback.
3. **Add a bundle-size test method** that parses build output and asserts ≤560KB.
4. **Strengthen documentation test methods** to check for specific content, not just line counts.
5. **Add a functional correctness item** to the Done Definition.
6. **Clarify spec traceability** to reflect what portion of the spec is addressed.

Contracts without verifiable, functional acceptance criteria will not be approved regardless of how well-documented the deliverables are.
