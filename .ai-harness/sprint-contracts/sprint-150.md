APPROVED

# Sprint Contract — Round 150

## Scope

This sprint completes the Circuit Signal Visualization feature by integrating the existing standalone components (TimingDiagram, TimingDiagramPanel, CircuitSignalVisualizer, signalTraceStore) into the main application UI and connecting them to the circuit simulation flow.

## Spec Traceability

### P0 items covered this round
- **Canvas System - Circuit validation and simulation**: Connect signal trace recording to circuit simulation flow
- **Canvas System - Multi-layer support**: Integration must work correctly with layered circuits

### P1 items covered this round
- **Components - Logic gates visualization**: Signal traces capture AND, OR, NOT, NAND, NOR, XOR, XNOR gate states during simulation

### Remaining P0/P1 after this round
- All P0/P1 items from Round 149 are resolved by this sprint completing the integration

### P2 intentionally deferred
- Real-time signal monitoring during simulation playback
- Export timing diagrams to image/PDF
- Signal trace comparison between simulation runs

## Deliverables

1. **Modified `src/store/useCircuitCanvasStore.ts`**
   - Import `useSignalTraceStore`
   - In `runCircuitSimulation()`, call `useSignalTraceStore.getState().recordStep()` with mapped signals after propagation
   - In `resetCircuitSimulation()`, call `useSignalTraceStore.getState().clearTraces()`

2. **Modified `src/components/Editor/Toolbar.tsx`**
   - Import `CircuitSignalVisualizer` component
   - Add state for timing panel visibility (`showTimingPanel`)
   - Add timing diagram toggle button in circuit simulation controls section
   - Render `CircuitSignalVisualizer` when `isCircuitMode` is true

3. **Modified `src/hooks/useSignalTrace.ts`** (if needed)
   - Ensure hook can work with circuit canvas node structure
   - Map circuit node IDs to readable signal names

4. **New tests in `src/__tests__/integration/signalTraceIntegration.test.ts`**
   - Integration test: Run circuit simulation → verify signalTraceStore contains traces
   - Integration test: Toggle timing panel → verify it renders in circuit mode
   - Integration test: Reset simulation → verify traces are cleared

## Acceptance Criteria

1. **AC-150-001**: `useSignalTraceStore.traces.length >= 4` after running circuit simulation with 4+ simulation steps (toggling inputs 4 times)
   - Verifiable by: Running circuit simulation, checking `useSignalTraceStore.getState().traces.length`

2. **AC-150-002**: Timing diagram panel visible in circuit mode UI when toggled
   - Verifiable by: Clicking "波形图" button in toolbar, confirming panel renders with `data-testid="timing-diagram-panel"`

3. **AC-150-003**: Signal trace recording captures gate output states correctly
   - Verifiable by: Running simulation with AND gate, both inputs HIGH, checking trace shows AND output HIGH

4. **AC-150-004**: Bundle size remains ≤512KB after integration
   - Verifiable by: `npm run build` output

5. **AC-150-005**: TypeScript compilation clean
   - Verifiable by: `npx tsc --noEmit` exits with code 0

6. **AC-150-006**: All existing tests pass (≥6133 tests)
   - Verifiable by: `npm test -- --run`

7. **AC-150-007**: Reset simulation clears signal traces
   - Verifiable by: Running simulation, clicking reset, checking `useSignalTraceStore.getState().traces.length === 0`

8. **AC-150-008**: No console errors during timing panel interaction
   - Verifiable by: Browser test with console monitoring

## Test Methods

1. **Store Integration Test (AC-150-001, AC-150-003, AC-150-007)**:
   - Create circuit with 2 inputs + 1 AND gate + 1 output
   - Toggle inputs: (0,0) → (1,0) → (1,1) → (0,1) = 4 simulation steps
   - Call `useSignalTraceStore.getState().getTrace()` → expect length >= 4
   - Call `resetCircuitSimulation()`
   - Call `useSignalTraceStore.getState().getTrace()` → expect length === 0

2. **UI Integration Test (AC-150-002, AC-150-008)**:
   - Mount app with circuit mode
   - Click timing diagram toggle button
   - Query `document.querySelector('[data-testid="timing-diagram-panel"]')` → expect not null
   - Check browser console for errors → expect none

3. **Build Verification**:
   - Run `npm run build`
   - Check output bundle ≤ 512KB

4. **TypeScript Verification**:
   - Run `npx tsc --noEmit`
   - Expect exit code 0

5. **Test Suite Verification**:
   - Run `npm test -- --run`
   - Expect ≥6133 tests passing

## Risks

1. **Store import circular dependency**: `useCircuitCanvasStore` imports from `signalTraceStore` - verify no circular dependency issues
   - Mitigation: Import at function level, not module level if needed

2. **Signal name mapping mismatch**: Circuit nodes use IDs, TimingDiagram expects readable names
   - Mitigation: Map node IDs to labels or "Node-{type}-{index}" format in recordStep

3. **Zustand subscription overhead**: Signal trace recording on every simulation step may cause performance issues
   - Mitigation: Only record when recording is enabled, use shallow equality checks

## Failure Conditions

1. Bundle size exceeds 512KB
2. TypeScript compilation errors
3. Existing test suite falls below 6133 tests
4. Signal trace store remains empty after running 4+ simulation steps
5. Timing diagram panel not rendered in circuit mode UI
6. Console errors during timing panel interaction

## Done Definition

All of the following must be true:

1. `npm run build` succeeds with bundle ≤ 512KB
2. `npx tsc --noEmit` exits with code 0
3. `npm test -- --run` shows ≥ 6133 passing tests
4. `grep -q "recordStep" src/store/useCircuitCanvasStore.ts` succeeds (store integration exists)
5. `grep -q "CircuitSignalVisualizer" src/components/Editor/Toolbar.tsx` succeeds (UI integration exists)
6. Browser test confirms timing diagram panel visible in circuit mode
7. Signal traces captured in store after simulation steps

## Out of Scope

- Real-time signal monitoring during continuous simulation playback
- Timing diagram export functionality
- Signal comparison between simulation runs
- Performance optimization for large circuits (>100 nodes)
- Signal trace persistence across page reloads
