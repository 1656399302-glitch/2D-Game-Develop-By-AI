# Sprint Contract — Round 64

## Scope

**Theme: New Module Types & Enhanced Visual Effects**

This sprint adds 3 new SVG module types with unique visual designs and animations, plus enhanced activation effects for the existing module set.

## Spec Traceability

### P0 Items (Must Complete)
- [x] Core Furnace module (Round 1)
- [x] Energy Pipe module (Round 1)
- [x] Gear module (Round 1)
- [x] Rune Node module (Round 1)
- [x] Shield Shell module (Round 1)
- [x] Trigger Switch module (Round 1)
- [x] Output Array module (Round 1)
- [x] Connection system (Round 5)
- [x] Activation system (Round 8)
- [x] Attribute generation (Round 6)
- [x] Codex system (Round 4)
- [x] Random generator (Round 12)

### P1 Items (Covered This Round)
- **NEW: Temporal Distorter module** — A circular time-altering module with rotating inner rings and time distortion effects
- **NEW: Arcane Matrix Grid module** — A geometric grid-based module with pulsing node intersections
- **NEW: Ether Infusion Chamber module** — A cylindrical chamber module with swirling ether effects
- **Enhanced activation choreography** — Improved animation timing for all modules during machine activation

### P2 Items (Deferred)
- AI naming assistant enhancements
- Community voting system
- Advanced faction tech tree branches
- 3D preview mode
- Sound effects integration

## Deliverables

1. **New module: Temporal Distorter**
   - File: `src/components/Modules/TemporalDistorter.tsx`
   - File: `src/components/Modules/TemporalDistorter.module.css`
   - Type definition in `src/types/index.ts`
   - Module size: 90x90
   - Ports: 1 input (left), 1 output (right)
   - Visual: Concentric rotating rings with time-warping distortion effect
   - Animation states: idle (slow rotation), active (fast rotation with glow), charging (pulsing)

2. **New module: Arcane Matrix Grid**
   - File: `src/components/Modules/ArcaneMatrixGrid.tsx`
   - File: `src/components/Modules/ArcaneMatrixGrid.module.css`
   - Type definition in `src/types/index.ts`
   - Module size: 80x80
   - Ports: 1 input (left), 2 outputs (right, stacked)
   - Visual: 4x4 geometric grid with illuminated intersection nodes
   - Animation states: idle (subtle node pulse), active (sequential node illumination), failure (random node flicker)

3. **New module: Ether Infusion Chamber**
   - File: `src/components/Modules/EtherInfusionChamber.tsx`
   - File: `src/components/Modules/EtherInfusionChamber.module.css`
   - Type definition in `src/types/index.ts`
   - Module size: 100x100
   - Ports: 2 inputs (left), 1 output (right)
   - Visual: Cylindrical chamber with swirling ether particle effect
   - Animation states: idle (slow swirl), active (fast swirl with particles), charging (expanding ring)

4. **Module registration**
   - File: `src/components/Modules/ModuleRenderer.tsx` (update switch statement)
   - File: `src/components/Editor/ModulePanel.tsx` (add to palette)
   - File: `src/store/useMachineStore.ts` (add port configuration)
   - File: `src/utils/attributeGenerator.ts` (add attribute rules)

5. **Enhanced activation choreography**
   - File: `src/utils/activationChoreographer.ts` (update timing)
   - Improved stagger timing for activation sequence
   - Better state transitions between phases

## Acceptance Criteria

1. **AC1: Temporal Distorter renders correctly**
   - Module displays with 3 concentric rotating rings
   - Idle state shows slow counter-rotation (0.5 rotation/second)
   - Active state shows accelerated rotation with cyan glow
   - Charging state shows pulsing animation effect (class applied)
   - Ports are correctly positioned and functional

2. **AC2: Arcane Matrix Grid renders correctly**
   - Module displays with 4x4 grid lines
   - 9 intersection nodes (corners + center) are visible
   - Idle state shows subtle node pulse animation
   - Active state shows sequential node illumination (center-out)
   - Failure state shows random node flicker (class applied)
   - Ports are correctly positioned and functional

3. **AC3: Ether Infusion Chamber renders correctly**
   - Module displays cylindrical chamber shape
   - Swirling ether effect visible in center
   - Idle state shows slow swirl animation
   - Active state shows accelerated swirl with particle burst
   - Charging state shows expanding ring animation (element visible)
   - Ports are correctly positioned and functional

4. **AC4: New modules appear in module palette**
   - Temporal Distorter appears under "Advanced" category
   - Arcane Matrix Grid appears under "Advanced" category
   - Ether Infusion Chamber appears under "Advanced" category
   - All three are draggable to canvas

5. **AC5: New modules connect correctly**
   - Can create connections from new modules to existing modules
   - Can create connections from existing modules to new modules
   - Multi-port modules (Ether Infusion Chamber) work with connection validation
   - Ether Infusion Chamber has correct port configuration: 2 inputs (left), 1 output (right)
   - Ether Infusion Chamber accepts up to 2 upstream connections
   - Ether Infusion Chamber rejects connection when all 2 inputs are occupied
   - Output-to-output connections are rejected with error
   - Input-to-input connections are rejected with error

6. **AC6: New modules participate in activation sequence**
   - New modules animate during machine activation
   - Activation choreographer correctly staggers new module types
   - Machine state transitions work correctly with new modules
   - Modules return to idle state after activation completes
   - Repeated activation cycles complete successfully (idle → active → idle → active)

7. **AC7: Code compiles without errors**
   - TypeScript compilation: 0 errors
   - Vite build: successful
   - All 104 existing test files pass

## Test Methods

All tests are automated (unit tests via Vitest/Jest + integration tests). No manual browser testing required.

### Unit Tests

1. **Temporal Distorter SVG Test**
   - Render component with `isActive=false`, `isCharging=false`
   - Verify: 3 ring elements present with correct stroke colors
   - Verify: No pulsing class applied
   - Render component with `isActive=true`
   - Verify: Ring animation class applied
   - Render component with `isCharging=true`
   - Verify: Pulsing animation class applied
   - Verify: Port positions match MODULE_PORT_CONFIGS

2. **Arcane Matrix Grid SVG Test**
   - Render component with `isActive=false`, `isFailing=false`
   - Verify: 16 grid lines present (4 horizontal + 4 vertical)
   - Verify: 9 node circles present
   - Verify: No flicker class applied
   - Render component with `isActive=true`
   - Verify: Node illumination class applied
   - Render component with `isFailing=true`
   - Verify: Flicker animation class applied

3. **Ether Infusion Chamber SVG Test**
   - Render component with `isActive=false`, `isCharging=false`
   - Verify: Chamber shape (ellipse + rectangle) present
   - Verify: Swirl path element present
   - Verify: No expanding ring visible
   - Render component with `isActive=true`
   - Verify: Particle effect group visible
   - Render component with `isCharging=true`
   - Verify: Expanding ring element visible

4. **Module Registration Test**
   - Import TemporalDistorterSVG in ModuleRenderer
   - Verify switch case handles 'temporal-distorter'
   - Import ArcaneMatrixGridSVG in ModuleRenderer
   - Verify switch case handles 'arcane-matrix-grid'
   - Import EtherInfusionChamberSVG in ModuleRenderer
   - Verify switch case handles 'ether-infusion-chamber'

5. **Module Palette Test**
   - Render ModulePanel
   - Verify "Advanced" category section exists
   - Verify all 3 new modules listed in Advanced category

6. **Port Configuration Test**
   - Verify Temporal Distorter: 1 input (left), 1 output (right)
   - Verify Arcane Matrix Grid: 1 input (left), 2 outputs (right, stacked)
   - Verify Ether Infusion Chamber: 2 inputs (left), 1 output (right)

### Integration Tests

1. **Drag Module to Canvas**
   - Start with empty canvas
   - Drag Temporal Distorter from palette
   - Verify module appears on canvas at drop position
   - Verify module has correct type

2. **Activation with New Modules**
   - Create machine with Core Furnace + Temporal Distorter + Output Array
   - Connect modules
   - Activate machine
   - Verify all 3 modules animate during activation
   - Verify activation completes without error
   - Verify modules return to idle state after activation completes

3. **Multi-Port Connection Validation**
   - Place Ether Infusion Chamber on canvas
   - Attempt to connect output port to output port (reverse direction)
   - Verify connection rejected with error message
   - Attempt to connect input port to input port
   - Verify connection rejected with error message
   - Connect 2 modules to Ether Infusion Chamber inputs
   - Verify both connections accepted
   - Attempt to connect a third module to Ether Infusion Chamber
   - Verify connection rejected (all inputs occupied)

4. **State Transition Test**
   - Create machine with Temporal Distorter
   - Activate machine
   - Verify state sequence: idle → active → idle
   - Within 2 seconds, activate machine again
   - Verify second activation cycle: idle → active → idle
   - Verify activation completes successfully on repeat

5. **Minimal Machine Activation**
   - Create machine with only Core Furnace + Output Array
   - Activate machine
   - Verify activation completes without error
   - Verify modules return to idle state after activation

6. **Module Removal During Idle**
   - Create machine with Core Furnace + Temporal Distorter + Output Array
   - Activate machine, wait for completion (all modules idle)
   - Remove Temporal Distorter from canvas
   - Verify machine remains in valid state
   - Verify remaining modules still connectable

7. **Ether Infusion Chamber Port Capacity Test**
   - Place Ether Infusion Chamber on canvas
   - Verify it has exactly 2 input ports
   - Connect module A to first input
   - Verify connection accepted
   - Connect module B to second input
   - Verify connection accepted
   - Verify both connections visible
   - Attempt connection from module C to any input
   - Verify connection rejected with error

### Negative Test Cases

1. **Output-to-Output Rejection**
   - Place 2 Temporal Distorters on canvas
   - Attempt connection from output to output (reversed direction)
   - Verify connection rejected with error message
   - Verify no connection line drawn

2. **Input-to-Input Rejection**
   - Place 2 Temporal Distorters on canvas
   - Attempt connection from input to input (reversed direction)
   - Verify connection rejected with error message
   - Verify no connection line drawn

3. **Full Port Rejection**
   - Place Ether Infusion Chamber on canvas
   - Connect 2 modules to both input ports
   - Attempt third connection to any input port
   - Verify connection rejected with error message

4. **Activation Not Crashed by Missing Module**
   - Create machine with Temporal Distorter
   - Remove Temporal Distorter from canvas
   - Attempt to activate machine
   - Verify no crash occurs
   - Verify appropriate error handling

## Risks

1. **SVG Animation Performance**
   - Risk: Complex SVG animations may cause frame drops on slower devices
   - Mitigation: Use CSS transforms and will-change hints for smooth animations
   - Fallback: Reduce animation complexity if performance issues detected

2. **Module Registry Consistency**
   - Risk: New modules may not be properly registered in all required locations
   - Mitigation: Follow existing module registration pattern exactly
   - Verify: Run existing tests to ensure no regressions

3. **Type Definition Updates**
   - Risk: Forgetting to update ModuleType union type
   - Mitigation: Add types first, then implement components
   - Verify: TypeScript compilation catches any missing type definitions

## Failure Conditions

1. **Build fails** — TypeScript compilation errors or Vite build failure
2. **Existing tests break** — Any of the 104 test files fail
3. **Module palette missing** — New modules not visible in UI
4. **Port connectivity broken** — Cannot connect new modules to existing ones
5. **Activation crash** — Machine activation crashes with new modules
6. **Missing animation states** — Charging or failure states not implemented per deliverables
7. **State machine incomplete** — Modules don't return to idle after activation
8. **Port overflow accepted** — Third connection to Ether Infusion Chamber accepted when all inputs occupied
9. **Output-to-output connects** — Connection system allows output-to-output connections
10. **Input-to-input connects** — Connection system allows input-to-input connections

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ `TemporalDistorter.tsx` exists with working SVG and animations (idle, active, charging)
2. ✅ `ArcaneMatrixGrid.tsx` exists with working SVG and animations (idle, active, failure)
3. ✅ `EtherInfusionChamber.tsx` exists with working SVG and animations (idle, active, charging)
4. ✅ All three modules appear in the module palette under "Advanced" category
5. ✅ All three modules can be dragged to canvas and connected
6. ✅ All three modules animate during machine activation
7. ✅ Modules return to idle state after activation completes
8. ✅ TypeScript compilation: 0 errors
9. ✅ Vite build: successful
10. ✅ All existing tests (104 files, ~2351 tests) pass
11. ✅ All animation states (charging, failure) verified via automated unit tests
12. ✅ Ether Infusion Chamber rejects connection when all inputs occupied (verified via integration test)
13. ✅ Ether Infusion Chamber accepts exactly 2 upstream connections (verified via integration test)
14. ✅ Output-to-output connections are rejected (verified via negative integration test)
15. ✅ Input-to-input connections are rejected (verified via negative integration test)
16. ✅ Repeated activation cycle completes successfully (verified via integration test)
17. ✅ Module can be removed during idle without crash (verified via integration test)

## Out of Scope

The following are explicitly NOT being done in this round:

- ❌ New faction variant modules
- ❌ AI naming/description assistant changes
- ❌ Community gallery enhancements
- ❌ Sound effects
- ❌ 3D preview mode
- ❌ New game modes (challenge expansion)
- ❌ Mobile-specific module designs
- ❌ Tutorial updates for new modules
- ❌ Achievement updates for new modules
- ❌ Manual browser testing (all verification via automated tests)
