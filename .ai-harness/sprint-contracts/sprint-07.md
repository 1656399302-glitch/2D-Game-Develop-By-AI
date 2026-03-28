# APPROVED — Sprint Contract — Round 7

## Scope

**Remediation Sprint:** Fix the critical keyboard shortcut bug identified in Round 6 feedback. All keyboard shortcuts (R, F, Delete, Escape, Ctrl+Z, Ctrl+Y, Ctrl+D) are currently broken due to an uncaught exception in input field detection.

## Spec Traceability

### P0 items (Critical Bug Fix)
- **Keyboard shortcut input field detection** — Fix `target.closest is not a function` error in `src/hooks/useKeyboardShortcuts.ts`

### P1 items (Verification after fix)
- **Keyboard shortcut verification** — Ensure all keyboard shortcuts work correctly after fix

### Remaining P0/P1 after this round
- None — all P0/P1 items from previous rounds are complete; this round fixes only the regression bug

### P2 items (Deferred)
- AI naming assistant integration
- Community sharing features
- Challenge/task mode
- Faction tech tree system

## Deliverables

1. **Fixed `src/hooks/useKeyboardShortcuts.ts`** — Guard added before calling `target.closest()` to prevent "target.closest is not a function" error
2. **Updated test coverage in `src/__tests__/useKeyboardShortcuts.test.ts`** — Add edge case tests for keyboard events with null/undefined targets
3. **Passing test suite** — All 149+ unit tests pass including new edge case tests

## Acceptance Criteria

1. **Keyboard R key** — Pressing `R` rotates selected module 90° clockwise
2. **Keyboard F key** — Pressing `F` flips selected module horizontally
3. **Keyboard Delete key** — Pressing `Delete` removes selected module or connection
4. **Keyboard Escape key** — Pressing `Escape` deselects or cancels connection mode
5. **Ctrl+Z undo** — Pressing `Ctrl+Z` undoes last action
6. **Ctrl+Y redo** — Pressing `Ctrl+Y` redoes last undone action
7. **Ctrl+D duplicate** — Pressing `Ctrl+D` duplicates selected module with 20px offset
8. **No console errors** — No "target.closest is not a function" errors in browser console during keyboard shortcut usage

## Test Methods

1. **Automated keyboard event dispatch** — Dispatch synthetic `KeyboardEvent` objects and verify store actions are called
2. **Edge case testing** — Dispatch keyboard events with null targets via `document.dispatchEvent(new KeyboardEvent('keydown', {key: 'r'}))` to verify no errors
3. **Unit test verification** — Run `npm test` to verify all keyboard shortcut tests pass
4. **Build verification** — Run `npm run build` to ensure 0 TypeScript errors

## Risks

1. **Test coverage gap** — Current tests may not cover synthetic event edge cases; add specific tests for null target scenarios
2. **Browser compatibility** — The fix must work across modern browsers (Chrome, Firefox, Safari, Edge)

## Failure Conditions

1. **Any keyboard shortcut throws "target.closest is not a function" error**
2. **npm test fails** with keyboard shortcut test failures
3. **npm run build** fails with TypeScript errors
4. **Any P0/P1 feature from previous rounds regresses** due to this fix

## Done Definition

All of the following must be true before claiming round complete:

1. ✅ `src/hooks/useKeyboardShortcuts.ts` contains guard check before calling `target.closest()`
2. ✅ `npm test` passes with 100% keyboard shortcut tests passing
3. ✅ `npm run build` succeeds with 0 TypeScript errors
4. ✅ No "target.closest is not a function" error appears when dispatching synthetic keyboard events
5. ✅ All keyboard shortcuts (R, F, Delete, Escape, Ctrl+Z, Ctrl+Y, Ctrl+D) function correctly

## Out of Scope

- Adding new UI features
- Modifying module components
- Changing activation effects system
- Adding new module types
- Modifying export functionality
- Changing attribute generation logic
- Any changes to Codex/system features
- Code refactoring outside the keyboard shortcuts hook

---

**Previous Round Status:** Round 6 failed due to keyboard shortcut bug. Round 7 is remediation-focused.
