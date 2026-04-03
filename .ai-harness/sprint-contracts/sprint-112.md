# Sprint Contract — Round 112

## Scope

This sprint implements the **Advanced Circuit Validation System** to extend the Energy Connection System from Round 111. The goal is to validate machine configurations before activation, detecting circuit completeness, loops, and energy flow issues.

## Spec Traceability

### P0 Items (Critical Path) — Covered This Round
| P0 Item | Deliverable | Acceptance Criteria |
|---------|-------------|---------------------|
| Circuit completeness validation | `src/utils/circuitValidator.ts` | AC-112-005 (no core), AC-112-007 (hook integration) |
| Loop detection in connection graphs | `src/utils/circuitValidator.ts` | AC-112-002 (cycles), AC-112-003 (islands) |
| Energy flow analysis | `src/utils/circuitValidator.ts` | AC-112-004 (unreachable), AC-112-006 (outputs) |

### P1 Items (High Value) — Covered This Round
| P1 Item | Deliverable | Acceptance Criteria |
|---------|-------------|---------------------|
| Validation error messages | `src/utils/circuitValidator.ts`, `src/components/Editor/CircuitValidationOverlay.tsx` | AC-112-008 (UI display) |
| Visual indicators on invalid modules | `src/components/Editor/CircuitValidationOverlay.tsx` | AC-112-008 |
| Pre-activation validation gate | `src/store/useMachineStore.ts` | AC-112-009 (blocking) |

### Remaining P0/P1 After This Round
- Power budget calculations (P2)
- AI-assisted circuit optimization (P2)
- Automatic circuit repair suggestions (P2)
- Codex data persistence (P0, future round)
- Machine attribute generation refinement (P0, future round)
- Energy flow visualization with particles (P0, future round)

### P2 Intentionally Deferred
- Power budget calculations
- AI-assisted circuit optimization suggestions
- Automatic circuit repair suggestions

## Deliverables

1. **Types** (`src/types/circuitValidation.ts`)
   - `CircuitValidationResult` interface with `isValid`, `errors[]`, `warnings[]`
   - `ValidationError` types: `CIRCUT_INCOMPLETE`, `LOOP_DETECTED`, `ISLAND_MODULES`, `UNREACHABLE_OUTPUT`
   - `ValidationWarning` types
   - `CircuitGraph` type for path analysis

2. **Validation Utility** (`src/utils/circuitValidator.ts`)
   - `validateCircuit(modules, connections)` - Main validation function
   - `detectCycles(graph)` - Loop detection using DFS
   - `findIslands(modules, connections)` - Find disconnected module groups
   - `traceEnergyFlow(sourceModules, connections)` - Trace energy propagation
   - `findUnreachableOutputs(modules, connections)` - Check output coverage

3. **Hook** (`src/hooks/useCircuitValidation.ts`)
   - `useCircuitValidation()` - Hook for validation state management
   - Returns: `validationResult`, `isValid`, `errors`, `warnings`, `validate()`
   - Integrates with machine store for real-time validation

4. **UI Component** (`src/components/Editor/CircuitValidationOverlay.tsx`)
   - Shows validation results before activation
   - Lists errors with module/connection references
   - "Fix" hints for common issues
   - "Proceed anyway" option for intentional designs

5. **Integration** (`src/store/useMachineStore.ts` additions)
   - Add `circuitValidationResult` to state
   - Auto-validate on module/connection changes
   - Block activation if validation fails (with override option)

6. **Tests** (`src/__tests__/circuitValidator.test.ts`)
   - 15+ test cases covering all validation paths
   - Edge case testing for complex graphs
   - Performance testing with 30+ modules

## Acceptance Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC-112-001 | `CircuitValidationResult` type defines validation state with `isValid`, `errors[]`, `warnings[]` | TypeScript compilation, unit test imports |
| AC-112-002 | `validateCircuit()` detects cycles in connection graph and returns `LOOP_DETECTED` error | Unit test: A→B→C→A returns LOOP_DETECTED |
| AC-112-003 | `validateCircuit()` finds disconnected module groups and returns `ISLAND_MODULES` error | Unit test: isolated module returns ISLAND_MODULES |
| AC-112-004 | `validateCircuit()` traces energy from core modules and returns `ISLAND_MODULES` for unreachable modules | Unit test: core→pipe with no output path returns error |
| AC-112-005 | `validateCircuit()` returns `CIRCUIT_INCOMPLETE` when no core module exists | Unit test: pipes and outputs only returns CIRCUIT_INCOMPLETE |
| AC-112-006 | `validateCircuit()` returns `UNREACHABLE_OUTPUT` when output arrays have no input path | Unit test: orphan output returns UNREACHABLE_OUTPUT |
| AC-112-007 | Hook returns validation state that updates when modules/connections change | Unit test: mock store changes trigger re-validation |
| AC-112-008 | UI overlay displays all validation errors with actionable messages | Browser test: create invalid circuit → overlay shows errors |
| AC-112-009 | Machine activation is blocked when circuit validation fails | Browser test: invalid circuit → "Activate" does not proceed |
| AC-112-010 | Valid circuits should NOT trigger validation errors | Unit test: A→B→C (linear) returns isValid=true, no errors |
| AC-112-011 | TypeScript compiles with 0 errors | `npx tsc --noEmit` → 0 errors |
| AC-112-012 | All 4827 existing tests pass | `npm test -- --run` → 4827+ passing |
| AC-112-013 | Build succeeds in <5s | `npm run build` → completes in <5s |
| AC-112-014 | New tests cover all acceptance criteria | Test file has 15+ tests mapping to AC-112-001 through AC-112-010 |

### Negative Assertions (False Positive Prevention)

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| NA-112-001 | `validateCircuit()` should NOT return LOOP_DETECTED for linear A→B→C circuit | Unit test: linear circuit returns isValid=true |
| NA-112-002 | `validateCircuit()` should NOT return ISLAND_MODULES when all modules connected | Unit test: fully connected graph returns no island errors |
| NA-112-003 | `validateCircuit()` should NOT return UNREACHABLE_OUTPUT when outputs have valid paths | Unit test: core→pipe→output returns isValid=true |
| NA-112-004 | UI overlay should NOT appear for valid circuits | Browser test: valid circuit → no validation overlay |
| NA-112-005 | Activation should NOT be blocked for valid circuits | Browser test: valid circuit → "Activate" proceeds |

## Test Methods

### Unit Tests (via Vitest)
```
npm test -- src/__tests__/circuitValidator.test.ts
```

#### Cycle Detection Tests (AC-112-002, NA-112-001)
| Test Case | Input | Expected Result |
|-----------|-------|-----------------|
| Linear circuit | A→B→C (no cycle) | isValid=true, no LOOP_DETECTED |
| Simple cycle | A→B→C→A | LOOP_DETECTED error |
| Self-loop | module output→input on same | LOOP_DETECTED error |
| Multi-cycle | Complex graph with 2 cycles | LOOP_DETECTED error |

#### Island Detection Tests (AC-112-003, NA-112-002)
| Test Case | Input | Expected Result |
|-----------|-------|-----------------|
| All connected | 3 modules with full connectivity | isValid=true |
| Single island | 1 isolated module | ISLAND_MODULES error |
| Multiple islands | 2 separate groups | ISLAND_MODULES error |

#### Energy Flow Tests (AC-112-004, AC-112-005, AC-112-006, NA-112-003)
| Test Case | Input | Expected Result |
|-----------|-------|-----------------|
| Valid flow | core→pipe→output | isValid=true |
| No core | pipes and outputs only | CIRCUIT_INCOMPLETE |
| Dead end | core→pipe (no output) | UNREACHABLE_OUTPUT |
| Partial flow | some outputs disconnected | UNREACHABLE_OUTPUT |

#### Integration Tests
| Test Case | Input | Expected Result |
|-----------|-------|-----------------|
| Valid circuit | All checks pass | isValid=true |
| Multiple errors | Cycle + island | Both errors returned |
| Empty canvas | No modules | isValid=true (no validation needed) |
| Hook update | Store changes | Validation re-runs |

### Browser Verification (Stateful UI Workflow)

#### Test 1: Validation Overlay Entry (AC-112-008)
1. Open machine editor with empty canvas
2. Create 2 modules (core, gear)
3. Do NOT connect them (create island)
4. **Assert**: Validation overlay appears within 500ms
5. **Assert**: Overlay shows "ISLAND_MODULES" or "Unreachable Modules" message

#### Test 2: Validation Overlay Displays Errors (AC-112-008)
1. Create circuit with cycle: A→B→C→A
2. **Assert**: Overlay shows "LOOP_DETECTED" or "Circuit Loop Detected"
3. **Assert**: Error message includes module names or IDs

#### Test 3: Activation Blocked (AC-112-009, NA-112-005)
1. Create invalid circuit (no core)
2. Click "激活机器" / "Activate Machine"
3. **Assert**: Activation overlay does NOT appear
4. **Assert**: Validation overlay remains visible
5. **Assert**: Machine state remains "idle"

#### Test 4: Valid Circuit Proceeds (NA-112-005)
1. Create valid circuit: core→pipe→output
2. **Assert**: No validation overlay visible
3. Click "Activate"
4. **Assert**: Activation overlay appears with "CHARGING" state

#### Test 5: Dismiss Overlay (Negative Assertion)
1. Create invalid circuit → overlay appears
2. Fix circuit (add connections)
3. **Assert**: Overlay disappears
4. **Assert**: Overlay does NOT reappear for valid circuit

#### Test 6: Proceed Anyway Override (AC-112-009)
1. Create invalid circuit → overlay appears
2. Click "Proceed anyway" or equivalent override button
3. **Assert**: Activation proceeds (overlay dismissed, activation starts)

#### Test 7: Re-validation on Changes
1. Create valid circuit (no overlay)
2. Delete connection to create invalid state
3. **Assert**: Validation overlay appears
4. **Assert**: Machine state unchanged (still "idle")

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| DFS cycle detection performance on complex graphs | Medium | Use iterative DFS with early termination, memoize results |
| Hook causes excessive re-renders | Medium | Debounce validation (100ms), use shallow equality selectors |
| Energy flow tracing edge cases | Medium | Extensive test coverage (30+ cases), trace through examples |
| False positives marking valid circuits invalid | Low | Unit tests verify valid circuits pass (NA-112-001 through NA-112-003) |

## Failure Conditions

The round fails if:
- Any acceptance criterion (AC-112-001 through AC-112-014) is not met
- Any negative assertion (NA-112-001 through NA-112-005) fails
- TypeScript compilation errors exist
- Any existing test fails (regression from 4827 tests)
- Build takes >5s
- Validation produces false positives (marks valid circuits as invalid)
- Browser verification steps fail (overlay, blocking, dismiss)

## Done Definition

The round is complete when:

### Deliverables
- [ ] `src/types/circuitValidation.ts` exists with all types (CircuitValidationResult, ValidationError, ValidationWarning, CircuitGraph)
- [ ] `src/utils/circuitValidator.ts` exists with all functions (validateCircuit, detectCycles, findIslands, traceEnergyFlow, findUnreachableOutputs)
- [ ] `src/hooks/useCircuitValidation.ts` exists with hook returning validation state
- [ ] `src/components/Editor/CircuitValidationOverlay.tsx` exists with error display and hints
- [ ] `src/__tests__/circuitValidator.test.ts` has 15+ passing tests
- [ ] `src/store/useMachineStore.ts` integrates validation and blocking

### Verification
- [ ] `npx tsc --noEmit` → 0 errors
- [ ] `npm test -- --run` → 4827+ passing (no regression)
- [ ] `npm run build` → succeeds in <5s
- [ ] Browser: Invalid circuit shows validation overlay
- [ ] Browser: "Activate" on invalid circuit is blocked
- [ ] Browser: Valid circuit activates without overlay
- [ ] Browser: Overlay dismisses when circuit is fixed

### Coverage
- [ ] All AC-112-001 through AC-112-014 have passing tests
- [ ] All NA-112-001 through NA-112-005 have passing tests
- [ ] All 4 validation error types tested (LOOP_DETECTED, ISLAND_MODULES, CIRCUIT_INCOMPLETE, UNREACHABLE_OUTPUT)

## Out of Scope

- Power budget calculations (P2)
- Automatic circuit repair suggestions
- AI-powered optimization hints
- Exporting validation reports
- Multi-machine validation
- Temporal loop detection (loops in time, not connections)
- Codex data persistence (P0, future round)
- Energy flow visualization with particles/effects (P0, future round)
- Machine attribute generation refinement (P0, future round)
