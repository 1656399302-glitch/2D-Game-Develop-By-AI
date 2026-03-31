APPROVED

# Sprint Contract — Round 61

## Scope

Fix critical z-index bugs in WelcomeModal that prevent modal dismissal and permanently block all UI interaction.

## Spec Traceability

- **P0 items covered this round:**
  - WelcomeModal dismissal functionality (AC3, AC4 from R60 QA)

- **P1 items covered this round:**
  - None — focus is remediation only

- **Remaining P0/P1 after this round:**
  - All P0/P1 items from previous rounds remain, with WelcomeModal dismissal unblocked

- **P2 intentionally deferred:**
  - All P2 features from spec.md

---

## Deliverables

1. **Fixed `src/components/Tutorial/WelcomeModal.tsx`:**
   - Change `z-41` → `z-[41]` on modal container div (Tailwind arbitrary value syntax)
   - Change `z-10` → `z-[50]` on close button (must exceed backdrop's `z-40`)

---

## Acceptance Criteria

1. **AC1:** Close button (`[aria-label='关闭欢迎弹窗']`) is clickable and dismisses the modal
2. **AC2:** Clicking the backdrop (outside modal content) dismisses the modal
3. **AC3:** After dismissal, canvas receives pointer events and is interactive
4. **AC4:** After dismissal, toolbar buttons are clickable
5. **AC5:** Existing machine editing workflow (open codex, edit, activate) works after dismissal
6. **AC6:** Build completes with 0 TypeScript errors
7. **AC7:** All existing tests continue to pass (2272+ tests)

---

## Test Methods

1. **Browser click test on close button:**
   - Open app fresh (clear localStorage)
   - Wait for WelcomeModal to appear
   - Click `[aria-label='关闭欢迎弹窗']`
   - Verify modal disappears within 800ms
   - Verify canvas becomes interactive (click '随机生成' button)

2. **Browser click test on backdrop:**
   - Open app fresh
   - Click at viewport coordinates outside modal content (e.g., x=5, y=5)
   - Verify modal disappears within 800ms

3. **Content click does NOT dismiss:**
   - Click inside modal content area
   - Verify modal remains visible

4. **Post-dismissal workflow test:**
   - Dismiss modal via close button
   - Open codex panel
   - Select/edit a machine
   - Click activation button
   - Verify machine activates with animations

5. **Build verification:**
   - `npm run build` completes with 0 TypeScript errors
   - Bundle size < 500KB

6. **Regression test:**
   - `npm test` runs all 2272+ tests with 100% pass rate

---

## Risks

1. **Low risk:** The fix is a simple className change (`z-41` → `z-[41]`, `z-10` → `z-[50]`)
2. **Low risk:** No logic changes, only CSS stacking context fixes
3. **Mitigation:** Write unit tests to verify z-index values are correct

---

## Failure Conditions

1. Close button remains unclickable after fix
2. Backdrop click dismissal fails after fix
3. Modal blocks underlying UI after dismissal attempt
4. Build fails with TypeScript errors
5. Existing tests fail

---

## Done Definition

The round is complete when ALL of the following are true:

1. `z-41` has been changed to `z-[41]` in WelcomeModal.tsx
2. `z-10` has been changed to `z-[50]` on the close button in WelcomeModal.tsx
3. WelcomeModal close button is clickable and dismisses the modal
4. Clicking the backdrop (outside modal content) dismisses the modal
5. Clicking inside modal content does NOT dismiss the modal
6. Canvas is interactive after modal dismissal
7. Toolbar buttons are clickable after modal dismissal
8. Existing machine workflow (codex → edit → activate) works after dismissal
9. Build completes with 0 TypeScript errors
10. All 2272+ existing tests pass

---

## Out of Scope

1. Any new features or functionality beyond z-index fix
2. WelcomeModal visual design changes
3. WelcomeModal animation changes
4. Any changes to other components
5. Any changes to spec.md requirements
6. Unit test additions for WelcomeModal (existing tests sufficient)
