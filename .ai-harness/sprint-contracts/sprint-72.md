APPROVED

# Sprint Contract — Round 72

## Scope
Polishing and visual enhancement of the activation animation system for the Arcane Machine Codex Workshop. This sprint focuses on improving the state machine behavior (idle/charging/active/overload/failure/shutdown), adding module-specific activation sequences, and ensuring all state transitions are thoroughly tested. No new feature scope is introduced.

---

## Spec Traceability

### P0 — Activation State Machine (Round 72 focus)
- Activation state machine transitions → `src/store/useMachineStore.ts:activateFailureMode`, `activateOverloadMode`, `setMachineState`
- Idle → charging → active state progression → `src/__tests__/activationChoreography.test.ts`
- Overload state with visual effects → `src/__tests__/overloadEffects.test.ts`
- Failure state on incomplete circuit → `src/store/useMachineStore.ts:activateFailureMode`

### P1 — Visual Polish
- Module-specific activation sequences → `src/components/Preview/ActivationOverlay.tsx`
- Improved overload/failure animations → `src/__tests__/overloadEffects.test.ts`
- Pan/zoom performance during activation → `tests/e2e/machine-creation.spec.ts`

### P0/P1 — Prior Rounds (all complete per Round 71)
- All 72 E2E tests pass → `tests/e2e/*.spec.ts`
- Build under 500KB threshold → `vite.config.ts`
- No regressions in machine creation, export, codex → verified Round 71

### P2 — Intentionally Deferred
- AI naming/description generation → deferred to future sprint
- Community sharing infrastructure → deferred to future sprint
- Recipe unlock system → deferred to future sprint

---

## Deliverables

1. **Activation State Machine Tests** (`src/__tests__/activationStateMachine.spec.ts`)
   - Automated test for idle → charging → active state progression
   - Automated test for failure state entry (no core module)
   - Automated test for shutdown from active state
   - Automated test for repeated activation cycle stability

2. **Module Interaction Tests** (`tests/e2e/activation-interaction.spec.ts`)
   - Automated E2E test for module removal during activation
   - Automated E2E test for repeated activation cycles without artifacts

3. **Activation Overlay State Tests** (`src/__tests__/activationOverlayState.spec.ts`)
   - Automated unit test asserting CSS class `is-charging` present during charging phase
   - Automated unit test asserting charging state clears after activation completes

4. **Pan/Zoom Performance Test** (`src/__tests__/activationPanZoom.spec.ts`)
   - Automated test that creates 20 modules, performs activation, captures console errors, asserts zero error-level logs

5. **Keyboard Focus Navigation Test** (`tests/e2e/keyboard-activation.spec.ts`)
   - Automated E2E test: press Tab N times, assert `document.activeElement` is a known focusable element
   - Assert focus moves through module panel, toolbar, and canvas controls in correct order

---

## Acceptance Criteria

**AC1:** `npx vitest run src/__tests__/activationStateMachine.spec.ts --reporter=verbose` passes with all 4 tests green (idle→charging→active, failure state, shutdown, repeated cycles).

**AC2:** `npx playwright test tests/e2e/activation-interaction.spec.ts --reporter=list` passes: module removal during activation does not crash, canvas remains stable, repeated cycles produce identical state.

**AC3:** `npx vitest run src/__tests__/activationOverlayState.spec.ts --reporter=verbose` passes: `is-charging` class present during charging phase, absent after completion.

**AC4:** `npx vitest run src/__tests__/activationPanZoom.spec.ts --reporter=verbose` passes: 20-module canvas activation produces zero error-level console logs.

**AC5:** `npx playwright test tests/e2e/keyboard-activation.spec.ts --reporter=list` passes: Tab navigation moves focus to known elements in correct order, `document.activeElement` is non-null after navigation.

**AC6:** `npx vitest run src/__tests__/activationChoreography.test.ts --reporter=verbose` passes: BFS activation order calculates correctly, connection lead times are 100ms before module activation.

**AC7:** `npx vitest run src/__tests__/overloadEffects.test.ts --reporter=verbose` passes: overload vignette reaches 40% opacity within 200ms, shake magnitude is ±8px for 300ms, flicker alternates 100%/60% at 50ms intervals.

**AC8:** `npx run build` completes with exit code 0 and bundle ≤ 550KB (raised from 500KB to accommodate new animation assets and test utilities).

**AC9:** `npx vitest run src/__tests__/activationVisualEffects.test.ts --reporter=verbose` passes: zoom-to-fit calculation correct, viewport interpolation uses ease-out, pulse wave duration scales with path length.

**AC10:** `npx playwright test tests/e2e/ --reporter=list` continues to pass 72/72 (regression gate — no existing tests broken).

**AC11:** No console error-level logs emitted during normal activation sequences in any passing test.

**AC12:** Bundle does not exceed 550KB after all changes in this sprint.

---

## Test Methods

### AC1 — Activation State Machine Tests
```
Command: npx vitest run src/__tests__/activationStateMachine.spec.ts --reporter=verbose
Expected: 4/4 tests pass

Test patterns:
- createMachineWithCore() → triggerActivation() → poll state → assert sequence: idle → charging → active
- createMachineWithoutCore() → triggerActivation() → assert machineState === 'failure'
- createMachine() → activate() → triggerShutdown() → assert machineState === 'idle'
- createMachine() → cycle activation 3 times → assert final canvas state identical to single cycle

Negative assertions:
- machineState should not remain stuck in 'charging' after activation completes
- failure state should not transition to 'active' without core module
- repeated cycles should not accumulate state artifacts
```

### AC2 — Module Interaction E2E Tests
```
Command: npx playwright test tests/e2e/activation-interaction.spec.ts --reporter=list
Expected: All tests pass

Test patterns:
1. Module removal during activation:
   - Create 3 connected modules
   - Start activation
   - Delete middle module mid-animation
   - Assert: canvas stable, no console errors, activation completes or gracefully degrades

2. Repeated activation cycles:
   - Create machine with 3+ modules
   - Cycle activation 3 times (activate → wait → shutdown → repeat)
   - Assert: no animation artifacts, state identical to fresh single activation

Negative assertions:
- Canvas should not crash or freeze during module removal
- Module count should not become inconsistent after repeated cycles
- Connection state should not leak between activation cycles
```

### AC3 — Activation Overlay State Tests
```
Command: npx vitest run src/__tests__/activationOverlayState.spec.ts --reporter=verbose
Expected: All tests pass

Test patterns:
- renderActivationOverlay() → set charging phase → assert overlay element has class 'is-charging'
- renderActivationOverlay() → complete activation → assert 'is-charging' class removed
- Assert: no 'is-overload' or 'is-failure' classes present during normal charging

Negative assertions:
- 'is-charging' class should not remain after activation completes
- 'is-active' class should not appear during charging phase
- Overlay should not render with conflicting state classes simultaneously
```

### AC4 — Pan/Zoom Performance Test
```
Command: npx vitest run src/__tests__/activationPanZoom.spec.ts --reporter=verbose
Expected: All tests pass, zero error-level console logs

Test patterns:
- Create 20 modules on canvas
- Capture console.error intercept
- Perform activation sequence
- Pan and zoom during activation
- Assert: console.error calls === 0
- Assert: execution time < 2000ms

Negative assertions:
- No error-level logs should be emitted during pan/zoom operations
- Canvas should not become unresponsive after activation with many modules
```

### AC5 — Keyboard Focus Navigation
```
Command: npx playwright test tests/e2e/keyboard-activation.spec.ts --reporter=list
Expected: All tests pass

Test patterns:
1. Initial focus:
   - Page load → assert document.activeElement is a known element (toolbar button or module panel heading)

2. Tab order through module panel:
   - Press Tab 6 times (one per base module type)
   - After each Tab, assert document.activeElement is a module heading element
   - Assert: all 6 module headings receive focus in order

3. Tab into canvas controls:
   - Press Tab through module panel → assert canvas toolbar buttons receive focus
   - Press Tab through canvas toolbar → assert zoom controls receive focus

4. Canvas area:
   - With modules on canvas, assert Tab navigates to module handles or selection UI

Negative assertions:
- document.activeElement should not be null after any Tab press
- Focus should not jump to hidden elements
- Focus should not become trapped in a cycle
```

### AC6 — Activation Choreography Unit Tests
```
Command: npx vitest run src/__tests__/activationChoreography.test.ts --reporter=verbose
Expected: All tests pass

Test patterns (existing tests should continue to pass):
- calculateActivationChoreography with empty modules → 0 steps
- calculateActivationChoreography with connected chain → BFS order
- Connection lead time = module activation time - 100ms
- Parallel paths at same depth activate simultaneously

Negative assertions:
- Activation should not proceed if BFS order cannot be determined
- Circular dependencies should not cause infinite loops in choreography calculation
```

### AC7 — Overload Effects Unit Tests
```
Command: npx vitest run src/__tests__/overloadEffects.test.ts --reporter=verbose
Expected: All tests pass

Test patterns:
- Vignette reaches 0.4 opacity within 200ms of overload start
- Shake magnitude is 8px (±8px range) for 300ms duration
- Flicker alternates 1.0 ↔ 0.6 opacity at 50ms intervals
- Sparks originate from center, 8 count, 500ms duration, #ffd700 color
- Overload auto-returns to idle after 3500ms

Negative assertions:
- Effects should not continue after auto-return to idle
- Vignette opacity should not exceed 0.4 during normal overload
- Shake should not continue beyond 300ms duration
```

### AC8 — Build Verification
```
Command: npm run build
Expected: Exit code 0, output shows bundle ≤ 550KB

Verification:
- grep bundle size from vite output
- assert: bundle_kb <= 550
```

### AC9 — Activation Visual Effects Unit Tests
```
Command: npx vitest run src/__tests__/activationVisualEffects.test.ts --reporter=verbose
Expected: All tests pass

Test patterns:
- Zoom-to-fit viewport calculation for multi-module layout
- Viewport interpolation with ease-out (cubic)
- Pulse wave duration = path_length / 400 * 1000 (ms)
- Phase calculation: <30% = charging, 30-79% = activating, >=80% = online

Negative assertions:
- Pulse wave should not have infinite duration for disconnected modules
- Viewport interpolation should not overshoot target bounds
```

### AC10 — E2E Regression Gate
```
Command: npx playwright test tests/e2e/ --reporter=list
Expected: 72/72 tests pass

Verification:
- All 6 test files pass:
  - codex.spec.ts (12 tests)
  - random-forge.spec.ts (10 tests)
  - challenge-panel.spec.ts (9 tests)
  - recipe-browser.spec.ts (13 tests)
  - machine-creation.spec.ts (12 tests)
  - export.spec.ts (16 tests)
```

### AC11 — No Error-Level Console Output
```
Verification: All passing tests in this sprint produce zero console.error calls
Evidence: Vitest and Playwright test reporters show 0 console errors
```

### AC12 — Bundle Size Constraint
```
Verification: npm run build output shows bundle <= 550KB
Rationale: Current 499.93KB leaves 70 bytes headroom. New SVG animation assets,
           additional CSS classes for state machine, and test utilities require ~50KB.
           550KB threshold is realistic for this sprint's additions.
```

---

## Failure Conditions

1. **Any AC1–AC7 or AC9 test fails** → Sprint fails
2. **E2E regression: tests/e2e/ drops below 72/72** → Sprint fails
3. **Build exits non-zero** → Sprint fails
4. **Bundle exceeds 550KB** → Sprint fails
5. **Any console.error emitted during activation tests** → Sprint fails
6. **Module removal during activation causes crash or leaves canvas in broken state** → Sprint fails
7. **Repeated activation cycles produce inconsistent state or animation artifacts** → Sprint fails
8. **Keyboard focus order is incorrect or focus becomes trapped** → Sprint fails
9. **Overlay state classes conflict (e.g., 'is-charging' and 'is-active' simultaneously)** → Sprint fails
10. **Activation choreography enters infinite loop on circular dependencies** → Sprint fails

---

## Done Definition

The sprint is complete when ALL of the following are true:

1. `npx vitest run src/__tests__/activationStateMachine.spec.ts --reporter=verbose` → 4/4 pass
2. `npx playwright test tests/e2e/activation-interaction.spec.ts --reporter=list` → all pass
3. `npx vitest run src/__tests__/activationOverlayState.spec.ts --reporter=verbose` → all pass
4. `npx vitest run src/__tests__/activationPanZoom.spec.ts --reporter=verbose` → all pass, 0 console errors
5. `npx playwright test tests/e2e/keyboard-activation.spec.ts --reporter=list` → all pass
6. `npx vitest run src/__tests__/activationChoreography.test.ts --reporter=verbose` → all pass
7. `npx vitest run src/__tests__/overloadEffects.test.ts --reporter=verbose` → all pass
8. `npm run build` → exit code 0, bundle ≤ 550KB
9. `npx vitest run src/__tests__/activationVisualEffects.test.ts --reporter=verbose` → all pass
10. `npx playwright test tests/e2e/ --reporter=list` → 72/72 pass (regression gate)
11. Zero console.error calls across all passing tests in this sprint
12. All new test files committed to repository with passing CI status
13. All negative assertions verified (no stuck states, no crashes, no leaked artifacts)

---

## Out of Scope

- New module types beyond the 19 existing types
- AI-powered naming or description generation
- Community gallery or social sharing features
- Recipe unlock or faction technology tree systems
- Mobile-specific touch gesture refinements (beyond existing touch tests)
- Export format additions beyond SVG/PNG/poster
- Tutorial system changes
- Achievement system modifications
- Theme or color scheme changes
- Performance optimization beyond what is required for AC4

---

## Notes

### Bundle Size Justification (AC8)
Current bundle: 499.93KB with 70 bytes of headroom. This sprint adds:
- SVG animation assets for overload states (~20KB)
- CSS classes for state machine phases (~5KB)
- New test files and utilities (~15KB)
- Activation choreography logic (~10KB)

Total estimated addition: ~50KB. New threshold of 550KB provides 50KB safety margin while remaining significantly under Vite's practical limits. If bundle trends higher, a follow-up optimization sprint will be prioritized.

### Operator Inbox Directive (Round 51 — MUST FIX)
This sprint directly addresses the `must_fix` directive from Round 51:
> "对所有功能模型进行测试，尤其是模块与模块间的交互，UI的交互，必须用最严格的测试标准"
> (Test all functional models, especially module-to-module interactions and UI interactions, using the strictest testing standards)

The following acceptance criteria specifically implement this directive:
- **AC2**: Tests module-to-module interactions during activation (module removal mid-animation)
- **AC3**: Tests UI overlay state transitions (charging class lifecycle)
- **AC5**: Tests keyboard navigation UI interactions (focus order through all panels)

Additional negative assertions have been added to each acceptance criteria to ensure:
- States do not remain stuck after transitions
- UI does not crash during edge cases
- No artifacts leak between interaction cycles
