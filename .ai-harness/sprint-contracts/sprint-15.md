# Sprint Contract — Round 15

## Scope

**Remediation Sprint**: Fix the flaky `particleSystem.test.ts` test that fails intermittently due to comparing the wrong particle's age.

The test `should update particle age over time` compares `particles2[0].age >= particles1[0].age`, but `particles2[0]` may be a different particle than `particles1[0]` since particles are continuously emitted and can die between updates. This causes intermittent failures when array index 0 references a different particle.

---

## Spec Traceability

### P0 items covered this round
- None (remediation sprint for test reliability)

### P1 items covered this round
- None (remediation sprint for test reliability)

### Remaining P0/P1 after this round
- All P0/P1 items remain from previous rounds

### P2 intentionally deferred
- All P2 items remain deferred

---

## Deliverables

1. **Fixed `src/__tests__/particleSystem.test.ts`**
   - The `should update particle age over time` test will track a specific particle by ID instead of comparing array index 0 across different update calls
   - Test uses longer particle lifetime (2-3s minimum) to ensure the tracked particle survives between update calls
   - Test verification: Run test 5 consecutive times to confirm stability

---

## Acceptance Criteria

1. **AC1**: `npm test -- src/__tests__/particleSystem.test.ts` passes all particleSystem tests in a single run
2. **AC2**: The `should update particle age over time` test verifies the SAME particle's age increases over time by tracking particle ID (not array index)
3. **AC3**: `npm test` passes all 915 tests with no failures (914 existing + 1 fixed flaky test)
4. **AC4**: `npm run build` succeeds with 0 TypeScript errors
5. **AC5**: Stability verification: Run `npm test -- src/__tests__/particleSystem.test.ts` 5 times consecutively with all runs passing

---

## Test Methods

1. **AC1 Verification**: Run `npm test -- src/__tests__/particleSystem.test.ts` and verify all 22 tests pass
2. **AC2 Verification**: Code review confirms the test extracts a specific particle ID after first update, then filters for that particle in subsequent updates (not array index lookup)
3. **AC3 Verification**: Run `npm test` and verify 915/915 tests pass (baseline before fix was 914 due to flaky particleSystem test)
4. **AC4 Verification**: Run `npm run build` and verify exit code 0 with 0 TypeScript errors
5. **AC5 Verification**: Run `npm test -- src/__tests__/particleSystem.test.ts` exactly 5 times in sequence, counting passes

---

## Risks

1. **Low Risk**: The fix is isolated to a single test case in the test file only
2. **Low Risk**: No production code changes required
3. **Medium Risk**: Test may still be timing-sensitive if particle lifetime is too short — mitigated by using 2-3s lifetime

---

## Failure Conditions

1. The `should update particle age over time` test fails in any single run
2. Any new test failures are introduced by the change
3. Total test count drops below 915 (after fix) or shows fewer than 915 tests
4. Build fails with TypeScript errors
5. The test still uses array index comparison instead of particle ID tracking

---

## Done Definition

ALL of the following must be true:
- `npm test -- src/__tests__/particleSystem.test.ts` passes all 22 tests in a single run
- `npm test` passes all 915 tests with 0 failures
- `npm run build` succeeds with 0 TypeScript errors
- The `should update particle age over time` test uses particle ID tracking (not array index comparison)
- The fixed test passes 5 consecutive runs

---

## Out of Scope

- No production code changes
- No new features
- No new modules
- No UI/UX changes
- No test infrastructure changes (e.g., mocking framework changes)
- Fixing any other flaky tests beyond particleSystem.test.ts

---

**APPROVED**
