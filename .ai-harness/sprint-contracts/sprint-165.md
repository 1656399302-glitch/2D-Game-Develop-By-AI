# Sprint Contract — Round 165

## Scope

**Remediation Sprint**: Fix `act()` warnings in two high-volume test files identified in the current test suite. This is a test quality remediation sprint following the same pattern established in Rounds 161–164.

## Spec Traceability

### P0 items covered this round
- Test quality: Fix `act()` warnings in `TimeTrialChallenge.test.tsx` (94 warnings)
- Test quality: Fix `act()` warnings in `CircuitModulePanel.browser.test.tsx` (22 warnings)

### P1 items covered this round
- None — P1 work deferred to feature sprints

### Remaining P0/P1 after this round
- TechTree.test.tsx (~15 warnings) — next remediation target
- TechTreeCanvas.test.tsx (~14 warnings) — next remediation target
- validationIntegration.test.ts (~3 warnings) — next remediation target
- Remaining 8 test files with 1–4 warnings each

### P2 intentionally deferred
- All P2 spec items remain deferred

## Deliverables

1. **`src/__tests__/TimeTrialChallenge.test.tsx`**: Fixed with proper `act()` wrapping for all `render()`, `fireEvent.click()`, `rerender()`, and `vi.advanceTimersByTimeAsync()` calls. File header updated with Round 165 fix note.
2. **`src/__tests__/CircuitModulePanel.browser.test.tsx`**: Fixed with proper `act()` wrapping for all `render()` and `fireEvent.click()` calls. File header updated with Round 165 fix note.

## Acceptance Criteria

### AC-165-001: TimeTrialChallenge.test.tsx Runs with 0 act() Warnings
- **Criterion**: `npm test -- --run src/__tests__/TimeTrialChallenge.test.tsx` produces 0 `act()` warnings
- **Verification**: `npm test -- --run src/__tests__/TimeTrialChallenge.test.tsx 2>&1 | grep -ciE "act\(|not wrapped in act|inside an act"` must return 0

### AC-165-002: CircuitModulePanel.browser.test.tsx Runs with 0 act() Warnings
- **Criterion**: `npm test -- --run src/__tests__/CircuitModulePanel.browser.test.tsx` produces 0 `act()` warnings
- **Verification**: `npm test -- --run src/__tests__/CircuitModulePanel.browser.test.tsx 2>&1 | grep -ciE "act\(|not wrapped in act|inside an act"` must return 0

### AC-165-003: All Tests in TimeTrialChallenge.test.tsx Pass
- **Criterion**: All tests in `TimeTrialChallenge.test.tsx` pass
- **Verification**: `npm test -- --run src/__tests__/TimeTrialChallenge.test.tsx` shows all tests passing (no failures)

### AC-165-004: All Tests in CircuitModulePanel.browser.test.tsx Pass
- **Criterion**: All tests in `CircuitModulePanel.browser.test.tsx` pass
- **Verification**: `npm test -- --run src/__tests__/CircuitModulePanel.browser.test.tsx` shows all tests passing (no failures)

### AC-165-005: Full Test Suite Passes with ≥ 6865 Tests
- **Criterion**: `npm test -- --run` shows 238 test files, all passing, with test count ≥ 6865
- **Verification**: Test count maintained or increased (no tests removed)

### AC-165-006: Build Passes with Bundle ≤ 512 KB
- **Criterion**: `npm run build` succeeds and bundle ≤ 512 KB
- **Verification**: `ls dist/assets/index-*.js` shows bundle ≤ 512 KB

## Test Methods

### TM-165-001: TimeTrialChallenge.test.tsx act() Warnings Check
- **Command**: `npm test -- --run src/__tests__/TimeTrialChallenge.test.tsx 2>&1 | grep -ciE "act\(|not wrapped in act|inside an act"`
- **Expected**: 0 warnings
- **Negative Assertion**: Command should NOT produce any lines matching "not wrapped in act", "inside an act", or "Warning: act("
- **Verifies**: AC-165-001

### TM-165-002: CircuitModulePanel.browser.test.tsx act() Warnings Check
- **Command**: `npm test -- --run src/__tests__/CircuitModulePanel.browser.test.tsx 2>&1 | grep -ciE "act\(|not wrapped in act|inside an act"`
- **Expected**: 0 warnings
- **Negative Assertion**: Command should NOT produce any lines matching "not wrapped in act", "inside an act", or "Warning: act("
- **Verifies**: AC-165-002

### TM-165-003: TimeTrialChallenge.test.tsx Test Count
- **Command**: `npm test -- --run src/__tests__/TimeTrialChallenge.test.tsx 2>&1 | grep -E "Tests|passed"`
- **Expected**: All tests pass (e.g., "25 passed"), exit code 0
- **Negative Assertion**: Should NOT show any failed tests or test file errors
- **Verifies**: AC-165-003

### TM-165-004: CircuitModulePanel.browser.test.tsx Test Count
- **Command**: `npm test -- --run src/__tests__/CircuitModulePanel.browser.test.tsx 2>&1 | grep -E "Tests|passed"`
- **Expected**: All tests pass (e.g., "12 passed"), exit code 0
- **Negative Assertion**: Should NOT show any failed tests or test file errors
- **Verifies**: AC-165-004

### TM-165-005: Full Suite Pass
- **Command**: `npm test -- --run 2>&1 | tail -10`
- **Expected**: "Test Files  238 passed (238)", "Tests  6865 passed (6865)"
- **Negative Assertion**: Should NOT show any failed test files or test count below 6865
- **Verifies**: AC-165-005

### TM-165-006: Build Verification
- **Command**: `npm run build && ls -la dist/assets/index-*.js`
- **Expected**: Build succeeds with exit code 0, bundle size ≤ 524288 bytes (512 KB)
- **Negative Assertion**: Build should NOT fail, bundle should NOT exceed 512 KB
- **Verifies**: AC-165-006

## Risks

1. **Timer Interaction Risk**: `TimeTrialChallenge.test.tsx` uses `vi.advanceTimersByTimeAsync()` which must be properly wrapped in `act()`. The pattern from Round 164 (`flushUpdates()` with `vi.advanceTimersByTime(0)` in `act()`) must be adapted for `advanceTimersByTimeAsync`. Incorrect wrapping could cause tests to pass but timers to not advance correctly.
2. **Rerender Risk**: `TimeTrialChallenge.test.tsx` uses `rerender()` which also triggers state updates. All `rerender()` calls must be wrapped in `act()`.
3. **Store State Leakage**: Both test files use Zustand store direct mutations (`useXxxStore.setState()`). These must be wrapped in `act()` to prevent warnings from components subscribed to those stores.
4. **No Production Changes**: These are test-only changes. No production code should be modified.

## Failure Conditions

1. Any `act()` warnings remain in `TimeTrialChallenge.test.tsx` after the fix
2. Any `act()` warnings remain in `CircuitModulePanel.browser.test.tsx` after the fix
3. Any test in either file fails after the fix
4. Full test suite drops below 6865 tests (tests removed)
5. Bundle exceeds 512 KB
6. Production code is modified (only test files are in scope)

## Done Definition

All six acceptance criteria must be true:

1. ✅ `npm test -- --run src/__tests__/TimeTrialChallenge.test.tsx 2>&1 | grep -ciE "act\(|not wrapped in act|inside an act"` returns 0
2. ✅ `npm test -- --run src/__tests__/CircuitModulePanel.browser.test.tsx 2>&1 | grep -ciE "act\(|not wrapped in act|inside an act"` returns 0
3. ✅ `npm test -- --run src/__tests__/TimeTrialChallenge.test.tsx` shows all tests passing (exit code 0)
4. ✅ `npm test -- --run src/__tests__/CircuitModulePanel.browser.test.tsx` shows all tests passing (exit code 0)
5. ✅ `npm test -- --run` shows 238 test files, all passing, ≥ 6865 tests
6. ✅ `npm run build` succeeds with bundle ≤ 512 KB

## Out of Scope

- **No production code changes**: Only test files `TimeTrialChallenge.test.tsx` and `CircuitModulePanel.browser.test.tsx` are to be modified
- **No other test files**: Files like `TechTree.test.tsx`, `TechTreeCanvas.test.tsx`, `validationIntegration.test.ts`, `exchangeStore.test.ts`, `useRatingsStore.test.ts`, `circuitPersistence.test.ts`, `techTreeStore.test.ts`, `activationCore.test.ts` are NOT in this sprint's scope
- **No new features**: This is purely a test quality remediation sprint
- **No UI changes**: Components are not being modified, only their test files
