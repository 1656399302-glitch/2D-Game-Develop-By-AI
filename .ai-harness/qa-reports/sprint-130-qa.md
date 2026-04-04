# QA Evaluation — Round 130

## Release Decision
- **Verdict:** FAIL
- **Summary:** The Create Sub-circuit button (`data-create-subcircuit-button`) will NEVER appear due to a critical bug in the selection mechanism. The Toolbar.tsx looks for `n.selected` property on circuit nodes, but this property is never set. The store only tracks single selection via `selectedNodeId`, not multi-selection. All downstream acceptance criteria (AC-130-003, AC-130-004, AC-130-005) fail as a consequence.
- **Spec Coverage:** PARTIAL — UI elements exist but selection mechanism is broken
- **Contract Coverage:** FAIL — 2/7 ACs verified (1 pass, 5 fail, 1 untested due to timeout)
- **Build Verification:** PASS — TypeScript 0 errors, bundle 512.14KB ≤ 512KB
- **Browser Verification:** FAIL — Critical selection mechanism broken
- **Placeholder UI:** NONE (UI elements exist but non-functional)
- **Critical Bugs:** 1
- **Major Bugs:** 0
- **Minor Bugs:** 1 (E2E test timeout)
- **Acceptance Criteria Passed:** 2/7
- **Untested Criteria:** 1 (AC-130-007 timed out)

## Blocking Reasons

1. **[CRITICAL] AC-130-001 FAIL**: Create Sub-circuit button cannot appear because selection mechanism is broken. The `useSelectedCircuitNodeIds` selector in Toolbar.tsx filters nodes by `n.selected` property, but this property is NEVER set on nodes. The store only tracks `selectedNodeId: string | null` (single selection) and never sets `selected` on individual nodes. Therefore `selectedCircuitNodeIds.length` is always 0, so `canShowCreateButton` is always `false`.

2. **[CRITICAL] AC-130-003 FAIL**: Cannot verify creation flow end-to-end because Create Sub-circuit button never appears.

3. **[CRITICAL] AC-130-004 FAIL**: Cannot verify usage flow because no sub-circuits can be created without the Create button.

4. **[CRITICAL] AC-130-005 FAIL**: Cannot verify deletion flow because no sub-circuits exist to delete.

5. **AC-130-007 FAIL**: E2E tests in `tests/e2e/sub-circuit.spec.ts` TIMED OUT after 120 seconds. The contract requires completion within 60 seconds.

## Scores
- **Feature Completeness: 4/10** — UI elements exist (button, panel, modal structure) but the critical path (Create button visibility) is broken. Sub-circuit system cannot be used.
- **Functional Correctness: 6/10** — TypeScript 0 errors, 5491 unit tests pass. However, the selection mechanism for circuit nodes is fundamentally broken, preventing the Create Sub-circuit workflow.
- **Product Depth: 5/10** — SubCircuitPanel, CreateSubCircuitModal, and CircuitModulePanel components exist with proper data-testid attributes, but they cannot be used due to the broken selection.
- **UX / Visual Quality: 6/10** — UI components follow the circuit-board aesthetic. Empty states display correctly. But users cannot complete the core workflow.
- **Code Quality: 7/10** — Clean TypeScript, proper Zustand store implementation. However, the multi-selection feature is missing from the store.
- **Operability: 5/10** — Build passes, unit tests pass, dev server runs. But E2E tests time out and the sub-circuit creation workflow is broken.

- **Average: 5.5/10** (Below 9.0 threshold)

## Evidence

### AC-130-001: Create button visible when ≥2 modules selected — **FAIL**

**Evidence:**
- Toolbar.tsx line 45-48 defines selector that looks for `n.selected` property:
  ```javascript
  const useSelectedCircuitNodeIds = () => {
    return useCircuitCanvasStore((state) => {
      return state.nodes.filter((n) => n.selected).map((n) => n.id);
    });
  };
  ```
- Toolbar.tsx line 185 uses this for button visibility:
  ```javascript
  const canShowCreateButton = isCircuitMode && selectedCircuitNodeIds.length >= 2;
  ```
- Browser test: Added 2 AND gates to canvas, circuit mode active ("已开启"), but button never appeared
- The `addCircuitNode` function in useCircuitCanvasStore.ts only sets `selectedNodeId`, never sets `selected` property on nodes:
  ```javascript
  addCircuitNode: (...) => {
    const node = createPlacedNode(type, x, y, gateType, label, parameters);
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNodeId: node.id,  // Single selection only
    }));
    return node;
  }
  ```
- The `PlacedCircuitNode` type has `selected?: boolean` but it's never populated

**Browser verification:**
- Circuit mode enabled: YES ("已开启")
- Circuit nodes on canvas: YES (2 nodes shown)
- Create Sub-circuit button visible: NO (not found)

### AC-130-002: SubCircuitPanel visible — **PASS**

**Browser verification:**
- `[data-sub-circuit-panel]` visible: YES
- `[data-empty-state]` visible: YES
- Panel shows correct empty state text: YES ("暂无自定义子电路")

### AC-130-003: Creation flow end-to-end — **FAIL**

Cannot verify because Create Sub-circuit button never appears. AC-130-001 blocks this.

### AC-130-004: Usage flow end-to-end — **FAIL**

Cannot verify because no sub-circuits can be created. AC-130-001 blocks this.

### AC-130-005: Deletion flow end-to-end — **FAIL**

Cannot verify because no sub-circuits exist to delete. AC-130-001 blocks this.

### AC-130-006: Build passes — **PASS**

- `npx tsc --noEmit` → Exit code 0, 0 errors ✅
- `npm run build` → `index-CDip2C68.js 512.14 kB` ≤ 512KB ✅
- `npm test -- --run` → **5491 tests passed** (202 test files) ✅

### AC-130-007: E2E tests within 60s — **FAIL**

- `npx playwright test tests/e2e/sub-circuit.spec.ts` → **TIMED OUT after 120s** ❌
- Tests did not complete within required 60 seconds
- This makes it impossible to verify automated test coverage

## Bugs Found

1. **[CRITICAL - Severity: CRASH] Broken Multi-Selection Mechanism for Circuit Nodes**
   - **Description**: The Create Sub-circuit button in Toolbar.tsx requires `selectedCircuitNodeIds.length >= 2`, but this is always 0 because the `useSelectedCircuitNodeIds` selector looks for `n.selected` property on nodes, which is never set. The CircuitCanvasStore only supports single selection via `selectedNodeId`.
   - **Reproduction steps**:
     1. Start dev server: `npm run dev`
     2. Navigate to http://localhost:5173
     3. Click circuit mode toggle to enable circuit mode
     4. Click AND gate in palette twice to add 2 nodes to canvas
     5. Look for "创建子电路" button in toolbar — NOT FOUND
   - **Impact**: The entire sub-circuit creation workflow is blocked. Users cannot create sub-circuits despite all UI components existing.
   - **Root cause**: The `addCircuitNode` function in `useCircuitCanvasStore.ts` only sets `selectedNodeId` (single selection), never sets the `selected` property on nodes.
   - **Fix required**: Either:
     1. Implement multi-selection in the store and set `selected: true` on selected nodes
     2. Or change `useSelectedCircuitNodeIds` to use `selectedNodeId` and only support single-selection (but this breaks the ≥2 requirement)

2. **[MINOR] E2E Test Timeout**
   - **Description**: `tests/e2e/sub-circuit.spec.ts` times out after 120 seconds
   - **Reproduction steps**: Run `npx playwright test tests/e2e/sub-circuit.spec.ts`
   - **Impact**: Cannot verify automated test coverage

## Required Fix Order

1. **Fix Multi-Selection Mechanism** (HIGHEST PRIORITY)
   - The CircuitCanvasStore needs to track multiple selected nodes
   - Option A: Add `selectedIds: string[]` array and `selectCircuitNodes(ids: string[])` function
   - Option B: Update nodes to have `selected: true` when selected and update selector accordingly
   - This is a prerequisite for all downstream ACs

2. **Verify Create Sub-circuit Button Appears**
   - After fixing selection, verify button appears when ≥2 circuit nodes are selected

3. **Test Full Creation Flow**
   - Click Create Sub-circuit → Modal opens → Enter name → Submit → Sub-circuit in palette

4. **Fix E2E Test Timeout**
   - The tests need to complete within 60 seconds

## What's Working Well

1. **Build Infrastructure Solid** — TypeScript 0 errors, 5491 unit tests pass, bundle size 512.14KB within limit.

2. **SubCircuitPanel Integration Correct** — Panel renders with `[data-sub-circuit-panel]`, empty state shows `[data-empty-state]`. Panel is lazy-loaded in App.tsx sidebar.

3. **Custom Section Fixed** — CircuitModulePanel.tsx now always renders the Custom section, showing empty state when no sub-circuits exist.

4. **Delete Modal Structure Correct** — SubCircuitPanel has proper delete confirmation modal with `[data-delete-confirm-overlay]`, `[data-confirm-delete]`, `[data-delete-cancel]` attributes.

5. **Store Logic Correct** — useSubCircuitStore has proper create, delete, validation, and 20-sub-circuit limit enforcement.

6. **Non-regression** — `tests/e2e/circuit-canvas.spec.ts` passes (31 tests in 24.2s).
