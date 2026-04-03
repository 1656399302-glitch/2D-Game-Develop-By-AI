# Sprint Contract — Round 109

## APPROVED

## Scope

This round focuses on **Activation System Visual Polish and Effects Enhancement**. The core systems are complete per the codebase audit, but the activation animation choreography and visual effects can be enhanced to match the spec requirements for:
- Rhythmic, sequenced activation animations (not simultaneous)
- Canvas shake/focus effects during activation
- Enhanced failure state visual effects (red flashing, intermittent current, glitch noise)
- Overload state visual improvements
- Codex save ritual animation

## Spec Traceability

### P0 Items (Must Complete)
- **Activation Choreography Enhancement**: Improve activation sequence timing so modules activate in waves/rhythms based on connection topology, not simultaneously
- **Canvas Focus/Shake Effect**: Add subtle canvas zoom and shake effect during machine activation
- **Failure State Visual Effects**: Implement red flashing, intermittent current paths, and glitch noise artifacts during failure/overload states

### P1 Items (Should Complete)
- **Overload Visual Improvements**: Enhance overload state with pulsing glows, particle bursts, and screen shake
- **Codex Save Ritual Animation**: Add ceremonial animation when saving machine to codex

### P2 Items (Intentional Deferral)
- Mobile gesture refinements
- Additional module visual variants

### Remaining P0/P1 After This Round
- **P0**: None — all P0 requirements will be met
- **P1**: None — all P1 requirements will be met

## Deliverables

1. **Enhanced Activation Choreography**:
   - `src/components/Preview/ActivationOverlay.tsx` — modified for sequential module activation based on connection graph topology
   - `src/hooks/useActivationChoreography.ts` — new hook for managing activation timing and sequencing
   - `src/store/useActivationStore.ts` — modified to track activation phase/sequence

2. **Canvas Visual Effects**:
   - `src/components/Editor/Canvas.tsx` — modified to add zoom/focus and shake effects during activation
   - `src/components/Effects/CanvasEffects.tsx` — new component for camera shake, focus zoom, and glitch effects

3. **Enhanced Failure/Overload Effects**:
   - `src/components/Particles/FailureParticleEmitter.tsx` — new particle system for glitch artifacts
   - `src/components/Connections/EnergyPath.tsx` — modified to show intermittent current during failure
   - `src/components/Preview/ActivationOverlay.tsx` — modified for red flash overlay and error state visuals

4. **Codex Save Animation**:
   - `src/components/Codex/CodexView.tsx` — modified with ritual save animation
   - `src/components/Effects/RitualAnimation.tsx` — new component for ceremonial collection effect

5. **Test Files**:
   - `src/__tests__/activationChoreography.test.ts` — tests for sequential activation
   - `src/__tests__/visualEffectsEnhancement.test.ts` — tests for canvas effects, failure visuals, overload effects

## Acceptance Criteria

1. **AC-109-001**: Activation modules sequence in waves/levels based on connection depth from core, not simultaneously — test verifies different modules reach "active" state at different times
2. **AC-109-002**: Canvas shows subtle zoom/focus effect (scale 1.0 → 1.02 → 1.0) and shake (±2px) during activation
3. **AC-109-003**: Failure state shows: red flash overlay (opacity 0→0.3→0), intermittent energy paths (stroke-dasharray animation), and glitch noise particles
4. **AC-109-004**: Overload state shows: pulsing glow intensity oscillation, particle bursts from modules, and escalating screen shake
5. **AC-109-005**: Codex save triggers ritual animation: spiral particles, golden glow expansion, and achievement toast
6. **AC-109-006**: TypeScript compiles clean (`npx tsc --noEmit` returns 0 errors)
7. **AC-109-007**: All 4,586+ existing tests continue to pass (no regression)
8. **AC-109-008**: Dev server starts cleanly and build succeeds

## Test Methods

1. **AC-109-001 Activation Choreography**:
   - Run: `npm test -- activationChoreography.test.ts`
   - Create machine with 5+ modules in chain (Core → Pipe → Rune → Output)
   - Activate machine and measure time to "active" state for each module
   - Verify: Modules reach "active" at different times (at least 3 distinct activation times)
   - **Negative assertion**: All modules activating simultaneously fails this test

2. **AC-109-002 Canvas Focus/Shake Effect**:
   - Run: `npm test -- visualEffectsEnhancement.test.ts`
   - Mock canvas transform state
   - Trigger activation
   - Verify: canvas transform includes scale (1.02) and translate (±2px) during activation
   - **Negative assertion**: Canvas remaining static (no transform) fails this test

3. **AC-109-003 Failure State Effects**:
   - Run: `npm test -- visualEffectsEnhancement.test.ts`
   - Trigger failure state on activated machine
   - Verify: Red flash overlay exists with correct opacity animation
   - Verify: Energy paths show intermittent animation (stroke-dasharray changes)
   - Verify: Glitch particles render
   - **Negative assertion**: No visual indication of failure state fails this test

4. **AC-109-004 Overload State Effects**:
   - Run: `npm test -- visualEffectsEnhancement.test.ts`
   - Trigger overload on high-power machine
   - Verify: Glow intensity oscillates (not static)
   - Verify: Particle bursts emit
   - Verify: Screen shake amplitude increases over time
   - **Negative assertion**: Static visuals without pulsing/shaking fails this test

5. **AC-109-005 Codex Save Animation**:
   - Run: `npm test -- visualEffectsEnhancement.test.ts`
   - Mock saveToCodex function
   - Call saveToCodex and verify ritual animation triggers
   - Verify: spiral particles, golden glow, achievement toast appear
   - **Negative assertion**: No animation feedback during save fails this test

6. **AC-109-006 TypeScript Verification**:
   - Run: `npx tsc --noEmit`
   - Verify 0 errors
   - **Negative assertion**: Any TypeScript error means round fails

7. **AC-109-007 Test Suite Verification**:
   - Run: `npm test`
   - Verify all tests pass (4,586+ including new tests)
   - **Negative assertion**: Any test failure means round fails

8. **AC-109-008 Build Verification**:
   - Run: `npm run build`
   - Verify build succeeds with 0 errors
   - Verify dev server starts on port 5173
   - **Negative assertion**: Build failure means round fails

## Risks

1. **Animation Performance Risk**: Adding more visual effects may impact performance on lower-end devices
   - **Mitigation**: Use CSS transforms for shake/focus (GPU accelerated); limit particle count; add performance toggle in settings

2. **Test Flakiness Risk**: Animation timing tests may be flaky due to requestAnimationFrame variability
   - **Mitigation**: Mock animation timing in tests; use deterministic test fixtures

3. **Existing Test Regression Risk**: Modifying activation system may break existing tests
   - **Mitigation**: Run full test suite after changes; preserve existing behavior as default

4. **Visual Consistency Risk**: New effects may clash with existing visual style
   - **Mitigation**: Follow existing color palette (golds, cyans, purples); use same animation easing curves

## Failure Conditions

1. **TypeScript Errors**: If `npx tsc --noEmit` reports any errors, the round fails
2. **Test Suite Regression**: If any existing test fails, the round fails
3. **Build Failure**: If `npm run build` doesn't succeed, the round fails
4. **Missing Acceptance Criteria**: If any of AC-109-001 through AC-109-008 are not met, the round fails
5. **Performance Degradation**: If activation feels sluggish on standard hardware, the round fails

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ All 8 acceptance criteria (AC-109-001 through AC-109-008) are verified and passing
2. ✅ TypeScript compiles with 0 errors (`npx tsc --noEmit` succeeds)
3. ✅ All 4,586+ existing tests pass plus new tests pass (total test count increases)
4. ✅ Activation choreography shows sequential module activation (not simultaneous)
5. ✅ Canvas shows zoom/focus and shake effects during activation
6. ✅ Failure state shows red flash, intermittent paths, and glitch particles
7. ✅ Overload state shows pulsing glows and particle bursts
8. ✅ Codex save shows ritual animation
9. ✅ Build succeeds (`npm run build`)
10. ✅ Dev server starts cleanly on port 5173

## Out of Scope

The following features are NOT being modified in this round (they are complete per previous rounds):

1. **Module system** — already complete with 21+ module types
2. **Connection system** — connection validation and path rendering complete
3. **Activation state machine** — states (idle, charging, active, overload, failure, shutdown) complete
4. **Attribute generation** — naming rules and rarity complete
5. **Codex persistence** — saving and loading complete
6. **Export system** — SVG/PNG/Poster export complete
7. **Faction system** — factions and tech tree complete
8. **Challenge system** — challenges complete
9. **Recipe system** — recipes complete
10. **AI naming** — local provider fallback complete
11. **Statistics dashboard** — stats tracking complete
12. **Tutorial system** — tutorial flow complete

## Technical Notes

### Activation Choreography Algorithm
1. Build module dependency graph from connections
2. Calculate depth from core module (core = depth 0)
3. Activate modules in waves: all depth-0 modules → depth-1 → depth-2, etc.
4. Stagger activation timing: depth N activates after (N * 300ms) from start
5. Each module has: 200ms charging animation → activation flash → online state

### Canvas Effect Implementation
- Use CSS transform for zoom: `transform: scale(var(--canvas-zoom))`
- Use CSS animation for shake: `translate(var(--shake-x), var(--shake-y))`
- Animate CSS variables using requestAnimationFrame
- Apply effects to canvas container, not individual elements (performance)

### Failure Effect Implementation
- Red flash: Absolute positioned div with opacity animation
- Intermittent paths: stroke-dasharray with stepped animation keyframes
- Glitch particles: Small random positioned elements with blur filter

### Ritual Save Animation
1. Golden spiral particles emanate from saved machine
2. Machine fades while glowing
3. "Saved to Codex" text appears with typewriter effect
4. Achievement toast slides in from right
