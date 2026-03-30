# Sprint Contract — Round 28 (REVISED) — APPROVED

## Revision Requests Addressed

| # | Issue | Resolution |
|---|-------|------------|
| 1 | AC8: Define viewport culling threshold | Added explicit 50px buffer definition |
| 2 | F6: Replace manual verification with automated test | Added automated touch/mouse co-existence test |
| 3 | Touch Gesture Test Reliability | Specified React Testing Library approach + CI flakiness handling |
| 4 | "useVirtualization()" naming | Renamed to `createVirtualizedModuleList()` with clarification |
| 5 | Remove "Mobile-specific cursor feedback" | Replaced with "Touch point indicator" and "Gesture visualization overlay" |
| 6 | Integration Test Robustness | Defined preconditions: deterministic seed + direct API setup fallback |

---

## Scope

**Feature Focus:** Performance Optimization, Enhanced Touch Gestures, and Integration Testing Coverage

This sprint enhances the Arcane Machine Codex Workshop with performance optimizations for SVG rendering, improved touch gesture support for mobile devices, and expanded integration test coverage. All changes must be additive and non-breaking.

---

## Spec Traceability

### P0 Items (Must Complete This Round)
- None — all P0 items from previous rounds have been completed

### P1 Items (Should Complete If Time Permits)
- Performance optimization for SVG rendering and animations
- Enhanced touch gesture support (pinch-to-zoom, two-finger pan)
- Integration test coverage for core workflows

### P2 Intentionally Deferred
- Cloud save/load
- Custom keyboard shortcut rebinding
- Social features beyond basic sharing
- 3D preview mode
- Multiplayer collaboration

### Remaining P0/P1 After This Round
- All P0/P1 items completed from previous rounds
- Project is feature-complete for MVP scope

---

## Deliverables

### 1. Performance Optimization (`src/utils/performanceUtils.ts`) — New
- `memoizeModuleRender()` — Cache module SVG renders using WeakMap by module ID
- `batchConnectionUpdates()` — Batch path recalculation for connection updates
- `throttleViewportUpdates()` — Throttle zoom/pan handlers (16ms threshold for 60fps)
- `createVirtualizedModuleList()` — Returns only visible modules based on viewport + buffer

### 2. Enhanced Touch Support (`src/components/Accessibility/MobileTouchEnhancer.tsx`) — Enhancement
- Two-finger pinch-to-zoom (scale factor: 0.5x - 2.0x)
- Two-finger pan for canvas navigation
- Touch gesture detection with debouncing (150ms threshold)
- Touch point indicator — Visual feedback showing touch contact points
- Gesture visualization overlay — Animated arc/line showing gesture direction during pan

### 3. Integration Tests (`src/__tests__/integration/`)
- `fullWorkflow.integration.test.ts` — Create machine → Activate → Save to Codex → Export
- `touchGesture.integration.test.ts` — Mobile interaction tests with touch event simulation
- `performance.integration.test.ts` — Performance benchmarks

### 4. Performance Test Suite (`src/__tests__/performance.test.ts`) — Enhancement
- Module render time benchmarks (target: <2ms per module)
- Connection path calculation benchmarks
- Canvas zoom/pan performance tests
- Memory usage tests

### 5. Update Canvas Component (`src/components/Editor/Canvas.tsx`) — Enhancement
- Implement viewport culling for off-screen modules (50px buffer)
- Add connection path caching
- Integrate throttle/debounce for viewport handlers

---

## Acceptance Criteria

All criteria verified by automated CI tests.

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC1 | Pinch-to-zoom: Two-finger gesture changes viewport zoom (0.5x - 2.0x range) | `testTouchGestures` with scale delta, zoom state updates |
| AC2 | Two-finger pan: Gesture changes viewport x/y position | Touch simulation moves viewport coordinates |
| AC3 | Render 50 modules: Canvas remains interactive (target: <100ms frame time) | Performance benchmark test |
| AC4 | Full workflow test: Create → Activate → Codex → Export completes without errors | Integration test passes end-to-end |
| AC5 | `npm run build` completes with 0 TypeScript errors | Build exit code = 0 |
| AC6 | All existing tests pass (no regressions) | Test suite exit code = 0 |
| AC7 | Touch gesture handler detects gesture type correctly | Unit test verifies gesture classification |
| AC8 | Viewport culling: Modules with bounding boxes completely outside viewport + 50px buffer are not rendered in the DOM | Canvas DOM inspection shows only visible modules |

---

## Test Methods

### performance.test.ts
- `renderModuleBenchmark()` — Measure render time for N modules
- `connectionPathBenchmark()` — Measure path calculation time
- `viewportUpdateBenchmark()` — Measure zoom/pan response time
- `memoryBenchmark()` — Check for memory leaks during extended use

### touchGesture.integration.test.ts
**Touch Event Simulation Approach:**
- Library: `@testing-library/react` with custom TouchEvent constructors
- Simulated touch event properties:
  - `touches`: Array of Touch objects with `clientX`, `clientY`, `identifier`
  - `targetTouches`: Active touches on target element
  - `changedTouches`: Touches that changed state
  - `preventDefault()`: Stub function to verify calls
- CI Flakiness Handling:
  - 2 retry attempts for gesture tests (max 3 total attempts)
  - Tolerance threshold: ±5% for position/scale assertions
  - 100ms debounce window for gesture detection
- Test cases:
  - `pinchToZoom()` — Simulate pinch gesture, verify zoom change
  - `twoFingerPan()` — Simulate pan gesture, verify position change
  - `singleTap()` — Simulate tap, verify module selection
  - `longPress()` — Simulate long press, verify context menu
  - `touchMouseCoexistence()` — Verify touch events don't block mouse events

### fullWorkflow.integration.test.ts
**Test Data Strategy (in order of preference):**
1. **Direct API Setup (Primary):** Create valid machine via direct API calls in `beforeEach` hook
2. **Deterministic Seed (Fallback):** Use `Math.seedrandom` with fixed seed `codex-workshop-2024` for `randomForge()`
3. **Known-Valid Machine Mock (Last Resort):** Mock `randomForge` to return pre-validated machine state

**Test Cases:**
- `createAndActivate()` — Create machine, verify activation animation
- `saveToCodex()` — Save machine to codex, verify entry created
- `exportMachine()` — Export to SVG/PNG, verify file generated
- `randomForgeWorkflow()` — Random forge → Edit → Save → Export

---

## Risks

| Risk | Mitigation |
|------|------------|
| Performance tests may be flaky on CI | Use consistent timing thresholds and average over 3 runs |
| Touch gesture tests require precise simulation | React Testing Library + custom TouchEvent constructors; 2 retry attempts |
| Performance gains may vary by browser | Target Chrome/Chromium as primary, use feature detection |
| Touch event simulation may not match real device behavior | Test interaction logic, not exact coordinates; tolerance thresholds |

---

## Failure Conditions

| # | Failure Condition | Detection |
|---|-------------------|-----------|
| F1 | Build fails with TypeScript errors | `npm run build` exit code != 0 |
| F2 | Existing tests fail (regression) | `npm test -- --run` exit code != 0 |
| F3 | Touch gestures cause console errors | Jest reports console.error |
| F4 | Performance regression: >100ms render time with 50 modules | Test assertion fails |
| F5 | Integration workflow test fails at any step | Test assertion fails |
| F6 | Touch events prevent mouse events from firing | Automated test `touchMouseCoexistence()` fails |

**F6 Test Specification:**
```
touchMouseCoexistence()
1. Add touch start listener to canvas
2. Add mouse click listener to canvas
3. Simulate touch start event
4. Verify: touch event handler called, mouse click handler still callable
5. If mouse click blocked: FAIL
```

---

## Done Definition

- [ ] `npm run build` succeeds with 0 TypeScript errors (exit code 0)
- [ ] `npm test -- --run src/__tests__/performance.test.ts` passes
- [ ] `npm test -- --run src/__tests__/touchGesture.integration.test.ts` passes (with retry logic)
- [ ] `npm test -- --run src/__tests__/integration/fullWorkflow.integration.test.ts` passes
- [ ] All existing 1478+ tests continue to pass
- [ ] Pinch-to-zoom changes zoom between 0.5x and 2.0x
- [ ] Two-finger pan updates viewport x/y
- [ ] Canvas with 50 modules renders in <100ms
- [ ] Viewport culling: modules with bounding boxes outside viewport + 50px buffer are not rendered in DOM
- [ ] Touch point indicator visible during touch interactions
- [ ] Gesture visualization overlay animates during pan gestures
- [ ] `touchMouseCoexistence()` test passes
- [ ] No console errors during test execution

---

## Out of Scope

1. Cloud save/load functionality
2. Custom keyboard shortcut rebinding UI
3. Social sharing beyond existing export
4. 3D preview mode
5. Multiplayer collaboration
6. Sound effects integration
7. Video recording of activations
8. Cloud-based module library
9. Physical device testing (mobile simulators/emulators)
10. Battery performance optimization

---

## Revision History

### Round 28 Revisions (this submission)
1. **AC8 threshold defined:** "Modules with bounding boxes completely outside viewport + 50px buffer"
2. **F6 automated:** Added `touchMouseCoexistence()` test to verify touch/mouse co-existence
3. **Touch test approach:** Specified React Testing Library + custom TouchEvent constructors; 2 retry attempts; ±5% tolerance
4. **Naming fixed:** Renamed `useVirtualization()` → `createVirtualizedModuleList()` (utility function)
5. **Cursor feedback removed:** Replaced with touch point indicator + gesture visualization overlay
6. **Integration test data:** Direct API setup primary, deterministic seed fallback, known-valid mock last resort
