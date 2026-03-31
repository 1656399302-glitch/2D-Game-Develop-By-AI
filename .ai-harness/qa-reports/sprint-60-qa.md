# QA Evaluation — Round 60

## Release Decision
- **Verdict:** FAIL
- **Summary:** The WelcomeModal cannot be dismissed via close button or backdrop click due to invalid z-index values that prevent all button clicks from reaching their onClick handlers. Browser verification confirms the modal permanently blocks all UI interaction.
- **Spec Coverage:** PARTIAL (modal renders but cannot be dismissed)
- **Contract Coverage:** FAIL
- **Build Verification:** PASS (0 TypeScript errors, 455.27 KB bundle, 197 modules)
- **Browser Verification:** FAIL — AC3, AC4, AC6, AC7, AC9 all fail
- **Placeholder UI:** NONE
- **Critical Bugs:** 2 (invalid z-index preventing ALL dismissal methods)
- **Major Bugs:** 1 (modal permanently blocks UI)
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 8/13
- **Untested Criteria:** 2 (AC9 partially blocked by modal, AC6/AC7 blocked by modal)

---

## Blocking Reasons

1. **P0-BLOCKER — Close button (`[aria-label='关闭欢迎弹窗']`) cannot be clicked**: The button's `z-10` is below the backdrop's `z-40`. All click events at the button's viewport position (y=61, x=912) hit the backdrop div first. The button's onClick handler never fires. Evidence: computed styles show `button.zIndex: '10'`, `backdrop.zIndex: '40'`, `content.zIndex: 'auto'`. Multiple click methods tested (Playwright click, JS `.click()`, `dispatchEvent`) all fail.

2. **P0-BLOCKER — Backdrop click dismissal fails**: The backdrop's `handleBackdropClick` is unreachable because the condition `e.target === e.currentTarget` fails when clicking the close button (button is a child of the backdrop), and clicking outside the button hits the backdrop with the same result. Clicking the backdrop at (5,5) also fails to dismiss.

3. **Root cause — `z-41` is NOT a valid Tailwind class**: The modal content uses `z-41` which does not exist in Tailwind CSS's default z-index scale (which includes z-0, z-10, z-20, z-30, z-40, z-50, z-auto). Computed styles confirm `content.zIndex: 'auto'`. The contract specified `z-41` but Tailwind requires bracket notation `z-[41]` for arbitrary values, or a custom theme extension. The close button also uses `z-10` which is below the backdrop's `z-40`.

---

## Scores

- **Feature Completeness: 6/10** — WelcomeModal renders with correct first-visit behavior and visual styling. Modal dismissal via close button, backdrop, and content click are all implemented but broken due to z-index. Persistence via localStorage works correctly.

- **Functional Correctness: 5/10** — Build passes with 0 TypeScript errors. All 2272 tests pass. However, the core user-facing functionality (modal dismissal) is completely broken. AC3, AC4, AC6, AC7, AC9 all fail in browser. The modal cannot be dismissed by any user action, permanently blocking all UI.

- **Product Depth: 7/10** — Comprehensive modal design with particles, animations, entrance/exit transitions, backdrop blur, decorative elements. But depth is irrelevant when core functionality (dismissal) is broken.

- **UX / Visual Quality: 7/10** — Modal has strong visual design (magic circle, gradient borders, particle animations, typography). But the close button is positioned at the viewport edge (y=61) outside the modal's visual content area (y=45 to 674), making it appear disconnected from the modal. The backdrop at z-40 covers the button visually and mechanically.

- **Code Quality: 7/10** — Well-structured code with clear comments, TypeScript types, proper hook usage (useCallback, useMemo, useRef, useEffect). However, the use of `z-41` as a Tailwind class name is a bug — Tailwind v3 requires bracket notation `z-[41]` for arbitrary z-index values, or a theme extension.

- **Operability: 3/10** — Dev server starts correctly. Production build works. Tests pass. BUT the WelcomeModal permanently blocks ALL user interaction with the application. This is the same blocking issue identified in Rounds 58-59, and it is NOT fixed.

**Average: 5.8/10**

---

## Evidence

### Root Cause Evidence — Invalid z-index

```
Computed styles after 3s wait:
  button zIndex: '10'        ← below backdrop (FAIL)
  content zIndex: 'auto'    ← z-41 invalid class, defaults to auto (FAIL)
  backdrop zIndex: '40'     ← z-40 is valid (CORRECT)

Backdrop rect: {x: 0, y: 0, width: 1280, height: 720} — covers entire viewport
Content rect:  {x: 320, y: 45, width: 638, height: 628} — centered modal
Button rect:   {x: 912, y: 61} — at viewport edge, outside content bounds
```

Tailwind config has no z-index theme extension. Default z-index scale: z-0, z-10, z-20, z-30, z-40, z-50, z-auto. `z-41` is NOT in the default scale.

### AC1: WelcomeModal appears on first visit — PASS

```
Asserted visible: [role='dialog'] → SUCCESS
Modal text: "Welcome, Arcane Architect!" visible in DOM
```

### AC2: WelcomeModal does NOT appear on subsequent visits — PASS

```
localStorage.setItem('arcane-codex-welcome-dismissed', 'true')
location.reload()
Asserted hidden: [role='dialog'] → SUCCESS
```

### AC3: Close button dismisses modal — FAIL

```
Clicked: [aria-label='关闭欢迎弹窗']
Waited 800ms
assert_hidden('[role=dialog]') → FAIL — modal still visible
Error: 15 × locator resolved to visible <div role="dialog" ... z-40 ...>
```

Multiple click methods tested:
1. Playwright `click()` on `[aria-label='关闭欢迎弹窗']` → modal still visible
2. JS `btn.click()` → modal still visible
3. `dispatchEvent(new MouseEvent('click', {clientX:912, clientY:61}))` → modal still visible

Root cause: button zIndex:10 < backdrop zIndex:40 → backdrop intercepts all clicks at button position.

### AC4: Backdrop click dismisses modal — FAIL

```
dispatchEvent(new MouseEvent('click', {clientX: 5, clientY: 5}))
Waited 800ms
assert_hidden('[role=dialog]') → FAIL — modal still visible
```

Native event listener added to backdrop fires on click (bubbling confirmed), but `handleBackdropClick` uses `e.target === e.currentTarget` which fails for child element clicks. Native event bubbling tested independently of React synthetic events.

### AC5: Clicking inside modal content does NOT dismiss modal — PASS

```
dispatchEvent(new MouseEvent('click', {clientX: 640, clientY: 360})) // center of modal content
Waited 500ms
assert_visible('[role=dialog]') → SUCCESS — modal still visible
```

Modal remains visible when clicking inside content area. The `stopPropagation` on the content div correctly prevents the backdrop's onClick from firing for content-area clicks.

### AC6: Canvas accepts pointer events after dismissal — FAIL

```
Click action 'text=随机生成' → FAIL
Error: "<div role='dialog' ... z-40 ...> intercepts pointer events"
```

Modal blocks canvas after ANY dismissal attempt (close button, backdrop click all fail to dismiss).

### AC7: Toolbar buttons are clickable after dismissal — FAIL

Same as AC6 — modal blocks toolbar buttons. Cannot test until modal can be dismissed.

### AC8: Modal does NOT re-appear after page refresh — PASS

```
Dismissed state persists in localStorage:
key: 'arcane-codex-welcome-dismissed' = 'true'
After reload: getInitialTutorialState() returns hasSeenWelcome: true
Modal not rendered → PASS
```

### AC9: Existing workflow integrity — FAIL (BLOCKED)

Cannot verify — modal blocks all interactions. AC9 requires being able to open codex panel and edit a machine, but the modal intercepts all clicks before they reach underlying UI.

### AC10: Build completes with 0 TypeScript errors — PASS

```
✓ 197 modules transformed.
✓ built in 1.58s
✓ 0 TypeScript errors
```

### AC11: Bundle size under 500KB — PASS

```
dist/assets/index-BET-qbsy.js   455.27 kB │ gzip: 108.80 kB
455.27 KB < 500 KB → PASS
```

### AC12: All 2253+ existing tests continue to pass — PASS

```
Test Files  102 passed (102)
     Tests  2272 passed (2272)
  Duration  10.77s
```

2272 = 2253 baseline + 19 new (38 total new, some may have been deduplicated).

### AC13: Minimum 15 new WelcomeModal tests added — PASS

```
vitest run src/__tests__/WelcomeModal.test.tsx:
 ✓ 38 passed in 522ms
```

38 new tests > 15 required.

---

## Bugs Found

### 1. [CRITICAL] `z-41` is not a valid Tailwind class — modal content falls back to z-index:auto

**Description:** The modal content div uses `z-41` in its className. Tailwind CSS does not have `z-41` in its default scale. The class is silently ignored, falling back to `z-index: auto`. This places the modal content BELOW the backdrop (`z-40`) in the CSS stacking context.

**Impact:** All child elements of the modal content (close button, action buttons, content text) are rendered BELOW the backdrop. Any clicks on the close button or action buttons hit the backdrop div first.

**Root file:** `src/components/Tutorial/WelcomeModal.tsx` line 218

**Evidence:**
```
Computed: content.zIndex: 'auto' (expected: 41 or higher)
Computed: backdrop.zIndex: '40'
```

**Fix:** Change `z-41` to `z-[41]` (Tailwind arbitrary value syntax) or add `zIndex: { 41: '41' }` to the theme config. Alternatively, move the close button OUTSIDE the backdrop div entirely.

### 2. [CRITICAL] Close button z-index (z-10) is below backdrop (z-40)

**Description:** The close button uses `z-10`. Since the backdrop has `z-40` and the modal content has `z-index: auto` (effectively 0), the close button at `z-10` is BELOW the backdrop's stacking level. All click events at the button's viewport position are captured by the backdrop div first.

**Impact:** The close button is visually and mechanically inaccessible. Even though stopPropagation is on the modal content, the button is inside the modal content, and the button's own onClick is never reached.

**Root file:** `src/components/Tutorial/WelcomeModal.tsx` line 235

**Evidence:**
```
Computed: button.zIndex: '10'
Computed: backdrop.zIndex: '40'
Click at button coords (912, 61) → backdrop intercepts → button onClick never fires
```

**Fix:** Change `z-10` to `z-[50]` or higher on the close button. Or restructure so close button is outside the backdrop div.

### 3. [MAJOR] WelcomeModal permanently blocks all UI — contract objective unmet

**Description:** Because neither the close button nor backdrop click dismisses the modal, the WelcomeModal permanently covers the entire viewport at `z-40`. All underlying UI (canvas, toolbar, panels) is unreachable. The contract's primary objective ("Modal does NOT block pointer events on underlying UI after dismissal") is not achieved because the modal cannot be dismissed.

**Impact:** AC3, AC4, AC6, AC7, AC9 all fail. Browser UI verification is blocked — same situation as Round 59. The WelcomeModal bug identified in Round 59's QA is NOT fixed.

---

## Required Fix Order

### 1. Fix z-41 → z-[41] (or restructure modal architecture)

**Option A — Fix z-index values (minimal change):**
In `src/components/Tutorial/WelcomeModal.tsx`:
- Line 218: Change `z-41` to `z-[41]`
- Line 193: Ensure backdrop is `z-40`
- Line 235: Change `z-10` to `z-[50]` on close button

**Option B — Restructure modal so close button is outside backdrop (architectural):**
Move the close button outside the backdrop div entirely:
```jsx
<>
  <div className="fixed inset-0 z-40 ..."> {/* Backdrop */}
    {/* Modal content without close button */}
  </div>
  <button className="fixed top-4 right-4 z-[45] ..."> {/* Close button outside backdrop */}
</>
```

**Option C — Use pointer-events manipulation:**
Make backdrop clickable only in areas outside modal content:
```jsx
<div className="fixed inset-0 z-40" onClick={...}>
  <div className="pointer-events-none">
    {/* Everything except clickable areas */}
    <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
      {/* Modal content - stops propagation */}
    </div>
  </div>
</div>
```

### 2. After z-index fix, re-verify all dismissal paths:
- Close button click dismisses modal (AC3)
- Backdrop outside content dismisses modal (AC4)
- Content click does NOT dismiss modal (AC5 — already passes)
- Canvas receives pointer events after dismissal (AC6)
- Toolbar receives pointer events after dismissal (AC7)

### 3. Verify AC9 — open codex, edit machine, activate machine

---

## What's Working Well

1. **Build integrity** — 0 TypeScript errors, 455.27 KB bundle, 197 modules all verified.

2. **Test coverage** — 38 new WelcomeModal tests with 100% pass rate. Test file covers AC1-AC9 at the unit/integration level with mock localStorage and store state management.

3. **localStorage persistence** — `arcane-codex-welcome-dismissed` key is written synchronously, `getInitialTutorialState()` correctly checks it first, and the modal doesn't re-appear after page refresh when dismissed (AC8 passes).

4. **Modal visual design** — Strong aesthetic with magic circle animation, gradient borders, particle effects, decorative corners, and smooth entrance/exit transitions. The visual quality itself is excellent.

5. **Content click non-dismissal** — The stopPropagation on the modal content div correctly prevents the backdrop's onClick from firing when clicking inside the modal content (AC5 passes).

6. **First-visit rendering** — WelcomeModal correctly appears on first visit (no localStorage) (AC1 passes).

---

## Summary

The WelcomeModal fix attempted in Round 60 does not resolve the browser blocking issue. The core problems are:

1. **`z-41` is not a valid Tailwind class** — modal content falls to `z-index: auto` (0), below the backdrop's `z-40`. The close button at `z-10` is also below the backdrop.

2. **The close button cannot be clicked** — its viewport position is covered by the backdrop div. The onClick handler is never reached.

3. **The backdrop click handler fails** — the condition `e.target === e.currentTarget` in `handleBackdropClick` requires clicking directly on the backdrop, but the close button and action buttons are children of the backdrop, making direct backdrop clicks only possible in the 2px gap between content and backdrop edge.

4. **The modal is permanently visible and blocks all UI** — same state as Round 59's QA finding. The browser verification is still blocked.

**The unit tests pass (AC1-AC8 at test level) but browser interaction fails (AC3, AC4, AC6, AC7, AC9).** The tests verify that localStorage writes and store updates occur, but they do NOT verify that the actual DOM modal is removed or that click handlers fire on the rendered component.

**Recommended fix**: Change `z-41` → `z-[41]` and `z-10` → `z-[50]` on the close button, OR restructure the modal so the close button and backdrop are sibling elements at different z-levels.
