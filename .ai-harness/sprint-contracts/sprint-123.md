APPROVED

# Tech Tree Canvas — Circuit Building Game

## Project Overview

A circuit-building puzzle game with tech tree progression. Players design circuits on a canvas using logic gates, wires, and components to solve challenges. Features recipe discovery, achievement tracking, faction progression, and community sharing.

## Core Features

### Canvas System
- Interactive circuit canvas with grid snapping
- Drag-and-drop component placement
- Wire connection system between ports
- Circuit validation and simulation
- Multi-layer support for complex circuits

### Components
- Logic gates: AND, OR, NOT, NAND, NOR, XOR, XNOR
- Wire segments and junction points
- Input/output nodes
- Timer and counter components
- Memory elements
- Custom sub-circuit modules

### Progression System
- Tech tree with unlockable components
- Recipe discovery through experimentation
- Achievement system for milestones
- Faction reputation and rewards
- Challenge mode with puzzles

### Community Features
- Publish circuits to community gallery
- Browse and import community circuits
- Favorite and rate circuits
- Template library for common patterns
- Exchange/trade system between players

## Technical Stack
- React + TypeScript + Vite
- Zustand for state management
- SVG-based canvas rendering
- Canvas validation engine
- Lazy loading for performance

## Architecture

### Directory Structure
```
src/
├── components/
│   ├── Canvas/          # Main canvas system
│   ├── Components/      # Circuit components
│   ├── TechTree/        # Tech tree UI
│   ├── Challenge/        # Challenge mode
│   ├── RecipeBook/      # Recipe discovery
│   ├── Achievement/      # Achievement tracking
│   ├── Faction/         # Faction system
│   ├── Community/       # Community gallery
│   ├── Exchange/        # Trade system
│   └── AI/              # AI assistant
├── stores/              # Zustand stores
├── hooks/               # Custom hooks
├── utils/               # Utility functions
└── types/               # TypeScript types
```

### Data Models

#### Component Instance
```typescript
interface ComponentInstance {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  rotation: number;
  parameters: Record<string, any>;
  connections: Connection[];
}
```

#### Circuit
```typescript
interface Circuit {
  id: string;
  name: string;
  components: ComponentInstance[];
  layers: Layer[];
  metadata: CircuitMetadata;
}
```

#### Recipe
```typescript
interface Recipe {
  id: string;
  inputs: ComponentType[];
  output: ComponentType;
  discoveredBy: string;
  timestamp: number;
}
```

## Performance Requirements
- Main bundle ≤512KB
- Lazy loading for all panel/modal components
- Virtualized lists for large circuit galleries
- Efficient canvas rendering with viewport culling
- Test coverage maintained at ≥4948 tests

## Design Language
- Dark theme with circuit-board aesthetic
- Cyan/green accent colors for active elements
- Monospace typography for technical feel
- Subtle glow effects for powered connections
- Grid pattern background

# Sprint Contract — Round 123

## Scope

This sprint focuses exclusively on **remediating the Round 122 integration failures**. The circuit canvas store, types, and hooks were implemented in prior rounds but were never integrated into the main application UI. This sprint completes the integration layer so that:

1. Circuit components (gates) appear in the module selector panel
2. Circuit nodes render on the canvas when placed
3. Circuit wires render when connections are made
4. Circuit simulation can be triggered and visualized

**No new features are being added.** All circuit component files (`CanvasCircuitNode`, `CircuitWire`) and the `useCircuitCanvas` hook exist and are ready for integration.

## Spec Traceability

### P0 items (must complete — blocked by Round 122 failures)
- **P0-1**: CircuitModulePanel integrated into the editor module selector → gate buttons visible in browser
- **P0-2**: Canvas renders circuit nodes (`CanvasCircuitNode`) when added to circuit canvas
- **P0-3**: Canvas renders circuit wires (`CircuitWire`) when connections are made
- **P0-4**: Circuit simulation toggle and visualization wired to the canvas rendering layer
- **P0-5**: `src/store/__tests__/useCircuitCanvasStore.test.ts` created as referenced in Round 122

### P1 items (must complete this round)
- **P1-1**: Gate buttons in CircuitModulePanel wired to `useCircuitCanvas.addCircuitNode()`
- **P1-2**: Circuit node selection, movement, and deletion wired to canvas interactions
- **P1-3**: Wire drawing (start, preview, finish) wired to canvas click/drag events

### Remaining P0/P1 after this round
- All circuit canvas P0/P1 items should be integrated and visible in browser after Round 123

### P2 items (intentionally deferred)
- Tech tree progression system for unlocking gates
- Recipe discovery system
- Achievement tracking
- Faction reputation and rewards
- Community gallery and sharing
- Exchange/trade system

## Deliverables

1. **`src/components/Editor/ModulePanel.tsx`** — Import and conditionally render `CircuitModulePanel` when circuit mode is active. Circuit gate buttons (Input, Output, AND, OR, NOT, NAND, NOR, XOR, XNOR) must appear in the module panel.

2. **`src/components/Canvas/Canvas.tsx`** (or integration into existing canvas) — Import and render `CanvasCircuitNode` for each circuit node and `CircuitWire` for each circuit wire. Wire canvas interactions to `useCircuitCanvas` hook actions.

3. **`src/store/__tests__/useCircuitCanvasStore.test.ts`** — Create the missing test file covering:
   - Node CRUD operations (add, remove, select, move)
   - Wire CRUD operations (start, finish, remove, select)
   - Signal propagation
   - Cycle detection

4. **Circuit canvas integration** — Connect toolbar Run/Reset/Clear buttons to `runSimulation()`, `resetSimulation()`, and `clearCanvas()` actions. Visual feedback on simulation state.

## Acceptance Criteria

### AC-123-001: Circuit gate buttons visible in module panel
- When `isCircuitMode === true` in `useCircuitCanvasStore`, the ModulePanel must display circuit gate buttons
- At minimum: Input, Output, AND, OR, NOT, NAND, NOR, XOR, XNOR (9 component types)
- Browser query `document.querySelectorAll('[data-circuit-component]').length` returns ≥ 9
- AC verified by: clicking circuit mode toggle → gate buttons appear in panel

### AC-123-002: Circuit nodes render on canvas
- When `addCircuitNode()` is called, `CanvasCircuitNode` renders at the correct position
- Browser query `document.querySelectorAll('.circuit-node').length` reflects store node count
- Multiple node types (AND, OR, NOT, etc.) each render with correct gate shape
- AC verified by: adding a node via store → node visible on canvas

### AC-123-003: Circuit wires render on canvas
- When `finishWire()` is called with valid connection, `CircuitWire` renders between ports
- Browser query `document.querySelectorAll('.circuit-wire').length` reflects store wire count
- Wires show correct bezier curve path between connection points
- AC verified by: creating a wire connection → wire visible on canvas

### AC-123-004: Simulation runs and visualizes signals
- Clicking Run button triggers `runSimulation()` and nodes show signal colors (red=off, green=on)
- Signal propagation is visible: input changes propagate through gate logic
- AC verified by: clicking Run → node colors change to reflect signal state

### AC-123-005: Store tests cover all CRUD operations
- `src/store/__tests__/useCircuitCanvasStore.test.ts` exists with tests for:
  - `addCircuitNode` / `removeSelectedNode` / `selectNode` / `moveNode`
  - `startWire` / `finishWire` / `removeSelectedWire` / `selectWire`
  - `propagateSignals` (signal propagation)
  - Cycle detection does not crash and marks affected nodes
- Test count increases by ≥ 20 new tests

## Test Methods

### TM-123-001: Circuit gate buttons in ModulePanel
1. Start dev server: `npm run dev`
2. Open browser to `http://localhost:5173`
3. Click element with `data-tutorial-action='toolbar-circuit-mode'` to enable circuit mode
4. Query `document.querySelectorAll('[data-circuit-component]').length`
5. **PASS**: count ≥ 9
6. **FAIL**: count === 0 or circuit buttons not visible

### TM-123-002: Circuit nodes render on canvas
1. Open browser dev console
2. Run: `useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'AND')`
3. Run: `useCircuitCanvasStore.getState().addCircuitNode('input', 200, 300, 'INPUT')`
4. Query `document.querySelectorAll('.circuit-node').length`
5. **PASS**: count === 2
6. **FAIL**: count === 0 (nodes not rendered)

### TM-123-003: Circuit wires render on canvas
1. Add two nodes (input and AND gate) per TM-123-002
2. Get node IDs from store
3. Run: `useCircuitCanvasStore.getState().startWire(inputNodeId, 'output-0')`
4. Run: `useCircuitCanvasStore.getState().finishWire(andNodeId, 'input-0')`
5. Query `document.querySelectorAll('.circuit-wire').length`
6. **PASS**: count === 1
7. **FAIL**: count === 0 (wire not rendered)

### TM-123-004: Simulation visualizes signals
1. Add input node and output node
2. Connect input to output
3. Toggle input: `useCircuitCanvasStore.getState().toggleInput(inputNodeId)`
4. Click Run button (element with `data-circuit-action='run'`)
5. Inspect canvas — input node should show green (signal ON)
6. **PASS**: Input node visually shows ON state (green), propagates to output
7. **FAIL**: No visual change on canvas

### TM-123-005: Store test file exists and passes
1. Run: `ls src/store/__tests__/useCircuitCanvasStore.test.ts`
2. Run: `npm test -- src/store/__tests__/useCircuitCanvasStore.test.ts`
3. **PASS**: File exists AND all tests pass
4. **FAIL**: File does not exist OR tests fail

## Risks

1. **Integration complexity**: The existing Canvas component may use a different rendering approach than assumed. If Canvas.tsx uses DOM elements instead of SVG, `CanvasCircuitNode` (SVG-based) may need wrapping or adaptation.
   - Mitigation: Verify canvas rendering approach first; wrap SVG component in container div if needed.

2. **Store/hook mismatch**: `useCircuitCanvas` hook may not expose all actions needed for integration. If `addCircuitNode` signature differs from what's needed for gate button clicks, the wiring layer needs adjustment.
   - Mitigation: Use store directly (`useCircuitCanvasStore.getState().addCircuitNode()`) instead of hook wrapper if needed.

3. **ModulePanel architecture**: The existing ModulePanel manages machine modules via `useMachineStore`. Mixing circuit components (via `useCircuitCanvasStore`) may cause state confusion or UI conflicts.
   - Mitigation: Keep circuit and machine panels strictly separated via `isCircuitMode` flag. Only render circuit components when circuit mode is active.

4. **Test file conflicts**: Creating new test file may conflict with existing integration tests if similar test names exist.
   - Mitigation: Use unique test describe blocks and ensure no duplicate test files.

## Failure Conditions

This round **MUST FAIL** if:

1. `document.querySelectorAll('[data-circuit-component]').length === 0` after circuit mode is enabled
2. `document.querySelectorAll('.circuit-node').length === 0` after adding circuit nodes via store
3. `document.querySelectorAll('.circuit-wire').length === 0` after creating wire connections
4. `src/store/__tests__/useCircuitCanvasStore.test.ts` does not exist or tests fail
5. Any regression: total test count drops below 5202, bundle size exceeds 512KB, TypeScript errors appear
6. Round 122 critical bugs remain unfixed: CircuitModulePanel, CanvasCircuitNode, or CircuitWire still not integrated into app UI

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ Circuit gate buttons (≥9) are visible in the module panel when circuit mode is active
2. ✅ Circuit nodes appear on the canvas when added via store actions
3. ✅ Circuit wires appear on the canvas when wire connections are made
4. ✅ Signal colors (red/green) are visible on nodes after running simulation
5. ✅ `src/store/__tests__/useCircuitCanvasStore.test.ts` exists and all tests pass
6. ✅ Total test count ≥ 5202 (no regression)
7. ✅ Bundle size ≤ 512KB (no regression)
8. ✅ TypeScript compilation: 0 errors (no regression)
9. ✅ Browser verification: All AC browser queries return expected counts

## Out of Scope

- Creating new circuit component files (CanvasCircuitNode, CircuitWire, useCircuitCanvas already exist)
- Machine module editor changes (non-circuit work)
- Tech tree, achievements, faction, community features
- Recipe discovery system
- Exchange/trade system
- Any new features not directly related to circuit canvas integration
- Refactoring existing canvas architecture beyond what's needed for integration
- Visual polish beyond making circuit components functional
