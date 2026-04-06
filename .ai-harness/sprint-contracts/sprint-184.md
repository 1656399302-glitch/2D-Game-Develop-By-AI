# Sprint Contract — Round 184

> ⚠️ REVISION REQUESTED — See issues below before builder may proceed.

## ⚠️ Critical Corrections Required

### Issue A: `stepSimulation` action does not exist in the store

**Contract says:** Deliverable 1 maps handler to `stepSimulation`; Deliverable 2 wires `onStep ← store's stepSimulation`; AC-184-006 and test method #7 treat Step button as functional.

**Actual store (`src/store/useCircuitCanvasStore.ts`)** has these simulation actions:
- `runSimulation` — sets status to 'running'
- `pauseSimulation` — sets status to 'paused'
- `stopSimulation` — stops simulation, resets signals
- `runCircuitSimulation` — runs full circuit signal propagation
- `resetCircuitSimulation` — resets all signals, clears traces, resets step count

**There is no `stepSimulation` action.**

The SimulationPanel accepts `onStep?` as optional, but the contract requires it to be wired as if it works. Fix: Either (a) add `stepSimulation` to the store first, or (b) update Deliverables, AC-184-006, and test method #7 to explicitly make the Step button a **conditional display** — rendered only if `onStep` is provided, and the test verifies only that the button is conditionally shown (not that stepping actually works in this round).

### Issue B: `completed` is not a valid simulation status

**Contract says:** AC-184-003 requires `[data-status]` to show `completed` with Chinese label `完成`. Done definition item #5 lists `completed` as a valid status.

**Actual store** defines `simulationStatus` as `'idle' | 'running' | 'paused' | 'stopped'`. There is no `completed` value.

Fix: Replace all references to `completed`/`完成` with `stopped`/`已停止`. Update AC-184-003, the Chinese labels, and the done definition accordingly.

### Issue C: `resetSimulation` action does not exist in the store

**Contract says:** Deliverable 1 maps button handler to `resetSimulation`/`stopSimulation`.

**Actual store** has `stopSimulation` and `resetCircuitSimulation` (different actions). Fix: Use `resetCircuitSimulation` (resets all signals and step count) as the Reset handler. `stopSimulation` is a different action — confirm with store author which should be used.

### Issue D: Keyboard shortcut input-focus guard is missing from test method

**Contract says:** Test method #10's negative section states shortcuts must not trigger when input fields are focused. Failure condition #13 requires this behavior.

**Actual test method #10:** Has no verification block for the input-focus guard. Fix: Add Entry/Action/Verification for the negative case — open panel, focus an `<input>` or `<textarea>`, press R and X, verify neither triggers Run/Reset.

---

## Scope

Integration of the existing SimulationPanel component into the main application UI with navigation button in the header, proper state management connecting to the circuit canvas store, and verification that all simulation controls work correctly.

## Spec Traceability

### P0 items covered this round
- SimulationPanel integration into App.tsx with lazy loading
- Navigation button to open/close simulation panel in header
- Simulation controls: Run, Reset, and Step functionality
- State coordination between useCircuitCanvasStore and simulation panel
- data-testid attributes for all interactive elements

### P1 items covered this round
- Simulation status display (idle/running/paused/stopped — see Issue B)
- Step counter display
- Keyboard shortcuts for simulation (R=Run, X=Reset)

### Remaining P0/P1 after this round
- None — SimulationPanel integration completes the circuit simulation system

### P2 intentionally deferred
- TimingAnalysisPanel integration (Round 185+)
- Enhanced timing diagram with cursor-based measurements
- CSV export of timing data

## Deliverables

1. **App.tsx modification**:
   - Add `data-testid="nav-simulation"` button in header with "⚡ 模拟" label
   - Add lazy import of SimulationPanel
   - Add `showSimulation` state for panel visibility
   - Connect panel to useCircuitCanvasStore:
     - `isRunning` ← store's `isSimulating` OR `simulationStatus === 'running'`
     - `stepCount` ← store's `simulationStepCount`
     - `onRun` ← store's `runSimulation`
     - `onReset` ← store's `resetCircuitSimulation` (see Issue C)
     - `onStep` ← store's `stepSimulation` IF added to store (see Issue A), otherwise omit/undefined
   - Add close button with `data-testid="close-panel"` attribute

2. **src/components/Circuit/SimulationPanel.tsx**: Already exists — verify all props are properly wired:
   - `isRunning` ← store's `isSimulating` or derived from `simulationStatus === 'running'`
   - `onRun` ← store's `runSimulation`
   - `onReset` ← store's `resetCircuitSimulation`
   - `onStep` ← store's `stepSimulation` (if added; optional, see Issue A)
   - `stepCount` ← store's `simulationStepCount`

3. **src/components/Circuit/__tests__/SimulationPanel.test.tsx**: Already exists (30+ tests) — verify all pass

4. **Integration tests in src/__tests__/App.test.ts** (or new file):
   - Nav-simulation button visible and functional
   - Panel open/close/reopen cycle works
   - Close button `[data-testid="close-panel"]` works
   - Simulation state coordination with store
   - Keyboard shortcuts R=Run, X=Reset

## Acceptance Criteria

### Navigation & Panel Display (AC-184-001 to AC-184-002, AC-184-008 to AC-184-009)

1. **AC-184-001**: Navigation button `[data-testid="nav-simulation"]` appears in header with "⚡ 模拟" label (or "⚡ 模拟" text content)

2. **AC-184-002**: Clicking nav-simulation button opens `[data-testid="simulation-panel"]`

3. **AC-184-008**: Panel has close button `[data-testid="close-panel"]` that closes the panel (removes from DOM when `showSimulation` is false)

4. **AC-184-009**: Panel reopens correctly via nav-simulation button after closing

### Simulation Controls (AC-184-003 to AC-184-007)

5. **AC-184-003**: SimulationPanel displays status indicator `[data-status]` with exact values: `idle`/`running`/`paused`/`stopped` (see Issue B). The panel shows Chinese labels: 待机 (idle), 运行中 (running), 已暂停 (paused), 已停止 (stopped)

6. **AC-184-004**: SimulationPanel has Run button `[data-run-button]` that triggers circuit simulation

7. **AC-184-005**: SimulationPanel has Reset button `[data-reset-button]` that resets simulation state

8. **AC-184-006**: SimulationPanel has Step button `[data-step-button]` for single-step simulation. **If `stepSimulation` does not exist in the store**, the Step button is not rendered. If it does exist, it is rendered and functional.

9. **AC-184-007**: Step count `[data-step-count]` displays current simulation step number, defaults to 0 when idle

### Keyboard Shortcuts (AC-184-011)

10. **AC-184-011**: Pressing R key triggers Run when simulation panel is open. Pressing X key triggers Reset when simulation panel is open. Shortcut hint displayed in panel: "快捷键: R = 运行, X = 重置". **Shortcuts must NOT trigger when an `<input>` or `<textarea>` element is focused.**

### Build & Tests (AC-184-010, AC-184-012 to AC-184-013)

11. **AC-184-010**: TypeScript compiles with 0 errors after integration

12. **AC-184-012**: All 30+ SimulationPanel tests pass: `npm test -- --run src/components/Circuit/__tests__/SimulationPanel.test.tsx`

13. **AC-184-013**: Full test suite (7500+ tests) passes with no regressions

14. **AC-184-014**: Bundle size ≤512KB after adding SimulationPanel lazy import. Lazy chunk `SimulationPanel-*.js` exists in `dist/assets/`

## Test Methods

### 1. Navigation Button (AC-184-001)

**Entry**: Application loads with header visible
**Verification**: 
- Find exactly one `[data-testid="nav-simulation"]` button in header
- Verify button text contains "⚡" and "模拟" characters
**Negative**: Button must not appear multiple times; must not have duplicate testid

### 2. Panel Opens (AC-184-002)

**Entry**: Application loads, simulation panel is NOT visible
**Action**: Click `[data-testid="nav-simulation"]`
**Verification**: `[data-testid="simulation-panel"]` appears in DOM and is visible
**Negative**: Panel must not be visible before button click; clicking multiple times must not cause errors

### 3. Close Button (AC-184-008)

**Entry**: Simulation panel is open and visible
**Action**: Click `[data-testid="close-panel"]`
**Verification**: `[data-testid="simulation-panel"]` is removed from DOM or hidden
**Negative**: Panel must not remain visible after close action; close button must not cause errors if clicked multiple times

### 4. Panel Reopens (AC-184-009)

**Entry**: Panel was closed (step 3)
**Action**: Click `[data-testid="nav-simulation"]` again
**Verification**: `[data-testid="simulation-panel"]` is visible again
**Repeat**: Close and reopen 3 times consecutively to verify state management

### 5. Run Button (AC-184-004)

**Entry**: Panel open, simulation idle (`simulationStatus === 'idle'`)
**Action**: Click `[data-run-button]`
**Verification**: 
- Run button click does not throw error
- After click, store `simulationStatus` changes to `'running'`
- Run button becomes disabled while `simulationStatus === 'running'`
**Negative**: Clicking Run must not crash app; clicking Run while already running must not cause errors

### 6. Reset Button (AC-184-005)

**Entry**: Panel open, simulation running (`simulationStatus === 'running'`)
**Action**: Click `[data-reset-button]`
**Verification**:
- Reset button click does not throw error
- After click, store `simulationStatus` changes to `'idle'`
- Step count resets to 0
**Negative**: Reset must not crash app even with empty circuit; clicking Reset while idle must not cause errors

### 7. Step Button (AC-184-006)

**Entry**: Panel open, simulation idle
**Verification**:
- If `stepSimulation` exists in store: Step button `[data-step-button]` is rendered, and clicking it increments step count
- If `stepSimulation` does NOT exist in store: Step button `[data-step-button]` is NOT rendered
**Negative**: App must not crash if step button not rendered; must not crash if step button clicked with empty circuit

### 8. Status Display (AC-184-003)

**Entry**: Panel open
**Verification**: 
- `[data-status]` attribute exists on status indicator element
- Status shows exactly: `idle` when not simulating, `running` during simulation, `paused` when paused, `stopped` when stopped (no `completed`)
- Chinese labels visible: 待机, 运行中, 已暂停, 已停止
**Negative**: Status must not show undefined, null, or `completed` values; must not crash on status transitions

### 9. Step Count Display (AC-184-007)

**Entry**: Panel open, fresh state (no simulation run)
**Verification**: 
- `[data-step-count]` element exists and displays "0" initially
- After running simulation, step count reflects `simulationStepCount` from store
**Negative**: Step count must not display NaN or crash; must display 0 when idle, not crash

### 10. Keyboard Shortcuts (AC-184-011)

**Entry (positive)**: Panel open, focus anywhere in app (but not on input elements)
**Action**: Press R key
**Verification**: Run simulation triggered (same as clicking Run button)
**Action**: Press X key
**Verification**: Reset triggered (same as clicking Reset button)

**Entry (negative)**: Panel open, focus on an `<input>` or `<textarea>` element
**Action**: Press R key
**Verification**: Run is NOT triggered
**Action**: Press X key
**Verification**: Reset is NOT triggered
**Negative (positive case)**: Shortcuts must not cause errors if pressed when panel is closed

### 11. TypeScript Compilation

**Entry**: No code changes
**Command**: `npx tsc --noEmit`
**Verification**: Exit code 0, no errors output to stdout
**Negative**: Any error output means failure

### 12. Component Tests

**Entry**: No code changes, tests must already exist
**Command**: `npm test -- --run src/components/Circuit/__tests__/SimulationPanel.test.tsx`
**Verification**: All 30+ tests pass with 0 failures
**Negative**: Any test failure means failure

### 13. Full Test Suite

**Entry**: No code changes
**Command**: `npm test -- --run`
**Verification**: All test files pass, total count ≥7500 tests
**Negative**: Any regression (tests that previously passed now failing) means failure

### 14. Bundle Size

**Entry**: No build artifacts
**Command**: `npm run build`
**Verification**: 
- Main bundle `dist/assets/index-*.js` ≤ 524,288 bytes (512KB)
- Lazy chunk `dist/assets/SimulationPanel-*.js` exists (proves lazy loading works)
**Negative**: Main bundle >512KB means failure; missing lazy chunk means lazy loading not implemented

## Risks

1. **Integration risk**: SimulationPanel expects different prop signatures than what the store provides
   - **Mitigation**: Map store state to component props: `isRunning={simulationStatus === 'running'}`, `stepCount={simulationStepCount}`. Do NOT assume `stepSimulation` exists until confirmed.

2. **Bundle size risk**: Adding SimulationPanel increases main bundle
   - **Mitigation**: Use React.lazy() for SimulationPanel import; verify ≤512KB and lazy chunk exists

3. **State coordination risk**: Simulation state may not sync correctly between store and panel
   - **Mitigation**: Use Zustand selectors for reactive updates; verify status changes propagate to panel

4. **Keyboard shortcut conflict**: R and X may conflict with other shortcuts or text input
   - **Mitigation**: Only trigger when no input is focused; add guard: `if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return`

5. **Step functionality risk**: `stepSimulation` does not exist in useCircuitCanvasStore
   - **Mitigation**: If `stepSimulation` is not added to the store, conditionally hide the Step button. Do NOT wire a non-existent action.

## Failure Conditions

The sprint fails if ANY of the following occur:

1. TypeScript compilation produces errors (non-zero exit code or error output)
2. Main bundle exceeds 512KB (524,288 bytes)
3. Lazy chunk `SimulationPanel-*.js` does not exist in dist/assets/
4. Any existing test fails (regression)
5. SimulationPanel tests fail
6. Navigation button `[data-testid="nav-simulation"]` missing or non-functional
7. Panel does not render with `[data-testid="simulation-panel"]`
8. Close button `[data-testid="close-panel"]` missing or non-functional
9. Run/Reset buttons missing data-testid attributes (`[data-run-button]`, `[data-reset-button]`)
10. Status indicator missing `[data-status]` attribute
11. Step count missing `[data-step-count]` attribute
12. Keyboard shortcuts (R/X) not functional when panel is open
13. Keyboard shortcuts trigger when input fields or text areas are focused
14. `[data-status]` shows `completed` value (store does not produce this — use `stopped`)

## Done Definition

All of the following must be TRUE before the builder may claim the round complete:

- [ ] `[data-testid="nav-simulation"]` button visible in header with "⚡ 模拟" label
- [ ] `[data-testid="simulation-panel"]` renders when button clicked
- [ ] `[data-testid="close-panel"]` closes panel when clicked
- [ ] Run button `[data-run-button]` present and triggers `runSimulation`
- [ ] Reset button `[data-reset-button]` present and triggers `resetCircuitSimulation`
- [ ] Step button `[data-step-button]` — rendered ONLY if `stepSimulation` exists in store; NOT rendered if it does not
- [ ] Status indicator `[data-status]` visible with current simulation state: `idle`/`running`/`paused`/`stopped` (no `completed`)
- [ ] Step count `[data-step-count]` displays correctly (0 when idle)
- [ ] Panel reopens correctly after closing
- [ ] Keyboard shortcuts R=Run, X=Reset functional when panel open
- [ ] Keyboard shortcuts do NOT trigger when input fields or text areas are focused
- [ ] TypeScript 0 errors
- [ ] Bundle size ≤512KB
- [ ] Lazy chunk `SimulationPanel-*.js` exists in dist/assets/
- [ ] 30+ SimulationPanel tests pass
- [ ] Full test suite (7500+ tests) passes with no regressions

## Out of Scope

- TimingAnalysisPanel integration (separate feature in Round 185+)
- Enhanced timing diagram components
- CSV export functionality
- Circuit challenge validation (already implemented)
- CounterPanel modifications (completed in Round 183)
- RecipePanel modifications (completed in Round 182)
- Changes to circuit simulation engine logic (already implemented)
- Changes to circuit canvas rendering
- Mobile layout modifications for SimulationPanel
- Adding `stepSimulation` to the store (must be handled in a prior/separate round if needed)
