# Sprint Contract — Round 92 (REVISION 3) — **APPROVED**

> **Operator Inbox Instructions (Round 91 — Preserved):**
> - Pre-existing viewport culling bug blocks browser UI verification in Playwright
> - Root cause: ResizeObserver does not fire reliably in headless Playwright environment
> - Impact: ALL modules invisible in browser tests (0 visible out of N)
> - Canvas culling bounds computed with incorrect dimensions (default 800×600 vs actual)
> - Port interaction requires visible canvas modules, which are not rendered due to bug
> - Core functionality verified via unit tests (34 passing) despite browser blocking
> - Connection validation logic, error messaging, and activation pulse verified
> - **Required action for Round 92:** Fix viewport culling to enable full browser UI verification
> - **Not a Round 91 bug:** This is a pre-existing application issue unrelated to Round 91 changes

---

## Scope

**Primary Objective:** Fix the pre-existing viewport culling bug that causes modules to be invisible in Playwright browser tests, enabling full browser UI verification.

**Root Cause:** The `viewportSize` state in Canvas.tsx was initialized with default dimensions (800×600) and updated via `useEffect` listening to `containerRef.current.clientWidth/Height`. The ResizeObserver does not fire reliably in headless Playwright environments, causing the culling bounds to be computed with incorrect dimensions and resulting in 0 visible modules.

## Spec Traceability

### P0 Items (Critical — In Progress)
1. **Viewport Culling Bug Fix** — Modules render correctly in headless Playwright browser tests
   - Root cause: ResizeObserver not firing in headless mode
   - Impact: Blocks all browser UI verification including connection interaction tests
   - Spec reference: AC8 (viewport culling with 50px buffer)

### P1 Items (High Priority — Verified Stable)
1. **All existing functionality continues to work** — No regressions in 3212 passing tests
2. **Connection validation works in browser context** — Integration with fixed viewport system

### P2 Items (Intentionally Deferred)
- No P2 items in this sprint

## Deliverables

1. **Fixed Canvas.tsx** (`src/components/Editor/Canvas.tsx`)
   - Robust viewport size initialization that works in both real browsers and headless Playwright
   - Fallback mechanisms for ResizeObserver failure (window resize listener, getBoundingClientRect)
   - Proper dimension calculation that handles edge cases
   - `isModulePotentiallyVisible()` helper ensuring near-origin modules always render

2. **New utility function** (`src/utils/canvasSizeUtils.ts`)
   - `getCanvasDimensions()` — reliable cross-environment canvas sizing with fallback chain
   - `calculateSafeViewportBounds()` — safe bounds for uncertain viewport
   - `isValidViewportSize()` — detects zero/negative dimensions
   - `isUsingDefaultFallback()` — detects when default dimensions are in use
   - Helper constants: `DEFAULT_CANVAS_WIDTH`, `DEFAULT_CANVAS_HEIGHT`

3. **New tests** (`src/__tests__/viewportCulling.test.ts`)
   - 25 unit tests for viewport culling edge cases
   - Tests that verify visible count calculation with various viewport sizes

## Acceptance Criteria

| ID | Criterion | Status | Verification Method |
|----|-----------|--------|---------------------|
| AC-VP-001 | Modules render with default viewport (800×600) | PENDING | Run `npx vitest run src/__tests__/viewportCulling.test.ts`; expect 25 pass |
| AC-VP-002 | Modules render after viewport resize | PENDING | Same test file; resize scenario tests pass |
| AC-VP-003 | Zero-dimension viewport handled gracefully | PENDING | Zero-dimension edge case tests pass |
| AC-VP-004 | All 3212 existing tests continue to pass | PENDING | Run `npx vitest run`; expect 3212 tests, 144 files |
| AC-VP-005 | Build size remains under 545KB | PENDING | Run `npm run build`; check main bundle < 545KB |

## Test Methods

### 1. Viewport Culling Unit Tests
```bash
npx vitest run src/__tests__/viewportCulling.test.ts
```
**Expected:** 25 tests pass

### 2. Existing Test Suite
```bash
npx vitest run
```
**Expected:** 3212 tests pass, 144 test files

### 3. Build Verification
```bash
npm run build
```
**Expected:** 0 TypeScript errors, main bundle < 545KB

### 4. Browser Verification (Post-Fix)
After fix is applied, verify in Playwright:
1. Open canvas with test modules
2. Verify modules are visible (visible count > 0)
3. Verify port interaction works (drag connections between modules)
4. Verify error toasts display for invalid connections

## Risks

### Risk 1: Environment-Specific Behavior — OPEN
- **Description:** The fix may need to handle different behavior between real browsers and headless Playwright
- **Mitigation:** Use multiple detection methods and safe defaults that ensure modules near origin are always visible

### Risk 2: Regression in Performance — OPEN
- **Description:** Fixing the bug may impact performance optimizations (viewport culling, throttling)
- **Mitigation:** Viewport culling continues to work; only the fallback path is modified

### Risk 3: Test Coverage Gap — OPEN
- **Description:** Unit tests may not fully replicate the Playwright environment issue
- **Mitigation:** Add comprehensive unit tests for all edge cases including zero dimensions, default dimensions, and non-default dimensions

## Failure Conditions

The sprint is considered failed if any of the following occur:
1. Any existing test fails — all 3212 tests must continue to pass
2. Build size exceeds 545KB — bundle must remain under threshold
3. TypeScript errors are introduced — 0 errors required
4. Viewport culling breaks in normal browser use — culling must still function correctly
5. Modules near origin become invisible in headless Playwright — primary acceptance test

## Done Definition

All of the following must be true before this sprint is considered complete:
1. **Tests Pass:** `npx vitest run` shows 3212 tests passing (144 test files)
2. **Build Passes:** `npm run build` completes with 0 TypeScript errors and main bundle < 545KB
3. **Viewport Culling Tests Pass:** All 25 new viewportCulling.test.ts tests pass
4. **No Breaking Changes:** All existing functionality works as before
5. **Browser Verification:** Modules visible in headless Playwright canvas (manual verification)

## Out of Scope

The following items are explicitly NOT part of this sprint:
- Adding new features (AI naming, community gallery, exchange system, etc.)
- Changing the visual design or animations
- Modifying the connection validation logic
- Adding new module types
- Changing the activation pulse timing
- Adding new export formats
