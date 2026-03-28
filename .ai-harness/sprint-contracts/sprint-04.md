# Sprint Contract — Round 5

## Scope

**This is a remediation-only sprint.** The Toolbar.tsx component with test buttons exists and was verified correct in Round 4 QA. However, App.tsx never imports or renders it, making the buttons inaccessible to users. This round fixes that single integration gap.

No new features. No UI redesign. No changes to existing working code.

## Spec Traceability

### P0 Items (Must Complete This Round)
- Import `Toolbar` component in `App.tsx`
- Render `<Toolbar />` in the editor layout
- Verify test buttons are visible and functional in browser

### P1 Items (Must Not Regress)
- All 99 existing unit tests continue to pass
- Production build continues to succeed with 0 errors
- Activation mode logic remains unchanged (already correct per Round 4)
- Store actions `activateFailureMode()` and `activateOverloadMode()` work as before

### P2 Items (Intentionally Deferred)
- None — this round is exclusively remediation

## Deliverables

1. **Modified `src/App.tsx`**
   - Add import: `import { Toolbar } from './components/Editor/Toolbar';`
   - Add `<Toolbar />` component rendered in the editor layout (between header and main content area)

2. **Working UI in Browser**
   - "⚠ 测试故障" button visible in rendered page
   - "⚡ 测试过载" button visible in rendered page
   - Both buttons functional — clicking triggers respective activation modes

## Acceptance Criteria

1. **Toolbar Button 1 Visible:** Browser query `document.body.innerText.includes('测试故障')` returns `true`
2. **Toolbar Button 2 Visible:** Browser query `document.body.innerText.includes('测试过载')` returns `true`
3. **Failure Mode Triggerable:** Clicking "测试故障" button triggers failure animation overlay
4. **Overload Mode Triggerable:** Clicking "测试过载" button triggers overload animation overlay
5. **Failure Mode Chinese Text:** Failure overlay displays "⚠ 机器故障"
6. **Overload Mode Chinese Text:** Overload overlay displays "⚡ 系统过载"
7. **Auto-Recovery Works:** After test mode animation completes (~3500ms), machine returns to `idle` state
8. **No Test Regression:** `npm test` passes with 99 tests (0 failures)
9. **Build Clean:** `npm run build` produces 0 errors

## Test Methods

1. **DOM Verification:** Run in browser console: `document.body.innerText.includes('测试故障')` → expect `true`
2. **DOM Verification:** Run in browser console: `document.body.innerText.includes('测试过载')` → expect `true`
3. **Button Click Test:** Click "测试故障" button → verify ActivationOverlay appears with failure styling
4. **Button Click Test:** Click "测试过载" button → verify ActivationOverlay appears with overload styling
5. **Text Inspection:** Verify failure overlay contains "⚠ 机器故障"
6. **Text Inspection:** Verify overload overlay contains "⚡ 系统过载"
7. **State Recovery:** Wait 3.5 seconds after triggering test mode → verify machine state returns to `idle`
8. **Unit Test Suite:** Run `npm test` → expect 99 tests passing, 0 failures
9. **Production Build:** Run `npm run build` → expect 0 errors

## Risks

1. **Minimal — Single Integration Fix:** This is one import statement and one component render location. Toolbar.tsx code was already verified correct in Round 4 QA.
2. **CSS Collision:** Toolbar uses existing color scheme (`#7f1d1d` for failure, `#78350f` for overload) with existing Tailwind classes. Consistent with application design.
3. **No Risk to Existing Code:** No changes to ActivationOverlay, store, or any other component. Only App.tsx modified.

## Failure Conditions

This round **MUST FAIL** if any of the following are true:

1. Test buttons are not visible in browser after integration (criteria 1-2 fail)
2. Clicking test buttons does not trigger respective activation modes (criteria 3-4 fail)
3. Any unit test fails (regression on criterion 8)
4. Build produces errors (criterion 9 fails)

## Done Definition

The round is complete when **ALL** of the following are true:

1. ✅ `App.tsx` contains: `import { Toolbar } from './components/Editor/Toolbar';`
2. ✅ `App.tsx` renders `<Toolbar />` within the editor layout
3. ✅ Browser DOM contains "测试故障" text
4. ✅ Browser DOM contains "测试过载" text
5. ✅ Clicking "测试故障" triggers failure overlay with Chinese text
6. ✅ Clicking "测试过载" triggers overload overlay with Chinese text
7. ✅ Machine auto-returns to idle after ~3.5 seconds
8. ✅ `npm test` shows 99 passing tests, 0 failures
9. ✅ `npm run build` completes with 0 errors

## Out of Scope

- No new features
- No UI redesign or visual changes beyond integrating existing Toolbar
- No changes to `ActivationOverlay.tsx` (already correct per Round 4)
- No changes to store actions (already correct per Round 4)
- No changes to `randomGenerator.ts` (already correct per Round 4)
- No changes to any module components (Canvas, ModulePanel, PropertiesPanel, CodexView, ExportModal)
- No additional unit tests needed (Toolbar rendering is browser-verifiable)

---

## Context: Why This Contract Exists

**Round 4 Outcome:** FAIL

Round 4 QA confirmed that `Toolbar.tsx` exists with correct code but is **never imported or rendered in `App.tsx`**. Browser inspection proved test buttons were invisible to users. The contract deliverables were incomplete despite passing build and unit tests.

**Root Cause:** Integration oversight — component was built but not wired into the application.

**This Round's Purpose:** Fix the single missing import and render statement in App.tsx to make existing working code visible to users.

**Evidence from Round 4 QA:**
- `grep -r "Toolbar" src` found Toolbar never imported anywhere
- Browser button list: `['Editor', 'Codex', '▶ Activate Machine', ...]` — no test buttons
- Unit tests passed (99/99) but tested code paths that users could never reach
