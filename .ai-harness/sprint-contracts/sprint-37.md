# Sprint Contract — Round 37

## Scope

Fix the remaining "Maximum update depth exceeded" React warnings by addressing the two primary sources identified in Round 36 QA evaluation. The consistent 10-warning count across multiple runs (2585→2583→4149 in Round 35, 4398→4131→4162 in Round 36) indicates **systematic issues** in these two hooks, not component-level patterns.

**Primary Culprits:**
1. **`src/hooks/useChallengeTracker.ts`** — Uses full store subscription with state-dependent callbacks that trigger re-renders in a loop
2. **`src/hooks/useStoreHydration.ts`** — `setTimeout(() => triggerHydration(), 0)` pattern with `setHydrationState` may trigger cascading effects across multiple components simultaneously

**Required Investigation First:** Before declaring hooks fixed, MUST verify which components trigger warnings FIRST via debugging.

## Spec Traceability

- **P0:** AC1 — Fix 0 browser console warnings (must achieve this round)
- **P0:** AC2 — Fix `useChallengeTracker.ts` update loop
- **P0:** AC3 — Fix `useStoreHydration.ts` cascade pattern
- **P0:** AC4 — Investigation confirms identified hooks are the only remaining sources
- **P1:** AC5 — Ensure 0 TypeScript errors
- **P1:** AC6 — Ensure all tests pass
- **P2:** Code quality improvements (deferred)

## Deliverables

1. **`INVESTIGATION FIRST`** — Temporary debugging code added to identify warning trigger order
2. **`src/hooks/useChallengeTracker.ts`** — Refactored to use ref-based store access pattern (no full subscriptions with state-dependent callbacks)
3. **`src/hooks/useStoreHydration.ts`** — Refactored to use stable hydration pattern without cascading setState calls
4. **Browser verification** — Zero "Maximum update depth exceeded" warnings across 3 consecutive Playwright page loads
5. **Build verification** — Zero TypeScript errors
6. **Test verification** — All tests pass

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| **AC1** | Browser console shows **0** "Maximum update depth exceeded" warnings across 3 consecutive page loads | Playwright browser test monitoring console errors/warnings |
| **AC2** | `useChallengeTracker.ts` uses `getState()` pattern via refs — no full store subscriptions with state-dependent callbacks | Code inspection |
| **AC3** | `useStoreHydration.ts` uses stable hydration pattern — no cascading `setHydrationState` calls triggered by state changes | Code inspection |
| **AC4** | Investigation confirms identified hooks are the ONLY remaining warning sources — debugging identifies same 10 warnings from these hooks | Debug code + code inspection |
| **AC5** | Build completes with 0 TypeScript errors | `npm run build` |
| **AC6** | All existing tests pass | `npm test -- --run` |

## Test Methods

### AC1: Browser Console Verification (CRITICAL — MUST PASS)

**Test Script:** `browser_test.js` or equivalent Playwright test

```
Procedure:
1. Launch browser (Chromium)
2. Navigate to http://localhost:5173
3. Wait for page to fully load (networkidle + 2 second delay)
4. Collect ALL console messages (errors + warnings)
5. Count "Maximum update depth exceeded" occurrences
6. Repeat steps 1-5 for 3 consecutive runs
```

**Pass Condition:** 0 warnings across ALL 3 runs

**Fail Condition:** Any warnings detected in ANY run

### AC4: Investigation Verification (NEW — MUST RUN BEFORE DECLARING FIXES COMPLETE)

**Step 1: Add Debug Code to useStoreHydration**
```typescript
// Temporarily add to useStoreHydration.ts render tracking:
const renderCountRef = useRef(0);
renderCountRef.current++;
if (renderCountRef.current > 10) {
  console.warn('[useStoreHydration] Render count exceeded: ', renderCountRef.current);
}
```

**Step 2: Add Debug Code to useChallengeTracker**
```typescript
// Temporarily add to useChallengeTracker.ts render tracking:
const renderCountRef = useRef(0);
renderCountRef.current++;
if (renderCountRef.current > 10) {
  console.warn('[useChallengeTracker] Render count exceeded: ', renderCountRef.current);
}
```

**Step 3: Run Browser Test**
```
Run Playwright test and observe which debug warnings fire FIRST
```

**Pass Condition:** Debug warnings show these two hooks as the trigger sources, confirming they are the primary culprits

### AC2: Code Inspection — useChallengeTracker.ts

**Verification:**
```bash
grep -n "subscribe" src/hooks/useChallengeTracker.ts  # Should find no subscribe calls
grep -n "getState" src/hooks/useChallengeTracker.ts    # Should find getState() calls
grep -n "useRef" src/hooks/useChallengeTracker.ts      # Should find useRef for stable references
```

**Pass Condition:** Uses `useRef` + `getState()` pattern, no `useStore()` subscriptions with state-dependent callbacks

### AC3: Code Inspection — useStoreHydration.ts

**Verification:**
```bash
grep -n "setHydrationState" src/hooks/useStoreHydration.ts  # Check where called
grep -n "setTimeout.*triggerHydration" src/hooks/useStoreHydration.ts  # Check pattern
```

**Pass Condition:** Hydration state changes are stable, don't trigger cascading updates. No `setHydrationState` calls inside effects that depend on state changes.

### AC5: Build Verification

```bash
npm run build
```

**Pass Condition:** 0 TypeScript errors, bundle generated

### AC6: Test Verification

```bash
npm test -- --run
```

**Pass Condition:** All tests passing

## Risks

| Risk | Mitigation |
|------|------------|
| **Fixing one source may unmask others** | If warnings persist after fixing these two, additional investigation is required. AC4 requires confirming these are the ONLY sources before declaring fix complete. |
| **Refactoring hooks may break functionality** | Ensure callback behaviors (event tracking, hydration) remain identical — tests verify functionality |
| **Hydration timing changes** | Test that app still initializes correctly after hydration pattern changes |
| **10 warnings may split across other sources** | If debugging reveals warnings from OTHER sources after fixing these hooks, round is FAIL |

## Failure Conditions

The round **MUST FAIL** if ANY of the following occur:

1. **AC1 NOT satisfied:** Any "Maximum update depth exceeded" warnings detected in browser verification (hard fail per Round 36 QA)
2. **AC4 NOT satisfied:** Investigation reveals warnings from sources OTHER than the two identified hooks
3. **AC5 NOT satisfied:** TypeScript errors after changes
4. **AC6 NOT satisfied:** Any test failures

## Done Definition

**Exact conditions** that must ALL be true before claiming round complete:

1. ✅ `npm run build` succeeds with 0 TypeScript errors
2. ✅ `npm test -- --run` shows all tests passing
3. ✅ **AC4 Verification Complete:** Debug code confirms the two identified hooks are the ONLY trigger sources (no other components)
4. ✅ **AC2 Verified:** `useChallengeTracker.ts` uses `useRef` + `getState()` pattern (no state-dependent subscriptions)
5. ✅ **AC3 Verified:** `useStoreHydration.ts` uses stable hydration pattern (no cascading setState)
6. ✅ **Browser verification:** Playwright test confirms **0** "Maximum update depth exceeded" warnings across **all 3 consecutive page loads**

**Critical:** 
- Do NOT skip the AC4 investigation phase — debugging MUST confirm these are the only sources
- Do NOT claim round complete if browser verification has NOT been run and shows 0 warnings
- The Round 36 Progress Report was rejected because it claimed "0 warnings" without evidence matching actual browser verification

## Out of Scope

- No changes to the 9 components fixed in Round 36 (ChallengeButton, TutorialOverlay, CommunityGallery, CodexView, FactionPanel, TechTree, PublishModal, Toolbar, ModulePanel)
- No changes to store implementations (they already use `skipHydration: true`)
- No new features or functionality changes
- No changes to component-level fixes from Round 36
- No changes to Zustand persist middleware (not identified as source)

## Previous Round Context (Round 36 QA)

**Verdict:** FAIL — AC1 not satisfied (10 warnings persist per page load)

**Root Cause Findings:**
- 9 components were fixed correctly with proper patterns
- 10 warnings persist consistently, indicating systematic issues in these two hooks
- `useStoreHydration` uses `setTimeout(() => triggerHydration(), 0)` which may cascade effects
- `useChallengeTracker` uses full store subscription with state-dependent callbacks
- The consistent 10-warning count across multiple runs proves systematic root cause

**Critical Lesson:** The consistent 10-warning count indicates systematic issues in these two hooks, not component-level patterns. Investigation via debug code is REQUIRED before declaring fixes complete.

---

**APPROVED**
