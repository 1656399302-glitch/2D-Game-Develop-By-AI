# Sprint Contract — Round 156

## APPROVED

---

## Scope

This sprint focuses on **Enhanced Circuit Validation with Auto-Fix Quick Actions**. The goal is to improve the user experience when building circuits by providing more actionable fix suggestions and one-click quick actions for common validation errors.

## Spec Traceability

### P0 items covered this round
- **Canvas System / Circuit Validation**: Extend the validation overlay with quick-fix buttons for auto-resolving common errors
- **User Experience / Error Handling**: Add contextual help and detailed fix suggestions for validation errors

### P1 items covered this round
- **Canvas System / Visual Feedback**: Improve validation error highlighting with severity indicators and recommended actions

### Remaining P0/P1 after this round
- Circuit simulation performance optimization (future round)
- Multi-user collaboration features (future round)
- Advanced circuit analysis tools (future round)

### P2 intentionally deferred
- Custom circuit templates sharing (deferred)
- Circuit versioning system (deferred)
- Advanced analytics dashboard (deferred)

## Deliverables

1. **`src/components/Editor/CircuitValidationOverlay.tsx`** — Enhanced validation overlay with quick-fix action buttons
2. **`src/types/circuitValidation.ts`** — Extended `ValidationError` type with `quickFix` action definitions
3. **`src/hooks/useCircuitValidation.ts`** — Extended hook with `autoFix` methods for each fixable error type
4. **`src/__tests__/circuitValidationQuickFix.test.tsx`** — 50 new tests for quick-fix functionality

## Acceptance Criteria

1. **AC-156-001: Quick-fix buttons render for fixable errors**
   - When validation fails with a fixable error (ISLAND_MODULES, UNREACHABLE_OUTPUT, CIRCUIT_INCOMPLETE), the overlay displays a "Quick Fix" button
   - When validation passes, no quick-fix UI is shown
   - Quick-fix buttons are disabled during active fix operation

2. **AC-156-002: Auto-fix resolves ISLAND_MODULES error**
   - Clicking "Quick Fix" on ISLAND_MODULES error removes the isolated module from the canvas
   - After fix, validation re-runs automatically
   - Removed module count is logged to console

3. **AC-156-003: Auto-fix resolves UNREACHABLE_OUTPUT error**
   - Clicking "Quick Fix" on UNREACHABLE_OUTPUT error disconnects the unreachable output from its inputs
   - After fix, validation re-runs automatically

4. **AC-156-004: Auto-fix resolves CIRCUIT_INCOMPLETE error**
   - Clicking "Quick Fix" on CIRCUIT_INCOMPLETE error adds a default wire connection from the nearest input node
   - After fix, validation re-runs automatically

5. **AC-156-005: Test count ≥ 6338**
   - `npm test -- --run` shows ≥ 6338 passing tests (6288 + 50 new tests)

6. **AC-156-006: Bundle size ≤ 512KB**
   - `npm run build` produces bundle ≤ 524,288 bytes (512 KB)

7. **AC-156-007: TypeScript clean**
   - `npx tsc --noEmit` exits with code 0

## Test Methods

1. **AC-156-001**: Mount `CircuitValidationOverlay` with `visible=true` and fixable errors; assert quick-fix buttons render with correct labels and are initially enabled. Mount with `visible=false`; assert overlay does not render. Mount with a non-fixable error (e.g., LOOP_DETECTED); assert no Quick Fix button appears.

2. **AC-156-002**: Set up store with isolated module; trigger validation; assert ISLAND_MODULES error is present; click quick-fix; assert module is removed from store state; assert validation re-runs and overlay no longer shows ISLAND_MODULES error; assert fixing ISLAND_MODULES does NOT mutate unrelated store state (negative assertion).

3. **AC-156-003**: Set up store with unreachable output; trigger validation; assert UNREACHABLE_OUTPUT error is present; click quick-fix; assert wire is disconnected in store state; assert validation re-runs and overlay no longer shows UNREACHABLE_OUTPUT error.

4. **AC-156-004**: Set up store with incomplete circuit; trigger validation; assert CIRCUIT_INCOMPLETE error is present; click quick-fix; assert wire is created in store state; assert validation re-runs and overlay no longer shows CIRCUIT_INCOMPLETE error.

5. **AC-156-005**: Run `npm test -- --run`; count passing tests; assert count ≥ 6338.

6. **AC-156-006**: Run `npm run build`; parse output size in bytes; assert size ≤ 524,288.

7. **AC-156-007**: Run `npx tsc --noEmit`; verify exit code 0; verify zero output on stderr.

## Risks

1. **State consistency during auto-fix**: When auto-fix removes modules, dependent state may become stale. Mitigation: Re-validate immediately after each fix operation.

2. **Test isolation**: New tests may share state with existing tests. Mitigation: Use `vi.clearAllMocks()` and reset store state in `beforeEach`.

3. **Bundle size growth**: Adding new validation logic may increase bundle. Mitigation: Keep quick-fix logic in the same file as existing validation to leverage existing code.

4. **Fix cross-contamination**: Auto-fixing one error type must not mutate unrelated store state. Mitigation: Negative assertions in AC-156-002/003/004 test methods.

## Failure Conditions

1. Any acceptance criterion returns FAIL
2. Runtime errors during quick-fix execution
3. Store state inconsistency after auto-fix
4. Fixing one error type mutates unrelated store state (cross-contamination)
5. Tests dropping below 6338 passing
6. Bundle exceeding 512 KB
7. TypeScript compilation errors

## Done Definition

All 7 acceptance criteria pass:
- Quick-fix buttons render correctly for fixable errors; no buttons appear for non-fixable errors
- ISLAND_MODULES auto-fix removes isolated module and re-triggers validation; no cross-contamination
- UNREACHABLE_OUTPUT auto-fix disconnects output and re-triggers validation
- CIRCUIT_INCOMPLETE auto-fix adds default wire and re-triggers validation
- Test count ≥ 6338
- Bundle ≤ 512 KB
- TypeScript compiles clean

## Out of Scope

- LOOP_DETECTED auto-fix (cycles require manual intervention due to complexity)
- Batch fix multiple errors at once (single-fix-per-click only)
- Undo/redo for auto-fixes (deferred to future round)
- Machine module validation quick-fixes (this sprint focuses on circuit/canvas validation only)
