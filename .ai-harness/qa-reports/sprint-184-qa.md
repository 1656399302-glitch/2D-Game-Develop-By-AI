# QA Evaluation — Round 184

## Release Decision
- **Verdict:** FAIL
- **Summary:** Integration sprint has a critical functional bug where `resetCircuitSimulation` does not reset `simulationStatus` to 'idle', causing the panel to display "running" status after clicking the Reset button. All other acceptance criteria pass, but this broken core path fails the round.
- **Spec Coverage:** FULL — All contract deliverables implemented
- **Contract Coverage:** FAIL — 13/14 ACs verified, but AC-184-005 has broken behavior
- **Build Verification:** PASS — Bundle 488.15 KB < 512 KB, TypeScript 0 errors
- **Browser Verification:** PARTIAL — Most features work, but Reset button doesn't update status
- **Placeholder UI:** NONE
- **Critical Bugs:** 1
- **Major Bugs:** 0
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 13/14
- **Untested Criteria:** 0

## Blocking Reasons
1. **CRITICAL BUG**: `resetCircuitSimulation` does not set `simulationStatus: 'idle'`. After clicking the Reset button `[data-reset-button]`, the simulation panel continues to display "▶ 运行中" (running) instead of returning to "⏸ 待机" (idle). The status should be reset along with the circuit state. This violates AC-184-005's expected behavior of a complete reset cycle.

## Scores
- **Feature Completeness: 9/10** — All contract deliverables implemented: SimulationPanel lazy loading, nav-simulation button with correct label, panel open/close/reopen cycle, all data-testid attributes present, keyboard shortcuts implemented with input-focus guard, status display, step count display. Missing: proper Reset status transition.
- **Functional Correctness: 8/10** — Run button works correctly (changes status to 'running'). Keyboard shortcuts R=Run and X=Reset work correctly. Input-focus guard works correctly. However, Reset button does NOT reset `simulationStatus` to 'idle', leaving the panel in incorrect state. The Reset button physically triggers `resetCircuitSimulation` but the UI status doesn't update.
- **Product Depth: 9/10** — SimulationPanel provides comprehensive controls: status indicator with color-coded states (idle/running/paused/stopped), step counter, keyboard shortcut hints in Chinese, close button, proper Chinese localization throughout.
- **UX / Visual Quality: 9/10** — Panel renders with proper dark theme styling, cyan/red/purple button variants, animated status dot, consistent spacing and typography. Close/reopen cycle works smoothly.
- **Code Quality: 9/10** — TypeScript compiles without errors (0 errors). All components properly typed. All required data-testid attributes present. Proper use of React.lazy() for lazy loading. Keyboard handler has proper input-focus guard.
- **Operability: 9/10** — All verification commands execute successfully. Bundle size 488.15 KB with 36+ KB margin under 512 KB limit. SimulationPanel lazy loaded as separate 5.84 KB chunk. All 7490 tests in full suite pass.

- **Average: 8.8/10** (FAILS threshold due to critical bug)

## Evidence

### 1. AC-184-001: Navigation Button ✅ PASS
- **Browser Test:** `[data-testid="nav-simulation"]` button visible in header with "⚡ 模拟" label
- **Result:** Button renders correctly with ⚡ and 模拟 text content
- **Evidence:** Assert visible passed, text contains "模拟"

### 2. AC-184-002: Panel Opens ✅ PASS
- **Browser Test:** Clicking `[data-testid="nav-simulation"]` opens `[data-testid="simulation-panel"]`
- **Result:** Panel renders and becomes visible after button click
- **Evidence:** Assert visible passed

### 3. AC-184-003: Status Display ✅ PASS
- **Browser Test:** `[data-status]` attribute shows correct values
- **Result:** Initially shows "待机" (idle), changes to "运行中" (running) after Run
- **Evidence:** StatusIndicator displays with data-status attribute, Chinese labels match: 待机 (idle), 运行中 (running), 已暂停 (paused), 已停止 (stopped)

### 4. AC-184-004: Run Button ✅ PASS
- **Browser Test:** Clicking `[data-run-button]` triggers runSimulation
- **Result:** Status changes from "待机" to "运行中" after clicking Run
- **Evidence:** Run button click changes status correctly

### 5. AC-184-005: Reset Button ❌ FAIL
- **Browser Test:** Clicking `[data-reset-button]` should reset simulation state
- **Result:** Reset button click does NOT change status from "运行中" back to "待机"
- **Root Cause:** `resetCircuitSimulation` in `src/store/useCircuitCanvasStore.ts` (line 854-873) does NOT set `simulationStatus: 'idle'`. The method resets circuit nodes, wires, and step count, but the status remains 'running'.
- **Code Location:** `src/store/useCircuitCanvasStore.ts` line 854-873
```typescript
resetCircuitSimulation: () => {
  resetComponentStates();
  useSignalTraceStore.getState().clearTraces();
  set((state: CircuitCanvasStore) => {
    return {
      nodes: state.nodes.map(...),
      wires: state.wires.map(...),
      cycleAffectedNodeIds: [],
      simulationStepCount: 0,
      // MISSING: simulationStatus: 'idle'
    };
  });
},
```
- **Expected Fix:** Add `simulationStatus: 'idle'` to the set() call

### 6. AC-184-006: Step Button ✅ PASS (Conditionally)
- **Verification:** `[data-step-button]` is NOT rendered (correct, since stepSimulation doesn't exist in store)
- **Result:** Step button conditionally hidden as per contract Issue A
- **Evidence:** assert_hidden passed for [data-step-button]

### 7. AC-184-007: Step Count Display ✅ PASS
- **Browser Test:** `[data-step-count]` displays "0" initially
- **Result:** Step count element exists and displays "0"
- **Evidence:** Step count shows "0" when idle

### 8. AC-184-008: Close Button ✅ PASS
- **Browser Test:** Clicking `[data-testid="close-panel"]` closes panel
- **Result:** Panel becomes hidden after close button click
- **Evidence:** assert_hidden passed for [data-testid="simulation-panel"] after clicking close

### 9. AC-184-009: Panel Reopens ✅ PASS
- **Browser Test:** Panel reopens correctly via nav-simulation after closing
- **Result:** Panel visible again after second nav-simulation click
- **Evidence:** assert_visible passed after reopen

### 10. AC-184-010: TypeScript Compilation ✅ PASS
- **Command:** `npx tsc --noEmit`
- **Result:** Exit code 0, 0 errors
- **Evidence:** No output, clean compilation

### 11. AC-184-011: Keyboard Shortcuts ✅ PASS
- **Browser Test:** R key triggers Run, X key triggers Reset when panel open and no input focused
- **Result:** Both shortcuts work correctly
- **Evidence:** 
  - Press 'r' → status changes to "运行中"
  - Press 'x' → status changes to "待机"

### 12. AC-184-011: Input Focus Guard ✅ PASS
- **Browser Test:** Shortcuts do NOT trigger when input field is focused
- **Result:** Created input element, focused it, pressed 'r', status remained "待机"
- **Evidence:** isIdle check returned true after pressing 'r' with input focused
- **Code:** `App.tsx` keyboard handler correctly guards:
```typescript
if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.hasAttribute('contenteditable')) {
  return;
}
```

### 13. AC-184-012: Component Tests ✅ PASS
- **Command:** `npm test -- --run src/components/Circuit/__tests__/SimulationPanel.test.tsx`
- **Result:** 37 tests passed
- **Evidence:** Test Files: 1 passed, Tests: 37 passed

### 14. AC-184-013: Full Test Suite ✅ PASS
- **Command:** `npm test -- --run`
- **Result:** 7490 tests passed
- **Evidence:** Test Files: 258 passed, Tests: 7490 passed

### 15. AC-184-014: Bundle Size ✅ PASS
- **Command:** `npm run build`
- **Result:** 
  - Main bundle: `index-CEBJa7mC.js` = 488,150 bytes (488.15 KB)
  - Limit: 524,288 bytes (512 KB)
  - Margin: 36,138 bytes under limit
- **Lazy chunk:** `SimulationPanel-C1FgJpq4.js` = 5,842 bytes
- **Evidence:** Build output shows both main bundle and lazy chunk

## Full Test Suite
- **Command:** `npm test -- --run`
- **Result:** Test Files: 258 passed (258), Tests: 7490 passed (7490)
- **Duration:** 39.79s
- **Status:** All tests pass with no regressions

## Deliverables Verification

| File | Status |
|------|--------|
| `src/App.tsx` | ✅ Nav-simulation button, LazySimulationPanel, keyboard shortcuts, input-focus guard |
| `src/components/Circuit/SimulationPanel.tsx` | ✅ All data-testid attributes, close button, conditional step button |
| `src/store/useCircuitCanvasStore.ts` | ⚠️ resetCircuitSimulation missing `simulationStatus: 'idle'` |
| `src/types/circuit.ts` | ✅ SimulationStatus type uses 'stopped' not 'completed' |
| `src/components/Circuit/__tests__/SimulationPanel.test.tsx` | ✅ 37 tests pass |

## Bugs Found

### 1. [Critical] Reset Button Doesn't Reset Status
- **Description:** `resetCircuitSimulation` method does not set `simulationStatus: 'idle'`, causing the SimulationPanel to continue displaying "运行中" (running) status after clicking the Reset button.
- **Reproduction Steps:**
  1. Open simulation panel by clicking `[data-testid="nav-simulation"]`
  2. Click Run button `[data-run-button]`
  3. Verify status shows "运行中" (running)
  4. Click Reset button `[data-reset-button]`
  5. Observe: Status remains "运行中" instead of returning to "待机"
- **Impact:** Users see incorrect simulation status after reset. The Reset button is functionally broken for the status display.
- **Fix Location:** `src/store/useCircuitCanvasStore.ts` line ~870
- **Fix:** Add `simulationStatus: 'idle'` to the set() call in `resetCircuitSimulation`:
```typescript
set((state: CircuitCanvasStore) => {
  return {
    nodes: state.nodes.map(...),
    wires: state.wires.map(...),
    cycleAffectedNodeIds: [],
    simulationStepCount: 0,
    simulationStatus: 'idle', // ADD THIS LINE
  };
});
```

## Required Fix Order

1. **Highest Priority**: Fix `resetCircuitSimulation` to set `simulationStatus: 'idle'` in `src/store/useCircuitCanvasStore.ts`

## What's Working Well
- ✅ Navigation button `[data-testid="nav-simulation"]` visible with correct "⚡ 模拟" label
- ✅ SimulationPanel lazy loaded as separate 5.84 KB chunk
- ✅ Panel open/close/reopen cycle works correctly
- ✅ Run button correctly changes status to "运行中"
- ✅ Step button correctly hidden (no stepSimulation in store per Issue A)
- ✅ Status indicator `[data-status]` shows correct values with Chinese labels
- ✅ Step count `[data-step-count]` displays correctly
- ✅ Keyboard shortcuts R=Run, X=Reset work when panel is open
- ✅ Input-focus guard prevents shortcuts when input/textarea focused
- ✅ Close button `[data-testid="close-panel"]` works
- ✅ TypeScript compiles with 0 errors
- ✅ Bundle size 488.15 KB with 36+ KB margin under 512 KB limit
- ✅ All 37 SimulationPanel tests pass
- ✅ Full test suite: 7490 tests pass with no regressions
