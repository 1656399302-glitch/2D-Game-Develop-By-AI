APPROVED

# Sprint Contract — Round 33

## Scope

**Remediation Sprint: Eliminate all "Maximum update depth exceeded" React warnings**

Round 32 correctly fixed WelcomeModal.tsx but 10 warnings persisted from other sources. This sprint identifies and fixes all remaining sources of cascading useEffect updates.

## Spec Traceability

- **P0 items covered this round:**
  - AC6: Browser verification shows 0 "Maximum update depth exceeded" warnings

- **P1 items covered this round:**
  - AC1-AC8 from Round 32 (verification of fix patterns)
  - Grep verification of no store actions in useEffect dependency arrays

- **Remaining P0/P1 after this round:**
  - None — all P0/P1 items resolved

- **P2 intentionally deferred:**
  - Feature additions
  - UI polish
  - Performance optimizations beyond warning elimination

## Deliverables

1. **`src/components/Tutorial/WelcomeModal.tsx`** — Fixed `useWelcomeModal` hook
   - Ref-based store action access (actions accessed via refs, not direct subscription)
   - Synchronous localStorage for initial state computation
   - Store actions called only from event handlers, never from useEffect

2. **`src/components/Tutorial/TutorialOverlay.tsx`** — Fixed callback/dependency loop
   - `currentStepData` memoized with `useMemo` to prevent new object each render
   - Callbacks use stable primitive dependencies only
   - Event callback props stored in refs to prevent effect dependency issues

3. **Verification artifacts**
   - Build succeeds with 0 TypeScript errors
   - All 1562 tests pass
   - Grep verification confirms no prohibited patterns
   - Browser verification confirms 0 warnings

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC1 | Browser console shows 0 "Maximum update depth exceeded" warnings | Playwright console monitoring |
| AC2 | Build with 0 TypeScript errors | `npm run build` |
| AC3 | All 1562+ tests pass | `npm test` |
| AC4 | No store actions in useEffect deps | `grep -rn "useEffect.*\[.*Store\." src/` |
| AC5 | No shouldShowModal in useEffect deps | `grep -rn "useEffect.*\[.*shouldShowModal" src/` |
| AC6 | useWelcomeModal uses ref-based store access | Code inspection |
| AC7 | TutorialOverlay uses useCallback with stable deps | Code inspection |
| AC8 | Application functions correctly | Tests pass + browser verification |

## Test Methods

1. **Browser console check (Playwright):**
   ```bash
   npx playwright test --project=chromium
   # Expected: 0 "Maximum update depth exceeded" warnings
   ```

2. **Build verification:**
   ```bash
   npm run build
   # Expected: 0 TypeScript errors, successful bundle
   ```

3. **Test suite:**
   ```bash
   npm test
   # Expected: 68 test files, 1562 tests passed
   ```

4. **Grep verification (no prohibited patterns):**
   ```bash
   grep -rn "useEffect.*\[.*Store\." src/ --include="*.tsx"
   grep -rn "useEffect.*\[.*shouldShowModal" src/ --include="*.tsx"
   # Expected: No matches for either
   ```

## Risks

| Risk | Mitigation | Status |
|------|------------|--------|
| Additional sources beyond identified components | Automated browser test verifies all warnings eliminated | Low |
| Fixing one component breaks another | All 1562 tests pass | Low |
| Zustand hydration timing triggers updates | Ref-based store action access in useWelcomeModal | Mitigated |

## Failure Conditions

This round **FAILS** if any of the following are true:

1. Build fails with TypeScript errors
2. Any existing test fails
3. Grep verification finds prohibited patterns (store actions or shouldShowModal in useEffect deps)
4. Browser verification detects any "Maximum update depth exceeded" warnings

## Done Definition

The round is complete when ALL of the following are true:

1. ☐ Browser console shows 0 "Maximum update depth exceeded" warnings
2. ☐ Build succeeds with 0 TypeScript errors
3. ☐ All 1562 tests pass
4. ☐ Grep verification returns 0 matches for prohibited patterns
5. ☐ Code inspection confirms:
   - `useWelcomeModal` uses ref-based store action access
   - `TutorialOverlay` uses `useMemo` and `useCallback` with stable dependencies

## Out of Scope

- Feature additions or enhancements
- UI polish or visual improvements
- Performance optimizations beyond warning elimination
- Changes to store persistence mechanisms
- Tutorial content or flow changes
