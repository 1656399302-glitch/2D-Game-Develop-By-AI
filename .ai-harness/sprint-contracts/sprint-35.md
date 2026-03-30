APPROVED

# Sprint Contract — Round 35

## Scope

**Primary Objective:** Fix the persistent "Maximum update depth exceeded" React warnings by correcting the `RecipeDiscoveryToast.tsx` store subscription pattern.

**Root Cause:** `RecipeDiscoveryToast.tsx` line 212 uses full store destructuring (`const { pendingDiscoveries, ... } = useRecipeStore()`) which subscribes to all state changes in the recipe store, triggering cascading re-renders during app initialization.

---

## Spec Traceability

### P0 Items (Must Fix This Round)
- **AC1:** Browser console shows 0 "Maximum update depth exceeded" warnings
- **AC2:** `RecipeDiscoveryToast.tsx` uses `getState()` pattern, NOT full store subscription

### Previously Resolved (Rounds 33-34)
- ✅ AC3: Build with 0 TypeScript errors
- ✅ AC4: All 1562 tests pass
- ✅ AC5: All 8 persist stores use `skipHydration: true`
- ✅ AC6: MutationObserver debounce ≥ 200ms
- ✅ ModulePanel.tsx fixed to use `getState()` pattern
- ✅ RecipeBrowser.tsx fixed to use `getState()` pattern

### Remaining P0/P1 After This Round
- **None** — All P0/P1 items will be resolved when AC1 and AC2 are satisfied.

### P2 Intentionally Deferred
- N/A — This is a remediation-only sprint.

---

## Deliverables

1. **Fixed `src/components/Recipes/RecipeDiscoveryToast.tsx`**
   - Replace line 212 full store destructuring with `getState()` pattern
   - Component must remain fully functional
   - No change to user-facing behavior

---

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC1 | Browser console shows 0 "Maximum update depth exceeded" warnings during app load | Playwright browser test with console monitoring (3 consecutive runs) |
| AC2 | `RecipeDiscoveryToast.tsx` uses `getState()` pattern, NOT full store subscription | Code inspection + grep verification |
| AC3 | `npm run build` completes with 0 TypeScript errors | CLI build command |
| AC4 | All tests pass (expect 1562+) | `npm test -- --run` |
| AC5 | No other components use full store destructuring on frequently-changing stores | Grep verification of components |

---

## Test Methods

1. **Browser Console Verification (AC1)**
   ```bash
   npx playwright test --reporter=list
   ```
   - Monitor console for "Maximum update depth exceeded" warnings
   - Run 3 consecutive times to confirm consistency
   - **Pass:** 0 warnings across all runs
   - **Fail:** Any warnings detected

2. **Code Inspection (AC2)**
   ```bash
   grep -n "useRecipeStore()" src/components/Recipes/RecipeDiscoveryToast.tsx
   ```
   - **Pass:** Only `useRecipeStore.getState()` calls, no `= useRecipeStore()` subscriptions
   - **Fail:** Any `const { ... } = useRecipeStore()` pattern found

3. **Build Verification (AC3)**
   ```bash
   npm run build
   ```
   - **Pass:** 0 TypeScript errors
   - **Fail:** Any TypeScript errors

4. **Test Suite (AC4)**
   ```bash
   npm test -- --run
   ```
   - **Pass:** 1562+ tests pass
   - **Fail:** Any test failures

5. **Comprehensive Component Scan (AC5)**
   ```bash
   grep -rn "= useRecipeStore()" src/components --include="*.tsx"
   grep -rn "= useCodexStore()" src/components --include="*.tsx"
   grep -rn "= useTutorialStore()" src/components --include="*.tsx"
   ```
   - **Pass:** 0 results
   - **Fail:** Any full store subscriptions found

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Fix causes functional regression in toast notifications | Low | Medium | Verify toast functionality works after fix; tests cover behavior |
| `getState()` pattern causes TypeScript type errors | Low | Low | Pattern already proven in ModulePanel.tsx and RecipeBrowser.tsx |
| Warnings persist from different root cause | Very Low | High | Verified in R34 that RecipeDiscoveryToast.tsx is the remaining cause |

---

## Failure Conditions

The round **MUST FAIL** if ANY of the following are true:

1. **Browser verification detects ≥1 "Maximum update depth exceeded" warning**
2. **`RecipeDiscoveryToast.tsx` still contains full store destructuring pattern**
3. **`npm run build` fails with any TypeScript errors**
4. **Test suite has any failures**

---

## Done Definition

All of the following must be TRUE before claiming round complete:

1. ✅ `RecipeDiscoveryToast.tsx` line 212 uses `useRecipeStore.getState()` pattern (not `= useRecipeStore()`)
2. ✅ `npm run build` produces 0 TypeScript errors
3. ✅ All 1562+ tests pass
4. ✅ Browser console shows 0 "Maximum update depth exceeded" warnings (3 consecutive runs)
5. ✅ Grep confirms no full store subscriptions in RecipeDiscoveryToast.tsx
6. ✅ Grep confirms no full store subscriptions in any other component

---

## Out of Scope

- Adding new features
- Visual/UX changes
- Test additions (unless needed for regression)
- Module library changes
- Store schema changes
- Any code outside `src/components/Recipes/RecipeDiscoveryToast.tsx` (unless needed for regression)

---

## Implementation Guidance

**Required Change Pattern:**

```typescript
// BEFORE (line 212):
const { pendingDiscoveries, getNextPendingDiscovery, clearPendingDiscoveries, markAsSeen } = useRecipeStore();

// AFTER — Option 1 (preferred, consistent with ModulePanel.tsx):
const pendingDiscoveries = useRecipeStore.getState().pendingDiscoveries;
const getNextPendingDiscovery = useRecipeStore.getState().getNextPendingDiscovery;
const clearPendingDiscoveries = useRecipeStore.getState().clearPendingDiscoveries;
const markAsSeen = (id: string) => useRecipeStore.getState().markAsSeen(id);

// AFTER — Option 2 (if hooks needed for lifecycle):
const getPendingDiscoveries = useCallback(() => useRecipeStore.getState().pendingDiscoveries, []);
const getNextPendingDiscovery = useCallback(() => useRecipeStore.getState().getNextPendingDiscovery(), []);
const clearPendingDiscoveries = useCallback(() => useRecipeStore.getState().clearPendingDiscoveries(), []);
const markAsSeen = useCallback((id: string) => useRecipeStore.getState().markAsSeen(id), []);
```

**Verification Steps:**
1. Make the fix
2. Run `npm run build` — expect 0 errors
3. Run `npm test -- --run` — expect 1562+ passes
4. Run browser test — expect 0 warnings

---

## QA Evaluation — Round 34 (Context)

**Why Round 34 Failed:**
- Browser verification showed 10-11 "Maximum update depth exceeded" warnings
- `RecipeDiscoveryToast.tsx:212` was NOT fixed despite being identified as the root cause
- ModulePanel.tsx and RecipeBrowser.tsx were correctly fixed, but the third component was missed

**Root Cause Still Valid:**
```typescript
// This line in RecipeDiscoveryToast.tsx causes cascading re-renders:
const { pendingDiscoveries, getNextPendingDiscovery, clearPendingDiscoveries, markAsSeen } = useRecipeStore();
```

**Fix Status from Previous Rounds:**
- ✅ All 8 persist stores use `skipHydration: true`
- ✅ ModulePanel.tsx uses `getState()` pattern
- ✅ RecipeBrowser.tsx uses `useCallback` with `getState()`
- ✅ MutationObserver debounce is 200ms
- ❌ RecipeDiscoveryToast.tsx NOT YET FIXED — THIS ROUND'S TARGET
