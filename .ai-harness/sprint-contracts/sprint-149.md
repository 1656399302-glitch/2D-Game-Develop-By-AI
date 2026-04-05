# Sprint Contract — Round 149

## Scope

Implement a **Circuit Signal Visualization** system with a timing diagram component that displays signal traces over time during circuit simulation. This enhancement allows users to observe signal propagation through gates and sequential elements.

**Regression Prevention**: All existing functionality (6078 tests, bundle ≤512KB, TypeScript clean) must remain intact. No breaking changes to existing components, stores, or APIs.

## Spec Traceability

- **P0 (Must Have) for this round:**
  - Circuit simulation visualization (`spec.md`: "Circuit validation and simulation")
  - Multi-layer support for complex circuits (`spec.md`: "Multi-layer support")

- **P1 (Should Have) for this round:**
  - Timing diagram component with signal traces
  - Waveform rendering for input/output signals
  - Step-by-step simulation visualization

- **Remaining P0/P1 after this round:**
  - Real-time signal capture during live/continuous simulation (P1, deferred to Round 150+)
  - Complex multi-bit/bus signal visualization (P1, deferred to Round 150+)

- **P2 (Intentional Defer):**
  - Export timing diagrams as image files
  - Zoom/pan controls on timing diagram
  - Signal annotation and measurement cursors

## Deliverables

1. **`src/components/Circuit/TimingDiagram.tsx`** — SVG-based timing diagram component (≥50 lines, exports React component)
2. **`src/hooks/useSignalTrace.ts`** — Hook to capture and store signal history during simulation (exports `useSignalTrace` hook)
3. **`src/store/signalTraceStore.ts`** — Zustand store for signal trace data (exports `useSignalTraceStore`)
4. **`src/components/Circuit/TimingDiagramPanel.tsx`** — Panel component integrating timing diagram into UI (≥20 lines)
5. **`src/components/Circuit/CircuitSignalVisualizer.tsx`** — Integration point with existing SimulationPanel (≥20 lines)
6. **`src/__tests__/components/TimingDiagram.test.tsx`** — Unit tests for TimingDiagram component
7. **`src/__tests__/store/signalTraceStore.test.ts`** — Unit tests for signal trace store

## Acceptance Criteria

1. **AC-149-001**: TimingDiagram renders signal waveforms for at least 4 time steps when simulation runs
   - **Criterion**: After running simulation with 2 input nodes and 1 AND gate, timing diagram shows 4+ time step rows with distinct signal values
   - **Assertion**: Signal trace store contains ≥4 entries after 4 simulation steps

2. **AC-149-002**: Signal states correctly displayed with specified colors
   - **Criterion**: HIGH signals render with `fill="#22c55e"`, LOW signals render with `fill="#64748b"`
   - **Assertion**: SVG waveform elements match color specification exactly

3. **AC-149-003**: TimingDiagram shows gate outputs propagating correctly
   - **Criterion**: AND gate output correctly shows HIGH only when both inputs are HIGH
   - **Assertion**: Signal trace for AND gate shows correct boolean output at each step

4. **AC-149-004**: Panel displays in simulation UI without breaking existing layout
   - **Criterion**: TimingDiagramPanel renders without console errors when integrated into simulation flow
   - **Assertion**: No `console.error` calls during render; panel visible in DOM

5. **AC-149-005**: Bundle size remains ≤512KB after addition
   - **Criterion**: `npm run build` output shows `dist/assets/index-*.js` ≤ 524,288 bytes
   - **Assertion**: Main chunk size ≤ 524,288 bytes

6. **AC-149-006**: TypeScript compilation clean
   - **Criterion**: `npx tsc --noEmit` exits with code 0
   - **Assertion**: Zero TypeScript errors

7. **AC-149-007**: Test suite ≥6078 tests maintained (no regression)
   - **Criterion**: `npm test -- --run` outputs ≥6078 tests passing with 0 failures
   - **Assertion**: Test count ≥6078, exit code 0

8. **AC-149-008**: Existing simulation panel continues to function after integration
   - **Criterion**: SimulationPanel renders and responds to simulation controls without errors
   - **Assertion**: SimulationPanel continues to work; simulation results display correctly

## Test Methods

1. **AC-149-001**: 
   - Create mock circuit with 2 inputs (A, B), 1 AND gate
   - Run `propagateSignals()` exactly 4 times via simulation store
   - Call `useSignalTraceStore.getState().getTrace()` 
   - Assert returned array has length ≥ 4
   - Verify each trace entry has `step` index and signal values

2. **AC-149-002**: 
   - Render `TimingDiagram` with fixture data: `[{ step: 1, signals: { A: true, B: false, OUT: false } }]`
   - Use `screen.getAllByRole('graphics-document')` or query SVG by test id
   - Assert elements with HIGH value have `fill="#22c55e"`
   - Assert elements with LOW value have `fill="#64748b"`
   - Fail if any element has incorrect fill color

3. **AC-149-003**: 
   - Create circuit: InputA → AND → Output
   - Set both inputs HIGH, call `runSimulation()` once
   - Query signal trace for AND gate output
   - Assert output is `true`
   - Set InputA LOW while InputB remains HIGH
   - Run simulation again, assert trace shows output `false`

4. **AC-149-004**: 
   - Mount `TimingDiagramPanel` with `render(<TimingDiagramPanel />)`
   - Assert no `console.error` calls (spy on `console.error`)
   - Assert panel text contains "Timing" or "波形" (waveform)
   - Assert panel root element renders without crashing

5. **AC-149-005**: 
   - Run `npm run build`
   - Parse stdout for `dist/assets/index-*.js` line
   - Extract size in bytes (convert KB if needed)
   - Assert size ≤ 524,288 bytes
   - Fail if bundle exceeds limit or build errors occur

6. **AC-149-006**: 
   - Run `npx tsc --noEmit`
   - Assert exit code is exactly 0
   - Fail if any TypeScript errors (including type mismatches, missing types)

7. **AC-149-007**: 
   - Run `npm test -- --run`
   - Parse output for test count
   - Assert test count ≥ 6078
   - Assert 0 failures, 0 skipped (if possible)
   - Fail if count drops below threshold

8. **AC-149-008**: 
   - Mount both `SimulationPanel` and `TimingDiagramPanel` together
   - Simulate user click on simulation "Run" button
   - Assert simulation results appear in SimulationPanel
   - Assert no console errors during entire flow

## Risks

1. **Rendering Performance**: SVG-based timing diagrams with many signals could impact render performance
   - **Mitigation**: Limit to 20 signals max, virtualize list if needed
   - **Risk Level**: Low

2. **Store Integration**: Signal trace store needs to integrate with existing simulation flow
   - **Mitigation**: Create adapter that wraps existing `useSimulationStore` without modification
   - **Risk Level**: Low

3. **Timing Accuracy**: Signal traces need to match actual simulation steps
   - **Mitigation**: Record signals at each `propagateSignals` call, store with step index
   - **Risk Level**: Low

4. **Bundle Size Growth**: New components increase bundle size
   - **Mitigation**: Lazy-load TimingDiagramPanel if not always visible
   - **Risk Level**: Low-Medium

5. **Test Coverage Gap**: New code may not have sufficient unit tests
   - **Mitigation**: Require ≥2 test files for new components (per deliverables)
   - **Risk Level**: Low

## Failure Conditions

The round fails if ANY of the following occur:

1. Bundle size exceeds 524,288 bytes (512KB)
2. TypeScript compilation produces any errors (exit code ≠ 0)
3. Test suite drops below 6078 tests
4. Timing diagram panel causes console errors or crashes during render
5. Signal colors do not match specification (HIGH ≠ `#22c55e` OR LOW ≠ `#64748b`)
6. Existing SimulationPanel breaks after integration (any console errors)
7. Any new test files fail on initial run
8. New files do not exist or are below minimum line counts

## Done Definition

All of the following must be true before claiming round complete:

1. `test -f src/components/Circuit/TimingDiagram.tsx && wc -l src/components/Circuit/TimingDiagram.tsx | awk '{print $1}'` → ≥ 50 lines
2. `test -f src/hooks/useSignalTrace.ts && grep -q "useSignalTrace" src/hooks/useSignalTrace.ts` → 0 exit code
3. `test -f src/store/signalTraceStore.ts && grep -q "useSignalTraceStore" src/store/signalTraceStore.ts` → 0 exit code
4. `test -f src/components/Circuit/TimingDiagramPanel.tsx && wc -l src/components/Circuit/TimingDiagramPanel.tsx | awk '{print $1}'` → ≥ 20 lines
5. `test -f src/components/Circuit/CircuitSignalVisualizer.tsx && wc -l src/components/Circuit/CircuitSignalVisualizer.tsx | awk '{print $1}'` → ≥ 20 lines
6. `test -f src/__tests__/components/TimingDiagram.test.tsx` → file exists
7. `test -f src/__tests__/store/signalTraceStore.test.ts` → file exists
8. `npm run build` → Bundle ≤ 524,288 bytes, no errors
9. `npx tsc --noEmit` → Exit code 0
10. `npm test -- --run` → ≥ 6078 tests passing, 0 failures
11. Browser verification: TimingDiagram renders with colored waveforms, no console errors

## Out of Scope

- Real-time signal capture during continuous/live simulation (only step-by-step)
- Multi-bit/bus signal visualization (single-bit signals only)
- Export timing diagrams as image files
- Zoom/pan controls on timing diagram
- Signal annotation and measurement cursors
- Modification of existing simulation engine logic
- Changes to existing component APIs or store interfaces (new integration only)
- Any changes to existing test files (only additions permitted)
