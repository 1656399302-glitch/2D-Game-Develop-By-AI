APPROVED — Sprint Contract Round 27

## Feature Focus: Enhanced Canvas Operations

This sprint adds copy/paste, module grouping, visual layers panel, and smart snap-to-grid to make the editor significantly more powerful. All changes must be additive and non-breaking.

---

## Scope

**P0 Items (Must Complete This Round)**
- Module grouping/ungrouping (Ctrl+G / Ctrl+Shift+G)
- Copy/paste support for modules (Ctrl+C / Ctrl+V)
- Visual layers panel for z-order management
- Smart snap-to-grid functionality (8px threshold)

**P1 Items (Should Complete If Time Permits)**
- Selection handles for multi-selected modules
- Duplicate at offset for paste operations
- Group alignment and distribution

**P2 Intentionally Deferred**
- Cloud save/load, sound effects, custom keyboard rebinding, social features, JSON import

---

## Deliverables

1. `src/utils/clipboardUtils.ts` — Module clipboard operations
   - `copyModules(moduleIds: string[]): ClipboardData`
   - `pasteModules(clipboard: ClipboardData, position: Point): ModuleInstance[]`
   - `duplicateModules(moduleIds: string[]): ModuleInstance[]`

2. `src/utils/groupingUtils.ts` — Module grouping/ungrouping logic
   - `createGroup(moduleIds: string[], name?: string): GroupInstance`
   - `ungroupModules(groupId: string): string[]`
   - `getGroupBounds(modules: ModuleInstance[]): Bounds`

3. `src/components/Editor/LayersPanel.tsx` — Visual layers panel
   - Collapsible panel showing all modules
   - Visibility toggles per layer
   - Up/down reorder buttons
   - Drag-to-reorder support

4. `src/components/Editor/SelectionHandles.tsx` — Selection bounding box
   - 8 resize handles (corners + midpoints)
   - Rotation handle
   - Visual bounding box for multi-selection

5. Updates to `src/components/Editor/Canvas.tsx`
   - Snap-to-grid logic (8px threshold)
   - Copy/paste keyboard handlers
   - Group movement synchronization

6. Updates to `src/hooks/useKeyboardShortcuts.ts`
   - Ctrl+C: Copy selected modules
   - Ctrl+V: Paste modules at cursor
   - Ctrl+G: Group selected modules
   - Ctrl+Shift+G: Ungroup selected
   - Ctrl+D: Duplicate at offset

7. Unit Tests
   - `src/__tests__/clipboardUtils.test.ts`
   - `src/__tests__/groupingUtils.test.ts`
   - `src/__tests__/layersPanel.test.tsx`

---

## Acceptance Criteria

All criteria verified by automated CI tests.

| # | Criterion | Concrete Verification |
|---|-----------|----------------------|
| AC1 | Ctrl+C copies selected modules; Ctrl+V pastes at cursor with offset | `userEvent.keyboard('{Control>c}{c}{/Control}')` → clipboard state updated; paste creates modules at new positions with unique IDs |
| AC2 | Ctrl+G groups selected modules; Ctrl+Shift+G ungroups; group moves together | After Ctrl+G, `getByTestId('module-{id}').getAttribute('data-group-id')` matches group ID; after move, all group members update position |
| AC3 | Layers panel shows modules with visibility toggles and z-order controls | `expect(screen.getAllByTestId(/layer-item-/)).toHaveLength(moduleCount)`; toggle click → module `isVisible` attribute changes |
| AC4 | Grid enabled: dragging snaps to nearest grid point within 8px threshold | Module position after drag is exactly on grid (position % gridSize === 0) when drag ended within 8px of grid line |
| AC5 | Multi-selected modules show bounding box with 8 resize handles + rotation | `expect(screen.getAllByTestId(/resize-handle-/)).toHaveLength(8)`; `expect(screen.getByTestId('rotate-handle')).toBeInTheDocument()` |
| AC6 | `npm run build` completes with 0 TypeScript errors | `npm run build` exit code = 0 |
| AC7 | All existing tests pass (no regressions) | `npm test -- --run` exit code = 0 |
| AC8 | Paste at empty canvas or outside boundary: no errors | `userEvent.keyboard('{Control>c}{Control+v}')` with empty selection → no console.error; mouse at (-1000, -1000) + paste → graceful no-op |

---

## Test Methods

### clipboardUtils.test.ts
- `copyModules()` with 1 module, multiple modules, empty selection
- `pasteModules()` at valid position, at boundary, duplicate paste
- `duplicateModules()` creates correct offset, preserves properties

### groupingUtils.test.ts
- `createGroup()` returns correct bounds, assigns group ID
- `ungroupModules()` returns constituent module IDs
- `getGroupBounds()` calculates correct rectangle from module positions

### layersPanel.test.tsx
- Panel renders with all module layers
- Visibility toggle updates module visibility
- Z-order buttons change module zIndex
- Keyboard shortcut (Escape) closes panel

---

## Failure Conditions

| # | Failure Condition | Automatic Detection |
|---|-------------------|----------------------|
| F1 | Build fails with TypeScript errors | `npm run build` exit code != 0 |
| F2 | Copy with no selection causes error | `copyModules([])` throws or logs console.error |
| F3 | Paste creates modules with invalid coordinates | `position.x < 0 && position.x < -100` or `isNaN(position.x)` |
| F4 | Group movement causes modules to overlap incorrectly | After group move, modules in same group have overlapping x/y ranges |
| F5 | Layers panel visibility toggle doesn't affect rendering | Module visible in layers panel but not rendered on canvas |
| F6 | Multi-selection doesn't show bounding box | `screen.getAllByTestId(/resize-handle-/)` returns empty after selecting 2+ modules |
| F7 | Existing tests fail (regression) | `npm test -- --run` exit code != 0 |
| F8 | Console errors during tests | Jest reports unhandled console errors |

---

## Done Definition

- [ ] `npm run build` succeeds with 0 TypeScript errors (exit code 0)
- [ ] `npm test -- --run src/__tests__/clipboardUtils.test.ts` passes
- [ ] `npm test -- --run src/__tests__/groupingUtils.test.ts` passes
- [ ] `npm test -- --run src/__tests__/layersPanel.test.tsx` passes
- [ ] Ctrl+C copies selected modules to clipboard store (verified via store state)
- [ ] Ctrl+V creates new module instances at cursor position with offset (unique IDs verified)
- [ ] Ctrl+G creates group with `groupId` assigned to all member modules
- [ ] Moving group moves all member modules by same delta
- [ ] Ctrl+Shift+G removes group and returns constituent module IDs
- [ ] Layers panel renders all modules with visibility toggles
- [ ] Toggling visibility changes module `isVisible` property
- [ ] Grid snapping: dragged module lands exactly on grid line
- [ ] Multi-selection shows bounding box with 8 resize handles
- [ ] All existing 1403+ tests continue to pass
- [ ] No console.error or console.warn during test execution

---

## Out of Scope

1. Undo/redo for clipboard operations
2. Drag-select multiple modules across non-contiguous areas
3. Drag-and-drop modules into layers panel
4. Group nesting (groups within groups)
5. Saving groups as reusable templates
6. Touch-based copy/paste gestures
7. Export of grouped modules as single SVG element
8. Custom keyboard shortcut rebinding

---

## Spec Traceability Confirmation

The `spec.md` file correctly describes the "Arcane Machine Codex Workshop" project. This sprint's Enhanced Canvas Operations implement core editing features that align with the project scope: module manipulation, layer management, and precision placement capabilities. No spec.md updates required.
