# Sprint Contract — Round 101

## APPROVED

---

## Scope

**Round 101 Focus:** Activation System Visual Enhancements — Enhance the machine activation experience with improved visual effects, screen feedback, and polished state transitions. This sprint refines the most visually dramatic part of the application without changing core functionality.

## Spec Traceability

### P0 items covered this round
- **Enhanced Activation Glow Effects** — Improve the glow intensity during active state
  - Dynamic glow radius based on power output
  - Pulsing intensity tied to energy flow
  - Faction-colored glow variations

- **Screen Feedback Enhancements** — Add canvas/viewport feedback during activation
  - Subtle screen shake on activation start
  - Camera micro-adjustments during energy pulses
  - Vignette effect during high-power states

### P1 items covered this round
- **Overload Visual Polish** — Enhance the overload/failure state visual feedback
  - More dramatic particle effects
  - Screen distortion effects
  - Enhanced warning indicators

- **Activation Phase Transitions** — Smooth visual transitions between activation phases
  - Fade effects between idle → charging → active
  - Energy buildup visual feedback
  - Graceful shutdown animations

### Remaining P0/P1 after this round
- All P0/P1 items remain covered; this round adds visual refinement only
- No functional changes to core activation logic

### P2 intentionally deferred
- Full particle system overhaul
- 3D depth effects
- Custom activation sound system (requires audio infrastructure)

## Deliverables

1. **`src/components/Preview/ActivationOverlay.tsx`** — Enhanced with:
   - Dynamic glow effects with faction colors
   - Screen shake on activation start
   - Vignette effect during high-power states
   - Smooth phase transition animations

2. **`src/components/Particles/ActivationBurstEmitter.tsx`** — Enhanced with:
   - Overload-specific particle patterns
   - Increased particle density during power surge
   - Faction-colored particle variations

3. **`src/components/Connections/EnhancedEnergyPath.tsx`** — Enhanced with:
   - Better flow visualization during activation
   - Enhanced pulse propagation effects
   - Improved connection glow during high power

4. **`src/utils/activation/effects.ts`** — New utility for:
   - Screen shake calculations
   - Vignette intensity mapping
   - Glow radius calculations

5. **Unit tests for new effect utilities** — Minimum 30 new tests

## Acceptance Criteria

1. **AC-VISUAL-001: Glow Effect Enhancement** — Activation glow dynamically scales with machine power output (0.8x at low power, 1.5x at maximum power)

2. **AC-VISUAL-002: Screen Shake on Activation** — Canvas shakes briefly (200-400ms) when machine transitions from idle to charging state

3. **AC-VISUAL-003: Vignette Effect** — Subtle vignette appears during active state, intensity correlates with power output

4. **AC-VISUAL-004: Phase Transition Smoothness** — No visual jarring when transitioning between idle → charging → active states

5. **AC-VISUAL-005: Overload Visual Feedback** — Overload state includes red-tinted vignette, intensified particles, and visible screen distortion

6. **AC-VISUAL-006: Faction Glow Colors** — Glow color matches dominant faction when applicable

7. **AC-VISUAL-007: Regression Prevention** — All 3,858 existing tests continue to pass

8. **AC-VISUAL-008: Build Compliance** — Bundle size remains ≤560KB, TypeScript 0 errors

9. **AC-VISUAL-009: Performance** — Activation animation maintains 60fps with up to 30 modules

10. **AC-VISUAL-010: No Breaking Changes** — Existing activation state machine behavior unchanged

## Test Methods

### Glow Effect Enhancement (AC-VISUAL-001)
1. Render activation overlay with power output = 20; verify glow radius ≤ 1.0x baseline
2. Render activation overlay with power output = 80; verify glow radius ≥ 1.3x baseline
3. Render activation overlay with power output = 100; verify glow radius ≥ 1.5x baseline
4. Verify glow uses faction color when dominantFaction is set

### Screen Shake (AC-VISUAL-002)
1. Simulate activation start; verify shake duration is 200-400ms
2. Verify shake intensity is subtle (not disorienting)
3. Verify shake stops automatically after timeout
4. Verify multiple rapid activations don't stack shake effects

### Vignette Effect (AC-VISUAL-003)
1. Verify vignette is invisible during idle state
2. Render with power output = 50; verify vignette opacity ≤ 0.3
3. Render with power output = 100; verify vignette opacity ≥ 0.4
4. Verify vignette uses dark color that doesn't obscure machine

### Phase Transition Smoothness (AC-VISUAL-004)
1. Monitor activation state machine transitions; verify CSS transitions handle state changes
2. Verify no flash or jarring visual during state transitions
3. Verify charging phase includes visible energy buildup indicator

### Overload Visual Feedback (AC-VISUAL-005)
1. Trigger overload state; verify red-tinted vignette appears
2. Trigger overload state; verify particle count increases by ≥50%
3. Trigger overload state; verify screen has visible distortion effect
4. Verify overload visual effects persist for correct duration

### Faction Glow Colors (AC-VISUAL-006)
1. Set dominant faction to 'void'; verify glow uses void faction color
2. Set dominant faction to 'stellar'; verify glow uses stellar faction color
3. Verify default glow uses cyan when no faction dominant

### Regression Prevention (AC-VISUAL-007)
1. Run full test suite; verify 3,858 tests pass
2. Verify no test files were deleted or corrupted

### Build Compliance (AC-VISUAL-008)
1. Run `npm run build`; verify bundle size ≤ 560KB
2. Run `npx tsc --noEmit`; verify 0 errors

### Performance (AC-VISUAL-009)
1. Render 30 modules with activation active; verify frame rate ≥ 30fps
2. Verify activation effect calculation uses memoization

### No Breaking Changes (AC-VISUAL-010)
1. Verify activation states (idle, charging, active, overload, failure, shutdown) unchanged
2. Verify state machine transitions behave as before
3. Verify all existing activation-related store actions unchanged

## Test Code Quality Requirements

1. **Store Mocking**: Use `vi.hoisted()` pattern for any new store tests
2. **Animation Testing**: Mock timing/GSAP to avoid flakiness
3. **Negative Assertions**: Include tests verifying visual effects do NOT occur in idle state
4. **Edge Cases**: Test with empty modules array, maximum power output, rapid state changes

## Risks

1. **Performance Regression** — Adding visual effects could impact frame rate
   - Mitigation: Use `requestAnimationFrame` properly, memoize calculations, limit particle count

2. **Breaking Existing Animation Code** — Changes to ActivationOverlay could break existing tests
   - Mitigation: Add tests for new features only, don't modify existing test assertions

3. **Build Size Increase** — New effect utilities could increase bundle size
   - Mitigation: Keep effect calculations lightweight, use existing animation primitives

## Failure Conditions

1. **Any existing test fails** — All 3,858 tests must continue to pass
2. **TypeScript errors introduced** — `npx tsc --noEmit` must show 0 errors
3. **Bundle size exceeds threshold** — 560KB limit must be maintained
4. **Visual jarring during phase transitions** — Transitions must be smooth (CSS transitions verified)
5. **Overload effect missing** — Red vignette and particle increase must be verified
6. **Frame rate drops below 30fps** — Performance test must pass

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ Glow effect dynamically scales with power output (verified by test)
2. ✅ Screen shake occurs on activation start, 200-400ms duration (verified by test)
3. ✅ Vignette effect visible during active state (verified by test)
4. ✅ Phase transitions smooth with no jarring (verified by CSS/animation test)
5. ✅ Overload state includes red vignette + increased particles + distortion (verified by test)
6. ✅ Faction glow colors match dominant faction (verified by test)
7. ✅ All 3,858 existing tests pass
8. ✅ Bundle size ≤ 560KB
9. ✅ TypeScript 0 errors
10. ✅ Performance test passes (30 modules, 30fps minimum)
11. ✅ No breaking changes to activation state machine

## Out of Scope

- Changes to core activation logic or state machine behavior
- Audio/sound effects (requires audio infrastructure)
- 3D effects or WebGL rendering
- Changes to export functionality
- Changes to editor interaction (drag, drop, select)
- Changes to codex/collection system
- Changes to community/social features
- E2E/Playwright tests
- Visual regression tests
- Documentation updates

---

**Note:** This is a visual polish sprint focused on enhancing the activation system's visual appeal. No functional changes to core behavior. All changes are additive visual enhancements that improve user experience without altering core mechanics.

**Operator Inbox Instructions (Round 101):** Focus on visual enhancement only. Do not modify core activation logic. Ensure all visual effects are GPU-friendly and maintain 60fps. Use existing animation primitives (GSAP, CSS transitions) rather than adding new animation libraries. All new tests must follow `vi.hoisted()` pattern for store mocking.
