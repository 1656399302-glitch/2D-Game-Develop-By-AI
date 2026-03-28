# Sprint Contract — Round 4

## Scope

**Enhancement sprint:** Expand the activation system with proper failure/overload simulation modes, improve visual effects, and add enhanced random generation with aesthetic control. No breaking changes to existing functionality.

---

## Spec Traceability

- **P0 items covered this round:** Activation state machine (idle, charging, active, overload, failure, shutdown) — enhanced with testable failure/overload modes
- **P1 items covered this round:** None (all P1 complete from previous rounds)
- **Remaining P0/P1 after this round:** None
- **P2 intentionally deferred:** AI naming integration, community features, challenge mode

---

## Deliverables

1. **`src/components/Preview/ActivationOverlay.tsx`** — Enhanced overlay with failure/overload mode simulation and Chinese UI text
2. **`src/components/Editor/Toolbar.tsx`** — Add "Test Failure Mode" and "Test Overload Mode" buttons to the toolbar
3. **`src/store/useMachineStore.ts`** — Add `activateFailureMode()` and `activateOverloadMode()` actions that:
   - Transition machine state to appropriate mode
   - Trigger corresponding visual effects
   - Auto-return to idle after sequence completes (3500ms)
4. **`src/__tests__/activationModes.test.ts`** — New test file validating:
   - `activateFailureMode()` triggers failure state
   - `activateOverloadMode()` triggers overload state
   - Both modes auto-return to idle (after 3500ms)
   - Machine attributes (failureRate) affect mode behavior
5. **`src/utils/randomGenerator.ts`** — Enhanced random generation with:
   - Configurable aesthetic constraints (min/max module count, connection rules)
   - No overlapping module positions
   - Minimum spacing of 80px between module centers
   - At least 1 connection for valid machines with 2+ modules
6. **SVG animation state definitions** — Add CSS/GSAP classes for:
   - `.failure-mode` — shake animation + red flicker
   - `.overload-mode` — pulse animation + screen shake
   - Both states defined in `src/styles/animations.css`

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | "Test Failure Mode" button exists in Toolbar | Button visible after component renders |
| 2 | "Test Overload Mode" button exists in Toolbar | Button visible after component renders |
| 3 | Clicking "Test Failure Mode" triggers failure animation sequence | Unit test: call `activateFailureMode()` → state === 'failure' |
| 4 | Clicking "Test Overload Mode" triggers overload animation sequence | Unit test: call `activateOverloadMode()` → state === 'overload' |
| 5 | Machine with high failureRate enters failure state faster | Test: set failureRate=0.9 → activate → state is 'failure' within 500ms |
| 6 | Failure mode displays Chinese error messages | Overlay text includes "系统过载" or "机器故障" |
| 7 | Overload mode displays Chinese warning messages | Overlay text includes "能量过载" or "临界警告" |
| 8 | Normal activation flow unchanged | Existing activation test still passes |
| 9 | Machine auto-returns to idle after failure sequence | Test: activateFailureMode() → wait 3500ms → state === 'idle' |
| 10 | Machine auto-returns to idle after overload sequence | Test: activateOverloadMode() → wait 3500ms → state === 'idle' |
| 11 | Random generator produces no overlapping modules | Test: generate 10 machines → no module pairs with distance < 80px |
| 12 | Random generator creates valid connections for 2+ modules | Test: generate machine with 3 modules → connections >= 1 |
| 13 | All existing 79 tests still pass | `npm test` shows 79+ passing |

---

## Test Methods

1. **Unit tests** — `activationModes.test.ts` validates:
   - Store actions trigger correct state transitions
   - Attribute-based timing behavior (failureRate affects time-to-failure)
   - Auto-return to idle behavior with `jest.useFakeTimers()`
2. **Random generator tests** — Validate aesthetic constraints:
   - Module position distances (minimum 80px between centers)
   - Connection validity rules (at least 1 connection for 2+ modules)
3. **Integration tests** — Button click → store action → state change
4. **Manual verification** — Run `npm run dev`, click test buttons, verify animations and Chinese text

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| New animation states may conflict with existing GSAP animations | Medium | Use separate animation contexts; test thoroughly |
| Test Failure/Overload buttons may confuse production users | Low | Label clearly as "Test" modes; auto-return prevents stuck states |
| Random generator may produce edge cases | Low | Validate output; test with 100+ iterations |
| Fake timers in tests may cause flakiness | Low | Use proper `act()` wrappers; test real timers separately |

---

## Failure Conditions

This round **MUST FAIL** if:

1. Any of the 13 acceptance criteria above fail
2. `npm run build` produces any errors
3. `npm test` has any failing tests (including existing 79)
4. Normal activation flow is broken by new modes
5. Machine gets stuck in failure/overload state and cannot reset
6. Random generator produces modules that overlap (distance < 80px)

---

## Done Definition

Exactly this must be true before claiming completion:

1. New `activationModes.test.ts` passes all test cases
2. "Test Failure Mode" button visible in Toolbar and triggers failure animation
3. "Test Overload Mode" button visible in Toolbar and triggers overload animation
4. All existing 79 tests still pass (`npm test`)
5. Build succeeds without errors (`npm run build`)
6. Normal activation (▶ Activate Machine) works exactly as before
7. Unit test confirms: `activateFailureMode()` → state='failure' → wait(3500ms) → state='idle'
8. Unit test confirms: `activateOverloadMode()` → state='overload' → wait(3500ms) → state='idle'
9. Random generator tests confirm no overlapping modules
10. Random generator tests confirm valid connections for multi-module machines

---

## Out of Scope

- Adding new module types (7 types already implemented)
- Changing undo/redo behavior (fixed in Round 3)
- Modifying the codex system
- Changing attribute generation logic (beyond failureRate/overloadRate effects on mode timing)
- Adding AI naming integration
- Community/social features
- Changing export functionality

---

## Revision History

- **Round 4** — Initial contract (this version)
  - Expanded acceptance criteria from 10 to 13
  - Clarified auto-return timing (3500ms) in deliverables and criteria
  - Specified random generator constraints (80px spacing, connection rules)
  - Added Chinese text verification criteria (criteria 6-7)
  - Added failureRate attribute timing test (criterion 5)
