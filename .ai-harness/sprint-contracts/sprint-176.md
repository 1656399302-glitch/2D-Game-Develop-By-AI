# Sprint Contract — Round 176

## APPROVED

## Scope

This is a **remediation sprint** focused solely on integrating the already-implemented `CircuitChallengeToolbarButton` component into the application toolbar. Round 175 completed all functional work (store, panel, validation, tests) but failed to wire the UI entry point.

## Spec Traceability

### P0 items covered this round
- **AC-175-007 (Circuit Mode Integration)** — The sole failing acceptance criterion from Round 175

### P1 items covered this round
- None — P1 items were completed in Round 175

### Remaining P0/P1 after this round
- None — All P0/P1 work complete pending this integration fix

### P2 intentionally deferred
- Community gallery improvements
- Advanced challenge tiers
- Achievement integration with challenges

## Deliverables

1. **`App.tsx`** — Updated to import and render `CircuitChallengeToolbarButton` in the circuit toolbar area
2. **`CircuitChallengePanel.tsx`** — No changes required (already complete)
3. **Browser verification** — Confirms "🎯 Challenges" button visible in circuit toolbar

## Acceptance Criteria

1. **AC-176-001:** `CircuitChallengeToolbarButton` is imported in `App.tsx`
2. **AC-176-002:** "🎯 Challenges" button appears in the circuit mode toolbar (near "▶ 运行" and "↺" buttons)
3. **AC-176-003:** Clicking the "🎯 Challenges" button opens the `CircuitChallengePanel`
4. **AC-176-004:** Challenge panel allows user to select a challenge and see its details
5. **AC-176-005:** All existing tests continue to pass (no regression)

## Test Methods

### AC-176-001: Import Verification
- **Static Analysis:** Run `grep -n "CircuitChallengeToolbarButton" src/App.tsx` and verify import statement exists
- **Expected Output:** `import { CircuitChallengeToolbarButton } from './components/Circuit/CircuitChallengePanel';`

### AC-176-002: Button Visibility in Toolbar
- **Build Verification:** Run `npm run build` to verify compilation succeeds
- **Browser Verification:** 
  1. Start dev server with `npm run dev`
  2. Open browser to http://localhost:5173
  3. Enable circuit mode by clicking "电路模式"
  4. Verify button with text "🎯 Challenges" or containing "🎯" emoji is rendered in circuit toolbar
  5. Verify button appears near "▶ 运行" and "↺" buttons

### AC-176-003: Button Opens Challenge Panel
- **Browser Verification:**
  1. In circuit mode, click "🎯 Challenges" button
  2. Verify `CircuitChallengePanel` modal/panel appears
  3. Verify panel contains challenge list

### AC-176-004: Challenge Selection and Details
- **Browser Verification:**
  1. With challenge panel open, verify challenge list displays (at least 5 challenges visible)
  2. Verify difficulty badges show for each challenge (beginner/intermediate/advanced)
  3. Click on a challenge to select it
  4. Verify challenge details appear (objectives, hints)

### AC-176-005: Regression Testing
- **Test Suite:** Run `npm test -- --run` and verify all tests pass
- **TypeScript:** Run `npx tsc --noEmit` and verify exit code 0
- **Bundle Size:** Run `npm run build` and verify bundle ≤512KB

## Risks

1. **Low Risk:** The component already exists and is fully implemented — this is purely a wiring task
2. **CSS/Positioning Risk:** Button placement in toolbar may need CSS adjustment to match existing style
3. **Import Path Risk:** Verify correct import path if component was moved

## Failure Conditions

1. **AC-176-002 fails:** Button with "🎯" or "挑战" text NOT visible in circuit toolbar in browser
2. **AC-176-003 fails:** Clicking button does not open challenge panel
3. **AC-176-005 fails:** Any existing test fails or TypeScript compilation errors occur
4. **Bundle Size:** `npm run build` exceeds 512KB limit

## Done Definition

All conditions must be TRUE before claiming round complete:

1. ✅ `CircuitChallengeToolbarButton` imported in `App.tsx`
2. ✅ Button with "🎯 Challenges" visible in circuit toolbar (browser verified)
3. ✅ Button click opens `CircuitChallengePanel` with challenge list
4. ✅ Challenge selection shows challenge details
5. ✅ `npm test -- --run` passes all tests (7255+)
6. ✅ `npx tsc --noEmit` exits 0
7. ✅ `npm run build` ≤ 512KB
8. ✅ **Browser test:** "🎯 Challenges" button found and clickable in circuit mode

## Out of Scope

- No new features
- No changes to challenge definitions
- No changes to circuit validation logic
- No changes to the store implementation
- No changes to existing tests
- No changes to the `CircuitChallengePanel` component itself

## Root Cause

From Round 175 QA Evaluation:
> The `CircuitChallengeToolbarButton` component exists in `CircuitChallengePanel.tsx` line 383 but is NOT imported or rendered anywhere in `App.tsx`. Browser testing confirmed no "🎯 Challenges" button is visible in the circuit toolbar.

## Fix Summary

Single action required:
```typescript
// In App.tsx, add import:
import { CircuitChallengeToolbarButton } from './components/Circuit/CircuitChallengePanel';

// In the circuit toolbar JSX (near existing "▶ 运行" button), add:
<CircuitChallengeToolbarButton />
```

The Round 175 work was excellent — store, validation, panel component, and 47 tests all pass. This round is purely integration plumbing.
