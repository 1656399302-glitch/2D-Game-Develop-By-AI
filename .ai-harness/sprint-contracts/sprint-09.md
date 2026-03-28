# Sprint Contract — Round 9

## Scope

**Canvas Persistence:** Implement auto-save and auto-restore for the canvas state using localStorage, enabling users to resume work after closing the browser tab.

**Persistence Strategy:** Auto-persist to localStorage
- Every canvas state change auto-saves to localStorage (debounced at 500ms)
- On page load, if saved state exists, show "Resume Previous Work?" modal
- "Resume" restores saved state; "Start Fresh" clears localStorage and shows empty canvas
- No manual save button required

---

## Spec Traceability

### P0 items covered this round
- Canvas state persistence — Auto-save modules, positions, connections, colors to localStorage
- State restoration on page load — Restore saved canvas on app load
- Load prompt UI — Show modal if saved state exists
- Start Fresh functionality — Clear localStorage and show empty canvas

### P1 items covered this round
- Test coverage for persistence functions
- Regression tests ensuring existing features remain functional

### Remaining P0/P1 after this round
- P0: All P0 items complete (Canvas persistence covered this round)
- P1: All P1 items complete (Codex system functional from previous rounds)
- All original MVP P0/P1 items: Complete

### P2 intentionally deferred
- Cross-session codex persistence
- Cloud sync / server storage
- Export/import canvas as file
- AI naming assistant integration
- Community sharing features
- Challenge/task mode
- Faction tech tree

---

## Deliverables

1. **`src/utils/localStorage.ts`** (or integrated into canvas store)
   - `saveCanvasState(state)` — Serializes and saves canvas state to localStorage key `arcane-canvas-state`
   - `loadCanvasState()` — Deserializes and returns canvas state from localStorage
   - `clearCanvasState()` — Removes `arcane-canvas-state` from localStorage
   - `hasSavedState()` — Returns boolean for saved state existence

2. **`src/stores/canvasStore.ts`** (or useMachineStore.ts)
   - Subscribe to canvas state changes
   - Debounced auto-save (500ms) triggered by: module add/remove/move, connection add/remove, style change

3. **`src/components/LoadPromptModal.tsx`**
   - Modal on app load if localStorage has saved state
   - Two buttons: "Resume" (loads state) and "Start Fresh" (clears and starts empty)
   - No modal if localStorage is empty

4. **`src/__tests__/persistence.test.ts`**
   - Minimum 3 tests: save, load, clear operations

5. **`npm test` regression pass** — All existing + new tests pass

---

## Acceptance Criteria

1. **Module persistence** — Create 3+ modules, close tab, reopen. Same 3+ modules appear.

2. **Position persistence** — Move module to (200, 300), refresh. Module at (200, 300) ±5px.

3. **Connection persistence** — Connect 2 modules, refresh. Same connection visible.

4. **Color persistence** — Change module color, refresh. Same color applied.

5. **Load prompt appears** — If localStorage has data, modal shows "Resume" and "Start Fresh" buttons.

6. **Resume works** — Click "Resume" → same module count, positions, connections, colors.

7. **Start Fresh works** — Click "Start Fresh" → localStorage cleared, empty canvas (0 modules, 0 connections).

8. **No prompt on empty** — Clear localStorage, refresh → no modal, empty canvas loads directly.

9. **Build succeeds** — `npm run build` exits with code 0, 0 TypeScript errors.

10. **Tests pass** — `npm test` exits with code 0, all tests green.

---

## Test Methods

### Manual Browser Verification

1. **Persistence (modules)**
   - Create 3 modules via Random Forge
   - Note count = 3
   - Close and reopen tab
   - Click "Resume"
   - Verify count = 3

2. **Persistence (position)**
   - Create 1 module, move to (200, 300)
   - Refresh, resume
   - Verify position (200, 300) ±5px

3. **Persistence (connections)**
   - Create 2 modules, connect them
   - Refresh, resume
   - Verify connection visible

4. **Clear test**
   - Create modules
   - Click "Start Fresh"
   - Verify: canvas empty, `localStorage['arcane-canvas-state']` undefined

5. **No-prompt test**
   - `localStorage.clear()`, refresh
   - Verify: no modal, empty canvas

### Automated Verification

6. `npm test` — All tests pass

7. `npm run build` — 0 errors, exit 0

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Storage limit (5MB localStorage) | High | Monitor state size; truncate if >4MB; log warning |
| State serialization failure | High | Test all module types and connection configurations |
| Race condition during save | Medium | 500ms debounce to batch rapid changes |
| Missing new state fields | Medium | Document required fields; add tests for new fields |

---

## Failure Conditions

**Round must FAIL if ANY of these occur:**

1. `npm test` fails (any test, existing or new)
2. `npm run build` fails (TypeScript errors or non-zero exit)
3. Page refresh clears canvas (state NOT persisted)
4. Restored state differs from pre-refresh (count, positions, connections, colors)
5. Console errors on page load or during persistence operations
6. Saved state exists but no prompt appears on load
7. "Start Fresh" does not clear localStorage or canvas
8. Prompt appears when localStorage is empty

---

## Done Definition

All items must be TRUE before claiming round complete:

- [ ] Canvas state persists after page refresh (verified with 3+ modules)
- [ ] State restores correctly: module count matches, positions ±5px, connections visible, colors applied
- [ ] Load prompt appears when localStorage has saved state
- [ ] "Resume" button restores saved state
- [ ] "Start Fresh" clears localStorage and shows empty canvas
- [ ] No modal when localStorage is empty
- [ ] Zero console errors during load and persistence operations
- [ ] `npm test` passes (all existing tests + new persistence tests)
- [ ] `npm run build` succeeds (0 TypeScript errors)
- [ ] All existing features (Random Forge, Activation, Export, Codex) remain functional

---

## Out of Scope

- **Manual save/load buttons** — Using auto-save strategy only
- **Named snapshots or versioning** — Single auto-save slot only
- **Codex entry persistence** — Separate feature, not this sprint
- **Cloud sync or server storage** — localStorage only
- **Export/import canvas as file** — Separate feature
- **AI naming integration** — Future feature
- **Community sharing** — Future feature
- **Challenge/task mode** — Future feature
- **Faction tech tree** — Future feature
- **Cross-session codex persistence** — Future feature
