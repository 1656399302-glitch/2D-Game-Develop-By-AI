# Sprint Contract — Round 98

## Scope

Add comprehensive unit test coverage for `useExchangeStore` (Zustand store for the Codex Exchange System). This store manages trade listings, proposals, and trade history. The existing test file at `src/store/__tests__/useExchangeStore.test.ts` has partial coverage and requires expansion to achieve comprehensive test coverage.

## Spec Traceability

### P0 items covered this round
- **Exchange Store Testing** (expansion): Expand `src/store/__tests__/useExchangeStore.test.ts` with comprehensive coverage for all store methods not yet tested

### P1 items covered this round
- None (P0 focus for this round)

### Remaining P0/P1 after this round
- All major P0/P1 features already implemented and tested

### P2 intentionally deferred
- Additional UI polish
- Performance micro-optimizations
- Extended animation refinements

## Deliverables

1. **Expanded file: `src/store/__tests__/useExchangeStore.test.ts`**
   - Expand existing test suite for the Exchange Store
   - Add coverage for methods currently untested: `acceptProposal`, `rejectProposal`, `getProposal`, `getMyPendingProposals`, `getIncomingPendingProposals`, `getTradeableCommunityMachines`, `hasPendingProposals`, `getMyListedMachines`
   - Add edge case tests and negative assertions

## Acceptance Criteria

1. **AC-EXCHANGE-001**: `markForTrade()` adds listing to state and `isListed()` returns true
2. **AC-EXCHANGE-002**: `unmarkFromTrade()` removes listing and `isListed()` returns false
3. **AC-EXCHANGE-003**: `createProposal()` creates proposal with correct structure and status
4. **AC-EXCHANGE-004**: `acceptProposal()` updates proposal status, adds machine to codex, and returns true on success
5. **AC-EXCHANGE-005**: `rejectProposal()` updates proposal status to rejected
6. **AC-EXCHANGE-006**: `getMyPendingProposals()` returns only pending outgoing proposals
7. **AC-EXCHANGE-007**: `getIncomingPendingProposals()` returns only pending incoming proposals
8. **AC-EXCHANGE-008**: `recordTrade()` adds entry to trade history
9. **AC-EXCHANGE-009**: Notification methods work correctly (add, markRead, clear, unread count)
10. **AC-EXCHANGE-010**: `getTradeableCommunityMachines()` returns community machines
11. **AC-EXCHANGE-011**: `hasPendingProposals()` correctly reports pending proposal count
12. **AC-EXCHANGE-012**: `getMyListedMachines()` returns user's listed machines from codex
13. **AC-EXCHANGE-013**: `getProposal()` retrieves specific proposal by ID from either incoming or outgoing
14. **Regression**: All existing 3,582 tests continue to pass
15. **Regression**: Build size ≤ 560KB

## Test Methods

### Store Initialization Tests
- Test initial state values (empty arrays, hydration state)
- Verify `setHydrated()` updates hydration state correctly

### Listing Management Tests
- `markForTrade()`: Add listing, verify listing added to state, verify no duplicates
- `markForTrade()`: Custom trade preference is preserved
- `unmarkFromTrade()`: Remove listing, verify removal
- `isListed()`: Return true for listed machines, false for unlisted machines
- `isListed()`: Should not remain true after unmarkFromTrade
- `getMyListedMachines()`: Return user's listed machines from codex filtered by listing IDs

### Proposal Management Tests
- `createProposal()`: Create proposal, verify structure (id, status, timestamps)
- `createProposal()`: Return null for non-existent codex entry
- `acceptProposal()`: Update status to accepted, call codexStore.addEntry, call codexStore.removeEntry, return true
- `acceptProposal()`: Should not succeed for non-pending proposals, return false
- `acceptProposal()`: Should not succeed for non-existent proposal, return false
- `acceptProposal()`: Add notification on success
- `rejectProposal()`: Update status to rejected
- `rejectProposal()`: Add notification on rejection
- `getProposal()`: Retrieve specific proposal by ID from incoming proposals
- `getProposal()`: Retrieve specific proposal by ID from outgoing proposals
- `getProposal()`: Return undefined for non-existent proposal ID
- `getMyPendingProposals()`: Filter and return only pending outgoing proposals
- `getMyPendingProposals()`: Should not include accepted/rejected proposals
- `getIncomingPendingProposals()`: Filter and return only pending incoming proposals
- `getIncomingPendingProposals()`: Should not include accepted/rejected proposals

### Trade History Tests
- `recordTrade()`: Add trade to history with correct structure (givenMachine, receivedMachine, completedAt)
- `recordTrade()`: Prepends to history (most recent first)
- `getTradeHistory()`: Return trade history array

### Notification Tests
- `addNotification()`: Add notification with auto-generated id and createdAt timestamp
- `addNotification()`: Notifications are prepended (newest first)
- `addNotification()`: Notification limit (max 50) enforced - older notifications should not remain
- `markNotificationRead()`: Update read status to true
- `markNotificationRead()`: Should not affect other notifications
- `clearNotifications()`: Empty notifications array
- `getUnreadCount()`: Return count of unread notifications
- `getUnreadCount()`: Return 0 when all notifications are read

### Computed/Misc Tests
- `getTradeableCommunityMachines()`: Return combined communityMachines and publishedMachines
- `hasPendingProposals()`: Return true when incoming pending proposals exist
- `hasPendingProposals()`: Return true when outgoing pending proposals exist
- `hasPendingProposals()`: Return false when no pending proposals
- Hydration helpers: `hydrateExchangeStore` function exists, `isExchangeHydrated()` returns boolean

### Edge Case Tests
- `acceptProposal()` with non-existent proposal ID should return false and not crash
- `rejectProposal()` with non-existent proposal ID should not crash
- `createProposal()` for already-listed machine should still create proposal (separate from listing state)
- Empty codex when calling `getMyListedMachines()` returns empty array
- Notification with empty/undefined message handled gracefully

## Risks

1. **Hydration complexity**: The store uses `persist` middleware with `skipHydration`, tests must handle hydration manually by setting `isHydrated: true` in beforeEach
2. **UUID generation**: Tests must mock or handle uuidv4 for predictable proposal IDs using `vi.hoisted()`
3. **Cross-store dependencies**: Store interacts with `useCodexStore` and `useCommunityStore`, tests must mock these using `vi.mock()`
4. **State reset between tests**: Must use `beforeEach` to reset store state to prevent test pollution

## Failure Conditions

1. Any new test fails
2. Existing test suite falls below 3,582 tests
3. Build size exceeds 560KB
4. TypeScript compilation errors introduced
5. More than 30 minutes test execution time

## Done Definition

- [ ] All 13 acceptance criteria have passing tests
- [ ] Test file follows existing project conventions (Vitest, vi.hoisted, vi.mock, beforeEach cleanup)
- [ ] All existing 3,582 tests continue to pass
- [ ] Build succeeds with size ≤ 560KB
- [ ] TypeScript compilation succeeds with 0 errors
- [ ] At least 40 new tests added (expanding existing test suite)
- [ ] Test file uses `describe` blocks matching store method groupings
- [ ] All edge cases and negative assertions covered

## Out of Scope

- UI component tests for ExchangePanel, TradeProposalModal, or ExchangeButton
- Integration tests with actual localStorage persistence
- Testing cross-store integration side effects (useCodexStore mutations via Exchange actions)
- Mock server/network simulation for "real" proposal flow
- Changes to production code (store implementation)
- New features beyond Exchange Store testing

---

*Note: The feedback document contained a detailed project brief for "Arcane Machine Codex Workshop" (Chinese: 交互式魔法机械图鉴工坊). This is out of scope for Round 98's Exchange Store testing sprint and should be considered for a future sprint if approved.*
