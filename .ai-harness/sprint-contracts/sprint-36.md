# Sprint Contract — Round 36

## Scope

**Primary Focus:** Fix the persistent "Maximum update depth exceeded" React warnings that have been blocking release since Round 35.

**Root Cause Identified (Partial):** `ChallengeButton.tsx` line 13 uses `useChallengeStore((state) => state.getCompletedCount())`, which calls a method inside the selector. While this returns a primitive value, the selector function itself changes on every store update, causing Zustand to re-evaluate subscriptions and potentially trigger cascading re-renders.

**Known Problem:** The consistent 10-warning count across multiple runs in Round 35 (2585 → 2583 → 4149 cumulative) strongly suggests there are additional unidentified sources beyond `ChallengeButton.tsx`. Fixing `ChallengeButton.tsx` is necessary but NOT sufficient to eliminate all warnings.

**Investigation Required:** This round MUST include systematic investigation to identify and fix ALL warning sources, not just `ChallengeButton.tsx`.

## Spec Traceability

### P0 Items (Must Fix This Round)
- **Fix `ChallengeButton.tsx` store subscription pattern** — Replace method-in-selector with `getState()` pattern
- **Identify additional warning sources** — Use React DevTools Profiler, targeted console logging, and systematic code review to find ALL components contributing to the 10-warning pattern
- **Fix all identified additional sources** — Apply correct patterns to any components found contributing to warnings
- **Verify 0 warnings** — Confirm browser shows no "Maximum update depth exceeded" warnings across 3 consecutive page loads

### P1 Items (Covered by Previous Rounds, Verification Only)
- `RecipeDiscoveryToast.tsx` pattern fix (Round 35) — Verified working, no additional fixes needed
- `skipHydration: true` on all persist stores — Verified working
- No full store destructuring patterns in components — Verified (except ChallengeButton.tsx which needs fixing)

### Remaining P0/P1 After This Round
- None — this is a remediation-only sprint targeting complete warning elimination

### P2 Items Intentionally Deferred
- None affected by this remediation

## Deliverables

1. **Fixed `src/components/Challenges/ChallengeButton.tsx`**
   - Line 13: Replace `useChallengeStore((state) => state.getCompletedCount())` with `useChallengeStore.getState().getCompletedCount()`
   - Component must render correctly with completion count badge

2. **Investigation Report**
   - Document findings from systematic investigation of remaining warning sources
   - Identify which components or patterns are causing the 10-warning baseline
   - Include evidence (console output, profiler traces, or code analysis)

3. **Additional Fixes (Required if AC1 fails after ChallengeButton fix)**
   - Fix all additional components identified in investigation
   - Apply correct `getState()` + `useCallback` patterns where needed

4. **Browser Verification Evidence**
   - 3 consecutive Playwright test runs with 0 "Maximum update depth exceeded" warnings each
   - If warnings persist: Include evidence of investigation + all fixes applied

## Acceptance Criteria

1. **AC1:** Browser verification detects 0 "Maximum update depth exceeded" warnings across 3 consecutive page loads
2. **AC2:** `ChallengeButton.tsx` uses `getState()` pattern (not selector-with-method-call)
3. **AC3:** Build completes with 0 TypeScript errors
4. **AC4:** All 1562+ existing tests continue to pass
5. **AC5:** Challenge button displays correct completion count (e.g., "3/12")
6. **AC6:** Investigation has been performed to identify all warning sources (documented even if none found beyond ChallengeButton)

## Test Methods

1. **AC1 Verification:** Run Playwright browser test with console monitoring, 3 times consecutively
   - Command: `npm run browser_test` or similar console monitoring script
   - Pass: 0 warnings in each run
   - If warnings persist: This indicates additional sources beyond ChallengeButton.tsx

2. **AC2 Verification:** Code inspection of `ChallengeButton.tsx`
   - Pattern to find (FAIL): `useChallengeStore((state) => state.methodName())`
   - Pattern to find (PASS): `useChallengeStore.getState().methodName()`
   - Or equivalently: `useMemo(() => useChallengeStore.getState().methodName(), [])`

3. **AC3 Verification:** `npm run build`
   - Pass: 0 TypeScript errors

4. **AC4 Verification:** `npm test -- --run`
   - Pass: All tests pass

5. **AC5 Verification:** Manual inspection or screenshot of rendered button
   - Badge shows "X/Y" where Y = total challenges

6. **AC6 Verification:** Evidence of systematic investigation
   - Investigation report file exists in workspace OR
   - Grep/console output showing targeted search for subscription patterns across all components

**Investigation Path (if AC1 fails after AC2 fix):**

Step 1: Grep all Zustand subscriptions in components
```bash
grep -rn "useChallengeStore\|useRecipeStore\|useTutorialStore" src/components --include="*.tsx" | grep -v "getState\|useCallback"
```

Step 2: Check hydration-related code
```bash
grep -rn "useStoreHydration\|triggerHydration\|skipHydration" src --include="*.ts*" -A2 -B2
```

Step 3: Add temporary console logging to identify which component triggers warnings
- Add `console.warn('Render: ComponentName')` to suspected components
- Run browser_test and observe warning sequence

Step 4: Use React DevTools Profiler if available to identify update loops

## Risks

1. **Unknown Additional Sources (HIGH)** — Round 35 showed 10 warnings persist even after RecipeDiscoveryToast fix. If ChallengeButton.tsx fix doesn't eliminate all warnings, further investigation is mandatory. The consistent 10-warning count strongly suggests additional components.

2. **Hydration Timing (MEDIUM)** — The `useStoreHydration` hook triggers hydration with `setTimeout(() => triggerHydration(), 0)` which may create race conditions. If investigation reveals hydration issues, the entire hydration sequence may need review.

3. **Grep False Negatives (LOW)** — Search patterns may miss edge cases. Full codebase review may be needed if AC1 still fails after targeted fixes.

4. **Warning Source May Be in Hooks/Utils (MEDIUM)** — The warning source might not be in components directly but in shared hooks, utilities, or store middleware.

## Failure Conditions

The round must FAIL if any of the following occur:

1. **AC1 fails** — Any "Maximum update depth exceeded" warnings detected in browser verification (even 1 warning)
2. **AC3 fails** — Build produces TypeScript errors
3. **AC4 fails** — Any tests fail
4. **No investigation performed** — AC6 not satisfied and AC1 fails

## Done Definition

Exact conditions that must be true before claiming round complete:

1. ✅ `ChallengeButton.tsx` has been modified to use `useChallengeStore.getState().getCompletedCount()` instead of the selector pattern
2. ✅ Systematic investigation has been performed to identify ALL warning sources
3. ✅ If AC1 still fails after ChallengeButton fix: Additional warning sources have been identified AND fixed
4. ✅ `npm run build` completes with 0 TypeScript errors
5. ✅ `npm test -- --run` shows all tests passing
6. ✅ Browser verification via Playwright shows 0 "Maximum update depth exceeded" warnings on 3 consecutive page loads

## Out of Scope

- **No new features** — This is a remediation-only sprint
- **No refactoring of `useStoreHydration`** — The hydration hook pattern was not identified as the root cause (pending investigation)
- **No visual changes** — The button appearance must remain unchanged
- **No behavioral changes** — The completion count display must work identically to before
- **No deferral of warning elimination** — AC1 must be satisfied; warnings cannot be acknowledged and moved to P2

## Investigation Requirements

Since Round 35 revealed 10 warnings persist despite `RecipeDiscoveryToast.tsx` being fixed, this round MUST include explicit investigation steps:

1. **Grep all Zustand selector patterns** — Find any remaining `useStore((state) => state.method())` patterns
2. **Check all store subscriptions** — Even primitives returned from selectors may cause issues if the selector function reference changes
3. **Review hydration sequence** — Check if `useStoreHydration` and its consumers create update loops
4. **Profile if needed** — Use React DevTools or console logging to identify warning source

**Honest acknowledgment:** We do not know all the sources of the 10-warning pattern. The investigation is REQUIRED, not optional.
