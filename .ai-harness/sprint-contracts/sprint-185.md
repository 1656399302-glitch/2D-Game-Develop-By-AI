APPROVED

# Sprint Contract — Round 185

## Scope

Remediation sprint to fix a single critical bug identified in Round 184 QA evaluation. The `resetCircuitSimulation` method does not reset `simulationStatus` to 'idle', causing the SimulationPanel to display incorrect "running" status after clicking the Reset button.

## Spec Traceability

### P0 items covered this round
- [FIX] `resetCircuitSimulation` in `src/store/useCircuitCanvasStore.ts` must set `simulationStatus: 'idle'` to complete the reset cycle

### P1 items covered this round
- None — remediation only

### Remaining P0/P1 after this round
- None — all P0/P1 work from previous rounds is complete; this is a targeted bug fix

### P2 intentionally deferred
- No P2 work in scope

## Deliverables

1. **`src/store/useCircuitCanvasStore.ts`** — Modified `resetCircuitSimulation` method with `simulationStatus: 'idle'` added to the set() call (around line 854-873)

## Acceptance Criteria

1. **AC-185-001**: After clicking `[data-reset-button]`, the simulation status transitions from "运行中" (running) to "待机" (idle)
2. **AC-185-002**: `simulationStatus` is explicitly set to 'idle' within the `resetCircuitSimulation` set() callback in `src/store/useCircuitCanvasStore.ts`
3. **AC-185-003**: TypeScript compiles without errors after the fix
4. **AC-185-004**: All tests in the full test suite continue to pass
5. **AC-185-005**: After Reset, status should NOT remain "运行中" (running) — negative assertion
6. **AC-185-006**: Reset can be triggered multiple times without crashing or leaving status in invalid state

## Test Methods

### AC-185-001 (Browser verification — Entry → Running → Reset → Idle)
1. Open browser, navigate to app
2. Click `[data-testid="nav-simulation"]` to open panel — **verify** `[data-testid="simulation-panel"]` is visible
3. Verify `[data-status]` shows "待机" (idle) initially
4. Click `[data-run-button]` — **verify** `[data-status]` changes to "运行中" (running)
5. Click `[data-reset-button]` — **verify** `[data-status]` changes to "待机" (idle)
6. **Entry condition met**: Panel opened successfully
7. **Completion condition met**: Reset button clicked
8. **Final usable state**: Status shows "待机"

### AC-185-002 (Code inspection)
1. Open `src/store/useCircuitCanvasStore.ts`
2. Navigate to `resetCircuitSimulation` method (around line 854-873)
3. **Verify** the set() callback returns an object containing `simulationStatus: 'idle'`
4. **Verify** this is the only location where the reset adds this property

### AC-185-003 (Build verification)
1. Run `npx tsc --noEmit`
2. **Verify** exit code 0 with 0 errors
3. **Verify** no TypeScript warnings related to the fix

### AC-185-004 (Test suite verification)
1. Run `npm test -- --run`
2. **Verify** all tests pass (expected: 7490 tests, 258 test files)
3. **Verify** no regressions in SimulationPanel tests

### AC-185-005 (Negative assertion — Status should NOT remain running)
1. Perform full sequence from AC-185-001 steps 1-5
2. **Assert**: `[data-status]` does NOT contain "运行中" after Reset
3. **Assert**: `[data-status]` shows "待机" after Reset
4. **Assert**: No console errors during or after Reset

### AC-185-006 (Repeat/Retry — Multiple Reset cycles)
1. Open panel via `[data-testid="nav-simulation"]`
2. Click `[data-run-button]` → status is "运行中"
3. Click `[data-reset-button]` → status is "待机"
4. **Repeat** Run → Reset cycle 3 times total
5. **Verify** status transitions correctly on each cycle
6. **Verify** status never stuck in "running" after any Reset
7. **Assert**: Final state is "待机" (idle)

### AC-185-007 (Keyboard shortcut X=Reset)
1. Open panel via `[data-testid="nav-simulation"]`
2. Ensure no input elements are focused (click panel background if needed)
3. Click `[data-run-button]` → status is "运行中"
4. Press 'x' key — **verify** `[data-status]` changes to "待机"
5. **Assert**: Same behavior as clicking `[data-reset-button]`

## Risks

1. **Low risk**: This is a single-line fix adding one property assignment
2. **Verification risk**: Minimal — directly testable via browser interaction
3. **Regression risk**: Very low — only touches one store action, no side effects expected

## Failure Conditions

1. After clicking `[data-reset-button]`, `[data-status]` still shows "运行中" (running)
2. `simulationStatus: 'idle'` is not present in the `resetCircuitSimulation` set() callback
3. TypeScript compilation produces any errors
4. Any test in the full suite fails
5. Reset button click causes a crash or console error
6. Multiple Reset cycles cause status to be stuck in invalid state

## Done Definition

All of the following must be true:
- `simulationStatus: 'idle'` is added to the set() call in `resetCircuitSimulation` in `src/store/useCircuitCanvasStore.ts`
- Browser verification confirms Reset button transitions status from "运行中" to "待机" (AC-185-001)
- Browser verification confirms status does NOT remain "运行中" after Reset (AC-185-005)
- Multiple Reset cycles work without crashes or stuck states (AC-185-006)
- `npx tsc --noEmit` exits with code 0
- `npm test -- --run` passes all tests

## Out of Scope

- Any new features or components beyond the single-line fix
- Any UI/styling changes
- Any changes to existing passing functionality
- Bundle size verification (verified under limit in Round 184)
- Testing the stepSimulation functionality (does not exist in store)
- Testing the completed status (not valid per Round 184 contract)
