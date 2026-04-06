# Sprint Contract — Round 180

## Scope

Enhancement sprint focused on the Exchange/Trade System. This sprint will:
1. Add trade notification persistence and history improvements
2. Expand test coverage for edge cases in the Exchange system
3. Add trade proposal state management enhancements
4. Improve countdown timer UX for proposals

This is NOT a verification sprint — it includes code changes to improve the Exchange system.

## Spec Traceability

- **P0 (Trade Notifications):** Improve TradeNotification component with persistence, better state management, and visual feedback for trade events.
- **P1 (Exchange System Tests):** Add edge case tests for trade proposal lifecycle, countdown timers, and proposal expiration handling.
- **P0/P1 from previous rounds:** All resolved — Round 179 verified all prior work is stable.
- **P2 intentionally deferred:** Exchange backend integration, real-time trading, multiplayer trade rooms.

## Deliverables

1. **TradeNotification Enhancement** (`src/components/Exchange/TradeNotification.tsx`):
   - Add proposal state tracking (pending → accepted/rejected/expired)
   - Improve visual feedback for different proposal states
   - Add timestamp display for notifications
   - Ensure notifications are dismissible and auto-expire correctly

2. **Exchange Store Enhancement** (`src/store/useExchangeStore.ts`):
   - Add `expireProposal` action to handle proposal expiration
   - Add `getProposalById` selector for looking up specific proposals
   - Improve state persistence for proposals across sessions

3. **New Test File** (`src/components/Exchange/__tests__/TradeNotificationEdgeCases.test.tsx`):
   - Test proposal expiration logic
   - Test countdown timer behavior
   - Test notification dismissal
   - Test multiple simultaneous notifications
   - Test notification state transitions

4. **Updated TradeProposalModal Tests** (`src/components/Exchange/__tests__/TradeProposalModal.test.tsx`):
   - Add tests for proposal submission success/failure
   - Add tests for modal close behavior during submission
   - Add tests for auto-close after submission

## Acceptance Criteria

1. **AC-180-001:** TradeNotification component renders with proper state indicators (pending/accepted/rejected/expired) and correct styling for each state.
2. **AC-180-002:** Exchange store `expireProposal` action marks proposals as expired and removes them from pending lists.
3. **AC-180-003:** All existing Exchange tests pass (`npm test -- --run src/components/Exchange/__tests__/`).
4. **AC-180-004:** New edge case tests for TradeNotification are written and passing.
5. **AC-180-005:** Full test suite passes (`npm test -- --run` exits code 0).
6. **AC-180-006:** TypeScript compiles without errors (`npx tsc --noEmit` exits 0).
7. **AC-180-007:** Bundle size remains ≤ 512 KB (`npm run build` produces bundle ≤ 524,288 bytes).

## Test Methods

1. **AC-180-001 (TradeNotification state rendering):**
   - **Entry state:** Render component with `status="pending"` — assert pending badge visible, yellow styling applied
   - **Accepted state:** Render with `status="accepted"` — assert accepted badge visible, green styling applied
   - **Rejected state:** Render with `status="rejected"` — assert rejected badge visible, red styling applied
   - **Expired state:** Render with `status="expired"` — assert expired badge visible, gray styling applied
   - **Negative assertion:** Render with `status="pending"` — assert accepted/rejected/expired badges are NOT visible
   - **Dismiss workflow:** Click dismiss button — assert notification removed from DOM
   - **Auto-expire:** After countdown reaches 0 — assert status changes to expired, notification removed from pending list
   - **Repeat/reopen:** After dismissing, re-render with same proposalId — assert notification reappears correctly
   - **Method:** `render()` with screen queries, userEvent for interactions, jest timers for countdown

2. **AC-180-002 (expireProposal action):**
   - Create store state with pending proposal (id: "test-proposal-1")
   - Call `expireProposal("test-proposal-1")`
   - **Assert:** Proposal status changed to `'expired'` (check store state)
   - **Assert:** Proposal NOT present in `pendingProposals` array
   - **Negative assertion:** Calling `expireProposal` on non-existent ID should not throw
   - **Negative assertion:** Expired proposal should NOT appear in pending lists
   - **Method:** Store unit test with mock state, direct action dispatch

3. **AC-180-003 (Existing Exchange tests):**
   - Command: `npm test -- --run src/components/Exchange/__tests__/`
   - Expected: All existing tests pass (no regressions)
   - Document: Test file results and any failures

4. **AC-180-004 (New edge case tests):**
   - **Expiration boundary:** Set countdown to exactly 0ms — assert proposal marked expired
   - **Multiple notifications:** Render 3+ simultaneous notifications — assert each renders independently
   - **State transition:** pending → expired, pending → accepted, pending → rejected — assert correct final states
   - **Dismiss during countdown:** Dismiss notification before countdown ends — assert no crash, clean removal
   - **Null/undefined handling:** Pass null proposalId — assert component renders fallback or null without crash
   - Command: `npm test -- --run src/components/Exchange/__tests__/TradeNotificationEdgeCases.test.tsx`
   - Expected: All new tests pass

5. **AC-180-005 (Full test suite):**
   - Command: `npm test -- --run`
   - Expected: Exit code 0, all tests pass
   - **Negative assertion:** Exit code must be 0, any non-zero exit fails this criterion

6. **AC-180-006 (TypeScript compilation):**
   - Command: `npx tsc --noEmit`
   - Expected: Exit code 0, 0 errors
   - **Negative assertion:** Any error count > 0 fails this criterion

7. **AC-180-007 (Bundle size):**
   - Command: `npm run build`
   - Check largest JS chunk: `ls dist/assets/*.js | xargs wc -c | sort -n | tail -1`
   - Expected: Largest chunk ≤ 524,288 bytes (512 KB)
   - **Negative assertion:** Bundle exceeding 512 KB fails this criterion

## Risks

1. **Breaking existing functionality:** Changes to TradeNotification and Exchange store could affect existing behavior. Mitigated by running existing tests first (AC-180-003).
2. **State management complexity:** Adding new proposal states (expired) requires careful integration with existing pending/accepted/rejected states. Mitigated by thorough edge case testing.
3. **Test flakiness:** Countdown timer tests may be timing-sensitive. Use appropriate mocking and test boundaries explicitly.

## Failure Conditions

The round MUST fail if ANY of the following conditions are true:

1. `npm test -- --run src/components/Exchange/__tests__/` produces any test failures (regressions).
2. `npm test -- --run` exits non-zero for any reason.
3. TypeScript compilation produces errors (`npx tsc --noEmit` exits non-zero with error count > 0).
4. Bundle exceeds 512 KB (524,288 bytes).
5. TradeNotification component breaks existing rendering (regression).
6. Exchange store changes break existing functionality (regression).
7. Any new test introduced fails to pass.
8. TradeNotification crashes when given null/undefined props.
9. Notification dismissal leaves DOM elements behind.

## Done Definition

ALL of the following must be true before the builder may claim the round complete:

1. TradeNotification component enhanced with state indicators and proper styling.
2. Exchange store has `expireProposal` action implemented and tested.
3. All existing Exchange tests pass (no regressions).
4. New `TradeNotificationEdgeCases.test.tsx` file created with passing tests.
5. `npm test -- --run` exits with code 0 (full suite passes).
6. `npx tsc --noEmit` exits with code 0 (0 TypeScript errors).
7. Bundle size ≤ 512 KB.
8. **No "即将推出" badges or placeholder UI** — all changes are functional.
9. TradeNotification negative assertions verified (null props don't crash, dismissal cleans DOM).

## Out of Scope

- Changes to AI settings or provider functionality
- Community gallery modifications
- Tech tree or achievement system changes
- Canvas or circuit editing improvements
- Backup/recovery system changes
- Tutorial system changes
- Exchange backend or real trading features
- Bundle-splitting or major architecture changes
- Performance optimization beyond ensuring bundle stays ≤ 512 KB

---

**Operator Inbox Instructions (Round 180):**

- This is an enhancement sprint focused on Exchange/Trade System improvements.
- Start by running existing Exchange tests to establish baseline: `npm test -- --run src/components/Exchange/__tests__/`
- If any existing tests fail, STOP and investigate — do not proceed with changes that break existing functionality.
- Implement TradeNotification enhancements first, then Exchange store additions, then tests.
- Write new tests BEFORE final verification to ensure test-driven approach.
- All seven acceptance criteria must be met before claiming round completion.
- If any acceptance criterion fails, document the failure and fail the round.

---

**APPROVED**
