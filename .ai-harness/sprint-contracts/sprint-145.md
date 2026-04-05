# Sprint Contract — Round 145 (APPROVED)

## Scope

**Remediation Sprint**: Retire dead code from Round 144 (`CircuitPalette.tsx`) and verify that `CircuitModulePanel.tsx` remains the canonical, functional circuit component panel with all 14 components operational. The `CircuitPalette` component was created in Round 144 with full unit test coverage (12 tests) but is never imported or rendered in the app. `CircuitModulePanel` is the active component providing equivalent functionality with additional features (circuit mode toggle, sub-circuit support). After this sprint, the codebase contains no unused `CircuitPalette` file or dead imports.

---

## Decision Gate — Track B (Retirement)

This contract follows **Track B: Retirement**. The product direction decision, informed by the Round 144 QA verdict, is that `CircuitModulePanel` is the canonical circuit component panel and `CircuitPalette` is dead code to be removed. The builder MUST NOT attempt Track A (integration) without explicit re-direction from the product owner.

- ✅ Track A (Integration): `CircuitPalette` is adopted as canonical, `CircuitModulePanel` circuit buttons removed.
- ❌ Track B (Retirement — THIS CONTRACT): `CircuitPalette.tsx` is deleted, `CircuitModulePanel` remains the only active circuit panel.

---

## Spec Traceability

### P0 Items Covered This Round
- **CircuitPalette Retirement** — Remove unused `CircuitPalette.tsx` file and any dead imports. Ensure `CircuitModulePanel` remains fully functional with all 14 components.

### P1 Items Covered This Round
- None — this is a remediation-only sprint.

### Remaining P0/P1 After This Round
- Circuit validation and simulation engine (not yet implemented)
- Circuit execution/simulation (canvas shows components but doesn't evaluate logic)
- Wire routing/pathfinding algorithm (wires are straight-line segments only)

### P2 Intentionally Deferred
- Recipe discovery system
- Achievement tracking
- Faction reputation system
- Community gallery
- Exchange/trade system
- AI assistant
- Memory element components (beyond sequential gates)

---

## Deliverables

1. **`src/components/Circuit/CircuitPalette.tsx`** — **Deleted** as dead code. The file must not exist in `src/components/Circuit/` after this sprint.

2. **`src/__tests__/CircuitPalette.test.tsx`** — **Deleted** or replaced. If removed, equivalent integration test coverage must be added to `CircuitModulePanel` tests to maintain test count (see AC-145-006).

3. **`src/components/Circuit/index.ts`** — Updated exports: `CircuitPalette` removed from barrel export.

4. **Updated `CircuitModulePanel` tests** — New or migrated browser/functional tests verifying that the circuit component panel (driven by `CircuitModulePanel`) renders with 14 component buttons and all three click-adds-nodes paths work (INPUT, AND, TIMER). These tests replace the retired `CircuitPalette` unit tests to maintain test coverage.

5. **`src/__tests__/CircuitModulePanel.browser.test.tsx`** — Browser integration test verifying `data-circuit-component` buttons are present and functional when in circuit mode.

---

## Acceptance Criteria

### Track B Criteria

**AC-145-001**: `CircuitPalette.tsx` does not exist in the filesystem at `src/components/Circuit/CircuitPalette.tsx`.

**AC-145-002**: `CircuitModulePanel` renders circuit component buttons with `data-circuit-component` attribute when circuit mode is enabled. No duplicate circuit component panel exists.

**AC-145-003**: `CircuitModulePanel` displays 14 component buttons total (Input, Output, 7 logic gates, 5 sequential gates).

**AC-145-004**: Clicking circuit component buttons in `CircuitModulePanel` adds nodes to the canvas — verified for INPUT, AND, and TIMER (at minimum). Status count ("电路: N") increments correctly.

**AC-145-005**: All existing functionality continues to work:
- Nodes can be added to canvas
- Layers can be created and switched
- Junctions can be created
- Sequential gates render with correct signal states (see AC-145-010)

### New / Revised Criteria

**AC-145-006**: Test suite passes with ≥6030 tests. The current baseline is 6030 tests. If `CircuitPalette.test.tsx` (12 tests) is removed as dead code, replacement integration tests must be added to `CircuitModulePanel.browser.test.tsx` or another test file so the total count remains ≥6030. If no dead-code tests are removed, the count must not decrease below 6030.

**AC-145-007**: Bundle size remains ≤512KB (524,288 bytes).

**AC-145-008**: TypeScript compiles with 0 errors (`npx tsc --noEmit` exit code 0).

**AC-145-009**: Clicking circuit component buttons when circuit mode is OFF does not add nodes to the canvas and throws no errors.

**AC-145-010**: Adding the same component type twice produces two separate nodes on the canvas (no crash, no duplicate-prevention logic interfering).

**AC-145-011**: Toggling circuit mode OFF then ON resets the panel state correctly — previously-added nodes remain on the canvas, no crash occurs.

**AC-145-012**: Nodes added to canvas belong to the correct active layer. After adding nodes to Layer 1, switching to Layer 2, then back to Layer 1 — Layer 1 shows the previously-added nodes.

---

## Test Methods

### AC-145-001 File Existence Check
1. Run: `ls src/components/Circuit/CircuitPalette.tsx`
2. **PASS**: File does not exist (command returns non-zero exit code)
3. Also verify: `grep -r "CircuitPalette" src/components/` returns no import statements

### AC-145-002 Panel Rendering
1. Start dev server: `npm run dev`
2. Open browser at localhost
3. Enable circuit mode (click circuit mode toggle)
4. In DevTools Elements panel, search for `data-circuit-component`
5. **PASS**: At least 14 buttons with `data-circuit-component` attribute found, rendered within `CircuitModulePanel`

### AC-145-003 Component Count
1. In browser, enable circuit mode
2. Count visible `data-circuit-component` buttons in the circuit panel
3. **PASS**: Exactly 14 buttons present

### AC-145-004 Node Addition
1. In browser, enable circuit mode
2. Click "INPUT" button (`data-circuit-component="INPUT"`)
3. Verify "电路: 1" status shown
4. Click "AND" button (`data-circuit-component="AND"`)
5. Verify "电路: 2" status shown
6. Click "TIMER" button (`data-circuit-component="TIMER"`)
7. Verify "电路: 3" status shown, TIMER node visible in layers panel

### AC-145-005 Regression Testing
1. Create a new layer (verify "Layer 2" appears in layers panel)
2. Add a wire junction (verify junction renders as circle)
3. Add sequential gate (verify Q/Q̅ signal display — see AC-145-010)
4. **PASS**: All operations work without errors

### AC-145-006 Test Suite
1. Run `npm test -- --run`
2. Count total passing tests
3. **PASS**: Count ≥6030
4. If CircuitPalette tests were removed, verify replacement tests exist in a named test file (e.g., `CircuitModulePanel.browser.test.tsx`)

### AC-145-007 Bundle Size
1. Run `npm run build`
2. Check `dist/assets/index-*.js` file size
3. **PASS**: ≤524,288 bytes (512KB)

### AC-145-008 TypeScript
1. Run `npx tsc --noEmit`
2. **PASS**: Exit code 0, no output

### AC-145-009 Negative: Buttons Inactive Outside Circuit Mode
1. Start browser with circuit mode OFF
2. Verify no `data-circuit-component` buttons are visible
3. If buttons exist but are disabled: click one — verify no node added and no console error
4. **PASS**: No nodes added, no crash

### AC-145-010 Duplicate Component Addition
1. In browser, enable circuit mode
2. Click "AND" button twice
3. Verify "电路: 2" status shown (two separate nodes)
4. **PASS**: Two AND nodes appear in layers panel, no crash

### AC-145-011 Circuit Mode Toggle Reset
1. Enable circuit mode, add 2 nodes ("电路: 2")
2. Disable circuit mode
3. Re-enable circuit mode
4. Verify previously-added nodes still visible, "电路: 2" still shown
5. **PASS**: No crash, state preserved

### AC-145-012 Layer Isolation
1. With circuit mode ON and Layer 1 active, add 1 node ("电路: 1")
2. Click "add layer" — switch to Layer 2
3. Verify canvas is empty for Layer 2
4. Switch back to Layer 1
5. Verify node is still visible on Layer 1
6. **PASS**: Layer isolation correct

---

## Risks

1. **Test Count Risk**: Removing `CircuitPalette.test.tsx` (12 tests) without adding equivalent coverage could drop total below 6030. **Mitigation**: Builder must add replacement tests to `CircuitModulePanel.browser.test.tsx` before removing old tests.

2. **Dead Code Dependency Risk**: Other files may import `CircuitPalette`. **Mitigation**: Search for all imports before deletion; update or remove them.

3. **Regression Risk**: Removing `CircuitPalette` may accidentally affect `CircuitModulePanel`. These are separate files — verify no shared imports.

4. **Bundle Size Risk**: Adding integration test code may slightly increase bundle if test code is inlined. **Mitigation**: Browser tests are not bundled; ensure no new runtime code is added.

---

## Failure Conditions

The sprint **MUST FAIL** if any of these occur:

1. `CircuitPalette.tsx` still exists at `src/components/Circuit/CircuitPalette.tsx` (file not deleted).

2. `CircuitModulePanel` stops rendering `data-circuit-component` buttons or shows fewer than 14 buttons.

3. Clicking INPUT, AND, or TIMER buttons does not add nodes to canvas (status count does not increment).

4. Existing functionality regresses: layer creation, layer switching, junction creation, or sequential gate rendering stops working.

5. Test count drops below 6030 (after removing dead code tests, replacement tests must be added first).

6. `dist/assets/index-*.js` exceeds 512KB.

7. `npx tsc --noEmit` produces errors.

8. Any crash or unhandled error during circuit mode toggle (ON/OFF/ON cycle).

9. Layer isolation fails: nodes added to Layer 1 appear on Layer 2.

---

## Done Definition

The sprint is **COMPLETE** when ALL of the following are true:

1. `CircuitPalette.tsx` does not exist in `src/components/Circuit/`.

2. `CircuitPalette.test.tsx` is either deleted (with replacement tests added) or replaced by `CircuitModulePanel.browser.test.tsx` with equivalent coverage.

3. `CircuitModulePanel` renders exactly 14 `data-circuit-component` buttons in circuit mode.

4. INPUT, AND, and TIMER button clicks all add nodes to canvas (status increments).

5. Layer creation, layer switching, junction creation, and sequential gate Q/Q̅ signal display all work.

6. Test suite passes with ≥6030 tests.

7. Bundle size ≤512KB.

8. TypeScript compiles with 0 errors.

9. Circuit mode toggle (OFF→ON→OFF→ON) preserves canvas state with no crashes.

10. Layer isolation verified: nodes on Layer 1 are not visible on Layer 2.

---

## Out of Scope

- Integrating `CircuitPalette` into the app UI (Track A — not this contract's direction)
- Adding circuit validation/simulation logic
- Implementing recipe discovery
- Adding achievement system
- Building faction/reputation system
- Creating community gallery
- Implementing exchange/trade
- Building AI assistant
- Enhancing wire routing/pathfinding
- Adding memory element components beyond existing sequential gates
- Improving canvas rendering performance
- Adding undo/redo functionality
- Visual redesign of `CircuitModulePanel` (keep existing UI, only fix functional behavior)
