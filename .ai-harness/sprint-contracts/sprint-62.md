# Sprint Contract — Round 62

## APPROVED

## Scope

Remediation sprint: Fix the critical P0 blocker in the WelcomeModal that makes the close button permanently unclickable. The root cause is two-fold: (1) SVG `<line>` elements from the magic circle decoration intercept pointer events at the close button's viewport position, and (2) the close button is nested inside the backdrop div whose `backdrop-blur-sm` creates a stacking context that contains the button even at higher z-index values.

## Spec Traceability

- **P0 items covered this round:**
  - WelcomeModal dismissal: All dismissal paths must be fully functional in browser testing. This includes close button click, backdrop click, skip tutorial button, and start tutorial button.

- **P0 items remaining after this round:**
  - None — the WelcomeModal P0 blocker is the only P0 outstanding.

- **P1 items covered this round:**
  - (None — remediation is P0-only; P1 bugs are tracked below.)

- **P1 items remaining after this round:**
  - Confirmed P1 from Round 61 (unresolved prior to this round):
    - Backdrop click handler: The backdrop click-to-dismiss requires `e.target === e.currentTarget` on the backdrop div. This handler must remain intact after structural changes.
    - Tutorial flow state: The "跳过教程" (skip) and "开始教程" (start) buttons must continue to dismiss the modal and interact correctly with the tutorial store, per existing implementation.
  - All other prior P1/P2 items remain unchanged.

- **P2 intentionally deferred:**
  - All deferred P2 items from prior rounds remain deferred.

## Deliverables

1. **Fixed `src/components/Tutorial/WelcomeModal.tsx`** with corrected JSX structure addressing both root causes:

   **Root Cause 1 Fix — Move close button outside backdrop stacking context:**
   - The close button must be restructured to be a **viewport-level sibling** of the backdrop div, NOT a child of any inner container.
   - The backdrop div should contain ONLY the dark overlay (no modal content or close button).
   - The modal content container must be a separate sibling element positioned above the backdrop.

   **Root Cause 2 Fix — Disable SVG pointer event interception:**
   - ALL SVG elements within the magic circle decoration (including `<line>`, `<circle>`, `<path>`, and the parent `<svg>` element) must receive `pointer-events="none"` to prevent line/circle/element interception.

   **Correct component hierarchy:**
   ```
   <>
     <div className="fixed inset-0 z-40 ...">  {/* Backdrop ONLY */}
     </div>
     <button className="fixed top-4 right-4 z-[60] ...">  {/* Close button OUTSIDE */}
     </button>
     <div className="relative w-full max-w-2xl mx-4 z-[45] ...">  {/* Content container */}
       {/* Modal content WITHOUT close button */}
     </div>
   </>
   ```

   **Correct stacking:**
   - Backdrop: `z-40`
   - Modal content: `z-[45]`
   - Close button: `z-[60]`

   **Preserved behavior (must not break):**
   - Backdrop div retains its `e.target === e.currentTarget` dismiss handler.
   - Tutorial store interactions (skip/start buttons) continue to work identically.
   - Exit animation (opacity/scale transition via `isVisible` state) still applies to modal content.

## Acceptance Criteria

1. **AC1 — Close button click dismisses modal:** Clicking `[aria-label='关闭欢迎弹窗']` removes the modal from the viewport and sets localStorage `arcane-codex-welcome-dismissed` to `'true'`.
2. **AC2 — Backdrop click dismisses modal:** Clicking the dark backdrop area outside the modal card removes the modal.
3. **AC3 — Content click does NOT dismiss:** Clicking inside the modal card (not on buttons) does not dismiss the modal.
4. **AC4 — Canvas becomes interactive after dismissal:** After dismissing the modal, the machine editor canvas, toolbar buttons, and all other UI elements are fully clickable.
5. **AC5 — Modal does not re-appear after dismissal:** Refreshing the page does not re-show the WelcomeModal.
6. **AC6 — Skip button dismisses modal:** Clicking "跳过教程" (skip tutorial) removes the modal.
7. **AC7 — Start tutorial button dismisses modal:** Clicking "开始教程" removes the modal and triggers tutorial flow.

## Test Methods

1. **AC1, AC6, AC7 — Button clicks:** Clear localStorage → open app → wait for modal → use Playwright `locator.click()` on each button → assert `[role=dialog]` is not visible after 1000ms → verify localStorage key set to `'true'`.
2. **AC2 — Backdrop click:** Clear localStorage → open app → wait for modal → click viewport edge at (5, 5) via `page.mouse.click(5, 5)` → assert `[role=dialog]` is not visible.
3. **AC3 — Content click not dismiss:** Clear localStorage → open app → wait for modal → click modal title text via `getByText('Welcome, Arcane Architect!')` → assert `[role=dialog]` remains visible.
4. **AC4 — Post-dismissal interactivity:** Dismiss modal → click canvas background → click toolbar buttons (save, random, export) → assert no elements block clicks and no errors appear.
5. **AC5 — Persistence:** Dismiss modal → refresh page → assert `[role=dialog]` is not visible.

## Risks

1. **Structural change risk:** Moving the close button out of the backdrop div changes the component's DOM hierarchy. This must be verified carefully to ensure:
   - (a) The backdrop click handler (`e.target === e.currentTarget` on the backdrop div) still fires correctly, since clicking the backdrop area still needs to dismiss the modal.
   - (b) The backdrop must remain the full-viewport overlay.
   - (c) The modal content layout (centering, max-width) is preserved with the close button and content both rendering above the backdrop.
2. **Stacking context risk:** The new z-index values (`z-[45]` for content, `z-[60]` for button) must be verified against all other fixed/sticky elements in the application to ensure the close button does not accidentally overlap or be hidden by unrelated components, and the modal content is not obscured.
3. **Animation continuity risk:** The exit animation (opacity/scale transition triggered by `isVisible` state) must still apply to the modal content after restructuring. The animated element must be identified and preserved.
4. **Tutorial store interaction risk:** The skip and start tutorial buttons use the tutorial store (likely Zustand). These handlers must be verified to remain wired correctly after any JSX restructure, especially if event handlers are passed through props or attached to the wrong element.
5. **SVG pointer-events regression risk:** The `pointer-events="none"` attribute must be applied to ALL SVG elements in the magic circle decoration, including nested `<line>`, `<circle>`, `<path>`, and `<g>` elements. An incomplete fix (e.g., only adding to the parent SVG but not child elements) will not resolve the interception issue.

## Failure Conditions

The round fails if:
1. **AC1 returns a FAIL result** in browser verification (close button click does not dismiss the modal).
2. The browser console shows JavaScript errors introduced by this change.
3. The build fails with TypeScript errors.
4. The modal's visual layout (centering, border, decorations) is visually broken.
5. AC6 or AC7 fails (skip/start buttons no longer trigger dismissal or tutorial flow).
6. `elementFromPoint()` at the close button's viewport center returns an SVG element instead of the button.

## Done Definition

All seven acceptance criteria must pass in browser-based Playwright testing with zero console errors. Specifically:
- `elementFromPoint()` at the close button's viewport center must return the button element or its child elements, NOT an SVG `<line>`, `<circle>`, `<path>`, or any other intercepted element.
- `document.querySelector('[role=dialog]')` must return `null` after any dismissal action.
- All buttons and canvas areas must receive pointer events after modal dismissal.
- The modal's backdrop, content, and close button must be positioned at z-40, z-[45], and z-[60] respectively.

## Out of Scope

- Changes to the tutorial content, step flow, or any tutorial logic beyond what is required for structural correctness.
- Changes to any store, state management, or data persistence logic beyond the localStorage key that already exists.
- Changes to any other component besides `WelcomeModal.tsx`.
- Changes to the visual design, colors, animations, or copy of the modal (beyond what is required for structural correctness).
- Removal of the SVG decorations themselves (the circles/lines remain visible; only `pointerEvents` attribute added to prevent interception).
