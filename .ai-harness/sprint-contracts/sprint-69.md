# Sprint Contract — Round 69

## Scope

This round focuses on **animation refinements and interaction polish** for the Arcane Machine Codex Workshop. The goal is to enhance the visual experience during machine activation and improve micro-interactions without changing core functionality or affecting bundle size.

## Operator Inbox Integration

**Note**: Operator inbox items targeting this contract round will be injected here. Current status:
- Processed items from prior rounds: 1 (Round 51 — injected into build phase)
- No pending operator inbox items targeting Round 69

If operator inbox items arrive targeting this round, they will be incorporated under the relevant acceptance criteria or as additional deliverables with explicit test methods.

## Spec Traceability

### P0 items covered this round
- **Activation choreography enhancement** — Improve the timing and rhythm of module activation sequence
- **Connection pulse animation polish** — Refine energy path flow animations for better visual feedback
- **Module state transition smoothness** — Add smoother CSS transitions between machine states

### P1 items covered this round
- **Micro-interaction feedback** — Enhanced visual feedback for drag, drop, and connection actions
- **Glow intensity calibration** — Better luminance control during activation states

### Remaining P0/P1 after this round
- All P0/P1 items from spec are covered. This round is purely refinements.

### P2 intentionally deferred
- Mobile-specific gesture animations (handled in MobileTouchEnhancer)
- Tutorial animation sequences (handled in TutorialOverlay)

## Deliverables

1. **Enhanced Activation Choreography** (`src/utils/activationChoreographer.ts`)
   - Improved timing curves for module activation sequence
   - Better easing functions for smoother motion
   - Configurable activation rhythm patterns

2. **Polished Energy Path Animations** (`src/components/Connections/EnergyPath.tsx`)
   - Optimized stroke-dashoffset animation performance
   - Enhanced pulse wave propagation effect
   - Better glow filter transitions

3. **Smooth State Transitions** (`src/components/Preview/ActivationOverlay.tsx`)
   - CSS transition refinements for state changes
   - Reduced jank in idle/charging/active state transitions
   - Better timing coordination between overlay and modules

4. **Micro-interaction Feedback** (`src/components/Modules/ModuleRenderer.tsx`)
   - Enhanced hover state transitions
   - Improved port interaction feedback
   - Better selection animation
   - Drag state feedback

5. **Test Suite** (`src/__tests__/activationChoreography.test.ts`, `src/__tests__/animationPerformance.test.ts`)
   - Performance tests for animation frame rate
   - Visual timing verification tests
   - Negative case tests for animation failures

## Acceptance Criteria

All criteria must pass. No partial credit.

| # | Criterion | Binary Definition | Negative Case |
|---|-----------|-------------------|---------------|
| AC1 | Activation sequence completes with smooth 60fps animation | Frame time never exceeds 20ms for more than 3 consecutive frames during activation sequence | If RAF callback throws, animation halts gracefully with console.error logged |
| AC2 | Energy paths animate with consistent stroke-dashoffset flow | stroke-dashoffset animation runs continuously without visible stutter; CSS animation or RAF loop verified in computed styles | If CSS animation is disabled (prefers-reduced-motion), fall back to RAF-based animation |
| AC3 | Module glow transitions smoothly between idle → charging → active states | CSS transition properties verified: duration and easing match specified values; no sudden jumps | If transition-duration is 0 or missing, default to 200ms transition |
| AC4 | Port hover and drag interactions show visual feedback within 100ms | Glow effect must be visible and stable within 100ms of mouseenter event; drag feedback visible within 100ms of dragstart | If CSS transition fails, at minimum opacity changes instantly (no delay > 100ms) |
| AC5 | Selection state changes animate with 200ms ease-out transitions | CSS transition-duration computed value equals "200ms"; transition-timing-function is ease-out or equivalent cubic-bezier | If selection class not applied, module remains in unselected visual state |
| AC6 | No animation-related console errors or warnings | Zero console.error or console.warn calls with error keywords: "requestAnimationFrame error", "RAF error", "animation frame error", "transition error", "transition failed" | If animation error occurs, catch block logs error and gracefully halts animation |
| AC7 | Bundle size remains under 500KB | Main bundle (index-*.js) < 512,000 bytes after `npm run build` | N/A |
| AC8 | All existing 2429 tests continue to pass | `npm test` exit code 0 with 2429 passed tests | N/A |
| AC9 | TypeScript compilation succeeds | `npx tsc --noEmit` exit code 0 with 0 errors | N/A |

## Test Methods

Each test method maps 1:1 to acceptance criteria. Evaluators must run these commands:

### TM1: Animation Frame Rate Verification (AC1)
```bash
# Automated test must exist and pass
npm test -- --testPathPattern="animationPerformance"

# Expected: src/__tests__/animationPerformance.test.ts exists
# Expected: Test verifies RAF callback execution without throwing
# Expected: Test mocks requestAnimationFrame and verifies it schedules next frame

# Manual verification (optional):
# 1. Start dev server: npm run dev
# 2. Open DevTools Performance tab
# 3. Record activation sequence
# 4. Check for frames exceeding 20ms
# PASS: No more than 3 consecutive frames above 20ms
```

**REQUIRED**: `src/__tests__/animationPerformance.test.ts` must exist and contain:
- Test that RAF callback doesn't throw
- Test that RAF is properly scheduled in a loop
- Test that animation stops gracefully on cleanup

### TM2: Energy Path Flow Verification (AC2)
```bash
# Automated test
npm test -- --testPathPattern="activationChoreography"

# Verify fallback mechanism:
# 1. Inspect EnergyPath.tsx
# 2. Check for prefers-reduced-motion media query handling
# 3. Verify RAF fallback exists for CSS animation failures

# PASS: Both animation modes verified in code
```

### TM3: State Transition Verification (AC3)
```bash
# 1. Inspect ActivationOverlay.tsx and ModuleRenderer.tsx
# 2. Verify CSS transition properties:
#    - idle→charging: transition-duration ≤ 400ms
#    - charging→active: transition-duration ≤ 300ms
#    - Easing: cubic-bezier(0.4, 0, 0.2, 1) or equivalent
# 3. Verify default fallback if transition missing:
#    - Look for inline style fallback or CSS cascade default
# 4. Check computed styles during state transitions
# PASS: Transitions complete without sudden jumps; fallback verified
```

### TM4: Port Interaction Verification (AC4)
```bash
# Automated test must exist
npm test -- --testPathPattern="ModuleRenderer"

# Test file must verify:
# 1. Hover transition CSS is applied to port elements
# 2. Drag state CSS class is applied within 100ms
# 3. Fallback: Instant opacity change if transition fails

# Manual verification:
# 1. Hover over port element - verify glow within 100ms
# 2. Start drag operation - verify drag feedback within 100ms
# 3. Check CSS: transition-duration ≤ 200ms
# PASS: Both hover and drag feedback verified
```

### TM5: Selection Animation Verification (AC5)
```bash
# 1. Select a module in the editor
# 2. Inspect computed styles on selected module element
# 3. Verify: transition-duration === "200ms"
# 4. Verify: transition-timing-function contains "cubic-bezier" with ease-out curve
# 5. Verify fallback: If selection class missing, unselected state is distinct
# PASS: Computed styles match specification; visual states are distinguishable
```

### TM6: Console Error Check (AC6)
```bash
# 1. Run `npm test` and check output for console.error or console.warn
# 2. Automated test in animationPerformance.test.ts:
#    - Mock console.error
#    - Run RAF callback
#    - Verify no error logs during normal operation
# 3. Verify error boundaries exist in animation code
# 4. Check for try/catch around RAF callbacks
# PASS: Zero console.error/warn with animation error phrases
```

### TM7: Bundle Size Verification (AC7)
```bash
# 1. Run `npm run build`
# 2. Check output size of main bundle:
ls -la dist/assets/index-*.js
# 3. Verify size < 500KB (512,000 bytes)
# PASS: Main bundle < 500KB
```

### TM8: Regression Testing (AC8)
```bash
# 1. Run `npm test`
# 2. Verify output: "Tests: X passed (X)" where X = 2429
# 3. Verify exit code 0
# PASS: 2429/2429 tests pass
```

### TM9: TypeScript Compilation (AC9)
```bash
# 1. Run `npx tsc --noEmit`
# 2. Verify exit code 0
# 3. Verify output contains "Found 0 errors"
# PASS: 0 TypeScript errors
```

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Animation timing changes affect perceived quality | Medium | Use configurable timing constants; verify with AC1 |
| Performance regression on lower-end devices | Medium | Use CSS transforms (GPU-accelerated); avoid JS-based animations |
| Bundle size increase | High | Avoid new dependencies; use pure CSS/JS animations |
| Test flakiness due to timing variability | Low | Use stable thresholds; run tests multiple times if needed |
| prefers-reduced-motion user impact | Medium | Provide RAF fallback; test both animation modes |

## Failure Conditions

**The round fails if ANY of the following occur:**

1. **Bundle size ≥ 500KB** after build — hard failure
2. **Any existing test fails** — 2429 tests must all pass
3. **TypeScript compilation errors** — 0 errors required
4. **Frame drops exceeding 5 consecutive frames** during activation
5. **New console error messages** introduced containing error phrases
6. **Port hover feedback latency > 150ms** (100ms + 50ms tolerance)
7. **CSS transition not present** when expected for state changes
8. **Required test files missing** — `animationPerformance.test.ts` and `activationChoreography.test.ts` must exist
9. **Negative case fallback code missing** — animation fallbacks must be implemented for AC1-AC6

## Done Definition

The round is **complete** only when ALL of the following are verified:

| # | Condition | Verification Command |
|---|-----------|---------------------|
| 1 | All acceptance criteria pass | See TM1–TM9 above |
| 2 | `npm run build` succeeds | `echo $?` returns 0 |
| 3 | Main bundle < 500KB | `ls -la dist/assets/index-*.js` |
| 4 | `npm test` passes 2429 tests | `npm test` exit code 0 |
| 5 | `npx tsc --noEmit` has 0 errors | `npx tsc --noEmit` exit code 0 |
| 6 | No new console error messages | Browser console check during activation |
| 7 | Performance metrics confirm no regression | Frame rate stays under 20ms threshold |
| 8 | Animation test files exist | `ls src/__tests__/animationPerformance.test.ts src/__tests__/activationChoreography.test.ts` |
| 9 | Negative case fallbacks implemented | Code review confirms try/catch around RAF, prefers-reduced-motion handling |

## Out of Scope

The following are **NOT** in scope for this round:

| Category | Items Excluded |
|----------|----------------|
| **New features** | New module types, export formats, AI assistant, community features |
| **Backend/persistence** | LocalStorage handling, template storage |
| **UI/UX layout** | Current layout meets spec requirements |
| **Accessibility** | Current implementation is sufficient |
| **Mobile features** | Touch enhancers are adequate |
| **Content systems** | Challenge system, recipe system |
| **Testing infrastructure** | No new test framework setup |

## Implementation Notes

1. **No new dependencies** — All animation improvements must use existing CSS/JS capabilities
2. **CSS-first approach** — Prefer CSS transitions and animations over JavaScript where possible
3. **GPU acceleration** — Use `transform` and `opacity` for animations to leverage GPU
4. **Timing constants** — All animation timings must be defined as constants for easy adjustment
5. **Port hover transitions** — Ensure port circles use `transition-all duration-200` classes for smooth feedback
6. **Error boundaries for animations** — Wrap RAF callbacks in try/catch, log errors gracefully
7. **prefers-reduced-motion** — Provide RAF fallback when CSS animations disabled
8. **Required test coverage** — `animationPerformance.test.ts` must exist with RAF error handling tests
