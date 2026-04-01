APPROVED

# Sprint Contract — Round 89

## Scope

This is a remediation sprint focused on fixing the minor bug identified in Round 88 QA feedback:
- **Bug:** `buildCompliance.test.ts` line 47 uses incorrect 1100KB threshold instead of contract's 560KB requirement
- **QA Reference:** Round 88 QA Report → Minor Bug: Bundle Size Threshold Mismatch
- **Root Cause:** Test reports 1033.86KB (wrong) vs actual build 534.33KB (correct)
- **Fix:** Update threshold in `src/__tests__/functional/buildCompliance.test.ts` from `1100 * 1024` to `560 * 1024`

No new features will be introduced. No changes to UI, store logic, or additional test files.

## Spec Traceability

- **Bug Source:** Round 88 QA → Minor Bug: "Bundle Size Threshold Mismatch"
- **Affected Criterion:** AC-BUILD-001 from Round 88 (Bundle ≤560KB)
- **Verification:** Round 88 QA confirmed actual build at 534.33KB passes 560KB threshold; only test threshold was wrong
- **P0 items covered this round:** None — bug fix only
- **P1 items covered this round:** None

## Deliverables

1. **Fixed test file:** `src/__tests__/functional/buildCompliance.test.ts` with corrected 560KB threshold
   - Replace `expect(bundleSizeKB * 1024).toBeLessThan(1100 * 1024);` with `expect(bundleSizeKB * 1024).toBeLessThan(560 * 1024);`
   - Or preferably, use the existing constant: `expect(bundleSizeKB * 1024).toBeLessThan(BUNDLE_SIZE_LIMIT);`
2. **Verification:** Test suite confirms bundle passes at 560KB threshold
3. **Regression check:** All 3178 existing tests continue to pass

## Acceptance Criteria

1. **AC-BUILD-001:** Build succeeds with bundle size ≤560KB
2. **AC-TEST-STABILITY-001:** All existing tests continue to pass (minimum baseline: 3178 tests)
3. **AC-TEST-COMPLIANCE-001:** Build compliance test explicitly asserts `560 * 1024` (not `1100 * 1024`) as the threshold
4. **AC-TEST-PERF-001:** Test suite completes within acceptable variance of baseline (~21s)

## Test Methods

1. **AC-BUILD-001:**
   - Command: `npm run build`
   - Expected: Exit code 0, bundle size ≤560KB
   - Verification: Parse bundle size from output

2. **AC-TEST-STABILITY-001:**
   - Command: `npx vitest run`
   - Expected: All test files pass, total test count ≥3178

3. **AC-TEST-COMPLIANCE-001:**
   - Command: `grep -n "560" src/__tests__/functional/buildCompliance.test.ts`
   - Expected: Line contains `560 * 1024` or `BUNDLE_SIZE_LIMIT` referencing 560KB
   - Command: `grep "1100" src/__tests__/functional/buildCompliance.test.ts`
   - Expected: No matches (1100 threshold removed from assertion)
   - Additional: Verify the assertion in the "should have bundle size within acceptable range" test uses 560KB, not 1100KB

4. **AC-TEST-PERF-001:**
   - Command: `npx vitest run --reporter=json`
   - Expected: Duration ≤22s (within 1s variance of 21s baseline)

## Risks

1. **Test threshold regression risk:** The 1100KB threshold was intentionally relaxed to handle environment differences; changing to 560KB may cause false failures if build environment differs from production
   - Mitigation: Round 88 QA confirmed production build at 534.33KB, providing buffer to 560KB
2. **Build environment variance:** If build environment produces slightly larger bundles, test may fail
   - Mitigation: Actual bundle (534.33KB) is ~5% below threshold, providing margin

## Failure Conditions

1. Bundle size >560KB after build
2. Any existing test fails after threshold correction
3. Test file still contains `1100 * 1024` in the bundle size assertion after fix
4. Test file does not contain `560 * 1024` or `BUNDLE_SIZE_LIMIT` (referencing 560KB) after fix
5. Test suite duration exceeds 22 seconds

## Done Definition

All of the following must be true:

1. `grep "1100" src/__tests__/functional/buildCompliance.test.ts` returns no matches (except in comments/timeout values)
2. `grep -E "560 \* 1024|BUNDLE_SIZE_LIMIT" src/__tests__/functional/buildCompliance.test.ts` finds threshold assertion
3. `npm run build` succeeds with bundle ≤560KB
4. `npx vitest run` passes all tests (≥3178)
5. Test duration ≤22s

## Out of Scope

- All changes limited to fixing threshold in `buildCompliance.test.ts`
- No new features, UI changes, store modifications, or additional test files
