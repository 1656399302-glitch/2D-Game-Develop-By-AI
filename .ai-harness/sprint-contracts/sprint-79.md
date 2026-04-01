# APPROVED — Sprint Contract — Round 79 — REVISED

## Scope

This round focuses on **final polish and regression defense** given the project passed Round 78 with 10/10 across all categories. The goal is to ensure production readiness and address any remaining edge cases before declaring the project complete.

## Spec Traceability

- **P0 items covered this round:** N/A (P0/P1 fully complete per Round 77)
- **P1 items covered this round:** N/A (P1 fully complete per Round 77)
- **Remaining P0/P1 after this round:** None
- **P2 intentionally deferred:** 
  - Additional faction expansions
  - Community gallery backend integration
  - Advanced recipe combinations

---

## Deliverables

1. **Regression test suite** — Add integration tests covering specific untested paths:
   - 1a. `editor → machine activation → export SVG/PNG` full workflow (end-to-end Playwright test)
   - 1b. `random generator → codex save → export poster` full workflow (end-to-end Playwright test)
   - 1c. Regression tests for any existing features not covered by current 2697 tests (identify gaps)
2. **Performance verification** — Automated 60fps animation performance test with 50+ modules during activation sequence. Measured via Playwright performance metrics.
3. **Accessibility audit** — WCAG 2.1 AA compliance on all modals (Export, AI Settings, Codex, Challenge). Requires `src/__tests__/accessibility.test.ts` with passing tests.
4. **Memory leak check** — Confirm no growing memory footprint during extended sessions.
5. **Bundle size final verification** — Ensure build remains under 560KB threshold.

## Acceptance Criteria

1. **AC1:** All 2697+ existing tests continue to pass without modification
2. **AC2:** Build bundle size remains under 560KB threshold
3. **AC3:** TypeScript compilation produces 0 errors
4. **AC4:** No console errors during full workflow (editor → activation → export)
5. **AC5:** Performance verification — App loads with 50+ modules and activates. No frame drops below 30fps for at least 5 seconds during activation sequence. Measured via Playwright performance metrics.
6. **AC6:** Export produces valid SVG/PNG files that open correctly in browsers
7. **AC7:** All modals dismiss properly and restore focus to trigger elements
8. **AC8:** All modal components (Export, AI Settings, Codex, Challenge) pass accessibility verification:
   - Each modal has `role="dialog"` or `role="alertdialog"`
   - Each modal has `aria-modal="true"` and `aria-label` or `aria-labelledby`
   - Focus is trapped within modal while open
   - Focus returns to the triggering element when modal closes
   - All interactive elements within modals are keyboard-accessible (Tab/Shift+Tab cycle)

## Test Methods

1. **AC1:** Run `npx vitest run` and verify all tests pass
2. **AC2:** Run `npm run build` and verify output size
3. **AC3:** Run `npx tsc --noEmit` and verify no errors
4. **AC4:** Open the app in browser, perform editor → activation → export workflow, check console via Playwright automated test
5. **AC5:** Load app with 50+ modules, activate machine, collect FPS samples for 5 seconds via Playwright performance API, verify minimum FPS ≥ 30
6. **AC6:** Export SVG and PNG, open in browser, verify content renders correctly
7. **AC7:** Open each modal type (Export, AI Settings, Codex, Challenge), dismiss, verify focus returns to trigger element via Playwright `page.evaluate()`
8. **AC8:** Run `npx vitest run src/__tests__/accessibility.test.ts` and verify all pass; run Playwright WCAG audit on each modal type (Export, AI Settings, Codex, Challenge) and verify 0 critical WCAG 2.1 AA violations

## Risks

1. **Integration regression** — Adding new tests or fixes could inadvertently break existing functionality
2. **False confidence** — High test count (2697) may mask gaps in coverage
3. **Performance cliff** — Animations may degrade with specific module configurations not covered by tests
4. **Accessibility gaps** — Existing Accessibility components may have incomplete test coverage
5. **Performance test flakiness** — FPS measurement may vary by machine; thresholds set conservatively at 30fps minimum

## Failure Conditions

1. Any existing test fails
2. Bundle size exceeds 560KB
3. TypeScript compilation errors
4. Console errors during full workflow
5. Export files fail to render
6. FPS drops below 30fps during 5-second activation sequence with 50+ modules
7. Any AC8 accessibility test fails
8. Any modal fails WCAG 2.1 AA critical audit

## Done Definition

All acceptance criteria must pass:
- [ ] `npx vitest run` shows 2697+ passing tests (existing) + new integration/regression tests pass
- [ ] `npm run build` output ≤ 560KB
- [ ] `npx tsc --noEmit` shows 0 errors
- [ ] Browser console shows no errors during full workflow
- [ ] Automated FPS test shows ≥ 30fps for 5 seconds with 50+ modules during activation
- [ ] SVG/PNG exports render correctly
- [ ] All modals dismiss and restore focus
- [ ] `npx vitest run src/__tests__/accessibility.test.ts` passes (all AC8 tests green)
- [ ] Playwright WCAG audit passes with 0 critical violations on all modal types

## Out of Scope

- New feature development
- UI redesign or visual changes
- Module type additions
- Backend/infrastructure work
- Performance optimizations beyond verification (unless regression detected)

---

*Contract revised to address R1 (AC8 accessibility criteria), R2 (AC5/Deliverable #2 alignment via Option A), and R3 (Deliverable #1 scope enumeration). Ready for re-review.*

## Approval Notes

- **Reviewer:** Contract Reviewer (automated)
- **Round 78 Result:** 10/10 PASS
- **This Round Type:** Final polish / regression defense
- **Scope Status:** Honest — P0/P1 explicitly complete, P2 deferred
- **Test Coverage:** Specific end-to-end workflows + accessibility audit
- **Operator Inbox:** No active items for this round
