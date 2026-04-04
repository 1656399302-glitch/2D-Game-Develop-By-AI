# Sprint Contract — Round 126

## Scope

Remediation sprint: fix the two bugs blocking AC-125-001. No new features. No spec changes.

**Two-step fix sequence required (per QA blocking reasons):**

1. **Step 1 — Fix the E2E test first** (QA Major bug): Add `expect(cycleNodeCount).toBeGreaterThan(0)` positive assertion to the "cyclic circuit has cycle warning on affected nodes" test. This makes the test correctly **fail** before step 2, exposing the real bug rather than silently passing despite a broken feature.
2. **Step 2 — Fix the prop chain** (QA Critical bug): Change `cycleWarning={node.cycleWarning || false}` → `cycleWarning={cycleWarning}` in `CanvasCircuitNode.tsx` lines 192–194 `renderNode` switch (cases `input`, `output`, `gate`). This passes the `cycleWarning` prop (received from Canvas.tsx, which derives it from `cycleAffectedNodeIds.includes(node.id)`) to inner components instead of the always-`undefined` `node.cycleWarning`. The test from step 1 will then pass.

Both steps must be completed in order for the round to succeed. Skipping step 1 and only doing step 2 would leave an unverifiable test — the round would pass but the regression guard would be absent.

## Spec Traceability

- **P0 items covered this round:**
  - AC-125-001 (positive criterion): Cycle warning rendering on affected nodes in cyclic circuits — fixing broken propagation of `cycleWarning` prop through `renderNode` switch (lines 192–194 of `CanvasCircuitNode.tsx`)
  - AC-125-001 E2E (positive criterion): Add missing `expect(cycleNodeCount).toBeGreaterThan(0)` positive assertion to the cyclic-circuit E2E test

- **P1 items covered this round:**
  - None (no P1 work added this round)

- **Remaining P0/P1 after this round:**
  - All round 125 P0/P1 items (canvas gate buttons, node placement, deletion, wires, toolbar controls, circuit toggle visibility, AND gate truth table, circuit state persistence) remain verified and intact. Only the broken cycle warning UI and its test are being fixed.

- **P2 intentionally deferred:**
  - All P2 items (tech tree, recipe book, achievements, factions, community gallery, exchange system, AI assistant) remain deferred.

## Deliverables

1. **`tests/e2e/circuit-canvas.spec.ts`** — In the "cyclic circuit has cycle warning on affected nodes" test: add `expect(cycleNodeCount).toBeGreaterThan(0)` (or TypeScript-equivalent `expect(cycleNodeCount).toBeGreaterThan(0)`) after `cycleNodeCount` is computed. This positive assertion ensures the test fails before the code fix (correctly exposing the bug) and passes after. This is step 1 of the two-step fix.
2. **`src/components/Circuit/CanvasCircuitNode.tsx`** — Lines 192–194 in `renderNode` switch: change `cycleWarning={node.cycleWarning || false}` → `cycleWarning={cycleWarning}` for all three `case` branches (`input`, `output`, `gate`). This passes the `cycleWarning` prop (received from Canvas.tsx, which derives it from `cycleAffectedNodeIds.includes(node.id)`) to inner components instead of the always-`undefined` `node.cycleWarning`. This is step 2 of the two-step fix.
3. **No new files or new functionality introduced.**

## Acceptance Criteria

1. **AC-126-001:** After creating a cyclic circuit (3 nodes forming a cycle) and running simulation, DOM nodes for all cycle-affected nodes have `data-cycle-warning="true"` and non-cycle nodes have `data-cycle-warning="false"` (selector: `.circuit-node[data-cycle-warning="true"]` returns count > 0, specifically === 3 for a 3-node cycle). Non-cycle nodes in acyclic circuits retain `data-cycle-warning="false"`.
2. **AC-126-002:** The "cyclic circuit has cycle warning on affected nodes" E2E test includes `expect(cycleNodeCount).toBeGreaterThan(0)` (step 1) and passes after step 2 completes.
3. **AC-126-003:** For an acyclic (valid) circuit, all nodes retain `data-cycle-warning="false"` (selector returns count === 0).
4. **AC-126-004:** All 5318 unit tests continue to pass (no regressions).
5. **AC-126-005:** All 31 E2E tests continue to pass after both steps are complete (no regressions). The "cyclic circuit has cycle warning on affected nodes" test will **correctly fail** after step 1 (before step 2) — this is the intended intermediate state and is not a failure condition.
6. **AC-126-006:** Build bundle ≤ 512KB with 0 TypeScript errors.

## Test Methods

1. **AC-126-001 (cycle warning on cyclic circuit — final state):**
   - Activate circuit mode
   - Place AND gate, 1 input node, 1 output node
   - Wire: input → AND → output
   - Wire: output → back to input (creates cycle)
   - Click Run
   - Execute in browser/Playwright: `document.querySelectorAll('.circuit-node[data-cycle-warning="true"]').length`
   - Assert: count === 3 (all 3 nodes in the cycle have the attribute)
   - Verify store: `cycleAffectedNodeIds` array is non-empty (already confirmed working in round 125)

2. **AC-126-002 (E2E test positive assertion — step 1, then step 2):**
   - **Before step 1**: Run `npx playwright test circuit-canvas.spec.ts --grep "cyclic circuit has cycle warning"` → test PASSES (no positive assertion, bug masked)
   - **After step 1 only**: Run the same command → test FAILS (positive assertion catches `cycleNodeCount === 0` before code fix — this is correct and expected)
   - **After step 2**: Run the same command → test PASSES
   - Verify the test file contains `expect(cycleNodeCount).toBeGreaterThan(0)` after `cycleNodeCount` is assigned
   - The test must be named exactly "cyclic circuit has cycle warning on affected nodes" in `circuit-canvas.spec.ts`

3. **AC-126-003 (acyclic circuit has no warning):**
   - Activate circuit mode
   - Place AND gate, 2 input nodes, 1 output node
   - Wire: input1 → AND, input2 → AND, AND → output (no cycle)
   - Click Run
   - Execute in browser/Playwright: `document.querySelectorAll('.circuit-node[data-cycle-warning="true"]').length`
   - Assert: count === 0 (no false positives on valid circuits)

4. **AC-126-004 & AC-126-005 (regression — final state, after both steps):**
   - `npm run test:unit` → all 5318 tests pass
   - `npx playwright test` → all 31 E2E tests pass (including the cycle warning test, which passes only after step 2)
   - **Note**: Running E2E tests after step 1 but before step 2 will show 30/31 passing — the cycle warning test failing is the intended intermediate state

5. **AC-126-006 (build):**
   - `npm run build` → verify bundle ≤ 512KB and TypeScript 0 errors

## Risks

1. **Low risk — mechanical fix:** The prop `cycleWarning` is already received by `CanvasCircuitNode` (confirmed in round 125 QA). Only 3 lines need to change: `node.cycleWarning || false` → `cycleWarning` in the `renderNode` switch.
2. **Low risk — test assertion:** Adding `expect(cycleNodeCount).toBeGreaterThan(0)` correctly exposes the bug before the code fix and verifies it after. The intermediate "test fails" state is intentional and expected — it proves the test is now a real guard against regression.
3. **No risk to other features:** No structural changes; no new components; no store changes. All existing tests remain unchanged.
4. **Risk of mis-ordering steps:** If step 2 is done before step 1, the E2E test will pass (after step 2) but there will be no positive assertion in the test, meaning future regressions would go undetected. The contract requires both steps in order.

## Failure Conditions

1. AC-126-001 fails: `.circuit-node[data-cycle-warning="true"]` returns 0 for a cyclic circuit after simulation (any node in the cycle missing the attribute is a failure)
2. AC-126-002 fails: the E2E test "cyclic circuit has cycle warning on affected nodes" does not contain `expect(cycleNodeCount).toBeGreaterThan(0)`, OR the test fails after step 2 (it should pass after both steps complete)
3. AC-126-003 fails: any node in an acyclic circuit incorrectly shows `data-cycle-warning="true"`
4. Any regression after both steps complete: unit tests < 5318, E2E tests < 31, bundle > 512KB, TypeScript errors > 0
5. Any new functionality or spec changes introduced (out of scope)
6. **Mid-sprint state (after step 1, before step 2)**: The E2E test "cyclic circuit has cycle warning on affected nodes" correctly fails — this is NOT a failure condition; it is the expected and correct intermediate state that proves the test now guards against regression

## Done Definition

All six acceptance criteria must be TRUE before the builder may claim round 126 complete:

1. AC-126-001: Cyclic circuit → `data-cycle-warning="true"` on all 3 cycle-affected nodes, `data-cycle-warning="false"` on others (count === 3 for 3-node cycle; no false positives)
2. AC-126-002: E2E test "cyclic circuit has cycle warning on affected nodes" contains `expect(cycleNodeCount).toBeGreaterThan(0)` and passes after step 2
3. AC-126-003: Acyclic circuit → all nodes have `data-cycle-warning="false"` (count === 0)
4. AC-126-004: 5318 unit tests pass
5. AC-126-005: 31 E2E tests pass (including the cycle warning test — both steps complete)
6. AC-126-006: Build ≤ 512KB, TypeScript 0 errors

## Out of Scope

- No new components or features
- No tech tree, recipe book, achievement, faction, community, exchange, or AI work
- No changes to `useCircuitCanvasStore.ts` (store-side cycle detection already works correctly — `cycleAffectedNodeIds` populated correctly; bug is purely in `CanvasCircuitNode.tsx`)
- No changes to `Canvas.tsx` (prop passing already works correctly — `cycleWarning={cycleAffectedNodeIds.includes(node.id)}` is already correct)
- No changes to `InputNodeCanvas`, `OutputNodeCanvas`, or `GateNodeCanvas` inner components (they already handle the `cycleWarning` prop correctly — bug is entirely in `CanvasCircuitNode.tsx`'s `renderNode` switch passing `node.cycleWarning` instead of the prop)
- No refactoring of the canvas system, state management, or rendering pipeline
- No changes to the acyclic-circuit E2E test (it already correctly asserts `cycleNodeCount === 0`)
