APPROVED

# Sprint Contract — Round 132

## Scope

This sprint is a **remediation effort** focused on fixing the broken sub-circuit creation flow. 

**Root Cause from Round 131**: The Toolbar's `handleCreateSubCircuit` function dispatches a custom event `open-create-subcircuit-modal`, but **no component listens for this event**. The `CreateSubCircuitModal` component exists in `src/components/SubCircuit/CreateSubCircuitModal.tsx` but is never rendered anywhere in the app.

The multi-selection mechanism is already working correctly. The only remaining work is to wire the `CreateSubCircuitModal` component to the Toolbar's event dispatcher and verify the complete creation → placement → deletion workflow.

## Spec Traceability

### P0 items covered this round
- **Modal event listener integration** — Add listener in App.tsx for `open-create-subcircuit-modal` event, render `CreateSubCircuitModal` with visibility controlled by store state
- **Sub-circuit creation flow end-to-end** — Verify that entering a name and submitting creates a sub-circuit entry in Custom section
- **Sub-circuit placement on canvas** — Verify sub-circuits can be placed after creation
- **Sub-circuit deletion** — Verify sub-circuits can be deleted via SubCircuitPanel

### P1 items covered this round
- **Bundle size optimization** — Reduce from 513.31KB to ≤512KB
- **E2E test stability** — Fix timeout issues in `tests/e2e/sub-circuit.spec.ts` (must complete within 60 seconds)

### Remaining P0/P1 after this round
- All P0 items for multi-selection and sub-circuit features should be complete after this sprint
- E2E test stabilization may require additional rounds if root cause is complex

### P2 intentionally deferred
- Advanced sub-circuit editing (renaming, modifying internal structure)
- Sub-circuit input/output port configuration
- Community gallery integration
- Faction reputation system

## Deliverables

1. **Event listener integration** — `App.tsx` listens for `open-create-subcircuit-modal` event and renders `CreateSubCircuitModal` with visibility controlled by store state. The modal must be imported and mounted in the component tree.

2. **Store action for modal visibility** — New store action (e.g., `setCreateSubCircuitModalOpen(boolean)`) or existing action that controls modal visibility state.

3. **Working sub-circuit creation** — User can select ≥2 nodes, click "🔧创建子电路", enter name, submit, and see new sub-circuit in Custom section

4. **Verified placement workflow** — Sub-circuit from Custom section can be placed on canvas as a module

5. **Verified deletion workflow** — Sub-circuits can be deleted via SubCircuitPanel with confirmation modal

6. **Optimized bundle** — `dist/assets/index-[hash].js` ≤512KB

7. **Passing E2E tests** — `tests/e2e/sub-circuit.spec.ts` completes within 60 seconds

## Acceptance Criteria

1. **AC-132-001**: App.tsx contains an event listener for `open-create-subcircuit-modal` that sets modal visibility state, AND `CreateSubCircuitModal` is rendered conditionally based on that state

2. **AC-132-002**: Clicking "🔧创建子电路" button (when ≥2 nodes selected) opens the `CreateSubCircuitModal` within 2 seconds

3. **AC-132-003**: Entering a valid name (≥1 non-whitespace character) in the modal and submitting creates a sub-circuit entry visible in the Custom section of SubCircuitPanel

4. **AC-132-004**: Clicking a sub-circuit in the Custom section adds that sub-circuit module to the canvas at the cursor position

5. **AC-132-005**: Clicking the delete button on a sub-circuit in SubCircuitPanel shows a confirmation overlay, and confirming removes the sub-circuit from the Custom section

6. **AC-132-006**: Sub-circuit modules on canvas behave like regular components (selectable, deletable, can be connected via wires)

7. **AC-132-007**: `npm run build` produces `dist/assets/index-[hash].js` ≤512KB

8. **AC-132-008**: `npx playwright test tests/e2e/sub-circuit.spec.ts --timeout=60000` completes successfully within 60 seconds

9. **AC-132-009**: Clearing selection (pressing Escape or clicking empty canvas area) deselects all nodes and hides the "🔧创建子电路" button

## Test Methods

### AC-132-001: Event listener and modal rendering (Code Verification)
1. Open `src/App.tsx` in editor
2. Verify presence of: `window.addEventListener('open-create-subcircuit-modal', ...)` or equivalent listener
3. Verify `CreateSubCircuitModal` is imported
4. Verify `CreateSubCircuitModal` is rendered conditionally (e.g., `isModalOpen && <CreateSubCircuitModal />`)

### AC-132-002: Modal opens on button click
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:5173
3. Enable circuit mode via toggle (`[data-circuit-mode-toggle]`)
4. Add 2 AND gates to canvas
5. Shift+Click second node to multi-select (toolbar shows "选中: 2" or similar)
6. Click "🔧创建子电路" button: `[data-create-subcircuit-button]`
7. Wait up to 2s for modal: `[data-create-subcircuit-modal]`
8. Verify modal is visible with text input and confirm button
9. **Negative**: Modal should not remain if button is clicked without selection
10. **Negative**: Modal should not crash or produce console errors on open

### AC-132-003: Sub-circuit creation with name
1. From AC-132-002 state, enter "TestSub" in modal input
2. Click confirm button in modal
3. Wait 1s for modal to close
4. Open SubCircuitPanel
5. Verify "TestSub" appears in Custom section with data attribute `[data-subcircuit-item="TestSub"]`
6. **Completion**: Modal must close after submission
7. **Final State**: "TestSub" must appear in Custom section
8. **Negative**: No console errors should appear during submission

### AC-132-004: Sub-circuit placement
1. From AC-132-003 state, click "TestSub" in Custom section
2. Click on empty canvas area
3. Verify a new module appears on canvas representing TestSub with selector `[data-circuit-node]`
4. Verify module is selectable and deletable
5. **Negative**: Module should not remain if placement is cancelled

### AC-132-005: Sub-circuit deletion
1. From AC-132-004 state, open SubCircuitPanel
2. Click delete button on "TestSub" row: `[data-delete-subcircuit-button]`
3. Verify confirmation overlay appears: `[data-delete-confirm-overlay]`
4. Click confirm delete: `[data-confirm-delete]`
5. Verify "TestSub" no longer appears in Custom section
6. **Entry**: Confirmation overlay must appear before deletion
7. **Completion**: Overlay must dismiss after confirmation
8. **Final State**: Sub-circuit should not appear in Custom section after deletion
9. **Negative**: Clicking cancel should NOT remove the sub-circuit

### AC-132-006: Sub-circuit module behavior
1. Place a TestSub module on canvas
2. Click to select it — verify selection highlight
3. Press Delete key — verify module removed from canvas
4. Verify no console errors during operations
5. **Entry**: Module must be on canvas before selection test
6. **Final State**: Module should not remain on canvas after deletion
7. **Negative**: Module should not crash when selected

### AC-132-007: Bundle size
1. Run `npm run build`
2. Check `dist/assets/index-[hash].js` size
3. Verify ≤512KB (524,288 bytes)
4. **Negative**: Build should not fail with TypeScript errors

### AC-132-008: E2E test execution (60-second limit)
1. Run `npx playwright test tests/e2e/sub-circuit.spec.ts --timeout=60000`
2. Verify test completes within 60 seconds (not the previous 120-second timeout)
3. Verify all assertions pass with exit code 0
4. **Negative**: Tests should not timeout
5. **Negative**: Tests should not produce console errors during execution

### AC-132-009: Selection clearing
1. Select ≥2 nodes (button visible)
2. Press Escape
3. Verify toolbar shows "选中: 0"
4. Verify "🔧创建子电路" button is hidden
5. Click empty canvas area (no nodes)
6. Verify same as Escape behavior
7. **Entry**: Button must be visible before clearing
8. **Completion**: Toolbar count must update to 0
9. **Final State**: Button must be hidden after clearing
10. **Negative**: Button should not reappear without new selection

## Risks

### Risk 1: Event listener integration approach
- **Description**: The current implementation uses a custom event `open-create-subcircuit-modal` dispatched from Toolbar. Need to ensure this is properly listened to in a parent component.
- **Mitigation**: Add event listener in App.tsx that sets a `isSubCircuitModalOpen` state, render CreateSubCircuitModal conditionally, and connect to store's sub-circuit creation action.
- **Fallback**: If event approach is fragile, refactor to use store action directly (add `openCreateSubCircuitModal` action that sets `isSubCircuitModalOpen: true`).

### Risk 2: Sub-circuit internal representation
- **Description**: The CreateSubCircuitModal needs to capture which nodes are selected and save them as the sub-circuit's internal circuit. This requires proper serialization.
- **Mitigation**: Verify the modal's `handleSubmit` correctly calls the store action with selected node IDs and a name.
- **Fallback**: May need to implement sub-circuit serialization if not already done.

### Risk 3: E2E test instability
- **Description**: Previous round's E2E tests timed out at 120s. Root cause unclear.
- **Mitigation**: Add explicit waits, reduce test scope if needed, add debug logging. Set timeout to 60s to match acceptance criteria.
- **Fallback**: May need to increase timeout or split tests.

### Risk 4: Bundle size optimization
- **Description**: Only 1.31KB over limit. Likely caused by modal code not being tree-shaken properly or added dependencies.
- **Mitigation**: Use dynamic imports for modal, verify no duplicate dependencies.
- **Fallback**: Remove unused code, lazy-load more components.

## Failure Conditions

1. **Event listener missing**: Code review of App.tsx does not show event listener for `open-create-subcircuit-modal` OR `CreateSubCircuitModal` is not rendered
2. **Modal does not open**: `CreateSubCircuitModal` is not visible after clicking the toolbar button within 5 seconds
3. **Sub-circuit not created**: After entering name and submitting, the sub-circuit does not appear in SubCircuitPanel's Custom section
4. **Placement fails**: Sub-circuit module does not appear on canvas after clicking in Custom section
5. **Deletion fails**: Sub-circuit remains in Custom section after delete confirmation
6. **Bundle exceeds limit**: `dist/assets/index-[hash].js` >512KB after build
7. **E2E timeout**: Tests do not complete within 60 seconds

## Done Definition

The round is complete when ALL of the following are true:

1. **Code Verification**: AC-132-001 passes — event listener exists and modal is rendered in App.tsx
2. **Functional**: AC-132-002 through AC-132-006 all pass with manual browser verification
3. **Build**: `npm run build` produces ≤512KB bundle with 0 TypeScript errors
4. **Unit tests**: `npm test -- --run` passes all existing tests (≥5491 tests)
5. **E2E tests**: `npx playwright test tests/e2e/sub-circuit.spec.ts --timeout=60000` completes within 60 seconds with 0 failures
6. **Selection**: AC-132-009 passes — selection clearing works correctly
7. **No console errors**: Opening modal, creating sub-circuit, placing on canvas, deleting — all without console errors

## Out of Scope

- Implementing sub-circuit internal editing (modifying which nodes are inside)
- Sub-circuit input/output port configuration
- Sub-circuit parameterization
- Any changes to the multi-selection mechanism (already working — verified in Round 131)
- Tech tree unlocks or faction system
- Community gallery or exchange features
- Visual polish beyond fixing broken functionality
- Adding new logic gates or components

## Round 131 Context (What Was Fixed vs. What Remains)

### Completed in Round 131
- Multi-selection store implementation (`selectedCircuitNodeIds` array)
- Toolbar button visibility logic (`canShowCreateButton` condition)
- Canvas click handler for Shift+Click/Cmd+Click multi-selection
- Single-selection backward compatibility

### This Round Focuses On
- **CRITICAL**: Adding event listener in App.tsx for `open-create-subcircuit-modal` event
- **CRITICAL**: Rendering `CreateSubCircuitModal` component
- **CRITICAL**: Connecting modal to store actions for sub-circuit creation
- Verifying the complete end-to-end workflow
- Bundle size optimization
- E2E test stability

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

# Tech Tree Canvas — Circuit Building Game

## Project Overview

A circuit-building puzzle game with tech tree progression. Players design circuits on a canvas using logic gates, wires, and components to solve challenges. Features recipe discovery, achievement tracking, faction progression, and community sharing.

## Core Features

### Canvas System
- Interactive circuit canvas with grid snapping
- Drag-and-drop component placement
- Wire connection system between ports
- Circuit validation and simulation
- Multi-layer support for complex circuits

### Components
- Logic gates: AND, OR, NOT, NAND, NOR, XOR, XNOR
- Wire segments and junction points
- Input/output nodes
- Timer and counter components
- Memory elements
- Custom sub-circuit modules

### Progression System
- Tech tree with unlockable components
- Recipe discovery through experimentation
- Achievement system for milestones
- Faction reputation and rewards
- Challenge mode with puzzles

### Community Features
- Publish circuits to community gallery
- Browse and import community circuits
- Favorite and rate circuits
- Template library for common patterns
- Exchange/trade system between players

## Technical Stack
- React + TypeScript + Vite
- Zustand for state management
- SVG-based canvas rendering
- Canvas validation engine
- Lazy loading for performance

## Architecture

### Directory Structure
```
src/
├── components/
│   ├── Canvas/          # Main canvas system
│   ├── Components/      # Circuit components
│   ├── TechTree/        # Tech tree UI
│   ├── Challenge/        # Challenge mode
│   ├── RecipeBook/      # Recipe discovery
│   ├── Achievement/      # Achievement tracking
│   ├── Faction/         # Faction system
│   ├── Community/       # Community gallery
│   ├── Exchange/        # Trade system
│   └── AI/              # AI assistant
├── stores/              # Zustand stores
├── hooks/               # Custom hooks
├── utils/               # Utility functions
└── types/               # TypeScript types
```

### Data Models

#### Component Instance
```typescript
interface ComponentInstance {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  rotation: number;
  parameters: Record<string, any>;
  connections: Connection[];
}
```

#### Circuit
```typescript
interface Circuit {
  id: string;
  name: string;
  components: ComponentInstance[];
  layers: Layer[];
  metadata: CircuitMetadata;
}
```

#### Recipe
```typescript
interface Recipe {
  id: string;
  inputs: ComponentType[];
  output: ComponentType;
  discoveredBy: string;
  timestamp: number;
}
```

## Performance Requirements
- Main bundle ≤512KB
- Lazy loading for all panel/modal components
- Virtualized lists for large circuit galleries
- Efficient canvas rendering with viewport culling
- Test coverage maintained at ≥4948 tests

## Design Language
- Dark theme with circuit-board aesthetic
- Cyan/green accent colors for active elements
- Monospace typography for technical feel
- Subtle glow effects for powered connections
- Grid pattern background

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
