# APPROVED — Sprint Contract Round 53

## Scope

**Primary Objective:** Fix the Welcome Modal z-index issue that has been blocking browser testing since Round 51, reducing it from 1100 to a standard modal layer value (50).

This is a targeted remediation sprint to unblock browser verification that was documented as blocked in Rounds 51-52 QA feedback.

## Spec Traceability

### P0 (Critical — Must Complete)
- Fix WelcomeModal.tsx z-index from `z-[1100]` to `z-50`
- Fix TutorialCompletion.tsx z-index from `z-[1100]` to `z-50`
- Verify existing tests continue to pass (1915 tests)
- Verify build continues to pass with 0 TypeScript errors

### P1 (High Priority)
- Add unit tests to verify modal z-index behavior
- Verify modal dismissal behavior still works correctly

### P2 (Deferred — Not This Sprint)
- No P2 items deferred; focusing solely on z-index remediation

## Deliverables

1. **Fixed WelcomeModal.tsx** (`src/components/Tutorial/WelcomeModal.tsx`)
   - Line 138: Change `z-[1100]` → `z-50`
   - Maintain all existing functionality (animation, particles, buttons, styling)

2. **Fixed TutorialCompletion.tsx** (`src/components/Tutorial/TutorialCompletion.tsx`)
   - Line 58: Change `z-[1100]` → `z-50`
   - Maintain all existing functionality (confetti, badges, buttons, styling)

3. **New Test File** (`src/__tests__/modalZIndex.test.ts`)
   - Tests verifying z-index values are set correctly
   - Tests verifying modal dismissal behavior

## Acceptance Criteria

1. **AC1: WelcomeModal z-index fixed** — WelcomeModal renders with `z-50` (not `z-[1100]`) and does not block other UI interactions in browser testing
2. **AC2: TutorialCompletion z-index fixed** — TutorialCompletion renders with `z-50` (not `z-[1100]`) and does not block other UI interactions
3. **AC3: Existing tests pass** — All 1915 existing tests continue to pass after z-index changes
4. **AC4: Build passes** — `npm run build` completes with 0 TypeScript errors
5. **AC5: Modal dismissal works** — User can dismiss WelcomeModal and TutorialCompletion correctly (verified via existing tests + new z-index tests)
6. **AC6: New z-index tests added** — At least 5 new tests verify z-index behavior

## Test Methods

### AC1: WelcomeModal z-index
- **Code inspection:** Verify `z-[1100]` not present in WelcomeModal.tsx
- **Unit test:** Import WelcomeModal, check component renders with expected z-index class
- **Browser simulation:** Test that modal can be dismissed and doesn't intercept clicks on lower-z elements

### AC2: TutorialCompletion z-index
- **Code inspection:** Verify `z-[1100]` not present in TutorialCompletion.tsx
- **Unit test:** Import TutorialCompletion, check component renders with expected z-index class

### AC3: Existing tests
- Command: `npm test -- --run`
- Expected: 1915+ tests pass (original 1915 + new tests)

### AC4: Build
- Command: `npm run build`
- Expected: 0 TypeScript errors, bundle generated

### AC5: Modal dismissal
- Existing tests in `WelcomeModal.test.ts` verify dismissal logic
- New z-index tests verify dismissal behavior with corrected z-index

### AC6: New z-index tests
- New test file: `src/__tests__/modalZIndex.test.ts`
- At least 5 tests covering:
  1. WelcomeModal has z-50
  2. TutorialCompletion has z-50
  3. Modal renders without z-[1100]
  4. Modal dismissal updates ref correctly
  5. Modal doesn't render when conditions not met

## Risks

1. **Risk: Tailwind z-50 may be too low** — Some UI panels use z-50; modal should be above them
   - **Mitigation:** z-50 is standard for modals in this codebase (LoadPromptModal, ExportModal, etc.)
   - **Fallback:** Use `z-[100]` if z-50 proves insufficient

2. **Risk: Changing z-index could cause visual stacking issues**
   - **Mitigation:** Both modals only appear as full-screen overlays with backdrop-blur; z-50 is sufficient
   - **Verification:** Visual inspection after fix confirms proper layering

3. **Risk: Existing tests might rely on z-[1100]**
   - **Mitigation:** No tests verify specific z-index values; only behavior is tested

## Failure Conditions

1. **Build fails with TypeScript errors** — Sprint fails
2. **Existing tests drop below 1915** — Sprint fails (indicates regression)
3. **z-[1100] still present in either file** — Sprint fails
4. **New tests fail** — Sprint fails

## Done Definition

**Exact conditions that must be true before claiming round complete:**

1. ✅ `src/components/Tutorial/WelcomeModal.tsx` contains `z-50` and NOT `z-[1100]`
2. ✅ `src/components/Tutorial/TutorialCompletion.tsx` contains `z-50` and NOT `z-[1100]`
3. ✅ `npm test -- --run` shows 1915+ tests passing (original 1915 + new z-index tests)
4. ✅ `npm run build` completes with 0 TypeScript errors
5. ✅ `src/__tests__/modalZIndex.test.ts` exists with ≥5 passing tests
6. ✅ Browser testing is no longer blocked by modal z-index intercept

## Out of Scope

- Any feature additions beyond z-index fix
- Performance optimizations (completed in Round 52)
- UI/UX refinements beyond z-index correction
- Changes to modal animation timing or visual effects
- Addition of new modals or panels
- Changes to store logic or state management
