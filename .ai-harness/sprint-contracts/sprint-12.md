APPROVED

# Sprint Contract — Round 12

## Scope

**Focus: Enhanced Activation Choreography + Visual Effects Polish**

Round 11 delivered the multi-port infrastructure. Round 12 enhances the activation system with sequential module triggering, camera effects, and improved visual feedback. This creates the "alive machine" feeling where energy visibly flows through connections before modules activate.

---

## Current Behavior (Baseline)

Before enhancements, the system exhibits:
- **Simultaneous activation**: All modules activate at the same timestamp when machine activates
- **No timing between connections and modules**: Connections and modules transition together
- **Activation state machine**: `idle` → `activating` → `active` → `idle` (single transition, no phases)
- **No camera effects**: Canvas remains static during activation
- **No pulse visualization**: Connections show static active state only

---

## Spec Traceability

### P0 Items (Must Complete)
- Sequential activation order (BFS from input modules)
- Camera shake effects (normal + overload)
- Activation phase overlay text transitions
- Module activation glow effect

### P1 Items (Should Complete)
- Pulse wave visualization on connections
- Rarity-colored overlay effects
- Enhanced overload effects (vignette, flicker)

### Remaining P0/P1 After Round 12
- P0: None (full activation choreography delivered)
- P1: None (all visual effects delivered)
- P2: Performance optimization, sound effects, particle systems

---

## Deliverables

### 1. Sequential Activation System
**Files**: `src/store/useMachineStore.ts`, `src/utils/activationChoreographer.ts`

**Algorithm**:
```
1. Find all modules where `type === 'input-switch'`
2. Run BFS from each input module simultaneously
3. Group modules by depth level (distance from nearest input)
4. Sort modules at same depth by insertion order (creation timestamp)
5. Activate depth-0 modules at T=0
6. Activate depth-N modules at T=N*200ms
7. For each module, light up incoming connections 100ms before module activates
```

**Edge Cases**:
- **Parallel paths**: `A→B` and `A→C` both at depth 1, activate within 50ms of each other
- **Merging paths**: `A→C` and `B→C`, C activates at max(depth(A), depth(B)) + 1
- **Cycles**: Not supported; BFS visits each module once, cycle connections ignored
- **No inputs**: Machine with no input modules activates all at T=0

**Test File**: `src/__tests__/activationChoreography.test.ts` (create if not exists)

### 2. Camera Shake Effects
**File**: `src/components/Editor/Canvas.tsx`

**Parameters**:
| Event | Duration | Offset Magnitude | Iterations | Pattern |
|-------|----------|------------------|------------|---------|
| Activation start | 150ms | ±4px | 10 | Random per frame |
| Overload | 300ms | ±8px | 20 | Random per frame |

**Implementation**:
- Use `requestAnimationFrame` for smooth animation
- Apply via `transform: translate(Xpx, Ypx)` on canvas container
- GPU-accelerated via `will-change: transform`
- X and Y offsets are independent random values in range [-magnitude, +magnitude]

**Test File**: `src/__tests__/activationEffects.test.ts` (create if not exists)

### 3. Pulse Wave Visualization
**File**: `src/components/Connections/EnergyPath.tsx`

**Parameters**:
| Path Length | Wave Count | Speed |
|-------------|------------|-------|
| 0-200px | 1 | 400px/second |
| 200-400px | 2 (staggered) | 400px/second |
| >400px | 3 (staggered) | 400px/second |

**Implementation**:
- Add SVG `<circle>` element with class `pulse-wave` during activation
- Animate using `offset-path` CSS property with `offset-distance` animation
- Waves are staggered by 100ms each
- Animation completes in `(path_length / 400)` seconds

**Test File**: `src/__tests__/pulseWave.test.ts` (create if not exists)

### 4. Activation Phase Overlay
**File**: `src/components/Preview/ActivationOverlay.tsx`

**Parameters**:
| Progress Range | Phase Text | Visual State |
|----------------|------------|--------------|
| 0-30% | "CHARGING" | Progress bar filling, blue glow |
| 30-80% | "ACTIVATING" | Bar pulses, modules start lighting |
| 80-100% | "ONLINE" | Full glow, static state |

**Rarity Colors**:
| Rarity | Hex Color |
|--------|-----------|
| common | #9ca3af |
| rare | #3b82f6 |
| epic | #a855f7 |
| legendary | #eab308 |

**Test File**: `src/__tests__/phaseOverlay.test.ts` (create if not exists)

### 5. Enhanced Overload Effects
**File**: `src/components/Preview/ActivationOverlay.tsx`, `Canvas.tsx`

**Parameters**:
| Effect | Property | Target Value | Duration |
|--------|----------|---------------|----------|
| Red vignette | Radial gradient opacity | 0→40% | 200ms |
| Intensified shake | Offset magnitude | ±8px | 300ms |
| Screen flicker | Opacity oscillates | 100%↔60% | 50ms intervals |
| Sparks | 8 SVG circles | Center→outward with gravity | 500ms |

**Test File**: `src/__tests__/overloadEffects.test.ts` (create if not exists)

### 6. Module Activation Glow
**File**: `src/components/Modules/ModuleRenderer.tsx`

**Parameters**:
| Property | Start | End | Duration | Easing |
|----------|-------|-----|----------|--------|
| Radius | 0px | 60px | 300ms | ease-out |
| Opacity | 0.8 | 0 | 300ms | ease-out |
| Color | Module accent | — | — | — |

**Implementation**:
- Radial gradient expanding from module center
- Gradient uses module's accent color
- Glow element removed from DOM after animation completes

**Test File**: `src/__tests__/moduleGlow.test.ts` (create if not exists)

---

## Acceptance Criteria

1. **BFS-Order**: Modules activate in breadth-first order from input modules; no depth level activates before any shallower depth completes
2. **Timing**: Timestamp deltas between consecutive depth levels are 200ms (±20ms tolerance)
3. **Parallel Sync**: Modules at same depth activate within 50ms of each other
4. **Connection Lead**: Each connection's active state begins ≥100ms before its target module activates
5. **Normal Shake**: On activation start, canvas shake runs for 150ms (±20ms) with offsets ≤4px magnitude
6. **Overload Shake**: On overload, canvas shake runs for 300ms (±20ms) with offsets ≤8px magnitude
7. **Wave Count**: Path 0-200px = 1 wave, 200-400px = 2 waves, >400px = 3 waves
8. **Wave Duration**: Each pulse wave completes within `(path_length / 400)` seconds (+100ms tolerance)
9. **Phase Text**: Text is "CHARGING" at 0-29%, "ACTIVATING" at 30-79%, "ONLINE" at 80-100%
10. **Rarity Colors**: Overlay glow uses correct hex values per rarity table above
11. **Vignette**: Red radial gradient reaches 40% opacity within 200ms of overload start
12. **Flicker**: Opacity oscillates between 100% and 60% during overload at ~50ms intervals
13. **Glow Duration**: Module activation glow is invisible by 350ms (300ms + 50ms tolerance)
14. **Build**: `npm run build` exits 0 with 0 TypeScript errors
15. **Tests Pass**: All existing tests pass; minimum 3 new tests verify activation choreography
16. **Performance**: 4-module machine completes full activation in <2 seconds

---

## Test Methods

### Test 1: Sequential Activation
**File**: `src/__tests__/activationChoreography.test.ts`

```typescript
test('Machine: Input → A → B, Input → C activates in BFS order', () => {
  // Setup machine with topology: Input0 → A → B, Input1 → C
  // Mock timer/RAF
  // Call activate()
  // Assert timestamps: Input(0ms), [A,C](200ms), B(400ms)
  // Tolerance: ±20ms per depth level
});

test('Modules at same depth activate within 50ms', () => {
  // Setup: Input → A, Input → B (parallel paths)
  // Activate
  // Assert: |timestamp(A) - timestamp(B)| ≤ 50ms
});
```

### Test 2: Camera Shake
**File**: `src/__tests__/activationEffects.test.ts`

```typescript
test('Activation shake uses ±4px for 150ms', () => {
  // Mock requestAnimationFrame
  // Trigger activation
  // Capture all transform values over duration
  // Assert: all offsets ≤ 4px in magnitude
  // Assert: total duration ≈ 150ms (±20ms)
});
```

### Test 3: Pulse Wave Count
**File**: `src/__tests__/pulseWave.test.ts`

```typescript
test('Short path gets 1 wave', () => {
  // Create 150px path
  // Activate
  // Assert: exactly 1 wave element exists
});

test('Medium path gets 2 waves', () => {
  // Create 300px path
  // Activate
  // Assert: exactly 2 wave elements exist
});
```

### Test 4: Phase Transitions
**File**: `src/__tests__/phaseOverlay.test.ts`

```typescript
test('CHARGING phase at 25%', () => {
  // Set progress to 25%
  // Assert text is "CHARGING"
});

test('ACTIVATING phase at 50%', () => {
  // Set progress to 50%
  // Assert text is "ACTIVATING"
});

test('ONLINE phase at 90%', () => {
  // Set progress to 90%
  // Assert text is "ONLINE"
});
```

### Test 5: Build & Regression
```bash
npm run build  # Must exit 0
npm test       # All tests must pass
```

---

## Risks

1. **Timing Tests in CI**: RAF mocking may behave differently in jsdom; use fake timers instead
2. **Visual Effect Measurement**: Cannot screenshot in CI; use DOM property assertions only
3. **BFS Algorithm Complexity**: Graph traversal must handle disconnected components; assign depth = distance to nearest input (∞ if unreachable)
4. **Staggered Animations**: Pulse wave stagger requires careful timing; use setTimeout with 100ms offsets

---

## Failure Conditions

The round fails if ANY of the following occur:

1. `npm run build` exits non-zero
2. Any existing test fails
3. TypeScript compilation errors
4. Modules at different depths activate simultaneously (delta < 180ms)
5. Camera shake offset magnitude exceeds ±8px
6. Pulse wave count incorrect for path length
7. Phase text incorrect for given progress percentage
8. Overload vignette fails to reach 40% opacity
9. Activation of 4-module machine exceeds 2 seconds
10. Console errors during activation sequence

---

## Done Definition

ALL of the following must be verified before claiming completion:

- [ ] `npm run build` succeeds with 0 errors
- [ ] `npm test` passes all tests (existing + new)
- [ ] 3+ new tests added in `src/__tests__/` for activation choreography
- [ ] BFS activation order implemented in `activationChoreographer.ts`
- [ ] Depth-level delay is 200ms (±20ms)
- [ ] Same-depth modules activate within 50ms
- [ ] Connections light up 100ms before target module
- [ ] Camera shake: 150ms/±4px on normal activation
- [ ] Camera shake: 300ms/±8px on overload
- [ ] Pulse wave count matches path length table
- [ ] Pulse wave duration = path_length/400s
- [ ] Phase text correct at 0-30%, 30-80%, 80-100%
- [ ] Rarity colors match specification
- [ ] Overload vignette reaches 40% opacity
- [ ] Overload flicker oscillates at ~50ms intervals
- [ ] Module glow completes in 300ms (±50ms)

---

## Out of Scope

- New module types (e.g., timers, logic gates)
- Export functionality changes
- Codex/collection UI changes
- AI text generation or descriptions
- Community/social features
- Failure mode logic changes (only visual enhancement)
- Sound effects
- Particle systems beyond specified sparks
- Mobile touch optimizations
- Performance optimization beyond correctness

---

## Notes

- All visual effect tests use fake timers or RAF mocking, not screenshots
- Timing assertions use ±tolerance for CI/CD stability
- All new code follows existing TypeScript conventions
- No external dependencies added (only using existing project stack)
