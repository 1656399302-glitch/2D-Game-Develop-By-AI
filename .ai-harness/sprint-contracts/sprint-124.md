# APPROVED — Sprint Contract — Round 124

## Scope

**Remediation Verification & UX Fix Sprint**

Round 122 (QA verdict: FAIL) identified three critical integration failures: `CircuitModulePanel` not rendered in `ModulePanel.tsx`, `CanvasCircuitNode` not rendered in `Canvas.tsx`, and `CircuitWire` not rendered in `Canvas.tsx`. Round 123 integrated these components. Round 124 verifies the integration works end-to-end in the browser and fixes the UX gap where the circuit toggle in `CircuitModulePanel` requires an extra click to reveal gate buttons.

This round has two jobs:
1. **Verify** that all three integrations from Round 123 render and function correctly in the browser.
2. **Fix** the UX friction where the circuit gate toggle button is hidden behind `isCircuitMode === true`, forcing users to click the toolbar ⚡ button first before gate buttons appear in the module panel. After the fix, the circuit gate toggle button is always visible; only the gate selector grid is gated behind circuit mode.

## Spec Traceability

### P0 items (must pass this round)
- **AC-124-001**: Gate selector panel appears and all 9 circuit component buttons are present in the browser DOM when circuit mode is active.
- **AC-124-002**: Clicking a gate button adds a circuit node to the canvas; node is visible on the canvas and in the store.
- **AC-124-003**: Clicking a circuit node on the canvas selects it; pressing Delete removes it from the canvas and the store. Wires connected to the deleted node are also removed.
- **AC-124-004**: Circuit wires render in the canvas between two connected nodes; wires update color based on signal state.
- **AC-124-005**: Running circuit simulation propagates signals visually (wire colors change, gate outputs update).
- **AC-124-006**: Toolbar circuit mode toggle correctly enables/disables circuit canvas layer.
- **AC-124-007**: Toolbar Run/Reset/Clear buttons correctly trigger circuit simulation operations.

### P1 items (covered this round)
- **AC-124-008**: Cycle detection warning (! icon + dashed red border) renders on affected nodes in the UI.
- **AC-124-009**: Circuit state persists when machine is saved and reloaded (circuit nodes and wires restored).

### Remaining P0/P1 after this round
- No outstanding P0 circuit canvas items remain. All P0/P1 canvas integration work from rounds 122 and 123 is addressed.
- Remaining P1: Community sharing of circuits, challenge mode with circuit puzzles, faction circuit recipes (out of scope).

### P2 intentionally deferred
- Circuit sub-circuit modules (custom macro gates)
- Animated signal flow along wires
- Circuit timing/simulation speed controls
- Circuit canvas multi-layer support
- Wire deletion via Delete key on selected wire (this round covers only node deletion via Delete; wire-only deletion is out of scope)
- Drag-from-panel-to-canvas for circuit nodes (click-to-place only this round)

## Deliverables

1. **`src/components/Editor/CircuitModulePanel.tsx`** — Refactor so the circuit-gate toggle button is always visible (not gated behind `isCircuitMode === true`), while the circuit component selector grid only renders when `isCircuitMode === true`. The toggle button must have a stable `data-circuit-toggle` attribute. Remove redundant `isCircuitMode` prop usage; rely exclusively on the internal `useCircuitCanvasStore` subscription.

2. **`tests/e2e/circuit-canvas.spec.ts`** — Playwright E2E tests (new file, does not exist yet) covering:
   - Circuit mode toggle → gate buttons appear in DOM (9 `data-circuit-component` elements)
   - Clicking AND gate button → circuit node visible on canvas (`data-circuit-nodes-layer .circuit-node`)
   - Clicking circuit node → node selected
   - Delete key → node removed from DOM and store; wires attached to the deleted node are also removed
   - Wire rendering between two nodes
   - Toolbar circuit mode toggle → canvas layer visibility
   - Toolbar Run button → signal propagation visible

3. **`src/store/__tests__/useCircuitCanvasStore.test.ts`** (extend existing file created in Round 123) — Add tests covering:
   - `runCircuitSimulation` truth-table verification for all gate types (AND, OR, NOT, NAND, NOR, XOR, XNOR)
   - Cycle detection sets `cycleAffectedNodeIds` correctly
   - `clearCircuitCanvas` resets all state (nodes, wires, selectedIds, cycleAffectedNodeIds, simulating)

4. **`src/store/useMachineStore.ts`** — Add `circuitNodes` and `circuitWires` to the machine save/load payload so circuit state persists across machine saves.

## Acceptance Criteria

1. **AC-124-001**: After clicking the toolbar ⚡ toggle, `document.querySelectorAll('[data-circuit-component]').length === 9`. All nine component buttons (InputNode, OutputNode, AND, OR, NOT, NAND, NOR, XOR, XNOR) are present in the browser DOM with correct `data-circuit-component` attributes. **Negative**: before toolbar toggle, `page.locator('[data-circuit-component]').count()` assert equals 0.

2. **AC-124-002**: Clicking the AND gate button in the module panel causes `useCircuitCanvasStore.getState().nodes.length > 0` and `document.querySelectorAll('.circuit-node').length > 0` within 500ms. Node is placed at or near canvas center. **Negative**: before clicking gate button, `.circuit-node` count assert === 0.

3. **AC-124-003**: Clicking a `.circuit-node` element selects it (`.circuit-node[data-selected='true']` exists). Pressing Delete removes it — `nodes.length` decrements by 1, `.circuit-node` count in DOM decrements by 1, and any wires attached to that node are removed from both DOM (`.circuit-wire` count decrements) and store (`wires` array). **Negative**: before pressing Delete, node count assert > 0.

4. **AC-124-004**: With two circuit nodes on the canvas, clicking an output port then an input port creates a wire. `document.querySelectorAll('.circuit-wire').length === 1`. Wire color reflects signal state (LOW = gray/cyan, HIGH = green glow). **Negative**: before wiring, `.circuit-wire` count assert === 0.

5. **AC-124-005**: After placing InputNode → AND gate → OutputNode, wiring them, clicking toolbar Run button: wire and gate output colors reflect correct logic (0→0→0, 0→1→0, 1→0→0, 1→1→1 for AND gate). **Negative**: circuit with no wires → running simulation does not crash.

6. **AC-124-006**: Toggling ⚡ in toolbar: `data-circuit-nodes-layer` group visibility toggles; gate buttons in module panel appear/disappear. **Negative**: circuit mode OFF → no `.circuit-node` elements visible in DOM.

7. **AC-124-007**: Click Run → `page.evaluate(() => useCircuitCanvasStore.getState().isSimulating)` assert === true. Click Reset → assert === false and `nodes.every(n => n.signal === false)`. **Negative**: clicking Clear resets `nodes.length` to 0 and does not crash.

8. **AC-124-008**: Creating a circuit with a cycle (output feeds back to input) and running simulation: at least one `.circuit-node` has `data-cycle-warning='true'` or visible `!` warning indicator. **Negative**: acyclic circuit → no `data-cycle-warning` attribute set.

9. **AC-124-009**: Adding 3 circuit nodes + 2 wires to canvas, saving machine via toolbar save button, clearing canvas via toolbar Clear button, reloading machine: circuit nodes and wires are restored (`nodes.length === 3`, `wires.length === 2`). **Negative**: after reload, regular machine modules are not replaced by circuit nodes or vice versa.

## Test Methods

### Browser / Playwright (AC-124-001 through AC-124-009)

1. **AC-124-001**: `page.goto('/')` → dismiss welcome modal → click `button[data-tutorial-action='toolbar-circuit-mode']` → wait 300ms → `page.locator('[data-circuit-component]').count()` assert equals 9. Verify each button text matches expected label. **Negative**: before toolbar toggle, `page.locator('[data-circuit-component]').count()` assert equals 0.

2. **AC-124-002**: Circuit mode toggle → click `button[data-circuit-component='AND']` → wait 500ms → `page.evaluate(() => useCircuitCanvasStore.getState().nodes.length)` assert > 0. `page.locator('.circuit-node').count()` assert > 0. **Negative**: before clicking gate button, `.circuit-node` count assert === 0.

3. **AC-124-003**: Add circuit node → click `.circuit-node` → `page.keyboard.press('Delete')` → wait 200ms → store `nodes.length` assert === 0, DOM `.circuit-node` count assert === 0, and `wires.length` and `.circuit-wire` count assert no orphaned wires. **Negative**: before pressing Delete, node count assert > 0.

4. **AC-124-004**: Add InputNode → add OutputNode → click output port (right side of InputNode, via `[data-port-type='output']`) → click input port (left side of OutputNode, via `[data-port-type='input']`) → `page.locator('.circuit-wire').count()` assert === 1. Toggle input node signal → wire color changes. **Negative**: before wiring, `.circuit-wire` count assert === 0.

5. **AC-124-005**: Build Input → AND → Output circuit → wire all connections → click toolbar Run button → verify output LED reflects AND truth table for all 4 input combinations. **Negative**: circuit with no wires → running simulation does not crash.

6. **AC-124-006**: Toggle circuit mode → `page.locator('[data-circuit-nodes-layer]').isVisible()` assert matches expected state. Gate buttons in panel appear/disappear. **Negative**: circuit mode OFF → no `.circuit-node` elements visible in DOM.

7. **AC-124-007**: Click Run → `page.evaluate(() => useCircuitCanvasStore.getState().isSimulating)` assert === true. Click Reset → assert === false. **Negative**: clicking Clear resets `nodes.length` to 0 and does not crash.

8. **AC-124-008**: Create self-feedback loop circuit (e.g., XOR output feeding back to its input) → run simulation → `page.locator('.circuit-node').getAttribute('data-cycle-warning')` assert not null or check for `!` indicator. **Negative**: acyclic circuit → no `data-cycle-warning` attribute set.

9. **AC-124-009**: Add circuit nodes → save machine via toolbar save button → clear canvas via toolbar Clear → reload machine → verify circuit state restored (`nodes.length === 3`, `wires.length === 2`). **Negative**: after reload, regular machine modules are not replaced by circuit nodes or vice versa.

### Unit Tests (AC-124-003 extension, AC-124-005 store logic)

10. **Store tests (extend `src/store/__tests__/useCircuitCanvasStore.test.ts`)**: Test all AND/OR/NOT/NAND/NOR/XOR/XNOR gate truth tables via `runCircuitSimulation()`; test cycle detection sets `cycleAffectedNodeIds`; test `clearCircuitCanvas` resets all arrays, selected IDs, cycle-affected IDs, and simulating state. Ensure tests can run via `npm test -- --run` without Playwright.

## Risks

1. **Playwright timing**: Circuit nodes may take > 500ms to appear in DOM after store update. Mitigation: use `waitForFunction` polling instead of fixed timeout where possible.
2. **Circuit wire port click**: Port click targets (4px circles inside SVG) may be hard to click precisely in Playwright. Mitigation: locate port circle element by `data-port-type` attribute (e.g., `[data-port-type='output']`), then `click({ force: true })`.
3. **Circuit persistence schema**: Adding `circuitNodes`/`circuitWires` to machine save payload requires versioning consideration. Mitigation: add version field and validate on load; skip unknown fields gracefully.
4. **Type compatibility**: `circuitCanvas.ts` types and `circuit.ts` types must remain consistent. Mitigation: re-export `CircuitNodeType` and `GateType` from a single source.
5. **Toggle button visibility**: If `CircuitModulePanel` is not mounted until circuit mode is first enabled, the toggle button may not be visible in the DOM at rest. Mitigation: ensure `CircuitModulePanel` (or at minimum its toggle button) is rendered unconditionally in `ModulePanel.tsx` regardless of `isCircuitMode` state.
6. **Wire deletion edge case**: Deleting a node removes its attached wires (from store), but the DOM wire elements may not be re-rendered if React keyed solely by wire ID and not recomputing on node deletion. Mitigation: ensure `CircuitWire` rendering in Canvas is keyed to wires array and wires are re-rendered when nodes are deleted.

## Failure Conditions

1. `npm run build` fails (TypeScript errors, bundle > 512KB, or build errors).
2. Any `npm test -- --run` test file fails.
3. `document.querySelectorAll('[data-circuit-component]').length === 0` after circuit mode toggle (gate buttons not appearing).
4. `document.querySelectorAll('.circuit-node').length === 0` after clicking gate button (node not added to canvas).
5. `document.querySelectorAll('.circuit-wire').length === 0` after wire-drawing interaction.
6. The circuit gate toggle button (with `data-circuit-toggle` attribute) is NOT visible in the DOM before circuit mode is first enabled (UX fix not applied).
7. `npm test -- --run` reports fewer than 5318 tests passing.
8. Bundle size exceeds 512KB.

## Done Definition

All of the following must be true:

- `npm run build` succeeds with 0 errors; bundle ≤ 512KB
- `npm test -- --run` shows all test files passing (≥ 5318 tests)
- AC-124-001: `document.querySelectorAll('[data-circuit-component]').length === 9` after toolbar toggle; 0 before toggle
- AC-124-002: Circuit node visible on canvas within 1s of clicking gate button; no nodes before click
- AC-124-003: Circuit node deleted from both DOM and store on Delete keypress; wires attached to that node also removed; no crash on unrelated keypress
- AC-124-004: Wire visible between two connected nodes; color changes with signal state; no wires before connection
- AC-124-005: AND gate truth table verified (4 test cases) via Playwright + store assertion
- AC-124-006: Toolbar toggle correctly shows/hides circuit canvas layer and gate buttons
- AC-124-007: Toolbar Run/Reset buttons correctly toggle `isSimulating` state; Clear resets state
- AC-124-008: Cycle warning renders on at least one affected node; no warning on acyclic circuit
- AC-124-009: Circuit state restored after machine save/load cycle; no corruption of regular modules
- The circuit gate toggle button (`[data-circuit-toggle]`) is visible in the DOM before circuit mode is first activated
- `tests/e2e/circuit-canvas.spec.ts` contains ≥ 9 passing Playwright tests

## Out of Scope

- Circuit sub-circuit / macro gate modules
- Animated signal propagation along wire paths
- Simulation speed / timing controls
- Circuit canvas multi-layer support
- Community circuit gallery integration
- Faction-gated circuit components
- Challenge mode circuit puzzles
- Canvas circuit performance optimization (viewport culling for circuit nodes)
- Drag-from-panel-to-canvas for circuit nodes (click-to-place only this round)
- Wire deletion via Delete keypress on a selected wire — only node deletion via Delete is in scope; wires are deleted only as a side effect of deleting their attached node
