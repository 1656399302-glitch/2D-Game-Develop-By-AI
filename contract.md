# APPROVED — Sprint Contract Round 2

## Scope

This sprint focuses on **UX Enhancements and Editor Polish** to improve the creation experience. Building on the stable foundation from Round 1, we will implement:

1. **Multi-select and alignment tools** - Allow users to select multiple modules and align them (left, center, right, top, middle, bottom)
2. **Box selection** - Drag to select multiple modules on canvas using Shift+Drag
3. **Auto-layout suggestion** - One-click arrangement for messy layouts (appears when 3+ modules exist)
4. **Z-order/Layer controls** - Bring forward, send backward, bring to front, send to back (inline with spec: "层级调整")

**Note:** The "Faction Card preview enhancement" item has been removed as it was verified complete in Round 1 QA (AC5: EnhancedShareCard uses `factionConfig.color` for faction badge with correct colors per faction).

---

## Spec Traceability

### P0 items covered this round
- **Box selection** (spec: "框选")
- **Module alignment tools** (spec: "对齐")
- **Z-order/Layer controls** (spec: "层级调整")

### P1 items covered this round
- Multi-select operations (Shift+Click to add/remove, Ctrl+A for select all)
- Alignment actions (align left, center, right, top, middle, bottom)
- Auto-layout suggestion (grid arrangement when 3+ modules)
- Layer operations (bring forward, send backward, bring to front, send to back)

### P2 items intentionally deferred
- Module color/style customization (needs design system work)
- Copy/paste between different machines (clipboard already exists)
- AI naming assistant integration (needs external API)
- Community sharing features (backend required)
- Advanced recipe unlock system (needs more content)

### Remaining P0/P1 after this round
- P0: All core editor features (drag, drop, selection, delete, rotate) ✓
- P0: Connection system ✓
- P0: Activation preview system ✓
- P0: Attribute generation ✓
- P0: Faction system ✓
- P1: Machine Codex/Collection system ✓
- P1: Random Forge ✓
- P1: Export functionality ✓
- P2: Remaining deferred items (see above)

---

## Deliverables

1. **`src/store/useSelectionStore.ts`** - New store for multi-select state management
   - `selectedModuleIds: string[]`
   - `addToSelection(id: string): void`
   - `removeFromSelection(id: string): void`
   - `clearSelection(): void`
   - `selectAll(moduleIds: string[]): void`
   - `toggleSelection(id: string): void`

2. **`src/components/Editor/AlignmentToolbar.tsx`** - New alignment and layer controls
   - Alignment dropdown: left, center, right, top, middle, bottom icons
   - Layer dropdown: bring forward, send backward, bring to front, send to back
   - Only visible when 2+ modules selected

3. **`src/components/Editor/Canvas.tsx`** (modified) - Box selection functionality
   - Shift+Drag on empty canvas area creates selection rectangle
   - Rectangle: semi-transparent fill (#3b82f6 at 20% opacity), dashed border
   - All modules within rectangle on mouse release get selected

4. **`src/utils/alignmentUtils.ts`** - New alignment calculation utilities
   - `calculateAlignmentBounds(modules): Bounds`
   - `alignModules(modules, alignment, bounds): ModulePosition[]`
   - `alignLeft, alignCenter, alignRight, alignTop, alignMiddle, alignBottom`

5. **`src/utils/zOrderUtils.ts`** - New z-index management utilities
   - `bringForward(moduleId, allModules): void`
   - `sendBackward(moduleId, allModules): void`
   - `bringToFront(moduleId, allModules): void`
   - `sendToBack(moduleId, allModules): void`

6. **`src/utils/autoLayout.ts`** - Auto-arrangement algorithm
   - `autoArrange(modules, containerWidth): ModulePosition[]`
   - Grid-based layout with consistent spacing
   - Maintains connections after layout

7. **`src/hooks/useKeyboardShortcuts.ts`** (modified) - Keyboard shortcuts
   - `Shift+Click`: Toggle module in selection
   - `Ctrl/Cmd+A`: Select all modules
   - `Ctrl/Cmd+D`: Deselect all

8. **Test files**:
   - `src/__tests__/useSelectionStore.test.ts`
   - `src/__tests__/alignmentUtils.test.ts`
   - `src/__tests__/zOrderUtils.test.ts`
   - `src/__tests__/autoLayout.test.ts`

---

## Acceptance Criteria

### AC1: Box Selection Works
- **Given** user has modules on canvas
- **When** user presses Shift and drags on empty canvas area
- **Then** a selection rectangle appears (semi-transparent blue fill, dashed border)
- **And** when mouse is released, all modules inside the rectangle are selected
- **And** selection rectangle disappears

### AC2: Multi-Select Operations Work
- **When** user Shift+Clicks a module that is NOT selected
- **Then** the module is added to the current selection
- **When** user Shift+Clicks a module that IS selected
- **Then** the module is removed from selection
- **When** user presses Ctrl/Cmd+A
- **Then** all modules on canvas are selected
- **And** all selected modules show visual distinction (highlighted border: #3b82f6)

### AC3: Alignment Tools Function Correctly
- **Given** 3+ modules are selected
- **When** user clicks "Align Left"
- **Then** all selected modules have X coordinate equal to the leftmost module's X
- **When** user clicks "Align Center"  
- **Then** all selected modules have X coordinate at the median X of selection
- **When** user clicks "Align Right"
- **Then** all selected modules have X coordinate equal to the rightmost module's X
- **When** user clicks "Align Top"
- **Then** all selected modules have Y coordinate equal to the topmost module's Y
- **When** user clicks "Align Middle"
- **Then** all selected modules have Y coordinate at the median Y of selection
- **When** user clicks "Align Bottom"
- **Then** all selected modules have Y coordinate equal to the bottommost module's Y
- **And** modules stay within canvas bounds (0 to 800 on X/Y)

### AC4: Z-Order/Layer Controls Work
- **Given** 3 modules with z-indices [1, 2, 3] where module C is at 3
- **When** user selects module A (z-index 1) and clicks "Bring Forward"
- **Then** module A's z-index becomes 2 (swapped with module B)
- **When** user selects module A and clicks "Bring to Front"
- **Then** module A's z-index becomes 4 (highest)
- **When** user selects module C (z-index 3) and clicks "Send Backward"
- **Then** module C's z-index becomes 1 (swapped with module A)
- **When** user selects module C and clicks "Send to Back"
- **Then** module C's z-index becomes 0 (lowest)

### AC5: Auto-Layout Suggestion Works
- **Given** user has 3+ modules on canvas (scattered positions)
- **When** user clicks "Auto Arrange" button in toolbar
- **Then** a grid layout is calculated with consistent spacing
- **And** modules are repositioned to grid positions
- **And** all module connections are preserved (paths recalculated)
- **And** all modules stay within canvas bounds

### AC6: Build Passes
- `npm run build` exits with code 0
- No TypeScript errors introduced
- All existing tests pass

### AC7: No Placeholder UI
- All new features have functional UI
- No "// TODO" or "// FIXME" comments in new code
- All buttons and interactions have handlers
- Alignment toolbar only appears when 2+ modules selected
- Auto Arrange button only appears when 3+ modules exist

---

## Test Methods

### TM1: Box Selection
```
Manual Test:
1. Open canvas with 5+ modules placed
2. Press and hold Shift
3. Drag mouse on empty area (not on a module)
4. Verify: selection rectangle appears during drag
5. Release mouse
6. Verify: modules inside rectangle are selected, rectangle gone

Automated Test (useSelectionStore.test.ts):
- Test addToSelection, removeFromSelection, toggleSelection
- Test that toggle correctly adds/removes
- Test clearSelection empties array
- Test selectAll replaces selection
```

### TM2: Multi-Select
```
Manual Test:
1. Click module A (1 selected)
2. Shift+Click module B (2 selected)
3. Shift+Click module A (1 selected, A removed)
4. Press Ctrl+A (all selected)

Automated Test (useSelectionStore.test.ts):
- Test addToSelection, removeFromSelection, toggleSelection
- Test that toggle correctly adds/removes
- Test clearSelection empties array
- Test selectAll replaces selection
```

### TM3: Alignment Calculations
```
Automated Test (alignmentUtils.test.ts):
1. Create 3 modules at positions: {x:10, y:50}, {x:100, y:100}, {x:200, y:75}
2. Call alignLeft(modules)
3. Assert: all modules have x=10
4. Call alignRight(modules)
5. Assert: all modules have x=200
6. Call alignCenter(modules)
7. Assert: all modules have x=100 (median)
8. Test vertical alignments similarly
```

### TM4: Z-Order Operations
```
Automated Test (zOrderUtils.test.ts):
1. Create 3 modules with z-indices 1, 2, 3
2. Call bringForward(module1)
3. Assert: module1 z-index = 2, module2 z-index = 1
4. Call bringToFront(module2)
5. Assert: module2 z-index = 4 (was 2, +2 = highest+1)
6. Test sendBackward and sendToBack similarly
```

### TM5: Auto-Layout
```
Automated Test (autoLayout.test.ts):
1. Create 6 modules at random positions
2. Call autoArrange(modules, containerWidth=800)
3. Assert: all modules have x,y within bounds
4. Assert: modules are arranged in grid pattern (consistent spacing)
5. Assert: connections array length unchanged
```

### TM6: Build Verification
```bash
npm run build   # Must exit 0
npm test        # Must show all tests passing
```

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Box selection interferes with panning | Low | Medium | Box select only activates on Shift+Drag; plain drag remains pan |
| Alignment moves modules off-canvas | Low | High | Clamp positions to 0-800 range after alignment |
| Auto-layout disconnects existing paths | Medium | High | Recalculate all connection paths after repositioning |
| Z-order changes affect visual layering unexpectedly | Low | Medium | Test with overlapping modules to verify correct stacking |
| Selection state conflicts with other interactions | Medium | Medium | Selection store must properly coordinate with module store |

---

## Failure Conditions

The round **MUST FAIL** if:

1. **Build fails** - Any TypeScript compilation error or `npm run build` non-zero exit
2. **Tests fail** - Any existing test in `src/__tests__/` fails
3. **Regression in core features** - Module drag, drop, connection, or export stops working
4. **New feature crashes** - Any new component causes runtime errors when used
5. **Visual regression** - Existing UI elements change appearance unexpectedly
6. **Partial implementation** - Any acceptance criterion has only placeholder/stub code

---

## Done Definition

The round is complete when ALL of the following are true:

1. ☐ Box selection rectangle appears when Shift+Dragging on empty canvas
2. ☐ Multiple modules can be selected via Shift+Click, Ctrl+A, and box selection
3. ☐ All 6 alignment options (left, center, right, top, middle, bottom) work correctly
4. ☐ All 4 layer options (bring forward/backward, front/back) work correctly
5. ☐ Auto-arrange button appears when 3+ modules exist
6. ☐ Auto-arrange creates grid layout and preserves connections
7. ☐ `npm run build` exits with code 0
8. ☐ `npm test` passes all tests (expected: 540+, including new tests)
9. ☐ No console errors in browser when using new features
10. ☐ All new UI elements have proper styling matching project theme (dark background, neon accents)
11. ☐ No TODO/FIXME comments in new code
12. ☐ Keyboard shortcuts (Shift+Click, Ctrl+A) work as specified

---

## Out of Scope

The following features from `spec.md` are explicitly NOT part of this sprint:

1. **Module color/style customization** - Requires design system work, deferred
2. **AI naming/description generation** - Requires external API integration, deferred
3. **Community sharing or multiplayer** - Requires backend, deferred
4. **Advanced recipe unlock system** - Needs more content before implementation
5. **Challenge/achievement expansions** - Core system works, enhancements deferred
6. **Mobile/touch support** - Web desktop focus maintained
7. **Plugin/module system** - Architecture work needed, deferred
8. **Faction Card border preview enhancement** - VERIFIED COMPLETE in Round 1 QA

---

## Notes

- This sprint adds polish features to the stable Round 1 foundation
- All changes maintain backward compatibility with existing machines
- New keyboard shortcuts: `Shift+Click` = toggle in selection, `Ctrl/Cmd+A` = select all
- Alignment toolbar appears as dropdown when 2+ modules selected
- Layer controls appear as dropdown in same toolbar area
- Auto Arrange button appears in toolbar when 3+ modules exist
- Selection state persists until user clicks empty canvas or presses Escape
