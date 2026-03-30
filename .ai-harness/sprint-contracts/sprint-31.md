# APPROVED — Sprint Contract Round 31

## Scope

**Remediation Sprint** — Fix the remaining "Maximum update depth exceeded" warning in App.tsx that was identified but not addressed in Round 30.

## Spec Traceability

- **P0 items covered this round:**
  - Fix App.tsx `checkTutorialUnlock` useEffect dependency array issue
  - AC6: Browser verification must show 0 "Maximum update depth exceeded" warnings

- **P1 items covered this round:**
  - AC4: reactWarnings.test.tsx pattern tests must continue passing

- **Remaining P0/P1 after this round:**
  - None — all ACs should pass

- **P2 intentionally deferred:**
  - Feature expansion
  - UI polish
  - Performance optimization beyond warning elimination

## Deliverables

1. **Fixed App.tsx** — Replace the `checkTutorialUnlock` store action in useEffect dependency with ref-based pattern
2. **Comprehensive codebase scan** — Search for any other `useEffect` hooks with store actions in dependency arrays
3. **Updated reactWarnings.test.tsx** — Add verification test for the new `checkTutorialUnlockRef` pattern
4. **Zero console warnings** — Confirmed via browser verification

## Acceptance Criteria

1. **AC1:** App.tsx stores `checkTutorialUnlock` in a ref and syncs it via useEffect
2. **AC2:** App.tsx tutorial completion useEffect uses the ref with empty dependency array
3. **AC3:** App.tsx has no store actions in any useEffect dependency arrays (verified via code inspection)
4. **AC4:** `npm run build` completes with 0 TypeScript errors
5. **AC5:** `npm test` passes (all existing tests)
6. **AC6:** Browser verification shows 0 "Maximum update depth exceeded" warnings during app load
7. **AC7:** All existing functionality continues to work (activation, tutorial, codex, etc.)
8. **AC8:** No other components have store actions in useEffect dependency arrays (verified via grep)

## Test Methods

1. **Code Inspection (AC1-AC3, AC8):**
   - Verify `checkTutorialUnlockRef` is created with `useRef`
   - Verify sync useEffect updates `checkTutorialUnlockRef.current`
   - Verify tutorial completion useEffect has empty deps `[]` and uses `checkTutorialUnlockRef.current()`
   - Run: `grep -n "checkTutorialUnlock" src/App.tsx` to verify pattern
   - Run: `grep -rn "useEffect.*\[\s*.*Store\." src/` to find any remaining store action dependencies

2. **Build Verification (AC4):**
   - Run: `npm run build`
   - Expected: 0 TypeScript errors, production bundle generated

3. **Test Suite (AC5):**
   - Run: `npm test`
   - Expected: All 68 test files pass, all 1556+ tests pass

4. **Browser Verification (AC6):**
   - Start dev server: `npm run dev`
   - Open browser to http://localhost:5173
   - Open DevTools console
   - Verify: 0 "Maximum update depth exceeded" warnings
   - Manual verification is CRITICAL — build and tests passing is NOT sufficient

5. **Functional Smoke Test (AC7):**
   - App loads without crash
   - Welcome modal appears (if no saved state)
   - Tutorial can start and complete
   - Modules can be added to canvas
   - Machine can be activated

## Risks

1. **Risk:** There may be OTHER components with similar patterns not in App.tsx
   - **Mitigation:** After fixing App.tsx, search the codebase for any remaining `useEffect` with store actions in dependency arrays
   - Run: `grep -rn "useEffect.*\[\s*.*Store\." src/` to find similar patterns
   - If found, apply the same ref-based fix pattern

2. **Risk:** The ref-based fix may change runtime behavior
   - **Mitigation:** Verify functional smoke tests pass

3. **Risk:** Test coverage may not catch runtime warnings
   - **Mitigation:** Manual browser verification is required — no exceptions

## Failure Conditions

This round FAILS if:

1. **Build fails** with TypeScript errors
2. **Any test fails** in `npm test`
3. **Browser verification detects even 1** "Maximum update depth exceeded" warning
4. **App crashes** or becomes non-functional
5. **Any store action found in any useEffect dependency array** in the codebase

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ App.tsx code uses ref-based pattern for `checkTutorialUnlock`
2. ✅ No store actions appear in any useEffect dependency arrays in App.tsx
3. ✅ `npm run build` succeeds with 0 TypeScript errors
4. ✅ `npm test` passes all tests
5. ✅ Browser verification confirms 0 warnings on load
6. ✅ Functional smoke tests confirm app works
7. ✅ Grep verification confirms no store actions in any useEffect dependency arrays

## Out of Scope

- Adding new features
- UI/UX improvements beyond bug fixes
- Performance optimization beyond warning elimination
- Refactoring code outside App.tsx (unless similar patterns found via grep)
- Mobile layout changes
- New module types or animations

## Fix Specification

**Current broken code (lines 127-159):**
```typescript
// Tutorial completion handler - trigger recipe unlocks
useEffect(() => {
  const tutorialStore = useTutorialStore.getState();
  const tutorialCompleted = tutorialStore.currentStep >= 6;
  if (tutorialCompleted) {
    checkTutorialUnlock();
  }
}, [checkTutorialUnlock]);  // ❌ Store action in deps causes warnings
```

**Required fixed code:**
```typescript
// FIX: Store checkTutorialUnlock in ref to avoid dependency array issues
const checkTutorialUnlockRef = useRef(checkTutorialUnlock);
useEffect(() => {
  checkTutorialUnlockRef.current = checkTutorialUnlock;
}, [checkTutorialUnlock]);

// Tutorial completion handler - trigger recipe unlocks
useEffect(() => {
  const tutorialStore = useTutorialStore.getState();
  const tutorialCompleted = tutorialStore.currentStep >= 6;
  if (tutorialCompleted) {
    checkTutorialUnlockRef.current();
  }
}, []);  // ✅ Empty deps - only runs on mount
```

**Placement:** The ref and sync useEffect should be placed near the existing `markStateAsLoadedRef` pattern (around line 97-110), keeping related fixes grouped together.

## Codebase Verification Command

After fixing App.tsx, run this command to ensure no other components have the same issue:

```bash
grep -rn "useEffect.*\[\s*.*Store\." src/ --include="*.tsx" --include="*.ts"
```

Expected result: No matches (0 results)

If matches are found, apply the same ref-based fix pattern to each affected file.
