APPROVED

# Sprint Contract — Round 11

## Scope

Remediation sprint to fix the critical Welcome Modal state persistence bug identified in Round 10 QA. The modal reappears after dismissal due to a localStorage structure mismatch. This is a narrow, well-defined fix.

## Spec Traceability

- **P0 items covered this round:**
  - Welcome Modal state persistence (AC2 from Round 10)
  - Activation Sequence verification (AC3 from Round 10, blocked by AC2)

- **P1 items covered this round:**
  - None — remediation only

- **Remaining P0/P1 after this round:**
  - All Round 10 P0 items should be resolved
  - No new P0/P1 introduced

- **P2 items intentionally deferred:**
  - All P2 items remain deferred from prior rounds

## Deliverables

1. **`src/components/Tutorial/WelcomeModal.tsx`**
   - Fix `getInitialHasSeenWelcome()` function to read `parsed.hasSeenWelcome` instead of `parsed.state?.hasSeenWelcome`
   - Ensure `useWelcomeModal` hook exports remain functional

2. **`src/__tests__/ModalPersistence.test.tsx`**
   - Update localStorage mock to return `{ hasSeenWelcome: true }` (without `state` wrapper) to match actual Zustand persist behavior

3. **`src/__tests__/WelcomeModal.test.tsx`** (if exists)
   - Update any localStorage mocks in related tests

## Acceptance Criteria

1. **AC2: Welcome Modal State Persistence** — Modal does NOT reappear after dismissal and page refresh
   - Open app in fresh browser → Modal appears
   - Click "Skip & Explore" → Modal hides
   - Refresh page → Modal stays hidden
   - Verify `localStorage` contains `hasSeenWelcome: true` at `arcane-codex-tutorial` key

2. **AC3: Activation Sequence** — Activation button is accessible and machine activates
   - Generate a machine via random forge
   - Click "Activate Machine" button
   - Activation overlay appears and plays through phases: idle → charging → activating → online
   - No modal blocks the button

3. **Build & Tests Pass**
   - `npm run build` succeeds with no TypeScript errors
   - All 874+ existing tests pass
   - New/updated tests pass

## Test Methods

1. **Browser verification for AC2:**
   - Open dev tools → Application → Local Storage
   - Find key `arcane-codex-tutorial`
   - Verify JSON structure: `{ hasSeenWelcome: true, isTutorialEnabled: false }` (no `state` wrapper)

2. **Browser verification for AC3:**
   - Load page, dismiss welcome modal
   - Click random forge button
   - Click "▶ 激活机器" button
   - Verify activation overlay appears and animates through phases

3. **Unit test verification:**
   - Run `npm test -- --testPathPattern=ModalPersistence`
   - Run `npm test -- --testPathPattern=WelcomeModal`
   - All tests pass

## Risks

1. **Low Risk: Simple state reading fix**
   - Changing `parsed.state?.hasSeenWelcome` to `parsed.hasSeenWelcome` is a one-line fix per location
   - Only affects the localStorage read path, no side effects

2. **Low Risk: Test mock updates**
   - Updating test mocks to match actual Zustand behavior should make tests more accurate
   - May require reviewing other test files that mock localStorage

3. **Medium Risk: Undiscovered issues**
   - There may be other code paths that expect the wrong localStorage structure
   - Will verify by running full test suite and browser testing

## Failure Conditions

1. **AC2 still fails** — Modal reappears after dismissal and refresh
2. **AC3 still blocked** — Activation button inaccessible due to modal
3. **Build fails** — TypeScript compilation errors introduced
4. **Tests fail** — New/updated tests do not pass
5. **Regression** — Any previously passing AC fails in this round

## Done Definition

All of the following must be TRUE before claiming round complete:

1. ✅ `WelcomeModal.tsx` `getInitialHasSeenWelcome()` reads `parsed.hasSeenWelcome` (not `parsed.state?.hasSeenWelcome`)
2. ✅ Test mocks updated to match actual Zustand persist format
3. ✅ `npm run build` succeeds (0 TypeScript errors)
4. ✅ All unit tests pass (including updated ModalPersistence tests)
5. ✅ Browser test: Modal stays dismissed after page refresh
6. ✅ Browser test: Activation button accessible and functional

## Out of Scope

- No new features or P2 items will be introduced
- No refactoring beyond the minimal fix required
- No changes to Zustand store configuration
- No changes to activation animation logic (beyond verification)
- No changes to RandomForgeToast (already passing)
