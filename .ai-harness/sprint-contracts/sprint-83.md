APPROVED

# Sprint Contract — Round 83

## Scope

**Remediation-only sprint.** Round 82 QA identified exactly one critical bug blocking the release of Phase 2 deliverables (D5, D6, D8). No new features, no scope expansion. The single fix must be precise and regression-tested.

## Spec Traceability

- **P0 covered this round:** AC6 — Keyboard shortcut `?` key toggle (regression from D5 integration)
- **P1 covered this round:** None (remediation only)
- **Remaining P0/P1 after this round:** None — Phase 2 scope (D5, D6, D8) was fully integrated in R82; this round fixes the one bug that prevented acceptance
- **P2 intentionally deferred:** None

## Deliverables

1. **`src/components/KeyboardShortcutsPanel.tsx`** — Fixed: removes the internal `keydown` listener for `?` key (lines 62–76) so that only `App.tsx`'s global handler controls the panel toggle
2. **`src/App.tsx`** — Unchanged (no changes needed; App-level handler is correct)
3. **Zero net new files** — This is a targeted bug-fix sprint

## Acceptance Criteria

1. **AC6-FIX-OPEN:** Pressing `?` once opens the Keyboard Shortcuts Panel immediately (within 100ms). The panel MUST NOT require two presses, nor open then immediately close.
2. **AC6-FIX-CLOSE:** Pressing `?` a second time closes the Keyboard Shortcuts Panel. Toggle works in both directions without inversion.
3. **AC6-FIX-REPEAT:** The panel can be opened and closed via `?` key multiple consecutive times. After 3 complete open→close cycles, behavior remains consistent (no drift, no requiring extra presses).
4. **AC6-FIX-OVERLAY:** Clicking the overlay backdrop closes the Keyboard Shortcuts Panel.
5. **AC6-FIX-ESCAPE:** Pressing `Escape` closes the Keyboard Shortcuts Panel.
6. **AC6-FIX-NOT-INPUT:** When focus is inside a text input field, pressing `?` does NOT open the Keyboard Shortcuts Panel (App-level handler correctly ignores shortcuts in inputs).
7. **AC-REGRESSION:** All other keyboard shortcuts (`Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+D`, `Ctrl+Shift+N`, `Ctrl+E`, `Ctrl+Shift+E`, `Ctrl+S`, `Ctrl+Shift+G`) remain functional and produce zero console errors.
8. **AC-BUILD:** `npm run build` exits 0, bundle ≤ 560 KB, 0 TypeScript errors.
9. **AC-TESTS:** `npx vitest run` passes with ≥ 2918 tests (no regressions).

## Test Methods

1. **AC6-FIX-OPEN and AC6-FIX-CLOSE (primary toggle test):**
   - Open http://localhost:5173
   - Press `?` key → assert Keyboard Shortcuts Panel is visible within 100ms
   - Press `?` again → assert panel is hidden within 100ms
   - **Negative assertion:** Panel must NOT require two presses to open; pressing once must open on the FIRST attempt
   - **Negative assertion:** Panel must NOT exhibit inverted behavior (open after first press, close after second, as was the bug)

2. **AC6-FIX-REPEAT (reliability test):**
   - Execute 3 complete open→close cycles using `?` key
   - Assert each cycle: opens on press N, closes on press N+1
   - After cycle 3, verify no accumulated drift (panel opens on next `?` press without needing "recovery" presses)

3. **AC6-FIX-OVERLAY (close path):**
   - Open panel via `?` key
   - Verify panel is visible
   - Click the backdrop overlay (outside the panel)
   - **Negative assertion:** Panel must NOT remain open after clicking backdrop
   - **Negative assertion:** Panel must NOT crash or throw console error

4. **AC6-FIX-ESCAPE (close path):**
   - Open panel via `?` key
   - Verify panel is visible
   - Press `Escape`
   - **Negative assertion:** Panel must NOT remain open after Escape

5. **AC6-FIX-NOT-INPUT (input field edge case):**
   - Focus any text input field (e.g., machine name input, search field)
   - Press `?` key while input is focused
   - **Negative assertion:** Keyboard Shortcuts Panel must NOT open
   - This verifies App.tsx's input-focus guard works correctly after the component handler is removed

6. **AC-REGRESSION (other shortcuts):**
   - `Ctrl+Z` → undo works (machine state reverts)
   - `Ctrl+Shift+Z` → redo works
   - `Ctrl+D` → duplicate works
   - `Ctrl+Shift+N` → new machine works
   - `Ctrl+E` → export panel works
   - `Ctrl+S` → save works
   - **Negative assertion:** Each shortcut must NOT throw console errors
   - **Negative assertion:** Panel must NOT unexpectedly open/close during these operations

7. **AC-BUILD verification:**
   - `npm run build` → exit code 0
   - Assert bundle size < 560 KB
   - Assert 0 TypeScript errors

8. **AC-TESTS verification:**
   - `npx vitest run` → all tests pass
   - Assert test count ≥ 2918
   - **Negative assertion:** No test failures or errors

## Risks

1. **Risk: The fix is incomplete or introduces a new handler conflict.** The fix must remove the component-internal `?` handler completely. If any fragment of that handler remains (including partial useEffect blocks, commented code, or different event types), the race condition will persist. The evaluator must confirm via grep that `KeyboardShortcutsPanel.tsx` contains no `keydown` listener referencing `?` or `toggle:keyboardShortcuts`.

2. **Risk: The App.tsx handler has an edge case that went unnoticed.** App.tsx's handler includes an input-field focus guard. If this guard has a bug (e.g., false positives that block the shortcut in non-input areas), removing the component handler will surface it. The AC6-FIX-NOT-INPUT test covers this, but browser verification is required.

3. **Risk: The `?` key toggle does not work reliably across different focus states.** After removing the component handler, the only handler is App.tsx's. If the focus state management in App.tsx is incorrect (e.g., missing `e.target.tagName` checks), the shortcut may fail when certain elements are focused.

## Failure Conditions

1. Pressing `?` does not open the panel on first press, or requires more than one press to open.
2. Panel exhibits inverted behavior (opens on second press instead of first, or vice versa).
3. `KeyboardShortcutsPanel.tsx` still contains any `keydown` listener that references the `?` key or dispatches `toggle:keyboardShortcuts`.
4. Any other keyboard shortcut regresses (broken undo, redo, export, etc.).
5. Build fails, TypeScript errors appear, or bundle exceeds 560 KB.
6. Any existing test fails.
7. Panel opens when `?` is pressed while focus is in a text input field.

## Done Definition

The round is complete when ALL of the following are true:

1. `KeyboardShortcutsPanel.tsx` has been edited to remove the `useEffect` block containing the `?` key listener (lines 62–76).
2. `KeyboardShortcutsPanel.tsx` retains its `Escape` key listener and overlay click handler for closing.
3. Manual browser test: `?` → panel opens on first press (within 100ms), `?` → panel closes on second press — verified independently 3× with consistent behavior.
4. Manual browser test: `?` does NOT open panel when focus is in a text input field.
5. `npm run build` passes with 0 errors.
6. `npx vitest run` passes with ≥ 2918 tests.
7. Grep confirms no remaining `?`-key handler in `KeyboardShortcutsPanel.tsx`: `grep "key === '?'" src/components/KeyboardShortcutsPanel.tsx` returns 0 matches.
8. Grep confirms no remaining `toggle:keyboardShortcuts` dispatch in `KeyboardShortcutsPanel.tsx`: `grep "toggle:keyboardShortcuts" src/components/KeyboardShortcutsPanel.tsx` returns 0 matches (excluding imports/comments).

## Out of Scope

- Any new feature work beyond the keyboard handler fix
- Changes to `QuickActionsToolbar`, `useCanvasPerformance`, or any other Phase 2 deliverable
- Changes to the module library, canvas rendering, energy connections, animation systems, attribute generation, or export pipeline
- Changes to `App.tsx` keyboard handler (it is correct; do not touch it)
- UI/UX polish unrelated to the `?` key toggle bug
- Any spec.md additions or architectural changes
