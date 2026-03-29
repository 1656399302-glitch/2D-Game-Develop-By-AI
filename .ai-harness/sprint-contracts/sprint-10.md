# APPROVED — Sprint Contract — Round 10

## Scope

**Priority**: Fix critical browser interaction bugs blocking verification from Round 9 feedback.

This sprint focuses exclusively on remediation of two issues identified in the Round 9 QA evaluation:
1. **[CRITICAL] RandomForgeToast DOM Manipulation Error** — Causes page resets when clicking random forge button
2. **[MINOR] Welcome Modal State Persistence** — Modal reappears after dismissal during certain interactions

---

## Spec Traceability

### P0 Items Covered This Round
- Fix RandomForgeToast `insertBefore` DOM error (Critical Bug #1)
- Fix Welcome Modal state persistence (Minor Bug #1)
- Ensure activation sequence and particle effects are verifiable in browser

### P1 Items Covered This Round
- None (remediation sprint)

### Remaining P0/P1 After This Round
- All previously completed deliverables remain functional
- No new P0/P1 items introduced

### P2 Intentionally Deferred
- All deferred items remain deferred
- No new P2 items added

---

## Deliverables

| # | File | Description |
|---|------|-------------|
| 1 | `src/components/UI/RandomForgeToast.tsx` (modified) | Fixed DOM manipulation error, proper cleanup |
| 2 | `src/components/Tutorial/WelcomeModal.tsx` (verified) | Ensure state persistence works correctly |
| 3 | `src/store/useMachineStore.ts` (verified) | RandomForgeToast visibility state management |
| 4 | `src/store/useTutorialStore.ts` (verified) | WelcomeModal persistence logic |
| 5 | `src/App.tsx` (verified) | Modal coordination logic |
| 6 | `src/__tests__/RandomForgeToast.test.tsx` (new) | Tests for toast lifecycle and error handling |
| 7 | `src/__tests__/ModalPersistence.test.tsx` (new) | Tests for modal state persistence |

---

## Acceptance Criteria

### AC1: RandomForgeToast DOM Error Fixed
- [ ] Clicking random forge button does NOT throw `insertBefore` DOM error
- [ ] ErrorBoundary is NOT triggered during random forge operation
- [ ] Page state is NOT reset after random forge operation
- [ ] Toast appears and disappears without errors

### AC2: Welcome Modal State Persistence Works
- [ ] Modal does NOT reappear after being dismissed during page refresh
- [ ] Modal does NOT reappear after being dismissed during random forge interaction
- [ ] `hasSeenWelcome` state persists correctly in localStorage
- [ ] Hydration race condition is handled

### AC3: Browser Verification Passes
- [ ] Random forge button works reliably
- [ ] Activation sequence can be triggered without page reset
- [ ] Particle effects render correctly during activation
- [ ] All modal dismissals are permanent for session

---

## Test Methods

### TM1: RandomForgeToast Error Fix Verification
```
1. Open application in browser
2. Click "随机锻造" (Random Forge) button
3. Verify NO console errors about "insertBefore"
4. Verify NO ErrorBoundary triggered
5. Verify machine is generated and displayed
6. Verify toast appears and auto-dismisses
7. Repeat steps 2-6 three times to ensure consistency
```

### TM2: Welcome Modal Persistence Verification
```
1. Open application (fresh browser or incognito)
2. Verify WelcomeModal appears on first visit
3. Click "跳过" (Skip) button
4. Refresh page
5. Verify WelcomeModal does NOT reappear
6. Click random forge button
7. Verify WelcomeModal does NOT reappear
8. Verify LoadPromptModal is also suppressed when WelcomeModal is skipped
```

### TM3: Activation Sequence Browser Verification
```
1. Create a machine via random forge
2. Click "启动机器" (Activate Machine) button
3. Verify ActivationOverlay renders correctly
4. Verify particle effects are visible
5. Verify viewport shake occurs during charging
6. Verify phase transitions work (idle → charging → activating → online)
```

### TM4: Unit Test Verification
```
1. Run: npm test -- --testPathPattern="RandomForgeToast"
2. Verify all tests pass
3. Run: npm test -- --testPathPattern="ModalPersistence"
4. Verify all tests pass
5. Run: npm test
6. Verify all 858+ tests pass (858 existing + new tests)
```

---

## Risks

### R1: Root Cause May Be in Unexpected Location
- **Risk**: The `insertBefore` error might originate from a dependency component, not RandomForgeToast itself
- **Mitigation**: Trace the full call stack when error occurs, check GSAP animations, toast positioning logic, and parent component render cycles
- **Severity**: Medium

### R2: React StrictMode Double-Invocation
- **Risk**: React StrictMode in development causes effects to run twice, which may expose race conditions not visible in production
- **Mitigation**: Ensure all effects have proper cleanup, test in both development and production modes
- **Severity**: Low

### R3: localStorage Hydration Timing
- **Risk**: The fix for WelcomeModal persistence might have edge cases during SSR or rapid state changes
- **Mitigation**: Use synchronous localStorage read pattern established in existing code, add hydration guards
- **Severity**: Low

---

## Failure Conditions

The round MUST FAIL if any of the following occur:

1. **RandomForgeToast error persists** — The `insertBefore` DOM error is still reproducible after fix attempts
2. **Regression introduced** — Existing functionality breaks (random forge fails to generate machines, activation sequence doesn't work)
3. **Welcome modal still reappears** — Modal state persistence issue not fully resolved
4. **New console errors introduced** — Fixing one error introduces new errors
5. **Test coverage decreases** — Total passing tests drops below 858

---

## Done Definition

All of the following conditions MUST be true before claiming the round complete:

### Code Quality
- [ ] RandomForgeToast.tsx has no empty useEffect hooks without cleanup
- [ ] All timeouts/intervals have corresponding cleanup functions
- [ ] ErrorBoundary does not trigger during normal random forge usage
- [ ] Welcome modal state management uses synchronous localStorage reads to avoid hydration race

### Testing
- [ ] New RandomForgeToast tests created and passing (minimum 5 new tests)
- [ ] New ModalPersistence tests created and passing (minimum 5 new tests)
- [ ] Total test count increases (858 + new tests)
- [ ] All existing tests continue to pass

### Browser Verification
- [ ] Random forge button click does NOT cause page reset
- [ ] Activation sequence runs without ErrorBoundary intervention
- [ ] Welcome modal stays dismissed after skip + refresh
- [ ] No console errors during normal user flows

### Build Quality
- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] Production build bundle size remains reasonable (< 600KB JS)

---

## Out of Scope

The following are explicitly NOT being done in this round:

1. **New features** — No new module types, UI components, or system capabilities
2. **Performance optimizations** — Particle system or rendering performance (already verified in Round 9)
3. **Visual polish** — UI refinements beyond bug fixes
4. **New test scenarios** — Beyond those required to verify bug fixes
5. **Refactoring for future extensibility** — Code organization improvements that don't relate to bug fixes
6. **Documentation updates** — README or spec.md updates (deferred to stable release)
7. **Export functionality changes** — SVG/PNG export (already working)
8. **AI text generation integration** — Future feature (not yet implemented)

---

## Technical Notes

### Root Cause Analysis (Expected)

**RandomForgeToast DOM Error:**
The error "Failed to execute 'insertBefore' on 'Node'" typically occurs when:
1. Attempting to insert a DOM node that's already mounted elsewhere
2. Race condition between React rendering and GSAP/DOM manipulation
3. Component unmounting during animation/transition

Likely fix pattern:
```tsx
useEffect(() => {
  // Set visibility after mount to avoid DOM insertion race
  setVisible(true);
  
  const timeout = setTimeout(() => {
    setVisible(false);
  }, duration);
  
  return () => {
    clearTimeout(timeout);
    // Ensure cleanup happens before DOM removal
  };
}, [duration]);
```

**Welcome Modal Persistence:**
Hydration race condition pattern (already partially implemented):
```tsx
// Use useMemo for synchronous localStorage read
const hasSeenWelcome = useMemo(() => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored).state?.hasSeenWelcome : false;
}, []);
```
