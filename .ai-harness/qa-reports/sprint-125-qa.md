## QA Evaluation — Round 125

### Release Decision
- **Verdict:** FAIL
- **Summary:** AC-125-001 positive criterion is permanently broken. CanvasCircuitNode reads `node.cycleWarning || false` (always false) instead of the `cycleWarning` prop passed from Canvas.tsx. The store correctly populates `cycleAffectedNodeIds` but this value never reaches the DOM because the inner `renderNode` switch bypasses the prop.
- **Spec Coverage:** PARTIAL — circuit canvas gate buttons, node placement, deletion, wires, toolbar controls all functional; cycle warning UI rendering broken
- **Contract Coverage:** FAIL — AC-125-001 positive criterion unfixable (see blocking reason 1)
- **Build Verification:** PASS — index.js 490.84 kB ≤ 512KB, TypeScript 0 errors
- **Browser Verification:** FAIL — AC-125-001 positive criterion: `node.cycleWarning` always `undefined` on store nodes; `data-cycle-warning="false"` on all DOM nodes even for cyclic circuits
- **Placeholder UI:** NONE
- **Critical Bugs:** 1 (AC-125-001: cycle warning attribute permanently stuck at "false")
- **Major Bugs:** 1 (AC-125-001: E2E test passes with no real positive assertion)
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 4/5 (AC-125-002, AC-125-003, AC-125-004, AC-125-005 verified; AC-125-001 partially broken)
- **Untested Criteria:** 0

### Blocking Reasons

1. **[CRITICAL] AC-125-001 positive criterion permanently broken — `node.cycleWarning` is never set on store nodes**
   `CanvasCircuitNode.tsx` lines 192-194 use `cycleWarning={node.cycleWarning || false}` instead of `cycleWarning={cycleWarning}` in the `renderNode` switch. The `cycleWarning` prop is correctly received from Canvas.tsx (which passes `cycleWarning={cycleAffectedNodeIds.includes(node.id)}`), but the inner switch discards it and reads `node.cycleWarning` from the node data object. The store (`useCircuitCanvasStore.ts`) never sets `node.cycleWarning` on individual node objects — it only sets `cycleAffectedNodeIds` as a separate array in store state. Therefore `node.cycleWarning` is always `undefined`, making `node.cycleWarning || false` always `false`. The `data-cycle-warning` attribute is always `"false"` on all DOM nodes, making the selector `.circuit-node[data-cycle-warning="true"]` impossible to satisfy. **Verified in browser**: `cycleAffectedNodeIds` correctly contains all 3 node IDs after running simulation on a cyclic circuit, but `node.hasOwnProperty('cycleWarning') = false` and `node.cycleWarning = null` on all store nodes. All 3 DOM nodes have `data-cycle-warning="false"` despite being in a cycle.

2. **[MAJOR] AC-125-001 E2E test passes with no real positive assertion**
   The test "cyclic circuit has cycle warning on affected nodes" (line 870) computes `cycleNodeCount` but never asserts `expect(cycleNodeCount).toBeGreaterThan(0)`. It only asserts `totalNodes === 3` and `nonCycleNodes >= 0` (always true). The selector `.circuit-node[data-cycle-warning="true"]` returns 0 due to the bug above, but the test still passes because it has no meaningful assertion on this value. The "ACYCLIC" test correctly asserts `cycleNodeCount === 0`, but the "CYCLIC" test does not assert `cycleNodeCount > 0`.

### Scores

- **Feature Completeness: 9/10** — All 9 gate buttons render, circuit nodes appear/delete correctly, toolbar toggle works, wires render, Run/Reset/Clear functional. Missing: cycle warning UI (data-cycle-warning attribute always "false").
- **Functional Correctness: 8/10** — TypeScript 0 errors, 5318 unit tests pass, 31 E2E tests pass (but AC-125-001 positive criterion permanently broken). Build 490.84KB. Deduction: cycle warning attribute broken at source (node data read vs prop).
- **Product Depth: 9/10** — Circuit canvas integration complete including gate selection, node placement, wire creation, signal propagation, cycle detection (store-side). Only cycle warning UI rendering is broken.
- **UX / Visual Quality: 10/10** — Circuit toggle always visible before circuit mode activated (`[data-circuit-toggle]` confirmed visible). Gate buttons appear/disappear correctly. Canvas node stats display correctly. All 9 component labels correct.
- **Code Quality: 8/10** — Canvas.tsx correctly subscribes to `cycleAffectedNodeIds` and passes `cycleWarning` prop to `CanvasCircuitNode`. But `CanvasCircuitNode` discards this prop in the inner `renderNode` switch (lines 192-194), reading `node.cycleWarning` instead. Deduction: prop chain broken at final destination.
- **Operability: 10/10** — Dev server runs cleanly, tests pass (5318 unit + 31 E2E), build succeeds at 490.84KB.

- **Average: 9.0/10**

---

### Evidence

**AC-125-001: Cycle warning rendering (PARTIAL FAIL)**
- **Store side**: `cycleAffectedNodeIds` correctly populated with 3 node IDs after running simulation on cyclic circuit (verified: `['5f7996ce', 'b5c32af9', 'f597820b']` match the 3 circuit node IDs) ✅
- **Canvas.tsx subscription**: Line 163 subscribes to `cycleAffectedNodeIds` from store ✅
- **Canvas.tsx prop passing**: Line 1494 passes `cycleWarning={cycleAffectedNodeIds.includes(node.id)}` ✅
- **CanvasCircuitNode prop receive**: `cycleWarning?: boolean` is in `CanvasCircuitNodeProps` ✅
- **Browser evidence — BROKEN**: After creating a cyclic circuit and running simulation:
  - `node.hasOwnProperty('cycleWarning') === false` for all 3 nodes (never set on store nodes) ❌
  - `node.cycleWarning === null` for all 3 nodes ❌
  - DOM: `.circuit-node[data-cycle-warning="false"]` on all 3 nodes (never "true") ❌
- **Root cause**: Lines 192-194 in `CanvasCircuitNode.tsx` use `node.cycleWarning || false` instead of `cycleWarning`:
  ```tsx
  case 'input': return <InputNodeCanvas ... cycleWarning={node.cycleWarning || false} ... />;
  case 'output': return <OutputNodeCanvas ... cycleWarning={node.cycleWarning || false} ... />;
  case 'gate': return <GateNodeCanvas ... cycleWarning={node.cycleWarning || false} ... />;
  ```
  The `cycleWarning` prop received from Canvas.tsx is discarded. Only `node.cycleWarning` (always undefined) is used.

**AC-125-002: AND gate truth table complete (4 cases)**
- All 4 cases verified via Playwright (E2E test "circuit-canvas.spec.ts" 31 tests pass):
  - input1=LOW, input2=LOW → output=LOW ✅
  - input1=HIGH, input2=LOW → output=LOW ✅
  - input1=LOW, input2=HIGH → output=LOW ✅
  - input1=HIGH, input2=HIGH → output=HIGH ✅
- Browser: 4 circuit nodes created (2 inputs, AND gate, output) ✅
- Browser: circuit toggle visible ✅

**AC-125-003: Circuit state persistence (page-reload)**
- E2E test "circuit state can be saved to localStorage and retrieved" passes ✅
- Circuit state saved to `arcane-circuit-state` in localStorage ✅
- 2 nodes + 1 wire verified in localStorage ✅
- Circuit nodes still present after save ✅

**AC-125-004: No regressions**
- 5318 unit tests pass ✅
- 31 E2E tests pass ✅
- Build 490.84KB ≤ 512KB ✅
- TypeScript 0 errors ✅

**AC-125-005: Circuit toggle visibility**
- Browser: `[data-circuit-toggle]` visible and has `offsetWidth > 0` before circuit mode activated ✅
- E2E test "circuit gate toggle button is visible before circuit mode is first activated" passes ✅

---

### Bugs Found

1. **[CRITICAL] AC-125-001: `data-cycle-warning` permanently stuck at "false" — prop bypassed in renderNode switch**
   - **Description**: `CanvasCircuitNode.tsx` lines 192-194 in the `renderNode()` switch use `cycleWarning={node.cycleWarning || false}` instead of `cycleWarning={cycleWarning}`. The `cycleWarning` prop received from Canvas.tsx (which correctly passes `cycleAffectedNodeIds.includes(node.id)`) is discarded. The inner components read `node.cycleWarning` from the node data object, which is always `undefined` because `useCircuitCanvasStore.ts` only sets `cycleAffectedNodeIds` as a separate store state array — it never sets `cycleWarning` on individual node objects. Therefore `node.cycleWarning || false` is always `false`, and `data-cycle-warning="false"` is always rendered on all DOM nodes.
   - **Reproduction**:
     1. Activate circuit mode
     2. Add AND gate, input node, output node
     3. Create wires to form a cycle: input→AND→output, AND→input (creating cycle)
     4. Run simulation → store: `cycleAffectedNodeIds = [inputId, andId, outputId]` (correctly detected) ✅
     5. Query DOM: `document.querySelectorAll('.circuit-node[data-cycle-warning="true"]').length === 0` ❌
     6. Check store node objects: `node.hasOwnProperty('cycleWarning') === false` for all nodes ❌
   - **Impact**: AC-125-001 positive criterion impossible to satisfy. The selector `.circuit-node[data-cycle-warning="true"]` will never match any element. The "!" icon warning and dashed red border (which ARE rendered when `cycleWarning` is truthy) will never appear. Cycle detection logic is correct (store-level), but the UI feedback is permanently suppressed.

2. **[MAJOR] AC-125-001: E2E test "cyclic circuit has cycle warning on affected nodes" has no positive assertion**
   - **Description**: The test computes `cycleNodeCount = await page.locator('.circuit-node[data-cycle-warning="true"]').count()` but never asserts `expect(cycleNodeCount).toBeGreaterThan(0)`. It only checks `totalNodes === 3` and `nonCycleNodes >= 0` (always true). Since the attribute is always "false" (Bug 1 above), `cycleNodeCount` is 0, but the test still passes because it has no meaningful positive assertion on this value.
   - **Reproduction**: Run `npx playwright test circuit-canvas.spec.ts` — test passes despite `data-cycle-warning="true"` never appearing in DOM.
   - **Impact**: The broken feature passes as a valid test, masking the critical bug.

---

### Required Fix Order

1. **[HIGHEST] Fix AC-125-001: Change `node.cycleWarning || false` to `cycleWarning` in CanvasCircuitNode.tsx renderNode switch**
   - In `src/components/Circuit/CanvasCircuitNode.tsx`, lines 192-194, change:
     ```tsx
     case 'input': return <InputNodeCanvas ... cycleWarning={node.cycleWarning || false} ... />;
     case 'output': return <OutputNodeCanvas ... cycleWarning={node.cycleWarning || false} ... />;
     case 'gate': return <GateNodeCanvas ... cycleWarning={node.cycleWarning || false} ... />;
     ```
     to:
     ```tsx
     case 'input': return <InputNodeCanvas ... cycleWarning={cycleWarning} ... />;
     case 'output': return <OutputNodeCanvas ... cycleWarning={cycleWarning} ... />;
     case 'gate': return <GateNodeCanvas ... cycleWarning={cycleWarning} ... />;
     ```
   - This ensures the `cycleWarning` prop received from Canvas.tsx (which reads from `cycleAffectedNodeIds.includes(node.id)`) is passed to inner components, not the always-undefined `node.cycleWarning`.
   - After fix: `data-cycle-warning="true"` should appear on all nodes in a cyclic circuit; `data-cycle-warning="false"` on acyclic circuit nodes.

2. **[HIGH] Fix AC-125-001 E2E test: Add meaningful positive assertion**
   - In `tests/e2e/circuit-canvas.spec.ts` line 929, add after `const cycleNodeCount = ...`:
     ```ts
     expect(cycleNodeCount).toBeGreaterThan(0);
     ```
   - This ensures the test actually verifies that cycle-affected nodes get `data-cycle-warning="true"`.

---

### What's Working Well

- **Circuit toggle always visible** — `[data-circuit-toggle]` renders unconditionally in `CircuitModulePanel`. Verified visible (`offsetWidth > 0`) before circuit mode first activated.
- **Circuit node DOM integration** — `CanvasCircuitNode` components render with all required data attributes (`data-node-id`, `data-gate-type`, `data-node-type`, `data-selected`, `data-output`, `data-signal`). Circuit nodes inside `<g data-circuit-nodes-layer>`, wires inside `<g data-circuit-wires-layer>`.
- **Node deletion works end-to-end** — Delete key removes selected node from DOM and store; connected wires removed correctly.
- **Cycle detection logic correct at store level** — `cycleAffectedNodeIds` populated with correct node IDs when cyclic circuit is simulated. The bug is only in the UI wiring (read `node.cycleWarning` instead of prop `cycleWarning`).
- **AND gate truth table complete** — All 4 cases verified via Playwright E2E with store-based input toggling.
- **Circuit state persistence** — Circuit state saved to `arcane-circuit-state` in localStorage, verified via Playwright.
- **Build and test quality** — 490.84KB bundle (≤512KB), 5318 unit tests, 31 E2E tests, 0 TypeScript errors. No regressions.
- **Non-regression** — All previous functionality (gate selector, node placement, deletion, wires, toolbar, persistence) intact.
