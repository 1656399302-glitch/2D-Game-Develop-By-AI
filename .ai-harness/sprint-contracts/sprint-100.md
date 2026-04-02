# Sprint Contract — Round 100

## APPROVED

---

## Scope

**Round 100 Focus:** Core Editor Component Test Coverage — Add dedicated unit tests for the Canvas, ModulePanel, PropertiesPanel, and ModuleRenderer components that form the heart of the machine editor. These components are currently without test coverage despite being critical paths.

## Spec Traceability

### P0 items covered this round
- **Canvas Component Tests** — `src/components/Editor/Canvas.tsx`
  - Module rendering and SVG display
  - Pan/zoom controls and viewport state
  - Selection handling and multi-select
  - Grid rendering and alignment aids
  - Connection point rendering
  - Touch gesture handling
  - Performance with large module counts

- **ModulePanel Component Tests** — `src/components/Editor/ModulePanel.tsx`
  - Module category tabs
  - Module grid display with search
  - Drag-to-canvas initiation
  - Faction filtering
  - Module preview rendering
  - Empty state handling

### P1 items covered this round
- **PropertiesPanel Component Tests** — `src/components/Editor/PropertiesPanel.tsx`
  - Module property editing (rotation, scale, opacity)
  - Connection point management
  - Module deletion
  - Copy/paste operations
  - Color/style customization
  - Empty selection state

- **ModuleRenderer Integration Tests** — `src/components/Modules/ModuleRenderer.tsx`
  - SVG module rendering for all module types
  - Faction variant rendering
  - Selection highlight overlay
  - Connection point visibility
  - Transform handling (scale, rotation)
  - Animation state integration

### Remaining P0/P1 after this round
None — All P0/P1 items from spec are implemented. Testing coverage gap addressed.

### P2 intentionally deferred
- E2E tests with Playwright (infrastructure exists, not prioritized)
- Visual regression tests
- Backend integration tests (API mocking complete)

## Deliverables

1. **`src/components/Editor/__tests__/Canvas.test.tsx`** — Unit tests for Canvas component
2. **`src/components/Editor/__tests__/ModulePanel.test.tsx`** — Unit tests for ModulePanel component
3. **`src/components/Editor/__tests__/PropertiesPanel.test.tsx`** — Unit tests for PropertiesPanel component
4. **`src/components/Modules/__tests__/ModuleRenderer.test.tsx`** — Unit tests for ModuleRenderer component
5. **Test Infrastructure** — Mock utilities for store interactions and SVG rendering

## Acceptance Criteria

1. **`Canvas.test.tsx` exists and ≥15 tests pass** — All test cases for Canvas component execute without errors
2. **`ModulePanel.test.tsx` exists and ≥12 tests pass** — All test cases for ModulePanel component execute without errors
3. **`PropertiesPanel.test.tsx` exists and ≥15 tests pass** — All test cases for PropertiesPanel component execute without errors
4. **`ModuleRenderer.test.tsx` exists and ≥20 tests pass** — All test cases for ModuleRenderer covering all module types execute without errors
5. **Regression Prevention** — All 3,774 existing tests continue to pass
6. **Build Verification** — `npm run build` completes successfully, bundle size ≤560KB
7. **Test Count Increase** — Minimum 50 new tests added across 4 component files
8. **TypeScript Compliance** — `npx tsc --noEmit` returns 0 errors
9. **No TODO/FIXME/HACK comments** — New test files contain no incomplete placeholder code
10. **Store Mocking Pattern** — All Zustand stores mocked using `vi.hoisted()` factory pattern to prevent cross-test contamination (per Round 99 best practices)
11. **Edge Case Coverage** — Each component test file includes empty state, disabled state, and error state tests

## Test Methods

### Canvas.test.tsx
1. Render Canvas with mocked stores; verify SVG viewport renders without crash
2. Call store mock to add modules; verify modules appear as SVG elements within viewport
3. Click zoom-in button; verify zoom state increases
4. Click zoom-out button; verify zoom state decreases
5. Simulate mouse drag on canvas; verify pan translate state updates
6. Click on a module; verify selection state store is called
7. Click grid toggle; verify grid SVG visibility toggles
8. Press keyboard shortcut; verify shortcut handler is invoked
9. Render with no modules; verify placeholder text appears, not crash
10. Render with 50+ modules; verify no performance degradation or timeout

### ModulePanel.test.tsx
1. Render ModulePanel with mocked module definitions; verify category tabs render
2. Click category tab; verify only modules from that category display
3. Type in search input; verify displayed modules are filtered by search term
4. Simulate drag start on module item; verify drag event has correct dataTransfer
5. Select faction filter; verify only modules matching faction display
6. Hover module item; verify tooltip element becomes visible
7. Render category with zero modules; verify empty state message displays, not crash
8. Click module item; verify onModuleSelect callback fires with correct module ID

### PropertiesPanel.test.tsx
1. Mock selection store with selected module; render PropertiesPanel; verify property inputs render
2. Change rotation input value; verify rotation store update function called with new value
3. Change scale input value; verify scale store update function called
4. Click delete button; verify delete action called on selected module
5. Click copy button; verify copy action called
6. Click paste button; verify paste action called
7. Change color picker; verify style update function called
8. Render with no selection; verify placeholder message "请选择模块" displays
9. Render with no selection; verify property inputs should not be visible
10. Click module name input; verify name update function called on blur

### ModuleRenderer.test.tsx
1. Mock each module type definition; render ModuleRenderer with type; verify SVG element exists in DOM
2. Render with `isSelected={true}`; verify selection highlight overlay renders
3. Render with faction variant prop; verify variant-specific SVG path/render
4. Render with hover state; verify connection port elements become visible
5. Verify transform attributes (scale, rotation) applied to SVG group element
6. Verify module metadata injected into SVG title/desc elements
7. Render with invalid module type; verify error state renders, not crash
8. Render all known module types (minimum 15 types); verify each produces valid SVG
9. Verify SVG namespace attributes present on rendered SVG element
10. Verify connection points render at correct positions based on module type

## Test Code Quality Requirements

Based on Round 99 best practices, all new test files must follow these patterns:

1. **Store Mocking**: Use `vi.hoisted()` and `vi.mock()` factory pattern for all Zustand store mocks to ensure proper isolation:
   ```typescript
   const mockUseEditorStore = vi.hoisted(() => vi.fn());
   vi.mock('@/stores/editorStore', () => ({ useEditorStore: mockUseEditorStore }));
   ```

2. **State Reset**: Include `beforeEach` blocks to reset mocks between tests:
   ```typescript
   beforeEach(() => { vi.clearAllMocks(); });
   ```

3. **TypeScript Typing**: Maintain full TypeScript typing throughout test files

4. **Descriptive Naming**: Use clear `describe`/`it` naming that maps to acceptance criteria

5. **Timer Handling**: Use `vi.useFakeTimers()` and `vi.advanceTimersByTime()` for async timer tests

6. **Negative Assertions**: Include tests verifying behavior does NOT occur:
   - "should not crash when no modules present"
   - "should not remain visible after state change"
   - "should not call update function when input is empty"

## Risks

1. **SVG Rendering Complexity** — Canvas and ModuleRenderer use complex SVG; JSDOM has SVG limitations
   - Mitigation: Use SVG-compatible test setup, mock SVG-specific interactions where JSDOM falls short

2. **Store Dependency Depth** — Canvas depends on multiple stores; correct mocking is complex
   - Mitigation: Use `vi.hoisted()` factory pattern per Round 99 best practices, focus on user-visible behavior over implementation

3. **Drag-and-Drop Testing** — Native drag events are difficult to simulate in JSDOM
   - Mitigation: Test drag initiation and event data only, not full native drag behavior

4. **Test Execution Time** — Adding tests for large components may increase CI time
   - Mitigation: Tests are isolated, no performance-intensive operations in test suite

## Failure Conditions

1. **Any existing test fails** — All 3,774 existing tests must pass
2. **TypeScript errors introduced** — `npx tsc --noEmit` must show 0 errors
3. **Bundle size exceeds threshold** — 560KB limit must be maintained
4. **New tests crash or timeout** — All new tests must execute cleanly
5. **Build fails** — `npm run build` must complete successfully
6. **Test count insufficient** — Fewer than 50 new tests added
7. **Missing edge case tests** — Empty state, disabled state, or error state tests absent from any component file
8. **Insufficient store mocking** — Stores not mocked with `vi.hoisted()` pattern causing cross-test contamination

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ `src/components/Editor/__tests__/Canvas.test.tsx` exists with ≥15 passing tests
2. ✅ `src/components/Editor/__tests__/ModulePanel.test.tsx` exists with ≥12 passing tests
3. ✅ `src/components/Editor/__tests__/PropertiesPanel.test.tsx` exists with ≥15 passing tests
4. ✅ `src/components/Modules/__tests__/ModuleRenderer.test.tsx` exists with ≥20 passing tests
5. ✅ Total test count ≥ 3,824 (3,774 existing + 50 minimum new)
6. ✅ `npm run build` completes without errors
7. ✅ `npm run test` shows 100% pass rate (all existing + new)
8. ✅ Bundle size ≤ 560KB
9. ✅ TypeScript compilation shows 0 errors
10. ✅ No TODO/FIXME/HACK comments in new files
11. ✅ All Zustand stores mocked with `vi.hoisted()` factory pattern
12. ✅ Each test file includes empty state, disabled state, and error state test coverage
13. ✅ All new test files have `beforeEach` blocks resetting mocks between tests

## Out of Scope

- E2E/Playwright tests
- Visual regression tests
- Backend/API integration tests
- Performance benchmark tests
- Documentation updates
- New feature development
- Code refactoring beyond test requirements
- Mobile-specific UI tests
- Community/Exchange integration tests

---

**Note:** This is Round 100 — a milestone sprint focused on closing the testing coverage gap for core editor components. The project is feature-complete per `spec.md`. All acceptance criteria from previous rounds have been verified. This sprint ensures the untested core components (Canvas, ModulePanel, PropertiesPanel, ModuleRenderer) have the same test coverage quality as the rest of the codebase.

**Operator Inbox Instructions (Round 100):** Tests must follow the same patterns established in Round 99: `vi.hoisted()` for store mocks, `vi.useFakeTimers()` for async tests, comprehensive edge case coverage, and negative assertions. Store mocking must prevent cross-test contamination.
