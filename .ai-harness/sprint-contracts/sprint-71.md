# Sprint Contract — Round 71

## Scope

**Goal:** Fix all 19 failing E2E tests across 4 spec files to achieve 100% pass rate (72/72). Application features verified working in Round 70 browser_test. This sprint addresses only test design flaws — no application code changes.

## Spec Traceability

### P0 Items — Must Fix This Round
- **codex.spec.ts**: Fix 7 failing tests (button states, wait conditions, locators)
- **random-forge.spec.ts**: Fix 5 failing tests (modal intercept, button clicks)
- **challenge-panel.spec.ts**: Fix 5 failing tests (dialog locators, visibility checks)
- **recipe-browser.spec.ts**: Fix 2 failing tests (close button, visibility assertions)

### P1 Items — Included in Pass Count (no additional scope)
- challenge-panel.spec.ts: P1 tests included in fix scope above
- recipe-browser.spec.ts: P1 tests included in fix scope above

### Remaining P0/P1 After This Round
- None — all P0/P1 features implemented and verified working in Round 70

### P2 Intentionally Deferred
- None — application is feature-complete

## Deliverables

1. **Fixed `tests/e2e/codex.spec.ts`**
   - 12/12 tests passing
   - Tests properly add modules before clicking save/load buttons
   - Tests wait for button enabled state before interaction
   - Tests handle disabled state correctly

2. **Fixed `tests/e2e/random-forge.spec.ts`**
   - 10/10 tests passing
   - Tests handle modal overlay with `force: true` or proper wait
   - Tests wait for modal close animation before proceeding
   - Tests verify button attributes correctly

3. **Fixed `tests/e2e/challenge-panel.spec.ts`**
   - 9/9 tests passing
   - Tests use correct selectors for actual UI structure (not assumed roles)
   - Tests handle tab/button elements with correct locators

4. **Fixed `tests/e2e/recipe-browser.spec.ts`**
   - 13/13 tests passing
   - Tests use Escape key or data-testid for close button
   - Tests verify select options with exact value matching

## Acceptance Criteria

1. **AC1**: `npx playwright test tests/e2e/codex.spec.ts --reporter=list` outputs **12 passed, 0 failed**
2. **AC2**: `npx playwright test tests/e2e/random-forge.spec.ts --reporter=list` outputs **10 passed, 0 failed**
3. **AC3**: `npx playwright test tests/e2e/challenge-panel.spec.ts --reporter=list` outputs **9 passed, 0 failed**
4. **AC4**: `npx playwright test tests/e2e/recipe-browser.spec.ts --reporter=list` outputs **13 passed, 0 failed**
5. **AC5**: `npx playwright test tests/e2e/ --reporter=list` outputs **72 passed, 0 failed** (all 6 spec files)
6. **AC6**: `npm run build` completes successfully without errors
7. **AC7**: `tests/e2e/machine-creation.spec.ts` remains at **12 passed** (no regressions)
8. **AC8**: `tests/e2e/export.spec.ts` remains at **16 passed** (no regressions)

## Test Methods

### codex.spec.ts (7 fixes needed)

| Test Name | Root Cause | Fix Verification |
|-----------|------------|------------------|
| should save machine via save button | Button disabled until module added | Run test, verify no "disabled" timeout error |
| should display saved machine in list | Race condition after save | Run test, verify machine appears in list |
| should load machine from Codex | Load button not visible | Run test, verify load completes |
| should show machine name in Codex | Text locator too broad | Run test, verify name displayed |
| should show rarity badge | Visibility timing | Run test, verify badge visible |
| should show module count | Text pattern mismatch | Run test, verify count matches |
| should return to editor from Codex | Tab name mismatch | Run test, verify tab switch works |

**Verification command**: `npx playwright test tests/e2e/codex.spec.ts --reporter=list`

### random-forge.spec.ts (5 fixes needed)

| Test Name | Root Cause | Fix Verification |
|-----------|------------|------------------|
| should generate random machine | Modal intercepts clicks | Run test, verify machine generated (modules > 0) |
| should persist modules after closing | Modal close timing | Run test, verify modules remain after close |
| should have close button on modal | Button filter too strict | Run test, verify close button found |
| should select different themes | aria-pressed not updating | Run test, verify theme changes |
| should replace existing modules | Count display mismatch | Run test, verify count updates |

**Verification command**: `npx playwright test tests/e2e/random-forge.spec.ts --reporter=list`

### challenge-panel.spec.ts (5 fixes needed)

| Test Name | Root Cause | Fix Verification |
|-----------|------------|------------------|
| should open challenge panel | Dialog role not used | Run test, verify panel opens |
| should show challenge categories | Tab role not found | Run test, verify categories shown |
| should filter by category | Attribute not present | Run test, verify filter works |
| should display challenge cards | Selector too fragile | Run test, verify cards render |
| should view challenge details | Card click target wrong | Run test, verify details open |

**Verification command**: `npx playwright test tests/e2e/challenge-panel.spec.ts --reporter=list`

### recipe-browser.spec.ts (2 fixes needed)

| Test Name | Root Cause | Fix Verification |
|-----------|------------|------------------|
| should close recipe browser | Close button not found | Run test, verify browser closes |
| should sort recipes | Option value mismatch | Run test, verify sort works |

**Verification command**: `npx playwright test tests/e2e/recipe-browser.spec.ts --reporter=list`

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Fixing one test breaks another in same file | Medium | High | Run full suite after each file change |
| Test relies on timing that fails intermittently | Medium | Medium | Use `waitForFunction` or `waitForSelector` with proper states |
| Modal/overlay components render differently than expected | Medium | Medium | Inspect actual DOM with `page.evaluate()` if needed |

## Failure Conditions

The sprint **MUST FAIL** if any of these occur:

1. **Test count drops**: Total E2E tests < 72 after changes
2. **Regressions introduced**: Any previously passing test (machine-creation or export) becomes failing
3. **Build fails**: `npm run build` exits with non-zero code
4. **Bundle size exceeded**: Bundle exceeds 500KB threshold
5. **New test files added without full coverage**: Any new spec file with < 100% pass rate
6. **Application code changes**: Any changes to src/ that aren't test-related

## Done Definition

The sprint is **complete** only when ALL of the following are true:

1. `npx playwright test tests/e2e/codex.spec.ts --reporter=list` shows **12 passed, 0 failed**
2. `npx playwright test tests/e2e/random-forge.spec.ts --reporter=list` shows **10 passed, 0 failed**
3. `npx playwright test tests/e2e/challenge-panel.spec.ts --reporter=list` shows **9 passed, 0 failed**
4. `npx playwright test tests/e2e/recipe-browser.spec.ts --reporter=list` shows **13 passed, 0 failed**
5. `npx playwright test tests/e2e/ --reporter=list` shows **72 passed, 0 failed**
6. `npm run build` completes with **exit code 0**

## Out of Scope

- **No application code changes** — features verified working in Round 70
- **No new test files** — only fixing existing spec files
- **No new features** — only test design fixes
- **No visual/design changes**
- **No unit test modifications** — 2449/2449 already passing
- **No TypeScript changes** — already 0 errors
- **No bundle optimization** — already 499.93 KB < 500 KB

## Notes

### Root Causes from Round 70 QA
- **Button state**: Tests click buttons that are disabled (save button requires module first)
- **Modal intercept**: Dialog overlay blocks pointer events on underlying buttons
- **Locator mismatch**: Tests expect roles/attributes that don't match actual UI
- **Timing issues**: Tests don't wait for element state transitions

### Fix Strategy
1. Always add required state before clicking (e.g., add module before save)
2. Use `force: true` for clicks that are legitimately intercepted by overlays
3. Inspect actual DOM to find correct selectors when role-based locators fail
4. Add explicit waits for state transitions (not just `waitForTimeout`)

---

**APPROVED** — Round 71 Contract

This contract is:
- **Specific**: 19 failing tests mapped to exact files with concrete fix approaches
- **Honest**: Explicitly states application works, only test fixes needed
- **Testable**: Binary ACs with exact pass counts and verification commands
- **Focused**: No scope creep, no mixing with feature work
