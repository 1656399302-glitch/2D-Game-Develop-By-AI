# Sprint Contract — Round 48

## Scope

This round is focused exclusively on **remediating the Toolbar-RecipeBrowser state disconnect bug** that caused the Round 47 contract to fail. No new features are in scope.

## Spec Traceability

### P0 Items (Must Fix This Round)
- **AC3.2:** Toolbar recipe button must open Recipe Browser when clicked

### P1 Items (Already Passing, Verification Only)
- AC1.1-1.4: Faction variant SVG implementations (code verified, browser blocked by rank lock — verification mode accepted per Round 47 QA)
- AC2.1-2.3: Performance improvements (debounced saves, spatial indexing, tests pass)
- AC3.1: Recipe button visible in toolbar
- AC3.3: Recipe Browser displays 18 recipes (Base Modules: 14, Faction Variants: 4) when opened
- AC4.1-4.2: Build verification (0 TypeScript errors, clean build)

### Remaining P0/P1 After This Round
- All P0/P1 items from Round 47 should be complete after this remediation

### P2 Intentionally Deferred
- Faction variant browser rendering verification (code verified as sufficient per Round 47 QA notes — all 4 variants have correct SVG implementations confirmed via inspection)

## Deliverables

1. **Fixed Toolbar-RecipeBrowser Integration**
   - File: `src/App.tsx` — Add `showRecipeBrowser` state and pass `setShowRecipeBrowser` callback to Toolbar
   - File: `src/components/Editor/Toolbar.tsx` — Accept `onOpenRecipeBrowser` prop and call it on button click
   - File: `src/components/Recipes/RecipeBrowser.tsx` — Remove module-level `internalRecipeBrowserOpen` variable, accept `isOpen` and `onClose` props instead

2. **Updated TypeScript Types**
   - File: `src/components/Editor/Toolbar.tsx` — Add `onOpenRecipeBrowser?: () => void` to ToolbarProps interface
   - File: `src/components/Recipes/RecipeBrowser.tsx` — Add `isOpen: boolean` and `onClose: () => void` to RecipeBrowserProps

3. **Updated Unit/Integration Tests**
   - File: `src/components/Editor/__tests__/Toolbar.test.tsx` — Update tests to use `onOpenRecipeBrowser` prop instead of module-level variable
   - File: `src/components/Recipes/__tests__/RecipeBrowser.test.tsx` — Update tests to pass `isOpen`/`onClose` props
   - Note: These two test files contain the 74 tests reported in Round 47 QA; total test suite is 1708 tests

## Acceptance Criteria

1. **AC3.2 PASS:** Clicking the Toolbar's "配方" button (`aria-label="配方"`) opens the Recipe Browser
2. **AC3.1 CONTINUE:** Recipe button remains visible in toolbar after fix
3. **AC3.3 CONTINUE:** Recipe Browser displays 18 recipes (Base Modules: 14, Faction Variants: 4) when opened
4. **Build CONTINUE:** Application builds with 0 TypeScript errors
5. **Tests CONTINUE:** All 1708 existing tests continue to pass (including 74 updated tests in Toolbar.test.tsx and RecipeBrowser.test.tsx)
6. **No Module-Level State:** RecipeBrowser.tsx has no module-level variables for cross-component state communication

## Test Methods

1. **Browser Test (Manual Verification):**
   - Open application at `/`
   - Verify toolbar has button with `aria-label="配方"`
   - Click the button
   - Verify Recipe Browser modal/panel opens (visible header "配方图鉴" or similar)
   - Verify recipe list shows 18 recipes (verified by "Discovery Progress 0 / 18" and list content)

2. **Regression Test (Automated):**
   - `npm run build` → 0 TypeScript errors
   - `npm test -- --run` → all tests pass (1708 tests total, including 74 in Toolbar.test.tsx + RecipeBrowser.test.tsx)

3. **Code Inspection:**
   - Verify `src/components/Recipes/RecipeBrowser.tsx` does NOT contain module-level `internalRecipeBrowserOpen` variable
   - Verify `src/components/Editor/Toolbar.tsx` does NOT contain module-level `recipeBrowserOpen` variable
   - Verify `RecipeBrowser` component accepts `isOpen` and `onClose` props
   - Verify `Toolbar` component accepts `onOpenRecipeBrowser` prop

## Risks

1. **Low Risk — State Architecture Change:** The fix requires changing how Toolbar and RecipeBrowser manage state visibility. Using a single App-level state with props passed down is a standard React pattern and well-supported.

2. **Low Risk — Test Updates:** Existing tests for Toolbar and RecipeBrowser reference old prop names or module-level variables. Estimated 2 test file changes (Toolbar.test.tsx and RecipeBrowser.test.tsx totaling ~74 tests).

3. **No Risk — Visual Changes:** No visual changes expected; this is purely a state management fix.

## Failure Conditions

This round MUST FAIL if:
1. Toolbar's recipe button does not open Recipe Browser after clicking (AC3.2 remains broken)
2. Build fails with TypeScript errors
3. Test suite fails (any test failures beyond pre-existing test count)
4. Module-level `internalRecipeBrowserOpen` variable still exists in RecipeBrowser.tsx

This round MUST PASS if:
1. Toolbar's recipe button opens Recipe Browser when clicked
2. Recipe Browser can be closed and reopened via the toolbar button
3. All 1708 existing tests pass (including 74 updated tests)
4. Build succeeds with 0 TypeScript errors
5. No module-level state variables remain for cross-component communication

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ Toolbar's "配方" button (`aria-label="配方"`) is connected to Recipe Browser's visibility state via `onOpenRecipeBrowser` prop
2. ✅ Clicking the button opens Recipe Browser
3. ✅ Recipe Browser can be closed and reopened via the toolbar button
4. ✅ Recipe Browser displays 18 recipes when opened (Base Modules: 14, Faction Variants: 4)
5. ✅ `npm run build` succeeds with 0 TypeScript errors
6. ✅ `npm test -- --run` shows all 1708 tests passing (including updated Toolbar.test.tsx and RecipeBrowser.test.tsx with 74 tests)
7. ✅ No module-level `internalRecipeBrowserOpen` in RecipeBrowser.tsx
8. ✅ No module-level `recipeBrowserOpen` in Toolbar.tsx
9. ✅ Updated tests pass (Toolbar.test.tsx and RecipeBrowser.test.tsx updated for new props)

## Out of Scope

- **No new features** beyond the state disconnect fix
- **No faction variant browser rendering verification** — code verified as sufficient per Round 47 QA (verified via inspection: VoidArcaneGearSVG with purple/indigo colors, InfernoBlazingCoreSVG with red/orange, StormThunderingPipeSVG with cyan/blue, StellarHarmonicCrystalSVG with gold/white)
- **No visual changes** to Toolbar or Recipe Browser UI
- **No architectural refactors** beyond what's needed to fix the state disconnect
- **No test file creations** beyond necessary updates to existing test files (Toolbar.test.tsx and RecipeBrowser.test.tsx)

## Implementation Approach

The fix requires a unidirectional data flow:

```
App.tsx (owns showRecipeBrowser state)
    │
    ├──► Toolbar.tsx (receives onOpenRecipeBrowser callback)
    │        │
    │        └──► Button calls onOpenRecipeBrowser() on click
    │
    └──► RecipeBrowser.tsx (receives isOpen + onClose props)
             │
             └──► Listens to isOpen prop for visibility
```

Key changes:
1. Remove module-level `recipeBrowserOpen` from Toolbar.tsx
2. Remove module-level `internalRecipeBrowserOpen` from RecipeBrowser.tsx
3. Add state management to App.tsx
4. Pass props through component hierarchy
5. Update Toolbar.test.tsx to use `onOpenRecipeBrowser` prop (~estimated tests)
6. Update RecipeBrowser.test.tsx to pass `isOpen`/`onClose` props (~estimated tests)
