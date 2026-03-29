# Sprint Contract — Round 15

## Scope

**Focus:** Canvas Performance Optimization, Keyboard Shortcuts Discoverability, and Core Accessibility Improvements

This round focuses on quality-of-life improvements that do not introduce new feature surface area:

1. **Canvas Performance Optimization** (viewport culling for large machines with 20+ modules)
2. **Keyboard Shortcuts Help Modal** (discoverability via `?` key trigger)
3. **Core Accessibility Improvements** (ARIA labels on interactive elements, focus management)

## Spec Traceability

### P0 items (Must complete this round)
- **Performance - Viewport Culling**: Only render modules visible in current viewport
- **Keyboard Shortcuts Help Modal**: Show all shortcuts, triggered by `?` key
- **Accessibility - ARIA Labels**: Descriptive labels on interactive elements (module panel, toolbar, export modal)
- **Accessibility - Focus Management**: Tab navigation, visible focus indicators, modal focus trap

### P1 items (If time allows)
- **Test Coverage**: Unit tests for keyboard shortcuts and accessibility features
- **Edge Case Handling**: Error states for broken module configurations

### Remaining P0/P1 after this round
- All P0/P1 items from spec are covered by existing implementation
- Round 15 is polish/refinement focused

### P2 intentionally deferred
- AI naming/description integration
- Community sharing features
- Mobile-specific optimizations
- Custom module creation tool
- High contrast mode (complex theme system changes)

## Deliverables

1. **Performance Optimized Canvas** (`src/components/Editor/Canvas.tsx`)
   - Viewport culling: only render modules within visible bounds + 100px buffer
   - Module visibility calculated on pan/zoom change
   - No changes to activation animations or visual quality

2. **Keyboard Shortcuts Help Modal** (`src/components/Editor/KeyboardShortcutsHelp.tsx`)
   - Opens on `?` keypress
   - Lists: Undo (Ctrl+Z), Redo (Ctrl+Y/Ctrl+Shift+Z), Delete (Del), Duplicate (Ctrl+D), Select All (Ctrl+A), Copy (Ctrl+C), Paste (Ctrl+V)
   - Categorized by function (Edit, View, Machine, Navigation)
   - Chinese and English labels
   - Closes on Escape or clicking overlay

3. **Accessibility Improvements** (multiple files)
   - Module panel: `aria-label` on each module item describing its function
   - Toolbar: `aria-label` on all toolbar buttons
   - Canvas: `aria-label="Machine editor canvas with N modules"` where N is current count
   - Export modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title
   - Focus trap in all modals (Export, Keyboard Shortcuts Help, Challenge Browser)
   - Visible focus ring (`:focus-visible`) on all interactive elements

4. **New Tests**
   - `src/__tests__/keyboardShortcuts.test.ts` - Simulate keypress events, verify handlers called
   - `src/__tests__/accessibilityCore.test.ts` - Verify ARIA attributes and focus behavior

## Acceptance Criteria

1. **AC1: Performance - Viewport Culling**
   - With 30 modules on canvas, only modules in visible viewport area are rendered to DOM
   - Pan/zoom operations update rendered set within 16ms (single frame)
   - `npm test` includes a performance test verifying render cycle time

2. **AC2: Keyboard Shortcuts Help**
   - Pressing `?` key (when not in input field) opens KeyboardShortcutsHelp modal
   - Modal displays all 8 shortcuts listed in Deliverables
   - Pressing Escape closes modal and returns focus to previously focused element
   - Clicking overlay closes modal

3. **AC3: Accessibility - ARIA Labels**
   - All buttons in module panel have descriptive `aria-label` attributes
   - All toolbar buttons have `aria-label` attributes
   - Canvas element has `aria-label` with module count
   - Export modal has `role="dialog"` and `aria-modal="true"`

4. **AC4: Accessibility - Focus Management**
   - Tab key cycles through all interactive elements in logical order
   - All focusable elements show visible focus indicator
   - Modal focus trap: focus cannot leave modal while open
   - Escape key closes modals and returns focus to trigger element

5. **AC5: Backward Compatibility**
   - All existing tests pass (current: 909 tests)
   - No changes to existing keyboard shortcut behavior (only added discoverability layer)
   - No visual changes to existing UI components
   - No changes to export, activation, or challenge systems

## Test Methods

### Unit Tests
1. **Performance Test** (`src/__tests__/canvasPerformance.test.ts`)
   - Mount canvas with 30 modules
   - Simulate pan/zoom
   - Measure time to recalculate visible set (assert < 16ms)

2. **Keyboard Test** (`src/__tests__/keyboardShortcuts.test.ts`)
   - Test `?` key opens modal
   - Test each shortcut key triggers correct handler
   - Test Escape closes modal

3. **Accessibility Test** (`src/__tests__/accessibilityCore.test.ts`)
   - Query DOM for buttons with `aria-label`
   - Verify modal has `role="dialog"` and `aria-modal`
   - Verify focus trap behavior

### Browser Verification (Manual)
1. Open application, verify no console errors
2. Add 30+ modules, pan/zoom, verify no frame drops
3. Press `?` key, verify help modal opens
4. Navigate with Tab, verify focus indicators visible
5. Open/close modals, verify focus returns correctly

## Risks

1. **Viewport Culling Affecting Animations**: Culling logic might interfere with activation animations
   - **Mitigation**: Only cull inactive modules; activation animations render all participating modules
2. **Focus Management Conflicts**: Multiple focus systems (modals, canvas, panels) may conflict
   - **Mitigation**: Centralize focus management in a single `useFocusManager` hook
3. **Test Regression**: Adding new tests while maintaining 909 existing tests
   - **Mitigation**: Run full suite before commit; new tests must not modify existing test files

## Failure Conditions

The round fails if any of these occur:
1. Any existing test fails (`npm test` must show 909+ passing)
2. TypeScript compilation errors introduced
3. Activation animation system broken
4. Export functionality regresses
5. Keyboard shortcuts stop working (existing behavior preserved)
6. Canvas renders incorrectly (modules missing when should be visible)
7. Modals cannot be opened or closed

## Done Definition

All of the following must be true before claiming round complete:

- [ ] `npm test` passes with 909+ tests (no regressions)
- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] AC1: Viewport culling implemented, performance test passes
- [ ] AC2: `?` key opens shortcuts help modal with all 8 shortcuts listed
- [ ] AC3: All interactive elements have ARIA labels (verified by test)
- [ ] AC4: Focus management works (tab nav, focus trap, escape closes modals)
- [ ] AC5: No regressions in existing functionality (verified by test suite)
- [ ] Browser verification confirms smooth performance and accessibility features work

## Out of Scope

- New module types or categories
- New export formats or quality options
- Faction or recipe system changes
- Challenge system modifications
- Tutorial/welcome flow changes
- AI integration
- Community features
- Mobile-specific layouts
- Custom module creation tool
- Major visual redesigns
- Connection path optimization (separate P2 item)
- Render batching refactor (separate from viewport culling)

---

*Contract revised with tighter scope, explicit test methods, and measurable acceptance criteria.*

---

## APPROVED

*Contract approved on: Review Round 15*
*Verdict: Specific, honest, and testable - all acceptance criteria are binary and measurable*
