# Sprint Contract — Round 57

## APPROVED

## Scope

This sprint is a **remediation sprint** focused on fixing a critical integration failure from Round 56. The `RandomGeneratorModal` component exists with full UI implementation, but was never connected to App.tsx, making the random generator button in the toolbar non-functional.

## Spec Traceability

### P0 Items (Critical — Must Fix)
- **RandomGeneratorModal Integration** — The `RandomGeneratorModal` component was defined in `src/components/Editor/RandomGeneratorModal.tsx` but was never imported or rendered in `App.tsx`. This is the only blocking issue from Round 56.

### P1 Items (Covered this round)
- AC1: Themed Random Generation UI — UI component ready, just needed integration
- AC2: Complexity Controls — UI component ready, just needed integration
- AC3: Aesthetic Validation — Validation logic ready, just needed integration

### Remaining P0/P1 After This Round
- None — All P0/P1 items from Round 56 are complete after this integration fix

### P2 Items Intentionally Deferred
- No new P2 work in this sprint

## Deliverables

1. **Integrated RandomGeneratorModal** — Modified `src/App.tsx` with:
   - `showRandomGenerator` state variable in `AppContent`
   - `onOpenRandomGenerator={() => setShowRandomGenerator(true)}` prop passed to `<Toolbar>`
   - `<RandomGeneratorModal>` rendered conditionally when `showRandomGenerator` is true
   - `onGenerate` callback wired to `loadMachine()` to apply generated modules to canvas

2. **Rewritten RandomGeneratorModal** — Modified `src/components/Editor/RandomGeneratorModal.tsx`:
   - Removed internal dependency on `useRandomGenerator` hook's `isModalOpen` state (which conflicted with parent-controlled visibility)
   - All UI state (theme, density, sliders, preview) is now local to the component
   - Generation uses dynamic `import()` of `generateWithTheme` from `randomGenerator.ts`
   - `loadMachine()` and `showRandomForgeToast()` called directly from the component
   - `onGenerate` callback provided for parent notification

3. **Verified Build** — Zero TypeScript errors, production build succeeds

4. **Browser Verification** — Random generator modal opens when toolbar button is clicked, generates themed machines, and applies them to canvas

## Acceptance Criteria

1. **AC1: Themed Random Generation UI** — When user clicks the random generator button (🎲 随机生成) in the toolbar, the `RandomGeneratorModal` opens displaying:
   - 8 theme selection buttons in a 4-column grid
   - Each theme shows icon, name, and selected state
   - Selected theme highlights with cyan border and glow

2. **AC2: Complexity Controls** — The modal displays:
   - Min/max module count sliders (range 2-15)
   - Connection density selector (稀疏/适中/密集)
   - Preview panel showing validation status

3. **AC3: Aesthetic Validation** — Preview panel shows:
   - Overall validation status (✅/⚠️)
   - Complexity statistics (module count, connection count, density)
   - Validation details (core present, no overlaps, valid connections, energy flow)

4. **AC4: Generation & Application** — Clicking "生成并应用" (Generate and Apply):
   - Generates a themed machine based on selected theme and complexity
   - Calls `loadMachine(result.modules, result.connections)` to populate canvas
   - Shows toast notification via `showRandomForgeToast()`
   - Closes the modal
   - Machine appears in editor ready for further editing

5. **AC5: Build Integrity** — `npm run build` completes with 0 TypeScript errors

## Test Methods

1. **Browser Smoke Test — Modal Opens**
   - Open dev server (`npm run dev`)
   - Locate toolbar button with text "🎲 随机生成"
   - Click the button
   - **Verify:** Modal dialog appears with title "🎲 随机锻造"

2. **Browser Smoke Test — Theme Selection**
   - With modal open, click any theme button (e.g., "🔥 熔岩之心")
   - **Verify:** Button shows selected state (cyan border, glow)
   - **Verify:** Description text updates below grid

3. **Browser Smoke Test — Complexity Controls**
   - Adjust min module slider to value 5
   - **Verify:** Value displays as "5"
   - Click "适中" density button
   - **Verify:** Button shows selected state

4. **Browser Smoke Test — Preview Generation**
   - Click "预览" (Preview) button
   - **Verify:** Preview panel updates with validation results
   - **Verify:** Statistics show module count, connection count, density

5. **Browser Smoke Test — Generate and Apply**
   - Clear canvas first (if needed)
   - Select a theme
   - Click "生成并应用" (Generate and Apply)
   - **Verify:** Modal closes
   - **Verify:** Canvas shows generated modules (minimum 2 modules)
   - **Verify:** Modules are placed without overlapping
   - **Verify:** Connections exist between modules (if density > 0)

6. **Build Verification**
   - Run `npm run build`
   - **Verify:** 0 TypeScript errors
   - **Verify:** Build completes successfully

## Risks

1. **Low Risk — Modal Visibility Conflict** — The Round 56 `RandomGeneratorModal` (defined at the bottom of App.tsx) used `useRandomGenerator` internally which managed its own `isModalOpen` state, conflicting with parent-controlled visibility. This was resolved by rewriting the component to use only `isOpen` prop for visibility control.

2. **Low Risk — Dynamic Import** — The modal now uses `await import('../../utils/randomGenerator')` at click time for `generateWithTheme`. This is safe for the browser build and avoids bundling the full generator into the modal chunk unnecessarily.

3. **Low Risk — Canvas State Sync** — The `loadMachine()` function from `useMachineStore` handles clearing/loading modules. The modal calls this directly.

## Failure Conditions

This sprint MUST FAIL if any of the following conditions are true:

1. **Toolbar Button Does Nothing** — If clicking the random generator button does not open the modal
2. **Modal Renders But Generation Fails** — If modal opens but "生成并应用" does not populate the canvas with modules
3. **Build Errors** — If `npm run build` produces any TypeScript errors
4. **Module Overlaps** — If generated machines have overlapping modules (aesthetic validation failure)
5. **No Connections Generated** — If "适中" or "密集" density results in 0 connections (connectivity failure)

## Done Definition

The round is complete ONLY when ALL of the following conditions are true:

1. ✅ `showRandomGenerator` state variable exists in `AppContent` component
2. ✅ `onOpenRandomGenerator={() => setShowRandomGenerator(true)}` is passed to `<Toolbar>`
3. ✅ `<RandomGeneratorModal>` is imported from `./components/Editor/RandomGeneratorModal`
4. ✅ `<RandomGeneratorModal>` is rendered conditionally when `showRandomGenerator` is true
5. ✅ Modal has `onClose={() => setShowRandomGenerator(false)}` handler
6. ✅ Modal has `onGenerate={(result) => { loadMachine(result.modules, result.connections); }}` callback
7. ✅ `RandomGeneratorModal.tsx` does NOT use `useRandomGenerator` hook's internal `isModalOpen` state for visibility control
8. ✅ All 4 browser smoke tests pass (modal opens, theme selection, complexity controls, generate & apply)
9. ✅ Build completes with 0 TypeScript errors
10. ✅ Toolbar button "🎲 随机生成" is functional and opens the themed random generator UI

## Out of Scope

The following items are explicitly NOT part of this sprint:

- **No new features** — This is a remediation sprint focused only on integration
- **No UI/UX changes** — The RandomGeneratorModal UI is complete and should not be modified
- **No utility function changes** — The random generation logic in `randomGenerator.ts` is tested and working
- **No test file modifications** — Existing tests should pass without changes
- **No other modal integrations** — RecipeBrowser and other modals are already integrated correctly
