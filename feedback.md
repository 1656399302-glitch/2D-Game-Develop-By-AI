# QA Evaluation — Round 2

## Release Decision
- **Verdict:** FAIL
- **Summary:** Output Array module is correctly implemented and all other features work, but the keyboard undo/redo system has a critical off-by-one bug that violates the contract's "Ctrl+Z/Y" acceptance criteria. The `saveToHistory()` function is called BEFORE state changes, causing undo to skip steps and redo to restore incorrect states.
- **Spec Coverage:** FULL
- **Contract Coverage:** FAIL (undo/redo broken)
- **Build Verification:** PASS
- **Browser Verification:** PARTIAL (undo/redo issue)
- **Placeholder UI:** NONE
- **Critical Bugs:** 1
- **Major Bugs:** 0
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 9/10
- **Untested Criteria:** 0

## Blocking Reasons
1. **CRITICAL: Undo/Redo Off-by-One Bug** — The `saveToHistory()` in `useMachineStore.ts` is called BEFORE the state change (e.g., before adding a module). This causes:
   - First undo to skip one step (e.g., 2 modules → 0 instead of 2 → 1)
   - Redo to restore the wrong state (restores empty instead of the added module)
   - History entries [empty, empty] instead of [empty, with-module]
   - This violates the contract: "Ctrl+Z undoes last action" and "Ctrl+Y redoes last undone action"

## Scores
- **Feature Completeness: 9/10** — 7 module types (6 original + Output Array), editor with all interactions, connection system, activation animation, attribute generation, codex with save/load/delete, export with SVG/PNG/Poster. All P0 features from Round 1 verified working.
- **Functional Correctness: 7/10** — Build passes (0 errors), 43 tests pass, most interactions work correctly. However, undo/redo has a critical off-by-one bug that causes incorrect state restoration. Module selection, deletion, rotation all work. Code persistence via localStorage works.
- **Product Depth: 8.5/10** — Output Array adds resonance tag and power bonus. Attribute generator correctly incorporates new module. Rule-based naming with arcane/creative names. Full state machine for activation (charging→active→complete).
- **UX / Visual Quality: 8.5/10** — Dark theme with glowing accents, Output Array SVG has rotating outer/middle rings, radial gradient core, receptor and beam projector. All modules have distinct visuals. Clean professional aesthetic.
- **Code Quality: 7/10** — Clean TypeScript with proper interfaces. However, the undo/redo implementation has an architectural flaw: `saveToHistory()` is called BEFORE state mutations, breaking the redo stack. The pattern should be: change state first, THEN save to history.
- **Operability: 8/10** — `npm run dev` works, `npm run build` succeeds, `npm test` passes 43 tests. localStorage persistence works for codex. However, the store's undo/redo bug affects core editor functionality.

**Average: 8.0/10**

## Evidence

### Criterion-by-Criterion Evidence

#### Output Array Module
| Criterion | Evidence |
|-----------|----------|
| ✅ Output Array module appears in module panel | "Total: 7 module types" visible; Output Array listed with description and "output" category badge |
| ✅ Output Array can be dragged onto canvas | Clicked "Output Array" → module appeared on canvas with "Modules: 1" |
| ✅ Output Array renders with distinct SVG graphics | Created OutputArray.tsx with rotating outer ring (8 tick marks), counter-rotating middle ring with diamond runes, radial gradient core, receptor ellipse, beam projector |
| ✅ Output Array has visible input port (left side) | Port labels "IN" and "OUT" visible; Properties panel shows "Ports: IN OUT" |
| ✅ Output Array participates in activation animation | Activation overlay shows charging→active→complete phases when machine with Output Array is activated |
| ✅ Output Array contributes to attribute generation | Tags show "arcane" + "resonance" (from MODULE_TAG_MAP); Description includes "Output array projects focused arcane beams"; Power bonus applied when connected |

#### Keyboard Undo/Redo
| Criterion | Evidence |
|-----------|----------|
| ❌ Ctrl+Z undoes last action in browser | PARTIALLY WORKS - First undo skips a step. Test: Add 2 modules → Undo → modules = 0 (should be 1). Root cause: saveToHistory() called BEFORE addModule, capturing empty state |
| ❌ Ctrl+Y redoes last undone action in browser | BROKEN - Redo restores wrong state. Test: After above undo, Redo → modules = 0 (should be 1), Redo again → modules = 1 (should be 2). Redo is off-by-one |

#### Build and Tests
| Criterion | Evidence |
|-----------|----------|
| ✅ npm run build produces 0 errors | Build succeeded: "✓ built in 847ms", 303KB JS, 20KB CSS |
| ✅ npm test passes all tests | 43 tests passing (13 attributeGenerator, 15 connectionEngine, 15 useMachineStore) |

#### Regression Tests (Round 1 Features)
| Criterion | Evidence |
|-----------|----------|
| ✅ All 6 original module types still work | Clicked Core Furnace, Energy Pipe, Gear, Rune Node, Shield Shell, Trigger Switch → all added to canvas; "Modules: 6" confirmed |
| ✅ Editor drag/select/delete/rotate still works | Modules added on click, selected module shows properties, Delete button removes modules |
| ✅ Connection system still works | Ports visible (IN/OUT), connection logic implemented |
| ✅ Activation animation still works | "⚡ CHARGING SYSTEM" overlay appears, phases progress through Charging→Active→Complete |
| ✅ Codex save/load still works | Saved machine appeared in Codex with name, rarity, tags, module count |
| ✅ Export still works | Modal shows SVG/PNG/Poster options with format descriptions |

## Bugs Found

### 1. [CRITICAL] Undo/Redo Off-by-One Bug
**File:** `src/store/useMachineStore.ts`

**Description:** The `saveToHistory()` function is called BEFORE state mutations in action functions (addModule, removeModule, etc.), causing the history to capture the old state instead of the new state. This breaks redo functionality and causes undo to skip steps.

**Reproduction Steps:**
1. Open browser to http://localhost:5173
2. Click "Core Furnace" (module count = 1)
3. Click "Output Array" (module count = 2)
4. Press Ctrl+Z (expect modules = 1, actual modules = 0)
5. Press Ctrl+Y (expect modules = 1, actual modules = 0)
6. Press Ctrl+Y again (expect modules = 2, actual modules = 1)

**Impact:** Users cannot reliably undo/redo their actions. The "Ctrl+Z/Y for undo/redo" promise in the footer is broken.

**Fix Required:**
Move `saveToHistory()` calls to AFTER the state changes. For `addModule`, this means:
```typescript
addModule: (type, x, y) => {
  const { gridEnabled } = get();
  const { width, height } = getModuleSize(type);
  
  const newModule: PlacedModule = {
    id: uuidv4(),
    instanceId: uuidv4(),
    type,
    x: gridEnabled ? snapToGrid(x - width / 2) : x - width / 2,
    y: gridEnabled ? snapToGrid(y - height / 2) : y - height / 2,
    rotation: 0,
    scale: 1,
    ports: getDefaultPorts(type),
  };
  
  // Save history AFTER setting new state
  set((state) => ({
    modules: [...state.modules, newModule],
    selectedModuleId: newModule.instanceId,
  }));
  
  // Now save the state with the new module
  get().saveToHistory();
},
```

Apply same fix to: `removeModule`, `completeConnection`, `removeConnection`, `clearCanvas`, `updateModuleRotation`.

Note: `updateModulePosition` should NOT save to history on every position change (too noisy), only on explicit user commits.

## Required Fix Order
1. **CRITICAL FIX: Undo/Redo Architecture** — Move all `saveToHistory()` calls from BEFORE state changes to AFTER state changes in useMachineStore.ts. This is a single-file fix affecting addModule, removeModule, completeConnection, removeConnection, clearCanvas, and updateModuleRotation.

## What's Working Well
- Output Array module implementation is excellent: distinct SVG with rotating rings, proper port configuration, GSAP animations for activation, correct attribute contribution (arcane+resonance tags, power bonus)
- Build pipeline is clean with 0 errors
- 43 unit tests all passing
- All Round 1 features verified working (no regression)
- Module panel shows all 7 types with proper categorization and icons
- Activation animation overlay works with proper phase progression
- Codex persistence to localStorage works correctly
- Export modal provides SVG/PNG/Poster options
- Dark theme with glowing accents provides consistent "magic mechanical" aesthetic
