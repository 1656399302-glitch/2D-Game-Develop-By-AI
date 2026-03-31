APPROVED

# Sprint Contract — Round 66

## Scope

Remediation of critical persistence bug identified in Round 65 feedback. The favorites and machineTags stores are not hydrated from localStorage due to missing hydration calls in `useStoreHydration`.

## Spec Traceability

- **P0 items covered this round:** None (Round 65 completed all P0 work)
- **P1 items covered this round:** None (Round 65 completed all P1 work)
- **Remaining P0/P1 after this round:** None
- **P2 intentionally deferred:** N/A (all P2 work remains as previously scheduled)

## Deliverables

1. **Fixed `src/hooks/useStoreHydration.ts`** — Add missing hydration calls for `favorites` and `machineTags` stores
2. **All existing files remain unchanged** — No refactoring, no new features

## Acceptance Criteria

1. **AC3:** Favorites persist across browser restarts (toggle heart → refresh → heart remains toggled)
2. **AC4:** "My Favorites" tab in Community Gallery shows only favorited machines after page refresh
3. **AC8:** Machine tags persist across browser restarts (add tag → refresh → tag remains)
4. **All 51 Round 65 tests continue to pass**
5. **TypeScript compilation remains error-free**
6. **Build bundle size remains under 500KB**

## Test Methods

1. **Browser persistence test for favorites:**
   - Open Community Gallery
   - Click heart on any machine → changes from 🤍 to ❤️
   - Count badge updates to "1"
   - Refresh page (F5 or Cmd+R)
   - Open Community Gallery → heart remains ❤️ (FAILS if hydration missing)
   - Open "My Favorites" tab → machine appears (FAILS if hydration missing)

2. **Browser persistence test for tags:**
   - Open any machine in editor
   - Click tag editor, add a tag (e.g., "prototype")
   - Save and refresh page
   - Re-open machine → tag "prototype" still visible (FAILS if hydration missing)

3. **Automated tests:** Run `npm test` — all 51 Round 65 feature tests plus existing test suite must pass

4. **Build verification:** Run `npm run build` — 0 TypeScript errors, bundle < 500KB

## Risks

1. **Low risk** — The fix is a single, well-defined integration change (adding 2 lines)
2. **No architectural impact** — All stores already have `skipHydration: true` and hydration functions defined
3. **Test coverage exists** — 51 tests already cover these features

## Failure Conditions

1. **AC3 fails** — Favorites do not persist after page refresh
2. **AC4 fails** — "My Favorites" tab does not show favorited machines after refresh
3. **AC8 fails** — Tags do not persist after page refresh
4. **Any existing test fails** — 51 feature tests or pre-existing test suite regression
5. **TypeScript errors introduced**
6. **Build fails**

## Done Definition

All of the following must be true:

1. ✅ `src/hooks/useStoreHydration.ts` imports `hydrateFavoritesStore` from `../store/useFavoritesStore`
2. ✅ `src/hooks/useStoreHydration.ts` imports `hydrateMachineTagsStore` from `../store/useMachineTagsStore`
3. ✅ `hydrateAllStores()` function calls `hydrateStore('favorites', hydrateFavoritesStore)`
4. ✅ `hydrateAllStores()` function calls `hydrateStore('machineTags', hydrateMachineTagsStore)`
5. ✅ `npm run build` succeeds with 0 TypeScript errors
6. ✅ `npm test` passes all tests (≥51 feature tests + existing suite)
7. ✅ Browser test: favorites persist across refresh
8. ✅ Browser test: tags persist across refresh

## Out of Scope

- No new features
- No refactoring of existing stores or hooks
- No UI changes
- No changes to test files (unless tests are failing due to the hydration fix)
- No changes to other stores that are already hydrating correctly
