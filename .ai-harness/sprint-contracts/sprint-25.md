APPROVED

# Sprint Contract — Round 25

## Scope

**Focus: Enhanced Activation Visual System**

This sprint will enhance the activation experience with:
1. Canvas zoom/focus effect that centers on the machine during activation
2. Energy pulse waves that visually travel through connections during activation
3. Enhanced particle burst effects coordinated with activation choreography
4. Module glow intensification based on BFS activation order

## Spec Traceability

### P0 items (Must Complete)
- **AC1**: Canvas zoom animation during activation sequence (centers on machine content)
- **AC2**: Energy pulse visualization on connections during activation (light-up waves)
- **AC3**: Particle burst effects on module activation (coordinated with BFS order)
- **AC4**: Module glow intensification during activation (visual feedback)

### P1 items (Should Complete if time permits)
- **AC5**: Failure/overload visual enhancements (enhanced glitch effects)
- **AC6**: Build succeeds with no TypeScript errors

### Remaining P0/P1 after this round
- Most P0/P1 items from spec are complete. This round enhances existing activation visuals.
- No P0/P1 items remain incomplete after this round.

### P2 intentionally deferred
- Advanced time-trial challenge mode (mentioned in challenges but not P0)
- Social multiplayer features (community gallery is session-scoped only)
- AI naming API integration (mock implementation complete)

## Deliverables

1. **Enhanced Canvas Component** (`src/components/Editor/Canvas.tsx`)
   - Add activation zoom/focus effect
   - Store activation-zoom state in useMachineStore
   - Calculate machine bounding box and zoom-to-fit during activation

2. **Energy Pulse Visualizer** (`src/components/Preview/EnergyPulseVisualizer.tsx`)
   - New component for visualizing energy flow through connections
   - Uses activation choreography data to time pulse propagation
   - SVG-based animated pulses with glow effects

3. **Enhanced Activation Overlay** (`src/components/Preview/ActivationOverlay.tsx`)
   - Integrate with new visualizer components
   - Trigger canvas zoom on activation start
   - Coordinate particle bursts with module activation order

4. **Activation Pulse Hook** (`src/hooks/useActivationPulse.ts`)
   - Custom hook to manage pulse timing based on choreography
   - Returns active pulses and their animation progress

5. **Unit Tests** (`src/__tests__/activationVisualEffects.test.ts`)
   - Tests for zoom calculation
   - Tests for pulse timing coordination
   - Tests for module glow state

## Acceptance Criteria

1. **AC1**: When user clicks "激活机器", the canvas zooms to fit all modules within view (zoom factor calculated to fit with padding)
2. **AC2**: During activation, SVG pulse waves visually travel from source modules through connections to target modules
3. **AC3**: When a module activates (per BFS order), a particle burst occurs at that module's position
4. **AC4**: Activating modules show increased glow intensity compared to non-activated modules
5. **AC5**: Failure mode shows enhanced glitch/noise visual effects (screen tear effect or static noise)
6. **AC6**: `npm run build` completes with 0 TypeScript errors

## Test Methods

1. **AC1 Verification**: 
   - Create a machine with modules spread across canvas
   - Activate machine
   - Visually verify canvas zooms to fit machine content
   - Log/verify zoom level changes during activation

2. **AC2 Verification**:
   - Create connected modules
   - Activate machine
   - Verify energy pulses animate along connection paths
   - Check pulse timing matches BFS activation order

3. **AC3 Verification**:
   - Activate machine with 3+ modules
   - Observe particle bursts appear at each module as it activates
   - Verify timing matches activation choreography

4. **AC4 Verification**:
   - Inspect module SVG elements during activation
   - Verify filter/glow intensity increases when module activates

5. **AC5 Verification**:
   - Trigger failure mode
   - Verify visual glitch/static effects are more prominent than current implementation

6. **AC6 Verification**: 
   - Run `npm run build`
   - Confirm 0 TypeScript errors

## Risks

1. **Animation Performance Risk**: Heavy particle effects may impact frame rate
   - Mitigation: Use CSS transforms, limit particle count, use requestAnimationFrame
   - Monitor with browser dev tools during development

2. **Integration Risk**: New visualizer components may conflict with existing ActivationOverlay
   - Mitigation: Ensure new components are self-contained and optional
   - Test activation flow end-to-end after each change

3. **Timing Coordination Risk**: Pulse animations may desync from activation state machine
   - Mitigation: Use shared activation choreography data source
   - Add visual state indicators for debugging if needed

## Failure Conditions

1. Build fails with TypeScript errors
2. Activation overlay no longer renders or completes
3. Modules cannot be activated (broken activation flow)
4. Canvas becomes unresponsive during activation
5. Any existing test suite failures introduced by changes

## Done Definition

All acceptance criteria must be verified in browser:
- Canvas zooms smoothly to fit machine content when activation starts
- Energy pulses animate along connection paths during activation
- Particle bursts occur at each module in BFS activation order
- Activating modules show increased glow
- Failure mode shows enhanced glitch effects
- `npm run build` succeeds with 0 TypeScript errors
- `npm test -- --run` passes all existing tests plus new tests

## Out of Scope

- Time-trial challenge mode implementation
- Full AI API integration (mock service is complete)
- Mobile-specific activation animations (beyond current mobile support)
- Sound effects/audio integration
- WebGL-based rendering (staying with SVG for this round)
- Export of activation animation as video/GIF
