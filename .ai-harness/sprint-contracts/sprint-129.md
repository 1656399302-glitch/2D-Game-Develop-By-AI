# APPROVED — Sprint Contract — Round 129

## Scope

Implement the **Sub-circuit Module System** to allow users to create reusable custom modules from existing circuit configurations. This addresses the spec requirement for "Custom sub-circuit modules" (spec.md Components section).

## Spec Traceability

### P0 Items (Must Complete This Round)
- **Sub-circuit creation**: Users can select multiple modules, group them into a named sub-circuit, and save as a custom module type
- **Sub-circuit palette integration**: Custom modules appear alongside built-in modules in the module panel
- **Sub-circuit instantiation**: Drag and drop custom modules onto canvas like any other module
- **Sub-circuit visualization**: Custom modules render with unique SVG indicating nested circuits
- **Sub-circuit deletion**: Users can delete custom modules from their library

### P1 Items (Covered This Round)
- Sub-circuit state persistence across sessions (localStorage)
- Visual differentiation between built-in and custom modules
- Maximum limit for custom modules (cap at 20 to prevent localStorage overflow)

### Remaining P0/P1 After This Round
- None for sub-circuit system

### P2 Items Intentionally Deferred
- Sub-circuit editing (modifying an existing custom module)
- Sub-circuit parameterization (configurable inputs/outputs)
- Sub-circuit sharing/export
- Sub-circuit nesting (sub-circuit inside sub-circuit)
- Performance optimization for large numbers of custom modules (>20)

## Deliverables

1. **`src/types/subCircuit.ts`** — Type definitions for SubCircuit and SubCircuitModule
2. **`src/store/useSubCircuitStore.ts`** — Zustand store for managing custom sub-circuits (create, delete, getById, getAll)
3. **`src/components/SubCircuit/SubCircuitModule.tsx`** — React component for rendering sub-circuit modules on canvas with unique SVG icon
4. **`src/components/SubCircuit/SubCircuitPanel.tsx`** — Panel for managing custom sub-circuits (list view, delete action)
5. **`src/components/SubCircuit/CreateSubCircuitModal.tsx`** — Modal for naming and creating sub-circuits from selected modules
6. **`src/components/Editor/CircuitModulePanel.tsx`** — Updated to show custom sub-circuits under "Custom" section in palette
7. **`src/hooks/useSubCircuitCanvas.ts`** — Hook orchestrating sub-circuit creation workflow (selection → modal → store)
8. **Unit tests**: `src/__tests__/subCircuitStore.test.ts` (≥5 tests), `src/__tests__/subCircuitModule.test.tsx` (≥3 tests)
9. **E2E tests**: `tests/e2e/sub-circuit.spec.ts` (≥3 scenarios)

## Acceptance Criteria

### AC-129-001: Sub-circuit creation flow
- **Entry**: User has ≥2 built-in modules selected on canvas
- **Action**: User clicks "Create Sub-circuit" button (context menu or toolbar)
- **Modal**: CreateSubCircuitModal appears with name input field and "Cancel"/"Create" buttons
- **Input**: User enters unique name (e.g., "My Adder")
- **Confirm**: User clicks "Create" button
- **Result**: Sub-circuit saved to store with unique ID; modal closes; toast/feedback confirms creation
- **Negative**: Should not create sub-circuit with duplicate name (show error); should not crash on empty name

### AC-129-002: Sub-circuit appears in palette
- **Location**: Custom sub-circuits appear in CircuitModulePanel under "Custom" section header
- **Label**: Each custom module shows its saved name (e.g., "My Adder")
- **Badge**: Each shows module count (e.g., "4 modules")
- **Icon**: Custom modules show circuit-board SVG icon
- **Visibility**: Immediately visible after creation without page refresh
- **Persistence**: Persists after browser refresh (localStorage rehydration)

### AC-129-003: Sub-circuit renders on canvas
- **Drag**: User drags custom module from palette onto canvas
- **Render**: Custom module appears as single node with circuit-board SVG icon
- **Label**: Module displays sub-circuit name as label
- **Position**: Respects grid snapping (default 20px grid)
- **Transforms**: Supports standard canvas transforms (move, select)
- **Entry**: Canvas node count increases by 1

### AC-129-004: Sub-circuit deletion
- **Entry**: User opens SubCircuitPanel
- **List**: Shows all saved custom sub-circuits with names and module counts
- **Delete**: User clicks delete button/trash icon on a sub-circuit
- **Confirm**: Confirmation dialog appears with sub-circuit name
- **Dismiss**: User clicks "Delete" to confirm
- **Result**: Sub-circuit removed from store and palette; toast/feedback confirms deletion
- **Canvas cleanup**: If sub-circuit instance exists on canvas, it is removed
- **Negative**: Should not delete if user clicks "Cancel"; deletion should not affect built-in modules

### AC-129-005: Non-regression and build
- TypeScript 0 errors (`npx tsc --noEmit` exits 0)
- Bundle ≤512KB (AC-128-007 confirmed 506.08KB; budget allows ≤5.92KB increase for new code)
- All 5456 existing unit tests pass (`npm test -- --run`)
- All 31 existing E2E tests pass (`npx playwright test tests/e2e/circuit-canvas.spec.ts`)

### AC-129-006: Store persistence
- Custom sub-circuits survive browser refresh (localStorage via Zustand persist)
- Store handles 20-sub-circuit limit gracefully (rejects 21st with error message)
- Store correctly hydrates on page load

## Test Methods

### 1. Unit tests for store (`useSubCircuitStore.test.ts`)
| Test | Input | Expected Output |
|------|-------|-----------------|
| createSubCircuit with valid modules | `{name: "Adder", moduleIds: ["a","b"]}` | Returns sub-circuit with unique ID, name="Adder", moduleIds=["a","b"] |
| createSubCircuit with duplicate name | `{name: "Adder"}` (already exists) | Returns error or null |
| createSubCircuit exceeds limit | 21st sub-circuit | Returns error, does not create |
| deleteSubCircuit | Valid subCircuitId | Sub-circuit removed from store |
| deleteSubCircuit with canvas instances | Sub-circuit with active canvas instances | Returns deletion confirmation, removes from canvas |
| getSubCircuitById | Valid ID | Returns matching sub-circuit |
| getSubCircuitById | Invalid ID | Returns null |
| getAllSubCircuits | Empty store | Returns [] |
| getAllSubCircuits | 3 sub-circuits | Returns array of 3 |
| persistence | Create, reload store | Sub-circuits survive reload |

### 2. Unit tests for component (`SubCircuitModule.test.tsx`)
| Test | Input | Expected |
|------|-------|----------|
| Renders name label | `{name: "My Circuit"}` | Text "My Circuit" visible |
| Renders circuit-board icon | Any props | SVG circuit-board icon visible |
| Shows module count badge | `{moduleCount: 4}` | Text showing "4" or "4 modules" |
| Renders as grid-aligned | `{position: {x: 100, y: 100}}` | Component rendered at correct position |

### 3. E2E tests (`sub-circuit.spec.ts`)
```
Scenario: Create and use sub-circuit
1. Open circuit canvas
2. Add 3 AND gates to canvas
3. Select all 3 gates (click+drag or Ctrl+click)
4. Click "Create Sub-circuit" in toolbar
5. Enter name "Triple AND" in modal
6. Click "Create" button
7. Verify: Modal closes; palette shows "Custom" section with "Triple AND"
8. Drag "Triple AND" from palette to canvas
9. Verify: Single node appears with "Triple AND" label and circuit icon
10. Verify: Canvas node count increased by 1

Scenario: Delete sub-circuit
1. Open SubCircuitPanel
2. Verify "Triple AND" is listed
3. Click delete/trash icon on "Triple AND"
4. Verify: Confirmation dialog appears with "Delete 'Triple AND'?"
5. Click "Delete" to confirm
6. Verify: Sub-circuit removed from panel list
7. Verify: "Triple AND" no longer in palette

Scenario: Persistence across refresh
1. Create sub-circuit "Persistent Test"
2. Refresh browser page
3. Verify: "Persistent Test" appears in palette without re-creation
```

### 4. Non-regression verification
- Run: `npm test -- --run` → expect 5456 tests pass
- Run: `npx playwright test tests/e2e/circuit-canvas.spec.ts` → expect 31 tests pass
- Run: `npx tsc --noEmit` → expect 0 errors
- Run: `npm run build` → expect bundle ≤512KB

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Integration with canvas system (selection, drag-drop) | Medium | Implement minimal viable flow first; defer advanced interactions |
| localStorage persistence conflicts with existing stores | Low | Use Zustand's `partialize` for selective persistence; namespace keys |
| Performance with many sub-circuit instances on canvas | Low | Memoize SubCircuitModule component; defer optimization |
| Type conflicts with existing GateType union | Low | Create separate SubCircuitType; avoid modifying existing type |

## Failure Conditions

The round FAILS if any of the following occur:

1. **TypeScript compilation fails** with any errors (`npx tsc --noEmit` exits non-zero)
2. **Bundle exceeds 512KB** after build (`npm run build`)
3. **Any existing test fails** (unit tests <5456 or E2E <31)
4. **Sub-circuit creation modal does not appear** when selecting 2+ modules and clicking "Create Sub-circuit"
5. **Custom modules do not appear in palette** after creation (within same session)
6. **Sub-circuit does not render on canvas** when dragged from palette
7. **Sub-circuit does not persist** after browser refresh
8. **Sub-circuit deletion fails** to remove from store and palette

## Done Definition

All of the following must be TRUE before claiming round complete:

1. `npx tsc --noEmit` exits with code 0 (0 errors)
2. `npm run build` produces bundle ≤512KB
3. `npm test -- --run` reports ≥5456 tests passed
4. `npx playwright test tests/e2e/circuit-canvas.spec.ts` reports 31 tests passed
5. `npm test -- --run src/__tests__/subCircuitStore.test.ts` reports ≥5 tests passed
6. `npm test -- --run src/__tests__/subCircuitModule.test.tsx` reports ≥3 tests passed
7. `npx playwright test tests/e2e/sub-circuit.spec.ts` reports ≥3 scenarios passed
8. **Creation**: User can create sub-circuit from 2+ selected modules → modal appears → name entered → sub-circuit saved
9. **Palette**: Created sub-circuit appears in CircuitModulePanel under "Custom" section immediately
10. **Canvas**: Dragging custom module from palette renders node on canvas with name label and circuit icon
11. **Delete**: User can delete sub-circuit via SubCircuitPanel → confirmation → removed from palette
12. **Persistence**: Sub-circuit survives browser refresh (visible in palette without re-creation)
13. **Non-regression**: No existing functionality broken (all gates, timers, memory components still work)

## Out of Scope

The following are explicitly NOT implemented this round:

- Sub-circuit editing (modify internal module composition of existing custom module)
- Sub-circuit parameterization (expose internal inputs/outputs as configurable ports)
- Sub-circuit sharing (export/import JSON for sharing between users)
- Sub-circuit nesting (creating sub-circuit from canvas that contains sub-circuit instances)
- Sub-circuit renaming (edit name of existing custom module)
- Sub-circuit duplication (clone an existing custom module)
- Sub-circuit import/export (save/load sub-circuits as files)
- Performance optimization for >20 custom modules or >50 sub-circuit instances
- Mobile-specific touch interactions for sub-circuit creation
- Sub-circuit templates or presets

## Bundle Budget

| Asset | Current Size | Max Allowed |
|-------|-------------|-------------|
| Main bundle | 506.08KB | 512KB |
| **Delta budget** | — | **≤5.92KB** |

New code must stay within 5.92KB delta. Key strategies:
- Tree-shake unused exports
- Avoid adding large dependencies
- Lazy-load SubCircuitPanel (not loaded on initial page)
