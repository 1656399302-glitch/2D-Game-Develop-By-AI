# Sprint Contract — Round 108

## Scope

This round focuses on **test coverage expansion** and **edge case verification** to further strengthen the codebase. All core systems (modules, connections, activation, attributes, codex, export, exchange, challenges, recipes, faction system) are complete per the codebase audit. This round adds comprehensive edge case tests, error handling verification, and accessibility audit coverage.

## Spec Traceability

### P0 Items (Must Complete)
- **Edge Case Testing** for all stores: cover boundary conditions, null/undefined inputs, concurrent operations
- **Error Handling Tests**: verify all error paths are tested with proper error messages
- **Accessibility Audit**: verify all interactive elements have proper ARIA attributes and keyboard support

### P1 Items (Should Complete)
- **Performance Baseline Verification**: ensure large machine operations remain performant
- **Store Hydration Tests**: verify all stores hydrate correctly from localStorage
- **Export Quality Tests**: verify SVG/PNG/Poster export edge cases

### P2 Items (Intentional Deferral)
- None — all P2 items from spec are complete

### Remaining P0/P1 After This Round
- **P0**: None — all P0 requirements met
- **P1**: None — all P1 requirements met

## Deliverables

1. **Edge Case Test Files**:
   - `src/__tests__/storeEdgeCases.test.ts` — comprehensive edge case tests for Zustand stores: useMachineStore, useConnectionStore, useActivationStore, useAttributeStore, useCodexStore, useExportStore, useExchangeStore, useChallengeStore, useRecipeStore, useFactionStore, useFactionReputationStore, useCommunityStore, useUIStore
   - `src/__tests__/errorHandling.test.ts` — error scenario coverage for all system operations including network failures, invalid inputs, localStorage corruption, and provider errors
   - `src/__tests__/accessibilityAudit.test.ts` — audit test for all interactive components verifying ARIA attributes and keyboard support

2. **Performance Verification**:
   - `src/__tests__/performanceBaseline.test.ts` — verify performance with 50+ module machines, testing addModule, removeModule, createConnection operations

3. **Hydration Verification**:
   - `src/__tests__/storeHydration.test.ts` — verify localStorage hydration works correctly for all 13 stores

## Acceptance Criteria

1. **AC-108-001**: All store edge cases covered with tests for: null inputs, undefined inputs, empty state, boundary values (0, -1, MAX_SAFE_INTEGER), concurrent operations without race conditions
2. **AC-108-002**: All error paths have corresponding tests with expected error messages matching actual console output
3. **AC-108-003**: All interactive components have aria-label or visible text; all modals trap focus; keyboard navigation works for all interactive components
4. **AC-108-004**: Performance remains acceptable with 50+ module machines — addModule < 100ms, removeModule < 100ms, createConnection < 100ms
5. **AC-108-005**: All 13 stores correctly hydrate from localStorage after page reload with no data loss
6. **AC-108-006**: Export edge cases handled: empty canvas (shows user message), large canvas (handles memory), missing metadata (uses defaults)
7. **AC-108-007**: TypeScript compiles clean with `npx tsc --noEmit` returning 0 errors
8. **AC-108-008**: All 4,197+ existing tests continue to pass (test suite regression check)

## Test Methods

1. **AC-108-001 Edge Case Tests**:
   - Run: `npm test -- storeEdgeCases.test.ts`
   - Verify all assertions pass (target: 150+ new assertions)
   - Test null/undefined inputs handled gracefully (no crash)
   - Test boundary values (0, -1, Number.MAX_SAFE_INTEGER) handled correctly (no exception)
   - Test concurrent operations don't cause race conditions (state remains consistent)
   - **Negative assertion**: Store should not throw on invalid inputs; state should remain unchanged

2. **AC-108-002 Error Handling Tests**:
   - Run: `npm test -- errorHandling.test.ts`
   - Verify all error scenarios covered (network failure, invalid input, localStorage error, provider error)
   - Verify expected error messages match actual error output
   - **Negative assertion**: Error should not propagate uncaught; should display user-friendly message

3. **AC-108-003 Accessibility Audit**:
   - Run: `npm test -- accessibilityAudit.test.ts`
   - Verify all buttons have aria-label or visible text (no unlabeled interactive elements)
   - Verify all modals trap focus correctly (Tab does not escape modal)
   - Verify keyboard navigation works (Enter/Space activate buttons, Escape closes modals)
   - **Negative assertion**: Should not have tabbable elements outside modal when modal open

4. **AC-108-004 Performance Baseline**:
   - Run: `npm test -- performanceBaseline.test.ts`
   - Create machine with 50+ modules
   - Measure time for addModule, removeModule, createConnection operations
   - Verify: addModule < 100ms, removeModule < 100ms, createConnection < 100ms
   - **Negative assertion**: Operations should not hang or timeout

5. **AC-108-005 Store Hydration**:
   - Run: `npm test -- storeHydration.test.ts`
   - Save state to localStorage for each store
   - Clear store state (simulating page reload)
   - Rehydrate store from localStorage
   - Verify state is restored correctly (all fields match)
   - Test corrupted localStorage data (store should initialize to default state)
   - **Negative assertion**: Hydration should not crash on corrupted data; should fall back to defaults

6. **AC-108-006 Export Edge Cases**:
   - Run: `npm test -- exportEdgeCases.test.ts` (or verify in errorHandling.test.ts)
   - Test export with empty canvas — verify user message displayed, no crash
   - Test export with 50+ modules — verify export completes without memory error
   - Test export with missing metadata — verify defaults used, no crash
   - **Negative assertion**: Export should not produce invalid SVG/PNG output

7. **AC-108-007 TypeScript Verification**:
   - Run: `npx tsc --noEmit`
   - Verify 0 errors
   - **Negative assertion**: Any TypeScript error means round fails

8. **AC-108-008 Test Suite Verification**:
   - Run: `npm test`
   - Verify all tests pass (4,197+ including new tests)
   - Verify test duration < 30s
   - **Negative assertion**: Any test failure means round fails

## Risks

1. **Test Isolation Risk**: New tests must properly mock dependencies to avoid cross-contamination
   - **Mitigation**: Use proper beforeEach/afterEach cleanup; mock localStorage explicitly

2. **Performance Test Flakiness**: Performance tests may be flaky on CI due to machine variability
   - **Mitigation**: Use conservative thresholds (100ms per operation instead of 10ms); run on consistent hardware

3. **Hydration Test Complexity**: Testing localStorage hydration requires careful timing and state management
   - **Mitigation**: Mock localStorage in tests for deterministic behavior; test both happy path and corrupted data

4. **Edge Case Completeness**: Not all edge cases may be discoverable upfront
   - **Mitigation**: Prioritize critical paths (store mutations, network errors, user input validation)

## Failure Conditions

1. **TypeScript Errors**: If `npx tsc --noEmit` reports any errors, the round fails
2. **Test Suite Regression**: If any existing test fails (4,197+ tests), the round fails
3. **Dev Server Fails**: If `npm run dev` doesn't start cleanly on port 5173, the round fails
4. **Missing Acceptance Criteria**: If any of AC-108-001 through AC-108-008 are not met, the round fails
5. **Test Crash**: If any test file crashes during execution, the round fails

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ All 8 acceptance criteria (AC-108-001 through AC-108-008) are verified and passing
2. ✅ TypeScript compiles with 0 errors (`npx tsc --noEmit` succeeds)
3. ✅ All 4,197+ existing tests pass plus new tests pass (total test count increases)
4. ✅ All new edge case tests pass with 150+ new assertions
5. ✅ Dev server starts cleanly on port 5173 (`npm run dev`)
6. ✅ HTTP 200 response from dev server (`curl http://localhost:5173/`)
7. ✅ No console errors during test execution (no Error-level output)
8. ✅ All new test files follow project conventions (proper mocking, isolation, beforeEach/afterEach)

## Out of Scope

The following features are NOT being modified in this round (they are complete per previous rounds):

1. **Module system** — already complete with 22 module types
2. **Connection system** — already complete with validation
3. **Activation system** — already complete with state machine
4. **Attribute generation** — already complete with naming rules
5. **Codex system** — already complete with persistence
6. **Export system** — already complete with SVG/PNG/Poster
7. **Exchange system** — already complete with trading
8. **Challenge system** — already complete with 20 challenges
9. **Recipe system** — already complete with 16 recipes
10. **Faction system** — already complete with 6 factions and tech tree
11. **Community gallery** — already complete with 8 mock machines
12. **AI naming assistant** — already complete with local provider fallback

## Technical Notes

### Test File Conventions
- Follow existing test patterns in `src/__tests__/`
- Use proper beforeEach/afterEach for cleanup
- Mock Zustand stores using `vi.mock` and mock `localStorage` with `vi.stubGlobal`
- Use realistic test data matching production scenarios

### Performance Testing Approach
- Use `performance.now()` for timing measurements
- Set conservative thresholds (100ms per operation, 30s total test time)
- Test representative operations, not microbenchmarks

### Accessibility Testing Approach
- Use `@testing-library/react` queries (getByRole, getByLabelText, queryByText)
- Test keyboard navigation with `@testing-library/user-event`
- Verify focus management in modals using `document.activeElement`

### Store List (for Edge Case Coverage)
1. useMachineStore — machine state and module management
2. useConnectionStore — connection validation and management
3. useActivationStore — activation state machine
4. useAttributeStore — attribute generation
5. useCodexStore — codex persistence
6. useExportStore — export functionality
7. useExchangeStore — exchange/trading
8. useChallengeStore — challenge management
9. useRecipeStore — recipe management
10. useFactionStore — faction state
11. useFactionReputationStore — reputation tracking
12. useCommunityStore — community gallery
13. useUIStore — UI state (modals, panels, selection)
