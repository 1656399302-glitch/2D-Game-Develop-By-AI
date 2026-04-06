APPROVED

# Sprint Contract — Round 172

## Scope

**Feature:** Circuit Component Drag-and-Drop System

Implement drag-and-drop support for circuit components (gates, InputNode, OutputNode, Timer, Counter, etc.) from the CircuitModulePanel to the canvas. This enables intuitive visual placement of circuit components via HTML5 drag events.

## Spec Traceability

### P0 items (Must complete this round)
- **AC-172-001:** Circuit component drag start from CircuitModulePanel
- **AC-172-002:** Canvas drop handler for circuit components
- **AC-172-003:** Grid snapping for dropped circuit components
- **AC-172-004:** Visual feedback during drag (ghost element)

### P1 items (Should complete this round)
- **AC-172-005:** Keyboard shortcut for quick-add circuit components
- **AC-172-006:** Circuit component placement preview

### Remaining P0/P1 after this round
- Circuit mini-map/navigation overview
- Circuit annotations/labels
- Circuit undo/redo integration for circuit mode
- Circuit copy/paste for selected nodes
- Wire routing optimization

### P2 intentionally deferred
- Circuit simulation step-through debugger
- Circuit state visualization (signal propagation animation)
- Circuit templates/pre-built examples
- Circuit export to image/PNG

## Deliverables

### 1. `src/components/Editor/CircuitModulePanel.tsx` (modified)
- Add `draggable="true"` to circuit component buttons
- Implement `onDragStart` handler that sets `dataTransfer.setData('circuit-component-type', <type>)`
- Add visual drag state via CSS class `.dragging` (opacity: 0.5, cursor: grabbing)
- Circuit component types: InputNode, OutputNode, Timer, Counter, AND, OR, NOT, NAND, NOR, XOR, XNOR

### 2. `src/components/Editor/Canvas.tsx` (modified)
- Extend `handleDrop` to detect circuit component drops via `dataTransfer.getData('circuit-component-type')`
- Parse component type and call `addCircuitNode(type, position, gateType)`
- Implement grid snapping: `Math.round(pos / GRID_SIZE) * GRID_SIZE` where GRID_SIZE = 20
- Clamp dropped position to canvas bounds

### 3. `src/components/Editor/CircuitModulePanel.module.css` (new)
- `.dragging` class: opacity 0.5, cursor grabbing
- `.circuit-component-button[draggable="true"]` with grab cursor

### 4. `src/__tests__/circuitDragDrop.test.tsx` (new)
- Unit tests for drag start, drop handling, grid snapping
- Integration tests for keyboard shortcuts
- 20+ tests total covering all acceptance criteria

## Acceptance Criteria

1. **AC-172-001:** User can click and drag any circuit component button in CircuitModulePanel — the component button has `draggable="true"` and changes cursor to `grabbing`; dragstart event fires with `dataTransfer` containing `circuit-component-type`

2. **AC-172-002:** Dropping a circuit component on the canvas adds it at the drop position — `addCircuitNode` is called with correct type, snapped x/y position, and gateType for gates

3. **AC-172-003:** Dropped circuit components snap to 20px grid — position is calculated as `Math.round(pos / 20) * 20`

4. **AC-172-004:** During drag, a ghost element with `data-testid="circuit-drag-ghost"` follows the cursor — showing component name and icon

5. **AC-172-005:** Pressing a number key (1-9, 0) while canvas is focused adds the corresponding circuit component at center — same position as click-based placement

6. **AC-172-006:** During drag over canvas, a preview element with `data-testid="circuit-drop-preview"` shows snapped position — disappears on dragend without drop

## Test Methods

### AC-172-001: Drag Start Tests
1. Render CircuitModulePanel with circuit component buttons
2. Query button by `data-circuit-component="<type>"` attribute
3. Verify button has `draggable="true"` attribute
4. Simulate `dragstart` event:
   ```javascript
   const dataTransfer = { getData: jest.fn(), setData: jest.fn() };
   fireEvent(button, new DragEvent('dragstart', { dataTransfer }));
   ```
5. Verify `dataTransfer.setData` was called with `'circuit-component-type'` and correct component type
6. Verify button has CSS class `.dragging` applied (via state update)

### AC-172-002: Drop Handler Tests
1. Render Canvas component with mock circuit store
2. Set up spy on `addCircuitNode(store.getState(), { type, x, y, gateType })`
3. Create drop event with circuit component data:
   ```javascript
   const dataTransfer = {
     getData: jest.fn((key) => key === 'circuit-component-type' ? 'AND' : null)
   };
   fireEvent(canvas, new DragEvent('drop', { 
     clientX: 150, clientY: 200, dataTransfer 
   }));
   ```
4. Verify `addCircuitNode` was called with:
   - `type` matching dataTransfer value
   - `x` and `y` within canvas bounds
   - `gateType` set correctly for gate components (AND, OR, etc.)

### AC-172-003: Grid Snapping Tests
1. Mock `addCircuitNode` to capture call arguments
2. Drop circuit component at position x=27, y=33
3. Assert `addCircuitNode` received x=20, y=40 (27→20, 33→40 via `Math.round/20*20`)
4. Drop at position x=52, y=78
5. Assert received x=60, y=80
6. Drop at position x=0, y=0
7. Assert received x=0, y=0 (boundary check)

### AC-172-004: Ghost Preview Tests
1. Start drag on circuit component button
2. Assert element with `data-testid="circuit-drag-ghost"` exists in DOM
3. Verify ghost contains component type text (e.g., "AND", "InputNode")
4. Verify ghost position follows cursor (via `pageX`/`pageY` on dragover)
5. On dragend event, assert ghost element is removed from DOM

### AC-172-005: Keyboard Shortcut Tests
1. Focus canvas element: `canvasElement.focus()`
2. Mock `addCircuitNode` spy
3. Press '1' key: `fireEvent.keyPress(canvasElement, { key: '1' })`
4. Assert `addCircuitNode` called with type corresponding to key '1'
5. Press '2' through '9' and '0', verify each maps to correct component
6. Assert pressing non-numeric key does NOT call `addCircuitNode`

### AC-172-006: Placement Preview Tests
1. Start drag on circuit component
2. Move over canvas (simulate dragover with clientX/clientY)
3. Assert element with `data-testid="circuit-drop-preview"` exists
4. Verify preview position snaps to grid (x=20, y=40 for drop at x=27, y=33)
5. On dragleave/dragend without drop, assert preview element removed

## Risks

### Risk 1: Drop position calculation with viewport transform
- **Description:** Canvas uses viewport transform (pan/zoom), so drop coordinates must be transformed correctly using `getCanvasCoordinates(clientX, clientY)`
- **Mitigation:** Use existing `getCanvasCoordinates` helper; verify coordinates are in canvas space, not screen space
- **Fallback:** Clamp drop position to canvas bounds (0 to canvasWidth, 0 to canvasHeight)

### Risk 2: DataTransfer type collision with regular modules
- **Description:** Both regular modules and circuit components use `dataTransfer`; collision could cause wrong component type
- **Mitigation:** Use namespaced key: `'circuit-component-type'` instead of generic `'moduleType'`
- **Verification:** Verify both drag paths work independently; circuit drop handler checks for `circuit-component-type` key first

### Risk 3: JSDOM drag-and-drop simulation limitations
- **Description:** JSDOM has incomplete drag-and-drop support; `dataTransfer.getData` may not work in test environment
- **Mitigation:** 
  - Use React Testing Library's `userEvent.setup()` with `drag:start`, `drag:over`, `drop` helpers
  - Fallback: Direct event dispatch with mocked `dataTransfer` object
  - Mock the store directly in unit tests rather than testing through event chain
- **Verification:** Tests must pass in both JSDOM (`npm test -- --run`) and verify implementation exists in Canvas.tsx

### Risk 4: Ghost/preview element CSS positioning
- **Description:** Ghost element must follow cursor using `position: fixed` with `left: pageX, top: pageY`
- **Mitigation:** Use `useEffect` to update ghost position on each `dragover` event
- **Verification:** Verify ghost has `position: fixed` and updates position during drag

## Failure Conditions

The round MUST fail if:
1. `npm test -- --run` fails any test (244 existing + new circuitDragDrop tests)
2. `npx tsc --noEmit` reports any TypeScript errors
3. `npm run build` bundle exceeds 512KB limit
4. Circuit components cannot be added via drag-and-drop (drop event not handled)
5. Grid snapping does not work (dropped position not aligned to 20px grid)
6. Dropping on canvas causes runtime error (TypeError, undefined function, etc.)
7. Keyboard shortcuts (1-9, 0) do not add circuit components
8. Ghost preview element not present during drag operation

## Done Definition

All conditions must be true before claiming round complete:

1. ✅ `npm test -- --run` passes with 244+ test files (all existing + new circuitDragDrop tests)
2. ✅ `npx tsc --noEmit` exits with code 0
3. ✅ `npm run build` produces bundle ≤ 512KB
4. ✅ AC-172-001: CircuitModulePanel buttons have `draggable="true"`, dragstart fires with correct dataTransfer
5. ✅ AC-172-002: Canvas handleDrop handles circuit component drops, calls addCircuitNode correctly
6. ✅ AC-172-003: Dropped components snap to 20px grid (verified via Math.round(pos/20)*20)
7. ✅ AC-172-004: Ghost element with `data-testid="circuit-drag-ghost"` renders during drag
8. ✅ AC-172-005: Number keys 1-9, 0 add corresponding circuit components when canvas focused
9. ✅ AC-172-006: Preview element with `data-testid="circuit-drop-preview"` shows on canvas during drag
10. ✅ Test file `circuitDragDrop.test.tsx` exists with 20+ passing tests

## Out of Scope

The following are explicitly NOT being done in this round:

1. **Mini-map/navigation** — Will be addressed in a future round
2. **Circuit annotations** — Labels and text on canvas are deferred
3. **Undo/redo for circuit mode** — Currently uses regular module history
4. **Copy/paste circuit nodes** — Requires separate implementation
5. **Wire routing improvements** — Auto-routing is deferred
6. **Circuit export to image** — Image export uses existing mechanisms
7. **Circuit simulation breakpoints** — Debugger deferred
8. **Circuit component rotation on drop** — Rotation via keyboard/toolbar only
9. **Circuit mode auto-enable on drag** — Must manually enable circuit mode
10. **Circuit component deletion shortcuts** — Delete key already works
11. **Drag between multiple canvases** — Single canvas only
12. **Touch device support** — Pointer events deferred to future round
