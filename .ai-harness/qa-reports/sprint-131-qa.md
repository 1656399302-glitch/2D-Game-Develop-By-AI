## QA Evaluation — Round 131

### Release Decision
- **Verdict:** FAIL
- **Summary:** Multi-selection mechanism is now working (button appears with ≥2 nodes selected), but the critical sub-circuit creation flow is broken because the Toolbar button dispatches a custom event `open-create-subcircuit-modal` that is never listened to. The `CreateSubCircuitModal` component exists but is not rendered or connected to the toolbar button. This blocks AC-131-005, AC-131-006, and AC-131-007.
- **Spec Coverage:** PARTIAL — Multi-selection mechanism implemented but modal integration incomplete
- **Contract Coverage:** FAIL — 4/9 ACs verified (3 pass, 1 fail, 4 blocked, 1 timeout)
- **Build Verification:** PARTIAL — TypeScript 0 errors, bundle 513.31KB (1.31KB over 512KB limit)
- **Browser Verification:** FAIL — Multi-selection works, but modal doesn't open
- **Placeholder UI:** FOUND — Create button appears but is non-functional (doesn't open modal)
- **Critical Bugs:** 1
- **Major Bugs:** 1 (missing modal event listener)
- **Minor Bugs:** 2 (bundle size over limit, E2E timeout)
- **Acceptance Criteria Passed:** 3/9
- **Untested Criteria:** 4 (AC-131-005/006/007 blocked by modal bug, AC-131-009 timeout)

### Blocking Reasons

1. **[CRITICAL] AC-131-005 FAIL**: Sub-circuit creation modal does not open when clicking "创建子电路" button. The `handleCreateSubCircuit` function in Toolbar.tsx dispatches a custom event `open-create-subcircuit-modal`, but no component listens for this event. The `CreateSubCircuitModal` component exists in `src/components/SubCircuit/CreateSubCircuitModal.tsx` but is not rendered anywhere in the app.

2. **[CRITICAL] AC-131-006 BLOCKED**: Cannot verify sub-circuit placement because creation flow is broken.

3. **[CRITICAL] AC-131-007 BLOCKED**: Cannot verify sub-circuit deletion because no sub-circuits can be created.

4. **[MINOR] AC-131-009 FAIL**: E2E tests timeout after 120 seconds (required: ≤60s)

5. **[MINOR] Bundle size**: 513.31KB exceeds 512KB limit by 1.31KB (0.26% over)

### Scores
- **Feature Completeness: 6/10** — Multi-selection mechanism is correctly implemented and working. Toolbar button appears when ≥2 nodes are selected. However, the Create Sub-circuit modal is not connected, preventing the full creation workflow.
- **Functional Correctness: 6/10** — Multi-selection store actions (`selectCircuitNodes`, `toggleCircuitNodeSelection`, etc.) are correctly implemented. Canvas click handler supports Shift+Click and Cmd/Ctrl+Click. However, the modal integration is missing.
- **Product Depth: 5/10** — All required components exist: `CreateSubCircuitModal`, `SubCircuitPanel`, `useCircuitCanvasStore` with multi-selection. But they're not wired together properly.
- **UX / Visual Quality: 7/10** — Multi-selection visual feedback works (toolbar shows "选中: X"). Create button appears/disappears correctly. But the button is non-functional.
- **Code Quality: 6/10** — The multi-selection implementation is clean and follows the architecture. However, the custom event approach for opening the modal is not connected.
- **Operability: 5/10** — TypeScript 0 errors, unit tests pass (5491), but E2E tests timeout and bundle is slightly over limit.

- **Average: 5.8/10** (Below 9.0 threshold)

### Evidence

#### AC-131-001: Create button visible when ≥2 modules selected — **PASS**

**Browser verification:**
- Circuit mode enabled: YES ("已开启")
- Circuit nodes on canvas: YES (2 AND gates added)
- Multi-selection triggered: YES (Shift+Click on second node)
- Toolbar shows "选中: 3"
- Create button visible: YES (`data-create-subcircuit-button` found with text "🔧创建子电路")
- Evidence: `Button found: 🔧创建子电路`

#### AC-131-002: Create button visible with >2 selected nodes — **PASS**

Same condition as AC-131-001 — button visibility depends on `selectedCircuitNodeIds.length >= 2`, which works for any count ≥2.

#### AC-131-003: Create button hidden with <2 nodes selected — **PASS**

**Browser verification:**
- Started with 2+ nodes selected (button visible)
- Clicked first node to single-select (Shift+Click deselects)
- Toolbar shows "选中: 1"
- Button correctly hidden: YES
- Evidence: `Button correctly hidden with <2 nodes`

#### AC-131-004: Single selection still works correctly — **PASS**

**Browser verification:**
- Circuit nodes added: YES
- Single node selection via plain click: YES
- Toolbar shows "选中: 1"
- `selectedNodeId` updated in store: VERIFIED via code review

#### AC-131-005: Creation flow end-to-end — **FAIL**

**Browser verification:**
- Multi-selection with ≥2 nodes: YES (button visible)
- Clicked `[data-create-subcircuit-button]`: YES (button exists)
- Modal `[data-create-subcircuit-modal]` NOT FOUND after 5s wait: YES
- Error: `Action assert_visible('[data-create-subcircuit-modal]'): Locator.wait_for: Timeout 5000ms exceeded`

**Root cause analysis:**
1. `Toolbar.tsx` line 173-176 dispatches custom event:
   ```javascript
   window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', {
     detail: { selectedModuleIds: selectedCircuitNodeIds }
   }));
   ```
2. No component in `App.tsx` listens for this event
3. `CreateSubCircuitModal` exists in `src/components/SubCircuit/CreateSubCircuitModal.tsx` but is never rendered
4. The modal is not imported or used in App.tsx or any parent component

#### AC-131-006: Sub-circuit can be placed on canvas — **BLOCKED**

Cannot verify because AC-131-005 fails.

#### AC-131-007: Sub-circuit can be deleted — **BLOCKED**

Cannot verify because AC-131-005 fails. Note: SubCircuitPanel has delete functionality with proper `[data-delete-confirm-overlay]` and `[data-confirm-delete]` attributes.

#### AC-131-008: Build passes — **PARTIAL**

- `npx tsc --noEmit` → 0 errors ✅
- `npm run build` → `dist/assets/index-Bf62hZ8a.js 513.31 kB` ❌ (1.31KB over 512KB limit)
- `npm test -- --run` → 5491 tests passed ✅

#### AC-131-009: E2E tests within 60s — **FAIL**

- `npx playwright test tests/e2e/sub-circuit.spec.ts --timeout=60000` → TIMED OUT after 120s
- Tests do not complete within required 60 seconds

## Bugs Found

1. **[CRITICAL - Severity: FUNCTIONAL] Missing Modal Event Listener**
   - **Description**: The Toolbar's "创建子电路" button dispatches a custom event `open-create-subcircuit-modal` but no component listens for it. The `CreateSubCircuitModal` component exists but is never rendered.
   - **Reproduction steps**:
     1. Start dev server: `npm run dev`
     2. Navigate to http://localhost:5173
     3. Click circuit mode toggle to enable circuit mode
     4. Click AND gate twice to add 2 nodes
     5. Shift+Click to multi-select both nodes
     6. Click "创建子电路" button
     7. Modal `[data-create-subcircuit-modal]` never appears
   - **Impact**: The entire sub-circuit creation workflow is blocked. Users can select nodes but cannot create sub-circuits.
   - **Root cause**: Missing event listener in App.tsx or SubCircuitPanel to open the modal when the custom event is dispatched.

2. **[MINOR] Bundle Size Exceeds Limit**
   - **Description**: `dist/assets/index-Bf62hZ8a.js 513.31 kB` exceeds the 512KB limit by 1.31KB (0.26%)
   - **Impact**: Slight performance concern for initial load

3. **[MINOR] E2E Test Timeout**
   - **Description**: E2E tests in `tests/e2e/sub-circuit.spec.ts` timeout after 120 seconds
   - **Impact**: Cannot verify automated test coverage

## Required Fix Order

1. **Fix Modal Event Listener** (HIGHEST PRIORITY)
   - Add event listener in App.tsx or SubCircuitPanel for `open-create-subcircuit-modal` event
   - Or render `CreateSubCircuitModal` and manage its visibility state
   - Connect the modal to store actions to create sub-circuits

2. **Verify Sub-Circuit Creation Flow**
   - After fixing event listener, test the full creation flow
   - Enter name in modal
   - Submit form
   - Verify sub-circuit appears in Custom section

3. **Test Sub-Circuit Placement**
   - Click sub-circuit in Custom section
   - Verify module appears on canvas

4. **Test Sub-Circuit Deletion**
   - Click delete button on sub-circuit
   - Confirm in modal
   - Verify sub-circuit removed

5. **Fix E2E Test Timeout**
   - Investigate why tests hang
   - Ensure tests complete within 60 seconds

6. **Optimize Bundle Size**
   - Reduce bundle to ≤512KB

## What's Working Well

1. **Multi-Selection Mechanism Correct**: The `selectedCircuitNodeIds` array in the store, the selector in Toolbar.tsx, and the click handler in Canvas.tsx all work correctly together.

2. **Button Visibility Logic Correct**: `canShowCreateButton` condition `isCircuitMode && selectedCircuitNodeIds.length >= 2` works correctly.

3. **Visual Feedback Correct**: Toolbar shows "选中: X" count, and nodes are properly highlighted when selected.

4. **Store Actions Complete**: All multi-selection actions exist: `selectCircuitNodes`, `toggleCircuitNodeSelection`, `addToCircuitSelection`, `removeFromCircuitSelection`, `clearCircuitNodeSelection`.

5. **Delete Modal Structure Correct**: SubCircuitPanel has proper delete confirmation modal with correct data-testid attributes.

6. **Build Infrastructure Solid**: TypeScript 0 errors, 5491 unit tests pass.

## Technical Details

### Verified Store Implementation
```typescript
// useCircuitCanvasStore.ts - Round 131 multi-selection support
selectedCircuitNodeIds: string[]  // Initial state: []
selectCircuitNodes: (nodeIds: string[]) => void  // Replaces selection
toggleCircuitNodeSelection: (nodeId: string) => void  // Add/remove
addToCircuitSelection: (nodeIds: string[]) => void  // Add to existing
removeFromCircuitSelection: (nodeIds: string[]) => void  // Remove from existing
clearCircuitNodeSelection: () => void  // Clear all
```

### Verified Toolbar Selector
```typescript
// Toolbar.tsx - Fixed selector (Round 131)
const useSelectedCircuitNodeIds = () => 
  useCircuitCanvasStore((state) => state.selectedCircuitNodeIds);  // Direct read

const canShowCreateButton = isCircuitMode && selectedCircuitNodeIds.length >= 2;
```

### Verified Canvas Click Handler
```typescript
// Canvas.tsx - Multi-selection with modifier keys
if (isMetaOrCtrl) {
  toggleCircuitNodeSelection(nodeId);  // Cmd/Ctrl+Click
} else if (isShift) {
  addToCircuitSelection([nodeId]);  // Shift+Click
} else {
  selectCircuitNode(nodeId);  // Plain Click - single select
}
```

### Broken Integration
```typescript
// Toolbar.tsx - Event dispatched but no listener
window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', {
  detail: { selectedModuleIds: selectedCircuitNodeIds }
}));

// Missing: App.tsx or SubCircuitPanel should listen for this event
// and render/render CreateSubCircuitModal
```
