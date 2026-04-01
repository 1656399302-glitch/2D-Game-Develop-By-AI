# Sprint Contract — Round 78 — APPROVED

## Scope

This sprint focuses on **P2 enhancements, edge case hardening, and performance optimization** following Round 77's successful completion of all P0/P1 work (full spec coverage, 10/10 scores, 2661 tests passing).

The sprint targets three areas:
1. **Export poster enhancement** — Add custom background color options for enhanced posters
2. **Random generator edge cases** — Improve handling of boundary conditions (min=max modules, very sparse connections)
3. **Performance optimization** — Optimize connection path rendering for large machines

## Spec Traceability

- **P0 items covered this round:** None (all P0 complete per Round 77)
- **P1 items covered this round:** None (all P1 complete per Round 77)
- **Remaining P0/P1 after this round:** None
- **P2 items this round:**
  - Export poster custom background color
  - Random generator boundary condition handling
  - Connection path rendering optimization

## Deliverables

1. **`src/types/index.ts`** — Add `PosterBackgroundColor` type and related exports
2. **`src/components/Export/EnhancedShareCard.tsx`** — Add custom background color selector with preset options (dark, faction-themed, gradient)
3. **`src/components/Export/ExportModal.tsx`** — Pass background color option through export flow
4. **`src/utils/randomGenerator.ts`** — Handle edge cases:
   - When minModules === maxModules: use fixed count
   - Low connection density: ensure at least 1 valid connection exists
   - Empty canvas generation: add fallback core module
5. **`src/utils/exportUtils.ts`** — Apply background color to enhanced poster SVG generation
6. **`src/__tests__/exportPosterPresets.test.ts`** — Test custom background color feature
7. **`src/__tests__/randomGeneratorEdgeCases.test.ts`** — Test boundary conditions
8. **Performance optimization** — Add `useMemo` optimization to EnergyPath rendering

## Acceptance Criteria

1. **AC1:** Export enhanced poster with custom background color — user can select from 5 color options (dark default, faction-colored, cyan gradient, purple gradient, gold gradient) and the exported SVG reflects the selection
2. **AC2:** Random generator when min=max=3 — generates exactly 3 modules without error
3. **AC3:** Random generator low density — always produces at least 1 connection (not 0)
4. **AC4:** Empty canvas random generation — generates a valid machine with at least 1 core module
5. **AC5:** EnergyPath re-renders only when connections change — verified via React DevTools or console logging
6. **AC6:** All existing tests pass (2661+ tests)
7. **AC7:** Build passes with bundle size < 560KB

## Test Methods

1. **AC1:** Browser test — open ExportModal, select enhanced-poster, click background color option, export, verify SVG contains the color/gradient definition
2. **AC2:** Unit test — call randomGenerator with {minModules: 3, maxModules: 3}, assert result.modules.length === 3
3. **AC3:** Unit test — call randomGenerator with connectionDensity='low', assert result.connections.length >= 1
4. **AC4:** Unit test — clear store, call generateWithTheme, assert result has at least 1 core module (type: 'core')
5. **AC5:** Add test that wraps EnergyPath in React.memo test component, trigger parent re-render without connections change, assert no unnecessary re-render
6. **AC6:** `npx vitest run` — all tests must pass
7. **AC7:** `npm run build` — bundle size check, TypeScript 0 errors

## Risks

1. **Export format compatibility** — Adding background color to SVG must not break existing PNG/poster export paths
2. **Test coverage** — New tests must not be skipped or flaky
3. **Bundle size creep** — Adding new types and utilities must not push bundle over 560KB

## Failure Conditions

1. Any existing test fails (regression)
2. Bundle size exceeds 560KB
3. TypeScript compilation errors introduced
4. Export enhanced poster functionality broken for existing formats

## Done Definition

All of the following must be true:
1. ✅ 5 new background color options appear in enhanced poster export UI
2. ✅ Random generator produces valid output for all boundary inputs (min=max, low density, empty canvas)
3. ✅ EnergyPath component is memoized and only re-renders on connection change
4. ✅ `npx vitest run` passes all tests (expected 2661+)
5. ✅ `npm run build` succeeds with bundle < 560KB
6. ✅ TypeScript 0 errors
7. ✅ New tests added and passing for all AC scenarios

## Out of Scope

- AI naming/description feature (already implemented)
- Community gallery expansion (already implemented)
- Exchange/trading system (already implemented)
- Recipe system (already implemented)
- Faction tech tree (already implemented)
- Challenge system (already implemented)
- Module type additions (6+ modules exist)
- Accessibility improvements (already addressed)
- Tutorial system (already implemented)
- Achievement system (already implemented)
- Statistics dashboard (already implemented)
- New social platform presets (Twitter/Instagram/Discord already done)
- PNG transparency feature (already implemented)
- Faction card export (already implemented)
- Toast queue system (already implemented)
