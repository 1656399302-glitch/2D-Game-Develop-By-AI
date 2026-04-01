APPROVED

# Sprint Contract — Round 77

## Scope

**Critical Bug Fix:** The `useAchievementToastQueue` hook is instantiated twice in two different components (App.tsx line ~102 and AchievementToastContainer inside AchievementToast.tsx), creating separate state containers that don't share data. This causes the toast notification system to be completely non-functional.

## Spec Traceability

### P0 Items Covered This Round
- **Toast Queue System Fix**: Refactor `useAchievementToastQueue` to use React Context so all components share the same queue instance
- **AC4 Verification**: Ensure achievement unlock events properly trigger visible toast notifications

### Remaining P0/P1 After This Round
- All P0/P1 items from previous rounds remain intact (achievement list, progress indicators, achievement triggers, build/test passing)
- This round focuses exclusively on fixing the toast queue integration bug

### P2 Intentionally Deferred
- All P2 features remain deferred

---

## Deliverables

1. **Refactored `useAchievementToastQueue` Hook with Context Provider**
   - Create `AchievementToastContext` using React's `createContext`
   - Create `AchievementToastProvider` component that holds queue state
   - Create `useAchievementToastQueueContext` hook for accessing shared state
   - Modify `useAchievementToastQueue` to use module-level state or export provider pattern

2. **Updated `AchievementToastContainer`**
   - Remove duplicate hook instantiation
   - Use shared context provider instead

3. **Updated `App.tsx`**
   - Wrap application with `AchievementToastProvider`
   - Use shared context hook for `addToQueue`

4. **Integration Test File: `src/components/Achievements/__tests__/AchievementToast.integration.test.tsx`**
   - Test that `addToQueue` from context triggers `visibleAchievements` in `AchievementToastContainer`
   - Test that toast appears within 500ms when achievement is added to queue
   - Test that the test file exists and passes with the rest of the test suite

---

## Acceptance Criteria

1. **AC1:** `AchievementToastContainer` no longer instantiates its own `useAchievementToastQueue` hook instance (grep finds 0 calls to `useAchievementToastQueue(` in AchievementToast.tsx)
2. **AC2:** `App.tsx` wraps the application with a single `AchievementToastProvider`
3. **AC3:** Both `addToQueue` (called from App.tsx) and `visibleAchievements` (read by AchievementToastContainer) reference the same queue state
4. **AC4:** When `tutorial:completed` event fires, an achievement toast **MUST** appear within 500ms
5. **AC5:** Build passes (bundle < 560KB, TypeScript 0 errors)
6. **AC6:** All 2645 existing tests pass
7. **AC7:** New integration test file `AchievementToast.integration.test.tsx` exists and passes

---

## Test Methods

### Test 1: Hook Singleton Verification
```bash
# Verify NO hook instantiation in AchievementToast.tsx (context used instead)
grep -c "useAchievementToastQueue(" src/components/Achievements/AchievementToast.tsx
# Expected: 0 (removed hook call, using context instead)

# Verify App.tsx NO longer calls useAchievementToastQueue directly (should use context)
grep -c "useAchievementToastQueue(" src/App.tsx
# Expected: 0 (App.tsx now uses useAchievementToastQueueContext instead)

# Verify context usage in AchievementToast.tsx
grep "useAchievementToastQueueContext\|AchievementToastProvider" src/components/Achievements/AchievementToast.tsx
# Expected: Context usage found

# Verify App.tsx uses provider pattern
grep "AchievementToastProvider" src/App.tsx
# Expected: Provider wrapper found

# Verify App.tsx uses context hook
grep "useAchievementToastQueueContext" src/App.tsx
# Expected: Context hook usage found
```

### Test 2: Toast Queue Integration Test
```bash
# File must exist
ls src/components/Achievements/__tests__/AchievementToast.integration.test.tsx
# Expected: File exists

# Run the specific integration test
npx vitest run src/components/Achievements/__tests__/AchievementToast.integration.test.tsx
# Expected: Test passes (1 or more tests passed)

# The integration test verifies:
# 1. addToQueue in context triggers visibleAchievements in same context
# 2. Toast element renders when achievement added to queue
```

### Test 3: Browser Verification - Achievement Unlock Toast
```
Manual Steps:
1. Clear localStorage: localStorage.clear()
2. Open application at http://localhost:5173
3. Wait for app to fully render
4. Dispatch event: window.dispatchEvent(new CustomEvent('tutorial:completed'))
5. Observe: Toast element appears with "入门者" achievement
6. Time: Toast should appear within 500ms of event dispatch

Automated Test (via Playwright/Cypress):
- Create test that dispatches 'tutorial:completed' event
- Wait for toast selector: [data-testid="achievement-toast"] or .achievement-toast
- Assert toast is visible with correct achievement title
- Assert toast appears within 500ms
```

### Test 4: Existing Functionality Regression
```bash
# Ensure AchievementList still shows 15 achievements
# Ensure milestone progress indicators still work
# Ensure header badge updates correctly

# Full build test
npm run build
# Expected: 0 errors, bundle < 560KB

# Full test suite
npx vitest run
# Expected: All 2645+ tests pass (including new integration test)
```

---

## Risks

1. **React Context Re-render Risk:** Context provider may cause unnecessary re-renders if not optimized with `useMemo`/`useCallback`. Will use stable references for queue state updates.
2. **Migration Risk:** Need to ensure all existing functionality (AchievementList, progress bars, header badge) continues to work while fixing toast queue.
3. **Zustand Store Conflict:** If AchievementStore's internal toast handling conflicts with new context, may need to decouple.

---

## Failure Conditions

1. **Toast Never Appears:** After dispatching `tutorial:completed` event, if no toast appears within 2 seconds → FAIL
2. **Multiple Hook Instances Still Exist:** If `grep "useAchievementToastQueue(" src/components/Achievements/AchievementToast.tsx` returns non-zero → FAIL
3. **App.tsx Still Uses Direct Hook:** If `grep "useAchievementToastQueue(" src/App.tsx` returns non-zero → FAIL
4. **Build Fails:** If `npm run build` returns non-zero exit code → FAIL
5. **Tests Fail:** If any of 2645+ tests fail → FAIL
6. **Bundle Size Exceeded:** If bundle > 560KB → FAIL
7. **Integration Test Missing:** If `src/components/Achievements/__tests__/AchievementToast.integration.test.tsx` does not exist → FAIL

---

## Done Definition

**Exact conditions that must be true before claiming round complete:**

1. ✅ `useAchievementToastQueue(` is NOT called in `src/components/Achievements/AchievementToast.tsx`
2. ✅ `useAchievementToastQueue(` is NOT called in `src/App.tsx` (must use context hook instead)
3. ✅ `AchievementToastContainer` uses `useAchievementToastQueueContext` (or equivalent shared access)
4. ✅ `AchievementToastProvider` wraps the entire app in App.tsx
5. ✅ `useAchievementToastQueueContext` is used in App.tsx for `addToQueue`
6. ✅ Toast appears within 500ms when `tutorial:completed` event is dispatched
7. ✅ Integration test file `src/components/Achievements/__tests__/AchievementToast.integration.test.tsx` exists
8. ✅ Integration test passes as part of test suite
9. ✅ Build passes: `npm run build` → 0 errors, bundle < 560KB
10. ✅ Tests pass: `npx vitest run` → 2645+ tests passed
11. ✅ Header badge still shows achievement count correctly
12. ✅ AchievementList still displays all 15 achievements with progress indicators

---

## Out of Scope

- Adding new achievements (15 exist, complete)
- Modifying achievement unlock conditions or triggers
- Changes to AchievementList UI or functionality
- Changes to header badge display
- Changes to localStorage persistence
- Any new features beyond toast queue fix
- Changes to any other store or hook implementations
