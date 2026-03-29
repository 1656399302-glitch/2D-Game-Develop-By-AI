# Sprint Contract — Round 5

## Scope

**This is a remediation-only sprint.** Round 4 completed the Toolbar component with test buttons (`⚠ 测试故障` and `⚡ 测试过载`) and verified activation modes work correctly. However, the Toolbar was never integrated into `App.tsx`, making the buttons inaccessible. This round fixes that single integration gap.

No new features. No UI redesign. No changes to existing working code.

## Spec Traceability

### P0 Items Covered This Round
1. **Integrate Toolbar into App.tsx** — Add import and render `<Toolbar />` component
2. **Verify test buttons visible** — Browser verification of button text presence
3. **Verify test buttons functional** — Clicking triggers respective activation modes

### P1 Items Covered This Round
1. **No test regression** — All 99 existing unit tests continue to pass
2. **Build succeeds** — Production build continues with 0 TypeScript errors

### Remaining P0/P1 After This Round
- None. All P0/P1 items from spec are implemented and functional.

### P2 Intentionally Deferred
- PNG poster format export
- AI naming/description integration
- Community/sharing features
- Additional module types

---

## Deliverables

### 1. Modified `src/App.tsx`
- **Action:** Add import: `import { Toolbar } from './components/Editor/Toolbar';`
- **Action:** Add `<Toolbar />` component rendered in the editor layout (between header and main content area)
- **Expected result:** Toolbar with test buttons renders in browser

### 2. Working UI in Browser
- **Expected result:** "⚠ 测试故障" button visible in rendered page
- **Expected result:** "⚡ 测试过载" button visible in rendered page
- **Expected result:** Both buttons functional — clicking triggers respective activation modes

### 3. All tests pass
- **Action:** Run `npm test` to verify 99 tests still pass
- **Expected result:** 0 failures

### 4. Build succeeds
- **Action:** Run `npm run build` to verify TypeScript compilation
- **Expected result:** Exit code 0 with 0 TypeScript errors

---

## Acceptance Criteria

1. **Toolbar Button 1 Visible:** Browser query `document.body.innerText.includes('测试故障')` returns `true`
2. **Toolbar Button 2 Visible:** Browser query `document.body.innerText.includes('测试过载')` returns `true`
3. **Failure Mode Triggerable:** Clicking "测试故障" button triggers failure animation overlay
4. **Overload Mode Triggerable:** Clicking "⚡ 测试过载" button triggers overload animation overlay
5. **Failure Mode Chinese Text:** Failure overlay displays "⚠ 机器故障"
6. **Overload Mode Chinese Text:** Overload overlay displays "⚡ 系统过载"
7. **Auto-Recovery Works:** After test mode animation completes (~3500ms), machine returns to `idle` state
8. **No Test Regression:** `npm test` passes with 99 tests (0 failures)
9. **Build Clean:** `npm run build` produces 0 TypeScript errors

---

## Test Methods

### Step 1: Verify App.tsx Integration
Read `src/App.tsx`:
1. Verify import line: `import { Toolbar } from './components/Editor/Toolbar';`
2. Verify render location: `<Toolbar />` exists within editor layout JSX

### Step 2: DOM Verification
```bash
npm run dev
```
Then in browser console:
```javascript
document.body.innerText.includes('测试故障')  // expect: true
document.body.innerText.includes('测试过载')  // expect: true
```

### Step 3: Button Click Tests
1. Click "⚠ 测试故障" button → verify failure overlay appears with "⚠ 机器故障" text
2. Click "⚡ 测试过载" button → verify overload overlay appears with "⚡ 系统过载" text
3. Wait 3.5 seconds → verify machine state returns to `idle`

### Step 4: Unit Test Suite
```bash
npm test
```
Expected: 99 tests pass, 0 failures

### Step 5: Production Build
```bash
npm run build
```
Expected: 0 TypeScript errors

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CSS collision with Toolbar | Very Low | Low | Toolbar uses existing Tailwind classes consistent with app design |
| Breaking existing tests | Very Low | High | Single file change, run test suite to verify |
| Build errors | Very Low | High | Single import addition, no complex changes |

---

## Failure Conditions

This round **MUST FAIL** if ANY of the following occur:

1. Test buttons are not visible in browser (criteria 1-2 fail)
2. Clicking test buttons does not trigger respective activation modes (criteria 3-4 fail)
3. Any unit test fails (regression on criterion 8)
4. Build produces TypeScript errors (criterion 9 fails)

---

## Done Definition

The round is complete ONLY when ALL of the following are true:

1. ☐ `App.tsx` contains: `import { Toolbar } from './components/Editor/Toolbar';`
2. ☐ `App.tsx` renders `<Toolbar />` within the editor layout JSX
3. ☐ Browser DOM contains "测试故障" text
4. ☐ Browser DOM contains "测试过载" text
5. ☐ Clicking "测试故障" triggers failure overlay with "⚠ 机器故障" text
6. ☐ Clicking "⚡ 测试过载" triggers overload overlay with "⚡ 系统过载" text
7. ☐ Machine auto-returns to idle after ~3.5 seconds
8. ☐ `npm test` shows 99 passing tests, 0 failures
9. ☐ `npm run build` completes with 0 TypeScript errors
10. ☐ Only `src/App.tsx` modified (no other files changed)

---

## Out of Scope

The following are explicitly NOT being done in this round:

- ❌ Any new module types
- ❌ Any new features beyond Toolbar integration
- ❌ Visual redesign or theme changes
- ❌ Changes to ActivationOverlay.tsx (already correct per Round 4)
- ❌ Changes to store actions (already correct per Round 4)
- ❌ Changes to Toolbar.tsx (already correct per Round 4)
- ❌ Changes to randomGenerator.ts (already correct per Round 4)
- ❌ Changes to any module components (Canvas, ModulePanel, PropertiesPanel, CodexView, ExportModal)
- ❌ Performance optimizations
- ❌ Documentation updates

---

## Summary

Round 4 built the Toolbar component with test buttons for failure and overload modes. QA verified these work correctly. This round simply integrates the Toolbar into App.tsx so users can access these buttons in the browser.

The project is at 9.3/10 with all P0/P1 features implemented and functional. This round restores accessibility to the test functionality that already exists but was unreachable.

---

## Review Notes

- **Previous:** Round 3 (QA: 9.3/10) — Welcome modal persistence and module spacing fixed
- **Previous:** Round 4 (QA: 9/9 verified, 99 tests pass) — Toolbar.tsx built but not integrated
- **Current:** Round 5 — Integrate Toolbar into App.tsx
