# Sprint Contract — Round 63
APPROVED

## Scope

Refinement sprint: Improve test coverage, add accessibility enhancements, and implement minor UX polish items. This round focuses on addressing potential edge cases discovered through existing tests and ensuring robust behavior across the machine editor workflow.

## Spec Traceability

- **P0 items covered this round:**
  - None — all P0 blockers resolved in prior rounds.

- **P1 items covered this round:**
  - Test coverage for edge cases in machine editor workflows
  - Accessibility improvements for multi-selection operations
  - Export quality verification for complex machines

- **P1 items remaining after this round:**
  - All P1 items from prior rounds remain addressed.

- **P2 intentionally deferred:**
  - AI provider configuration improvements (Round 64+)
  - Advanced recipe discovery system (Round 64+)

## Deliverables

1. **Enhanced `src/__tests__/multiSelectEdgeCases.test.ts`**
   - Multi-module selection with mixed module types
   - Multi-module rotation around off-center selection bounds
   - Multi-module deletion during activation state
   - Box selection with modules at negative coordinates
   - Group operations with hidden/locked modules

2. **Enhanced `src/__tests__/exportQuality.test.tsx`**
   - SVG export with 20+ modules (stress test)
   - PNG export at different DPI settings
   - Export with special characters in machine name
   - Export with missing module data handling

3. **Accessibility enhancements in `src/components/Editor/SelectionHandles.tsx`**
   - Proper ARIA labels for rotation handle
   - Keyboard announcement for scale operations
   - Focus trap during multi-select operations

4. **Enhanced `src/__tests__/keyboardShortcuts.test.ts`**
   - Duplicate shortcut (Ctrl+D) with no selection
   - Undo with empty history
   - Redo with empty future stack
   - Scale shortcut boundaries (0.25x - 4.0x clamp)

5. **New `src/__tests__/moduleConnectionValidation.test.ts`**
   - Connection between same-type modules
   - Connection between different faction variants
   - Invalid connection prevention
   - Connection removal during activation

## Acceptance Criteria

1. **AC1 — Multi-select rotation works correctly:** Selecting 3+ modules with different types, pressing R, results in all modules rotating 90° clockwise around their collective center.
2. **AC2 — Box selection handles negative coordinates:** Drag-selecting starting from canvas coordinate (-50, -50) correctly captures modules in that region.
3. **AC3 — Export handles 20+ modules:** Exporting a machine with 20+ modules produces valid SVG and PNG files without timeout or truncation.
4. **AC4 — Scale shortcuts clamp correctly:** Pressing Ctrl+= repeatedly caps at 4.0x scale; pressing Ctrl+- repeatedly floors at 0.25x scale.
5. **AC5 — Undo/redo with empty history:** Pressing Ctrl+Z with no history does not crash; pressing Ctrl+Y with no future does not crash.
6. **AC6 — SelectionHandles announces rotation:** Screen reader announces "Rotate selection 90 degrees" when rotation handle is activated.
7. **AC7 — Connection validation prevents circular dependencies:** Attempting to create a connection that would create a cycle is prevented with a toast notification.

## Test Methods

1. **AC1 — Multi-select rotation:** Create 3 modules, Shift+click to multi-select, press R, verify all module rotations increased by 90°. Test with modules at varying distances from center.
2. **AC2 — Negative coordinate box selection:** Create module at position (-50, -50), perform box selection from that area, verify module is selected.
3. **AC3 — Export stress test:** Programmatically add 20 modules, trigger export, verify SVG output contains all 20 module elements, PNG file size > 10KB.
4. **AC4 — Scale clamping:** In editor with selected module, press Ctrl+= 20 times, verify scale is exactly 4.0; press Ctrl+- 20 times from 4.0, verify scale is exactly 0.25.
5. **AC5 — Empty history safety:** Clear machine store, press Ctrl+Z, verify no console error; load machine, press Ctrl+Y with no intervening action, verify no console error.
6. **AC6 — Screen reader announcement:** With screen reader mode active, click rotation handle, verify live region announces rotation action.
7. **AC7 — Circular dependency prevention:** Create 3 modules A→B→C, attempt to connect C→A, verify toast appears and connection is not created.

## Risks

1. **Test environment risk:** Some tests require canvas coordinates which may behave differently in headless browser. Use fixed viewport size (1280x720) for all canvas tests.
2. **Timing risk:** Animation and activation state tests may be flaky. Use `vi.useFakeTimers()` for timing-sensitive assertions.
3. **Accessibility test coverage risk:** Screen reader announcements are browser-specific. Mark tests as `test.skip` on non-Chromium browsers if needed.

## Failure Conditions

The round fails if:
1. Any new test has a failure rate > 0% across 5 consecutive runs.
2. Build produces TypeScript errors.
3. Existing tests (2273 total) decrease in count or pass rate.
4. Accessibility audit reveals new critical violations (WCAG Level AA).

## Done Definition

All acceptance criteria must pass:
- 7 new test files pass with 100% success rate
- All 2273 existing tests continue to pass
- Build completes with 0 TypeScript errors
- Bundle size increase < 5KB (new test code only)
- No accessibility violations introduced

## Out of Scope

- Changes to core machine editor drag-drop functionality
- Changes to AI naming/description service implementation
- Changes to community gallery data structures
- Changes to tutorial flow content
- Visual design changes to existing components
- Backend/server-side changes (project is client-side only)
