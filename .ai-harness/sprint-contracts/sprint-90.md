# Sprint Contract — Round 90

## Scope

Fix the build compliance test environment isolation issue where running `npm run build` via `execSync` inside Vitest produces a larger bundle (1016KB) than running the build directly (534KB). The round 89 threshold fix (560KB) is correct; the test verification methodology is broken.

**This is a remediation sprint. No new features. No spec changes.**

## Spec Traceability

> ⚠️ **Spec note:** `spec.md` contains ~90% injected content (Arcane Machine Codex Workshop project). The only valid specification items traceable to this workspace are the build compliance threshold (≤560KB per QA round 89) and the existing 141 test files / 3178 test baseline.

- **P0 items covered this round:**
  - Build compliance test isolation from Vitest environment effects
  - Test count recovery (3177 → 3178 tests passing)

- **P1 items covered this round:**
  - None — remediation sprint

- **Remaining P0/P1 after this round:**
  - None related to build compliance

- **P2 intentionally deferred:**
  - All injected spec items in spec.md (Arcane Machine Codex Workshop features)

## Deliverables

1. **Modified `src/__tests__/functional/buildCompliance.test.ts`**
   - Build test runs in isolated Node.js subprocess with clean module state
   - Clears Vitest/esbuild/Vite cache before build verification
   - Uses `spawnSync` or `execSync` with explicit clean environment
   - Produces consistent bundle size regardless of test runner context
   - All 141 test files pass, 3178 total tests pass

2. **Test isolation implementation**
   - Explicit cache clearing: `.vite` directory, `node_modules/.cache`, any esbuild cache
   - Clean environment variables passed to subprocess
   - Fresh Node.js process for build verification

3. **`npx vitest run src/__tests__/functional/buildCompliance.test.ts` passes** with main bundle (index-*.js, not vendor-*) ≤560KB

## Acceptance Criteria

1. **AC-BUILD-001:** Main entry bundle (index-*.js, excluding vendor-*) measured inside Vitest test is ≤560KB

2. **AC-BUILD-ISOLATION-001:** Build compliance test uses isolated subprocess with cleared caches (`.vite`, esbuild cache, Vite cache) before executing build command

3. **AC-BUILD-SIZE-001:** Direct `npm run build` continues to produce main bundle ≤560KB (regression prevention)

4. **AC-TEST-COMPLIANCE-001:** Test file explicitly uses `BUNDLE_SIZE_LIMIT = 560 * 1024` (no hardcoded 1100KB threshold remains)

5. **AC-TEST-STABILITY-001:** All 141 test files pass, all 3178 tests pass — recovering from the 3177/3178 regression in round 89

## Test Methods

1. **Isolation + Size Test (AC-BUILD-001, AC-BUILD-ISOLATION-001):**
   ```bash
   npx vitest run src/__tests__/functional/buildCompliance.test.ts
   ```
   - Verify test exits code 0
   - Verify main bundle (index-*.js, not vendor-react-*) reported ≤560KB
   - Verify `grep "1100" src/__tests__/functional/buildCompliance.test.ts` returns no matches
   - Verify test file contains cache clearing logic (grep for ".vite", "cache", or similar)

2. **Full Stability Test (AC-TEST-STABILITY-001):**
   ```bash
   npx vitest run
   ```
   - Verify exit code 0
   - Verify 141 test files pass
   - Verify 3178 total tests pass (recovering from 3177/3178 in round 89)
   - No test regressions introduced by this round's changes

3. **Direct Build Regression (AC-BUILD-SIZE-001):**
   ```bash
   npm run build && ls -la dist/assets/index-*.js
   ```
   - Verify main bundle ≤560KB
   - Verify exit code 0

4. **Bundle Size Consistency Check:**
   - Compare main bundle size from Vitest test vs direct `npm run build`
   - Difference should be <5% (not 534KB vs 1016KB as in round 89)

## Risks

1. **Risk: esbuild transform caching** — Vitest may cache esbuild transforms that affect subsequent builds
   - **Mitigation:** Clear `.vite` cache, `node_modules/.cache`, and any esbuild cache before build in test

2. **Risk: Wrong bundle file parsed** — Test regex may match vendor bundle instead of main entry bundle, causing false pass/fail
   - **Mitigation:** Parse specifically for `index-*.js` (non-vendor) in build output; add explicit size check on the correct file

3. **Risk: Node module resolution differences** — Vitest's module resolution may differ from direct npm
   - **Mitigation:** Use `spawnSync` with explicit PATH and clean environment variables, or fork fresh process

4. **Risk: Test fragility** — Over-aggressive cache clearing may slow down tests
   - **Mitigation:** Only clear cache within build compliance test, not globally

5. **Risk: Timing issues** — Race conditions in cache clearing
   - **Mitigation:** Add synchronous file system operations with proper error handling

## Failure Conditions

1. **FC-001:** Build compliance test produces main bundle >560KB when run inside Vitest
2. **FC-002:** Test count drops below 3178 (141 test files, 3178 total tests passing)
3. **FC-003:** Direct `npm run build` produces main bundle >560KB (regression)
4. **FC-004:** Hardcoded 1100KB threshold found in test file
5. **FC-005:** Bundle size inconsistency between Vitest test and direct build exceeds 10%
6. **FC-006:** Test file does not contain explicit cache clearing logic before build

## Done Definition

All of the following must be true:

1. `grep "1100" src/__tests__/functional/buildCompliance.test.ts` returns no matches
2. `grep -E "560 \* 1024|BUNDLE_SIZE_LIMIT" src/__tests__/functional/buildCompliance.test.ts` returns ≥1 match
3. `npm run build` produces main bundle (index-*.js) ≤560KB and exits code 0
4. `npx vitest run src/__tests__/functional/buildCompliance.test.ts` exits with code 0, reporting main bundle ≤560KB
5. `npx vitest run` shows 141 test files passing, 3178 total tests passing
6. Main bundle size difference between Vitest test and direct build is <5%
7. `grep -E "\.vite|cache|clear" src/__tests__/functional/buildCompliance.test.ts` returns ≥1 match (cache clearing present)
8. `grep "1016" src/__tests__/functional/buildCompliance.test.ts` returns no matches (no hardcoded workaround values)

## Out of Scope

- No new features or spec changes
- No changes to the actual application code (only test infrastructure)
- No changes to bundle size threshold (remains 560KB)
- No changes to application functionality
- No UI modifications
- All injected spec items from spec.md (Arcane Machine Codex Workshop project)
