# Sprint Contract — Round 12

## Scope

**Remediation Round**: Fix Welcome Modal persistence regression introduced in Round 11.

**Root Cause**: Round 11 incorrectly changed `getInitialHasSeenWelcome()` from `parsed.state?.hasSeenWelcome` to `parsed.hasSeenWelcome`. Zustand persist **DOES** wrap data in a `state` object — the wrapper IS present. Actual localStorage contains: `{"state":{"hasSeenWelcome":true,"isTutorialEnabled":false},"version":0}`. Tests were also updated to match the incorrect behavior.

**Required Fix**: Revert both code AND tests to the correct Zustand persist format with `state` wrapper.

## Spec Traceability

- **P0 item covered this round**: Welcome Modal State Persistence (AC2) — regression remediation
- **Remaining P0/P1 after this round**: None — all previously identified P0/P1 items remain resolved
- **P2 intentionally deferred**: All P2 items remain deferred from prior rounds

## Deliverables

1. **`src/components/Tutorial/WelcomeModal.tsx`** — Revert `getInitialHasSeenWelcome()` to:
   ```typescript
   return parsed.state?.hasSeenWelcome === true;
   ```
   (Was incorrectly changed to `parsed.hasSeenWelcome` in Round 11)

2. **`src/__tests__/ModalPersistence.test.tsx`** — Revert test mocks to correct Zustand persist format:
   ```typescript
   { state: { hasSeenWelcome: true, isTutorialEnabled: false }, version: 0 }
   ```
   (Was incorrectly changed to `{ hasSeenWelcome: true }` in Round 11)

3. **No new comments needed** — code should match the correct Zustand persist structure

## Acceptance Criteria

1. **AC1**: `getInitialHasSeenWelcome()` reads `parsed.state?.hasSeenWelcome` (not `parsed.hasSeenWelcome`)
2. **AC2**: Welcome modal stays dismissed after page refresh — dismiss → refresh → no modal
3. **AC3**: Activation button accessible after refresh (enabled by AC2)

## Test Methods

1. **Browser Verification (Primary)**:
   - Open app fresh → modal appears
   - Click "Skip & Explore" → modal dismisses
   - Check localStorage: `{"state":{"hasSeenWelcome":true,"isTutorialEnabled":false},"version":0}`
   - Verify top-level keys are `["state", "version"]` — confirming `state` wrapper is present
   - Refresh page → modal does NOT appear

2. **Unit Test Verification**:
   - Run `npm test` — all existing tests pass
   - Test mocks must use `{ state: { hasSeenWelcome: true, isTutorialEnabled: false }, version: 0 }`
   - Verify tests assert against `parsed.state?.hasSeenWelcome`

3. **Build Verification**:
   - Run `npm run build` — succeeds with 0 TypeScript errors

## Risks

1. **Very Low**: This is a targeted rollback, not new code
2. **No architectural changes** — only reverting data access paths
3. **Historical context**: The original code (pre-Round 11) was correct; reverting to it

## Failure Conditions

1. `npm run build` fails
2. `npm test` fails
3. Modal reappears after page refresh (AC2 fails)
4. Code still reads `parsed.hasSeenWelcome` without `state?.` accessor
5. Test mocks still use `{ hasSeenWelcome: true }` format without `state` wrapper

## Done Definition

All of the following must be true:

1. `getInitialHasSeenWelcome()` returns `parsed.state?.hasSeenWelcome === true`
2. Test mocks use format `{ state: { hasSeenWelcome: true, isTutorialEnabled: false }, version: 0 }`
3. `npm run build` succeeds with 0 TypeScript errors
4. `npm test` passes all tests
5. **Browser verified**: Modal does NOT reappear after dismiss + refresh (AC2 passes)
6. **Browser verified**: localStorage contains `state.hasSeenWelcome: true` — the `state` wrapper IS present

## Out of Scope

- No new features or functionality
- No changes to Zustand store configuration (was always correct)
- No changes to how `hasSeenWelcome` is persisted
- No changes to activation sequence or other features that already pass
- No changes to RandomForgeToast (AC1 from Round 10)

---

**APPROVED**
