# Sprint Contract — Round 16

## APPROVED

---

## Scope

This is a remediation sprint to fix the critical persistence race condition in the tutorial system and address a failing test. No new features are in scope.

## Spec Traceability

- **P0 items covered this round:**
  - Tutorial system: Welcome modal persistence mechanism (CRITICAL BUG FIX)
  - Tutorial system: Fix failing module spacing test

- **P1 items covered this round:**
  - None — maintaining existing functionality only

- **Remaining P0/P1 after this round:**
  - All previously completed P0/P1 items remain functional
  - Tutorial system persistence fix restores full tutorial functionality

- **P2 intentionally deferred:**
  - All P2 items deferred to future sprints

## Deliverables

1. Fixed `useWelcomeModal` hook or `WelcomeModal` component that reads localStorage synchronously before Zustand hydrates
2. Fixed `src/__tests__/activationModes.test.ts` test with correct assertion for module spacing
3. All existing tests continue to pass (except the one being fixed)
4. Successful `npm run build` with 0 TypeScript errors

## Acceptance Criteria

1. **Persistence Fix**: After clicking "Skip & Explore", refreshing the page does NOT show the welcome modal again (localStorage `hasSeenWelcome: true` is respected)
2. **Browser Test**: Welcome modal does NOT appear on page load when `hasSeenWelcome: true` exists in localStorage
3. **First-Time Flow**: Welcome modal still appears correctly for new users (localStorage cleared)
4. **Skip Flow**: Clicking "Skip & Explore" closes modal, sets localStorage, and stays closed on refresh
5. **Tutorial Launch**: Clicking "Start Tutorial" still launches the tutorial overlay correctly
6. **Test Fix**: The `activationModes.test.ts` module spacing test passes with the corrected assertion
7. **Regression**: All other tests in `src/__tests__/` continue to pass
8. **Build**: `npm run build` exits with code 0 and 0 TypeScript errors
9. **Non-Blocking**: After skip, core functionality is accessible without modal interference

## Test Methods

1. **Browser Persistence Test**:
   - Clear localStorage
   - Open page → verify welcome modal appears
   - Click "Skip & Explore"
   - Verify localStorage has `hasSeenWelcome: true`
   - Refresh page → verify welcome modal does NOT appear
   - Verify core functionality (Random Forge, Canvas, etc.) is accessible

2. **Unit Test Execution**:
   - Run `npm test -- --testPathPattern="activationModes"`
   - Verify the module spacing test passes

3. **Full Test Suite**:
   - Run `npm test` to verify no regressions
   - All 23 tutorial system tests pass
   - All other tests pass (except the one being fixed)

4. **Build Verification**:
   - Run `npm run build`
   - Verify exit code 0 and no TypeScript errors

## Risks

1. **Zustand Hydration Timing**: The fix must work with Zustand's persist middleware without breaking hydration. Recommended approach is to check localStorage directly in the component or use Zustand's `onRehydrateStorage` callback.
2. **Test Flakiness**: The module spacing test may be inherently borderline due to random generation; fix must either increase buffer or adjust assertion to account for floating-point precision.

## Failure Conditions

1. Welcome modal appears on page load after user has previously clicked "Skip & Explore"
2. Any existing test fails (except the one being explicitly fixed)
3. `npm run build` fails or produces TypeScript errors
4. New users cannot see the welcome modal on first visit

## Done Definition

- [ ] `src/components/Tutorial/WelcomeModal.tsx` or `src/hooks/useWelcomeModal.ts` reads localStorage synchronously for initial state
- [ ] `npm test -- --testPathPattern="activationModes"` passes
- [ ] `npm test` runs with all tests passing (or with only the fixed test corrected)
- [ ] `npm run build` succeeds with 0 errors
- [ ] Manual browser verification confirms:
  - First visit: Welcome modal appears
  - After skip: Modal stays hidden on refresh
  - Core functionality accessible after skip

## Out of Scope

- No new tutorial steps or content changes
- No new modules or features
- No visual changes to existing components
- No changes to the machine editor, activation system, or other core systems
- No changes to the module panel, properties panel, or export functionality
