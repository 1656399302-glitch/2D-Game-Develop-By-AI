# Sprint Contract — Round 182

## APPROVED

## Scope

This sprint delivers **Recipe Panel and Statistics**, mirroring the Achievement Panel work from Round 181. The recipe system currently has RecipeBook.tsx but lacks dedicated component tests, a statistics panel, and a proper breadcrumb/tabbed panel structure. **This round explicitly includes App.tsx integration** to avoid the gap noted in Round 181 QA (AchievementPanel existed but was not integrated into navigation).

## Spec Traceability

### P0 items covered this round
- **Recipe Discovery System** — RecipePanel component with All/Unlocked/Locked tabs, category filter, sort dropdown, and statistics section (P1 per spec → elevated to P0 for this sprint)
- **Recipe Statistics** — RecipeStats component showing unlock count, completion percentage, and category breakdown (mirrors AchievementStats pattern)
- **RecipePanel App Integration** — RecipePanel integrated into App.tsx navigation with lazy loading (addresses Round 181 gap)

### P1 items covered this round
- **Recipe Badge with Progress** — RecipeCard shows progress indicator for threshold-based locked recipes (mirrors AchievementBadge progress enhancement)

### Remaining P0/P1 after this round
- Canvas validation and simulation improvements (P0)
- Wire connection system refinements (P0)
- Sub-circuit module system (P1)

### P2 intentionally deferred
- Community gallery full integration
- Exchange/trade system
- Template library advanced features

## Deliverables

1. **`src/components/Recipes/RecipePanel.tsx`** — New panel component with tab navigation (All/Unlocked/Locked), category filter dropdown, sort select, and statistics section at top
2. **`src/components/Recipes/RecipeStats.tsx`** — Statistics component showing "X / Y 已解锁" total, completion percentage progress bar, and per-category breakdown with data-testid attributes
3. **`src/components/Recipes/__tests__/RecipePanel.test.tsx`** — Comprehensive tests for RecipePanel filtering (tabs + category), sorting (name/rarity/unlocked/recent), statistics display, and empty state handling (minimum 20 tests)
4. **`src/components/Recipes/__tests__/RecipeStats.test.tsx`** — Tests for RecipeStats calculations and rendering (minimum 12 tests)
5. **`src/components/Recipes/__tests__/RecipeCard.test.tsx`** — Tests for RecipeCard progress indicator display (threshold-based locked recipes show progress, unlocked recipes show checkmark, non-threshold recipes show nothing)
6. **`src/components/Recipes/index.ts`** — Barrel export for all Recipes components
7. **`src/components/RecipeBook/RecipeBook.tsx`** — Add data-testid attributes to existing component for testability (close button `recipe-book-close`, panel container `recipe-book-panel`, filter buttons, sort select `recipe-book-sort`, empty state `recipe-empty-state`)
8. **`src/App.tsx`** — Integrate RecipePanel into navigation menu alongside AchievementPanel, with lazy loading (`React.lazy(() => import('./components/Recipes/RecipePanel'))`), navigation menu item "配方" with data-testid `nav-recipes`, and state management for panel visibility (mirrors AchievementPanel integration pattern)

## Acceptance Criteria

### AC-182-001: RecipePanel renders correctly
- Panel container renders with `data-testid="recipe-panel"`
- Tab buttons render: `recipe-tab-all`, `recipe-tab-unlocked`, `recipe-tab-locked`
- Category filter dropdown shows categories + "全部分类" option with `data-testid="recipe-category-filter"`
- Sort dropdown shows Recent, Name, Rarity, Unlocked options with `data-testid="recipe-sort-select"`
- Statistics section visible at top with `data-testid="recipe-stats"`
- Recipe list renders below statistics with `data-testid="recipe-list"`

### AC-182-002: RecipePanel filtering works
- "All" tab shows all recipes (unlocked and locked)
- "Unlocked" tab shows only recipes where `isUnlocked === true`
- "Locked" tab shows only recipes where `isUnlocked === false`
- Category filter limits displayed recipes to selected category
- Filters can be combined (tab + category)
- Empty state displays with `data-testid="recipe-empty-state"` when no matches

### AC-182-003: RecipePanel sorting works
- "Recent" sort orders by `unlockedAt` descending (unlocked first)
- Locked recipes with no `unlockedAt` sort to end when using "Recent"
- "Name" sort orders alphabetically by `name` property
- "Rarity" sort orders by rarity (legendary > epic > rare > uncommon > common)
- "Unlocked" sort groups unlocked recipes before locked recipes (within each group, secondary sort by name)
- Sort order persists during session

### AC-182-004: Recipe statistics display correctly
- Total unlocked count formatted as "X / Y 已解锁" with `data-testid="recipe-stats-total"`
- Completion percentage shown as progress bar with `data-testid="recipe-stats-percentage"`
- Category breakdown displays per-category counts with `data-testid="recipe-stats-category-{name}"`
- Stats section renders with `data-testid="recipe-stats"`

### AC-182-005: RecipeCard shows progress indicator for threshold-based locked recipes
- Threshold-based locked recipes (machines_created, activation_count, challenge_count types) show "current / threshold" progress with `data-testid="recipe-progress-{id}"`
- Unlocked threshold-based recipes show checkmark, not progress
- Non-threshold recipes do not show progress indicator
- Progress uses stats store for threshold comparison (machinesCreated, activationCount, challengeCount)

### AC-182-006: Existing RecipeBrowser tests pass
- All existing RecipeBrowser tests continue to pass
- No regression in existing functionality

### AC-182-007: New tests pass
- `npm test -- --run src/components/Recipes/` passes all tests
- RecipePanel: minimum 20 tests
- RecipeStats: minimum 12 tests
- RecipeCard: minimum 8 tests
- Integration: minimum 6 tests
- Total: minimum 46 tests

### AC-182-008: TypeScript compilation passes
- `npx tsc --noEmit` exits with 0 errors

### AC-182-009: Bundle size ≤512KB
- `npm run build` largest bundle ≤512KB (524,288 bytes)

### AC-182-010: RecipePanel App.tsx integration
- Navigation menu contains "配方" button with `data-testid="nav-recipes"`
- Clicking "配方" opens RecipePanel (not RecipeBook)
- RecipePanel lazy loads correctly without errors
- Panel can be closed and reopened
- No regression in existing navigation (AchievementPanel, TechTree, Challenge still work)
- Integration tests verify: navigation opens panel, panel renders correctly, close button dismisses panel

## Test Methods

### AC-182-001: RecipePanel renders correctly
```bash
npm test -- --run src/components/Recipes/__tests__/RecipePanel.test.tsx --testNamePattern="AC-182-001"
```
Verify: Panel renders with all required data-testid attributes (recipe-panel, recipe-tab-all, recipe-tab-unlocked, recipe-tab-locked, recipe-category-filter, recipe-sort-select, recipe-stats, recipe-list)

### AC-182-002: RecipePanel filtering works
```bash
npm test -- --run src/components/Recipes/__tests__/RecipePanel.test.tsx --testNamePattern="AC-182-002"
```
Verify: Tab switching and category filter correctly filter the displayed recipes. Empty state appears when no recipes match filter.

### AC-182-003: RecipePanel sorting works
```bash
npm test -- --run src/components/Recipes/__tests__/RecipePanel.test.tsx --testNamePattern="AC-182-003"
```
Verify: Each sort option produces correctly ordered results. Sort persists across filter changes.

### AC-182-004: Recipe statistics display correctly
```bash
npm test -- --run src/components/Recipes/__tests__/RecipeStats.test.tsx
```
Verify: RecipeStats renders with correct data-testid attributes and accurate calculations.

### AC-182-005: RecipeCard progress indicator
```bash
npm test -- --run src/components/Recipes/__tests__/RecipeCard.test.tsx --testNamePattern="Progress Indicator"
```
Verify: Threshold-based locked recipes show progress, unlocked recipes show checkmark, non-threshold recipes show nothing.

### AC-182-006: Existing RecipeBrowser tests pass
```bash
npm test -- --run src/components/Recipes/__tests__/RecipeBrowser.test.tsx
```
Verify: All existing RecipeBrowser tests pass with no regressions.

### AC-182-007: New tests pass
```bash
npm test -- --run src/components/Recipes/
```
Verify: Test files pass, minimum 46 tests total (RecipePanel: 20+, RecipeStats: 12+, RecipeCard: 8+, Integration: 6+).

### AC-182-008: TypeScript compilation passes
```bash
npx tsc --noEmit
```
Verify: Exit code 0, 0 errors.

### AC-182-009: Bundle size ≤512KB
```bash
npm run build
```
Verify: Largest bundle ≤512KB (524,288 bytes).

### AC-182-010: RecipePanel App.tsx integration
```bash
# Integration tests
npm test -- --run src/components/Recipes/__tests__/RecipePanel.integration.test.tsx

# Browser verification
# 1. Load app, click "配方" nav button
# 2. Verify RecipePanel opens with data-testid="recipe-panel"
# 3. Click close, verify panel dismisses
# 4. Reopen, verify panel renders correctly
```
Verify: Navigation opens RecipePanel, lazy loading works, panel renders all required elements, close/reopen cycle works correctly.

## Risks

1. **RecipeCard type mismatch** — RecipeCard in RecipeBook uses `import { Recipe, RARITY_COLORS } from '../../types/recipes'` but uses `recipe.name` (not `nameCn`). May need type annotation fix. Mitigation: Use proper Recipe type from store.

2. **RecipeStats calculation dependencies** — RecipeStats may need to pull data from multiple stores (useRecipeStore, useStatsStore) for accurate threshold progress. Mitigation: Mock stores in tests.

3. **Category classification** — Recipes don't have explicit category field. Need to infer from moduleType or unlockCondition.type. Mitigation: Define categories (modules, challenges, achievements, tech) based on unlockCondition.type.

4. **RecipeCard test file creation** — RecipeCard.test.tsx does not currently exist and must be created as part of this sprint. Mitigation: Follow AchievementBadge.test.tsx pattern for progress indicator testing.

5. **App.tsx integration complexity** — Adding navigation menu item and lazy loading may require changes to existing App.tsx structure. Mitigation: Mirror AchievementPanel integration pattern exactly (same pattern, same state management approach).

6. **Bundle size pressure** — Adding App.tsx integration and RecipePanel component increases bundle. Mitigation: Ensure RecipePanel is lazy-loaded; RecipeStats and RecipeCard can be lazy-loaded within RecipePanel.

## Failure Conditions

1. Any acceptance criterion fails to pass
2. TypeScript compilation produces errors
3. Bundle size exceeds 512KB
4. New tests have runtime errors or fail assertions
5. Existing RecipeBrowser tests regress
6. RecipePanel fails to open from navigation menu (integration broken)
7. Lazy loading throws error on panel open

## Done Definition

All 10 acceptance criteria must be verified with their respective test commands before claiming completion. Exact conditions:

- [ ] AC-182-001: `data-testid="recipe-panel"` visible in test output
- [ ] AC-182-002: Empty state with `data-testid="recipe-empty-state"` appears when filtering yields no results
- [ ] AC-182-003: All 4 sort options produce correct ordering in tests
- [ ] AC-182-004: `data-testid="recipe-stats-total"` shows correct "X / Y" format
- [ ] AC-182-005: Progress indicator appears for threshold-based locked recipes with `data-testid="recipe-progress-{id}"`
- [ ] AC-182-006: RecipeBrowser.test.tsx passes all existing tests
- [ ] AC-182-007: Minimum 46 Recipe tests passing (RecipePanel: 20+, RecipeStats: 12+, RecipeCard: 8+, Integration: 6+)
- [ ] AC-182-008: tsc exits with code 0
- [ ] AC-182-009: Build output shows bundle ≤512KB
- [ ] AC-182-010: `data-testid="nav-recipes"` exists in App.tsx, clicking opens RecipePanel, integration tests pass

## Out of Scope

- RecipeBrowser integration into App.tsx (keep existing RecipeBook for now) — **SUPERSEDED: RecipePanel IS integrated this round**
- Recipe discovery toast implementation (already exists)
- Faction variant recipe system enhancements
- Recipe-based achievement triggers
- Backend/persistence for recipes
- Recipe sharing or export functionality

**Note:** The Out of Scope note about "RecipeBrowser integration" is superseded by AC-182-010. RecipePanel (the new component with statistics and filtering) IS integrated this round. RecipeBook remains available as-is (no integration changes to RecipeBook).
