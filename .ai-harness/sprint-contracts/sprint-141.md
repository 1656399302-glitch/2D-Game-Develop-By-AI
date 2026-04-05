# Sprint Contract — Round 141

## APPROVED

## Operator Inbox Compliance

Reviewed `.ai-harness/runtime/operator-inbox.json`:
- **Pending inbox items targeting this round:** None
- **Previously processed inbox items:** All 4 inbox items have been processed in prior rounds (Rounds 51, 85, 103, 106)
- **This contract does not weaken any operator inbox instructions** — no inbox mandates are in scope this round

## Scope

Fix missing store hydration for three Zustand persist stores that have `skipHydration: true` and hydration helper functions but are NOT wired into the central `useStoreHydration.ts` hook. This bug causes user data (comparison state, sub-circuits, settings) to not load on page refresh.

## Spec Traceability

### P0 Items (Critical Bug Fix)
- **AC-141-001:** Add `hydrateComparisonStore` to central hydration hook
- **AC-141-002:** Add `hydrateSubCircuitStore` to central hydration hook
- **AC-141-003:** Add `hydrateSettingsStore` to central hydration hook

### P1 Items
- **AC-141-004:** Add hydration integration tests for each missing store

### Remaining P0/P1 After This Round
- All P0/P1 items from spec.md remain intact; this round is a targeted bug fix

### P2 Intentionally Deferred
- Performance optimizations unrelated to hydration
- New feature development

## Deliverables

1. **`src/hooks/useStoreHydration.ts`**: Updated to import and call hydration functions for `useComparisonStore`, `useSubCircuitStore`, and `useSettingsStore`

2. **`src/__tests__/storeHydration.test.ts`**: New tests verifying hydration for the three missing stores (minimum 6 new tests required, minimum 2 per store)

3. **All existing tests continue to pass**

## Acceptance Criteria

1. **AC-141-001:** `useComparisonStore` has `hydrateComparisonStore` imported and called in `hydrateAllStores()`
2. **AC-141-002:** `useSubCircuitStore` has `hydrateSubCircuitStore` imported and called in `hydrateAllStores()`
3. **AC-141-003:** `useSettingsStore` has `hydrateSettingsStore` imported and called in `hydrateAllStores()`
4. **AC-141-004:** Minimum 6 new tests added covering hydration scenarios for the three stores (minimum 2 per store)
5. **Bundle size ≤512KB** after changes
6. **TypeScript 0 errors** after changes

## Test Methods

### AC-141-001: Comparison Store Hydration Hook
1. Read `src/hooks/useStoreHydration.ts` source file
2. Verify `hydrateComparisonStore` is imported from the correct path (e.g., `../store/useComparisonStore`)
3. Verify `hydrateStore('comparison', hydrateComparisonStore)` or `hydrateComparisonStore()` is called in `hydrateAllStores()` function alongside existing store hydrations
4. **Pass threshold:** Both import and call are present in the file

### AC-141-002: SubCircuit Store Hydration Hook
1. Read `src/hooks/useStoreHydration.ts` source file
2. Verify `hydrateSubCircuitStore` is imported from the correct path (e.g., `../store/useSubCircuitStore`)
3. Verify `hydrateStore('subCircuit', hydrateSubCircuitStore)` or `hydrateSubCircuitStore()` is called in `hydrateAllStores()` function alongside existing store hydrations
4. **Pass threshold:** Both import and call are present in the file

### AC-141-003: Settings Store Hydration Hook
1. Read `src/hooks/useStoreHydration.ts` source file
2. Verify `hydrateSettingsStore` is imported from the correct path (e.g., `../store/useSettingsStore`)
3. Verify `hydrateStore('settings', hydrateSettingsStore)` or `hydrateSettingsStore()` is called in `hydrateAllStores()` function alongside existing store hydrations
4. **Pass threshold:** Both import and call are present in the file

### AC-141-004: Hydration Integration Tests
1. Run `npm test -- storeHydration.test.ts --run`
2. Verify test calls `hydrateAllStores()`
3. Verify tests assert stores are hydrated with localStorage data
4. Verify minimum 6 new tests added for hydration scenarios (minimum 2 per store)
5. **Pass threshold:** All new tests pass, minimum 6 new tests exist

### AC-141-005: Test Suite Passes
```bash
npm test -- --run
```
Expected: All tests pass (≥5757 required — 5751 baseline + 6 new minimum)
**Pass threshold:** Exit code 0, all tests pass

### AC-141-006: Bundle Size ≤512KB
```bash
npm run build && ls -la dist/assets/*.js | grep "index-"
```
Expected: Main bundle ≤524,288 bytes (512KB)
**Pass threshold:** `index-*.js ≤ 512 KB`

### AC-141-007: TypeScript 0 Errors
```bash
npx tsc --noEmit
```
Expected: Exit code 0, no output
**Pass threshold:** Exit code 0

## Required Test Scenarios (storeHydration.test.ts)

### For each of the three stores (comparison, subCircuit, settings):

1. **Test: hydrateAllStores calls {HydrationFunction}**
   - Mock localStorage with test data for that store
   - Call `hydrateAllStores()`
   - Assert `{HydrationFunction}` was invoked

2. **Test: Store state populated after hydration**
   - Mock localStorage with test data
   - Call `hydrateAllStores()`
   - Read state from the store's getState()
   - Assert state matches localStorage data

**Additional tests (optional but recommended):**
- Empty localStorage handling (no crash)
- Malformed localStorage graceful handling

## Risks

1. **Low:** Adding stores to hydration hook could theoretically cause cascading updates if not done properly — mitigated by following existing pattern used for other stores
2. **Low:** Test file growth — new tests are minimal and focused on hydration only

## Failure Conditions

1. `useStoreHydration.ts` does not import `hydrateComparisonStore` from the correct path
2. `useStoreHydration.ts` does not include `hydrateComparisonStore` call in `hydrateAllStores()`
3. `useStoreHydration.ts` does not import `hydrateSubCircuitStore` from the correct path
4. `useStoreHydration.ts` does not include `hydrateSubCircuitStore` call in `hydrateAllStores()`
5. `useStoreHydration.ts` does not import `hydrateSettingsStore` from the correct path
6. `useStoreHydration.ts` does not include `hydrateSettingsStore` call in `hydrateAllStores()`
7. `storeHydration.test.ts` does not have minimum 6 new tests for hydration (minimum 2 per store)
8. Test suite fails (any test breaks)
9. Test count < 5757 (5751 baseline + 6 new minimum)
10. Bundle exceeds 512KB
11. TypeScript errors introduced

## Done Definition

All of the following must be true:

1. `src/hooks/useStoreHydration.ts` includes import for `hydrateComparisonStore` from the correct path
2. `src/hooks/useStoreHydration.ts` includes import for `hydrateSubCircuitStore` from the correct path
3. `src/hooks/useStoreHydration.ts` includes import for `hydrateSettingsStore` from the correct path
4. `src/hooks/useStoreHydration.ts` calls all three hydration functions in `hydrateAllStores()`
5. `storeHydration.test.ts` includes minimum 6 new tests for hydration (minimum 2 per store)
6. `npm test -- --run` passes with ≥5757 tests (5751 baseline + 6 new)
7. `npm run build` produces bundle ≤512KB
8. `npx tsc --noEmit` exits with code 0
9. All new tests pass

## Out of Scope

- Any changes to store implementations themselves (only hydration wiring)
- Changes to components or UI behavior
- New features or functionality
- Performance optimizations unrelated to this fix
- Exchange store hydration (not part of this bug fix)

---

## Revision Notes (for this round)

This contract has been revised to address the following:

1. **Added Operator Inbox Compliance section** — Confirmed no pending inbox items target Round 141; all 4 historical inbox items were processed in prior rounds (51, 85, 103, 106). This section is included to document inbox compliance and ensure no inbox directives are weakened.

2. **Added APPROVED header** — Consistent with other approved contracts.

3. **Expanded Test Methods** — Each AC now has explicit test method with pass threshold, making verification clearer.

4. **Specified correct import paths** — Test methods now verify imports from the correct store paths (e.g., `../store/useComparisonStore`).