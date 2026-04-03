APPROVED

# Sprint Contract — Round 105

## Scope

Fix the test suite performance issue that is causing the suite to run in ~28s instead of the required ≤20s threshold. The only blocking issue from Round 104 is the vitest configuration and test execution speed.

## Spec Traceability

- **P0 (Critical Blockers):**
  - Reduce vitest test suite duration from ~28s to ≤20s

- **P1 (High Priority):**
  - Verify all 4,161 existing tests still pass after optimization
  - Ensure no regression in test coverage or correctness

- **Remaining P0/P1:** None — this is a targeted remediation sprint

- **P2 (Deferred):** All other work is deferred

## Deliverables

1. **Updated `vitest.config.ts`** — Optimized vitest configuration with improved parallelization settings
2. **Updated `package.json`** (if needed) — Any additional test runner optimization flags
3. **Verification output** — Test suite runs in ≤20s with all tests passing

## Acceptance Criteria

1. **AC-105-001:** Test suite completes in ≤20s (hard fail threshold)
2. **AC-105-002:** All 4,161 tests pass after optimization
3. **AC-105-003:** No reduction in test coverage or functionality
4. **AC-105-004:** TypeScript compilation remains clean (0 errors)

## Test Methods

1. **AC-105-001 Verification:**
   - Run `npm test` or `npx vitest run`
   - Measure total suite duration from output
   - Duration must be ≤20s

2. **AC-105-002 Verification:**
   - Count passed tests from vitest output
   - All 4,161 tests must show PASS status
   - No skipped, pending, or failed tests

3. **AC-105-003 Verification:**
   - Compare test file list before/after optimization
   - Ensure no tests were removed or commented out
   - Run subset tests to verify critical provider tests still execute

4. **AC-105-004 Verification:**
   - Run `npx tsc --noEmit`
   - Verify 0 TypeScript errors

## Risks

1. **Optimization may not achieve 20s target:** Some tests may be inherently slow
2. **Over-parallelization may cause flaky tests:** Race conditions under heavy parallel load
3. **Changing isolation settings may cause test interference:** State leakage between tests

## Failure Conditions

1. Test suite duration exceeds 20s
2. Any test fails (including pre-existing tests)
3. Test coverage decreases
4. TypeScript errors introduced
5. New runtime errors in tests

## Done Definition

The round is complete when ALL of the following are true:

1. `npx vitest run` completes in ≤20s
2. Output shows "4,161 passed" (or same count as before)
3. Output shows "0 failed"
4. `npx tsc --noEmit` returns 0 errors
5. Bundle size remains <560KB

## Out of Scope

- Any new feature development
- AI provider implementation (already complete)
- UI changes or visual improvements
- Code refactoring beyond performance optimization
- Test file additions or coverage expansion
- Any changes to source code (src/)

## Optimization Strategy (Recommended)

The feedback suggests trying these approaches in order:

1. Increase `maxWorkers` from 4 to 6-8
2. Add `pool: 'threads'` for better parallelization
3. Consider `isolateModules: false` if safe (verify no state leakage)
4. Review slowest test files for optimization opportunities
5. Use `testTimeout` adjustment if needed
6. Profile test collection phase (currently 16.58s) — may need to optimize imports or test discovery

## Verification Command

```bash
npx vitest run --reporter=verbose 2>&1 | tee test-output.txt
```

Then check duration from output and verify test counts.
