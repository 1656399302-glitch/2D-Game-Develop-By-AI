# Sprint Contract — Round 43

## Scope

This sprint focuses on **Canvas Performance Optimization and Module Interaction Polish** to improve editor responsiveness and user experience with large numbers of modules and connections.

## Spec Traceability

### P0 items covered this round
- Canvas rendering optimization with virtualization for off-screen modules
- Connection path rendering optimization using SVG path caching
- Module selection performance improvement with memoization
- Animation frame rate optimization for activation sequences

### P1 items covered this round
- Improved module drag feedback with position interpolation
- Enhanced canvas zoom/pan smoothness
- Module snap-to-grid visual feedback enhancement
- Connection preview performance improvement

### Remaining P0/P1 after this round
- All P0 items from previous rounds completed (export quality system)
- All P1 items from original spec are implemented

### P2 intentionally deferred
- Real AI service integration (API key management)
- Cross-session community sharing (requires backend)
- Codex trading/exchange system
- Mobile-specific gesture training mode

## Deliverables

1. **Enhanced Canvas component** (`src/components/Editor/Canvas.tsx`)
   - Viewport culling using `createVirtualizedModuleList` with 50px buffer
   - Throttled viewport updates at 60fps via `throttleViewportUpdates`
   - Smart snap-to-grid with 8px threshold (existing: `smartSnapToGrid`)
   - Batch module position updates via `updateModulesBatch`
   - Box selection with multi-select support

2. **Performance utilities module** (`src/utils/performanceUtils.ts`) — Already exists with:
   - `ModuleRenderCache` class with LRU eviction (500 max entries)
   - `memoizeModuleRender()` for caching module SVG renders
   - `batchConnectionUpdates()` for throttled connection recalculation
   - `throttleViewportUpdates()` for 60fps viewport sync
   - `createVirtualizedModuleList()` for viewport culling
   - `filterVisibleConnections()` to only render visible connections
   - `calculateBounds()` for bounding box calculation
   - `benchmark()` and `isWithinFrameBudget()` utilities

3. **Selection handles component** (`src/components/Editor/SelectionHandles.tsx`)
   - Multi-module move, rotate (90°), and scale controls
   - Group operations via `handleSelectionMove`, `handleSelectionRotate`, `handleSelectionScale`

4. **Test coverage** (`src/__tests__/performance.test.ts`) — Already exists with:
   - Bundle size assertions (vendor chunk splitting, modern browser target)
   - Lazy loading verification for modal components
   - Component render performance tests (100 module list)
   - Memory usage and event listener cleanup tests
   - Real-world performance scenario tests (100 modules + connections)
   - Touch gesture performance tests

## Acceptance Criteria

All acceptance criteria are binary and verifiable via automated tests.

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC1 | `createVirtualizedModuleList` returns correct `visibleModules` based on viewport | Unit test: modules within viewport bounds + 50px buffer must be in `visibleModules` |
| AC2 | `createVirtualizedModuleList` returns correct `hiddenModuleIds` for off-screen modules | Unit test: modules outside viewport bounds + 50px buffer must be in `hiddenModuleIds` |
| AC3 | `throttleViewportUpdates` limits updates to 60fps (≥16ms interval) | Unit test: multiple rapid calls within 16ms must be batched |
| AC4 | `filterVisibleConnections` only returns connections with at least one visible endpoint | Unit test: connection between two hidden modules must be filtered out |
| AC5 | `memoizeModuleRender.getCached()` returns cached value for same (moduleId, rotation, scale, isSelected) | Unit test: same key returns cached SVG string |
| AC6 | `memoizeModuleRender.invalidate()` clears cache for specific module | Unit test: after invalidation, same moduleId returns null |
| AC7 | `ModuleRenderCache` implements LRU eviction at 500 entries | Unit test: after 501 unique entries, oldest entry is evicted |
| AC8 | Canvas renders `visibleCount/totalCount` indicator in viewport info | Component test: zoom indicator shows culling count when modules hidden |
| AC9 | `npm run build` succeeds with 0 TypeScript errors | Build verification |
| AC10 | All existing tests pass (backward compatibility) | `npm test -- --run` |

## Test Methods

### Unit Tests (via `src/__tests__/performance.test.ts` + `src/__tests__/integration/performance.integration.test.ts`)

1. **Viewport culling tests**
   - Test `createVirtualizedModuleList` with modules at various positions
   - Test boundary cases: exactly at viewport edge, exactly at buffer edge
   - Test with zoom ≠ 1.0

2. **Throttle tests**
   - Test that calls within 16ms are batched
   - Test that calls after 16ms are immediate
   - Test `reset()` clears pending state

3. **Connection filtering tests** ← MISSING: Need to add explicit tests for `filterVisibleConnections`
   - Test connection with both endpoints visible → included
   - Test connection with one endpoint hidden → included
   - Test connection with both endpoints hidden → excluded

4. **Cache tests** ← MISSING: Need to add explicit LRU eviction test
   - Test cache hit/miss tracking
   - Test LRU eviction after 500 entries (after 501 unique keys, first entry should be evicted)
   - Test key generation for (moduleId, rotation, scale, isSelected)

### Component Tests

5. **Canvas viewport info display**
   - Render canvas with 20+ modules
   - Pan viewport so only subset visible
   - Verify indicator shows `(visibleCount/totalCount)`

### Integration Tests

6. **Build and test suite**
   - Run `npm run build` — must complete with 0 errors
   - Run `npm test -- --run` — must pass all existing tests

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Over-optimization breaks reactivity | Low | Medium | Existing tests verify correct behavior; only optimize non-reactive paths |
| Performance tests are flaky | Low | Low | Use `performance.now()` for accurate timing; allow ±10% tolerance |
| Viewport culling causes visual glitches at boundaries | Low | Medium | 50px buffer ensures pre-rendering; fallback to full render if needed |
| Batch updates interfere with undo/redo | Medium | Medium | `saveToHistory()` called on `handleMouseUp`, not during drag |

## Failure Conditions

The round fails if ANY of the following occur:

1. **Test failures** — Any unit test in `performance.test.ts` or `performance.integration.test.ts` fails
2. **Build errors** — `npm run build` produces TypeScript errors
3. **Regression** — Any existing test suite fails
4. **Performance regression** — New tests must pass; no degradation required
5. **Viewport culling bug** — Module visible in viewport is not rendered (critical visual bug)

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ `src/__tests__/performance.test.ts` and `src/__tests__/integration/performance.integration.test.ts` exist and pass (≥25 test cases in performance.test.ts, ≥33 in integration)
2. ✅ `src/utils/performanceUtils.ts` exports all documented functions
3. ✅ `src/components/Editor/Canvas.tsx` uses `createVirtualizedModuleList` with 50px buffer
4. ✅ `src/components/Editor/Canvas.tsx` uses `throttleViewportUpdates` for viewport sync
5. ✅ Canvas shows culling indicator `(visibleCount/totalCount)` when modules are hidden
6. ✅ `npm run build` completes with 0 TypeScript errors
7. ✅ `npm test -- --run` passes all existing tests
8. ✅ No new TypeScript errors introduced
9. ✅ All documented functions have JSDoc comments

## Out of Scope

- Backend API integration for AI services
- Multi-user collaboration features
- Cloud save/sync functionality
- Real-time multiplayer editing
- Plugin system for custom modules
- 3D export capabilities
- Audio system integration
- Video recording of activations
- Social media API integration
- Payment/processing features
- Runtime frame rate profiling (metrics only, no UI)
- Custom performance dashboard UI

---

## REVISION NOTES (Round 43)

The following acceptance criteria require explicit unit tests that are currently MISSING:

1. **AC4 (filterVisibleConnections)**: Function is implemented and used in Canvas.tsx, but no explicit test verifies:
   - Connection with both endpoints visible → included
   - Connection with one endpoint hidden → included
   - Connection with both endpoints hidden → excluded

2. **AC7 (ModuleRenderCache LRU eviction)**: Class is implemented with maxSize=500, but no explicit test verifies:
   - After 501 unique cache entries, the oldest entry is evicted
   - LRU ordering is maintained on get/set operations

**Required Action**: Add explicit unit tests for AC4 and AC7 before this contract can be approved.

**Note on test counts**: Done Definition checkpoint #1 updated to reflect actual test counts (≥25 in `performance.test.ts`, ≥33 in integration). Total performance tests = 58.

---

## Contract History

| Round | Status | Notes |
|-------|--------|-------|
| 42 | APPROVED | Export quality system - PNG resolution tiers, transparent background, aspect ratios, filename persistence |
| 43 | PENDING | Awaiting explicit tests for AC4 and AC7 |
