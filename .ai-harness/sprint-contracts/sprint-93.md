# Sprint Contract — Round 93 (REVISED)

## Scope

**Primary Focus:** Performance Verification and Code Quality Assurance

This round focuses on verifying system performance under realistic conditions, ensuring the viewport culling fallback doesn't impact user experience, and adding targeted tests for edge cases. The goal is to maintain the exceptional quality (9.5/10) achieved in Round 92.

---

## REVISION RESPONSES

### Response to Request #1: Exact Test File Paths

**Decision:** Create new test files for fallback interval verification.

| File | Action | Purpose |
|------|--------|---------|
| `src/__tests__/performance/fallbackInterval.test.ts` | **CREATE NEW** | Verify 500ms fallback interval cleanup and performance |
| `src/__tests__/performance/canvasUnmountCleanup.test.ts` | **CREATE NEW** | Verify Canvas unmount cleanup of all intervals/subscriptions |
| `src/__tests__/viewportCulling.test.ts` | **EXTEND** | Add edge case tests per QA feedback |

### Response to Request #2: Binary Acceptance Criteria

All ACs now have explicit numeric thresholds or boolean verification methods.

### Response to Request #3: Test Contents

Each new test file includes explicit test structure with ARRANGE/ACT/ASSERT comments.

---

## Spec Traceability

### P0 Items (Must Complete)
1. **Performance Verification — Periodic Fallback Interval** — Verify that the 500ms fallback interval in Canvas.tsx (lines 296-309) doesn't impact performance in normal browser use
   - **Trace to Round 92:** Lines 296-309 in `src/components/Editor/Canvas.tsx` implement the 500ms fallback
   
2. **Memory Leak Prevention** — Ensure all intervals and subscriptions are properly cleaned up
   - **Trace to Round 92:** `useEffect` cleanup at lines 296-313 in Canvas.tsx
   
3. **Test Coverage Enhancement** — Add tests for edge cases discovered during Round 92 verification
   - **Trace to Round 92:** QA evaluation mentions "robust cross-environment canvas sizing"

### P1 Items (Should Complete)
1. **Animation Performance Verification** — Ensure activation animations and particle systems remain smooth
2. **Error Boundary Coverage** — Verify error boundaries catch rendering errors gracefully
   - **Trace to Round 92:** `accessibility.test.tsx` contains ErrorBoundary tests
3. **Accessibility Verification** — Ensure keyboard navigation works after viewport fix

### P2 Items (Intentionally Deferred)
- AI naming/description generation (already implemented)
- Community sharing features (already implemented)
- Codex trading/exchange system (already implemented)
- Challenge leaderboard/rankings
- Timed/limited challenges

---

## Deliverables

### 1. `src/__tests__/performance/fallbackInterval.test.ts` (NEW FILE)

**Purpose:** Verify the 500ms fallback interval doesn't impact render performance and is properly cleaned up.

```typescript
// Test Suite Structure:
describe('Fallback Interval Performance', () => {
  // Test 1: Verify 500ms interval doesn't cause frame drops
  it('should maintain ≥55 FPS with 500ms fallback interval running', () => {
    // ARRANGE: Create 20 modules on canvas, start fallback interval
    // ACT: Measure frame times over 1 second (2 intervals should run)
    // ASSERT: All frame times <18ms (avg FPS ≥55)
  });
  
  // Test 2: Verify interval is cleared when valid dimensions detected
  it('should clear fallback interval when canvas dimensions become valid', () => {
    // ARRANGE: Mock ResizeObserver, start with invalid dimensions
    // ACT: Simulate dimension measurement returning {width: 800, height: 600}
    // ASSERT: clearInterval called with fallbackInterval ID within 500ms
  });
});

describe('Fallback Interval Cleanup', () => {
  // Test 3: Verify interval cleanup on component unmount
  it('should call clearInterval on Canvas unmount', () => {
    // ARRANGE: Mock setInterval/clearInterval, render Canvas
    // ACT: Unmount Canvas component
    // ASSERT: clearInterval called at least once with any interval ID
  });
  
  // Test 4: Verify interval doesn't run unnecessarily
  it('should not start fallback interval if ResizeObserver is available and fires', () => {
    // ARRANGE: Mock working ResizeObserver
    // ACT: Render Canvas
    // ASSERT: setInterval not called, OR if called, cleared within 500ms
  });
});
```

### 2. `src/__tests__/performance/canvasUnmountCleanup.test.ts` (NEW FILE)

**Purpose:** Verify all Canvas cleanup functions are called on unmount.

```typescript
// Test Suite Structure:
describe('Canvas Unmount Cleanup', () => {
  // Test 1: Verify all intervals are cleared
  it('should clear all setInterval calls on unmount', () => {
    // ARRANGE: Track all setInterval calls
    // ACT: Mount then unmount Canvas
    // ASSERT: All tracked interval IDs passed to clearInterval
  });
  
  // Test 2: Verify event listeners are removed
  it('should remove window resize listener on unmount', () => {
    // ARRANGE: Mock window.addEventListener/removeEventListener
    // ACT: Mount then unmount Canvas
    // ASSERT: removeEventListener called for resize event
  });
  
  // Test 3: Verify ResizeObserver is disconnected
  it('should disconnect ResizeObserver on unmount', () => {
    // ARRANGE: Mock ResizeObserver with disconnect method
    // ACT: Mount then unmount Canvas
    // ASSERT: ResizeObserver.disconnect() called
  });
  
  // Test 4: Verify cleanup runs before new effect (hot reload safe)
  it('should cleanup previous effect before running new effect', () => {
    // ARRANGE: Mount Canvas, track cleanup calls
    // ACT: Force re-render (simulating parent update)
    // ASSERT: Cleanup called before any new interval setup
  });
});
```

### 3. `src/__tests__/viewportCulling.test.ts` (EXTEND EXISTING)

**Purpose:** Add edge cases from Round 92 QA feedback.

```typescript
// Add these tests to existing describe block:
describe('Cross-Environment Edge Cases', () => {
  // Test 1: Verify modules near origin always visible
  it('should render modules at origin (0,0) regardless of viewport state', () => {
    // ARRANGE: Module at {x: 0, y: 0}, viewport bounds
    // ACT: Call createVirtualizedModuleList
    // ASSERT: Module at (0,0) included in result
  });
  
  // Test 2: Verify SAFE_VIEWPORT_MARGIN ensures visibility
  it('should include SAFE_VIEWPORT_MARGIN buffer around origin', () => {
    // ARRANGE: Bounds calculation with default viewport
    // ACT: Call calculateSafeViewportBounds
    // ASSERT: left < 0 and top < 0 by at least SAFE_VIEWPORT_MARGIN
  });
  
  // Test 3: Verify negative viewport dimensions handled
  it('should handle negative viewport dimensions without crash', () => {
    // ARRANGE: Viewport {width: -100, height: -50}
    // ACT: Call createVirtualizedModuleList
    // ASSERT: Returns safe fallback bounds, no exception thrown
  });
  
  // Test 4: Verify fractional viewport dimensions (CSS subpixel)
  it('should handle fractional viewport dimensions', () => {
    // ARRANGE: Viewport {width: 799.5, height: 599.5}
    // ACT: Call createVirtualizedModuleList
    // ASSERT: Modules within bounds included
  });
  
  // Test 5: Verify modules beyond initial viewport visible after scroll
  it('should include modules outside initial viewport when panned', () => {
    // ARRANGE: Module at {x: 2000, y: 1500}, viewport offset
    // ACT: Call createVirtualizedModuleList with offset
    // ASSERT: Module visible when offset brings it into view
  });
});
```

---

## Acceptance Criteria (REVISED)

| ID | Criterion | Verification Method | Binary Threshold |
|----|-----------|---------------------|------------------|
| AC-PERF-001 | Canvas renders 20 modules at ≥55 FPS during drag with 500ms fallback running | Measure frame time using requestAnimationFrame loop, assert avg <18ms over 60 frames | YES — avg frame time <18ms |
| AC-PERF-002 | Fallback interval cleared on unmount | Mock setInterval/clearInterval, verify clearInterval called with interval ID within 100ms of unmount | YES — clearInterval called with correct ID |
| AC-PERF-003 | All 3237 existing tests continue to pass | `npx vitest run` exit code 0 | YES — exit code 0, 3237+ tests |
| AC-PERF-004 | Build size remains under 545KB | `npm run build` bundle size check | YES — < 545KB |
| AC-PERF-005 | No new TypeScript errors introduced | `npm run build` 0 errors | YES — 0 TypeScript errors |
| AC-PERF-006 | Error boundary catches render errors | Error boundary test in accessibility.test.tsx passes | YES — test passes |
| AC-PERF-007 | All Canvas intervals/subscriptions cleaned up on unmount | Mock verification tests pass | YES — all cleanup verified |

---

## Test Methods

### 1. Fallback Interval Tests (NEW)
```bash
npx vitest run src/__tests__/performance/fallbackInterval.test.ts
```
**Expected Output:**
```
 ✓ should maintain ≥55 FPS with 500ms fallback interval running
 ✓ should clear fallback interval when canvas dimensions become valid
 ✓ should call clearInterval on Canvas unmount
 ✓ should not start fallback interval if ResizeObserver is available
```

### 2. Canvas Cleanup Tests (NEW)
```bash
npx vitest run src/__tests__/performance/canvasUnmountCleanup.test.ts
```
**Expected Output:**
```
 ✓ should clear all setInterval calls on unmount
 ✓ should remove window resize listener on unmount
 ✓ should disconnect ResizeObserver on unmount
 ✓ should cleanup previous effect before running new effect
```

### 3. Viewport Culling Edge Case Tests (EXTENDED)
```bash
npx vitest run src/__tests__/viewportCulling.test.ts
```
**Expected Output:** 25 existing + 5 new tests = 30 tests passing

### 4. Full Test Suite
```bash
npx vitest run
```
**Expected:** 3237+ tests passing, 145+ test files

### 5. Build Verification
```bash
npm run build
```
**Expected:** 0 TypeScript errors, main bundle < 545KB

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| New tests might uncover existing issues | Low | Medium | If issues found, fix them in same sprint |
| Performance tests flaky in CI | Medium | Low | Use stable metrics (avg <18ms), allow margin |
| Interval cleanup might break existing behavior | Low | High | Verify all existing tests pass first |
| Mock-based tests don't match runtime behavior | Medium | Medium | Verify with Playwright smoke test after |

---

## Failure Conditions

The sprint is considered **failed** if any of the following occur:

1. **Any existing test fails** — all 3237 tests must continue to pass
2. **Build size exceeds 545KB** — bundle must remain under threshold
3. **TypeScript errors are introduced** — 0 errors required
4. **New tests reveal critical bugs** that cannot be safely fixed this round
5. **Canvas cleanup breaks existing functionality** — manual verification required
6. **Frame time exceeds 18ms average** — performance regression detected
7. **clearInterval not called on unmount** — memory leak would occur

---

## Done Definition

All of the following must be **true** before this sprint is considered complete:

1. ✓ **Fallback Interval Performance Tests Pass:** `npx vitest run src/__tests__/performance/fallbackInterval.test.ts` shows all 4 tests passing
2. ✓ **Canvas Cleanup Tests Pass:** `npx vitest run src/__tests__/performance/canvasUnmountCleanup.test.ts` shows all 4 tests passing
3. ✓ **Viewport Edge Cases Pass:** `npx vitest run src/__tests__/viewportCulling.test.ts` shows 30 tests passing (25 existing + 5 new)
4. ✓ **Existing Tests Pass:** `npx vitest run` shows 3237+ tests passing (145+ test files)
5. ✓ **Build Passes:** `npm run build` completes with 0 TypeScript errors and main bundle < 545KB
6. ✓ **Error Boundary Tests Pass:** Error handling tests in accessibility.test.tsx pass
7. ✓ **No Regressions:** All Round 92 acceptance criteria continue to work (verified by existing test suite)

---

## Out of Scope

The following items are explicitly NOT part of this sprint:

- Adding new features
- Changing the visual design or animations
- Modifying connection validation logic
- Adding new module types
- Changing activation pulse timing
- Adding new export formats
- Refactoring major architectural components
- Adding AI/community/faction enhancements
- Modifying SAFE_VIEWPORT_MARGIN value (currently 100)
- Changing the 500ms fallback interval duration

---

## Action Items Completed

1. ✅ **Clarified test file paths** — 2 new files specified, 1 existing extended
2. ✅ **Made acceptance criteria binary** — all ACs have explicit numeric thresholds or boolean verification
3. ✅ **Listed specific test assertions** — 4+4+5 = 13 total test cases specified with ARRANGE/ACT/ASSERT comments

---

**Contract prepared for Round 93 — Arcane Machine Codex Workshop**
**Status: APPROVED — Ready for Builder**
