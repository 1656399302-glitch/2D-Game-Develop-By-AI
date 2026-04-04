# QA Evaluation — Round 129

## Release Decision
- **Verdict:** FAIL
- **Summary:** Sub-circuit components are implemented in code but NOT integrated into the visible UI. The critical "Create Sub-circuit" button does not exist in the toolbar or anywhere in the UI, making sub-circuit creation impossible. SubCircuitPanel is also not rendered in the application.
- **Spec Coverage:** INSUFFICIENT — Sub-circuit components exist but UI integration is broken
- **Contract Coverage:** FAIL — 0/6 ACs fully verified (2 pass, 4 untested/failed)
- **Build Verification:** PASS — TypeScript 0 errors, bundle 510.25KB ≤ 512KB
- **Browser Verification:** FAIL — UI elements missing
- **Placeholder UI:** NONE (components exist but not wired up)
- **Critical Bugs:** 1
- **Major Bugs:** 0
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 2/6
- **Untested Criteria:** 4

## Blocking Reasons

1. **[CRITICAL] AC-129-001 FAIL**: "Create Sub-circuit" button does NOT exist in the UI. The CreateSubCircuitModal.tsx component exists but has no visible trigger. The acceptance criterion states "User clicks 'Create Sub-circuit' button (context menu or toolbar)" but this button is completely absent from Toolbar.tsx and the application.

2. **[CRITICAL] AC-129-004 FAIL**: SubCircuitPanel is not integrated into the visible UI. The component exists at `src/components/SubCircuit/SubCircuitPanel.tsx` with proper `data-sub-circuit-panel` attribute but is never imported or rendered in App.tsx or any layout component.

3. **[CRITICAL] UI Integration Missing**: All sub-circuit components are standalone files that are not wired into the application:
   - `CreateSubCircuitModal` - exists but no button triggers it
   - `SubCircuitPanel` - exists but not rendered in UI
   - `useSubCircuitCanvas` hook - exists but not used by any component
   - `Custom` section in CircuitModulePanel - only shows if subCircuits.length > 0 (impossible to create any)

4. **AC-129-002 UNTESTED**: Cannot verify sub-circuit appears in palette since there's no way to create sub-circuits.

5. **AC-129-003 UNTESTED**: Cannot verify sub-circuit renders on canvas since there's no way to create sub-circuits.

6. **AC-129-006 UNTESTED (UI)**: Store persistence is verified via unit tests but cannot be tested in browser since no UI exists to create sub-circuits.

## Scores
- **Feature Completeness: 4/10** — All 8 deliverable files exist (types, store, components, hook, tests) but 0 are integrated into the visible UI. The acceptance criteria require UI buttons and panels that simply don't exist.
- **Functional Correctness: 9/10** — TypeScript 0 errors (`npx tsc --noEmit` exits 0). Unit tests pass: 21 subCircuitStore tests, 14 subCircuitModule tests. Store logic is correct (create, delete, validation, limit enforcement). However, this score doesn't reflect the broken UI.
- **Product Depth: 6/10** — Components are well-designed with proper SVG icons, modal validation, confirmation dialogs, but only from a code perspective. The UI workflow (button → modal → confirmation → palette) is incomplete.
- **UX / Visual Quality: 5/10** — The components that exist follow the circuit-board aesthetic (purple color scheme, SubCircuitIcon with circuit traces, badges). However, users cannot access any of this since the UI is incomplete.
- **Code Quality: 9/10** — Clean TypeScript with proper interfaces, Zustand store with persist middleware, component props correctly typed, hooks follow best practices, tests have good coverage.
- **Operability: 4/10** — Dev server runs cleanly. Build completes. All 5491 unit tests pass. All 31 circuit-canvas E2E tests pass. But the sub-circuit E2E tests (tests/e2e/sub-circuit.spec.ts) TIMED OUT after 120 seconds due to excessive wait times (each test has multiple 5000ms waits).

- **Average: 6.2/10** (Below 9.0 threshold)

## Evidence

### AC-129-001: Sub-circuit creation flow — **FAIL**
- **Entry**: Circuit mode enabled ✅, 2+ modules added to canvas ✅
- **Action**: "User clicks 'Create Sub-circuit' button" — **BUTTON DOES NOT EXIST**
- **Browser verification**: Searched Toolbar.tsx — no "Create Sub-circuit" button found
- **Browser verification**: Searched CircuitModulePanel.tsx — no "Create Sub-circuit" button found
- **Browser verification**: Ran `browser_test` with 2 AND gates selected, no create button visible
- **Negative test**: Cannot verify duplicate name error or empty name handling since modal cannot be opened
- **Evidence**: `CreateSubCircuitModal.tsx` exists with `data-create-sub-circuit-modal` attribute but `openCreateModal()` from `useSubCircuitCanvas` hook is never called from any visible UI element

### AC-129-002: Sub-circuit appears in palette — **UNTESTED**
- Cannot verify since no way to create sub-circuits
- CircuitModulePanel.tsx has Custom section with `data-custom-section-toggle` and `data-custom-subcircuits` but only renders if `sortedSubCircuits.length > 0`
- Code inspection confirms palette integration is correct but unreachable

### AC-129-003: Sub-circuit renders on canvas — **UNTESTED**
- Cannot verify since no way to create sub-circuits
- SubCircuitModule.tsx component exists with proper SVG icon, name label, module count badge
- `handleSubCircuitClick` in CircuitModulePanel correctly calls `addCircuitNode` with `isSubCircuit: true` and `subCircuitId`
- But unreachable without first creating a sub-circuit

### AC-129-004: Sub-circuit deletion — **FAIL**
- **Browser verification**: `browser_test` attempted `assert_visible('[data-sub-circuit-panel]')` — **TIMEOUT 5000ms**
- SubCircuitPanel.tsx component exists with delete confirmation modal (`data-delete-confirm-overlay`, `data-confirm-delete`)
- But component is never imported or rendered in App.tsx or any layout
- `find src -name "*.tsx" -exec grep -l "SubCircuitPanel" {} \;` returns only `SubCircuitPanel.tsx` itself

### AC-129-005: Non-regression and build — **PASS**
- `npx tsc --noEmit` → exit code 0, 0 errors ✅
- `npm run build` → `index-CcQ3SURp.js 510.25 kB` ≤ 512KB ✅
- `npm test -- --run` → **5491 tests passed** (202 test files) ✅
  - subCircuitStore.test.ts: 21 tests ≥ 5 required ✅
  - subCircuitModule.test.tsx: 14 tests ≥ 3 required ✅
- `npx playwright test tests/e2e/circuit-canvas.spec.ts` → **31 passed** (23.5s) ✅
- `npx playwright test tests/e2e/sub-circuit.spec.ts` → **TIMED OUT after 120s** ❌

### AC-129-006: Store persistence — **PASS (tests) / UNTESTED (UI)**
- `useSubCircuitStore.ts` uses Zustand persist with `SUB_CIRCUIT_STORAGE_KEY = 'arcane-subcircuits-storage'`
- Unit tests verify persistence works (`createSubCircuit`, reload, verify survives)
- But cannot verify in browser since no UI exists to create sub-circuits

## Bugs Found

1. **[CRITICAL - Severity: CRASH] Missing UI Integration for Sub-circuit System**
   - **Description**: All sub-circuit components exist in code but are not integrated into the visible UI. Users cannot create, view, or delete sub-circuits.
   - **Reproduction steps**:
     1. Navigate to the app
     2. Enable circuit mode
     3. Add 2 AND gates to canvas
     4. Look for "Create Sub-circuit" button — NOT FOUND
     5. Look for SubCircuitPanel in sidebar — NOT FOUND
   - **Impact**: Sub-circuit module system is completely unusable. Users cannot interact with any part of the system despite all code being implemented.
   - **Fix required**: Add "Create Sub-circuit" button to Toolbar.tsx or CircuitModulePanel.tsx. Add SubCircuitPanel to the main app layout.

## Required Fix Order

1. **Add "Create Sub-circuit" button to UI** — The most critical missing piece. Add a button to Toolbar.tsx (next to circuit mode toggle) or CircuitModulePanel.tsx that calls `openCreateModal()` when clicked. The button should be enabled when ≥2 modules are selected.

2. **Integrate SubCircuitPanel into main app layout** — Import and render SubCircuitPanel in the sidebar or as a collapsible section. The panel should be accessible from the UI even when no sub-circuits exist (shows empty state).

3. **Fix sub-circuit E2E tests** — The tests in `tests/e2e/sub-circuit.spec.ts` timed out due to excessive `waitForTimeout(5000)` calls. Optimize by reducing wait times or using better assertion strategies.

## What's Working Well

1. **Store implementation solid** — `useSubCircuitStore.ts` is complete with create, delete, validation, 20-sub-circuit limit, and Zustand persist middleware. Unit tests pass with good coverage.

2. **Component code quality high** — `SubCircuitModule.tsx` has excellent SVG rendering with circuit-board aesthetic (purple color, IC chip, trace lines, port indicators). `CreateSubCircuitModal.tsx` has proper validation, error messages, keyboard shortcuts (Enter/Esc). `SubCircuitPanel.tsx` has proper delete confirmation modal with name displayed.

3. **Palette integration correct** — `CircuitModulePanel.tsx` correctly shows Custom section with sorted sub-circuits, each with SubCircuitIcon, name, and module count. The `handleSubCircuitClick` function correctly calls `addCircuitNode` with sub-circuit metadata.

4. **Non-regression perfect** — 5491 unit tests pass, 31 circuit-canvas E2E tests pass, bundle 510.25KB (1.75KB under limit), TypeScript 0 errors.

5. **Type definitions complete** — `src/types/subCircuit.ts` has all necessary interfaces (SubCircuitModule, CreateSubCircuitInput, CreateSubCircuitResult, etc.) with proper TypeScript types.

6. **useSubCircuitCanvas hook complete** — Orchestrates the creation workflow correctly, manages modal state, validates inputs, provides toast feedback.
