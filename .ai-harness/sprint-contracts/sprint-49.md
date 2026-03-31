APPROVED

# Sprint Contract — Round 49

## Scope

This round focuses on **remediating two issues** in the Community Gallery and Community Store:

1. **Fix View Tracking Logic** in `CommunityGallery.tsx` — views are currently tracked for all filtered machines whenever the filter changes, rather than tracking a single view when the gallery opens
2. **Clarify Persistence Behavior** in `CommunityGallery.tsx` and `useCommunityStore.ts` — the UI text says "session-scoped only" but the implementation uses localStorage which persists across browser restarts

No new features are in scope.

## Spec Traceability

### P0 Items (Must Fix This Round)
- **Community View Tracking:** Fix the view tracking logic so it tracks a single view when the gallery opens, not on every filter change
- **Persistence Documentation:** Clarify the localStorage vs sessionStorage behavior in UI text and store comments

### P1 Items (Already Passing, Verification Only)
- AC1.1-1.4: Faction variant SVG implementations (verified in Round 47)
- AC2.1-2.3: Performance, tests, spatial indexing (verified in Round 48)
- AC3.1-3.3: Recipe Browser and toolbar integration (verified in Round 48)
- AC4.1-4.2: Build verification with 0 TypeScript errors (verified in Round 48)
- All 1732 test files with 1732 tests passing (verified in Round 48)

### Remaining P0/P1 After This Round
- All P0/P1 items should remain passing after this remediation

### P2 Intentionally Deferred
- None — these are bug fixes, not new features

## Deliverables

1. **Fixed View Tracking Logic**
   - File: `src/components/Community/CommunityGallery.tsx`
   - Behavior: When gallery opens, count views once for currently displayed machines; do not recount when filters change

2. **Clarified Persistence Behavior**
   - File: `src/components/Community/CommunityGallery.tsx` — Update UI text to accurately reflect localStorage behavior (persists across browser restarts)
   - File: `src/store/useCommunityStore.ts` — Update comments to clarify localStorage persistence across browser sessions

3. **Updated Tests** (if test file exists)
   - File: `src/components/Community/__tests__/CommunityGallery.test.tsx` — Add/update tests for view tracking behavior
   - Total test count should remain at 1732+ after any test updates

## Acceptance Criteria

1. **AC1 View Tracking:** View count increments only once per gallery open session, not on every filter change
2. **AC2 Persistence Clarity - UI:** UI text accurately reflects localStorage persistence behavior (persists across browser restarts)
3. **AC3 Persistence Clarity - Comments:** Store comments accurately describe localStorage persistence behavior
4. **AC4 Build PASS:** Application builds with 0 TypeScript errors
5. **AC5 Tests PASS:** All existing tests continue to pass (1732+ tests)
6. **AC6 No Regression:** Community Gallery filtering, sorting, and publishing still work correctly

## Test Methods

1. **Browser Test (Manual Verification):**
   - Open application at `/`
   - Navigate to Community Gallery
   - Verify view count for displayed machines
   - Change filter (e.g., different faction or rarity)
   - Verify view count does NOT increment again for the same machines
   - Close and reopen gallery
   - Verify views are tracked again (once per session)

2. **Code Inspection:**
   - Verify `src/components/Community/CommunityGallery.tsx` uses session-scoped flag for view tracking
   - Verify UI text no longer incorrectly states "session-scoped only" (or clearly explains localStorage)
   - Verify `src/store/useCommunityStore.ts` comments clarify localStorage behavior

3. **Regression Test (Automated):**
   - `npm run build` → 0 TypeScript errors
   - `npm test -- --run` → all tests pass (1732+ tests)

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| View Tracking Change | Low | Low | Use a ref to track whether views have been counted for current session |
| Documentation Changes | None | None | Purely text/comment changes with no functional impact |

## Failure Conditions

This round MUST FAIL if:
1. View tracking still increments on every filter change
2. Build fails with TypeScript errors
3. Test suite fails (any test failures)
4. localStorage persistence behavior changes unexpectedly

This round MUST PASS if ALL of the following are true:
1. Views are tracked only once per gallery open session
2. Documentation accurately reflects actual persistence behavior
3. All 1732+ tests pass
4. Build succeeds with 0 TypeScript errors
5. Community Gallery functionality remains intact

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ View tracking uses session-scoped flag (not dependent on filteredMachines changes)
2. ✅ UI text no longer incorrectly states "session-scoped only" or clearly explains localStorage behavior
3. ✅ Store comments accurately describe localStorage persistence
4. ✅ `npm run build` succeeds with 0 TypeScript errors
5. ✅ `npm test -- --run` shows all 1732+ tests passing
6. ✅ Community Gallery filtering and sorting work correctly after changes
7. ✅ No regressions in related functionality

## Out of Scope

- **No new features** beyond the two bug fixes
- **No changes to localStorage/sessionStorage behavior** — only documentation clarification
- **No changes to other community functionality** (publishing, loading, gallery layout)
- **No changes to faction tech tree** — verified complete in prior rounds
- **No changes to AI naming panel** — verified complete in prior rounds
- **No changes to export functionality** — verified complete in prior rounds
