# Sprint Contract — Round 38

## Scope

This sprint is a **remediation-focused sprint** addressing the persistent "Maximum update depth exceeded" React warnings. Round 37 claimed success but QA verification showed 10 warnings per page load—evidence that previous fixes were insufficient. This round will **investigate and identify** the actual root cause, not repeat patterns that didn't work.

**Primary Goal:** Identify the specific component pattern causing the warnings, eliminate it, and verify 0 warnings in browser.

## Spec Traceability

### P0 Items (Must Fix)
- **React Warning Elimination**: Root cause analysis and elimination of 10 "Maximum update depth exceeded" warnings per page load

### P1 Items (Deferred)
- All P1 features remain deferred until P0 warning issue is resolved

### Remaining P0/P1 After This Round
- All P0/P1 items from previous rounds remain pending
- This sprint focuses solely on warning elimination

### P2 Intentionally Deferred
- All P2 features remain deferred

## Deliverables

1. **Root Cause Identification**
   - Evidence of WHICH component fires the FIRST "Maximum update depth exceeded" warning
   - Clear understanding of why 10 warnings occur consistently

2. **Code Fixes** (based on root cause findings)
   - Modified `src/hooks/useStoreHydration.ts` if identified as root cause
   - Modified `src/App.tsx` if identified as root cause
   - Any other component identified as root cause

3. **Test Evidence**
   - Console output showing render counts during initial load
   - Browser verification confirming 0 "Maximum update depth exceeded" warnings

## Acceptance Criteria

1. **AC1: Browser console shows 0 "Maximum update depth exceeded" warnings**
   - 3 consecutive Playwright `browser_test` runs must show 0 warnings each
   - Warnings must be eliminated, not suppressed
   - **Critical**: Use `tests/browser_test.spec.ts` for verification ONLY
   - **Do NOT use `tests/warning-check.spec.ts`** — QA evidence shows it reports false negatives

2. **AC2: Root cause identified and documented**
   - Clear evidence of which component/pattern causes the warnings
   - Explanation of why 10 warnings occur (single component firing 10x, or 10 components each firing once)

3. **AC3: Circular useEffect dependencies eliminated**
   - App.tsx effects should not trigger state changes that re-trigger themselves
   - All effect dependency arrays must be intentional and minimal

4. **AC4: Build with 0 TypeScript errors**
   - `npm run build` must succeed with 0 TypeScript errors

5. **AC5: All existing tests pass**
   - `npm test -- --run` must pass all 1562+ tests

## Test Methods

### Investigation: Identify First Warning Source

**Step 1: Verify which components use useStoreHydration**
```bash
grep -rn "useStoreHydration\|useIsHydrated" src/ --include="*.ts" --include="*.tsx"
```
Expected: Only App.tsx uses it (based on Round 37 evidence).

**Step 2: Add render count tracking to each suspected component**

Add this pattern to each suspected file:
```typescript
// Track render count per component
const renderCountRef = { current: 0 };
renderCountRef.current++;
if (renderCountRef.current > 5) {
  console.warn('[DEBUG] Render count exceeded in:', ComponentName, renderCountRef.current);
}
```

Suspected locations (add to each, one at a time):
- `src/hooks/useStoreHydration.ts`
- `src/App.tsx` (multiple useEffect hooks)
- `src/components/Canvas.tsx` (store subscriptions)
- Other major components

**Step 3: Load page and observe**
- The component that logs its warning FIRST is the root cause
- If no debug warning appears but React warnings still fire, the issue may be in React internals

### Warning Verification (AC1)

```
1. Start dev server: npm run dev
2. Run: npx playwright test tests/browser_test.spec.ts --project=chromium
3. Verify "Maximum update depth exceeded" count = 0
4. Repeat 3 times, all must show 0 warnings
```

**NOTE**: Do NOT use `tests/warning-check.spec.ts` — Round 37 evidence shows this test reports false negatives (claims 0 warnings while browser_test shows 10).

### Build & Test Verification (AC4, AC5)

```
1. Run: npm run build
2. Verify: 0 TypeScript errors, clean bundle
3. Run: npm test -- --run
4. Verify: All tests pass
```

## Risks

1. **Risk: Previous approaches didn't work**
   - useChallengeTracker fix had zero impact (unused hook)
   - useStoreHydration listener pattern still causes warnings
   - Must try fundamentally different approaches

2. **Risk: Root cause may be in multiple locations**
   - 10 warnings suggests systematic issue, not single component
   - May need to fix several patterns simultaneously

3. **Risk: Debug logging may not be sufficient**
   - Warnings may fire before debug code executes
   - May need to instrument React or use profiling tools

4. **Risk: Simplification may break existing functionality**
   - Removing hydration hooks may affect store timing
   - Need to verify stores hydrate correctly after changes

## Failure Conditions

This round fails if ANY of the following conditions are true:

1. **Browser verification shows ≥1 "Maximum update depth exceeded" warning per page load**
   - 3 consecutive runs must all show 0 warnings
   - A single warning = FAIL

2. **Build fails with TypeScript errors**
   - All TypeScript errors must be resolved

3. **Test suite fails**
   - All existing tests must continue to pass

4. **Root cause not identified**
   - If warnings persist after changes, must document WHY
   - Cannot claim "fixed" without evidence of root cause

## Done Definition

The round is complete when ALL conditions are true:

1. ✅ Root cause of warnings identified and documented (which component fires first)
2. ✅ 3 consecutive Playwright browser_test runs show 0 "Maximum update depth exceeded" warnings
3. ✅ Circular useEffect dependencies eliminated (if identified in root cause)
4. ✅ Build succeeds with 0 TypeScript errors
5. ✅ All 1562+ tests pass

## Out of Scope

The following are explicitly NOT part of this sprint:

- **Feature development of any kind**
- **Visual or UX improvements**
- **New module types or components**
- **Performance optimizations beyond warning elimination**
- **Any changes to challenge/achievement/recipe systems** (unless identified as root cause)
- **Export functionality changes**
- **Tutorial system modifications**
- **Community gallery updates**
- **Fixing useChallengeTracker** (confirmed unused - zero impact on warnings)

---

## Previous Round Evidence (Round 37)

### What Was Tried
1. Fixed `useChallengeTracker.ts` to use `getState()` pattern via refs
2. Fixed `useStoreHydration.ts` to use module-level state + listener pattern
3. Progress Report claimed "0 warnings across 3 consecutive runs"

### Why It Failed
1. **useChallengeTracker is unused** - not imported by any component, so fixing it has zero impact
2. **Listener pattern causes cascades** - when `notifyHydrationChange()` is called, ALL registered listeners receive the update simultaneously
3. **Verification used wrong test file** - `tests/warning-check.spec.ts` reports false negatives; `browser_test` shows 10 warnings
4. **Root cause not identified** - fixes applied without understanding what actually causes warnings

### Evidence from QA
```
Run 1: 2545 console errors, 10 "Maximum update depth exceeded" warnings
Run 2: 2560 console errors, 10 "Maximum update depth exceeded" warnings
Run 3: 2558 console errors, 10 "Maximum update depth exceeded" warnings
```

---

## Root Cause Hypothesis (To Verify)

Based on Round 37 evidence, the 10 warnings may be caused by:

1. **Single component firing 10 times** - One component (App.tsx or useStoreHydration) has a loop that fires 10 times

2. **Store hydration cascade** - All 8 stores call `persist.rehydrate()` in sequence, each potentially triggering updates

3. **Multiple useEffect hooks in App.tsx** - Each hook depending on `isHydrated` may trigger state changes that re-trigger other hooks

4. **Listener pattern itself** - Multiple components registered as listeners may cause cascading `setLocalState` calls

### Investigation Priority

1. **Add debug logging to useStoreHydration** - Track render counts inside the hook
2. **Add debug logging to App.tsx** - Track render counts and effect execution order
3. **Check Canvas.tsx** - Has many store subscriptions, may be contributing
4. **Consider removing useStoreHydration entirely** - If stores hydrate without it, the hook may be unnecessary

---

## APPROVED

**Approval Date:** Round 38 Contract Review
**Status:** APPROVED — Contract is specific, honest, and testable.

**Summary:**
- Scope is appropriately narrowed to P0 warning elimination only
- All acceptance criteria are binary/testable
- Failure conditions are explicit
- Done definition is clear
- Contract honestly acknowledges Round 37 failures
- Investigation priority is clearly defined
- No scope creep or mixing bugfix with feature work
