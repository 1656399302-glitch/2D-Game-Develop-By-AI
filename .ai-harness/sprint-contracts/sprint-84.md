APPROVED

# Sprint Contract — Round 84

## Scope

**Quality Sprint:** Fix the pre-existing flaky test in `randomGeneratorEnhancement.test.ts` (line 111) and perform minor polish on the random generator feature to ensure test stability. No new features, no scope expansion.

## Spec Traceability

### P0 items covered this round
- **AC1:** Flaky test in `randomGeneratorEnhancement.test.ts` line 111 must be fixed so test passes consistently in both isolation and full suite

### P1 items covered this round
- **AC2:** Random generator should produce stable, reproducible results in automated tests

### Remaining P0/P1 after this round
- None — Round 83 remediation was completed successfully
- All Phase 2 deliverables (D1-D10) integrated and verified

### P2 items intentionally deferred
- AI text generation integration improvements
- Community sharing features
- Faction tech tree expansion
- Challenge mode enhancements

## Deliverables

1. **`src/__tests__/randomGeneratorEnhancement.test.ts`** — Fixed: line 111 flaky test must be analyzed, root cause identified, and fixed so test passes consistently
2. **Optional: `src/utils/randomGeneratorUtils.ts`** or related helper — Stabilization if needed for test reliability

## Acceptance Criteria

1. **AC1-FIX:** `randomGeneratorEnhancement.test.ts` line 111 test passes consistently when run both in isolation AND in the full test suite
2. **AC1-STABLE:** Running `npx vitest run` 3 times consecutively produces identical pass/fail results (no flaky failures)
3. **AC-REGRESSION:** All other 2917+ existing tests continue to pass without modification
4. **AC-BUILD:** `npm run build` exits 0, bundle ≤ 560 KB, 0 TypeScript errors
5. **AC-ISOLATION:** Running `npx vitest run src/__tests__/randomGeneratorEnhancement.test.ts` alone passes (this worked before; confirm it still works)

## Test Methods

### TM1: Full Suite Stability Test (PRIMARY)
```bash
# Run full test suite 3 times consecutively
npx vitest run
# Verify: Exit code 0, all tests pass
# Record: Any failures in randomGeneratorEnhancement.test.ts

npx vitest run
# Verify: Same exit code, same results (no new failures)

npx vitest run
# Verify: Same exit code, same results
```

**Pass:** All 3 runs produce identical results with no flaky failures.
**Fail:** If `randomGeneratorEnhancement.test.ts` fails in any of the 3 runs.

### TM2: Line 111 Specific Test
```bash
npx vitest run src/__tests__/randomGeneratorEnhancement.test.ts -t "test name at line 111"
```
**Pass:** Test at line 111 passes.
**Fail:** Test at line 111 fails.

### TM3: Isolation Test
```bash
npx vitest run src/__tests__/randomGeneratorEnhancement.test.ts
```
**Pass:** All tests in this file pass.
**Fail:** Any test in this file fails.

### TM4: Grep for Line 111 Content
```bash
sed -n '105,120p' src/__tests__/randomGeneratorEnhancement.test.ts
```
**Purpose:** Understand what the flaky test at line 111 actually tests

### TM5: Root Cause Analysis
1. Read the flaky test code
2. Identify why it fails in full suite but passes in isolation:
   - Timing issues (async/await gaps)
   - Shared state between tests
   - Random number generator seed issues
   - Mock/stub conflicts with other tests
   - Test isolation issues (shared localStorage, store state)
3. Apply appropriate fix based on root cause

### TM6: Build and Full Test Verification
```bash
npm run build
# Exit code 0, bundle < 560KB, 0 TypeScript errors

npx vitest run
# Exit code 0, 2917+ tests pass
```

## Risks

1. **Risk: Root cause is a timing/race condition** — Tests run faster in full suite, exposing race conditions invisible in isolation. Fix may require adding waits, mocking time, or restructuring async code.
2. **Risk: Fix may affect other tests** — Changes to shared state or utilities could break other tests. Mitigate by testing isolation and full suite.
3. **Risk: Fix is incorrect** — Adding `await` or `waitFor` without addressing real root cause. Mitigate by understanding actual failure mode.
4. **Risk: Flaky test is environment-dependent** — May pass in one environment but fail in another. Ensure fix is robust across different machine speeds.

## Failure Conditions

The round FAILS if ANY of these are true:

1. `randomGeneratorEnhancement.test.ts` line 111 still fails when run in full test suite
2. Any of the 3 consecutive `npx vitest run` executions produce different results
3. Any existing test (other than the one being fixed) fails after changes
4. Build fails (`npm run build` non-zero exit or > 560KB)
5. TypeScript errors appear
6. Fix introduces new flaky behavior in other tests

## Done Definition

All conditions must be TRUE before claiming round complete:

1. ✅ `randomGeneratorEnhancement.test.ts` line 111 identified and root cause analyzed
2. ✅ Root cause documented in code comments or test description
3. ✅ Test fixed with appropriate solution (await, mock, seed, isolation, etc.)
4. ✅ `npx vitest run` passes 3 consecutive times with identical results
5. ✅ `npx vitest run src/__tests__/randomGeneratorEnhancement.test.ts` passes in isolation
6. ✅ `npm run build` succeeds (0 errors, < 560KB)
7. ✅ All 2917+ tests pass without modification to other test files

## Out of Scope

The following are explicitly NOT part of this sprint:

- Any new features or components
- UI changes or visual polish
- Changes to random generator logic in production code
- Fixing other flaky tests (only the one in `randomGeneratorEnhancement.test.ts` line 111)
- Performance optimizations beyond the test fix
- Changes to module library, canvas, connections, or activation systems
- Export functionality changes
- Achievement system modifications
- Tutorial changes
- Faction system changes

## Root Cause Analysis Guide

The flaky test at line 111 in `randomGeneratorEnhancement.test.ts` may fail due to:

1. **Async timing issues** — Test doesn't properly wait for async operations
2. **Shared random seed** — Random generator state affected by previous tests
3. **Store state pollution** — Tests share Zustand store state
4. **Mock interference** — Mock implementations conflict between tests
5. **Timeout too short** — Test timeout insufficient in CI/full suite
6. **Test order dependency** — Test depends on side effects from earlier tests

**Recommended fixes (in order of preference):**
1. Ensure proper `await` for all async operations
2. Reset random generator seed before test
3. Clear store state in `beforeEach`
4. Use `vi.restoreAllMocks()` in `afterEach`
5. Increase test timeout if needed
6. Isolate test from dependencies on other tests
