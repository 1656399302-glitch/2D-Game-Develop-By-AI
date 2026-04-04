## QA Evaluation — Round 124

### Release Decision
- **Verdict:** BORDERLINE FAIL (partial pass — see below)
- **Summary:** Circuit canvas integration from Round 123 is functional. All 9 gate buttons render, circuit nodes appear/delete correctly, toolbar toggle works, 26 E2E tests pass, 5318 unit tests pass, build succeeds at 490.63KB. However, two acceptance criteria have incomplete positive-case coverage: AC-124-008 (cycle warning `data-cycle-warning` attribute never rendered in DOM because `cycleAffectedNodeIds` is not subscribed in Canvas.tsx and `cycleWarning` prop is never passed to `CanvasCircuitNode`), and AC-124-005 (E2E tests cover negative case only — full 4-case AND truth table not tested via Playwright). These represent functional gaps in the browser-verifiable surface.
- **Spec Coverage:** PARTIAL — circuit canvas integration verified; cycle warning rendering incomplete
- **Contract Coverage:** FAIL — AC-124-008 positive criterion unverified (no `data-cycle-warning` attribute in DOM); AC-124-005 positive criterion not tested in E2E
- **Build Verification:** PASS — index.js 490.63 kB ≤ 512KB, TypeScript 0 errors
- **Browser Verification:** PASS (8/9 criteria) — AC-124-008 positive criterion unverified
- **Placeholder UI:** NONE
- **Critical Bugs:** 1 (AC-124-008: cycle warning attribute never set)
- **Major Bugs:** 1 (AC-124-005: incomplete truth-table E2E coverage)
- **Minor Bugs:** 1 (AC-124-009: E2E test lacks page-reload verification step)
- **Acceptance Criteria Passed:** 7/9 (AC-124-001–004, 006, 007 fully verified; AC-124-005 and AC-124-008 partial; AC-124-009 partial)
- **Untested Criteria:** 2 (AC-124-005 positive criterion, AC-124-008 positive criterion)

---

### Blocking Reasons

1. **AC-124-008 positive criterion unfixable via current test**: `CanvasCircuitNode` components have `cycleWarning: boolean` prop defined and use it to render a `!` icon and dashed red border, but the outer `<g>` element lacks `data-cycle-warning={cycleWarning ? 'true' : 'false'}`. Crucially, `Canvas.tsx` does not subscribe to `cycleAffectedNodeIds` from the store and never passes `cycleWarning` to `CanvasCircuitNode`. The `!` icon visual will never appear even when a cycle exists in the circuit. The selector `.circuit-node[data-cycle-warning='true']` will never match anything.

2. **AC-124-005 positive criterion E2E gap**: The contract test method requires verifying all 4 AND gate truth table cases (0→0→0, 0→1→0, 1→0→0, 1→1→1) via Playwright + store assertion. The E2E tests only verify (1) "no crash on circuit with no wires" and (2) "AND gate LOW output with no inputs". The remaining 3 truth-table cases are covered only by unit tests (`src/store/__tests__/useCircuitCanvasStore.test.ts`), not by the Playwright E2E file that is part of this round's deliverables.

3. **AC-124-009 E2E test missing page-reload step**: The contract's test method describes: "save machine → clear canvas → reload machine → verify circuit state restored." The E2E test "circuit state is intact after machine save" only clicks save and checks state; it never reloads the page. The reload is what triggers `restoreSavedState` (called from `WelcomeModal` on dismiss). Without this step, the full save/load lifecycle cannot be verified via browser automation.

---

### Scores

- **Feature Completeness: 9/10** — All 9 circuit gate buttons present, nodes render with `data-selected`, `data-gate-type`, `data-node-type`, `data-node-id` attributes, wires render with `data-signal` attribute, toolbar Run/Reset/Clear buttons functional. Missing: cycle warning DOM attribute (AC-124-008).
- **Functional Correctness: 9/10** — TypeScript 0 errors, 5318 unit tests pass, 26 E2E tests pass, build 490.63KB. Store correctly propagates signals, detects cycles, clears canvas. Cycle detection sets `cycleAffectedNodeIds` in store correctly (verified in unit tests). Deduction: AC-124-008 positive criterion and AC-124-005 positive criterion not verifiable in browser.
- **Product Depth: 9/10** — Complete circuit canvas integration: gate selection → node placement → selection → deletion → wire creation → signal propagation → cycle detection in store → toolbar controls → circuit state persistence. Only cycle warning UI rendering is missing.
- **UX / Visual Quality: 10/10** — Circuit toggle always visible before circuit mode activated (`[data-circuit-toggle]` confirmed visible in browser). Gate buttons appear/disappear correctly with toolbar toggle. Circuit node stats display "⚡ 1 电路节点". All 9 component labels correct (输入节点, 输出节点, AND, OR, NOT, NAND, NOR, XOR, XNOR).
- **Code Quality: 9/10** — Clean TypeScript, Zustand patterns, store subscriptions in Canvas.tsx for circuit canvas. `CircuitModulePanel` correctly subscribes to store's `isCircuitMode` (Round 124 fix). `debouncedAutoSave` and `restoreSavedState` properly integrate circuit state. Deduction: `cycleAffectedNodeIds` commented as "future" in Canvas.tsx instead of actually wired.
- **Operability: 10/10** — Dev server runs cleanly, tests pass (5318 + 26 E2E), build succeeds, bundle 490.63KB, browser-verifiable UI with correct data attributes for all major features.

- **Average: 9.3/10**

---

### Evidence

**AC-124-001: Gate selector panel visibility**
- ✅ Before toolbar toggle: `page.locator('[data-circuit-component]').count() === 0` (verified in E2E + browser)
- ✅ After toolbar toggle: `page.locator('[data-circuit-component]').count() === 9` (verified in E2E + browser)
- ✅ All 9 labels correct: input (输入节点), output (输出节点), AND, OR, NOT, NAND, NOR, XOR, XNOR
- ✅ Circuit toggle button `[data-circuit-toggle]` visible BEFORE circuit mode first activated (browser verified)
- ✅ Gate buttons disappear when circuit mode toggled off (E2E test passes)
- **Evidence**: Browser screenshot shows circuit panel with all 9 buttons; E2E test "should show 0 circuit component buttons before toolbar toggle" passes

**AC-124-002: Circuit node placement**
- ✅ Before clicking gate: `page.locator('.circuit-node').count() === 0` (browser verified)
- ✅ After clicking AND gate: `page.locator('.circuit-node[data-gate-type="AND"]').count() > 0` within 800ms (browser verified)
- ✅ Node has `data-node-id`, `data-gate-type`, `data-selected`, `data-node-type` attributes
- ✅ All 9 gate types addable (E2E test "should add all 9 gate types to canvas" passes with count === 9)
- **Evidence**: Browser screenshot shows "⚡ 1 电路节点" in canvas status; `.circuit-node` visible in DOM

**AC-124-003: Node selection and deletion**
- ✅ Node selected on addition (`data-selected="true"` on newly added node) (browser verified)
- ✅ After pressing Delete: `page.locator('.circuit-node').count() === 0` (browser verified)
- ✅ Wires removed when attached node deleted (E2E test "should remove wires attached to deleted node" passes)
- ✅ `removeCircuitNode` in store removes connected wires from `wires` array
- **Evidence**: Browser: node visible before Delete, hidden after Delete

**AC-124-004: Wire rendering**
- ✅ Before wiring: `page.locator('.circuit-wire').count() === 0` (E2E + browser)
- ✅ After wiring: `page.locator('.circuit-wire').count() === 1` (E2E test passes)
- ✅ Wire has `data-signal` attribute (HIGH or LOW) (E2E test "wire has signal state attribute" passes)
- ✅ CircuitWire component rendered inside `<g data-circuit-wires-layer>` (Canvas.tsx line 1396)
- **Evidence**: `data-circuit-wires-layer` and `data-circuit-nodes-layer` both present in Canvas.tsx

**AC-124-005: Signal propagation**
- ✅ Circuit with no wires → Run does not crash (E2E test passes)
- ✅ AND gate LOW output with no inputs (E2E test passes: `data-output="LOW"`)
- ⚠️ **INCOMPLETE**: Full 4-case AND truth table not tested via Playwright. Only 2 of 4 cases verified (case 1: LOW→LOW→LOW; case 2 not tested). Remaining cases (0→1→0, 1→0→0, 1→1→1) are covered by unit tests only.
- **Evidence**: Unit tests in `useCircuitCanvasStore.test.ts` cover all truth tables. E2E tests in `circuit-canvas.spec.ts` cover only 2 of the 4 AND cases.

**AC-124-006: Toolbar circuit mode toggle**
- ✅ Circuit nodes layer `<g data-circuit-nodes-layer>` present in Canvas.tsx (line 1487)
- ✅ Gate buttons appear/disappear with toggle (E2E test passes)
- ✅ Toggle button `aria-pressed` state correct (E2E test passes)
- ✅ `isCircuitMode` toggles correctly (confirmed via E2E)
- **Evidence**: E2E tests 3/3 pass for AC-124-006

**AC-124-007: Toolbar Run/Reset/Clear buttons**
- ✅ Run button visible and functional (E2E + browser verified)
- ✅ Reset button resets input to LOW (E2E test passes)
- ✅ Clear button removes all circuit nodes (E2E test passes)
- ✅ Clear button removes all circuit wires (E2E test passes)
- **Evidence**: Browser shows "▶ 运行", "↺", "清空" in toolbar when circuit mode active

**AC-124-008: Cycle detection warning**
- ✅ Acyclic circuit: no `data-cycle-warning` attribute (E2E negative test passes)
- ❌ **POSITIVE CRITERION BROKEN**: Canvas.tsx does NOT subscribe to `cycleAffectedNodeIds` from store (only a comment at line 162: "available from store for future cycle warning rendering"). `CanvasCircuitNode` is never passed `cycleWarning` prop from Canvas.tsx. The outer `<g>` elements in `CanvasCircuitNode` do NOT have `data-cycle-warning` attribute. The `!` warning icon SVG is rendered conditionally on `cycleWarning`, but `cycleWarning` is never set (always `undefined`/`false`). The selector `.circuit-node[data-cycle-warning='true']` will NEVER match anything.
- **Root cause**: `CanvasCircuitNode` at line 1489 of Canvas.tsx:
  ```tsx
  <CanvasCircuitNode
    key={node.id}
    node={node}
    isSelected={node.id === selectedCircuitNodeId}
    onClick={handleCircuitNodeClick}
    onDragStart={handleCircuitNodeDragStart}
    onInputToggle={handleCircuitInputToggle}
    onPortClick={handleCircuitPortClick}
    // cycleWarning prop MISSING
  />
  ```
- **Evidence**: `grep -n "cycleAffectedNodeIds\|cycleWarning" Canvas.tsx` returns only the comment at line 162

**AC-124-009: Circuit state persistence**
- ✅ Circuit nodes and wires present in DOM after building (E2E test passes)
- ✅ Circuit state intact immediately after machine save (E2E test passes)
- ⚠️ **INCOMPLETE**: Full save→clear→reload→restore cycle NOT tested in E2E. The test clicks save but never reloads the page to verify `restoreSavedState` is triggered. The reload is handled by `WelcomeModal.tsx` which calls `restoreSavedState` on dismiss, but this is not exercised by the E2E test.
- ✅ `restoreSavedState` in `useMachineStore.ts` correctly loads circuit state from `loadCircuitState()`
- ✅ `clearCircuitCanvas` properly clears both stores and localStorage
- **Evidence**: `useMachineStore.ts` lines 1175–1181: circuit state restored from localStorage

---

### Bugs Found

1. **[CRITICAL] AC-124-008 positive criterion permanently broken — cycle warning never renders in DOM**
   - **Description**: `Canvas.tsx` does not subscribe to `cycleAffectedNodeIds` from `useCircuitCanvasStore`. The `cycleWarning` prop is defined in `CanvasCircuitNode` components (`InputNodeCanvas`, `OutputNodeCanvas`, `GateNodeCanvas`) and used to conditionally render a red dashed border and `!` icon, but `Canvas.tsx` never passes this prop. The outer `<g>` element of each node type lacks `data-cycle-warning={cycleWarning ? 'true' : 'false'}` attribute, making the positive criterion's selector `.circuit-node[data-cycle-warning='true']` impossible to satisfy.
   - **Reproduction**: Create a self-feedback loop circuit (e.g., XOR → input) → run simulation → query `document.querySelectorAll('.circuit-node[data-cycle-warning="true"]').length === 0` always, even for cyclic circuits.
   - **Impact**: AC-124-008 positive criterion cannot be verified. Cycle detection logic in store is correct (unit tests pass), but the UI warning is never displayed.

2. **[MAJOR] AC-124-005 E2E tests do not cover the full AND truth table**
   - **Description**: The contract's test method for AC-124-005 states: "verify output LED reflects AND truth table for all 4 input combinations (0→0→0, 0→1→0, 1→0→0, 1→1→1)". The E2E tests only verify case 1 (both inputs LOW → output LOW). Cases 2, 3, and 4 are absent from `tests/e2e/circuit-canvas.spec.ts`. These cases ARE covered by unit tests in `src/store/__tests__/useCircuitCanvasStore.test.ts`.
   - **Reproduction**: Inspect `tests/e2e/circuit-canvas.spec.ts` — the "Signal Propagation" describe block has only 2 tests: "should not crash when running simulation on circuit with no wires" and "AND gate has LOW output with no inputs set".
   - **Impact**: The E2E coverage gap means the positive criterion is not fully verified via Playwright as the contract specifies.

3. **[MINOR] AC-124-009 E2E test lacks page-reload verification step**
   - **Description**: The contract's test method for AC-124-009 describes: "save machine → clear canvas → reload machine → verify circuit nodes/wires restored". The E2E test "circuit state is intact after machine save" only saves and checks state; it never reloads. The reload step is what triggers `WelcomeModal`'s `restoreSavedState` call. Without it, the full save/load lifecycle is not browser-verified.
   - **Reproduction**: Add `await page.reload()` + `await dismissWelcomeModal(page)` + `await page.waitForTimeout(1000)` after the save step in the test; verify `nodes.length === 2`.
   - **Impact**: Incomplete browser verification of the full persistence lifecycle. Store implementation is correct (verified via unit tests and code inspection).

---

### Required Fix Order

1. **[HIGHEST] Fix AC-124-008: Wire cycle warning to Canvas.tsx render**
   - In `Canvas.tsx`, subscribe to `cycleAffectedNodeIds`: `const cycleAffectedNodeIds = useCircuitCanvasStore((state) => state.cycleAffectedNodeIds)`
   - Pass `cycleWarning={cycleAffectedNodeIds.includes(node.id)}` to each `CanvasCircuitNode` render
   - Add `data-cycle-warning={cycleWarning ? 'true' : 'false'}` to the outer `<g>` of each node type in `CanvasCircuitNode.tsx`
   - Then the selector `.circuit-node[data-cycle-warning='true']` will work correctly

2. **[MEDIUM] Add remaining 3 AND gate truth table cases to E2E tests**
   - In `tests/e2e/circuit-canvas.spec.ts`, add tests for cases 2, 3, 4 of the AND gate truth table:
     - Test: input1=HIGH, input2=LOW → AND output=LOW
     - Test: input1=LOW, input2=HIGH → AND output=LOW  
     - Test: input1=HIGH, input2=HIGH → AND output=HIGH
   - Use store methods via `page.evaluate()` to toggle inputs and verify `data-output` attribute

3. **[LOW] Add page-reload step to AC-124-009 E2E test**
   - After saving machine in the "circuit state is intact after machine save" test, call `await page.reload()`, dismiss welcome modal, wait for app to restore state, then verify `nodes.length === 2` and `wires.length === 1`

---

### What's Working Well

- **Circuit toggle always visible** — `[data-circuit-toggle]` is rendered unconditionally in `CircuitModulePanel` (not gated behind `isCircuitMode === true`). The Round 124 stale-prop fix is correctly applied: the component subscribes to `useCircuitCanvasStore((state) => state.isCircuitMode)` and uses the store value, not the prop.
- **Circuit node DOM integration** — `CanvasCircuitNode` components render with all required data attributes (`data-node-id`, `data-gate-type`, `data-node-type`, `data-selected`, `data-port-type`, `data-signal`). The canvas renders circuit nodes inside `<g data-circuit-nodes-layer>` and wires inside `<g data-circuit-wires-layer>`.
- **Node deletion works end-to-end** — Pressing Delete removes selected node from both DOM and store; connected wires are also removed. The store's `removeCircuitNode` action filters out affected wires correctly.
- **Circuit state persistence architecture** — `saveCircuitState`/`loadCircuitState` in `localStorage.ts`, wired into `debouncedAutoSave`, `restoreSavedState`, `startFresh`, and `clearCircuitCanvas` in `useMachineStore.ts`. Store implementation is correct.
- **Build and test quality** — 490.63KB bundle (≤512KB), 5318 unit tests, 26 E2E tests, 0 TypeScript errors. No regressions.
- **Non-regression** — All previous functionality intact. Module panel, canvas, toolbar, all existing features work correctly alongside the circuit canvas integration.
