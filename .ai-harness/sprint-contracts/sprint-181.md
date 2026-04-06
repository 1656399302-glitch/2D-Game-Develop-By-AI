# Sprint Contract — Round 181

## APPROVED

## Scope

**Enhancement Sprint: Achievement System Panel and Statistics**

This sprint enhances the existing Achievement system by creating a dedicated `AchievementPanel` component with filtering, sorting, and statistics display capabilities. The AchievementList currently functions as a modal, but lacks dedicated panel infrastructure, filtering/sorting, and progress statistics.

## Spec Traceability

### P0 items covered this round
- **Progression System → Achievement system for milestones**: Creating AchievementPanel with full filtering, sorting, and statistics

### P1 items covered this round
- **Progression System → Tech tree with unlockable components**: Achievement panel will display progress toward locked achievements

### Remaining P0/P1 after this round
- P0: Canvas System (interactive canvas, drag-and-drop, wire connections, validation)
- P0: Components (logic gates, wires, I/O nodes, timers, counters, memory)
- P0: Circuit validation and simulation
- P0: Tech tree unlock system integration with achievement tracking
- P1: Recipe discovery mechanics
- P1: Faction reputation and rewards
- P1: Challenge mode with puzzles

### P2 intentionally deferred
- Community gallery with rating/favorites
- Exchange/trade system (completed in Round 180)
- Custom sub-circuit modules library
- Template library for common patterns

## Deliverables

1. **`src/components/Achievements/AchievementPanel.tsx`** (new)
   - Dedicated panel component (sidebar-style, not modal)
   - data-testid: `achievement-panel`
   - Tab-based navigation with data-testid: `achievement-tab-all`, `achievement-tab-unlocked`, `achievement-tab-locked`
   - Category filter dropdown with data-testid: `achievement-category-filter`
   - Sort dropdown with data-testid: `achievement-sort-select`
   - Achievement statistics section at top with data-testid: `achievement-stats`
   - Uses existing AchievementBadge component

2. **`src/components/Achievements/AchievementBadge.tsx`** (enhanced)
   - Progress indicator for threshold-based achievements (e.g., "3/5 machines")
   - data-testid: `achievement-badge-{id}`, `achievement-progress-{id}`
   - Category badge always visible
   - Enhanced from Round 136 version with progress display capability

3. **`src/components/Achievements/AchievementStats.tsx`** (new)
   - Statistics display component
   - data-testid: `achievement-stats-total`, `achievement-stats-percentage`, `achievement-stats-category-{name}`
   - Shows: Total unlocked count, completion percentage bar, breakdown by category

4. **`src/components/Achievements/index.ts`** (new)
   - Barrel export file for all Achievement components
   - Exports: AchievementBadge, AchievementList, AchievementPanel, AchievementStats

5. **Tests:**
   - `src/components/Achievements/__tests__/AchievementBadge.test.tsx` (new)
   - `src/components/Achievements/__tests__/AchievementStats.test.tsx` (new)
   - `src/components/Achievements/__tests__/AchievementPanel.test.tsx` (new)

## Acceptance Criteria

### AC-181-001: AchievementPanel renders correctly
- Panel container renders with `data-testid="achievement-panel"`
- Three tab buttons render: All, Unlocked, Locked (with respective data-testid attributes)
- Category filter dropdown shows all 4 categories + "All" option
- Sort dropdown shows Recent, Name, Category options
- Statistics section visible at top with total count and progress bar
- Achievement list renders below statistics

### AC-181-002: AchievementPanel filtering works
- "All" tab shows all achievements (unlocked and locked)
- "Unlocked" tab shows only achievements where `isUnlocked === true`
- "Locked" tab shows only achievements where `isUnlocked === false`
- Category filter limits displayed achievements to selected category
- Filters can be combined (tab + category)
- Selecting a filter updates the displayed list immediately
- Empty state displays when no achievements match filter (data-testid: `achievement-empty-state`)

### AC-181-003: AchievementPanel sorting works
- "Recent" sort orders unlocked achievements by `unlockedAt` timestamp descending (newest first)
- Locked achievements with no `unlockedAt` sort to the end when using "Recent"
- "Name" sort orders alphabetically by `nameCn` property
- "Category" sort groups achievements by `category` property
- Sort order persists during session (not reset on filter change)
- Rapid filter/sort changes do not cause race conditions or stale data display

### AC-181-004: Achievement statistics display correctly
- Total unlocked count formatted as "X / Y 已解锁" with data-testid `achievement-stats-total`
- Completion percentage shown as progress bar with percentage label
- Category breakdown displays per-category unlocked counts with format "电路构建: 3/5"
- Stats section renders with data-testid `achievement-stats`
- Statistics update when filter selection changes

### AC-181-005: AchievementBadge shows progress indicator
- Threshold-based achievements (machinesCreated-based) show progress "current / threshold"
- Progress only shown for locked achievements with threshold conditions
- Progress format: "3 / 5" for locked threshold-based achievements
- Unlocked threshold-based achievements show checkmark, not progress
- Non-threshold achievements (boolean conditions) do not show progress

### AC-181-006: Existing AchievementList tests pass
- All tests in `src/components/Achievements/__tests__/AchievementToast.integration.test.tsx` continue to pass
- No regression in existing functionality
- AchievementList modal still opens and closes correctly

### AC-181-007: New tests pass
- AchievementBadge tests: state rendering (unlocked/locked), progress display, click handling
- AchievementStats tests: calculation accuracy, rendering with correct values
- AchievementPanel tests: filtering, sorting, tab switching, statistics display, empty states, rapid interaction stability

### AC-181-008: TypeScript compilation passes
- No TypeScript errors in new files
- All components properly typed with no `any` usage in public interfaces
- Existing type exports maintained

### AC-181-009: Bundle size ≤512KB
- Total bundle remains under 512KB limit (524,288 bytes)
- AchievementPanel lazy-loaded via React.lazy()

## Test Methods

### AC-181-001: AchievementPanel rendering
```bash
npm test -- --run src/components/Achievements/__tests__/AchievementPanel.test.tsx --testNamePattern="renders with correct structure"
```
Verification:
1. Find element with `data-testid="achievement-panel"` → must exist
2. Find elements with `data-testid="achievement-tab-all"`, `data-testid="achievement-tab-unlocked"`, `data-testid="achievement-tab-locked"` → all must exist
3. Find element with `data-testid="achievement-category-filter"` → must exist
4. Find element with `data-testid="achievement-sort-select"` → must exist
5. Find element with `data-testid="achievement-stats"` → must exist

### AC-181-002: AchievementPanel filtering
```bash
npm test -- --run src/components/Achievements/__tests__/AchievementPanel.test.tsx --testNamePattern="filtering"
```
Verification:
1. Click tab "Unlocked" → verify only `isUnlocked === true` achievements display
2. Click tab "Locked" → verify only `isUnlocked === false` achievements display
3. Select category "circuit-building" → verify only that category displays
4. Verify combining tab + category works correctly
5. Select filter combination that results in empty list → verify `data-testid="achievement-empty-state"` appears
6. Rapidly click between tabs → verify final displayed state matches last selection

### AC-181-003: AchievementPanel sorting
```bash
npm test -- --run src/components/Achievements/__tests__/AchievementPanel.test.tsx --testNamePattern="sorting"
```
Verification:
1. Select "Recent" sort → verify unlockedAt descending order
2. Select "Name" sort → verify alphabetical by nameCn
3. Select "Category" sort → verify grouped by category
4. Change filter → verify sort order preserved
5. Rapidly change sort options 5+ times → verify no race conditions, final order matches last selection

### AC-181-004: Achievement statistics
```bash
npm test -- --run src/components/Achievements/__tests__/AchievementStats.test.tsx
```
Verification:
1. Mock store with 5 unlocked, 10 total → verify "5 / 10 已解锁" displays
2. Verify progress bar width = 50%
3. Verify category breakdown shows correct counts
4. Change filter to single category → verify stats update to reflect filtered subset

### AC-181-005: AchievementBadge progress
```bash
npm test -- --run src/components/Achievements/__tests__/AchievementBadge.test.tsx --testNamePattern="progress"
```
Verification:
1. Locked threshold-based achievement → verify "X / Y" text appears
2. Unlocked threshold-based achievement → verify no "X / Y" text, checkmark appears
3. Non-threshold achievement → verify no progress text

### AC-181-006: Regression tests
```bash
npm test -- --run src/components/Achievements/__tests__/AchievementToast.integration.test.tsx
```
- All tests must pass
- Duration should be <5 seconds

### AC-181-007: Full Achievement test suite
```bash
npm test -- --run src/components/Achievements/
```
Verification:
- All 6+ test files pass
- Total test count ≥ existing tests + new tests
- Empty state tests included

### AC-181-008: TypeScript verification
```bash
npx tsc --noEmit
```
- Exit code must be 0
- No output (0 errors)

### AC-181-009: Bundle size verification
```bash
npm run build && ls dist/assets/*.js | xargs wc -c | sort -n | tail -1
```
- Largest bundle must be ≤ 524,288 bytes (512KB)

## Risks

### Risk 1: AchievementPanel integration with existing App navigation
- **Description**: AchievementPanel is a new standalone panel that needs integration into App.tsx navigation
- **Mitigation**: Create AchievementPanel as a standalone component. App.tsx integration is out of scope for this round. The existing AchievementList modal remains functional for backward compatibility.
- **Impact if realized**: Panel may not appear in UI until integrated in future round

### Risk 2: AchievementBadge enhancement breaking existing usage
- **Description**: Adding progress indicator may change existing badge appearance/behavior
- **Mitigation**: Ensure backward compatibility - only add progress for threshold-based locked achievements. All existing AchievementBadge tests must pass.
- **Impact if realized**: Existing achievement toasts may display differently

### Risk 3: Test coverage for filtering/sorting edge cases
- **Description**: Filtering and sorting may have edge cases with empty states or unusual data
- **Mitigation**: Write tests for empty category, all-unlocked state, all-locked state, rapid interaction stability
- **Impact if realized**: Users may see incorrect filtering behavior

### Risk 4: Bundle size increase
- **Description**: New components may increase bundle size beyond 512KB limit
- **Mitigation**: Lazy-load AchievementPanel via React.lazy(). Keep component code minimal.
- **Impact if realized**: Build fails, round must fail

## Failure Conditions

The round MUST FAIL if:
1. Any new test file has 3 or more test failures
2. Existing AchievementToast integration tests regress (any test fails)
3. TypeScript compilation produces errors (any output from `npx tsc --noEmit`)
4. Bundle size exceeds 512KB (524,288 bytes)
5. AchievementPanel cannot filter achievements correctly (verified by tests)
6. Achievement statistics display incorrect values (verified by tests)
7. AchievementBadge enhancement breaks existing badge functionality
8. Rapid filter/sort interactions cause stale or incorrect data display

## Done Definition

The round is complete when ALL of the following are true:

1. `AchievementPanel.tsx` created with data-testid attributes, renders tabs, filter, sort, stats, and list
2. `AchievementBadge.tsx` enhanced with progress indicator for threshold-based locked achievements
3. `AchievementStats.tsx` created with correct calculation logic for totals and category breakdown
4. `src/components/Achievements/index.ts` barrel export created with all component exports
5. Three new test files created with all tests passing (AchievementBadge, AchievementStats, AchievementPanel)
6. All existing Achievement tests continue to pass (no regression)
7. TypeScript compiles without errors (`npx tsc --noEmit` exits 0)
8. Bundle size ≤ 512KB (verified by build command)
9. All 9 acceptance criteria verified by automated tests
10. Empty state tests pass (data-testid="achievement-empty-state" verified)
11. Rapid interaction stability verified by tests

## Out of Scope

- Backend API integration for achievements
- Achievement unlock triggers in actual game logic (store manipulation only)
- Achievement sharing/display on community gallery
- Animated achievement unlock sequences
- Achievement sounds/audio
- Achievement badges in main navigation header
- Sorting within categories (only global sort across filtered results)
- Achievement search functionality
- Mobile-responsive layout (desktop only for this round)
- AchievementPanel integration into App.tsx navigation
- Persisting filter/sort preferences to localStorage
