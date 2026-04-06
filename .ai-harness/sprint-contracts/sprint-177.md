# Sprint Contract — Round 177

## Scope

Integrate the existing `CircuitChallengePanel` component into App.tsx so it renders when the toolbar button is clicked. This is a remediation sprint to complete Round 176's work. The toolbar button and store logic are confirmed working; the missing piece is mounting the panel in the component tree.

## Spec Traceability

- **P0 items covered this round:**
  - AC-177-003: CircuitChallengePanel renders when toolbar button clicked
  - AC-177-004: Challenge selection in panel shows details (requires AC-177-003)
  - AC-176-003 remediation: Panel mount/unmount based on `isPanelOpen` state
  - AC-176-004 remediation: Full challenge flow (list → select → view details)

- **P1 items covered this round:**
  - None (remediation focus)

- **Remaining P0/P1 after this round:**
  - None (circuit challenge system fully implemented: challenges (R175), toolbar button (R176), panel integration (R177))

- **P2 intentionally deferred:**
  - Community features, faction trade system (not touched)

## Deliverables

1. **App.tsx modification:**
   - Import `CircuitChallengePanel` from `./components/Circuit/CircuitChallengePanel`
   - Add conditional render: `{isPanelOpen && <CircuitChallengePanel />}`
   - Use store selector for `isPanelOpen` state from `useCircuitChallengeStore`

2. **Code verification:**
   - TypeScript compiles without errors
   - Bundle size remains ≤512 KB

## Acceptance Criteria

1. **AC-177-001:** `CircuitChallengePanel` is imported in App.tsx
2. **AC-177-002:** Panel does NOT render before toolbar button is clicked (store starts with `isPanelOpen: false`)
3. **AC-177-003:** Panel renders when `isPanelOpen` from `useCircuitChallengeStore` becomes `true`
4. **AC-177-004:** Clicking "🎯 挑战" toolbar button opens the panel
5. **AC-177-005:** Challenge selection in panel shows challenge details
6. **AC-177-006:** Panel dismisses when store `isPanelOpen` becomes `false` (e.g., close button or overlay click)
7. **AC-177-007:** No regressions — existing 7255 tests pass, bundle ≤512 KB

## Test Methods

### AC-177-001: Import Verification
1. Run: `grep -n "CircuitChallengePanel" src/App.tsx`
2. **Assert:** Import line found with valid path `./components/Circuit/CircuitChallengePanel`
3. **Assert:** Component referenced in JSX return statement (e.g., `<CircuitChallengePanel`)

### AC-177-002: Panel Does NOT Render Initially
1. Start dev server: `npm run dev`
2. Open browser to http://localhost:5173
3. Click "电路模式" to enable circuit mode
4. Wait 500ms for circuit mode to activate
5. **Assert:** `document.querySelector('[data-testid="circuit-challenge-panel"]') === null`
6. **Assert:** No panel element with class `fixed inset-y-0 right-0 w-96` exists
7. **Assert:** No element with text "难度筛选" (difficulty filter) visible

### AC-177-003: Panel Renders When isPanelOpen Is True
1. Continue from AC-177-002 test state (circuit mode enabled, panel closed)
2. **Inject store state:** Open browser console, execute `window.__ZUSTAND_STORE__?.getState?.().circuitChallenge?.setIsPanelOpen?.(true)` OR click toolbar button as in AC-177-004
3. Wait 500ms
4. **Assert:** `document.querySelector('[data-testid="circuit-challenge-panel"]') !== null`
5. **Assert:** `document.querySelector('[class*="fixed inset-y-0 right-0 w-96"]') !== null`
6. **Assert:** Panel contains "难度筛选" or challenge list items

### AC-177-004: Button Opens Panel
1. Start fresh browser session at http://localhost:5173
2. Click "电路模式" to enable circuit mode
3. Wait 500ms
4. **Assert:** Button `[data-testid='circuit-challenges-button']` is visible
5. Click `[data-testid='circuit-challenges-button']`
6. Wait 500ms
7. **Assert:** `document.querySelector('[data-testid="circuit-challenge-panel"]') !== null` (panel now in DOM)
8. **Assert:** Panel contains challenge list items (`[data-testid^='challenge-item-']`)
9. **Negative:** `setTimeout(() => { /* no action */ }, 2000)` — panel should not auto-appear without button click

### AC-177-005: Challenge Selection Shows Details
1. Continue from AC-177-004 (panel open)
2. **Assert:** Challenge list is visible (elements with `[data-testid^='challenge-item-']`)
3. Click first available challenge item `[data-testid^='challenge-item-']`
4. Wait 300ms
5. **Assert:** `document.querySelector('[data-testid="start-challenge-button"]') !== null`
6. **Assert:** Challenge description or objective visible (element with text content containing challenge name or "目标"/"目标:")
7. **Assert:** At least one of: difficulty badge, description section, or test case preview visible

### AC-177-006: Panel Dismisses Correctly
1. Continue from AC-177-005 (panel open, challenge selected)
2. Click close button `[data-testid="close-panel-button"]` OR click overlay `[data-testid="panel-overlay"]`
3. Wait 500ms
4. **Assert:** `document.querySelector('[data-testid="circuit-challenge-panel"]') === null` (panel removed from DOM)
5. **Assert:** Store `isPanelOpen` is `false` (via console check if exposed)
6. Re-click "🎯 挑战" toolbar button
7. Wait 500ms
8. **Assert:** Panel reappears — `document.querySelector('[data-testid="circuit-challenge-panel"]') !== null`
9. **Assert:** Previous challenge selection state is preserved (same challenge highlighted if applicable)

### AC-177-007: Regression Tests
1. Run: `npm test -- --run`
2. **Assert:** Exit code 0, all tests pass (target: 7255+)
3. Run: `npx tsc --noEmit`
4. **Assert:** Exit code 0, 0 errors
5. Run: `npm run build`
6. **Assert:** `dist/assets/*.js` max file ≤512 KB

## Risks

1. **Low:** Bundle size impact — lazy load `<CircuitChallengePanel />` if 512 KB limit approached
2. **Low:** The `CircuitChallengePanel` component may have its own internal `isPanelOpen` state — need to verify external `isPanelOpen` from store controls render/dismiss, not internal state
3. **Low:** Panel close button or overlay click must correctly call store `togglePanel()` to dismiss

## Failure Conditions

1. **AC-177-002 fails (panel renders before button clicked):** HARD FAIL — indicates unconditional render in App.tsx
2. **AC-177-003 fails (panel does not render when isPanelOpen is true):** HARD FAIL — core integration broken
3. **AC-177-004 fails (button click has no visible effect):** HARD FAIL — user cannot access challenge panel
4. **AC-177-005 fails (challenge selection does not show details):** HARD FAIL — panel renders but is non-functional
5. **AC-177-006 fails (panel does not dismiss or re-open):** HARD FAIL — state stuck, poor UX
6. **Any existing test breaks:** HARD FAIL — no regressions allowed
7. **TypeScript errors introduced:** HARD FAIL — must compile cleanly
8. **Bundle exceeds 512 KB:** HARD FAIL — performance regression

## Done Definition

All 7 acceptance criteria verified:
- [ ] `CircuitChallengePanel` imported in App.tsx (AC-177-001)
- [ ] Panel does NOT render before button clicked (AC-177-002)
- [ ] Panel renders when `isPanelOpen` becomes `true` (AC-177-003)
- [ ] Toolbar button click opens panel (AC-177-004)
- [ ] Challenge selection shows details (AC-177-005)
- [ ] Panel dismisses and reopens correctly (AC-177-006)
- [ ] `npm test -- --run` passes all tests (AC-177-007)
- [ ] `npx tsc --noEmit` exits 0 (AC-177-007)
- [ ] `npm run build` produces bundle ≤512 KB (AC-177-007)

## Out of Scope

- Adding new challenges (Round 175 complete)
- Adding new components to the challenge system
- Modifying the toolbar button (Round 176 complete)
- Modifying `CircuitChallengePanel` internals unless needed for store integration (Round 175 complete)
- Community, faction, or exchange features
- Lazy loading optimization unless bundle approaches 512 KB limit

## Operator Inbox Instructions

**This contract round is remediation for Round 176. The Round 176 QA evaluation found:**

1. **Critical Bug:** `CircuitChallengePanel` is NOT rendered in App.tsx — the toolbar button toggles store state (`isPanelOpen: true/false`) but no component listens to this state to render the panel.

2. **Root Cause:** `grep -rn "import.*CircuitChallengePanel" src/` shows only Toolbar.tsx imports `CircuitChallengeToolbarButton`. App.tsx does NOT have `<CircuitChallengePanel />` in its component tree.

3. **Required Fix:** Add conditional render of `<CircuitChallengePanel />` in App.tsx when `isPanelOpen` from `useCircuitChallengeStore` is `true`.

4. **Data-testid references for browser testing:**
   - Toolbar button: `[data-testid='circuit-challenges-button']`
   - Challenge panel: `[data-testid="circuit-challenge-panel"]`
   - Close button: `[data-testid="close-panel-button"]`
   - Panel overlay: `[data-testid="panel-overlay"]`
   - Challenge items: `[data-testid^='challenge-item-']`
   - Start challenge button: `[data-testid="start-challenge-button"]`

5. **Expected integration pattern in App.tsx:**
   ```tsx
   import { useCircuitChallengeStore } from './store/circuitChallengeStore';
   import { CircuitChallengePanel } from './components/Circuit/CircuitChallengePanel';
   
   const isPanelOpen = useCircuitChallengeStore(state => state.isPanelOpen);
   
   // In JSX return:
   {isPanelOpen && <CircuitChallengePanel />}
   ```

6. **Full user flow to verify after implementation:**
   - Enable circuit mode → Click "🎯 挑战" button → Panel opens with challenge list → Select challenge → View details → Close panel → Reopen panel → State preserved
