# APPROVED — Sprint Contract — Round 11

## Scope

This sprint enhances the visual and animation systems of the Arcane Machine Codex Workshop, specifically:

1. **Particle System Framework** — A performant SVG/CSS-based particle system for energy sparks, magic dust, and activation effects
2. **Enhanced Energy Flow Visualization** — Improved path animations with particles traveling along energy connections
3. **Advanced Activation Choreography** — Refined state machine with better visual feedback across all phases (idle, charging, active, overload, failure, shutdown)
4. **Viewport Effects** — Subtle camera shake, zoom pulses, and ambient effects during machine activation
5. **Performance Optimization** — Ensure particle effects don't degrade performance on complex machines

**Implementation Approach:**
- Particle rendering via CSS transforms (GPU-accelerated, no SVG element creation per particle)
- Particle pool with hard limit of 1000 simultaneous particles
- requestAnimationFrame-based render loop with delta time
- GSAP integration via timeline callbacks, not conflicting animations

## Spec Traceability

### P0 items covered this round
- Particle system for activation sequences
- Enhanced energy path animations with traveling particles
- State machine visual refinement (all 6 states)
- Performance-optimized rendering for particles

### P1 items covered this round
- Viewport shake/pulse effects during activation
- Improved glow and bloom effects on modules
- Ambient particle effects for idle machines

### Remaining P0/P1 after this round
- P0: All core P0 items complete (canvas editor, connections, activation, codex, export)
- P1: Sound integration deferred (requires audio assets)
- P1: AI service connection deferred (types exist, service integration pending)

### P2 intentionally deferred
- Sound integration (requires audio assets)
- Video export (requires media encoding)
- Multiplayer collaboration (backend dependency)
- Mobile-specific gesture controls refinement
- 3D perspective transforms
- WebGL rendering (pure SVG/CSS approach)

## Deliverables

1. **`src/utils/ParticleSystem.ts`** — Particle engine with:
   - Particle pool with configurable max size (default 1000)
   - Emitter types: spark, dust, glow, ember
   - Lifecycle management (spawn → move → fade → die)
   - requestAnimationFrame-based rendering with delta time
   - `createEmitter(config)` returns emitter controller with `start()`, `stop()`, `destroy()`

2. **`src/components/Particles/`** — Particle emitter components:
   - `ParticleEmitter.tsx` — Core emitter component with configurable props
   - `EnergySparkEmitter.tsx` — Particles that travel along energy paths
   - `ActivationBurstEmitter.tsx` — Burst effects for startup/explosion
   - `AmbientDustEmitter.tsx` — Subtle ambient particles for idle state

3. **`src/components/Connections/EnhancedEnergyPath.tsx`** — Enhanced energy path with:
   - Traveling particle effects along path
   - Configurable: particleCount (1-20), speed (0.5-5), glowIntensity (0-1)
   - Particles respect path direction (input→output)

4. **`src/utils/activationChoreographer.ts`** (enhanced) — Updated with:
   - Particle trigger callbacks for each phase transition
   - Viewport shake callback integration
   - Phase-specific particle configurations
   - Performance throttling for complex activations

5. **`src/components/Preview/ActivationOverlay.tsx`** (enhanced) — Added:
   - Particle canvas layer (separate from main canvas)
   - Viewport effect container with CSS transforms
   - Smooth phase transition animations

6. **`src/__tests__/particleSystem.test.ts`** — Unit tests:
   - Particle instantiation and lifecycle (10 tests)
   - Emitter configuration changes (5 tests)
   - Particle bounds and cleanup (5 tests)
   - Performance: 500 particles, verify < 16ms frame time (2 tests)

7. **`src/__tests__/energyPath.test.ts`** — Tests:
   - Particle generation on paths (5 tests)
   - Direction verification (2 tests)
   - Speed and energy level scaling (3 tests)
   - Path state changes (3 tests)

8. **`src/__tests__/activationEffects.test.ts`** — Integration tests:
   - Full activation sequence with particles (5 tests)
   - Phase transition visual verification (3 tests)
   - Memory cleanup after shutdown (2 tests)

## Acceptance Criteria

1. **AC1: Particle System Functionality**
   - Particles emit, move, fade, and die correctly
   - Configurable: count (10-500), speed (0.5-5), size (2-20px), color, lifetime (0.5-5s), spread angle
   - Maximum 1000 simultaneous particles without frame drops

2. **AC2: Energy Path Particles**
   - Particles travel along energy connection paths
   - Particle count scales with connection energy level (1-10)
   - Particles animate in path direction (input→output)

3. **AC3: Activation Phase Visuals**
   - **Idle**: Subtle ambient glow, occasional spark
   - **Charging**: Building pulse effect, intensifying glow
   - **Active**: Full animation with particle bursts
   - **Overload**: Red warning particles, rapid flicker
   - **Failure**: Broken particle streams, sparks, smoke effect
   - **Shutdown**: Fade-out particles, settling dust

4. **AC4: Viewport Effects**
   - Canvas shakes subtly during activation (±3px, 50ms intervals)
   - Shake intensity increases during overload
   - Smooth interpolation (no jarring movement)
   - Effects toggleable via settings panel

5. **AC5: Performance**
   - 60fps maintained with up to 10 active modules
   - 30fps minimum maintained with 20+ modules and particles
   - Particle cleanup on machine deactivation
   - All particles removed within 2s of shutdown

6. **AC6: Module Glow Enhancement**
   - Core modules pulse with inner glow during active state
   - Rune nodes illuminate during activation
   - Gear teeth show highlight during rotation

7. **AC7: Backward Compatibility**
   - All 778 existing tests continue to pass
   - Machines saved in previous rounds load correctly
   - Existing animations work without particles

## Test Methods

### Particle System Tests
```bash
npm test -- particleSystem
```
- Particle instantiation with default config
- Particle lifecycle (spawn → move → fade → die)
- Emitter configuration changes
- Particle bounds and cleanup
- Performance: spawn 500 particles, verify < 16ms frame time

### Energy Path Tests
```bash
npm test -- energyPath
```
- Particle generation on paths
- Direction verification (input→output)
- Speed configuration
- Energy level scaling
- Path state changes (idle → active → overload)

### Integration Tests
```bash
npm test -- activationEffects
```
- Full activation sequence with particles
- Phase transition visual verification
- Overload sequence particles
- Shutdown particle fade-out
- Multiple concurrent modules

### Performance Tests
```bash
npm test -- performance
```
- 20-module stress test
- Particle count monitoring
- Frame rate validation
- Memory cleanup verification

### Browser Verification
1. Open canvas with 5+ connected modules
2. Click "Activate Machine"
3. Verify particles emit from modules and flow along connections
4. Check viewport shake effect
5. Verify overload state shows warning particles
6. Verify smooth shutdown with particle fade
7. Toggle viewport effects in settings panel

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| SVG Performance | High | Use CSS transforms (GPU-accelerated), limit particle count, viewport culling |
| GSAP Conflicts | Medium | Use requestAnimationFrame for particles, coordinate via timeline callbacks |
| Memory Leaks | High | Implement particle pool with hard limit (1000), force cleanup on shutdown |
| Test Coverage | Medium | 35+ new tests focusing on lifecycle, edge cases, performance |
| Cross-browser | Low | Test in Chrome, Firefox, Safari; CSS transform support is universal |

## Failure Conditions

**Round must FAIL if ANY of these occur:**

1. Any existing test failure (778 tests must continue passing)
2. `npm run build` fails with TypeScript errors
3. Frame rate drops below 30fps on 10-module machine with particles
4. Memory leak: particle count grows unbounded after 10 activations
5. Activation sequence breaks (machine doesn't animate properly)
6. Energy paths no longer render correctly
7. Module glow effects break existing animations
8. Total test count below 813 (778 existing + 35 new minimum)

## Done Definition

Exact conditions that must be true before claiming round complete:

- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] `npm test` passes with 813+ tests (778 existing + 35 new minimum)
- [ ] All particle system components render without errors
- [ ] Energy paths display traveling particles
- [ ] All 6 activation states show distinct visual feedback
- [ ] Viewport shake effect triggers during activation
- [ ] Viewport effects toggle works in settings panel
- [ ] Performance test passes: 30fps minimum on 15-module machine
- [ ] Memory test passes: particle count returns to 0 after shutdown
- [ ] Browser verification: activation sequence plays correctly
- [ ] No regression: existing machines load and animate correctly

## Out of Scope

- Sound/audio integration (requires audio assets, not code-only)
- Video recording of animations
- Real-time multiplayer synchronization
- Cloud save/load functionality
- Social sharing with server backend
- Mobile gesture refinements (handled in round 8)
- AI service integration (types exist, service connection deferred)
- 3D perspective transforms
- WebGL rendering (pure SVG/CSS approach)
- Manual particle count adjustment UI (auto-optimized only)
