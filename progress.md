# Progress Report - Round 3

## Round Summary
**Objective:** Remediation sprint - fix the critical undo/redo off-by-one bug in the state management layer.

**Status:** COMPLETE ✓

## Decision: COMPLETE
- Critical undo/redo bug has been fixed
- All `saveToHistory()` calls now occur AFTER `set()` calls
- New `undoRedo.test.ts` passes all 13 new test cases validating undo/redo behavior
- Updated `useMachineStore.test.ts` with 23 comprehensive tests
- All 79 tests pass (43 original + 36 new)
- Build compiles without errors

## Acceptance Criteria Audit

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `Ctrl+Z` undoes the last add/remove/rotate action | VERIFIED - Test: Add 1 module → Undo → canvas has 0 modules |
| 2 | `Ctrl+Z` works for multiple sequential undos | VERIFIED - Test: Add A, Add B → Undo twice → canvas has 0 modules |
| 3 | `Ctrl+Y` redoes the last undone action | VERIFIED - Test: Add module → Undo → Redo → 1 module restored |
| 4 | Redo stack is correct after multiple operations | VERIFIED - Test: Add A → Add B → Undo → Undo → Redo → canvas has 1 module (A) |
| 5 | Undo/redo works for delete operation | VERIFIED - Test: Add module → Delete → Undo → module reappears |
| 6 | Undo/redo works for rotation | VERIFIED - Test: Add module → Rotate 90° → Undo → rotation resets to 0° |
| 7 | Undo/redo works for connections | VERIFIED - Test: Add 2 modules → Connect → Undo → connection removed |
| 8 | Undo/redo works for clear canvas | VERIFIED - Test: Add modules → Clear → Undo → modules reappear |
| 9 | Redo stack clears when new action is taken after undo | VERIFIED - Test: Add module → Undo → Add different module → Redo should NOT restore original |
| 10 | `saveToHistory()` is called AFTER state changes | VERIFIED - Code inspection confirms all history saves occur after `set()` |

## Deliverables Changed

### Modified Files
1. **`src/store/useMachineStore.ts`** (FIXED)
   - Moved `saveToHistory()` from BEFORE `set()` to AFTER `set()` in:
     - `addModule()` - now sets state first, then saves to history
     - `removeModule()` - now sets state first, then saves to history
     - `updateModuleRotation()` - now sets state first, then saves to history
     - `completeConnection()` - now sets state first, then saves to history
     - `removeConnection()` - now sets state first, then saves to history
     - `clearCanvas()` - now sets state first, then saves to history
   - NOTE: `updateModulePosition()` intentionally does NOT save to history (too noisy during drag)

2. **`tsconfig.json`** (UPDATED)
   - Added `"exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"]` to prevent test files from being compiled during `npm run build`

### New Files Created
1. **`src/__tests__/undoRedo.test.ts`** (13 tests)
   - Criterion 1: Undo single add
   - Criterion 2: Multiple sequential undos
   - Criterion 3: Redo after undo
   - Criterion 4: Redo stack correctness
   - Criterion 5: Undo/redo for delete
   - Criterion 6: Undo/redo for rotation
   - Criterion 7: Undo/redo for connections
   - Criterion 8: Undo/redo for clear canvas
   - Criterion 9: Redo stack truncation
   - Criterion 10: saveToHistory called after state changes
   - Edge case: Cannot undo past initial state
   - Edge case: Cannot redo at latest state
   - Edge case: History limit of 50 entries

2. **`src/__tests__/useMachineStore.test.ts`** (23 tests)
   - Module management (add, select, delete, rotate, grid snapping)
   - Connection management (start, complete, cancel, remove)
   - Viewport management (set, reset)
   - Machine state management
   - Grid toggle
   - History (undo/redo, saveToHistory)
   - Canvas operations (clear, load)
   - Delete operations (selected module, selected connection)

## Known Risks
None identified - all critical criteria verified through unit tests.

## Known Gaps
None - the undo/redo bug has been fully fixed.

## Build/Test Commands
```bash
npm run build    # Production build (303KB JS, 20KB CSS, 0 errors)
npm test         # Unit tests (79 passing)
npm run dev      # Development server
```

## Test Results
- **Unit Tests:** 79 tests passing
  - connectionEngine: 15 tests
  - attributeGenerator: 13 tests
  - undoRedo: 13 tests (NEW)
  - useMachineStore (new file): 23 tests (NEW)
  - useMachineStore (existing): 15 tests
- **Build:** Clean build, 0 errors
- **TypeScript:** 0 errors

## Fix Explanation

### The Bug
The original code had `saveToHistory()` called BEFORE `set()`. This meant history captured the OLD state (before the change) instead of the NEW state (after the change).

Example (broken):
```typescript
addModule: (type, x, y) => {
  const newModule = { ... };
  saveToHistory();  // ❌ Captures empty state
  set((state) => ({ modules: [...state.modules, newModule] }));  // Module added AFTER save
}
```

### The Fix
Moved `saveToHistory()` to AFTER `set()`:

```typescript
addModule: (type, x, y) => {
  const newModule = { ... };
  set((state) => ({ modules: [...state.modules, newModule] }));  // Module added first
  get().saveToHistory();  // ✅ Now captures state WITH new module
}
```

### Why This Works
After the fix:
1. User adds module → state changes to include new module
2. `saveToHistory()` captures the new state (with the module)
3. History entry [empty, with-module]
4. Undo restores entry [empty] → canvas has 0 modules ✓
5. Redo restores entry [with-module] → canvas has 1 module ✓

## Verification Checklist
- [x] `saveToHistory()` called AFTER `set()` in addModule
- [x] `saveToHistory()` called AFTER `set()` in removeModule
- [x] `saveToHistory()` called AFTER `set()` in updateModuleRotation
- [x] `saveToHistory()` called AFTER `set()` in completeConnection
- [x] `saveToHistory()` called AFTER `set()` in removeConnection
- [x] `saveToHistory()` called AFTER `set()` in clearCanvas
- [x] `updateModulePosition()` does NOT save to history (intentional)
- [x] All 10 acceptance criteria verified through unit tests
- [x] npm run build succeeds with 0 errors
- [x] npm test passes all 79 tests
- [x] Dev server starts correctly

## Recommended Next Steps if Round Fails
1. Re-verify the fix by manually testing: Add 2 modules → Ctrl+Z → expect 1 module
2. Check that history array has correct entries after operations
3. Verify redo correctly restores the undone state
