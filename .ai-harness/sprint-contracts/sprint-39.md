# Sprint Contract — Round 39

## Scope

**CRITICAL BUG FIX: Eliminate "Maximum update depth exceeded" React warnings**

Root cause analysis from QA Round 38 feedback identifies TWO components causing circular update loops:

### Primary Root Cause: `EnergyPulseVisualizer.tsx`
Line 97 has `activeWaves` in its useEffect dependency array while also calling `setActiveWaves`:
```typescript
useEffect(() => {
  // ...
  setActiveWaves(prev => { ... });  // Updates activeWaves
  // ...
}, [isActive, startTime, pulseSpeed, connections, choreography, activeWaves]);  // activeWaves HERE!
```
This creates a circular update loop: state change → effect runs → state change → effect runs...

### Secondary Root Cause: `TutorialOverlay.tsx`
Has useEffect without dependency array that syncs refs, potentially contributing to update cascades:
```typescript
useEffect(() => {
  nextStepRef.current = useTutorialStore.getState().nextStep;
  // ...
});  // NO DEPENDENCY ARRAY - runs every render
```

## Spec Traceability

This is a **remediation-only sprint** focused on eliminating React update loop warnings.

### P0 Items (This Round)
- [ ] Fix circular dependency in EnergyPulseVisualizer.tsx (remove `activeWaves` from dependency array, convert animation loop to use refs)
- [ ] Fix useEffect without dependency array in TutorialOverlay.tsx (add proper dependency array)
- [ ] Verify 0 "Maximum update depth exceeded" warnings via Playwright browser_test across 3 consecutive page loads
- [ ] Ensure build passes with 0 TypeScript errors
- [ ] Ensure all 1562 tests still pass

### Remaining P0/P1 After This Round
- All spec P0/P1 items remain complete from previous rounds
- No new features being added this round

### P2 Intentionally Deferred
- All P2 items remain deferred

## Deliverables

### D1: Fixed `src/components/Preview/EnergyPulseVisualizer.tsx`
- Remove `activeWaves` from useEffect dependency array
- Convert animation loop to use refs internally for self-containment
- Animation state managed entirely within useRef, no setState in animation loop
- Maintain all pulse wave animation functionality

### D2: Fixed `src/components/Tutorial/TutorialOverlay.tsx`
- Add proper dependency array to useEffect that syncs refs
- Ensure effect only runs when dependencies actually change
- No useEffect should run without a proper dependency array

### D3: Verification Evidence
- Browser test output showing 0 "Maximum update depth exceeded" warnings on 3 consecutive page loads (verified via Playwright)
- Build output showing 0 TypeScript errors
- Test suite output showing all 1562 tests pass

## Acceptance Criteria

| AC | Criterion | Verification Method |
|----|-----------|---------------------|
| AC1 | Browser console shows 0 "Maximum update depth exceeded" warnings | Playwright browser_test, 3 consecutive page loads |
| AC2 | Build completes with 0 TypeScript errors | `npm run build` |
| AC3 | All 1562 tests pass | `npm test -- --run` |
| AC4 | EnergyPulseVisualizer animations still function correctly | Visual verification - pulses travel along connections |
| AC5 | TutorialOverlay steps still function correctly | Visual verification - tutorial navigation works |

## Test Methods

### TM1: Browser Console Verification (PRIMARY - Must Pass)
```
Run: browser_test (Playwright)
Expected: 0 "Maximum update depth exceeded" warnings
Run count: 3 consecutive page loads
Pass threshold: ALL 3 runs show 0 warnings
```

### TM2: Build Verification
```bash
npm run build
Expected: 0 TypeScript errors
```

### TM3: Test Suite Verification
```bash
npm test -- --run
Expected: 68 test files, 1562 tests, all passing
```

### TM4: Functional Verification
1. Launch dev server: `npm run dev`
2. Verify app loads without React warnings in console
3. Trigger machine activation flow — verify pulse animations still work
4. Complete tutorial flow — verify tutorial navigation still works

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Fix may break pulse wave animations | HIGH | Test animation visually after fix, ensure pulse dots still travel along connection paths |
| Other components may have similar patterns | MEDIUM | If warnings persist after fixing these two, systematically check other components with useEffect |
| StrictMode double-render in dev mode | LOW | Test in production build mode, verify warnings are gone in both dev and prod |

## Failure Conditions

**This round FAILS if ANY of the following occur:**

1. **FC1:** Browser verification shows ANY "Maximum update depth exceeded" warning (0 tolerance)
2. **FC2:** Build fails with TypeScript errors
3. **FC3:** Any test suite failures (1562/1562 required)
4. **FC4:** EnergyPulseVisualizer animations no longer function (visual regression)
5. **FC5:** TutorialOverlay no longer functions (visual regression)

## Done Definition

**ALL conditions must be true before claiming round complete:**

- [ ] `activeWaves` removed from EnergyPulseVisualizer.tsx useEffect dependency array
- [ ] Animation loop in EnergyPulseVisualizer uses refs internally, no setState in animation loop
- [ ] TutorialOverlay.tsx has proper dependency array on all useEffect hooks
- [ ] Browser test shows 0 "Maximum update depth exceeded" warnings across 3 consecutive runs
- [ ] Build succeeds with 0 TypeScript errors
- [ ] All 1562 tests pass
- [ ] Visual verification: pulse animations still work
- [ ] Visual verification: tutorial navigation still works

## Out of Scope

- No new features or functionality
- No UI/UX changes beyond bug fixes
- No changes to store architecture (useStoreHydration.ts already fixed)
- No changes to other components not identified as warning sources
- No debugging instrumentation left in production code

## Root Cause Traceability

| Component | Issue | Fix |
|-----------|-------|-----|
| EnergyPulseVisualizer.tsx:97 | `activeWaves` in dependency array while calling `setActiveWaves` | Remove from deps, use refs for animation state |
| TutorialOverlay.tsx | useEffect without dependency array | Add proper dependency array |
