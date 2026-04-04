# Sprint Contract — Round 122

## Scope

**Goal**: Integrate the Circuit Simulation Engine (completed Round 121) into the main canvas UI, enabling users to place logic gates on the canvas, connect them with wires, and see real-time signal propagation.

## Spec Traceability

### P0 items covered this round
- **Canvas System**: Integrate circuit component placement and simulation display into the existing canvas
- **Components**: Add logic gate placement (AND, OR, NOT, NAND, NOR, XOR, XNOR), InputNode, OutputNode to canvas module panel
- **Wire Connection System**: Connect circuit components on canvas; visualize signal states on wires

### P1 items covered this round
- **Circuit Validation**: Show cycle detection warnings on canvas
- **Circuit Simulation**: Connect SimulationPanel Run/Reset controls to canvas circuit

### Remaining P0/P1 after this round
- Timer and counter components (P1)
- Memory elements (P1)
- Custom sub-circuit modules (P1)

### P2 intentionally deferred
- Multi-layer support for complex circuits
- Recipe discovery for circuits
- Faction-specific circuit components
- Challenge mode with circuit puzzles

## Deliverables

1. **src/types/circuitCanvas.ts** — New type definitions for canvas circuit components (PlacedCircuitNode, CanvasCircuitState)

2. **src/store/useCircuitCanvasStore.ts** — Zustand store extending circuit simulation with canvas integration (node positions, canvas-specific state)

3. **src/components/Circuit/CanvasCircuitNode.tsx** — Render circuit nodes (gates, InputNode, OutputNode) on canvas with SVG shapes and signal state visualization

4. **src/components/Editor/ModulePanel.tsx** — Add circuit component section with gate selector (AND, OR, NOT, NAND, NOR, XOR, XNOR), InputNode, OutputNode buttons

5. **src/components/Circuit/CircuitWire.tsx** — Wire component with signal state visualization (green=HIGH, gray=LOW)

6. **src/components/Editor/Toolbar.tsx** — Add "Circuit Mode" toggle button

7. **src/hooks/useCircuitCanvas.ts** — Hook connecting canvas interactions to simulation engine

8. **src/__tests__/circuitCanvas.integration.test.tsx** — Integration tests for circuit canvas

## Acceptance Criteria

1. **AC-122-001**: Clicking a gate button in ModulePanel adds that gate type to canvas at center viewport; gate appears in canvas store with type='gate' and correct gateType
2. **AC-122-002**: Clicking InputNode/OutputNode button in ModulePanel adds the respective node type to canvas at center viewport
3. **AC-122-003**: Circuit nodes can be selected (single click), dragged (mouse drag), and deleted (Delete/Backspace key press); node is removed from store on deletion
4. **AC-122-004**: Wires connect circuit node ports; wire color reflects signal state (green=HIGH, gray=LOW for all 7 gate types)
5. **AC-122-005**: Toggling InputNode on canvas changes its output signal and propagates through connected circuit; all 7 gate types produce correct truth table outputs
6. **AC-122-006**: SimulationPanel Run button evaluates circuit; Reset button clears all signals and returns circuit to initial state
7. **AC-122-007**: Cycle detection displays warning indicator (red border + warning icon) on affected nodes when cycle exists; warning disappears (returns to normal appearance) when cycle is resolved
8. **AC-122-008**: Existing module system (core-furnace, gear, etc.) remains fully functional alongside circuit components; no regression in existing functionality
9. **AC-122-009**: All 5176+ existing tests pass; test count does not decrease
10. **AC-122-010**: Bundle size ≤512KB; no regression from Round 121 baseline of 464.54KB

## Test Methods

### AC-122-001: Gate Placement
- **Method**: Unit test simulating click on ModulePanel gate button
- **Verify**: `addCircuitNode('AND')` called with center viewport coordinates; node appears in canvas store with type='gate', gateType='AND'
- **Negative Assertion**: Node should NOT appear in store before button click
- **Test file**: `src/__tests__/circuitCanvas.integration.test.tsx`

### AC-122-002: InputNode/OutputNode Placement
- **Method**: Unit test simulating click on InputNode/OutputNode button in ModulePanel
- **Verify**: Node appears with type='input'/'output' in circuit canvas store
- **Negative Assertion**: Node should NOT appear in store before button click
- **Test file**: `src/__tests__/circuitCanvas.integration.test.tsx`

### AC-122-003: Node Manipulation
- **Method**: 
  - Select test: simulate click on node; verify node selected in store
  - Drag test: simulate mousedown on node, mousemove to delta position, mouseup; verify position updated in store
  - Delete test: select node, press Delete key; verify node ID removed from store
- **Verify**: Node position updates correctly after drag; node ID removed from store after Delete key
- **Negative Assertion**: After deletion, node should NOT be retrievable from store by ID
- **Test file**: `src/__tests__/circuitCanvas.integration.test.tsx`

### AC-122-004: Wire Signal Visualization
- **Method**: Create circuit with InputNode → AND → OutputNode via wire connections, toggle input, verify wire colors
- **Verify**: Wire colors match signal state (green=HIGH, gray=LOW) before and after toggle
- **Negative Assertion**: Wire should NOT display incorrect color when signal is known (e.g., should NOT show green when signal is LOW)
- **Test file**: `src/__tests__/circuitCanvas.integration.test.tsx`

### AC-122-005: Signal Propagation for All Gate Types
- **Method**: Create circuit for each gate type (AND, OR, NOT, NAND, NOR, XOR, XNOR), toggle InputNode, call `runSimulation()`
- **Verify**: 
  - AND output becomes HIGH only when both inputs HIGH
  - OR output HIGH when any input HIGH
  - NOT inverts input
  - NAND/NOR/XOR/XNOR match truth tables from Round 121
- **Negative Assertions**: 
  - Unconnected inputs should default to LOW (should NOT crash or produce undefined)
  - Circuit should NOT produce invalid output states (e.g., neither HIGH nor LOW)
- **Test file**: `src/store/__tests__/useCircuitCanvasStore.test.ts`

### AC-122-006: Simulation Controls
- **Method**: Test Run and Reset button interactions
- **Verify**: 
  - Run sets status='running', evaluates circuit, returns to 'idle' with updated signals
  - Reset clears all signal states in store to initial values (all LOW)
- **Negative Assertion**: After Reset, no node should retain a HIGH signal
- **Test file**: `src/store/__tests__/useCircuitCanvasStore.test.ts`

### AC-122-007: Cycle Detection UI
- **Method**: 
  1. Create circuit with cycle (A→B→C→A), run simulation, verify warning indicator visible
  2. Break the cycle (remove one connection), run simulation, verify warning indicator removed
- **Verify**: 
  - Warning visible: affected nodes have red border (`borderColor='#ef4444'`) AND warning icon visible
  - Warning removed: same elements revert to normal appearance (no red border, no warning icon)
- **Negative Assertion**: Nodes NOT part of the cycle should NOT display warning indicator
- **Test file**: `src/__tests__/circuitCanvas.integration.test.tsx`

### AC-122-008: Non-Regression
- **Method**: `npm test -- --run` (full test suite)
- **Verify**: All 5176+ tests pass; existing modules (core-furnace, gear, etc.) still render and function
- **Negative Assertion**: No existing test should FAIL; no existing module should become inaccessible
- **Test file**: All existing test files pass

### AC-122-009: Test Coverage Maintenance
- **Method**: `npm test -- --run 2>&1 | tail -5`
- **Verify**: Test count ≥ 5176 (no decrease from baseline)
- **Negative Assertion**: Test count should NOT decrease below 5176

### AC-122-010: Bundle Size
- **Method**: `npm run build 2>&1 | grep -E "index-.*\.js"`
- **Verify**: Output ≤512KB (Round 121 baseline was 464.54KB)
- **Negative Assertion**: Bundle should NOT exceed 512KB

## Risks

1. **Integration complexity**: Connecting standalone circuit engine to canvas state may require refactoring ModuleRenderer
2. **State management**: Dual-mode (modules vs circuits) requires careful store separation to prevent state leakage
3. **Performance**: BFS propagation on every wire connection could slow canvas with large circuits
4. **Canvas coordinate system**: Circuit nodes use different coordinate system than existing canvas modules

## Failure Conditions

1. Any AC fails to pass its test method (including negative assertions)
2. Bundle exceeds 512KB
3. Test count drops below 5176
4. TypeScript compilation errors introduced
5. Build fails with errors
6. Existing module system broken (non-regression failure)
7. Cycle detection warning displays on nodes NOT involved in cycle
8. Signal propagation produces incorrect outputs for any gate type truth table

## Done Definition

All 10 acceptance criteria verified with passing tests:
- Gate/InputNode/OutputNode placement from ModulePanel works (AC-122-001, AC-122-002)
- Nodes are selectable, draggable, and deletable on canvas (AC-122-003)
- Wires show signal states with correct colors (green=HIGH, gray=LOW) (AC-122-004)
- Signal propagation correct for all 7 gate types (AND, OR, NOT, NAND, NOR, XOR, XNOR) (AC-122-005)
- SimulationPanel Run/Reset controls functional (AC-122-006)
- Cycle detection UI works: warning visible with cycle, warning removed when cycle resolved (AC-122-007)
- No regression in existing tests ≥5176 (AC-122-008, AC-122-009)
- Bundle size within limit ≤512KB (AC-122-010)

## Out of Scope

- **Circuit validation overlay integration**: CanvasValidationOverlay and CircuitValidationOverlay exist but are NOT integrated with circuit nodes this round
- Sub-circuit modules (custom circuit definitions)
- Timer/counter/memory components
- Multi-layer canvas support for complex circuits
- Circuit recipe discovery system
- Circuit achievement tracking
- Community circuit gallery for sharing circuits
- Circuit-specific tech tree progression
- Timing diagram visualization
- Step-by-step debugging mode

## Operator Inbox Instructions

*No active operator inbox instructions target this contract round. All prior inbox items (rounds 51, 85, 103, 106) have been processed and resolved.*
