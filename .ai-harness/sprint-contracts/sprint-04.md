# Sprint Contract — Round 4

## APPROVED

## Scope

**Remediation Sprint** — Fix the LoadPromptModal coordination issue identified in Round 3 QA feedback.

## Spec Traceability

- **P0 items covered this round:**
  - [FIX] LoadPromptModal coordination with WelcomeModal skip flow

- **P1 items covered this round:** None (remediation focus)

- **Remaining P0/P1 after this round:** None related to this fix

- **P2 intentionally deferred:** All P2 items remain deferred

## Background

Round 3 QA revealed an **incomplete fix** for the WelcomeModal skip behavior:

**The Problem:**
- Canvas state IS preserved when skipping WelcomeModal (modules don't disappear) ✓
- BUT LoadPromptModal still appears after WelcomeModal dismiss ✓
- Users see "Start Fresh" button and may accidentally clear their work ✗

**Root Cause:**
- `handleSkip` in `useWelcomeModal` calls `restoreSavedState()` to restore modules
- BUT `showLoadPrompt` state in App.tsx was set to `true` during mount
- `handleSkip` does NOT have access to App.tsx's `setShowLoadPrompt` setter
- LoadPromptModal renders because its condition `{showLoadPrompt && (<LoadPromptModal />)}` is still true

## Deliverables

1. **Modified `useWelcomeModal` hook** (`src/components/Tutorial/WelcomeModal.tsx`)
   - Accept `setShowLoadPrompt` as optional parameter
   - Call `setShowLoadPrompt(false)` in `handleSkip` when provided

2. **Modified `App.tsx`** (`src/App.tsx`)
   - Pass `setShowLoadPrompt` to `useWelcomeModal` hook

3. **Integration test for complete flow** (`src/__tests__/ModalCoordination.test.tsx`)
   - Test: skip WelcomeModal → verify LoadPromptModal does NOT appear → verify canvas has saved modules

## Acceptance Criteria

1. **AC1:** When user clicks "Skip & Explore" on WelcomeModal with saved state:
   - WelcomeModal closes
   - Canvas shows restored modules (state is preserved)
   - LoadPromptModal does NOT appear

2. **AC2:** When user clicks "Skip & Explore" on WelcomeModal without saved state:
   - WelcomeModal closes
   - Canvas is empty
   - LoadPromptModal does NOT appear

3. **AC3:** When user clicks "Start Tutorial" on WelcomeModal:
   - WelcomeModal closes
   - Tutorial begins
   - LoadPromptModal does NOT appear

4. **AC4:** All 676 existing tests continue to pass

5. **AC5:** New integration test passes

## Test Methods

1. **Unit Tests (existing):**
   - `WelcomeModal.test.ts` — 19 tests (skip behavior)
   - `TutorialStore.test.ts` — 37 tests (persistence)
   - `App.test.ts` — 16 tests (modal coordination)

2. **Integration Test (new):**
   - `ModalCoordination.test.tsx` — Browser-level test verifying complete skip flow
   - Steps: seed localStorage with saved state → reload → skip WelcomeModal → assert LoadPromptModal absent → assert canvas has modules

3. **Manual Browser Verification:**
   - Clear localStorage, add 1 module, reload page
   - Click "Skip & Explore"
   - Verify: WelcomeModal gone, LoadPromptModal NOT visible, canvas shows 1 module

## Risks

1. **Low Risk:** Simple state coordination fix with clear cause/effect
2. **Minimal Code Change:** Only 3 files modified, no architectural changes
3. **Existing Test Coverage:** Comprehensive unit tests already in place

## Failure Conditions

Round fails if ANY of:
1. LoadPromptModal appears after WelcomeModal skip (critical UX bug)
2. Canvas state is NOT preserved after WelcomeModal skip
3. Any of 676 existing tests fail
4. New integration test fails or is missing
5. TypeScript compilation errors introduced

## Done Definition

**Exact conditions that must be true before claiming round complete:**

1. ✓ `useWelcomeModal` accepts and uses `setShowLoadPrompt` parameter
2. ✓ `App.tsx` passes `setShowLoadPrompt` to `useWelcomeModal`
3. ✓ LoadPromptModal does NOT render when WelcomeModal is skipped with saved state
4. ✓ Canvas modules are restored when WelcomeModal is skipped with saved state
5. ✓ All 676 existing tests pass
6. ✓ New `ModalCoordination.test.tsx` test file created and passing
7. ✓ `npm run build` succeeds with 0 TypeScript errors

## Out of Scope

- Any feature additions beyond the bug fix
- UI/UX design changes beyond the fix
- Performance optimizations
- Documentation updates
- New module types or functionality
- Changes to activation system
- Changes to export system
- Changes to codex/persistence system beyond this coordination fix
