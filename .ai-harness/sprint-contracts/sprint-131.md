# Sprint Contract — Round 131

## Scope

Fix the critical multi-selection bug that prevents the Create Sub-circuit button from appearing. The root cause is that `useSelectedCircuitNodeIds` in `Toolbar.tsx` filters nodes by `n.selected` property, but this property is never set by the store. The store only tracks single selection via `selectedNodeId`.

## Spec Traceability

### P0 items (Must Fix — Blocked in Round 130)
- **AC-130-001**: Create button visible when ≥2 circuit nodes selected — **FAILING** due to broken multi-selection
- **AC-130-003**: Creation flow end-to-end — **BLOCKED** by AC-130-001
- **AC-130-004**: Usage flow end-to-end — **BLOCKED** by AC-130-003
- **AC-130-005**: Deletion flow end-to-end — **BLOCKED** by AC-130-004

### P1 items (Regression Prevention)
- **AC-130-002**: SubCircuitPanel visible — **PASSING**, must not regress
- **AC-130-006**: Build passes — **PASSING**, must not regress (TypeScript, bundle, unit tests)
- **AC-130-007**: E2E tests within 60s — **TIMING OUT**, needs investigation after core fix

### Remaining P0/P1 after this round
- All ACs from Round 130 should pass after multi-selection fix
- E2E timeout may require separate investigation

### P2 intentionally deferred
- Sub-circuit circuit-level operations (connecting sub-circuits with wires)
- Sub-circuit validation before creation
- Performance optimization for large sub-circuit palettes

## Deliverables

1. **Fixed `src/store/useCircuitCanvasStore.ts`**
   - Add `selectedCircuitNodeIds: string[]` array to store state (initialize to `[]`)
   - Add `selectCircuitNodes(ids: string[])` action to set multiple selections atomically
   - Add `toggleCircuitNodeSelection(id: string)` action that adds/removes from selection
   - Add `clearCircuitNodeSelection()` action that resets to `[]`
   - Update `addCircuitNode` to call `selectCircuitNodes([node.id])` for single-node addition
   - Maintain `selectedNodeId: string | null` for backward compatibility with existing single-selection code

2. **Fixed `src/components/Editor/Toolbar.tsx`**
   - **REPLACE** the broken selector (which filters `state.nodes.filter((n) => n.selected)`) with direct read from `selectedCircuitNodeIds` array
   - Fix `canShowCreateButton` condition to check `selectedCircuitNodeIds.length >= 2`

3. **Fixed `src/components/Canvas/CircuitCanvas.tsx` (or similar)**
   - Ensure canvas click handler reads from store's selection actions (not node properties)
   - Support Shift+Click for range selection (add all nodes between last selected and clicked)
   - Support Cmd/Ctrl+Click for toggle selection (call `toggleCircuitNodeSelection`)
   - Support plain Click to select single node (call `selectCircuitNodes([clickedId])`)

4. **Fixed E2E test `tests/e2e/sub-circuit.spec.ts`**
   - Remove any infinite waits or 120s timeout-prone operations
   - Use Playwright's `waitForSelector` with explicit timeouts (max 10s per wait)
   - Ensure tests complete within 60 seconds total

5. **New unit tests in `src/__tests__/`**
   - `circuitMultiSelect.test.ts`: Test multi-selection store actions
   - Test that `selectedCircuitNodeIds.length >= 2` triggers button visibility logic

## Acceptance Criteria

1. **AC-131-001**: Create Sub-circuit button appears when exactly 2 circuit nodes are selected
   - Add 2 AND gates to circuit canvas
   - Click first node, then Shift+Click second node (or Cmd/Ctrl+Click)
   - Verify `[data-create-subcircuit-button]` is visible

2. **AC-131-002**: Create Sub-circuit button appears when more than 2 circuit nodes are selected
   - Add 3 circuit nodes
   - Select all 3 using multi-select
   - Verify button remains visible

3. **AC-131-003**: Create Sub-circuit button disappears when fewer than 2 nodes selected
   - Start with 2 selected nodes (button visible)
   - Deselect one node (only 1 selected)
   - Verify button disappears

4. **AC-131-004**: Single selection still works correctly
   - Add 1 circuit node and click it
   - Verify node is selected (visual highlight)
   - Verify `selectedCircuitNodeIds` contains exactly 1 ID
   - Verify `selectedNodeId` is set in store (backward compatibility)

5. **AC-131-005**: Sub-circuit creation flow completes end-to-end
   - Enable circuit mode
   - Add 2 AND gates
   - Multi-select both nodes
   - Click "创建子电路" button
   - Modal opens with `[data-create-subcircuit-modal]`
   - Enter name "TestSubCircuit"
   - Submit form
   - Verify sub-circuit appears in Custom section

6. **AC-131-006**: Sub-circuit can be placed on canvas
   - After creating "TestSubCircuit" from AC-131-005
   - Click "TestSubCircuit" in Custom section
   - Verify module appears on canvas

7. **AC-131-007**: Sub-circuit can be deleted
   - Have at least 1 sub-circuit from AC-131-005/006
   - Click delete button `[data-subcircuit-delete-button]` on the sub-circuit item
   - Confirm deletion in modal `[data-delete-confirm-overlay]` then click `[data-confirm-delete]`
   - Verify sub-circuit removed from palette (item no longer exists)

8. **AC-131-008**: Build passes
   - `npx tsc --noEmit` → 0 errors
   - `npm run build` → bundle ≤512KB
   - `npm test -- --run` → all tests pass

9. **AC-131-009**: E2E tests complete within 60 seconds
   - `npx playwright test tests/e2e/sub-circuit.spec.ts` → completes in ≤60s

## Test Methods

### Browser Verification (AC-131-001 through AC-131-007)

**Entry**: Navigate to http://localhost:5173, wait for app load

**Setup workflow**:
1. Click `[data-circuit-mode-toggle]` to enable circuit mode
2. Wait for "已开启" text to appear
3. Click `[data-circuit-component="AND"]` twice to add 2 nodes
4. Wait for both nodes to appear on canvas

**Multi-select workflow (AC-131-001, AC-131-002)**:
1. Locate the first circuit node on canvas (click on it)
2. Press and hold Shift, then click the second node (or hold Cmd/Ctrl and click second node)
3. Wait 500ms for selection state to propagate
4. Check `[data-create-subcircuit-button]` for visibility
5. For AC-131-002: Add a third node, then Shift+Click it to add to selection

**Deselect workflow (AC-131-003)**:
1. Start with 2 selected nodes and button visible
2. Shift+Click the first selected node to deselect it (toggle behavior)
3. Wait 500ms
4. Verify `[data-create-subcircuit-button]` is NOT visible

**Single select workflow (AC-131-004)**:
1. Click any unselected node on canvas
2. Wait 500ms
3. Verify node has visual highlight (selected state)
4. Verify `selectedCircuitNodeIds` contains exactly 1 ID

**Modal workflow (AC-131-005)**:
1. Ensure ≥2 nodes selected, button visible
2. Click `[data-create-subcircuit-button]`
3. Wait for `[data-create-subcircuit-modal]` to be visible (max 5s)
4. Find input `[data-subcircuit-name-input]` and type "TestSubCircuit"
5. Click `[data-subcircuit-submit]`
6. Wait for modal to be hidden (max 5s)
7. Verify `[data-subcircuit-item]` containing "TestSubCircuit" appears in Custom section (max 5s)

**Usage workflow (AC-131-006)**:
1. Click "TestSubCircuit" item in Custom section
2. Verify a module appears on canvas (circuit mode should auto-enable or prompt)

**Deletion workflow (AC-131-007)**:
1. Locate "TestSubCircuit" in Custom section
2. Click `[data-subcircuit-delete-button]` on that item
3. Wait for `[data-delete-confirm-overlay]` to be visible (max 5s)
4. Click `[data-confirm-delete]`
5. Wait for overlay to be hidden (max 5s)
6. Verify "TestSubCircuit" item no longer exists in Custom section
7. Verify `[data-empty-state]` appears (or item count is 0)

**Negative assertions**:
- AC-131-003: After deselecting, button must NOT exist in DOM (not just hidden)
- AC-131-007: After deletion, sub-circuit must NOT remain in the list

**Repeat/reopen**:
- After deletion, create another sub-circuit with different name (e.g., "TestSubCircuit2")
- Verify it works again

### Build Verification (AC-131-008)
```
npx tsc --noEmit
npm run build
npm test -- --run
```

### E2E Verification (AC-131-009)
```
npx playwright test tests/e2e/sub-circuit.spec.ts --timeout=60000
```

## Risks

1. **Risk: Canvas click handler must emit selection events with modifiers** — The multi-select UI gesture (Shift+Click / Cmd+Click) requires the canvas component to detect modifier keys and call the appropriate store actions. If the canvas does not handle these events, multi-selection will never work regardless of store implementation.

2. **Risk: Selector returns stale/different reference** — The `useSelectedCircuitNodeIds` selector returns a new array on every call, which may cause unnecessary re-renders. Consider using a shallow equality check or returning a stable reference.

3. **Risk: Backward compatibility with `selectedNodeId`** — Existing code using `selectedNodeId` for single-selection scenarios must continue working. The store must maintain both `selectedNodeId` and `selectedCircuitNodeIds`.

4. **Risk: E2E test flakiness** — Tests may still timeout if they wait for elements that don't appear. Must use explicit timeouts (max 10s per wait) and fail fast on timeout.

5. **Risk: Toggle selection may conflict with range selection** — Shift+Click should implement range selection logic, not just toggle. Ensure the implementation handles the "between" nodes correctly.

## Failure Conditions

1. **FC-131-001**: Create Sub-circuit button does NOT appear when ≥2 nodes selected — Round fails
2. **FC-131-002**: Sub-circuit creation flow does NOT complete end-to-end — Round fails
3. **FC-131-003**: TypeScript compilation errors — Round fails
4. **FC-131-004**: Bundle size >512KB — Round fails
5. **FC-131-005**: Unit test failures — Round fails
6. **FC-131-006**: E2E tests timeout after 60 seconds — Round fails (minor, does not block release if AC-131-002 passes)

## Done Definition

All of the following must be TRUE before claiming round complete:

1. `npx tsc --noEmit` → 0 errors
2. `npm run build` → bundle ≤512KB
3. `npm test -- --run` → all tests pass
4. AC-131-001 verified: Create button visible with 2 selected nodes
5. AC-131-002 verified: Create button visible with >2 selected nodes
6. AC-131-003 verified: Create button hidden with <2 selected nodes
7. AC-131-004 verified: Single selection works (backward compatibility)
8. AC-131-005 verified: Sub-circuit creation flow completes
9. AC-131-006 verified: Sub-circuit can be placed on canvas
10. AC-131-007 verified: Sub-circuit deletion works
11. `npx playwright test tests/e2e/sub-circuit.spec.ts` completes in ≤60s

## Out of Scope

- Sub-circuit internal circuit editing (selecting nodes inside a sub-circuit)
- Sub-circuit wire connections at circuit level
- Sub-circuit validation (ensuring sub-circuit has valid inputs/outputs)
- Sub-circuit naming conflict detection
- Sub-circuit import/export
- Changes to `useMachineStore` or machine-level components
- Changes to circuit simulation logic
- Visual polish of existing components
- Performance optimization beyond bug fixes
