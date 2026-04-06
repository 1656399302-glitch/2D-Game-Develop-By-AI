APPROVED — Sprint Contract — Round 183

## Scope

Create **CounterPanel** component for displaying and managing counter statistics in the circuit simulation system. This complements the existing Counter component (`Counter.tsx`) and follows the same pattern as RecipePanel/RecipeStats from Round 182.

## Spec Traceability

### P0 (Must Complete)
- CounterPanel with counter list display
- CounterStats sub-component with aggregate statistics
- Tab filtering (All/Active/Overflow)
- Sort options (by name/count/maxValue)
- Integration into App.tsx with lazy loading

### P1 (Should Complete)
- Counter history tracking (recent values)
- data-testid attributes for all interactive elements
- Unit tests for CounterPanel and CounterStats

### P2 (Intentionally Deferred)
- Timer statistics panel (separate sprint)
- Counter export functionality
- Advanced counter analysis charts

### Remaining P0/P1 After This Round
- P0: Circuit simulation multi-step execution
- P0: Full circuit validation engine
- P1: Timer panel (related to counter system)
- P1: Memory element visualization

## Deliverables

1. **`src/components/Circuit/CounterPanel.tsx`** — Main panel with:
   - Tab navigation (All/Active/Overflow)
   - Category filter dropdown
   - Sort dropdown (按名称/按计数/按最大值)
   - Counter list with real-time values
   - CounterStats section with totals
   - Close button with `[data-close-panel]` selector

2. **`src/components/Circuit/CounterStats.tsx`** — Statistics sub-component:
   - Total counters count
   - Active counters count (count > 0)
   - Overflow counters count
   - Completion percentage progress bar

3. **`src/components/Circuit/__tests__/CounterPanel.test.tsx`** — Unit tests:
   - Panel renders with correct data-testid attributes
   - Tab switching works correctly
   - Filter and sort functionality
   - Statistics calculation

4. **`src/components/Circuit/__tests__/CounterStats.test.tsx`** — Statistics tests:
   - Total calculation
   - Active/Inactive filtering
   - Overflow detection
   - Progress percentage

5. **`src/components/Circuit/index.ts`** — Updated barrel export

6. **`src/App.tsx`** — CounterPanel integration with lazy loading and navigation button

## Acceptance Criteria

1. **AC-183-001**: CounterPanel renders correctly
   - Panel visible with `data-testid="counter-panel"`
   - All tabs (All/Active/Overflow) with data-testid attributes
   - Filter and sort dropdowns present

2. **AC-183-002**: CounterPanel filtering works
   - "All" tab shows all counters
   - "Active" tab shows only counters with count > 0
   - "Overflow" tab shows only counters with overflow flag

3. **AC-183-003**: CounterPanel sorting works
   - Sort by name (按名称)
   - Sort by count (按计数)
   - Sort by max value (按最大值)

4. **AC-183-004**: Counter statistics display correctly
   - Total counter count with `data-testid="counter-stats-total"`
   - Active count with `data-testid="counter-stats-active"`
   - Overflow count with `data-testid="counter-stats-overflow"`
   - Progress bar with `data-testid="counter-stats-percentage"`

5. **AC-183-005**: Counter history shows recent values
   - Each counter shows last 5 values in history array
   - History displayed with `data-testid="counter-history-{id}"`

6. **AC-183-006**: TypeScript compilation passes
   - `npx tsc --noEmit` returns 0 errors

7. **AC-183-007**: Bundle size ≤512KB
   - Main bundle < 512KB after adding CounterPanel
   - CounterPanel lazy loaded

8. **AC-183-008**: New tests pass
   - CounterPanel tests pass
   - CounterStats tests pass
   - No regressions in existing tests

9. **AC-183-009**: App.tsx integration
   - Navigation button with `data-testid="nav-counters"`
   - Lazy loading of CounterPanel
   - Panel opens/closes correctly

10. **AC-183-010**: Full test suite passes
    - All 7425+ tests in full suite pass
    - No regressions

## Test Methods

### 1. AC-183-001/002/003: Rendering and Interaction
```bash
npm test -- --run src/components/Circuit/__tests__/CounterPanel.test.tsx
```
**Manual verification:**
- Open browser devtools
- Query: `document.querySelector('[data-testid="counter-panel"]')`
- Verify tabs: `[data-testid="counter-tab-all"]`, `[data-testid="counter-tab-active"]`, `[data-testid="counter-tab-overflow"]`
- Verify filter: `[data-testid="counter-category-filter"]`
- Verify sort: `[data-testid="counter-sort-select"]`
- Click each tab, verify list updates

### 2. AC-183-004: Statistics Display
```bash
npm test -- --run src/components/Circuit/__tests__/CounterStats.test.tsx
```
**Manual verification:**
- Open CounterPanel
- Query all stat elements: `counter-stats-total`, `counter-stats-active`, `counter-stats-overflow`, `counter-stats-percentage`
- Verify values are numeric and non-negative

### 3. AC-183-005: Counter History
```bash
npm test -- --run src/components/Circuit/__tests__/CounterPanel.test.tsx
```
**Manual verification:**
- With active simulation, query: `[data-testid^="counter-history-"]`
- Verify history array is displayed for each counter

### 4. AC-183-006: TypeScript
```bash
npx tsc --noEmit
```
**Expected:** Exit code 0, no errors

### 5. AC-183-007: Bundle Size
```bash
npm run build
ls dist/assets/*.js | xargs wc -c
```
**Expected:** Main bundle < 524,288 bytes (512 KB)

### 6. AC-183-008/010: Test Suite
```bash
npm test -- --run src/components/Circuit/
npm test -- --run
```
**Expected:** All tests pass, 256 files, 7400+ tests

### 7. AC-183-009: App Integration
**Manual verification:**
- Click `[data-testid="nav-counters"]` button in header
- Verify CounterPanel opens
- Click `[data-close-panel]` button
- Verify CounterPanel closes
- Reopen via nav button

## Risks

1. **Simulation store integration** — CounterPanel needs to read from `useSimulationStore`. If store structure changes, tests may break. Mitigation: Use typed getters.

2. **Lazy loading overhead** — Adding CounterPanel increases bundle complexity. Mitigation: Strict lazy loading with Suspense fallback.

3. **Test isolation** — CounterPanel depends on simulation store state. Mitigation: Mock store in unit tests.

## Failure Conditions

The sprint fails if ANY of the following are true:

1. TypeScript compilation has errors (`npx tsc --noEmit` returns non-zero)
2. Bundle size exceeds 512KB after build
3. Any new test file has failing tests
4. Existing test suite has regressions (any test fails)
5. CounterPanel does not render with required data-testid attributes
6. App integration does not work (panel cannot open/close)

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ `CounterPanel.tsx` created with all required data-testid attributes
2. ✅ `CounterStats.tsx` created with correct calculation logic
3. ✅ Unit tests created and passing for both components
4. ✅ `npx tsc --noEmit` returns 0 errors
5. ✅ Bundle size < 512KB
6. ✅ `npm test -- --run src/components/Circuit/` passes
7. ✅ `npm test -- --run` full suite passes (no regressions)
8. ✅ App.tsx integrated with nav-counters button
9. ✅ Panel opens via button click
10. ✅ Panel closes via close button
11. ✅ All 10 acceptance criteria verified

## Out of Scope

The following are explicitly NOT included in this sprint:

- Timer panel or timer statistics (P2)
- Counter export/import functionality
- Counter-to-counter comparison features
- Wire-level signal tracing (uses existing SignalTraceStore)
- Circuit challenge integration for counters
- Counter-based achievements
- Multi-user counter synchronization
- Historical counter data persistence
- Counter animation effects
- Mobile-optimized CounterPanel layout
