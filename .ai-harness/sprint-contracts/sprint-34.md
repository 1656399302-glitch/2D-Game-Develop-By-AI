# APPROVED — Sprint Contract Round 34

## Scope

**Remediation Sprint**: Fix the 10 persistent "Maximum update depth exceeded" React warnings by addressing Zustand persist hydration timing and store subscription patterns identified in Round 33 QA feedback.

## Spec Traceability

- **P0**: AC1: Browser console shows 0 "Maximum update depth exceeded" warnings — **FAIL (Round 33)**
- **P1**: AC2: Build with 0 TypeScript errors — **PASS (Round 33)**
- **P1**: AC3: All tests pass — **PASS (Round 33)**
- **P2**: Remaining P2 items — **Deferred**

## Root Cause Analysis (from Round 33 QA)

Round 33 confirmed that WelcomeModal, useWelcomeModal, and TutorialOverlay patterns ARE correct. Additional sources identified:

1. **Zustand persist middleware hydration** — Multiple stores use `persist` middleware causing cascading state updates during initial hydration
2. **Store subscriptions without selectors** — `ModulePanel.tsx` and `RecipeBrowser.tsx` destructuring entire stores
3. **App.tsx multi-store subscriptions** — 12+ store subscriptions syncing to local state
4. **TutorialOverlay MutationObserver** — `setTimeout(updateTargetPosition, 100)` timing
5. **MachineStore auto-save** — Rapid state changes during initial load

## Deliverables

1. **Zustand Hydration Fix** — Add `skipHydration: true` to all persist stores, manually trigger hydration after mount with useEffect
2. **App.tsx Store Subscriptions** — Replace all full-store subscriptions with `useShallow` or individual selectors
3. **ModulePanel.tsx** — Replace `const { isUnlocked } = useRecipeStore()` with selector-based subscription
4. **RecipeBrowser.tsx** — Replace `const { isUnlocked } = useRecipeStore()` with selector-based subscription
5. **TutorialOverlay MutationObserver** — Debounce updateTargetPosition to 200ms minimum, add cleanup
6. **MachineStore Hydration** — Add controlled hydration timing
7. **Browser Verification** — Confirms 0 "Maximum update depth exceeded" warnings

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC1 | 0 "Maximum update depth exceeded" warnings in browser | Playwright console monitoring, 3+ page loads |
| AC2 | npm run build completes with 0 TypeScript errors | `npm run build` |
| AC3 | All tests pass | `npm test -- --run` |
| AC4 | All persist stores use `skipHydration: true` | Code inspection + grep |
| AC5 | All store subscriptions use selectors or `useShallow` | Code inspection + grep |
| AC6 | MutationObserver debounce ≥ 200ms | Code inspection |

## Test Methods

1. **Browser Console Test**: Load app with Playwright, capture console messages across 3+ full page loads, assert exactly 0 "Maximum update depth exceeded" warnings
2. **Build Test**: `npm run build` must complete with 0 TypeScript errors
3. **Unit Test**: `npm test -- --run` must pass all tests
4. **Hydration Grep**: `grep -rn "skipHydration" src/store --include="*.ts"` must return matches for all persist stores
5. **Subscription Grep**: `grep -rn "useRecipeStore()" src/components --include="*.tsx"` should return 0 results (no unsubscribed store access)
6. **MutationObserver Grep**: `grep -rn "updateTargetPosition" src/components/TutorialOverlay.tsx` — debounce value must be ≥ 200

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hydration skip breaks localStorage persistence | High | Verify persistence still works via browser refresh test |
| Selector changes break component rendering | High | Run all tests, verify UI renders correctly |
| Debounce makes tutorial feel laggy | Low | Use 200ms, fine-tune if needed |

## Failure Conditions

1. Any "Maximum update depth exceeded" warning remains after fixes
2. Build fails with TypeScript errors
3. Any existing test fails
4. Application fails to persist state across refresh (regression)

## Done Definition

**Exact conditions that must be true:**
1. `npm run build` completes with 0 TypeScript errors
2. `npm test -- --run` passes all tests
3. Browser console shows exactly 0 "Maximum update depth exceeded" warnings across 3+ test runs
4. All persist stores (useTutorialStore, useMachineStore, useCodexStore) use `skipHydration: true`
5. All store subscriptions in components use selectors or `useShallow`
6. No raw `useRecipeStore()`, `useMachineStore()`, `useTutorialStore()` calls that destructure entire state
7. Application persists state correctly across page refresh

## Out of Scope

1. New feature development
2. Visual design changes
3. Additional test coverage
4. Changes to WelcomeModal, useWelcomeModal, TutorialOverlay (already verified correct in Round 33)
5. Changes to SVG modules, animation system, export functionality, or other working features
