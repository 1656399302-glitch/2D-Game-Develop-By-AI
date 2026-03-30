# Sprint Contract — Round 41

## APPROVED

---

## Scope

**Focus:** Complete keyboard-driven editing experience and improve module manipulation

This sprint addresses critical gaps in the editor's operability. Despite 1584 passing tests and a full feature set, several editor interactions mentioned in UI hints are stubs or incomplete. We will implement proper keyboard shortcuts, complete module grouping, fix copy/paste behavior, and finalize rotation/scale for selected modules.

---

## Spec Traceability

### P0 items covered this round

| Feature | Spec Reference | Current State |
|---------|----------------|---------------|
| Keyboard shortcuts (Delete, Ctrl+D, R, F) | "快速清空" in editor features | Stub - empty handlers |
| Module grouping (Ctrl+G) | "组合成组" | Stub - no grouping store/logic |
| Selection rotation | "旋转" | Empty stub `handleSelectionRotate` |
| Selection scale | "缩放" | Empty stub `handleSelectionScale` |
| Copy/paste with connections | "复制" | Only copies single module, no connections |

### P1 items covered this round

| Feature | Spec Reference | Current State |
|---------|----------------|---------------|
| Undo/redo keyboard (Ctrl+Z, Ctrl+Shift+Z) | "撤销重做" | Not exposed to user |
| Multi-select copy | "复制" | Copies only first module |
| Group operations (rotate, scale) | "组合成组" | No group transform support |

### Remaining P0/P1 after this round

- Faction variant modules full integration (P1, complex interdependencies)
- AI naming integration (P1, requires API)
- Community gallery live data (P1, backend dependent)
- Export modal integration polish (P1, minor)

### P2 intentionally deferred

- Custom module creation
- Undo/redo visual indicators in toolbar
- Multiple save slots
- .arcane file import/export

---

## Deliverables

### 1. `src/hooks/useKeyboardShortcuts.ts`

Enhanced keyboard handler with:
- `Delete` / `Backspace`: Delete selected modules and their connections
- `Ctrl+D`: Duplicate selected modules with connections
- `R`: Rotate selected 90° clockwise
- `F`: Flip selected horizontally
- `Ctrl+G`: Group selected modules
- `Ctrl+Shift+G`: Ungroup selected
- `Ctrl+Z`: Undo
- `Ctrl+Shift+Z`: Redo
- `Escape`: Deselect all / cancel operation
- `Ctrl+A`: Select all modules
- `Ctrl+C`: Copy selected
- `Ctrl+V`: Paste modules at cursor offset

### 2. `src/store/useGroupingStore.ts` (new)

Grouping store supporting:
- `groups: Map<string, GroupData>` where `GroupData = { id, moduleIds: string[], bounds, rotation }`
- `createGroup(moduleIds)`: Create group from selected modules
- `ungroup(groupId)`: Dissolve group, preserve module transforms
- `getGroupModules(groupId)`: Get all modules in a group
- `transformGroup(groupId, delta)`: Apply transform to all group members

### 3. `src/store/useMachineStore.ts` - Enhanced operations

**`duplicateSelected()`** enhanced:
```typescript
duplicateSelected: () => {
  // Copy all selected modules (not just first)
  // Copy all connections between copied modules
  // Offset pasted modules by (20, 20) pixels
  // Select the pasted modules
}
```

**`deleteSelected()`** enhanced:
```typescript
deleteSelected: () => {
  // Delete all selected modules
  // Delete all connections attached to deleted modules
  // Clear selection
}
```

### 4. `src/utils/groupingUtils.ts` (new)

Transform utilities:
- `calculateGroupBounds(moduleIds)`: Bounding box of group
- `rotateGroup(moduleIds, degrees)`: Rotate all modules around group center
- `scaleGroup(moduleIds, factor)`: Scale all modules from group center
- `flipGroup(moduleIds, axis)`: Mirror modules horizontally or vertically

### 5. `src/components/Editor/Canvas.tsx` - Complete stubs

**`handleSelectionRotate`** implementation:
- Rotate selected modules 90° clockwise around selection center
- Update module `rotation` property
- Trigger re-render with updated transforms

**`handleSelectionScale`** implementation:
- Scale selected modules by factor (1.25 for enlarge, 0.8 for shrink)
- Scale around selection center
- Update module `scale` property (default 1.0)
- Clamp scale to range [0.25, 4.0]

### 6. `src/components/Editor/Toolbar.tsx` - Add shortcut hints

Add tooltip text showing keyboard shortcuts for toolbar buttons:
- "Duplicate (Ctrl+D)"
- "Delete (Del)"
- "Rotate (R)"
- "Flip (F)"
- "Group (Ctrl+G)"

### 7. `src/__tests__/keyboardShortcuts.test.ts`

Comprehensive test suite:
- 25+ test cases covering all shortcuts
- Test shortcut conflicts (e.g., Ctrl+G vs Ctrl+Shift+G)
- Test shortcuts work with zero, one, multiple selected modules
- Test shortcuts work when canvas is not focused

---

## Acceptance Criteria

### AC1: Delete shortcut removes selected modules and connections

**Test:** Select 2 modules connected to each other. Press Delete. Verify both modules removed and connection removed from store.

**Evidence:** `useKeyboardShortcuts` calls `deleteSelected()` → store removes modules and any connections where `sourceId` or `targetId` in deleted modules.

### AC2: Ctrl+D duplicates with connections

**Test:** Select 1 module with 2 connections. Press Ctrl+D. Verify:
- 1 new module created with same type/rotation/position offset
- 0 new connections (cross-group duplication not supported)
- New module selected
- Original unchanged

**Evidence:** `duplicateSelected()` iterates all selected modules, creates copies with offset, copies intra-selection connections.

### AC3: R key rotates selected 90°

**Test:** Select 1 module. Press R. Verify module rotation increases by 90°. Press R again. Verify rotation increases to 180°.

**Evidence:** `handleSelectionRotate` calculates center of selection, applies rotation delta to each selected module's `rotation` property.

### AC4: F key flips selected horizontally

**Test:** Select 1 module at (100, 100). Press F. Verify module X position mirrored around selection center, flip state toggled.

**Evidence:** `flipGroup` calculates center X, mirrors each module's X coordinate.

### AC5: Ctrl+G creates group

**Test:** Select 2 modules. Press Ctrl+G. Verify:
- New group ID created in grouping store
- Both modules marked as belonging to group
- Selection cleared (group selected as unit)

**Evidence:** `createGroup(selectedModuleIds)` in grouping store.

### AC6: Ctrl+Shift+G dissolves group

**Test:** Select grouped modules. Press Ctrl+Shift+G. Verify:
- Group dissolved
- Modules retain current transforms (position, rotation)
- Modules become individually selectable again

**Evidence:** `ungroup(groupId)` removes group but preserves module properties.

### AC7: Group transform (rotate/scale) affects all members

**Test:** Create group of 3 modules. Press R. Verify all 3 modules rotate together around group center.

**Evidence:** `rotateGroup` and `scaleGroup` iterate all module IDs in group.

### AC8: Copy/Paste maintains connections within paste

**Test:** Copy module A connected to B. Paste. Verify C and D created with same connection between them.

**Evidence:** `duplicateSelected` copies intra-selection connections for pasted modules.

### AC9: Ctrl+Z/Ctrl+Shift+Z undo/redo work

**Test:** Place module. Press Ctrl+Z. Verify module removed. Press Ctrl+Shift+Z. Verify module restored.

**Evidence:** History stack in `useMachineStore` with `past/future` arrays.

### AC10: Build passes with 0 TypeScript errors

**Test:** `npm run build` succeeds.

**Evidence:** All new code has proper TypeScript types.

---

## Test Methods

### Unit Tests (`src/__tests__/keyboardShortcuts.test.ts`)

```typescript
describe('Keyboard Shortcuts', () => {
  // AC1: Delete
  it('Delete removes selected modules and connections', () => { ... })
  
  // AC2: Ctrl+D duplicate
  it('Ctrl+D creates offset copy without connections', () => { ... })
  
  // AC3: R rotation
  it('R rotates selected 90° clockwise', () => { ... })
  it('R key handler rotates around selection center', () => { ... })
  
  // AC4: F flip
  it('F flips selected horizontally', () => { ... })
  
  // AC5: Ctrl+G grouping
  it('Ctrl+G creates group from selection', () => { ... })
  
  // AC6: Ctrl+Shift+G ungroup
  it('Ctrl+Shift+G dissolves group', () => { ... })
  
  // AC7: Group transforms
  it('Group rotation affects all members', () => { ... })
  
  // AC8: Copy/paste connections
  it('Pasted modules maintain internal connections', () => { ... })
  
  // AC9: Undo/redo
  it('Ctrl+Z undoes last action', () => { ... })
  it('Ctrl+Shift+Z redoes undone action', () => { ... })
})
```

### Integration Tests

**`src/__tests__/groupingUtils.test.ts`**
- `calculateGroupBounds` returns correct bounding box
- `rotateGroup` positions modules correctly
- `scaleGroup` scales from center

**`src/__tests__/useGroupingStore.test.ts`** (new)
- Create/ungroup operations
- Group persistence across store updates

### E2E Simulation Test

**`src/__tests__/editorKeyboardFlow.test.ts`**
1. Create 3 modules
2. Select all (Ctrl+A)
3. Duplicate (Ctrl+D)
4. Group (Ctrl+G)
5. Rotate (R)
6. Delete (Del)
7. Undo (Ctrl+Z)
8. Verify final state

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Group transform conflicts with existing rotation | Medium | Medium | Group rotation accumulates on module rotation; reset on ungroup if needed |
| Keyboard handler conflicts with browser defaults | Low | Low | Use `e.preventDefault()` for handled shortcuts |
| Copy/paste offset causes viewport overflow | Low | Low | Clamp offset to keep modules visible, or adjust viewport |

---

## Failure Conditions

The sprint fails if ANY of the following are true:

1. **TypeScript errors**: Any `tsc` errors after implementing new code
2. **Test regressions**: Any existing test file fails (69 files, 1584 tests)
3. **Feature broken**: Delete shortcut does not remove connections
4. **Feature broken**: Group rotation only affects one module instead of all
5. **Feature broken**: Ctrl+Z/Ctrl+Shift+Z crash or produce wrong state
6. **Missing coverage**: Any AC lacks corresponding test case

---

## Done Definition

**All of the following must be true:**

1. ✅ `src/hooks/useKeyboardShortcuts.ts` handles all shortcuts in AC1-AC9
2. ✅ `src/store/useGroupingStore.ts` implements group CRUD operations
3. ✅ `src/utils/groupingUtils.ts` implements rotate/scale/flip/flipH utilities
4. ✅ `src/components/Editor/Canvas.tsx` `handleSelectionRotate` and `handleSelectionScale` implemented
5. ✅ `src/components/Editor/Toolbar.tsx` shows shortcut tooltips
6. ✅ `npm run build` succeeds with 0 TypeScript errors
7. ✅ `npm test -- --run` passes all 1584+ tests (new tests added)
8. ✅ All 10 acceptance criteria have passing tests
9. ✅ No regression in existing functionality

---

## Out of Scope

The following are explicitly NOT done in this sprint:

- **Faction variant modules**: Full visual/audio integration of faction-specific module variants
- **AI naming assistant**: Integration with AI API for dynamic name generation
- **Export modal**: Visual polish and additional export formats
- **Custom modules**: User-defined module creation
- **Multiple save slots**: Named save files
- **Community gallery**: Live backend integration
- **Accessibility improvements**: Screen reader support beyond current stubs
- **Performance optimization**: Further viewport culling or connection path caching
- **Undo/redo toolbar UI**: Visual indicators in the toolbar

---

## Dependencies

- `useMachineStore.ts` must have `past`/`future` history arrays (already present)
- `useSelectionStore.ts` must have `selectedIds` (already present)
- Module `rotation` and `scale` properties must exist on `PlacedModule` type (already defined)
