APPROVED

# Sprint Contract — Round 82

## Scope

**Remediation Sprint:** Fix integration failures from Round 81. All Phase 2 components (D1-D10) exist and pass unit tests; the only remaining work is wiring D5, D6, and D8 into the main App.tsx and verifying browser functionality.

## Spec Traceability

### P0 Items (Must Complete — Blocked from R81 per feedback)
- **D5 Integration:** `QuickActionsToolbar` must be imported and rendered in `App.tsx`. All toolbar actions (Undo, Redo, Zoom Fit, Clear Canvas, Duplicate) must be accessible via UI clicks in browser.
- **D6 Integration:** `KeyboardShortcutsPanel` must be imported, rendered in `App.tsx`, and connected to the `?` key toggle via `useKeyboardShortcutsPanel` hook.
- **D8 Integration:** `useCanvasPerformance` hook must be imported and called in the Canvas component or store.
- **AC6 Verification:** Keyboard shortcuts panel must open when pressing `?` key and close when pressing `?` again or clicking outside in browser.

### P1 Items (Covered by Integration)
- **AC6 Browser Test:** Must pass browser-based verification that `?` key toggles the shortcuts panel open/closed

### Remaining P0/P1 from Prior Rounds
- None — All P0/P1 items from R81 exist and pass unit tests. Integration is the ONLY blocker.

### P2 Intentionally Deferred
- Any new features beyond integration fixes
- AI text generation for naming/descriptions
- Community features, challenges, or extended systems

## Deliverables

| ID | File | Description | Integration Target |
|----|------|-------------|---------------------|
| D5-R | `src/components/QuickActionsToolbar.tsx` | Already exists (passes 14 tests), needs App integration | `src/App.tsx` JSX render |
| D6-R | `src/components/KeyboardShortcutsPanel.tsx` | Already exists (passes 7 tests), needs App integration | `src/App.tsx` JSX render |
| D6-H | `useKeyboardShortcutsPanel` hook | Already exists, wire to `?` key toggle | `src/App.tsx` hook setup |
| D8-R | `src/hooks/useCanvasPerformance.ts` | Already exists, wire to Canvas/store | `src/Canvas.tsx` or store |
| AC6-T | Browser test for `?` key | Verify panel opens/closes | Dev server verification |

## Acceptance Criteria

| AC | Criterion | Verification Method |
|----|-----------|---------------------|
| AC6 | Pressing `?` key opens Keyboard Shortcuts Panel; pressing `?` again OR clicking outside closes it | Browser test with dev tools/headless |
| AC-D5 | QuickActionsToolbar renders in App UI with all 5 buttons visible | Browser visual inspection |
| AC-D5b | Clicking Undo, Redo, Zoom Fit, Clear Canvas, Duplicate produces no console errors | Browser console check |
| AC-D8 | `useCanvasPerformance` is imported and called in at least one canvas/store file | Grep source code |
| AC-Build | `npm run build` succeeds with 0 TypeScript errors and bundle ≤ 560KB | Build output |
| AC-Tests | All 2918 existing tests continue to pass | `npx vitest run` |
| AC-Regression | R81 features (FactionBadge in CodexView, complexity tiers, machine presets, TutorialOverlay, achievementStore) remain functional | Smoke test |

## Test Methods

### AC6: Keyboard Shortcuts Panel Toggle (PRIMARY FAILURE CONDITION)
```
Prerequisites: npm run dev (dev server running on port 5173)
Steps:
1. Open http://localhost:5173 in browser
2. Press `?` key
3. Wait 500ms
4. Inspect DOM: document.querySelector('[data-testid="shortcuts-panel"]') OR .keyboard-shortcuts-panel OR similar selector
5. ASSERT: Panel element is visible in viewport
6. Press `?` key again
7. Wait 500ms
8. ASSERT: Panel element is hidden or not in DOM
9. Press `?` to reopen
10. Click outside panel region (e.g., click canvas)
11. Wait 300ms
12. ASSERT: Panel is hidden
```

### AC-D5: QuickActionsToolbar Rendering
```
Prerequisites: http://localhost:5173 loaded
Steps:
1. Locate QuickActionsToolbar in UI (typically bottom-right or toolbar region)
2. ASSERT: Toolbar container is visible
3. ASSERT: 5 buttons exist: Undo, Redo, Zoom Fit, Clear Canvas, Duplicate
4. Click Undo button → ASSERT: No console errors
5. Click Redo button → ASSERT: No console errors
6. Click Zoom Fit button → ASSERT: No console errors
7. Click Clear Canvas button → ASSERT: No console errors
8. Click Duplicate button → ASSERT: No console errors
```

### AC-D8: useCanvasPerformance Integration
```
Command: grep -rn "useCanvasPerformance" src/
Expected Output: At least one import line in Canvas.tsx, App.tsx, or store files
```

### AC-Build: Build Verification
```
Command: npm run build
Exit Code: 0
TypeScript Errors: 0
Bundle Size: < 560KB
```

### AC-Tests: Regression Test
```
Command: npx vitest run
Expected: 2918 tests pass, 0 failures
```

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Integration Side Effects** | Adding components to App.tsx may break existing layout/styling | Test in browser; verify no layout breakage in CodexView, TutorialOverlay |
| **Hook Wiring Complexity** | `useKeyboardShortcutsPanel` may require specific state setup in App | Read hook implementation before integration; follow existing patterns |
| **Styling Conflicts** | QuickActionsToolbar CSS may conflict with App styles | Inspect component styles; add CSS scoping or class overrides if needed |
| **Bundle Bloat** | Adding imports may increase bundle beyond 560KB | Monitor build output; prune unused imports if needed |

## Failure Conditions

The round FAILS if ANY of these are true:

1. **AC6 Browser Test Fails** — Pressing `?` does NOT open the keyboard shortcuts panel in browser
2. **QuickActionsToolbar Not Visible** — Toolbar is not rendered in App UI after integration
3. **Toolbar Buttons Non-Functional** — Clicking Undo/Redo/Zoom Fit/Clear Canvas/Duplicate produces console errors
4. **useCanvasPerformance Not Integrated** — Hook is not imported in any canvas/store file
5. **Build Fails** — `npm run build` exits with non-zero code OR has TypeScript errors
6. **Bundle Overflow** — Bundle size exceeds 560KB
7. **Test Regression** — Any of the 2918 existing tests fail after integration changes
8. **R81 Features Broken** — FactionBadge, complexity tiers, machine presets, TutorialOverlay, or achievementStore stop working

## Done Definition

All conditions must be TRUE before claiming round complete:

### Code Integration Checks
- [ ] `grep -c "QuickActionsToolbar" src/App.tsx` returns ≥ 1
- [ ] `grep -c "KeyboardShortcutsPanel" src/App.tsx` returns ≥ 1
- [ ] `grep -c "useKeyboardShortcutsPanel" src/App.tsx` returns ≥ 1
- [ ] `grep -rn "useCanvasPerformance" src/` returns ≥ 1 import line in Canvas.tsx, App.tsx, or store

### Browser Verification Checks
- [ ] Open http://localhost:5173 → QuickActionsToolbar visible with all 5 buttons
- [ ] Press `?` → Keyboard Shortcuts Panel opens (visible in DOM)
- [ ] Press `?` again → Panel closes
- [ ] Click outside panel → Panel closes
- [ ] Click Undo button → No console errors
- [ ] Click Redo button → No console errors
- [ ] Click Zoom Fit button → No console errors
- [ ] Click Clear Canvas button → No console errors
- [ ] Click Duplicate button → No console errors

### Build & Test Checks
- [ ] `npm run build` → exit code 0, 0 TypeScript errors, bundle ≤ 560KB
- [ ] `npx vitest run` → 2918 tests pass, 0 failures

### Regression Smoke Test
- [ ] CodexView shows FactionBadge for machines
- [ ] Complexity tiers display correctly in CodexView
- [ ] Machine presets load without errors
- [ ] TutorialOverlay renders when triggered
- [ ] achievementStore persists state correctly

## Out of Scope

The following are explicitly NOT done this round:

- **Writing new components** — D1-D10 already exist (verified in R81)
- **Creating new unit tests** — All 105 Phase 2 tests pass; no new tests needed
- **Modifying existing component logic** — Only integration wiring is changed
- **UI redesign or visual polish** — Components use existing styles
- **Adding animation systems** — Beyond what components already provide
- **Export system changes** — Not touched
- **Animation/activation system** — Not this round's scope
- **AI text generation** — Deferred to future rounds
- **Community/sharing features** — Deferred
- **Challenge mode or extended gameplay** — Deferred

---

**Priority Contract:** This round does ONLY integration and verification of existing Phase 2 deliverables. No new functionality may be introduced. The success metric is browser-verifiable: `?` key toggles the shortcuts panel, and QuickActionsToolbar is visible and functional.
