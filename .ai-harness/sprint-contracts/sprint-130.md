# Sprint Contract — Round 130

## Scope

**Remediation Sprint** — Fix the critical UI integration gaps identified in Round 129 feedback. All sub-circuit components exist in code but are not wired into the visible UI. This sprint completes the integration work required to make sub-circuit creation, viewing, and deletion functional for users.

The contract reviewer requested changes to strengthen testability and provide clearer verification paths. This revision adds:
- Explicit `data-testid` attributes for ALL interactive and state-bearing elements
- Specific negative assertions covering edge cases and error conditions
- Clear boundary conditions (≥2 modules, circuit mode active, etc.)
- Test method steps traceable to specific ACs

## Spec Traceability

- **P0 items covered this round:**
  - Canvas System: Sub-circuit component creation from selected modules
  - Components: Custom sub-circuit modules with drag-and-drop placement
  - UI Integration: Create Sub-circuit button, SubCircuitPanel integration

- **P0 items remaining after this round:**
  - None — sub-circuit system P0 work is complete pending this integration

- **P1 items covered this round:**
  - None — no P1 items in scope for this remediation sprint

- **P1 items remaining after this round:**
  - Sub-circuit component editing (renaming, modifying definition)
  - Sub-circuit search/filter in palette

- **P2 items intentionally deferred:**
  - Sub-circuit versioning
  - Sub-circuit templates/sharing
  - Nested sub-circuits (sub-circuits containing other sub-circuits)

## Deliverables

1. **Toolbar.tsx** — Add "Create Sub-circuit" button with:
   - `data-create-subcircuit-button` — visible when ≥2 modules selected AND circuit mode active
   - `data-create-subcircuit-button[disabled]` — when selection < 2 or wrong mode

2. **CircuitModulePanel.tsx** — Custom sub-circuits section with:
   - `data-custom-section-toggle` — section expand/collapse toggle
   - `data-custom-subcircuits` — container for sub-circuit items
   - `data-sub-circuit-item="<name>"` — each sub-circuit in palette
   - `data-empty-state` — shown when no sub-circuits exist

3. **App.tsx** — SubCircuitPanel rendered in sidebar with:
   - `data-sub-circuit-panel` — panel container
   - `data-subcircuit-list` — list of managed sub-circuits
   - `data-delete-subcircuit="<name>"` — delete button per sub-circuit
   - `data-confirm-delete` — confirmation button in delete modal
   - `data-delete-cancel` — cancel button in delete modal
   - `data-delete-confirm-overlay` — overlay backdrop of delete confirmation

4. **CreateSubCircuitModal** — Wired to Create Sub-circuit button via `useSubCircuitCanvas` hook:
   - `data-create-sub-circuit-modal` — modal container
   - `data-subcircuit-name-input` — name input field
   - `data-subcircuit-submit` — submit/create button
   - `data-subcircuit-cancel` — cancel button
   - `data-subcircuit-error` — error message display

5. **tests/e2e/sub-circuit.spec.ts** — E2E tests:
   - Completes within 60 seconds
   - No `waitForTimeout(5000)` calls remaining
   - All interactive elements use explicit locators

## Acceptance Criteria

1. **AC-130-001:** "Create Sub-circuit" button appears in the UI when ≥2 modules are selected in circuit mode; clicking opens CreateSubCircuitModal with `data-create-sub-circuit-modal` visible

2. **AC-130-002:** SubCircuitPanel is visible in the application UI with `data-sub-circuit-panel` attribute and displays all created sub-circuits or an empty state with `data-empty-state` attribute

3. **AC-130-003:** Full creation flow works end-to-end: select modules → click Create Sub-circuit → enter name → submit → sub-circuit appears in palette's Custom section with `data-sub-circuit-item="<name>"` attribute

4. **AC-130-004:** Full usage flow works end-to-end: click sub-circuit in palette → instance appears on canvas → can be connected and simulated → runs with correct logical output

5. **AC-130-005:** Full deletion flow works end-to-end: open SubCircuitPanel → click delete with `data-delete-subcircuit="<name>"` → confirm with `data-confirm-delete` → sub-circuit removed from store and canvas instances removed

6. **AC-130-006:** Build passes: `npx tsc --noEmit` exits 0, bundle ≤512KB, unit tests ≥5491 pass

7. **AC-130-007:** E2E tests pass without timeout: `npx playwright test tests/e2e/sub-circuit.spec.ts` completes within 60s with all tests passing

## Test Methods

### AC-130-001 Verification (Create button exists and opens modal)

**Preconditions:**
- Application loads successfully
- Circuit mode is available and can be enabled

**Entry:**
- Navigate to application
- Enable circuit mode
- Add 2 AND gates to canvas using palette
- Select all added gates (click-drag selection or Ctrl+A)

**Action:**
1. Locate "Create Sub-circuit" button: `await expect(page.locator('[data-create-subcircuit-button]')).toBeVisible({ timeout: 5000 })`
2. Assert button is NOT disabled: `await expect(page.locator('[data-create-subcircuit-button]')).not.toBeDisabled()`
3. Click the button: `await page.locator('[data-create-subcircuit-button]').click()`

**Completion:**
1. Assert modal opens: `await expect(page.locator('[data-create-sub-circuit-modal]')).toBeVisible({ timeout: 3000 })`
2. Assert name input visible: `await expect(page.locator('[data-subcircuit-name-input]')).toBeVisible()`

**Negative Assertions:**
1. Button should NOT appear when <2 modules selected: After clearing selection, `await expect(page.locator('[data-create-subcircuit-button]')).not.toBeVisible()` OR `await expect(page.locator('[data-create-subcircuit-button]')).toBeDisabled()`
2. Button should NOT appear when not in circuit mode: After disabling circuit mode with selection intact, button should not be visible
3. Modal should NOT open if button not clicked: Modal locator should not be visible without button interaction

**Boundary Conditions:**
- Exactly 2 modules selected: button should appear
- Exactly 1 module selected: button should NOT appear
- 0 modules selected: button should NOT appear
- Module selected but circuit mode disabled: button should NOT appear

---

### AC-130-002 Verification (SubCircuitPanel visible)

**Preconditions:**
- Application loads successfully
- SubCircuitPanel component is imported and rendered in App layout

**Entry:**
- Navigate to application (fresh load, no sub-circuits)

**Action:**
1. Locate SubCircuitPanel: `await expect(page.locator('[data-sub-circuit-panel]')).toBeVisible({ timeout: 5000 })`

**Completion:**
1. Assert panel container visible
2. If no sub-circuits: Assert empty state visible with `data-empty-state`
3. If sub-circuits exist: Assert list visible with `data-subcircuit-list`

**Negative Assertions:**
1. Panel should NOT render multiple times on the page
2. Panel should NOT crash when no sub-circuits exist
3. Empty state should NOT contain incorrect text (e.g., should not say "No modules" instead of "No sub-circuits")
4. Panel should NOT disappear after navigation or mode switching

---

### AC-130-003 Verification (Creation flow)

**Preconditions:**
- AC-130-001 verified (Create button works)
- At least 2 modules exist on canvas in selected state

**Entry:**
- Enable circuit mode
- Add 2 AND gates to canvas
- Select both AND gates

**Action:**
1. Click Create Sub-circuit button: `await page.locator('[data-create-subcircuit-button]').click()`
2. Verify modal opens: `await expect(page.locator('[data-create-sub-circuit-modal]')).toBeVisible()`
3. Enter name "TestCircuit" in input: `await page.locator('[data-subcircuit-name-input]').fill('TestCircuit')`
4. Click submit: `await page.locator('[data-subcircuit-submit]').click()`

**Completion:**
1. Assert modal closes: `await expect(page.locator('[data-create-sub-circuit-modal]')).not.toBeVisible({ timeout: 3000 })`
2. Assert sub-circuit in palette: `await expect(page.locator('[data-sub-circuit-item="TestCircuit"]')).toBeVisible({ timeout: 5000 })`

**Error Handling Tests:**
1. **Empty name:** Fill input with empty string, click submit → modal should NOT close, error visible
2. **Duplicate name:** Create "TestCircuit" → create another with "TestCircuit" → modal should NOT close, duplicate error visible
3. **Whitespace-only name:** Fill input with "   ", click submit → modal should NOT close, validation error visible

**Negative Assertions:**
1. Modal should NOT remain open after successful submit
2. Sub-circuit should NOT appear in palette before submit is clicked
3. Submit button should NOT be clickable when input is empty (if disabled state implemented)
4. Sub-circuit should NOT be created if duplicate name error is shown

---

### AC-130-004 Verification (Usage flow)

**Preconditions:**
- Sub-circuit "TestCircuit" exists from AC-130-003

**Entry:**
- Navigate to application
- Enable circuit mode
- Locate "TestCircuit" in palette Custom section

**Action:**
1. Find sub-circuit in palette: `await expect(page.locator('[data-sub-circuit-item="TestCircuit"]')).toBeVisible()`
2. Click sub-circuit: `await page.locator('[data-sub-circuit-item="TestCircuit"]').click()`
3. Verify canvas instance appears (wait for render)

**Completion:**
1. Assert circuit node added to canvas
2. Assert node displays label with `data-sub-circuit-label="TestCircuit"`
3. Assert node has input ports visible (for AND gate → 2 inputs)
4. Assert node has output port visible
5. Wire input port to signal source (e.g., constant HIGH)
6. Wire output port to signal sink (e.g., LED)
7. Run simulation
8. Verify correct logical output (AND of 2 HIGH inputs = HIGH)

**Simulation Edge Cases:**
1. **One HIGH, one LOW input:** Output should be LOW
2. **Both LOW inputs:** Output should be LOW
3. **Disconnected inputs:** Output should be LOW or undefined

**Negative Assertions:**
1. Canvas should NOT crash when adding sub-circuit instance
2. Canvas should NOT crash when removing sub-circuit instance
3. Simulation should NOT error when sub-circuit is part of circuit
4. Sub-circuit instance should NOT be selectable if deleted from panel while on canvas

---

### AC-130-005 Verification (Deletion flow)

**Preconditions:**
- Sub-circuit "TestCircuit" exists from AC-130-003
- SubCircuitPanel is visible

**Entry:**
- Ensure "TestCircuit" sub-circuit exists
- Navigate to SubCircuitPanel

**Action:**
1. Assert panel visible: `await expect(page.locator('[data-sub-circuit-panel]')).toBeVisible()`
2. Click delete button: `await page.locator('[data-delete-subcircuit="TestCircuit"]').click()`
3. Verify confirmation modal appears: `await expect(page.locator('[data-delete-confirm-overlay]')).toBeVisible()`
4. Click confirm: `await page.locator('[data-confirm-delete]').click()`

**Completion:**
1. Assert confirmation modal closes: `await expect(page.locator('[data-delete-confirm-overlay]')).not.toBeVisible()`
2. Assert sub-circuit removed from panel: `await expect(page.locator('[data-delete-subcircuit="TestCircuit"]')).not.toBeVisible()`
3. Assert sub-circuit removed from palette: `await expect(page.locator('[data-sub-circuit-item="TestCircuit"]')).not.toBeVisible()`
4. Assert no TestCircuit instances remain on canvas

**Cancel Flow:**
1. Click delete button: `await page.locator('[data-delete-subcircuit="OtherCircuit"]').click()`
2. Verify confirmation modal appears
3. Click cancel: `await page.locator('[data-delete-cancel]').click()`
4. Assert modal closes, sub-circuit still exists in panel and palette

**Negative Assertions:**
1. Other sub-circuits should NOT be affected by deletion of one
2. Canvas should NOT crash after deletion
3. Panel should NOT crash when deleting the last sub-circuit
4. Panel should show empty state with `data-empty-state` if all sub-circuits deleted

---

### AC-130-006 Verification (Build)

**Preconditions:**
- All code changes committed

**Action:**
1. Run TypeScript check: `npx tsc --noEmit`
2. Run build: `npm run build`
3. Run unit tests: `npm test -- --run`

**Completion:**
1. TypeScript: Exit code 0, 0 errors
2. Bundle size: `index-*.js` ≤ 512KB
3. Unit tests: ≥5491 tests pass

**Negative Assertions:**
1. No TypeScript errors (no `any` type suppressions)
2. No console errors on build
3. No test failures
4. Bundle should NOT include duplicate code

---

### AC-130-007 Verification (E2E timing)

**Preconditions:**
- Playwright installed: `npx playwright install`
- Test file exists at `tests/e2e/sub-circuit.spec.ts`

**Action:**
1. Run E2E tests: `npx playwright test tests/e2e/sub-circuit.spec.ts`
2. Measure total execution time

**Completion:**
1. All tests pass
2. Total execution time ≤ 60 seconds

**Negative Assertions:**
1. No `waitForTimeout(5000)` or `waitForTimeout(3000)` calls in test file
2. No test should timeout (default timeout should be sufficient)
3. No console errors during test execution
4. No test should be skipped

## Risks

1. **Risk: Toolbar already crowded** — Adding a "Create Sub-circuit" button may cause layout issues
   - **Mitigation:** Button conditional on selection state, not always visible. Use icon+text, position near circuit mode toggle

2. **Risk: SubCircuitPanel positioning** — Sidebar may not have room
   - **Mitigation:** Add as collapsible section within CircuitModulePanel or as sidebar tab

3. **Risk: Hook not connected to UI** — `openCreateModal()` never called from UI
   - **Mitigation:** Add button click handler calling `openCreateModal()` from `useSubCircuitCanvas`

4. **Risk: E2E tests still timing out** — 5000ms waits may be fundamental
   - **Mitigation:** Replace ALL `waitForTimeout` with `expect(locator).toBeVisible({ timeout: 3000 })`

5. **Risk: Conditional rendering breaks visibility checks** — Custom section only shows when subCircuits.length > 0
   - **Mitigation:** Section always renders; shows empty state when no sub-circuits

6. **Risk: SubCircuitModule not registered in renderer** — Canvas may not render sub-circuit nodes
   - **Mitigation:** Ensure sub-circuit type registered in canvas rendering logic

7. **Risk: State persistence across page reloads** — Sub-circuits disappear after refresh
   - **Mitigation:** Verify Zustand persist middleware configured with correct localStorage key

## Failure Conditions

The round MUST fail if ANY of the following occur:

1. **Button missing:** "Create Sub-circuit" button does not appear when ≥2 modules selected in circuit mode
2. **Panel missing:** SubCircuitPanel is not visible anywhere in the application layout
3. **Modal unreachable:** CreateSubCircuitModal cannot be opened via any UI action
4. **Creation broken:** Sub-circuits do not appear in the palette after creation flow completes
5. **TypeScript errors:** `npx tsc --noEmit` exits non-zero
6. **Bundle oversized:** Bundle exceeds 512KB after integration
7. **E2E timeout:** `npx playwright test tests/e2e/sub-circuit.spec.ts` exceeds 120 seconds
8. **Page crash:** Any page crash during sub-circuit creation, usage, or deletion flows
9. **Critical functionality broken:** Existing E2E tests (circuit-canvas.spec.ts) fail due to integration changes
10. **Wait times remain:** Any `waitForTimeout(5000)` or `waitForTimeout(3000)` remains in sub-circuit tests

## Done Definition

ALL of the following MUST be true before claiming round complete:

1. ✓ "Create Sub-circuit" button exists with `data-create-subcircuit-button` and is visible when ≥2 modules selected in circuit mode
2. ✓ Button is disabled/hidden when conditions not met (< 2 modules selected OR circuit mode disabled)
3. ✓ Clicking button opens CreateSubCircuitModal with `data-create-sub-circuit-modal` visible
4. ✓ SubCircuitPanel is rendered in visible application layout with `data-sub-circuit-panel`
5. ✓ Panel shows empty state with `data-empty-state` when no sub-circuits exist
6. ✓ Full creation flow: selected modules → named sub-circuit → appears in palette with `data-sub-circuit-item="<name>"`
7. ✓ Empty/duplicate name handling: error shown, modal does NOT close
8. ✓ Full usage flow: click palette item → canvas instance → simulation produces correct output
9. ✓ Full deletion flow: delete from panel → confirmation → removed from canvas and palette
10. ✓ `npx tsc --noEmit` exits 0
11. ✓ Bundle ≤ 512KB
12. ✓ `npm test -- --run` shows ≥ 5491 tests passing
13. ✓ `npx playwright test tests/e2e/sub-circuit.spec.ts` completes within 60s with all tests passing
14. ✓ Zero `waitForTimeout(5000)` or `waitForTimeout(3000)` calls in sub-circuit E2E tests
15. ✓ `npx playwright test tests/e2e/circuit-canvas.spec.ts` continues to pass (no regression)

## Out of Scope

- **Sub-circuit editing** — rename, change internal modules, modify definition
- **Nested sub-circuits** — sub-circuits containing other sub-circuits
- **Sub-circuit search/filter** — finding sub-circuits in palette
- **Sub-circuit export/import** — community gallery sharing
- **Sub-circuit versioning** — history or version control
- **Performance optimization** — beyond fixing E2E timeouts
- **New logic gates** — any new components outside sub-circuit system
- **Simulation engine changes** — modifications to core simulation
- **Tech tree changes** — progression system modifications
- **Non-sub-circuit UI changes** — any changes to other parts of application
