# Sprint Contract — Round 155

## Scope

**Primary objective:** Connect `useModuleStore` to a UI component so that faction tier modules (unlocked via faction machine progression) appear in the user's view. This is a **UI integration fix** — the store logic is correct and complete from round 154.

## Spec Traceability

- **P0 (this round):** AC-154-004 remediation — faction tier modules must be visible in a UI panel
- **P1 (this round):** TM-154-005 integration test upgrade — must test actual component rendering, not simulation
- **Remaining P0 after this round:** None — AC-154-004 is the sole outstanding blocking item from round 154
- **Remaining P1 after this round:** None — all other round 154 ACs passed
- **P2 intentionally deferred:** None — this sprint is narrow remediation-only

## Deliverables

1. **`src/components/Circuit/CircuitModulePanel.tsx`** (or `ModulePanel.tsx`) — imports `useModuleStore`, renders a "Faction Modules" section showing all unlocked faction tier modules. The section must:
   - Group modules by faction (e.g., "Void Faction", "Gearsmith Faction")
   - Visually distinguish tier-2 modules from tier-3 modules (different styling, icons, or labels)
   - Display each module's name or label (not just raw module IDs)
   - Only display when at least one faction tier module is unlocked
   - Be additive — must not interfere with existing circuit component or sub-circuit tabs

2. **`src/stores/__tests__/circuitModuleFactionDisplay.test.tsx`** — integration test file (new or extended) that:
   - Imports and renders `CircuitModulePanel` (or `ModulePanel`) using React Testing Library
   - Manipulates `useModuleStore` state directly (via `useModuleStore.setState()`) to unlock faction modules
   - Asserts the faction module section appears with correct module IDs
   - Asserts the section is hidden when no faction modules are unlocked
   - Does NOT use simulation-only assertions — must actually render the component via `@testing-library/react` `render()`

## Acceptance Criteria

1. **AC-155-001:** `grep -rn "useModuleStore" src/components/` returns ≥1 match (i.e., at least one UI component imports `useModuleStore`)

2. **AC-155-002:** `CircuitModulePanel` (or `ModulePanel`) renders a "Faction Modules" section that:
   - Reads `getUnlockedFactionModules()` from `useModuleStore.getState()`
   - Filters to only modules matching the `FACTION_MODULES` ID pattern (e.g., `gearsmith-t2-a`, `gearsmith-t3-b`)
   - Groups by faction
   - Displays module names or labels (not raw IDs only)
   - Visually distinguishes tier-2 from tier-3 modules (different styling, icons, or labels)

3. **AC-155-003:** The faction module section renders in the panel only when at least one faction tier module is unlocked (verified via automated test using `useModuleStore.setState()` to toggle unlock state)

4. **AC-155-004:** `npm test -- --run` shows ≥ 6276 passing tests (test count must not regress from round 154's 6276)

5. **AC-155-005:** `npm run build` produces a bundle ≤ 512 KB

6. **AC-155-006:** `npx tsc --noEmit` exits with code 0

7. **AC-155-007:** The integration test in `circuitModuleFactionDisplay.test.tsx`:
   - Imports `CircuitModulePanel` (or `ModulePanel`) as a React component
   - Uses `@testing-library/react` `render()` to mount the component
   - Manipulates `useModuleStore.setState()` to unlock at least one faction module
   - Queries rendered output for faction module content (e.g., `screen.getByText`, `getByTestId`)
   - Asserts correct module content appears in the faction module section
   - Asserts section is hidden when no faction modules are unlocked
   - **Negative assertion:** Test does not crash or show error state when faction modules are present

## Test Methods

### AC-155-001 (useModuleStore import grep)
- **Run:** `grep -rn "useModuleStore" src/components/` in a bash sub-shell
- **Verify:** stdout contains ≥1 line matching `src/components/.*useModuleStore`

### AC-155-002 (Faction module section rendering with names and tier distinction)
- **Run:** `npm test -- --run src/stores/__tests__/circuitModuleFactionDisplay.test.tsx`
- **Verify:** Test imports `CircuitModulePanel` (or `ModulePanel`), calls `useModuleStore.setState({ unlockedModules: new Set(['gearsmith-t2-a', 'gearsmith-t2-b']) })`, renders the component, and asserts that:
  - The faction module section is visible in the rendered output
  - Module names or labels are displayed (not just raw IDs like `gearsmith-t2-a`)
  - Tier-2 and tier-3 modules are visually distinguishable (different CSS classes, icons, or labels)
- **Negative assertion:** Non-faction modules (base, faction-variant, advanced) do NOT appear in the faction module section

### AC-155-003 (Section conditional display)
- **Run:** `npm test -- --run src/stores/__tests__/circuitModuleFactionDisplay.test.tsx`
- **Verify:** Test has two cases:
  1. With `unlockedModules: new Set()` (empty), assert faction module section is NOT in the rendered output
  2. With `unlockedModules: new Set(['gearsmith-t2-a'])`, assert faction module section IS in the rendered output
- **Negative assertion:** After clearing all faction module unlocks, the section must not render

### AC-155-004 (Test count regression guard)
- **Run:** `npm test -- --run` in a bash sub-shell
- **Verify:** output line `Tests  X passed` has X ≥ 6276

### AC-155-005 (Bundle size)
- **Run:** `npm run build` in a bash sub-shell
- **Verify:** `dist/assets/index-*.js` size ≤ 524,288 bytes (512 KB)

### AC-155-006 (TypeScript clean)
- **Run:** `npx tsc --noEmit` in a bash sub-shell
- **Verify:** exit code 0, zero stderr output

### AC-155-007 (Integration test renders actual component)
- **Run:** `npm test -- --run src/stores/__tests__/circuitModuleFactionDisplay.test.tsx`
- **Verify:**
  - Test file imports `CircuitModulePanel` (or `ModulePanel`) as a React component
  - Test uses `@testing-library/react` `render()` function to mount the component
  - Test manipulates `useModuleStore.setState()` to unlock at least one faction module
  - Test queries rendered output (e.g., `screen.getByText(/.../)` or `getByTestId(...)`)
  - Test asserts correct module content appears in the faction module section
  - Test asserts section is hidden when no faction modules are unlocked
- **Negative assertion:** Test does not crash or show error state when faction modules are present

## Risks

1. **Integration point risk:** `CircuitModulePanel` is an existing component. Adding a new section must not break existing tabs (circuit components, sub-circuits). Risk is low since the fix is additive, but tab layout/CSS must be verified.
2. **Store hydration timing:** If `CircuitModulePanel` reads from `useModuleStore` before the persist middleware rehydrates, the faction module section may not appear. Mitigation: ensure the component subscribes reactively (via `useModuleStore()` hook), not just a one-time snapshot.
3. **Test isolation:** Tests must clean up store state between runs to avoid cross-test pollution. Use `beforeEach` to reset store to known state.
4. **Duplicate imports:** Multiple components importing `useModuleStore` unnecessarily is acceptable but should be avoided. The fix should be targeted.
5. **Module name display risk:** The faction module data structure may not include display names. If `FACTION_MODULES` only has IDs and tier information, the component may need to derive names from the module ID or data structure. Builder should verify what name/label data is available before implementation.

## Failure Conditions

1. `grep -rn "useModuleStore" src/components/` returns 0 results (no UI component connects to the store)
2. `CircuitModulePanel` (or `ModulePanel`) renders but the faction module section is absent or empty after a faction is progressed to tier 2
3. Faction module section displays only raw module IDs without names/labels
4. Tier-2 and tier-3 modules are not visually distinguishable in the section
5. Integration test in `circuitModuleFactionDisplay.test.tsx` does NOT import and render `CircuitModulePanel` (i.e., still uses simulation-only assertions)
6. Test count drops below 6276
7. Bundle size exceeds 512 KB
8. TypeScript compilation fails (`npx tsc --noEmit` exits non-zero)
9. The faction module section crashes or throws errors when rendered (e.g., undefined array access on `getUnlockedFactionModules`)

## Done Definition

All of the following must be true before the builder claims the round complete:

1. `grep -rn "useModuleStore" src/components/` returns ≥1 result
2. `CircuitModulePanel` (or `ModulePanel`) imports `useModuleStore` and renders a faction module section
3. Faction module section displays module names or labels (not raw IDs only)
4. Faction module section visually distinguishes tier-2 from tier-3 modules
5. `circuitModuleFactionDisplay.test.tsx` contains tests that:
   - Actually render `CircuitModulePanel` using `@testing-library/react`
   - Manipulate `useModuleStore.setState()` to unlock faction modules
   - Assert faction module content appears in rendered output
   - Assert section is hidden when no faction modules are unlocked
6. The faction module section is hidden when no faction tier modules are unlocked
7. All 6276+ tests pass (`npm test -- --run`)
8. Bundle ≤ 512 KB (`npm run build`)
9. TypeScript clean (`npx tsc --noEmit` exits 0)
10. The faction module section does not interfere with existing circuit component or sub-circuit tabs in `CircuitModulePanel`

## Out of Scope

- Modifying `useModuleStore` logic (it is correct; only the UI layer needs changes)
- Modifying `FACTION_MODULES` data structure
- Adding new faction tier thresholds or changing tier logic
- Changing `CircuitModulePanel`'s circuit component or sub-circuit tabs
- Adding faction module drag-and-drop support (simple text/icon display is sufficient)
- Tech tree or faction panel changes (those are already passing)
- Adding a new standalone panel — integration into existing `CircuitModulePanel` or `ModulePanel` is required
- Browser-based end-to-end verification (automated integration tests via `@testing-library/react` are sufficient)
