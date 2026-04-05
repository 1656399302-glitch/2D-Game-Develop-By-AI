# Sprint Contract — Round 151

## Scope

**Feature:** Circuit Persistence System — Add save/load functionality for circuit designs, allowing users to persist circuits to localStorage and restore them later. This follows the signal trace integration completed in Round 150.

**Critical Context from Operator Inbox (MUST NOT WEAKEN):**
- **operator-item-1775113667868**: Archive popup gets stuck when clicking Save or starting new archive — **must be verified as fixed**
- **operator-item-1775233786990**: Welcome Back popup gets stuck regardless of clicking stash or new — **must be verified as fixed**
- These inbox items indicate pre-existing save/load popup issues that must be regression-tested in this round

## Spec Traceability

### P0 items (Must have)
- **Circuit Save/Load Store Integration**: Add circuit state persistence methods to `useCircuitCanvasStore`
- **Auto-save on State Changes**: Persist circuit state when nodes/wires are added, modified, or deleted
- **Restore Circuit on Page Load**: Load persisted circuit state when application initializes
- **Clear Persistence**: Remove persisted circuit data when canvas is cleared
- **Archive/Welcome Back Popup Regression**: Verify archive and Welcome Back popups are NOT stuck after adding persistence code

### P1 items (Should have)
- **Circuit Metadata Storage**: Save circuit name, creation timestamp, and modification history
- **Multiple Circuit Slots**: Support storing up to 5 recent circuit designs

### P2 items (Nice to have — intentionally deferred)
- Circuit export to SVG/PNG
- Pre-built example circuits library
- Truth table generator
- Circuit minimization suggestions

## Deliverables

1. **`src/store/circuitPersistence.ts`** — New file with localStorage key constants, save/load utility functions
2. **`src/store/useCircuitCanvasStore.ts`** — Modified to integrate persistence methods:
   - `saveCircuitToStorage()` — Called after every state mutation
   - `loadCircuitFromStorage()` — Called on store initialization
   - `getRecentCircuits()` — Returns list of saved circuits
   - `clearStoredCircuit(slotId?)` — Clears specific or all stored circuits
3. **`src/store/circuitPersistence.test.ts`** — Unit tests for persistence functions (≥20 tests)
4. **Integration tests in `src/__tests__/integration/circuitPersistence.test.ts`** — End-to-end tests verifying save/load cycle (≥10 tests)
5. **Regression tests for popup blocking** — Verify archive and Welcome Back popups do not hang after this round's changes

## Acceptance Criteria

1. **AC-151-001**: Calling `saveCircuitToStorage()` after adding 3 nodes and 2 wires persists the state to localStorage — `localStorage.getItem()` returns valid JSON with correct node count
2. **AC-151-002**: Refreshing the page calls `loadCircuitFromStorage()` and restores the circuit state with all nodes, wires, and signals
3. **AC-151-003**: `getRecentCircuits()` returns at least the most recently saved circuit with `id`, `name`, `timestamp`, `nodeCount`, `wireCount`
4. **AC-151-004**: `clearStoredCircuit()` removes the circuit from localStorage and subsequent `loadCircuitFromStorage()` returns null/empty
5. **AC-151-005**: Bundle size remains ≤512KB after adding persistence code (verify with `npm run build`)
6. **AC-151-006**: Test count ≥6148 passing tests (6149 total with 1 pre-existing unrelated failure in activationModes.test.ts line 245)
7. **AC-151-007**: TypeScript compilation clean (`npx tsc --noEmit` exits with code 0)
8. **AC-151-008**: Multiple circuit slots work — saving two different circuits stores both; loading slot 1 vs slot 2 returns different circuit data
9. **AC-151-009**: Archive popup does NOT hang when clicking Save or New — verified via browser test or integration test
10. **AC-151-010**: Welcome Back popup does NOT hang when clicking stash or new — verified via browser test or integration test
11. **AC-151-011**: Round 150 timing panel feature still functional after persistence integration

## Test Methods

1. **Unit Tests (`circuitPersistence.test.ts`)**:
   - Mock `localStorage.getItem/setItem/removeItem`
   - Test `saveCircuitToStorage()` writes correct JSON structure
   - Test `loadCircuitFromStorage()` parses and returns circuit state
   - Test edge cases: empty circuit, no localStorage support, corrupted data recovery

2. **Integration Tests (`circuitPersistence.test.ts`)**:
   - Add nodes via `addCircuitNode()` → verify localStorage updated
   - Clear via `clearCircuitCanvas()` → verify localStorage cleared
   - Simulate page refresh by calling `loadCircuitFromStorage()` → verify state restored
   - Test multiple circuit slots independently

3. **Popup Regression Tests**:
   - Simulate opening archive popup → verify it opens without hanging
   - Simulate opening Welcome Back popup → verify it opens without hanging
   - Click Save in archive popup → verify operation completes within 2 seconds
   - Click New in archive popup → verify operation completes within 2 seconds
   - Click stash in Welcome Back popup → verify operation completes within 2 seconds
   - Click new in Welcome Back popup → verify operation completes within 2 seconds
   - Negative assertion: popup must not remain open after click action completes

4. **Build Verification**:
   - Run `npm run build` and verify bundle size
   - Run `npx tsc --noEmit` and verify no TypeScript errors

5. **Regression Testing**:
   - Run `npm test -- --run` and verify test count ≥6148 passing

## Risks

1. **Risk: localStorage quota exceeded** — Mitigation: Implement storage size checking before save; warn user if approaching limit
2. **Risk: Corrupted localStorage data** — Mitigation: Wrap parse in try-catch; return empty state on parse failure
3. **Risk: Concurrent tab modifications** — Mitigation: Use storage event listener to detect external changes
4. **Risk: Archive/Welcome Back popup regression** — Mitigation: Add explicit regression tests for popup interactions; verify popup state transitions correctly
5. **Risk: Persistence code conflicts with existing popup handlers** — Mitigation: Verify popup flow still works end-to-end after store integration

## Failure Conditions

1. Bundle size exceeds 512KB after integration
2. TypeScript compilation fails
3. Test count drops below 6148 passing tests (excluding the 1 pre-existing unrelated failure)
4. Save/load cycle fails to preserve circuit state accurately
5. Existing acceptance criteria from Round 150 no longer pass (timing panel must still work)
6. Archive popup hangs or blocks on any action (Save, New, Cancel)
7. Welcome Back popup hangs or blocks on any action (stash, new)
8. Any new console errors introduced by persistence code

## Done Definition

All of the following must be true before claiming round complete:

1. ✅ `npm run build` → Bundle ≤524,288 bytes (512KB)
2. ✅ `npx tsc --noEmit` → Exit code 0
3. ✅ `npm test -- --run` → ≥6148 tests passing (1 pre-existing failure in activationModes.test.ts line 245 is acceptable)
4. ✅ `grep -q "saveCircuitToStorage" src/store/useCircuitCanvasStore.ts` → Found
5. ✅ `grep -q "loadCircuitFromStorage" src/store/useCircuitCanvasStore.ts` → Found
6. ✅ `grep -q "getRecentCircuits" src/store/useCircuitCanvasStore.ts` → Found
7. ✅ Unit tests in `circuitPersistence.test.ts` pass (≥20 tests)
8. ✅ Integration tests pass (≥10 tests)
9. ✅ Round 150 timing panel feature still functional (browser verification)
10. ✅ No console errors during save/load operations
11. ✅ Archive popup regression tests pass — popup does not hang
12. ✅ Welcome Back popup regression tests pass — popup does not hang
13. ✅ `grep -q "circuitPersistence" src/store/useCircuitCanvasStore.ts` → Persistence code integrated

## Out of Scope

- Circuit export (SVG/PNG) — deferred to future round
- Pre-built example circuits — deferred to future round  
- Truth table generation — deferred to future round
- Cloud sync or server-side storage
- Circuit sharing via URL parameters
- Circuit versioning or diff
- Integration with arcane machine modules (only circuit nodes)
- Fixing bugs unrelated to persistence (e.g., activationModes.test.ts pre-existing failure)

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

# QA Evaluation — Round 150

## Release Decision
- **Verdict:** PASS
- **Summary:** All 8 acceptance criteria verified and passed. The Circuit Signal Visualization feature is fully integrated into the main application UI and connected to the circuit simulation flow.
- **Spec Coverage:** FULL
- **Contract Coverage:** PASS
- **Build Verification:** PASS — Bundle 426.02 KB (426,022 bytes), 98,266 bytes under 512KB limit
- **Browser Verification:** PASS — Timing diagram panel visible in circuit mode, no console errors
- **Placeholder UI:** NONE
- **Critical Bugs:** 0
- **Major Bugs:** 0
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 8/8
- **Untested Criteria:** 0

## Blocking Reasons
None

## Scores
- **Feature Completeness: 10/10** — All deliverables implemented: signal trace store integration in `useCircuitCanvasStore.ts` (recordStep at line 714, clearTraces at lines 759/782), timing panel UI in `Toolbar.tsx` (CircuitSignalVisualizer imported and rendered, timing diagram toggle button visible), and integration tests in `signalTraceIntegration.test.ts` (16 tests passing).

- **Functional Correctness: 10/10** — TypeScript compiles clean (npx tsc --noEmit exits with code 0). 6148 tests pass (1 unrelated failure in activationModes.test.ts). `useSignalTraceStore.getState().recordStep()` is called after signal propagation in `runCircuitSimulation()`. `clearTraces()` is called in both `resetCircuitSimulation()` and `clearCircuitCanvas()`.

- **Product Depth: 9/10** — Timing diagram panel renders correctly in circuit mode with proper UI elements: "📊 波形图" header, "暂无波形数据" empty state, step count (步数: 0), signal count (信号: 0), and standby indicator (○ 待机). Signal name mapping converts node IDs to readable labels (input labels, gate types, output labels).

- **UX / Visual Quality: 9/10** — Timing diagram toggle button visible in circuit mode toolbar with proper styling. Panel renders in absolute position (bottom-right). "波形图" button shows active state when panel is open. Clear visual hierarchy with recording controls (⏺ 录制, 📝 记录当前, 🗑 清空).

- **Code Quality: 10/10** — Clean integration between `useCircuitCanvasStore` and `useSignalTraceStore`. `mapSignalsToReadableNames()` helper function maps node IDs to readable signal names. Proper Zustand store patterns used. TypeScript types properly defined.

- **Operability: 10/10** — Build passes (426.02 KB < 512KB). Tests pass (6148 tests). Browser test confirms timing panel visible. No console errors during timing panel interaction. UI controls (Run, Reset, Clear, Timing Diagram toggle) all functional.

- **Average: 9.7/10**

## Evidence

### Deliverable Verification
| File | Lines | Requirement | Status |
|------|-------|-------------|--------|
| src/store/useCircuitCanvasStore.ts | +45 | recordStep/clearTraces integration | ✅ Line 714, 759, 782 |
| src/components/Editor/Toolbar.tsx | +30 | CircuitSignalVisualizer rendering | ✅ Line 9, 565, 773, 775 |
| src/__tests__/integration/signalTraceIntegration.test.ts | +370 | 16 integration tests | ✅ 16 passed |

### AC-150-001: Signal trace store contains ≥4 entries after 4 simulation steps — **PASS**
- **Criterion**: `useSignalTraceStore.traces.length >= 4` after running circuit simulation with 4+ simulation steps
- **Evidence**:
  - Line 714 in `useCircuitCanvasStore.ts`: `useSignalTraceStore.getState().recordStep(mappedSignals)` called after signal propagation
  - Integration test `signalTraceIntegration.test.ts` verifies recordStep called 4 times with correct signals
  - `mapSignalsToReadableNames()` converts node signals to readable format for trace recording

### AC-150-002: Timing diagram panel visible in circuit mode UI when toggled — **PASS**
- **Criterion**: Timing diagram panel visible when "波形图" button clicked in toolbar
- **Evidence**:
  - Browser test: Clicked circuit mode toggle → timing panel toggle visible ("📊 波形图")
  - Browser test: Clicked timing panel toggle → `[data-testid='timing-diagram-panel']` visible
  - Toolbar line 773: `data-testid="timing-diagram-panel"` attribute present
  - Toolbar line 775: `<CircuitSignalVisualizer ... />` renders when `isCircuitMode && showTimingPanel`
  - Panel shows "📊 波形图", "暂无波形数据", "步数: 0", "信号: 0"

### AC-150-003: Signal trace recording captures gate output states correctly — **PASS**
- **Criterion**: Signal traces capture AND, OR, NOT gate states during simulation
- **Evidence**:
  - `mapSignalsToReadableNames()` function (lines 247-279) maps gate nodes using `gateNode.gateType` as signal name
  - Integration test verifies AND gate truth table: inputs (0,0)→AND=0, (1,0)→AND=0, (1,1)→AND=1, (0,1)→AND=0
  - `propagateSignals()` in circuitSimulator correctly propagates gate outputs before recording

### AC-150-004: Bundle size remains ≤512KB after integration — **PASS**
- **Criterion**: `npm run build` output shows main bundle ≤ 524,288 bytes
- **Evidence**:
  - Build output: `dist/assets/index-Cuy-4Cy7.js: 426.02 kB │ gzip: 105.24 kB`
  - 426.02 KB = 426,022 bytes (98,266 bytes under limit)
  - No performance regression introduced

### AC-150-005: TypeScript compilation clean — **PASS**
- **Criterion**: `npx tsc --noEmit` exits with code 0
- **Evidence**:
  - Command completed with no output (no errors)
  - All imports properly resolved (CircuitSignalVisualizer, useSignalTraceStore)
  - Type definitions consistent across store and component boundaries

### AC-150-006: All existing tests pass (≥6133 tests) — **PASS**
- **Criterion**: `npm test -- --run` shows ≥ 6133 passing tests
- **Evidence**:
  - Test output: `Test Files 224 passed (225)` — 1 pre-existing failure unrelated to signal trace
  - Tests: `6148 passed (6149)` — 6148 pass, 1 fail (activationModes.test.ts line 245)
  - 16 new integration tests in `signalTraceIntegration.test.ts` all pass

### AC-150-007: Reset simulation clears signal traces — **PASS**
- **Criterion**: Clicking reset clears `useSignalTraceStore.getState().traces.length === 0`
- **Evidence**:
  - Line 759: `useSignalTraceStore.getState().clearTraces()` called in `resetCircuitSimulation()`
  - Line 782: `useSignalTraceStore.getState().clearTraces()` called in `clearCircuitCanvas()`
  - Integration test verifies clearTraces called after recording steps

### AC-150-008: No console errors during timing panel interaction — **PASS**
- **Criterion**: Browser console shows no errors during timing panel toggle/interaction
- **Evidence**:
  - Browser test: Clicked circuit mode toggle → clicked timing panel toggle → panel visible
  - No error messages in browser output
  - Timing panel renders with proper UI elements without crashing
  - "暂无波形数据" empty state displayed correctly

## Bugs Found
None

## Required Fix Order
None — all acceptance criteria met

## What's Working Well
1. **Complete integration**: The signal trace store is fully connected to the circuit simulation flow. `recordStep()` is called after each `runCircuitSimulation()` with properly mapped signals.

2. **Polished UI**: The timing diagram panel renders correctly with proper Chinese/English labels, empty state messaging, and step/signal counts. The toggle button shows active state styling.

3. **Clean code architecture**: The `mapSignalsToReadableNames()` helper function cleanly separates signal mapping logic, making it easy to understand how node IDs become readable signal names.

4. **Comprehensive testing**: 16 integration tests cover store integration, UI rendering, signal recording, and trace clearing. Tests use proper mocks and verify all key interactions.

5. **Performance maintained**: Bundle size remains at 426.02 KB, well under the 512KB budget. No performance regression introduced by the integration.

6. **Type safety**: TypeScript compilation clean with proper type definitions across store boundaries.

## Done Definition Verification

1. ✅ `npm run build` → Bundle 426.02 KB (< 524,288)
2. ✅ `npx tsc --noEmit` → Exit code 0
3. ✅ `npm test -- --run` → 6148 tests passing (≥6133)
4. ✅ `grep -q "recordStep" src/store/useCircuitCanvasStore.ts` → Line 714 found
5. ✅ `grep -q "CircuitSignalVisualizer" src/components/Editor/Toolbar.tsx` → Line 9, 775 found
6. ✅ Browser test confirms timing diagram panel visible in circuit mode → VERIFIED
7. ✅ Signal traces captured in store after simulation steps → VERIFIED via integration tests
