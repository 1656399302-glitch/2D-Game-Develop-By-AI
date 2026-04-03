# Sprint Contract — Round 110

## APPROVED

## Scope

This sprint focuses on **Module Editor Completeness** for the Arcane Machine Codex Workshop. Building on Round 109's activation choreography polish, this round adds critical editing capabilities: undo/redo history, copy/paste functionality, and snap-to-grid placement. These are foundational features for a usable editor that were not yet implemented.

## Spec Traceability

### P0 items completed in previous rounds:
- Activation state machine refinement (COMPLETE in R109)
- Sequential activation choreography (COMPLETE in R109)
- Canvas effects (zoom, shake) (COMPLETE in R109)
- Failure/overload visual effects (COMPLETE in R109)

### P0 items covered this round:
- **Module editor completeness** ← THIS ROUND'S FOCUS
  - Undo/redo history (50 steps)
  - Copy/paste functionality
  - Snap-to-grid placement

### P0 items remaining after this round:
- Energy connection system robustness (validation, conflict detection)
- Codex system data persistence
- Machine attribute generation refinement

### P1 items covered this round:
- Codex save ritual animation (COMPLETE in R109)

### P1 items remaining after this round:
- Random forge mode polish
- Export to SVG/PNG
- UI/UX polish and error handling

### P2 intentionally deferred:
- Alignment guides
- AI naming/description integration
- Community sharing
- Batch export
- Watermark/branding

## Deliverables

1. **src/hooks/useEditorHistory.ts** — Undo/redo command history system
   - Maintains 50-step action history
   - Supports action grouping for compound operations
   - Clear history on machine reload
   - Integrates with existing state mutation paths

2. **src/hooks/useCopyPaste.ts** — Module copy/paste functionality
   - Copy selected modules to clipboard with relative positions
   - Paste creates new instances with offset positions (20px in each axis)
   - Handles single and multiple selection
   - Internal clipboard state (not system clipboard)

3. **src/components/Canvas/SnapToGrid.ts** — Grid snapping logic
   - Configurable grid size (default 20px)
   - Toggle snap on/off
   - Visual grid display option
   - Snaps to nearest grid point on drag end

4. **src/__tests__/editorHistory.test.ts** — Undo/redo tests (18+ test cases)
5. **src/__tests__/copyPaste.test.ts** — Copy/paste tests (18+ test cases)
6. **src/__tests__/snapToGrid.test.ts** — Grid snapping tests (12+ test cases)

## Acceptance Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC-110-001 | Undo reverses last action (add, delete, move, connect) | Unit test with state diff verification |
| AC-110-002 | Redo restores undone action | Unit test with state restoration verification |
| AC-110-003 | History supports minimum 50 steps | Test: perform 50 add/delete actions, verify all 50 are undoable |
| AC-110-004 | Copy creates module duplicate with offset position | Test: copy module at (100,100), paste, verify new module at (120,120) |
| AC-110-005 | Paste multiple times creates independent copies | Test: copy, paste 3x, verify 3 independent modules exist |
| AC-110-006 | Snapped position aligns to 20px grid | Test: drag module to (33,47), verify snaps to (40,60) |
| AC-110-007 | Snap toggle disables/enables grid snapping | Test: disable snap, drag to (33,47), verify position stays (33,47) |
| AC-110-008 | Undo/redo keyboard shortcuts work (Ctrl+Z, Ctrl+Y) | Unit test: simulate keydown, verify action triggered |
| AC-110-009 | Copy/paste keyboard shortcuts work (Ctrl+C, Ctrl+V) | Unit test: simulate keydown, verify clipboard operation |
| AC-110-010 | TypeScript compiles clean | Test: `npx tsc --noEmit` returns 0 errors |
| AC-110-011 | All existing tests pass | Test: `npm test` passes all 172+ test files |
| AC-110-012 | Build succeeds | Test: `npm run build` succeeds without errors |
| AC-110-013 | Undo does NOT corrupt state | Negative: after undo, machineState.modules should match pre-action snapshot |
| AC-110-014 | Copy/paste does NOT duplicate connection IDs | Negative: pasted modules should have new unique IDs |
| AC-110-015 | History clears on machine reload | Test: add action, reload machine, verify history empty |

## Test Methods

### AC-110-001 (Undo single action)
```
Setup:
1. Create new machine via createMachine()
2. Add "core" module via addModule({type: 'core', position: {x: 100, y: 100}})

Action:
3. Call useEditorHistory().undo()

Verification:
4. Assert machineState.modules.length === 0
5. Assert machineState.modules['module-1'] === undefined
```

### AC-110-002 (Redo restored action)
```
Setup:
1. Create new machine
2. Add "core" module

Action:
3. Call useEditorHistory().undo()
4. Verify module NOT in state

Action:
5. Call useEditorHistory().redo()

Verification:
6. Assert machineState.modules['module-1'].type === 'core'
7. Assert machineState.modules['module-1'].position === {x: 100, y: 100}
```

### AC-110-003 (50-step history)
```
Setup:
1. Create new machine
2. Capture initialHistoryLength

Action:
3. Loop 50 times: addModule() → deleteModule()
4. Loop 50 times: undo()

Verification:
5. Assert history.length >= initialHistoryLength + 50
6. Assert machineState matches initial state
```

### AC-110-004 (Copy with offset)
```
Setup:
1. Create module at {x: 100, y: 100}
2. Select module (setSelection(['module-1']))

Action:
3. Call useCopyPaste().copy()

Action:
4. Call useCopyPaste().paste()

Verification:
5. Assert modules.length === 2
6. Assert new module position === {x: 120, y: 120}
7. Assert original module position unchanged at {x: 100, y: 100}
```

### AC-110-005 (Multiple independent copies)
```
Setup:
1. Create single module at {x: 100, y: 100}
2. Select module

Action:
3. Copy → Paste → Paste → Paste

Verification:
5. Assert modules.length === 4
6. Assert all 4 modules have unique IDs
7. Delete original (module-1)
8. Assert remaining 3 modules still exist with correct positions
```

### AC-110-006 (Grid snap)
```
Setup:
1. Create snap-to-grid instance with gridSize=20
2. Create module at {x: 50, y: 50}

Action:
3. Call snapToGrid({x: 33, y: 47})

Verification:
4. Assert result.x === 40
5. Assert result.y === 60

Action:
5. Call snapToGrid({x: 51, y: 59})

Verification:
6. Assert result.x === 60
7. Assert result.y === 60
```

### AC-110-007 (Snap toggle)
```
Setup:
1. Create snap instance with snapEnabled=true
2. Create snap instance with snapEnabled=false

Action/Verification:
3. Assert snapEnabled=true instance returns snapped values
4. Assert snapEnabled=false instance returns original values unchanged
```

### AC-110-008 (Keyboard shortcuts)
```
Setup:
1. Create editor with keyboard handler attached
2. Add module to canvas

Action:
3. Dispatch keydown event with ctrlKey=true, key='z'

Verification:
4. Assert undo() was called

Action:
5. Dispatch keydown event with ctrlKey=true, key='y'

Verification:
6. Assert redo() was called
```

### AC-110-009 (Ctrl+C/V shortcuts)
```
Setup:
1. Create editor with keyboard handler attached
2. Select module on canvas

Action:
3. Dispatch keydown event with ctrlKey=true, key='c'

Verification:
4. Assert copy() was called
5. Assert clipboard contains module ID

Action:
6. Dispatch keydown event with ctrlKey=true, key='v'

Verification:
7. Assert paste() was called
8. Assert new module created with offset position
```

### AC-110-010 (TypeScript clean)
```
$ npx tsc --noEmit
# Must return 0 errors
```

### AC-110-011 (All tests pass)
```
$ npm test -- --run
# Must pass all test files including new tests
```

### AC-110-012 (Build succeeds)
```
$ npm run build
# Must succeed without errors
```

### AC-110-013 (Undo state integrity - NEGATIVE)
```
Setup:
1. Create machine with 3 modules and 2 connections
2. Capture stateSnapshot = deepClone(machineState)

Action:
3. Add 4th module
4. Undo

Verification:
5. Assert machineState.modules === stateSnapshot.modules
6. Assert machineState.connections === stateSnapshot.connections
7. Assert history pointer at correct position
```

### AC-110-014 (Unique IDs on paste - NEGATIVE)
```
Setup:
1. Create module with id='module-1'
2. Copy to clipboard

Action:
3. Paste

Verification:
4. Assert new module id !== 'module-1'
5. Assert all connection IDs are unique across all modules
```

### AC-110-015 (History clears on reload)
```
Setup:
1. Create machine, add action
2. Verify history.length > 0

Action:
3. Reload machine (create new machine instance)

Verification:
4. Assert history.length === 0
5. Assert undo/redo disabled
```

## Negative Assertions (What Should NOT Happen)

| ID | Negative Condition | Verification |
|----|-------------------|---------------|
| NA-110-001 | Undo should NOT corrupt module state | After undo, module properties must match pre-action values exactly |
| NA-110-002 | Copy should NOT modify original module | Original module must remain unchanged after copy |
| NA-110-003 | Paste should NOT reuse connection IDs | New connections must have unique IDs |
| NA-110-004 | Snap should NOT change position when disabled | When snapEnabled=false, input coordinates must equal output |
| NA-110-005 | History should NOT grow unbounded | After 50 steps, oldest actions may be dropped but state must remain consistent |

## State Management Integration

### useEditorHistory Entry States
- Machine created with empty history
- Machine with existing modules (history starts empty)
- Machine reload (history must clear)

### useEditorHistory Completion/Dismissal States
- Action added to history
- History pointer updated
- State restored on undo/redo

### useEditorHistory Repeat/Retry
- Multiple undos in sequence
- Undo after redo (returns to newer state)
- Clear history explicit action

### useCopyPaste Entry States
- Empty selection (copy disabled)
- Single module selected
- Multiple modules selected

### useCopyPaste Completion/Dismissal States
- Modules added to clipboard
- New modules created on paste
- Selection updated to pasted modules

### useCopyPaste Repeat/Retry
- Paste multiple times (each creates new offset copies)
- Copy after paste (re-copy last selection)
- Delete pasted modules (can paste again if selection preserved)

### SnapToGrid Entry/Dismissal States
- Snap enabled/disabled toggle
- Position before snap
- Position after snap

## Risks

1. **Integration risk**: Undo/redo must properly intercept all state mutations. If existing mutation paths bypass the history system, undo will miss actions.
   - Mitigation: Audit all state mutation points and ensure they go through command pattern.

2. **Clipboard API limitations**: Browser clipboard may have restrictions on paste timing or cross-tab operations.
   - Mitigation: Use internal clipboard state, not system clipboard, for this implementation.

3. **Performance risk**: 50-step history with complex module states may impact performance.
   - Mitigation: Implement shallow copies and action diffing where possible.

4. **ID collision risk**: Pasted modules must have unique IDs to avoid state corruption.
   - Mitigation: Generate IDs using UUID or timestamp-based approach.

## Failure Conditions

This sprint fails if:
1. Undo does not reverse module add/delete/move/connect operations
2. Redo does not restore undone state
3. History supports fewer than 50 steps
4. Copy/paste does not create independent module instances
5. Pasted modules share IDs with original modules
6. Snap-to-grid does not align to 20px increments
7. Snap toggle does not enable/disable snapping
8. Keyboard shortcuts (Ctrl+Z/Y, Ctrl+C/V) do not work
9. Undo corrupts machine state (state mismatch after undo)
10. TypeScript produces any compilation errors
11. Any existing test fails
12. Build does not succeed

## Done Definition

All conditions must be true before claiming complete:

1. ✅ `useEditorHistory` hook implements 50-step undo/redo with action grouping
2. ✅ `useCopyPaste` hook copies selected modules and pastes with offset
3. ✅ Snap-to-grid snaps positions to 20px increments when enabled
4. ✅ Keyboard shortcuts Ctrl+Z (undo), Ctrl+Y (redo), Ctrl+C (copy), Ctrl+V (paste) functional
5. ✅ `editorHistory.test.ts` contains tests for AC-110-001, AC-110-002, AC-110-003, AC-110-008, AC-110-013, AC-110-015
6. ✅ `copyPaste.test.ts` contains tests for AC-110-004, AC-110-005, AC-110-009, AC-110-014
7. ✅ `snapToGrid.test.ts` contains tests for AC-110-006, AC-110-007
8. ✅ `npx tsc --noEmit` returns 0 errors
9. ✅ All tests in `npm test -- --run` pass
10. ✅ `npm run build` succeeds

## Out of Scope

This sprint does NOT include:
- Energy connection validation or conflict detection (P0, next round)
- Random forge mode polish (P1)
- Export to SVG/PNG (P1)
- AI naming/description integration (P2)
- Community sharing features (P2)
- Batch export (P2)
- Watermark/branding (P2)
- Alignment guides (deferred to future round)
- Module rotation or scaling refinements (existing functionality preserved but not enhanced)
- Connection point editing (connection creation/editing not part of this round)
