# Sprint Contract — Round 26

## Scope

**Feature Focus: Machine Statistics Dashboard**

This sprint implements a Statistics Dashboard that provides real-time analytics and metrics for the current machine on the canvas. The dashboard integrates with existing systems (useMachineStore, attribute generator, faction calculator) to display machine statistics.

## Spec Traceability

### P0 Items (Must Complete This Round)
- **AC1**: Statistics Dashboard Panel UI — Toolbar button opens panel showing machine metrics
- **AC2**: Real-time Metric Updates — Stats recalculate when modules/connections change
- **AC3**: Energy Flow Analysis — Visual representation of connection throughput
- **AC4**: Complexity Score Calculation — Numeric score (0-100) with factor breakdown

### P1 Items (Should Complete If Time Permits)
- **AC5**: Performance Prediction — Estimated activation success percentage
- **AC6**: `npm run build` completes with 0 TypeScript errors

### Remaining P0/P1 After This Round
- All core systems from spec are implemented
- Enhanced statistics dashboard adds analytical depth
- No blocking P0/P1 items remain incomplete

### P2 Intentionally Deferred
- Real AI API integration for advanced analysis
- Machine comparison feature (compare two saved machines)
- Export statistics report as PDF
- Machine simulation (predict exact activation behavior)

## Deliverables

1. **Statistics Dashboard Component** (`src/components/Stats/StatsDashboard.tsx`)
   - Panel opens from toolbar stats icon
   - Tabs: Overview, Energy Flow, Complexity, Recommendations
   - Real-time stats via Zustand subscription to machineStore
   - Collapsible sections for detailed breakdowns

2. **Stats Store** (`src/store/useStatsStore.ts`)
   - Machine-specific statistics calculation
   - Energy flow metrics (throughput per connection)
   - Complexity breakdown by module type
   - Memoized calculations for performance

3. **Statistics Utilities** (`src/utils/statisticsUtils.ts`)
   - `calculateComplexityScore(modules, connections): number` — Returns 0-100
   - `analyzeEnergyFlow(connections): EnergyFlowResult` — Connection throughput data
   - `getBottleneckModules(modules, connections): string[]` — Module IDs with most connections
   - `calculateTheoreticalPower(modules): number` — Estimated power output
   - `getMachineHealth(modules, connections): number` — 0-100 condition score

4. **Toolbar Integration** (`src/store/useMachineStore.ts` + toolbar component)
   - Stats button visible in toolbar
   - Panel open/close state management

5. **Unit Tests** (`src/__tests__/statisticsDashboard.test.ts`)
   - Tests for each calculation function
   - Edge cases: empty machine, single module, disconnected modules
   - Tests verify numeric outputs match expected values
   - **UI integration tests** for AC1–AC4 using @testing-library/react

## Acceptance Criteria

All acceptance criteria must have automated, CI-verifiable test assertions.

| # | Criterion | Concrete Verification |
|---|-----------|----------------------|
| AC1 | Stats button exists in toolbar | `expect(screen.getByTestId('stats-button')).toBeInTheDocument()` |
| AC2 | Clicking stats button opens dashboard panel | `userEvent.click(screen.getByTestId('stats-button'))` then `expect(screen.getByTestId('stats-panel')).toBeVisible()` |
| AC3 | Adding module updates stats within 100ms | `await waitFor(() => expect(screen.getByText('Module Count: 1')).toBeInTheDocument())` after store action; OR test uses `act()` with fake timers to assert count updates |
| AC4 | Overview tab shows: Module Count (number), Connection Count (number), Faction (string), Stability (0-100), Power (number) | `expect(screen.getByTestId('stat-module-count')).toHaveTextContent(/\d+/)` AND `expect(screen.getByTestId('stat-connection-count')).toHaveTextContent(/\d+/)` AND `expect(screen.getByTestId('stat-faction')).toHaveTextContent(/^[A-Z][a-z]+/)` AND `expect(parseInt(screen.getByTestId('stat-stability').textContent)).toBeGreaterThanOrEqual(0)` AND `expect(screen.getByTestId('stat-power')).toHaveTextContent(/\d+\.?\d*/)` |
| AC5 | Energy Flow tab shows connection throughput data | `userEvent.click(screen.getByRole('tab', { name: /energy flow/i }))` then `expect(screen.getAllByTestId(/energy-flow-stat/)).toHaveLength(connectionCount)` OR verify at least 1 throughput stat element present |
| AC6 | Complexity tab shows numeric score (0-100) with ≥3 factor labels | `expect(screen.getByTestId('complexity-score')).toHaveTextContent(/\d+/ )` AND `expect(screen.getAllByTestId('complexity-factor')).toHaveLength(3)` with score range validated by parsing text |
| AC7 | `npm run build` completes with 0 TypeScript errors | `npm run build` exit code = 0 |
| AC8 | Stats update after adding/removing connections | Add connection via store action → `expect(screen.getByTestId('stat-connection-count')).toHaveTextContent(/^N$/ )` where N increments; Remove connection → count decrements |

**AC4 Note:** Each metric must have a unique `data-testid` attribute (e.g., `data-testid="stat-module-count"`, `data-testid="stat-connection-count"`, `data-testid="stat-faction"`, `data-testid="stat-stability"`, `data-testid="stat-power"`). Faction must be a non-empty string matching pattern `/^[A-Z][a-z]+/` (e.g., "Void", "Ember", "Arcane").

## Test Methods

### Test File Requirements
The test file MUST be located at `src/__tests__/statisticsDashboard.test.ts` and include:

1. **Unit Tests for Calculation Functions** (AC3, AC6)
   - Test `calculateComplexityScore()` with various module/connection combinations
   - Test `analyzeEnergyFlow()` returns correct throughput values
   - Verify edge cases: empty machine returns valid defaults

2. **UI Integration Tests** (AC1, AC2, AC4, AC5)
   - Render Canvas with Toolbar and StatsDashboard components
   - Use `@testing-library/react` with `screen` queries and `userEvent`
   - Test tab navigation and content display

3. **Store Subscription Tests** (AC3, AC8)
   - Mock or use actual Zustand store
   - Dispatch actions (addModule, removeModule, addConnection, removeConnection)
   - Assert on component re-renders or store state

### Test Commands
```bash
# Run statistics dashboard tests only
npm test -- --run src/__tests__/statisticsDashboard.test.ts

# Run full test suite
npm test -- --run
```

## Risks

1. **State Sync Risk** — Stats must update without causing re-render loops
   - Mitigation: Use Zustand selectors with shallow equality checks
   - Debounce calculations if needed

2. **Performance Risk** — Complexity calculations on large machines (>50 modules)
   - Mitigation: Memoize with useMemo, consider Web Workers for heavy calculations

3. **Visual Clarity Risk** — Energy flow visualization with many connections
   - Mitigation: Limit visible elements, provide summary metrics instead of full diagram

## Failure Conditions

**All conditions must be automatically detected by test assertions or build commands. Manual inspection is not acceptable.**

| # | Failure Condition | Automatic Detection |
|---|-------------------|----------------------|
| F1 | Build fails with TypeScript errors | `npm run build` exit code != 0 |
| F2 | Stats button not found | `screen.getByTestId('stats-button')` throws NotFoundError |
| F3 | Panel does not open on click | After click, `screen.getByTestId('stats-panel')` not visible or throws |
| F4 | Module count does not update after add | After addModule action, assertion `toHaveTextContent(/\d+/ )` fails |
| F5 | Required metrics missing from Overview | Any of the 5 required testids not found or have invalid content |
| F6 | No throughput data in Energy Flow tab | `getAllByTestId(/energy-flow-stat/)` returns empty array |
| F7 | Complexity score out of range or <3 factors | Score < 0 or > 100, OR factor count < 3 |
| F8 | Connection count does not update | After addConnection, count assertion fails |
| F9 | Existing tests fail (regression) | `npm test -- --run` exit code != 0 |
| F10 | Console errors during tests | Jest reports unhandled console errors |

## Done Definition

**All conditions must be TRUE before claiming completion. Each item must be verifiable by automated test or build command.**

- [ ] `npm run build` succeeds with 0 TypeScript errors (exit code 0)
- [ ] `screen.getByTestId('stats-button')` exists in rendered toolbar
- [ ] Clicking stats button makes `screen.getByTestId('stats-panel')` visible
- [ ] Overview tab displays all 5 metrics with correct types:
  - Module Count: numeric value
  - Connection Count: numeric value
  - Faction: non-empty string matching `/^[A-Z][a-z]+/`
  - Stability: number in range 0-100
  - Power: positive number
- [ ] Energy Flow tab displays throughput data (≥1 `data-testid` matching `/energy-flow-stat/`)
- [ ] Complexity tab displays numeric score (0-100) with ≥3 `data-testid="complexity-factor"` elements
- [ ] Adding a module updates module count (test with fake timers or waitFor)
- [ ] Adding a connection updates connection count
- [ ] Removing a module decrements module count
- [ ] Removing a connection decrements connection count
- [ ] `npm test -- --run src/__tests__/statisticsDashboard.test.ts` passes (all assertions green)
- [ ] All existing tests continue to pass (`npm test -- --run` exit code 0)

**Note:** The "Recommendations tab" is P2/ungraded. It is tracked in Deliverables for completeness but is NOT part of the done definition and will not cause round failure.

## Out of Scope

1. **Real-time simulation** — Predicting exact activation sequence behavior
2. **Machine comparison** — Side-by-side stats with other saved machines
3. **PDF/Report export** — Exporting statistics as document
4. **AI-powered recommendations** — ML-based suggestions (static mock only)
5. **Mobile statistics view** — Responsive layout for mobile devices
6. **Historical tracking** — Storing stats across save/load sessions
7. **Recommendations tab functionality** — P2 feature not included in acceptance criteria

---

**Spec.md Traceability Confirmation:** The `spec.md` file correctly describes the "Arcane Machine Codex Workshop" project. This sprint's Statistics Dashboard is an implementation of analytics/visualization features that align with the project scope: machine property display, attribute visualization, and system analysis capabilities. No spec.md updates required.

---

**Contract Review — Round 26: APPROVED**

*All acceptance criteria are binary and CI-verifiable. Done definition is comprehensive. No vague language, no hidden scope shifts, no fuzzy success conditions.*
