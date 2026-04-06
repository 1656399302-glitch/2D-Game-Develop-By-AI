# Sprint Contract — Round 173

## Scope

**Feature Focus:** Circuit Wire Connection Workflow — Complete the wire-drawing interaction from port-to-port connections, including visual feedback during wire drawing and connection validation.

## Spec Traceability

### P0 (Must Have — Critical Path)
- Wire connection workflow: click port → draw → complete connection
- Wire preview rendering during drag
- Connection validation (prevent invalid connections)
- Delete wire via keyboard (Delete/Backspace)

### P1 (Should Have — Important but Non-Blocking)
- Visual feedback when hovering over valid/invalid connection targets
- Wire selection and highlighting
- Multi-wire deletion (selected nodes' wires)

### P2 (Intentionally Deferred)
- Wire junction creation at wire intersections
- Automatic wire routing around obstacles
- Wire labels/names
- Wire color customization

## Deliverables

1. **`src/__tests__/circuitWireConnection.test.tsx`** — Test file covering:
   - Port click initiates wire drawing mode
   - Wire preview renders during drawing
   - Valid connection completion (output→input port)
   - Invalid connection rejection (input→input, output→output)
   - Wire cancel via Escape key
   - Wire deletion via Delete/Backspace
   - Multi-node wire cleanup on node deletion
   - Wire signal updates after simulation

2. **`src/components/Circuit/CircuitWire.tsx`** — Enhanced wire preview component with:
   - Valid/invalid connection state styling
   - Snap-to-port indicator when near valid target

3. **`src/components/Canvas.tsx`** — Wire preview rendering during `isDrawingWire` state:
   - SVG `<path>` element with dashed stroke renders when `isDrawingWire === true`
   - Path updates on mousemove to follow cursor
   - Preview disappears on mouseup (complete or cancel)

4. **No new components or major refactors** — All changes are additive or test coverage additions

## Acceptance Criteria

| # | Criterion | Binary Condition |
|---|-----------|-------------------|
| AC-173-001 | Clicking an output port initiates wire drawing mode | `isDrawingWire === true` and `wireStart` is populated with `{nodeId, portIndex}` after clicking output port |
| AC-173-002 | Wire preview renders during drawing | DOM contains SVG element with class/attribute indicating wire preview (e.g., `data-testid="wire-preview"` or class `.wire-preview`) when `isDrawingWire === true` |
| AC-173-003 | Valid connection creates wire | `addCircuitWire()` called with correct source/target when clicking valid input port after starting wire |
| AC-173-004 | Invalid connection rejected | No wire created, `isDrawingWire` resets to `false` when attempting output→output or input→input connection |
| AC-173-005 | Escape cancels drawing | `cancelCircuitWireDrawing()` called and `isDrawingWire === false` after Escape keydown during wire drawing |
| AC-173-006 | Delete removes selected wire | Selected wire removed from `wires` array after Delete/Backspace keydown with wire selected |
| AC-173-007 | Node deletion removes wires | All wires connected to deleted node removed from `wires` array |
| AC-173-008 | Existing tests continue to pass | `npm test -- --run` passes all 245+ test files with zero failures |

## Test Methods

### TM-001: Wire Drawing Initiation (AC-173-001)
**Method:** Store unit test + component integration test
1. Import `useCircuitStore` from store
2. Call `startCircuitWireDrawing(nodeId, portIndex)` where portIndex is an output port
3. Assert `get().isDrawingWire === true`
4. Assert `get().wireStart?.nodeId === nodeId`
5. Assert `get().wireStart?.portIndex === portIndex`

**Evaluator verification:**
```bash
npm test -- --run src/__tests__/circuitWireConnection.test.tsx --testNamePattern="wire drawing init"
```

### TM-002: Wire Preview Rendering (AC-173-002)
**Method:** DOM rendering test with testid assertion
1. Render Canvas with circuit nodes and ports
2. Trigger wire drawing mode (simulate output port click)
3. Assert document contains element matching `[data-testid="wire-preview"]` or `[class*="wire-preview"]`
4. Assert element has `stroke-dasharray` attribute (dashed line style)

**Evaluator verification:**
```bash
npm test -- --run src/__tests__/circuitWireConnection.test.tsx --testNamePattern="wire preview"
```

### TM-003: Valid Connection Creation (AC-173-003)
**Method:** Store unit test + integration test
1. Call `startCircuitWireDrawing(sourceNodeId, outputPortIndex)`
2. Call `finishCircuitWireDrawing(targetNodeId, inputPortIndex)`
3. Assert `get().wires` array includes new wire with matching `sourceNodeId`, `sourcePortIndex`, `targetNodeId`, `targetPortIndex`
4. Assert `get().isDrawingWire === false`

**Evaluator verification:**
```bash
npm test -- --run src/__tests__/circuitWireConnection.test.tsx --testNamePattern="valid connection"
```

### TM-004: Invalid Connection Rejection (AC-173-004)
**Method:** Store unit test for each invalid scenario
1. **Output→Output:** Start wire from output port, try to finish on output port
   - Assert: No new wire in `wires` array
   - Assert: `isDrawingWire === false` OR error state set
2. **Input→Input:** Start wire from input port (if allowed), try to finish on input port
   - Assert: No new wire created
   - Assert: State returns to idle

**Evaluator verification:**
```bash
npm test -- --run src/__tests__/circuitWireConnection.test.tsx --testNamePattern="invalid connection"
```

### TM-005: Escape Cancellation (AC-173-005)
**Method:** Keyboard event simulation test
1. Call `startCircuitWireDrawing(nodeId, portIndex)` to enter drawing mode
2. Simulate `keydown` event with `key === 'Escape'`
3. Assert `get().isDrawingWire === false`
4. Assert `get().wireStart === null`

**Evaluator verification:**
```bash
npm test -- --run src/__tests__/circuitWireConnection.test.tsx --testNamePattern="Escape cancel"
```

### TM-006: Wire Deletion (AC-173-006)
**Method:** Keyboard event simulation + state verification
1. Create wire via `addCircuitWire(sourceId, srcPort, targetId, tgtPort)`
2. Select wire (if selection state exists) or use wire ID directly
3. Simulate `keydown` with `key === 'Delete'` or `key === 'Backspace'`
4. Assert wire no longer exists in `get().wires` array

**Evaluator verification:**
```bash
npm test -- --run src/__tests__/circuitWireConnection.test.tsx --testNamePattern="wire deletion"
```

### TM-007: Node Deletion Wire Cleanup (AC-173-007)
**Method:** Store unit test
1. Create multiple nodes and wires connecting them
2. Call `removeCircuitNode(nodeId)` or delete a node
3. Assert all wires with `sourceNodeId === nodeId` OR `targetNodeId === nodeId` are removed
4. Assert remaining wires are unaffected

**Evaluator verification:**
```bash
npm test -- --run src/__tests__/circuitWireConnection.test.tsx --testNamePattern="node deletion.*wire"
```

### TM-008: Regression Coverage (AC-173-008)
**Method:** Full test suite execution
```bash
npm test -- --run
```

**Pass criteria:**
- All 245 test files pass
- All 7000+ tests pass
- Zero skipped tests (unless explicitly documented)

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Wire preview SVG not rendering | Medium | Add explicit conditional rendering check for wire drawing state in Canvas.tsx; verify testid exists |
| Port click events interfering with node drag | Medium | Verify `stopPropagation()` called on port click handlers; add separate click and drag detection |
| Cross-layer wire creation | Low | Add layer validation in `addCircuitWire` if nodes exist on different layers |
| Store actions not exported for testing | Medium | Ensure `startCircuitWireDrawing`, `finishCircuitWireDrawing`, `cancelCircuitWireDrawing`, `deleteCircuitWire` are exported |
| Wire preview path calculation incorrect | Low | Test with multiple cursor positions; verify Bezier curve control points |

## Failure Conditions

The round fails if ANY of the following conditions occur:

1. **`npm test -- --run` exits non-zero** — Any test file fails
2. **`npm run build` exceeds 512KB** — Bundle size check fails
3. **TypeScript compilation errors** — `npx tsc --noEmit` exits non-zero
4. **Wire creation silently fails** — `wires` array unchanged after valid connection attempt
5. **Invalid connections accepted** — Wires created between incompatible port types (output→output, input→input)
6. **Wire preview never renders** — No preview element in DOM during `isDrawingWire === true`
7. **Escape does not cancel** — State persists after Escape keydown
8. **Delete does not remove wire** — Wire remains in `wires` array after Delete keydown
9. **Regression: previous circuit tests fail** — Any of the 42 drag-drop tests from Round 172 fail

## Done Definition

**All 8 acceptance criteria must be verified TRUE before claiming round complete:**

| # | Criterion | Verification Command | Expected Output |
|---|-----------|----------------------|-----------------|
| 1 | Port click starts wire drawing | `npm test -- --run circuitWireConnection --testNamePattern="initiates wire drawing"` | Test passes |
| 2 | Wire preview renders | `npm test -- --run circuitWireConnection --testNamePattern="preview"` | Test passes + DOM check |
| 3 | Valid connection creates wire | `npm test -- --run circuitWireConnection --testNamePattern="valid connection"` | Test passes |
| 4 | Invalid connection rejected | `npm test -- --run circuitWireConnection --testNamePattern="invalid"` | Test passes |
| 5 | Escape cancels drawing | `npm test -- --run circuitWireConnection --testNamePattern="Escape"` | Test passes |
| 6 | Delete removes selected wire | `npm test -- --run circuitWireConnection --testNamePattern="deletion"` | Test passes |
| 7 | Node deletion removes wires | `npm test -- --run circuitWireConnection --testNamePattern="node deletion.*wire"` | Test passes |
| 8 | Regression coverage | `npm test -- --run` | All 245 files pass |

**Additional done conditions:**
- `npm run build` outputs bundle ≤512KB
- `npx tsc --noEmit` exits 0
- New test file contains ≥25 passing tests covering all ACs
- No TypeScript errors introduced

## Out of Scope

- Junction creation (manual wire branching)
- Wire routing/path optimization
- Wire annotations or labels
- Drag-to-connect alternative to click-to-connect
- Layer visibility affecting wire rendering (wires render on active layer only — current behavior preserved)
- Changes to machine/arcane modules (non-circuit mode)
- Drag-drop improvements beyond what's in round 172
- Visual styling refinements beyond wire preview states (valid/invalid)
- Wire color customization per connection

## Operator Inbox Notes

No unprocessed operator inbox items target Round 173. Previous inbox items (rounds 51, 85, 103, 106) have been processed in their respective phases.

## Prior Round Context

**Round 172 Complete:** Circuit component drag-and-drop system fully implemented with 42 passing tests, TypeScript clean, bundle 464.75 KB (under 512KB limit). All 6 acceptance criteria verified. Circuit mode toggle, draggable component buttons, grid snapping (20px), ghost preview, keyboard shortcuts (1-0), and drop preview all functional.

**Spec Coverage:** Round 173 continues wire connection workflow as P0 item from circuit spec.
