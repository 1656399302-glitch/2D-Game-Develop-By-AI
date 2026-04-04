# Sprint Contract — Round 125

## APPROVED

---

## Scope

This round is a **remediation sprint** targeting 3 bugs identified in the Round 124 QA evaluation. The primary focus is fixing the broken cycle warning rendering (critical), completing the AND truth table E2E coverage (major), and adding page-reload verification to the persistence test (minor).

## Spec Traceability

### P0 items covered this round
- **AC-124-008 (FIX)**: Cycle detection warning UI rendering — wire `cycleAffectedNodeIds` from store to `CanvasCircuitNode` components, add `data-cycle-warning` attribute to DOM, verify positive criterion in browser
- **AC-124-005 (FIX)**: Complete E2E coverage for AND gate truth table — add 3 remaining test cases via Playwright

### P1 items covered this round
- **AC-124-009 (FIX)**: Circuit state persistence E2E test — add page-reload step to verify full save/load lifecycle

### Remaining P0/P1 after this round
- None — all 3 bugs from Round 124 are remediated

### P2 intentionally deferred
- All P2 items deferred to future rounds
- No new P2 work in this sprint

## Deliverables

1. **`src/components/Canvas/Canvas.tsx`** — Add subscription to `cycleAffectedNodeIds` from `useCircuitCanvasStore`, pass `cycleWarning` prop to each `CanvasCircuitNode` render call
2. **`src/components/Canvas/CanvasCircuitNode.tsx`** — Add `data-cycle-warning={cycleWarning ? 'true' : 'false'}` to the outer `<g>` element of each node type (InputNodeCanvas, OutputNodeCanvas, GateNodeCanvas)
3. **`tests/e2e/circuit-canvas.spec.ts`** — Add 3 E2E tests for remaining AND gate truth table cases (HIGH/LOW combinations), add page-reload step to persistence test
4. **Updated test suite** — All E2E tests pass (target: 29 total), unit tests unchanged

## Acceptance Criteria

1. **AC-125-001**: When a cyclic circuit is created and simulation runs, the affected circuit nodes have `data-cycle-warning="true"` attribute on their outer `<g>` element, and `data-cycle-warning="false"` on non-affected nodes
2. **AC-125-002**: AND gate truth table verified via Playwright for all 4 cases:
   - input1=LOW, input2=LOW → output=LOW
   - input1=LOW, input2=HIGH → output=LOW
   - input1=HIGH, input2=LOW → output=LOW
   - input1=HIGH, input2=HIGH → output=HIGH
3. **AC-125-003**: Circuit state persistence E2E test includes page-reload step that verifies circuit nodes and wires are restored after reload
4. **AC-125-004**: No regressions — existing 26 E2E tests pass, 5318 unit tests pass, build ≤512KB, TypeScript 0 errors
5. **AC-125-005**: Circuit toggle button `[data-circuit-toggle]` remains visible before circuit mode first activated (non-regression)

## Test Methods

### AC-125-001: Cycle warning rendering
1. Open browser with Playwright, navigate to app
2. Activate circuit mode via toolbar toggle
3. Add an input node and an output node
4. Wire output back to input (creating a cycle)
5. Click Run button
6. Execute `document.querySelectorAll('.circuit-node[data-cycle-warning="true"]').length > 0`
7. Verify length > 0 (at least one node has cycle warning)
8. Create a fresh acyclic circuit (input → output, no cycle)
9. Run simulation
10. Execute `document.querySelectorAll('.circuit-node[data-cycle-warning="true"]').length === 0`
11. Verify length === 0 (no cycle warnings on acyclic circuit)
12. Verify `.circuit-node[data-cycle-warning="false"]` selector matches non-affected nodes in the cyclic case

### AC-125-002: AND truth table complete E2E coverage
1. Open browser, activate circuit mode
2. Add AND gate, 2 input nodes, 1 output node
3. Wire input1 → AND in1, input2 → AND in2, AND out → output
4. **Test case 1**: Toggle both inputs to LOW → verify output node `data-output="LOW"`
5. **Test case 2**: Toggle input1 to HIGH, input2 to LOW → verify output `data-output="LOW"`
6. **Test case 3**: Toggle input1 to LOW, input2 to HIGH → verify output `data-output="LOW"`
7. **Test case 4**: Toggle both inputs to HIGH → verify output `data-output="HIGH"`
8. Use `page.evaluate()` to call store methods for input toggling, then `page.waitForSelector()` with `data-output` attribute assertions

### AC-125-003: Persistence with page-reload
1. Build a circuit with 2 nodes and 1 wire
2. Save machine via UI
3. Clear canvas
4. Verify `nodes.length === 0` and `wires.length === 0` in DOM
5. Reload page (`await page.reload()`)
6. Dismiss welcome modal if appears
7. Wait for state restoration (1s)
8. Verify `nodes.length === 2` and `wires.length === 1` in DOM
9. Verify circuit node attributes match the saved state

### AC-125-004: Regression suite
1. Run `npm test` — all 5318 unit tests must pass
2. Run `npx playwright test` — all 29 E2E tests must pass
3. Run `npm run build` — bundle ≤512KB, TypeScript 0 errors
4. Verify `[data-circuit-toggle]` visible in DOM before circuit mode activation

### AC-125-005: Circuit toggle visibility non-regression
1. Load app fresh (no circuit mode ever activated)
2. Query `page.locator('[data-circuit-toggle]').isVisible()` → must return `true`

## Risks

1. **Low risk**: The `cycleAffectedNodeIds` array is already populated correctly by the store (verified by unit tests in Round 124). This is purely a wiring/UI task.
2. **Low risk**: Existing E2E infrastructure (`page.evaluate()`, store access, `data-output` attribute) is proven from Round 124 tests.
3. **Low risk**: Adding page-reload to E2E test uses standard Playwright `page.reload()` API.
4. **No API changes**: No store interface changes; only wiring existing data to UI.
5. **Test isolation**: Each new test is independent and follows existing test patterns.

## Failure Conditions

1. **F1**: After creating a cyclic circuit and running simulation, `document.querySelectorAll('.circuit-node[data-cycle-warning="true"]').length === 0`
2. **F2**: Any of the 4 AND truth table cases fails in Playwright E2E
3. **F3**: Persistence test without page-reload step (i.e., if the reload is removed during implementation)
4. **F4**: Any existing E2E test fails (regression)
5. **F5**: Build bundle >512KB or TypeScript errors introduced
6. **F6**: `[data-circuit-toggle]` not visible before circuit mode first activated

## Done Definition

All of the following must be true:

1. ✅ `cycleAffectedNodeIds` is subscribed in `Canvas.tsx` and passed as `cycleWarning` prop to each `CanvasCircuitNode`
2. ✅ Each node type's outer `<g>` element has `data-cycle-warning={cycleWarning ? 'true' : 'false'}`
3. ✅ Playwright test confirms cyclic circuits have `data-cycle-warning="true"` nodes
4. ✅ Playwright test confirms acyclic circuits have 0 `data-cycle-warning="true"` nodes
5. ✅ All 4 AND gate truth table cases pass via Playwright
6. ✅ Persistence E2E test includes `page.reload()` and verifies state restoration
7. ✅ All 29 E2E tests pass (26 existing + 3 new)
8. ✅ All 5318 unit tests pass
9. ✅ Build succeeds at ≤512KB with 0 TypeScript errors
10. ✅ `[data-circuit-toggle]` visible before circuit mode first activated

## Out of Scope

- Any new circuit components beyond the 9 existing gate types
- Tech tree, recipe discovery, faction, or community features
- Canvas performance optimization
- Visual polish beyond existing styling
- Any changes to store interfaces or data models
- Non-circuit canvas features
- Mobile responsiveness or accessibility improvements
- Documentation updates
