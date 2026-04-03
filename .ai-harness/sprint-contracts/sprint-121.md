# Sprint Contract — Round 121

## APPROVED

## Scope

**Focus: Circuit Simulation Engine**

This sprint implements the core circuit simulation functionality - adding logic gate components (AND, OR, NOT, XOR, NAND, NOR, XNOR) with actual boolean logic evaluation and signal propagation visualization. This transforms the canvas from a visual editor into a functional circuit simulator.

## Spec Traceability

### P0 Items (Must Complete)
- **Logic Gate Components**: Add 7 logic gate types with proper boolean logic
- **Circuit Evaluation Engine**: BFS-based signal propagation through connected gates
- **Input/Output Nodes**: Input toggles and output indicators for circuit testing

### P1 Items (Should Complete)
- **Signal Visualization**: Visual feedback for HIGH/LOW signal states on wires
- **Propagation Timing**: Sequential evaluation with visual delay effects
- **State Reset**: Ability to reset all inputs and clear simulation state

### P2 Items (Intentionally Deferred)
- Sequential logic (flip-flops, latches, counters)
- Timing diagrams
- Multi-bit buses
- Custom sub-circuit modules

## Deliverables

### 1. New Component Files
- `src/components/Circuit/Gates.tsx` - Logic gate SVG components (AND, OR, NOT, XOR, NAND, NOR, XNOR)
- `src/components/Circuit/InputNode.tsx` - Toggle input component with HIGH/LOW states
- `src/components/Circuit/OutputNode.tsx` - LED output indicator component
- `src/components/Circuit/SimulationPanel.tsx` - Simulation controls (Run/Reset/Step buttons)

### 2. Simulation Engine
- `src/engine/circuitSimulator.ts` - Core BFS evaluation engine with gate truth tables
- `src/hooks/useCircuitSimulation.ts` - React hook for simulation state management
- `src/store/useSimulationStore.ts` - Zustand store for simulation state (HIGH/LOW signals, gate outputs)

### 3. Test Files
- `src/engine/__tests__/circuitSimulator.test.ts` - Logic gate truth table verification
- `src/components/Circuit/__tests__/Gates.test.tsx` - Gate component rendering and labels
- `src/components/Circuit/__tests__/InputNode.test.tsx` - InputNode toggle behavior and state persistence
- `src/components/Circuit/__tests__/OutputNode.test.tsx` - OutputNode LED state display
- `src/components/Circuit/__tests__/SimulationPanel.test.tsx` - Panel controls functionality

### 4. Type Definitions
- `src/types/circuit.ts` - SignalState, GateType, SimulationState, CircuitNode types

## Acceptance Criteria

### AC-121-001: Logic Gates Render Correctly
**Statement**: Seven logic gate components (AND, OR, NOT, XOR, NAND, NOR, XNOR) render with correct visual appearance and display their type label.

**Test Method**: 
```bash
npm test -- src/components/Circuit/__tests__/Gates.test.tsx --run
```
Verify all 7 gate types render with correct SVG shapes and type labels visible in the rendered output.

---

### AC-121-002: AND Gate Truth Table
**Statement**: AND gate evaluates boolean inputs correctly: outputs HIGH only when all inputs are HIGH.

**Test Method**:
```bash
npm test -- src/engine/__tests__/circuitSimulator.test.ts --run
```
Assert all 4 input combinations return expected outputs:
- [false, false] → false
- [false, true] → false
- [true, false] → false
- [true, true] → true

---

### AC-121-003: OR Gate Truth Table
**Statement**: OR gate evaluates boolean inputs correctly: outputs HIGH when any input is HIGH.

**Test Method**:
```bash
npm test -- src/engine/__tests__/circuitSimulator.test.ts --run
```
Assert all 4 input combinations return expected outputs:
- [false, false] → false
- [false, true] → true
- [true, false] → true
- [true, true] → true

---

### AC-121-004: NOT Gate Truth Table
**Statement**: NOT gate inverts input signal correctly.

**Test Method**:
```bash
npm test -- src/engine/__tests__/circuitSimulator.test.ts --run
```
Assert both input combinations return expected outputs:
- [false] → true
- [true] → false

---

### AC-121-005: XOR Gate Truth Table
**Statement**: XOR gate outputs HIGH when inputs differ.

**Test Method**:
```bash
npm test -- src/engine/__tests__/circuitSimulator.test.ts --run
```
Assert all 4 input combinations return expected outputs:
- [false, false] → false
- [false, true] → true
- [true, false] → true
- [true, true] → false

---

### AC-121-006: NAND Gate Truth Table
**Statement**: NAND gate outputs LOW only when all inputs are HIGH (inverted AND).

**Test Method**:
```bash
npm test -- src/engine/__tests__/circuitSimulator.test.ts --run
```
Assert all 4 input combinations return expected outputs:
- [false, false] → true
- [false, true] → true
- [true, false] → true
- [true, true] → false

---

### AC-121-007: NOR Gate Truth Table
**Statement**: NOR gate outputs HIGH only when all inputs are LOW (inverted OR).

**Test Method**:
```bash
npm test -- src/engine/__tests__/circuitSimulator.test.ts --run
```
Assert all 4 input combinations return expected outputs:
- [false, false] → true
- [false, true] → false
- [true, false] → false
- [true, true] → false

---

### AC-121-008: XNOR Gate Truth Table
**Statement**: XNOR gate outputs HIGH when inputs are the same (inverted XOR).

**Test Method**:
```bash
npm test -- src/engine/__tests__/circuitSimulator.test.ts --run
```
Assert all 4 input combinations return expected outputs:
- [false, false] → true
- [false, true] → false
- [true, false] → false
- [true, true] → true

---

### AC-121-009: Circuit Propagation with BFS
**Statement**: When gates are connected and simulation runs, signals propagate correctly through the circuit from inputs to outputs using BFS evaluation order.

**Test Method**:
```bash
npm test -- src/engine/__tests__/circuitSimulator.test.ts --run
```
Verify multi-gate circuit evaluation:
1. Create circuit: Input1 → AND → NOT → Output
2. Set Input1 to true
3. Run simulation
4. Assert: AND outputs true, NOT outputs false, Output receives false
5. Set Input1 to false
6. Run simulation
7. Assert: AND outputs false, NOT outputs true, Output receives true

**Negative Assertion**: Simulation should not crash or produce undefined when gates are unconnected.

---

### AC-121-010: InputNode Toggle Behavior
**Statement**: InputNode component toggles between HIGH and LOW on click, displays current state visually, and persists state correctly.

**Test Method**:
```bash
npm test -- src/components/Circuit/__tests__/InputNode.test.tsx --run
```
Verify stateful UI behavior:
1. **Entry**: Render InputNode with initial state (default LOW)
2. **First Click**: Toggle to HIGH, verify state changes
3. **Visual Feedback**: Verify HIGH state is visually distinct (color/glow)
4. **Second Click**: Toggle back to LOW, verify state changes
5. **Repeat**: Click multiple times, state should toggle each time
6. **Negative Assertion**: State should not revert spontaneously; clicking rapidly should not cause undefined behavior

---

### AC-121-011: OutputNode LED Display
**Statement**: OutputNode displays current signal state with visual indicators (HIGH=green LED, LOW=gray/off LED).

**Test Method**:
```bash
npm test -- src/components/Circuit/__tests__/OutputNode.test.tsx --run
```
Verify visual states:
1. **Entry**: Render OutputNode with initial signal (default LOW)
2. **LOW State**: Verify LED appears off/gray
3. **Signal HIGH**: Update signal to HIGH
4. **HIGH State**: Verify LED is green/lit
5. **Signal LOW**: Update signal to LOW
6. **Back to LOW**: Verify LED returns to off/gray
7. **Negative Assertion**: LED should not remain in previous state after signal changes

---

### AC-121-012: SimulationPanel Controls
**Statement**: SimulationPanel has Run and Reset buttons that control circuit evaluation with correct behavior.

**Test Method**:
```bash
npm test -- src/components/Circuit/__tests__/SimulationPanel.test.tsx --run
```
Verify UI controls:
1. **Entry**: Render SimulationPanel with Run and Reset buttons
2. **Run Button**: Click Run, verify simulation starts/is triggered
3. **Reset Button**: Click Reset, verify simulation state clears
4. **Repeat**: Click Run again, verify simulation restarts
5. **Run After Reset**: Reset then Run should evaluate fresh
6. **Negative Assertion**: Buttons should not crash when clicked with no circuit loaded

---

### AC-121-013: Regression Test
**Statement**: All 5009+ existing tests pass (baseline from Round 120 plus any new tests added); no regression in functionality.

**Test Method**:
```bash
npm test -- --run 2>&1 | tail -15
```
Verify:
- Test count ≥ 5009 (baseline 5009 + new tests from this sprint)
- All tests pass with 0 failures
- No test suite crashes

---

### AC-121-014: Bundle Size
**Statement**: Main bundle remains ≤512KB after adding simulation components.

**Test Method**:
```bash
npm run build 2>&1 | grep -E "(index-.*\.js|Size:)"
```
Verify bundle size under 512KB limit. Report any single chunk exceeding 512KB.

---

### AC-121-015: TypeScript Compilation
**Statement**: TypeScript compiles with 0 errors after adding circuit simulation types.

**Test Method**:
```bash
npx tsc --noEmit 2>&1 | head -20
```
Verify:
- No TypeScript errors in new circuit simulation files
- All type definitions in `src/types/circuit.ts` are valid

---

### AC-121-016: Build Success
**Statement**: Production build completes with 0 errors.

**Test Method**:
```bash
npm run build 2>&1 | grep -E "(error|Error|ERROR)" | grep -v "warning"
```
Verify build exits with code 0 and no error messages.

---

## Test Methods

### Logic Gate Unit Tests
1. Create test cases for each gate type covering all input combinations (2-input gates: 4 combos, NOT: 2 combos)
2. Run: `npm test -- src/engine/__tests__/circuitSimulator.test.ts --run`
3. Assert each gate's evaluateGate(gateType, inputs) returns correct boolean

### Component Rendering Tests
1. Test each gate component renders correct SVG shape with type label
2. Test InputNode renders with initial state indicator
3. Test OutputNode renders with initial LED state
4. Test SimulationPanel renders with all control buttons

### Stateful UI Tests (InputNode Toggle)
1. **Mount**: Component renders with default LOW state
2. **Toggle HIGH**: Click toggles state to HIGH, verify internal state changes
3. **Toggle LOW**: Click toggles state to LOW, verify internal state changes
4. **Persistence**: State persists across renders
5. **Rapid Clicks**: Multiple rapid clicks should toggle correctly without crash
6. **Negative**: State should not become null/undefined during toggle

### Stateful UI Tests (SimulationPanel)
1. **Mount**: Panel renders with Run and Reset buttons enabled
2. **Run Click**: Verify Run action is triggered (mock/spy verification)
3. **Reset Click**: Verify Reset action is triggered
4. **Run After Reset**: Verify clean re-evaluation starts
5. **No Circuit**: Clicking buttons with no circuit should not crash (negative assertion)

### Integration Tests (Circuit Propagation)
1. Create simple circuit: InputNode → AND Gate → OutputNode
2. Set InputNode to [true, true], click Run
3. Assert OutputNode shows HIGH (green)
4. Set InputNode to [true, false], click Run
5. Assert OutputNode shows LOW (gray)
6. Click Reset, verify all states cleared

### Performance Tests
1. Run `npm run build`
2. Verify bundle size ≤ 512KB
3. Run `npx tsc --noEmit`
4. Verify 0 TypeScript errors

## Risks

### Risk 1: Connection System Integration
**Description**: The existing connection system uses a generic port model. Logic gates need specific input/output port handling.

**Mitigation**: Design gate ports to be compatible with existing Connection type; use PortType enum.

**Impact**: Medium - may require interface adapters if types don't align perfectly.

### Risk 2: Cycle Detection
**Description**: Circular connections can cause infinite loops in BFS propagation.

**Mitigation**: Implement visited set in BFS to detect and skip already-processed nodes; add validation warning for cycles.

**Impact**: Low - standard graph traversal concern with known solution.

### Risk 3: Port Matching
**Description**: Existing modules may have inconsistent port configurations.

**Mitigation**: Use MODULE_PORT_CONFIGS from types; add fallback for missing configs.

**Impact**: Low - existing system already handles this.

## Failure Conditions

The following conditions mean the sprint MUST fail:

1. **Truth table test fails**: Any logic gate boolean output is incorrect
2. **Circuit propagation test fails**: Signals don't flow correctly through connected gates
3. **InputNode toggle fails**: State does not change on click, or state becomes undefined
4. **OutputNode display fails**: LED does not reflect signal state correctly
5. **Existing tests regress**: Any of the baseline 5009 tests fail
6. **Bundle size exceeds 512KB**: Performance requirement violated
7. **TypeScript compilation errors**: Type definitions are incorrect or missing
8. **Build fails**: Production build exits with errors

## Done Definition

All of the following MUST be true before claiming round complete:

1. ✅ Seven logic gate types (AND, OR, NOT, XOR, NAND, NOR, XNOR) implemented with correct truth tables
2. ✅ All 7 gates pass unit tests with 4-combination (or 2-combination for NOT) truth table verification
3. ✅ Circuit simulation engine uses BFS propagation through connected gates
4. ✅ BFS cycle detection implemented to prevent infinite loops
5. ✅ InputNode toggles HIGH/LOW state on click with visual feedback
6. ✅ InputNode state toggles correctly on repeated clicks (at least 5 toggles tested)
7. ✅ OutputNode displays signal state visually (green=HIGH, gray=LOW)
8. ✅ SimulationPanel has Run and Reset buttons that trigger correct actions
9. ✅ All new logic gate tests pass (≥50 tests expected for gates, inputs, outputs, panel)
10. ✅ All 5009+ existing tests pass (no regression)
11. ✅ Bundle size ≤512KB
12. ✅ TypeScript compiles with 0 errors
13. ✅ Build succeeds with 0 errors

## Out of Scope

The following are explicitly NOT included in this sprint:

- **Flip-flops, latches, memory elements** - Sequential logic deferred to future sprint
- **Timing diagrams** - Visualization deferred
- **Multi-bit buses or vectors** - Single-bit signals only
- **Custom sub-circuits** - Module encapsulation deferred
- **Clock signals or oscillators** - Timing-based features deferred
- **Existing module types** (ArcaneMatrix, EtherInfusion, etc.) - Not converted to logic gates
- **Challenge mode puzzles** - Game mode features deferred
- **Tech tree unlock system** - Progression deferred
- **Community gallery** - Already implemented in prior rounds
- **Exchange/trade system** - Already implemented in round 120
- **Canvas integration of simulation** - Gate placement on canvas deferred to next sprint
- **Wire signal visualization** - Wire color/glow for HIGH/LOW deferred to P1
- **Step-by-step debugging** - Single-step evaluation deferred
