# Sprint Contract — Round 111

## APPROVED

## Scope

This sprint focuses on **Energy Connection System + Module Animation Hooks** for the Arcane Machine Codex Workshop. Building on Round 110's editor completeness (undo/redo, copy/paste, snap-to-grid), this round implements the dynamic connection infrastructure and module animation system that enables modules to be linked together with flowing energy and animated independently during activation states.

## Spec Traceability

### P0 items completed in previous rounds:
- Module editor completeness (undo/redo, copy/paste, snap-to-grid) (COMPLETE in R110)
- Activation state machine (COMPLETE in R109)
- Sequential activation choreography (COMPLETE in R109)
- Canvas effects (zoom, shake) (COMPLETE in R109)
- Failure/overload visual effects (COMPLETE in R109)

### P0 items covered this round:
- **Energy Connection System** ← THIS ROUND'S FOCUS
  - Connection point definitions on modules
  - Path rendering between connection points
  - Energy flow animation (stroke-dashoffset animation)
  - Connection state tracking (idle, charging, active, overload)

- **Module Animation Hooks** ← THIS ROUND'S FOCUS
  - Module animation state machine
  - Animation triggers based on activation state
  - Per-module-type animation configurations
  - Animation lifecycle (enter, active, exit)

### P0 items remaining after this round:
- Connection validation and conflict detection
- Codex system data persistence
- Machine attribute generation refinement

### P1 items covered this round:
- (None - P1 focus deferred)

### P1 items remaining after this round:
- Random forge mode polish
- Export to SVG/PNG
- UI/UX polish and error handling
- Codex save ritual animation refinement

### P2 intentionally deferred:
- Alignment guides
- AI naming/description integration
- Community sharing
- Batch export
- Watermark/branding

## Deliverables

1. **src/types/connection.ts** — Connection type definitions
   - ConnectionPoint interface (moduleId, pointId, position, type: 'input'|'output')
   - Connection interface (id, sourceModuleId, sourcePointId, targetModuleId, targetPointId, state)
   - ConnectionState enum (idle, charging, active, overload, broken)

2. **src/hooks/useConnectionPoints.ts** — Connection point management
   - Define connection points per module type
   - Query connection points for a module
   - Check if a point is available/connected

3. **src/hooks/useEnergyConnections.ts** — Energy connection logic
   - Create connections between modules
   - Update connection state based on activation
   - Remove connections
   - Validate connection compatibility (input↔output)

4. **src/hooks/useModuleAnimation.ts** — Module animation state machine
   - Track animation state per module
   - Map activation state to animation parameters
   - Provide animation trigger callbacks

5. **src/utils/connectionPath.ts** — SVG path utilities
   - Calculate smooth bezier paths between points
   - Generate path data for energy flow animation
   - Handle edge cases (same module, parallel connections)

6. **src/__tests__/connectionPoints.test.ts** — Connection point tests (15+ test cases)
7. **src/__tests__/energyConnections.test.ts** — Energy connection tests (15+ test cases)
8. **src/__tests__/moduleAnimation.test.ts** — Module animation tests (15+ test cases)
9. **src/__tests__/connectionPath.test.ts** — Path calculation tests (10+ test cases)

## Acceptance Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC-111-001 | ConnectionPoint defines module input/output ports | Unit test verifying point type discrimination |
| AC-111-002 | Modules can have multiple connection points | Test: query module for all points, verify count |
| AC-111-003 | Connections require valid source (output) and target (input) | Test: createConnection validates point types |
| AC-111-004 | Connection state updates on activation | Test: set activation to 'active', verify connection state changes |
| AC-111-005 | Path calculates smooth bezier between two points | Unit test with known inputs, verify path output |
| AC-111-006 | Module animation state machine transitions correctly | Test: idle → charging → active → (overload or shutdown) |
| AC-111-007 | Module animations trigger on state changes | Test: activate module, verify animation callback fired |
| AC-111-008 | Different module types have different animation configs | Test: query core module, gear module, verify different configs |
| AC-111-009 | Connections persist in machine state | Test: create connection, reload store, verify connection exists |
| AC-111-010 | Connection removal works correctly | Test: create then remove connection, verify state |
| AC-111-011 | Invalid connections (output→output, input→input) are rejected | Negative test: attempt invalid connection, verify rejection |
| AC-111-012 | TypeScript compiles clean | Test: `npx tsc --noEmit` returns 0 errors |
| AC-111-013 | All existing tests pass | Test: `npm test` passes all existing test files |
| AC-111-014 | Build succeeds | Test: `npm run build` succeeds without errors |
| AC-111-015 | Animation enter/active/exit callbacks fire in sequence | Test: trigger activation, verify callback order |

## Test Methods

### AC-111-001 (ConnectionPoint type discrimination)
```
Setup:
1. Create connection point with type='output'
2. Create connection point with type='input'

Verification:
3. Assert point1.type === 'output'
4. Assert point2.type === 'input'
5. Assert isInput(point1) === false
6. Assert isInput(point2) === true
7. Assert isOutput(point1) === true
8. Assert isOutput(point2) === false
```

### AC-111-002 (Multiple connection points per module)
```
Setup:
1. Define module 'core' with 2 input points, 1 output point
2. Instantiate module in store

Action:
3. Query connectionPoints.getPointsForModule('core-1')

Verification:
4. Assert points.length === 3
5. Assert points.filter(p => p.type === 'input').length === 2
6. Assert points.filter(p => p.type === 'output').length === 1
```

### AC-111-003 (Valid connection creation)
```
Setup:
1. Create two modules with defined connection points

Action:
2. Attempt createConnection({source: outputPoint, target: inputPoint})

Verification:
3. Assert connection created with valid ID
4. Assert connection.state === 'idle'
```

### AC-111-004 (Connection state updates on activation)
```
Setup:
1. Create machine with 2 modules and connection between them
2. Capture initialConnection = getConnection()

Action:
3. Set machine activationState = 'charging'
4. Verify connection state updates to 'charging'

Action:
5. Set machine activationState = 'active'
6. Verify connection state updates to 'active'

Action:
7. Set machine activationState = 'overload'
8. Verify connection state updates to 'overload'
```

### AC-111-005 (Bezier path calculation)
```
Setup:
1. Create source point at {x: 100, y: 100}
2. Create target point at {x: 300, y: 200}

Action:
3. Call calculateConnectionPath(sourcePoint, targetPoint)

Verification:
4. Assert path is valid SVG path string
5. Assert path contains 'M' (move to)
6. Assert path contains 'C' (cubic bezier) or 'Q' (quadratic bezier)
7. Assert path string is non-empty
```

### AC-111-006 (Animation state machine transitions)
```
Setup:
1. Create useModuleAnimation hook instance for module 'core-1'

Initial State:
2. Assert animationState === 'idle'

Action:
3. Trigger transition to 'charging'
4. Assert animationState === 'charging'

Action:
5. Trigger transition to 'active'
6. Assert animationState === 'active'

Action:
7. Trigger transition to 'shutdown'
8. Assert animationState === 'idle'
```

### AC-111-007 (Animation triggers on state change)
```
Setup:
1. Create useModuleAnimation hook
2. Register mock callback for 'onActivate'

Action:
3. Set animation state to 'active'

Verification:
4. Assert onActivate callback was called exactly once
5. Assert callback received moduleId and state info
```

### AC-111-008 (Module-specific animation configs)
```
Setup:
1. Get animation config for 'core' module type
2. Get animation config for 'gear' module type
3. Get animation config for 'rune' module type

Verification:
4. Assert core config has different duration than gear config
5. Assert rune config has different easing than core config
6. Assert all configs have required properties (duration, easing, keyframes)
```

### AC-111-009 (Connection persistence)
```
Setup:
1. Create machine with module
2. Create connection between modules
3. Verify connection exists in state

Action:
4. Simulate store reload (dispatch reload action)

Verification:
5. Assert connection still exists with same ID
6. Assert connection.sourceModuleId unchanged
7. Assert connection.targetModuleId unchanged
```

### AC-111-010 (Connection removal)
```
Setup:
1. Create machine with connection

Action:
2. Call removeConnection(connectionId)

Verification:
3. Assert connection no longer exists in state
4. Assert attempting to get connection returns undefined
```

### AC-111-011 (Invalid connection rejection - NEGATIVE)
```
Setup:
1. Create two modules with connection points

Action:
2. Attempt createConnection({source: inputPoint, target: inputPoint})
3. Attempt createConnection({source: outputPoint, target: outputPoint})

Verification:
4. Assert first connection attempt failed
5. Assert second connection attempt failed
6. Assert error message indicates invalid connection type
```

### AC-111-012 (TypeScript clean)
```
$ npx tsc --noEmit
# Must return 0 errors
```

### AC-111-013 (All tests pass)
```
$ npm test -- --run
# Must pass all test files including new tests
```

### AC-111-014 (Build succeeds)
```
$ npm run build
# Must succeed without errors
```

### AC-111-015 (Animation callback sequence)
```
Setup:
1. Create useModuleAnimation hook
2. Track callback invocation order

Action:
3. Trigger state transition idle → charging → active

Verification:
4. Assert 'onEnter' callback fired before 'onActive'
5. Assert callbacks received correct state values
6. Assert total callback count matches expected (2 callbacks)
```

## Negative Assertions (What Should NOT Happen)

| ID | Negative Condition | Verification |
|----|-------------------|--------------|
| NA-111-001 | Connection should NOT be created between same-type points | Attempt output↔output or input↔input, verify rejection |
| NA-111-002 | Connection should NOT be created with non-existent module | Attempt connection with invalid moduleId, verify rejection |
| NA-111-003 | Animation state should NOT accept invalid states | Attempt transition to invalid state, verify no change |
| NA-111-004 | Path should NOT be empty for valid points | With two valid points, path calculation must return string |
| NA-111-005 | Removed connection should NOT remain in state | After removeConnection, connection must be undefined |

## State Management Integration

### useConnectionPoints Entry States
- Module created with defined connection points
- Module without connection points (edge case)

### useConnectionPoints Completion/Dismissal States
- Points defined in module metadata
- Points queryable by module ID

### useEnergyConnections Entry States
- No connections exist
- Existing connections in various states

### useEnergyConnections Completion/Dismissal States
- Connection created with validation
- Connection removed
- Connection state updated

### useEnergyConnections Repeat/Retry
- Create multiple connections from one point
- Remove and recreate connection
- Update connection state multiple times

### useModuleAnimation Entry/Dismissal States
- Module in idle state (no animation)
- Module transitioning between states
- Module completing animation sequence

### useModuleAnimation Repeat/Retry
- Multiple rapid state transitions
- Transition to same state (no-op)
- Interrupted transitions

## Connection Point Definitions

Each module type has defined connection points:

| Module Type | Input Points | Output Points | Notes |
|-------------|--------------|----------------|-------|
| core | 0 | 2 | Energy source, no input |
| pipe | 1 | 1 | Pass-through energy |
| gear | 0 | 0 | Mechanical, no connections |
| rune | 1 | 1 | Transform energy |
| shell | 0 | 0 | Structural, no connections |
| switch | 0 | 1 | Trigger output only |
| output | 1 | 0 | Energy sink, no output |

## Animation Configuration Schema

```typescript
interface ModuleAnimationConfig {
  moduleType: string;
  idle: {
    duration: number;      // seconds
    easing: string;        // CSS easing or GSAP ease
    keyframes: Keyframe[];
  };
  charging: {
    duration: number;
    easing: string;
    keyframes: Keyframe[];
  };
  active: {
    duration: number;
    easing: string;
    keyframes: Keyframe[];
  };
  overload?: {
    duration: number;
    easing: string;
    keyframes: Keyframe[];
  };
  shutdown: {
    duration: number;
    easing: string;
    keyframes: Keyframe[];
  };
}

interface Keyframe {
  time: number;           // 0-1 normalized
  properties: {
    opacity?: number;
    scale?: number;
    rotation?: number;
    fill?: string;
    stroke?: string;
    filter?: string;
    transform?: string;
  };
}
```

## Risks

1. **Integration risk**: Connection system must properly integrate with existing store structure and activation state machine.
   - Mitigation: Define clear interfaces, write integration tests with existing store tests.

2. **Animation conflict risk**: Multiple state transitions in rapid succession may cause animation conflicts.
   - Mitigation: Implement debounce/throttle on transition calls, use state machine pattern.

3. **Path calculation edge cases**: Connecting modules in various positions may produce degenerate paths.
   - Mitigation: Implement minimum distance checks, fallback straight line for close points.

4. **Test coverage risk**: New system needs comprehensive tests to avoid regressions.
   - Mitigation: Write tests alongside implementation, use TDD approach.

## Failure Conditions

This sprint fails if:
1. Connection points are not properly defined per module type
2. Connections cannot be created between output→input points
3. Invalid connections (output↔output, input↔input) are not rejected
4. Connection state does not update with activation state
5. Path calculation returns invalid SVG path string
6. Module animation state machine does not transition correctly
7. Animation callbacks are not triggered on state changes
8. Different module types do not have distinct animation configs
9. Connections do not persist across store reload
10. TypeScript produces any compilation errors
11. Any existing test fails
12. Build does not succeed

## Done Definition

All conditions must be true before claiming complete:

1. ✅ Connection types defined in `src/types/connection.ts`
2. ✅ `useConnectionPoints` hook manages connection point definitions and queries
3. ✅ `useEnergyConnections` hook creates/removes connections with validation
4. ✅ `useModuleAnimation` hook implements animation state machine
5. ✅ Connection state updates when activation state changes
6. ✅ Path calculation produces valid SVG bezier paths
7. ✅ Module-specific animation configs defined for all module types
8. ✅ All 4 test files created with 55+ total tests
9. ✅ `npx tsc --noEmit` returns 0 errors
10. ✅ All tests in `npm test -- --run` pass (including existing 4708+)
11. ✅ `npm run build` succeeds

## Out of Scope

This sprint does NOT include:
- Connection validation for conflicts (circuits, loops) (P0, next round)
- Energy flow visualization with particles/effects (P0, next round)
- Codex data persistence (P0, next round)
- Machine attribute generation (P0, next round)
- Export to SVG/PNG (P1)
- Random forge mode polish (P1)
- AI naming/description integration (P2)
- Community sharing features (P2)
- Alignment guides (deferred)
- Touch gesture improvements (deferred)
- Accessibility enhancements beyond existing
- Tutorial system updates
