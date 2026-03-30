# Sprint Contract — Round 45

## Scope

**Remediation Sprint** — Fix critical integration gap from Round 44.

The EnhancedStatsDashboard and all its components exist in source and pass 65 unit tests, but users cannot access them because `App.tsx` still renders the old `StatsDashboard`. This sprint replaces the old component with the new one.

## Spec Traceability

- **P0 items covered this round:**
  - AC1-AC5: Integrate Machine Comparison Panel, Trend Charts, Module Composition Chart, Rarity Distribution Chart, Statistics Export into the application — these features exist in source from Round 44, now wire them to the UI

- **P0 items carried from Round 44 (verified passing, pending integration):**
  - AC1: Machine Comparison Panel — component exists, needs integration
  - AC2: Trend Charts — component exists, needs integration
  - AC3: Module Composition Chart — component exists, needs integration
  - AC4: Rarity Distribution Chart — component exists, needs integration
  - AC5: Statistics Export — functionality exists, needs integration
  - AC6: Performance Score Formula — unit tests pass, feature accessible after integration

- **Remaining P0/P1 after this round:**
  - None — all Round 44 features are fully implemented in source and integrated into the UI

- **P2 intentionally deferred:**
  - AI naming integration (already has UI placeholder, awaiting backend)
  - Community trading system
  - Faction technology tree unlocks

## Deliverables

1. **`src/App.tsx`** — Updated import and render to use `EnhancedStatsDashboard`
2. **Verified browser test** — Stats button opens dashboard with 5 tabs
3. **All 1708+ tests pass** — Including existing regression suite

## Acceptance Criteria

1. **AC1:** App.tsx imports `EnhancedStatsDashboard` from `./components/Stats/EnhancedStatsDashboard`
2. **AC2:** App.tsx renders `<EnhancedStatsDashboard onClose={closeStatsPanel} />` instead of `<StatsDashboard />`
3. **AC3:** Browser test confirms 5 tabs visible: `['📊概览', '📈趋势', '🧩模块', '💎稀有度', '⚖️对比']`
4. **AC4:** Machine Comparison Panel accessible via "⚖️对比" tab
5. **AC5:** Trend Charts accessible via "📈趋势" tab with real data
6. **AC6:** Module Composition Chart accessible via "🧩模块" tab
7. **AC7:** Rarity Distribution Chart accessible via "💎稀有度" tab
8. **AC8:** Export Button visible and functional — generates valid JSON
9. **AC9:** `npm test -- --run` passes all 1708+ tests (regression check)
10. **AC10:** `npm run build` completes with 0 TypeScript errors

## Test Methods

1. **Import verification:** Check `App.tsx` imports `EnhancedStatsDashboard` from `./components/Stats/EnhancedStatsDashboard`
2. **Render verification:** Browser test confirms Stats button opens dashboard with 5 tabs
3. **Tab verification:** Confirm tabs are `['📊概览', '📈趋势', '🧩模块', '💎稀有度', '⚖️对比']`
4. **Feature verification:** Navigate to each tab, confirm content renders
5. **Export button:** Click "导出数据" button, verify JSON file downloads
6. **Unit tests:** `npm test -- --run` passes all 1708+ tests
7. **Build:** `npm run build` succeeds with 0 TypeScript errors

## Risks

1. **Low risk:** Single-file change, all components thoroughly tested in Round 44
2. **Import path verification:** Must verify exact path `./components/Stats/EnhancedStatsDashboard` exists
3. **No fallback needed:** Old `StatsDashboard` can remain in codebase or be removed after verification

## Failure Conditions

1. `src/App.tsx` still renders `<StatsDashboard />` instead of `<EnhancedStatsDashboard />`
2. Stats button opens old dashboard with 4 tabs — integration not applied
3. Browser test shows fewer than 5 tabs
4. Build fails with TypeScript errors
5. Any existing test fails (regression)

## Done Definition

1. `src/App.tsx` contains: `import { EnhancedStatsDashboard } from './components/Stats/EnhancedStatsDashboard';`
2. `src/App.tsx` renders `<EnhancedStatsDashboard onClose={closeStatsPanel} />` (not `<StatsDashboard />`)
3. Browser test confirms 5 tabs visible when Stats panel opens
4. `npm test -- --run` shows 1708+ tests passing
5. `npm run build` completes with 0 TypeScript errors

## Out of Scope

- Adding new features beyond integration
- Refactoring existing component implementations
- CSS/style changes to enhanced components
- Backend/AI integration work
- Documentation changes
