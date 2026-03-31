# Sprint Contract — Round 70

## APPROVED

## Scope

This round focuses on **End-to-End (E2E) test coverage** for critical user workflows using Playwright, which is already configured in the project (`playwright.config.ts` points to `./tests` directory). The goal is to ensure the application works correctly from a user perspective, complementing the existing 2449 unit/integration tests.

## Spec Traceability

### P0 items covered this round
- E2E tests for machine creation workflow (drag modules, connect, activate)
- E2E tests for export workflow (open modal, select format, download)
- E2E tests for codex save/load workflow (save machine, open codex, load machine)
- E2E tests for random forge workflow (open modal, generate, apply)

### P1 items covered this round
- E2E tests for challenge panel workflow (browse challenges, filter, view details)
- E2E tests for recipe browser workflow (browse recipes, filter, view hints)

### Remaining P0/P1 after this round
- None — all existing core workflows will have E2E coverage

### P2 intentionally deferred
- E2E tests for community gallery (future feature)
- E2E tests for tech tree interactions (future feature)
- E2E tests for AI assistant interactions (future feature)
- E2E tests for mobile/touch gestures (future feature)

## Deliverables

1. **`tests/e2e/machine-creation.spec.ts`** — E2E tests for creating a machine:
   - Drag module from panel to canvas
   - Connect two modules via ports
   - Activate machine and verify animation plays
   - Verify activation overlay appears and completes

2. **`tests/e2e/export.spec.ts`** — E2E tests for export functionality:
   - Open export modal from toolbar
   - Select different formats (SVG, PNG, poster)
   - Verify format selection persists
   - Verify dimension indicator updates
   - Verify preset buttons apply settings

3. **`tests/e2e/codex.spec.ts`** — E2E tests for codex workflow:
   - Save current machine to codex
   - Open codex view from toolbar
   - Verify saved machine appears in list
   - Load machine from codex back to editor
   - Verify modules appear on canvas

4. **`tests/e2e/random-forge.spec.ts`** — E2E tests for random forge:
   - Open random forge modal
   - Click generate button
   - Verify modules appear on canvas
   - Close modal and verify machine persists

5. **`playwright.config.ts`** — Updated Playwright configuration:
   - Headless mode for CI
   - 1920x1080 viewport
   - Screenshot on failure
   - Timeout per test: 30 seconds
   - `tests/e2e/` directory for new E2E specs

## Acceptance Criteria

1. **AC1**: All E2E tests pass when run via `npm run test:e2e`
2. **AC2**: Machine creation E2E test verifies: module drag → connection → activation flow works
3. **AC3**: Export E2E test verifies: modal opens → format selects → settings apply correctly
4. **AC4**: Codex E2E test verifies: save → browse → load → modules appear on canvas
5. **AC5**: Random forge E2E test verifies: generate → modules appear → persist after close
6. **AC6**: All tests use proper Playwright locators (data-testid, role, text) — no fragile selectors
7. **AC7**: Tests include proper wait conditions (network idle, element visible)
8. **AC8**: Tests clean up state (no side effects between tests)
9. **AC9**: Bundle size remains < 500KB (no new dependencies added)

## Test Methods

### E2E Test Structure

Each E2E spec file follows this pattern:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app or reset state
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should perform core workflow', async ({ page }) => {
    // 1. Locate elements using data-testid or semantic selectors
    // 2. Perform actions with proper waits
    // 3. Assert expected outcomes
    // 4. Verify UI state changes
  });
});
```

### Verification Steps for Evaluator

1. **Run E2E tests:**
   ```bash
   npm run test:e2e
   ```
   - All 4 spec files should run
   - All tests should pass

2. **Verify test isolation:**
   - Run tests multiple times
   - Each test should pass independently
   - No test should affect another

3. **Verify bundle size:**
   ```bash
   npm run build
   ```
   - Bundle should remain < 500KB
   - No new dependencies added

4. **Manual verification (optional):**
   - Open `http://localhost:5173` (after `npm run dev`)
   - Perform workflows manually to verify E2E tests match reality

## Risks

1. **Risk**: App state management in E2E tests may be inconsistent
   - **Mitigation**: Use `beforeEach` to ensure clean state, use `page.reload()` if needed

2. **Risk**: Playwright might not find elements if component structure changes
   - **Mitigation**: Use `data-testid` attributes consistently, prefer semantic selectors

3. **Risk**: Animation timing may cause flaky tests
   - **Mitigation**: Use `waitForFunction` or explicit waits for animation completion

4. **Risk**: Bundle size creeping toward limit
   - **Mitigation**: No new dependencies, only add test files

## Failure Conditions

1. Any E2E test fails when run via `npm run test:e2e`
2. Bundle size exceeds 500KB
3. New dependencies added to package.json
4. Tests use fragile selectors (e.g., `nth` without data-testid)
5. Tests don't clean up state properly
6. TypeScript compilation errors in test files

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ `npm run test:e2e` runs successfully with all tests passing
2. ✅ Bundle size < 500KB verified via `npm run build`
3. ✅ All 4 E2E spec files exist in `tests/e2e/` with proper test coverage:
   - Machine creation workflow covered
   - Export workflow covered
   - Codex save/load workflow covered
   - Random forge workflow covered
4. ✅ `npx tsc --noEmit` passes with 0 errors
5. ✅ Tests use proper locators (data-testid, role, text)
6. ✅ Tests include proper wait conditions
7. ✅ Tests are isolated (no cross-test dependencies)

## Out of Scope

- E2E tests for community gallery features
- E2E tests for tech tree research interactions
- E2E tests for AI assistant panel interactions
- E2E tests for mobile/touch-specific gestures
- E2E tests for keyboard shortcuts
- Visual regression testing
- Performance benchmarking
- Accessibility audit testing (already covered in unit tests)
