# Sprint Contract — Round 160

## Scope

This sprint enhances the Challenge System with a Circuit Validation framework that allows players to validate their circuits against specific challenge objectives. Building on the Timing Diagram enhancement from Round 159, this adds objective types, validation engine, and visual feedback.

## Spec Traceability

### P0 Items (Must Complete)
- **Challenge Validation Engine** — Validate circuits against objectives
- **Objective Types** — Output reach, component minimization, timing requirements
- **Validation UI Feedback** — Visual indicators for pass/fail/in-progress

### P1 Items (Should Complete)
- **Challenge Progress Persistence** — Save validation state per challenge
- **Partial Credit Scoring** — Score based on how many objectives met

### P0/P1 Items Remaining from Prior Rounds
- All P0/P1 from Round 159 completed (Timing Diagram waveforms with 17+ tests per criterion, 6 distinct signal colors, clock period markers at 8-unit intervals, signal transition alignment)
- Exchange system fully implemented with 550+ tests

### P2 Items Intentionally Deferred
- Leaderboard integration (backend required)
- Time-trial mode scoring
- Challenge sharing/export
- Partial credit scoring (P1 item deferred due to test coverage gaps identified in review)

---

## EXISTING FILE CONFLICTS (Must Resolve Before Implementation)

The following files already exist with unrelated content. The implementation MUST NOT silently overwrite them. Choose one of the two resolution strategies for each:

| Existing File | Current Purpose | Conflict | Required Resolution |
|---|---|---|---|
| `src/utils/circuitValidator.ts` | Machine circuit validation (cycle/island/energy flow — Round 112) | New deliverable uses same path with different types | **RENAME to `src/utils/challengeValidator.ts`** — New validator targets challenge objectives, completely separate from machine circuit validation |
| `src/types/challenge.ts` | TimeTrial types (Round 86) + ChallengeCompletion (Round 86) | New deliverable uses same path with different types | **ADD new types alongside existing ones** — Use distinct type names: `ChallengeObjective`, `ValidationResult`, `ObjectiveType` appended to existing file |

**Contract will not be approved until file conflict resolution is explicitly stated in the contract below.**

**File Conflict Resolution Confirmed:**
- ✅ New validator renamed to `src/utils/challengeValidator.ts` (avoids overwriting machine circuit validator)
- ✅ New types added to `src/types/challenge.ts` with distinct names: `ChallengeObjective`, `ValidationResult`, `ObjectiveType`, `PartialCreditResult`

---

## Deliverables

1. **`src/utils/challengeValidator.ts`** — Core validation engine with objective checking
2. **`src/types/challenge.ts`** — Extended with `ChallengeObjective`, `ValidationResult`, `ObjectiveType`, `PartialCreditResult` types
3. **`src/store/useChallengeValidatorStore.ts`** — Zustand store for validation state
4. **`src/components/Challenge/ChallengeObjectives.tsx`** — Objective panel showing requirements
5. **`src/components/Challenge/ValidationOverlay.tsx`** — Visual feedback overlay for validation
6. **`src/__tests__/challengeValidator.test.ts`** — 150+ tests for validation engine
7. **Challenge panel integration** — Objectives tab in ChallengePanel

---

## Acceptance Criteria

1. **AC-160-001: Output Validation** — Challenge can specify required output state (HIGH/LOW on specific outputs). Validation returns pass when circuit produces correct output after simulation.

2. **AC-160-002: Component Count Validation** — Challenge can specify maximum component count. Validation returns pass when circuit uses ≤ specified components.

3. **AC-160-003: Timing Requirement Validation** — Challenge can specify signal timing requirements with defined tolerances:
   - **Clock period tolerance: ±2 units** — Valid if actual period is within ±2 of expected
   - **Edge alignment tolerance: ±1 unit** — Valid if transition occurs within ±1 of expected step
   - **Delay constraint tolerance: ±1 unit** — Valid if signal delay is within ±1 of maximum
   
   Validation fails when timing exceeds specified tolerances.

4. **AC-160-004: Visual Feedback** — Validation results shown in UI: green checkmark for pass, red X for fail, yellow spinner for in-progress. Objective panel updates in real-time during simulation.

5. **AC-160-005: Test Count Threshold** — `npm test -- --run` shows ≥ 6839 passing tests (baseline 6689 + 150 new minimum).

---

## Test Methods

### AC-160-001 (Output Validation)
- Run: `npm test -- --run src/__tests__/challengeValidator.test.ts`
- Check: Tests named "should validate correct output" and "should fail for incorrect output"
- Verify: 10+ tests covering HIGH/LOW output combinations
- **Required negative cases:**
  - `should return fail when output is HIGH but LOW expected`
  - `should return fail when circuit produces undefined output`
  - `should return error for empty circuit against output objective`

### AC-160-002 (Component Count)
- Run: Same test file
- Check: Tests named "should pass with fewer components" and "should fail with too many components"
- Verify: 8+ tests covering boundary conditions
- **Required negative cases:**
  - `should return error for null circuit input`
  - `should return error for undefined component list`

### AC-160-003 (Timing Requirements)
- Run: Same test file
- Check: Tests named with explicit tolerance values:
  - "should validate timing within ±2 units period tolerance"
  - "should fail when period exceeds ±2 units tolerance"
  - "should validate edge alignment within ±1 unit tolerance"
  - "should fail when edge exceeds ±1 unit tolerance"
  - "should validate delay within ±1 unit tolerance"
  - "should fail when delay exceeds ±1 unit tolerance"
- Verify: 12+ tests for clock periods, delays, edge alignment with all tolerance cases
- **Required negative cases:**
  - `should return fail when clock period exceeds maximum (±2 units)`
  - `should return error for malformed timing trace data`
  - `should return error when signal trace is empty`

### AC-160-004 (Visual Feedback)
- Run: `npm test -- --run src/__tests__/ChallengeObjectives.test.tsx`
- Check: ChallengeObjectives.tsx renders objective status icons using React Testing Library
- Verify: Component has `data-testid` attributes for "objective-item-{id}" and status indicators
- Use `act()` wrapping for state transition tests
- **Required state transitions to test:**
  - Objective panel shows in-progress spinner during simulation
  - Objective panel shows green checkmark after successful validation
  - Objective panel shows red X after failed validation
  - Objective panel returns to idle state when overlay is dismissed
- **Required negative cases:**
  - `should not crash when objective list is empty`
  - `should not render stale status after circuit reset`
  - `should not show checkmark before validation runs`

### AC-160-005 (Test Count)
- Run: `npm test -- --run`
- Check: Output shows "Tests X passed" where X ≥ 6839

---

## Partial Credit Scoring (P1 — Deferred to P2)

**Decision: DEFERRED**

Partial credit scoring is moved from P1 to P2 based on review feedback indicating:
- No test coverage was defined for this feature
- Core validation engine takes priority for this sprint
- Partial credit can be added once basic validation is stable

This P1 item is NOT dropped — it is explicitly deferred to allow focused completion of P0 validation work this sprint.

---

## Failure Conditions

1. Bundle exceeds 512 KB limit
2. TypeScript compilation errors
3. Test count below 6839 threshold
4. Any critical UI crash in validation flow
5. AC-160-001 through AC-160-004 not passing
6. **Validator throws on null/undefined circuit input** — Must handle gracefully with error result
7. **Visual overlay crashes when shown with empty objective list** — Must show empty state, not crash
8. **Store transitions to invalid state** (e.g., "passed" + "failed" simultaneously) — State machine must be mutually exclusive
9. **Validation results persist after circuit reset** — State must clear on circuit modification

---

## Done Definition

Exact conditions that must be true:

- [ ] `src/utils/challengeValidator.ts` exists with `validateCircuit(objectives, circuit)` and `scoreCircuit(circuit, objectives)` functions
- [ ] `src/types/challenge.ts` defines `ChallengeObjective`, `ValidationResult`, `ObjectiveType` types
- [ ] `src/store/useChallengeValidatorStore.ts` manages validation state with mutually exclusive transitions: `idle → validating → passed | failed → idle`
- [ ] `src/components/Challenge/ChallengeObjectives.tsx` renders objectives with status icons
- [ ] `src/components/Challenge/ValidationOverlay.tsx` provides visual feedback
- [ ] `src/__tests__/challengeValidator.test.ts` has ≥150 tests including negative/error cases
- [ ] `npm run build` succeeds with bundle < 512 KB
- [ ] `npx tsc --noEmit` exits with code 0
- [ ] `npm test -- --run` shows ≥ 6839 passing tests
- [ ] All 5 acceptance criteria verified
- [ ] **File conflict resolution confirmed** — new files renamed/merged as specified above
- [ ] **Partial credit scoring documented as deferred P2** — not dropped, just postponed

---

## Out of Scope

- Backend/leaderboard integration
- Time-trial scoring system
- Community challenge sharing
- Cross-user challenge validation
- Circuit optimization suggestions
- AI-powered circuit generation
- Partial credit scoring (moved to P2)
