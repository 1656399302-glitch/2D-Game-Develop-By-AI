# Sprint Contract — Round 161

## APPROVED

## Scope

This sprint addresses the blocking failure from Round 160: the missing test file `src/__tests__/ChallengeObjectives.test.tsx` required by acceptance criterion AC-160-004 (Visual Feedback). The core validation engine and UI components are already implemented and passing; this sprint creates the required test file that verifies the UI components render correctly with proper data-testid attributes and state transitions.

## Spec Traceability

- **P0 items covered this round:**
  - AC-160-004 (Visual Feedback) — Create ChallengeObjectives.test.tsx to verify UI state rendering

- **P1 items covered this round:**
  - None (P1 items from previous rounds are complete)

- **Remaining P0/P1 after this round:**
  - None — all P0/P1 items from Round 160 will be complete

- **P2 intentionally deferred:**
  - All P2 items remain deferred (not affected by this sprint)

## Deliverables

1. **`src/__tests__/ChallengeObjectives.test.tsx`** — New test file with React Testing Library tests for ChallengeObjectives.tsx UI component rendering
2. **`src/__tests__/ChallengeObjectives.test.tsx` must pass when run with `npm test -- --run src/__tests__/ChallengeObjectives.test.tsx`**

## Acceptance Criteria

1. **AC-161-001:** Test file `src/__tests__/ChallengeObjectives.test.tsx` exists and runs without errors
2. **AC-161-002:** Tests verify objective panel shows yellow spinner (◐) during `validating` state using `act()` wrapping for state transitions
3. **AC-161-003:** Tests verify objective panel shows green checkmark (✓) after `passed` validation using `act()` wrapping
4. **AC-161-004:** Tests verify objective panel shows red X (✗) after `failed` validation using `act()` wrapping
5. **AC-161-005:** Tests verify objective panel returns to idle/empty state when overlay is dismissed
6. **AC-161-006:** Negative test: component does not crash with empty objective list
7. **AC-161-007:** Negative test: component does not render stale status after circuit reset
8. **AC-161-008:** Negative test: component does not show checkmark before validation runs
9. **AC-161-009:** All 237 test files pass including the new test file
10. **AC-161-010:** Total test count ≥ 6840 (maintaining or exceeding current count)

## Test Methods

1. **AC-161-001 verification:** Run `npm test -- --run src/__tests__/ChallengeObjectives.test.tsx` — must exit with code 0 and show all tests passing
2. **AC-161-002 verification:** Mock store state to `validating`, render ChallengeObjectives, query `data-testid="objective-status-{id}"`, assert textContent includes `◐` or icon rendered
3. **AC-161-003 verification:** Mock store state to `passed`, render ChallengeObjectives, assert `getStatusColor()` returns green, assert green checkmark icon rendered
4. **AC-161-004 verification:** Mock store state to `failed`, render ChallengeObjectives, assert `getStatusColor()` returns red, assert red X icon rendered
5. **AC-161-005 verification:** Render with validation result, trigger dismiss/reset action, assert idle state returns
6. **AC-161-006 verification:** Render with empty objectives array, assert component renders without throwing
7. **AC-161-007 verification:** Transition from passed to idle, assert status icons no longer show green checkmark
8. **AC-161-008 verification:** Render with idle/initial state, assert no checkmark shown before validation triggered
9. **AC-161-009 verification:** Run `npm test -- --run` — all 237 test files must pass
10. **AC-161-010 verification:** Run `npm test -- --run` and count tests — must show ≥ 6840

## Risks

1. **Test isolation risk:** The tests must mock the Zustand store (`useChallengeValidatorStore`) to control state transitions. If the store API changes, tests may break.
2. **act() wrapping complexity:** Proper async state transition testing requires careful `act()` wrapping; improper usage may cause React warnings.
3. **Existing test file conflicts:** If ChallengeObjectives.test.tsx already exists in another location, there may be import/duplicate conflicts.

## Failure Conditions

1. **File does not exist:** `src/__tests__/ChallengeObjectives.test.tsx` is not created
2. **Tests fail:** Running the test file shows any failing or errored tests
3. **Wrong test library:** Tests use something other than React Testing Library (must use `@testing-library/react`)
4. **Missing act() wrapping:** State transition tests do not properly wrap updates with `act()`
5. **Total test count drops:** Running `npm test -- --run` shows fewer than 6840 tests
6. **Existing tests broken:** Running `npm test -- --run` shows any test files failing (must remain at 237 passing files)

## Done Definition

The round is complete when ALL of the following are true:

1. `src/__tests__/ChallengeObjectives.test.tsx` exists in the codebase
2. `npm test -- --run src/__tests__/ChallengeObjectives.test.tsx` exits with code 0 and shows all tests passing
3. Tests use `@testing-library/react` for rendering and querying
4. Tests wrap state transitions in `act()` as required by the acceptance criterion
5. `npm test -- --run` shows exactly 238 test files (237 existing + 1 new)
6. `npm test -- --run` shows ≥ 6840 total tests passing
7. No existing tests were modified or broken by this change

## Out of Scope

1. **No new features** — This is a remediation sprint focused only on creating the missing test file
2. **No UI modifications** — ChallengeObjectives.tsx and ValidationOverlay.tsx are already complete
3. **No validation engine changes** — challengeValidator.ts is already passing all 151 tests
4. **No type system changes** — Types are already defined
5. **No build/bundle changes** — Build must remain under 512KB
6. **No additional test files** — Only the single specified test file is being created
