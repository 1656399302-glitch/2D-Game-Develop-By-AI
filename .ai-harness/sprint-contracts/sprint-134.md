# Sprint Contract — Round 134

## Scope

**Remediation Sprint** — Fix the minor Escape key UX issue identified in Round 133 QA feedback. No new features or enhancements; focus on polishing the existing sub-circuit creation modal behavior.

- **Round 133 Bug**: Escape key doesn't close CreateSubCircuitModal when input is focused
- **Root Cause**: Early return in keydown handler when `document.activeElement` is INPUT/TEXTAREA
- **Fix**: Remove the early return, allow Escape to always close the modal regardless of focus state

## Spec Traceability

### P0 Items Covered This Round
1. **Escape key UX fix for CreateSubCircuitModal** — Allow Escape key to close modal regardless of focus state
   - Spec reference: Core UX consistency
   - Bug reference: Round 133 QA — Bug #1 (Minor/UX)
   - Root cause: `src/components/SubCircuit/CreateSubCircuitModal.tsx` early return on INPUT/TEXTAREA focus
   - Fix approach: Remove the early return, allow Escape to always call `onClose()`

### P1 Items Covered This Round
None — remediation-only sprint

### Remaining P0/P1 After This Round
None — all previously identified P0/P1 items are complete

### P2 Intentionally Deferred
- Sub-circuit internal circuit editing
- Sub-circuit input/output port configuration
- Sub-circuit placement on canvas

## Deliverables

| # | File/Component | Description |
|---|----------------|-------------|
| 1 | `src/components/SubCircuit/CreateSubCircuitModal.tsx` | Fixed Escape key handler that closes modal regardless of focus state |
| 2 | `tests/e2e/sub-circuit.spec.ts` | Updated E2E test for Escape key behavior (direct Escape without unfocus workaround) |

## Acceptance Criteria

| ID | Criterion | Entry State | Exit State | Negative Assertion |
|----|-----------|-------------|------------|---------------------|
| AC-134-001 | Escape key closes modal immediately when input is focused | Modal open, input auto-focused, activeElement is INPUT | Modal removed from DOM or hidden, no sub-circuit created | Modal must not remain visible after Escape pressed |
| AC-134-002 | Escape key closes modal when input is unfocused | Modal open, input unfocused, activeElement is not INPUT | Modal removed from DOM or hidden, no sub-circuit created | Modal must not remain visible after Escape pressed |
| AC-134-003 | Cancel button continues to work as fallback | Modal open | Modal closed, no sub-circuit created | No sub-circuit should exist in custom section after cancel |
| AC-134-004 | Create button continues to work correctly | Modal open, name entered | Modal closed, sub-circuit created in custom section | Modal must not remain visible after Create button clicked |
| AC-134-005 | Bundle size remains ≤512KB | N/A (build artifact) | Build output ≤512KB | N/A |
| AC-134-006 | TypeScript 0 errors | N/A (static check) | tsc --noEmit returns 0 errors | N/A |
| AC-134-007 | All existing unit tests pass | N/A (pre-state) | ≥5491 tests pass | Test count must not decrease |
| AC-134-008 | E2E tests complete within 60 seconds | N/A (timing) | All sub-circuit E2E tests pass in <60s | No tests should timeout |

## Test Methods

### AC-134-001: Escape key closes modal when input is focused

**Workflow Coverage:**
- **Entry**: Dispatch `open-create-subcircuit-modal` event, verify modal opens and `document.activeElement` is the INPUT element
- **Action**: Press Escape key
- **Completion**: Modal should no longer be visible
- **Final State**: Modal removed from DOM or `display: none`, no sub-circuit created
- **Repeat/Reopen**: Can dispatch event again to reopen modal
- **Negative Assertion**: Modal must not remain visible in DOM after Escape is pressed while input is focused

**Verification Steps:**
1. Run `npx playwright test tests/e2e/sub-circuit.spec.ts`
2. Verify test case "Escape key closes modal when input is focused" passes
3. **Manual verification:**
   - Dispatch `open-create-subcircuit-modal` event
   - Verify `document.activeElement` is `[data-sub-circuit-name-input]`
   - Press `Escape` key
   - Assert modal is not visible (count: `document.querySelectorAll('[data-sub-circuit-modal]').length === 0` or `display === 'none'`)
   - Assert no sub-circuit was created (custom section count unchanged)

### AC-134-002: Escape key closes modal when input is unfocused

**Workflow Coverage:**
- **Entry**: Modal open with input unfocused
- **Action**: Press Escape key
- **Completion**: Modal should close
- **Final State**: Modal removed from DOM, no sub-circuit created
- **Repeat/Reopen**: Can click to open again
- **Negative Assertion**: Modal must not remain visible after Escape pressed when unfocused

**Verification Steps:**
1. Run E2E test "Escape key closes modal when input is unfocused"
2. **Manual verification:**
   - Dispatch event to open modal
   - Click modal header/title area to unfocus input
   - Verify `document.activeElement` is NOT `[data-sub-circuit-name-input]`
   - Press `Escape`
   - Assert modal is no longer visible
   - Assert no sub-circuit created

### AC-134-003: Cancel button works

**Workflow Coverage:**
- **Entry**: Modal open
- **Action**: Click `[data-cancel-create]` button
- **Completion**: Modal dismisses
- **Final State**: Modal closed, no sub-circuit in custom section
- **Repeat/Reopen**: Can open modal again via event dispatch
- **Negative Assertion**: No sub-circuit should appear in custom section after cancel

**Verification Steps:**
1. Record initial custom section sub-circuit count
2. Open modal via event dispatch
3. Click `[data-cancel-create]`
4. Assert modal is not visible
5. Assert custom section count equals initial count (no new sub-circuit)

### AC-134-004: Create button works

**Workflow Coverage:**
- **Entry**: Modal open with name in input
- **Action**: Click `[data-confirm-create]`
- **Completion**: Modal dismisses, sub-circuit created
- **Final State**: Sub-circuit appears in custom section with correct name
- **Repeat/Reopen**: Can open modal again to create another
- **Negative Assertion**: Modal must not remain open after Create clicked

**Verification Steps:**
1. Record initial custom section count
2. Open modal via event dispatch
3. Enter valid name in `[data-sub-circuit-name-input]`
4. Click `[data-confirm-create]`
5. Assert modal is not visible (negative assertion: modal should not remain)
6. Assert new sub-circuit appears in custom section (count incremented by 1)

### AC-134-005: Bundle size
1. Run `npm run build`
2. Verify `dist/assets/index-*.js` file size ≤512KB (524,288 bytes)

### AC-134-006: TypeScript
1. Run `npx tsc --noEmit`
2. Verify exit code 0 with zero errors

### AC-134-007: Unit tests
1. Run `npm test -- --run`
2. Verify ≥5491 tests pass
3. **Negative assertion**: Test count must not decrease (no tests removed)

### AC-134-008: E2E tests timing
1. Run `npx playwright test tests/e2e/sub-circuit.spec.ts --timeout=60000`
2. Verify all tests pass within 60 seconds
3. **Negative assertion**: No tests should timeout or error

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Fixing Escape handler may inadvertently break other keyboard interactions | Low | Use targeted fix; test all keyboard interactions (Enter to submit, Tab navigation) |
| E2E tests may need updating if test structure changes | Low | Keep test changes minimal and focused on Escape behavior only |
| Removing early return may cause unintended form submission on Escape | Low | Escape should only call onClose(), not trigger form submit |

## Failure Conditions

The round fails if any of the following occur:
1. **AC-134-001 fails** — Escape key does not close modal when input is focused
2. **AC-134-002 fails** — Escape key does not close modal when input is unfocused
3. **AC-134-003 fails** — Cancel button no longer works
4. **AC-134-004 fails** — Create button no longer works, or modal remains visible after clicking
5. **AC-134-005 fails** — Bundle size exceeds 512KB
6. **AC-134-007 fails** — Unit tests drop below 5491
7. **AC-134-008 fails** — E2E tests exceed 60 seconds or fail
8. **Regression**: Enter key no longer submits form when input is focused
9. **Regression**: Tab navigation within modal is broken

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ `src/components/SubCircuit/CreateSubCircuitModal.tsx` has been modified to remove the early return that blocks Escape when input is focused
2. ✅ `tests/e2e/sub-circuit.spec.ts` includes a test case that verifies Escape key closes modal when input is focused (no unfocus workaround)
3. ✅ **Entry verification**: Modal opens and input is auto-focused
4. ✅ **Exit verification**: Modal closes (not visible) after Escape pressed with input focused
5. ✅ **Final state verification**: No sub-circuit created after Escape dismissal
6. ✅ **Repeat verification**: Modal can be reopened after Escape dismissal
7. ✅ **Negative assertion verified**: Modal must not remain visible after Escape (AC-134-001, AC-134-002)
8. ✅ All acceptance criteria (AC-134-001 through AC-134-008) are verified
9. ✅ No regressions introduced (Enter to submit, Tab navigation, Cancel, Create all work)
10. ✅ `npm run build` produces bundle ≤512KB
11. ✅ `npx tsc --noEmit` returns 0 errors
12. ✅ `npm test -- --run` passes ≥5491 tests
13. ✅ `npx playwright test tests/e2e/sub-circuit.spec.ts` passes all tests within 60s

## Out of Scope

- Any new features or functionality beyond Escape key fix
- Sub-circuit internal circuit editing
- Sub-circuit input/output port configuration
- Sub-circuit placement on canvas
- Changes to other modals or components
- Visual design changes
- Performance optimizations beyond maintaining current bundle size

---

## Round 133 QA Summary (Reference)

| Metric | Result |
|--------|--------|
| Release Decision | PASS (with minor bug) |
| Critical Bugs | 0 |
| Major Bugs | 0 |
| Minor Bugs | 1 (Escape key UX) |
| AC Pass Rate | 8/8 |
| Scores | Feature 9, Correctness 9, Depth 8, UX 9, Quality 9, Operability 9, Avg 8.8 |

**Bug requiring fix in Round 134:**
- Escape key doesn't close modal when input is focused — early return in CreateSubCircuitModal.tsx blocks Escape when `document.activeElement` is INPUT/TEXTAREA
