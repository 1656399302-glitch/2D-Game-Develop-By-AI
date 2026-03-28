APPROVED

# Sprint Contract — Round 3

## Scope

**Remediation sprint:** Fix the critical undo/redo off-by-one bug in the state management layer. No new features. No visual changes. No module additions.

---

## Spec Traceability

- **P0 item covered this round:** Keyboard undo/redo (Ctrl+Z/Y) — previously broken
- **P1 items covered this round:** None (Round 2 already covered all P1 items)
- **Remaining P0/P1 after this round:** None
- **P2 intentionally deferred:** None (fully covered)

---

## Deliverables

1. **`src/store/useMachineStore.ts`** — Fixed undo/redo architecture with `saveToHistory()` called AFTER state mutations
2. **`src/__tests__/undoRedo.test.ts`** — New test file validating undo/redo behavior end-to-end
3. **`src/__tests__/useMachineStore.test.ts`** — Updated test file with undo/redo coverage

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | `Ctrl+Z` undoes the last add/remove/rotate action | Add 1 module → Undo → canvas has 0 modules |
| 2 | `Ctrl+Z` works for multiple sequential undos | Add module A, Add module B → Undo twice → canvas has 0 modules |
| 3 | `Ctrl+Y` redoes the last undone action | Add module → Undo (0 modules) → Redo (1 module) |
| 4 | Redo stack is correct after multiple operations | Add A → Add B → Undo → Undo → Redo → canvas has 1 module (A) |
| 5 | Undo/redo works for delete operation | Add module → Delete → Undo → module reappears |
| 6 | Undo/redo works for rotation | Add module → Rotate 90° → Undo → rotation resets to 0° |
| 7 | Undo/redo works for connections | Add 2 modules → Connect → Undo → connection removed |
| 8 | Undo/redo works for clear canvas | Add modules → Clear → Undo → modules reappear |
| 9 | Redo stack clears when new action is taken after undo | Add module → Undo → Add different module → Redo should NOT restore original module |
| 10 | `saveToHistory()` is called AFTER state changes | Code inspection: all history saves occur after `set()` |

---

## Test Methods

1. **Unit tests** — Direct store action calls with state assertions
2. **Integration tests** — Simulated keyboard shortcuts via `document.dispatchEvent` with keyboard events
3. **Manual verification** — Developer runs `npm run dev`, adds/removes/rotates modules, presses Ctrl+Z/Y

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Fixing the call order may introduce regressions in other store actions | Low | Comprehensive test coverage; all 43 existing tests must still pass |
| History stack may grow unbounded over long sessions | Low | History limit of 50 entries already exists; no change needed |
| Tests may be flaky due to async state updates | Low | Tests use `waitFor` / `act()` wrappers |

---

## Failure Conditions

This round **MUST FAIL** if:

1. Any of the 10 acceptance criteria above fail
2. `npm run build` produces any errors
3. `npm test` has any failing tests (including existing 43)
4. The undo/redo bug is not fully resolved in manual browser testing

---

## Done Definition

Exactly this must be true before claiming completion:

1. All `saveToHistory()` calls in `useMachineStore.ts` are confirmed to occur **after** `set()` calls
2. New `undoRedo.test.ts` passes all new test cases
3. All existing 43 tests still pass (`npm test`)
4. Build succeeds without errors (`npm run build`)
5. Manual browser test confirms: Add 2 modules → Ctrl+Z → exactly 1 module remains → Ctrl+Y → exactly 2 modules remain

---

## Out of Scope

- Adding new module types (Output Array already added in Round 2)
- Changing SVG visuals or animations
- Modifying attribute generation logic
- Changing the module panel or properties panel
- Updating export functionality
- Altering the Codex system
- Any UI/UX improvements beyond the fix
