APPROVED

# Sprint Contract — Round 32

## Scope

**Primary Objective:** Fix remaining "Maximum update depth exceeded" React warnings (AC6) by identifying and resolving all components still causing infinite re-render loops during app load.

**Focus:** Remediation of persistent React warning issue identified in Round 31 feedback.

## Spec Traceability

### P0 Items (Must Fix)
- **AC6 Browser Verification:** Eliminate all "Maximum update depth exceeded" warnings
  - Root cause investigation across all components
  - Fix WelcomeModal.tsx `shouldShowModal` pattern
  - Fix any other components with similar infinite loop patterns

### P1 Items (Covered by P0)
- All previously working features remain functional
- Build continues to succeed with 0 TypeScript errors
- All tests continue to pass

### Remaining P0/P1 After This Round
- None (this is a remediation sprint)

### P2 Intentionally Deferred
- Feature additions or enhancements
- Performance optimizations beyond warning elimination

## Deliverables

1. **Fixed WelcomeModal.tsx**
   - Rewrite `shouldShowModal` logic to avoid computed value in useEffect deps
   - Add hydration guard to prevent loops during Zustand persist hydration
   - Convert reactive store subscription to stable initialization

2. **Fixed TutorialOverlay.tsx (if needed)**
   - Review useEffect hooks for dependency array issues
   - Apply ref-based pattern if store actions found in deps

3. **Browser Verification Proof**
   - Console output showing 0 "Maximum update depth exceeded" warnings
   - Confirmation that warnings are eliminated

## Acceptance Criteria

1. **AC1:** WelcomeModal.tsx no longer has `shouldShowModal` in any useEffect dependency array
2. **AC2:** WelcomeModal.tsx has hydration guard to prevent re-render loops during Zustand persist hydration
3. **AC3:** App.tsx maintains existing ref-based patterns (checkTutorialUnlock, markStateAsLoaded)
4. **AC4:** All other components reviewed for similar patterns; any found are fixed
5. **AC5:** npm run build completes with 0 TypeScript errors
6. **AC6:** Browser verification shows 0 "Maximum update depth exceeded" warnings (10 → 0)
7. **AC7:** All existing functionality continues to work
8. **AC8:** All 1559 existing tests continue to pass

## Test Methods

1. **Code Inspection (AC1-AC4):**
   - Grep search for `useEffect.*\[.*shouldShowModal` pattern
   - Grep search for store actions in useEffect dependency arrays
   - Manual review of WelcomeModal.tsx useEffect hooks

2. **Build Verification (AC5):**
   ```bash
   npm run build
   ```
   Expected: 0 TypeScript errors, clean bundle

3. **Test Suite (AC8):**
   ```bash
   npm test
   ```
   Expected: All 1559 tests pass

4. **Browser Verification (AC6):**
   ```bash
   npm run dev &
   # Open browser console, observe for warnings
   ```
   Expected: 0 "Maximum update depth exceeded" warnings

## Risks

1. **Round-specific Implementation Risks:**
   - WelcomeModal hydration logic may be tricky due to Zustand persist timing
   - Fix must not break the welcome modal functionality entirely

2. **Verification Risks:**
   - Browser verification may show warnings from a different source than identified
   - May need to investigate additional components if WelcomeModal fix is insufficient

## Failure Conditions

The round fails if:
1. npm run build produces any TypeScript errors
2. Any of the 1559 tests fail
3. Browser verification still shows "Maximum update depth exceeded" warnings
4. Welcome modal functionality is broken (modal doesn't show when it should, or shows when it shouldn't)

## Done Definition

**Exact conditions that must be true before claiming round complete:**

1. ✅ Grep search confirms no `shouldShowModal` in any useEffect dependency array
2. ✅ Grep search confirms no store actions in any useEffect dependency arrays (excluding refs pattern)
3. ✅ WelcomeModal.tsx has explicit hydration guard comment and implementation
4. ✅ npm run build completes with 0 TypeScript errors
5. ✅ npm test passes (1559/1559 tests)
6. ✅ Browser verification: 0 "Maximum update depth exceeded" warnings
7. ✅ Welcome modal shows correctly on fresh load (user hasn't seen it)
8. ✅ Welcome modal does not show after user has dismissed it

## Out of Scope

- Feature additions or enhancements
- Performance optimizations beyond warning elimination
- UI/UX changes unrelated to warning fix
- Addition of new tests (unless necessary to verify fix)
- Changes to Zustand store architecture
