# Sprint Contract — Round 10

## APPROVED

## Scope

**Remediation Sprint**: Fix the critical Load Prompt Modal logic bug that prevents canvas persistence from working. This is a narrow, targeted fix to unblock the Round 9 deliverable.

The bug is at `src/App.tsx` lines 170-172. The current conditional rendering:
```tsx
{showLoadPrompt && hasLoadedSavedState && (
  <LoadPromptModal />
)}
```
is incorrect because `hasLoadedSavedState` starts as `false` and is only set to `true` AFTER user clicks Resume or Start Fresh — creating a chicken-and-egg problem where the modal can NEVER appear.

The fix is a single-line change to:
```tsx
{showLoadPrompt && (
  <LoadPromptModal />
)}
```

## Spec Traceability

- **P0 item being remediated**: Canvas persistence feature (localStorage save/restore with Load Prompt Modal)
- **P0 items covered this round**: Fix Load Prompt Modal conditional rendering logic
- **Remaining P0/P1 after this round**: None — persistence feature will be complete
- **P2 items**: Unchanged, deferred from previous rounds

## Deliverables

1. **Fixed `src/App.tsx` lines 170-172**: Change condition from `{showLoadPrompt && hasLoadedSavedState && (<LoadPromptModal />)}` to `{showLoadPrompt && (<LoadPromptModal />)}`
2. **Verified persistence flow**: Auto-save → Refresh → Modal appears → Resume restores state
3. **Browser test verification**: All 10 acceptance criteria pass

## Acceptance Criteria

1. **Module persistence after refresh**: After Random Forge creates modules, refreshing page and clicking Resume restores all modules with correct count
2. **Position persistence (±5px)**: Restored modules appear at original coordinates (±5px tolerance)
3. **Connection persistence**: Restored canvas shows all connections between modules
4. **Color/style persistence**: Module colors and styles are preserved across refresh
5. **Load prompt appears when localStorage has data**: Load Prompt Modal appears with Resume/Start Fresh buttons after refresh when localStorage contains saved state
6. **Resume button restores saved state**: Clicking Resume loads modules, connections, and positions from localStorage
7. **Start Fresh clears localStorage and canvas**: Clicking Start Fresh clears localStorage and shows empty canvas
8. **No prompt when localStorage is empty**: Empty localStorage results in direct page load with no modal
9. **Build succeeds with 0 TypeScript errors**: `npm run build` exits 0 with 0 TypeScript errors
10. **Tests pass (all existing + new)**: `npm test` exits 0 with all tests passing

## Test Methods

### 1. Browser Manual Test (Primary Verification)
Manual testing is REQUIRED because the bug affects runtime modal rendering:

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | `localStorage.clear()`, refresh | No modal, empty canvas loads |
| 2 | Click "Random Forge", wait 5s | Modules appear, auto-saved to localStorage |
| 3 | `localStorage.getItem('arcane-canvas-state')` | Returns non-null JSON data |
| 4 | Refresh page | Load Prompt Modal appears with Resume/Start Fresh buttons |
| 5 | Click "Resume" | Canvas restores modules and connections |
| 6 | Click "Start Fresh" (fresh session) | localStorage cleared, empty canvas |
| 7 | Verify positions (±5px) | Modules restored at original coordinates |
| 8 | Verify connections | All connections restored visually |

### 2. Build Verification
```bash
npm run build
```
- Must exit with code 0
- Must produce 0 TypeScript errors
- Expected output: ~335KB JS, ~33KB CSS

### 3. Test Suite
```bash
npm test
```
- Must exit with code 0
- All tests must pass (no regression)

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Wrong line edited | Low | Exact lines 170-172 specified |
| Regression in other modal logic | Low | `hasLoadedSavedState` still used elsewhere for state tracking |
| Build failure | Very Low | Change is additive removal of condition |

## Failure Conditions

The round FAILS if ANY of the following occur:

1. Modal does NOT appear when localStorage has saved state after page refresh
2. Resume button does NOT restore saved canvas state (modules or connections missing)
3. `npm run build` exits non-zero OR has TypeScript errors
4. `npm test` exits non-zero OR has test failures
5. New TypeScript errors introduced anywhere in codebase

## Done Definition

**All conditions must be TRUE before claiming round complete:**

1. [ ] `src/App.tsx` lines 170-172 use exactly: `{showLoadPrompt && (<LoadPromptModal />)}`
2. [ ] Browser test: Modal appears after refresh with saved localStorage state
3. [ ] Browser test: Resume button restores modules AND connections with correct positions (±5px)
4. [ ] Browser test: Start Fresh clears localStorage and canvas shows empty state
5. [ ] Browser test: Empty localStorage → no modal, direct load
6. [ ] `npm run build` exits 0 with 0 TypeScript errors
7. [ ] `npm test` exits 0 with all tests passing

**Note on `hasLoadedSavedState`**: This flag remains in the store and is still set by `markStateAsLoaded()` after user interaction. Its purpose changes from "gating modal display" to "tracking that user has made a choice" — preventing modal re-appearance on subsequent re-renders.

## Out of Scope

- No new features
- No new modules or components
- No UI/UX changes beyond the conditional logic fix
- No animation improvements
- No test additions (existing tests are sufficient)
- No changes to localStorage utilities (already working correctly)
- No changes to LoadPromptModal component itself (styling is fine)

## Technical Notes

### Root Cause Analysis

The Round 9 QA evaluation identified this critical bug:

**Current (INCORRECT) code at `src/App.tsx:170-172`:**
```tsx
{showLoadPrompt && hasLoadedSavedState && (
  <LoadPromptModal />
)}
```

**State flow problem:**
1. `showLoadPrompt` = `true` when saved state exists (correctly set by useEffect)
2. `hasLoadedSavedState` = `false` initially (set only after user clicks Resume/Start Fresh)
3. Modal requires BOTH → modal can NEVER appear → user can NEVER interact → flag can NEVER be set

**Required FIX at `src/App.tsx:170-172`:**
```tsx
{showLoadPrompt && (
  <LoadPromptModal />
)}
```

**State flow after fix:**
1. Saved state detected → `showLoadPrompt = true` → Modal appears ✓
2. User clicks Resume → `markStateAsLoaded()` called → `hasLoadedSavedState = true` ✓
3. Subsequent renders: `showLoadPrompt` may become `false` (no saved state), modal hidden ✓

### What's Already Working (from Round 9 QA)

| Component | Status |
|-----------|--------|
| Auto-save to localStorage | ✓ Working |
| `localStorage.ts` functions | ✓ All 4 working |
| Debounced 500ms save | ✓ Working |
| LoadPromptModal styling | ✓ Professional visuals |
| Unit tests (23 persistence) | ✓ All passing |
| Build system | ✓ 0 TypeScript errors |
