# Sprint Contract — Round 99

## Scope

Add comprehensive UI component tests for the Exchange System components. This round completes test coverage for the Exchange feature by covering `TradeProposalModal`, `TradeNotification`, and expanding `ExchangePanel` tests.

## Spec Traceability

### P0 items covered this round
- **Exchange UI Testing**: Expand test coverage for `ExchangePanel`, `TradeProposalModal`, and `TradeNotification` components

### P1 items covered this round
- None (P0 focus for this round)

### Remaining P0/P1 after this round
- All Exchange system P0/P1 items now have complete test coverage (store + UI)

### P2 intentionally deferred
- Integration tests with real store persistence
- E2E tests for full trading workflow
- Additional animation/interaction tests

## Deliverables

1. **New file: `src/components/Exchange/__tests__/TradeProposalModal.test.tsx`**
   - Comprehensive test coverage for TradeProposalModal component (minimum 15 tests)
   - Tests for: render, close button, empty state, machine selection, preview display, submit button states, success state, error handling, rarity badges

2. **New file: `src/components/Exchange/__tests__/TradeNotification.test.tsx`**
   - Comprehensive test coverage for TradeNotification component (minimum 10 tests)
   - Tests for: no notifications state, incoming notification display, quick accept/reject buttons, notification dismissal, auto-mark-as-read, multiple notification handling

3. **Expanded file: `src/components/Exchange/__tests__/ExchangePanel.test.tsx`**
   - Expand from 4 tests to comprehensive coverage (minimum 25 tests total)
   - Add tests for: listings tab operations, browse trades tab with filters, trade history, tab switching, empty states, machine selection

## Acceptance Criteria

### TradeProposalModal Tests (AC-EXCHANGE-UI-001 through AC-EXCHANGE-UI-010)
1. **AC-EXCHANGE-UI-001**: `TradeProposalModal` renders with target machine info (name, rarity, stats) and close button (×) visible in header
2. **AC-EXCHANGE-UI-002**: `TradeProposalModal` shows empty state message "你的图鉴中没有挂牌的机器" when user has no listed machines
3. **AC-EXCHANGE-UI-003**: `TradeProposalModal` machine selection dropdown populates with all machines from `getMyListedMachines()`
4. **AC-EXCHANGE-UI-004**: `TradeProposalModal` shows selected machine preview with name, rarity badge, and module count when chosen
5. **AC-EXCHANGE-UI-005**: `TradeProposalModal` submit button disabled when no machine selected or when `isSubmitting` is true
6. **AC-EXCHANGE-UI-006**: `TradeProposalModal` shows success state after submission and auto-closes after 2000ms
7. **AC-EXCHANGE-UI-007**: `TradeProposalModal` calls `createProposal(selectedMachineId, targetMachine)` on submit with correct parameters
8. **AC-EXCHANGE-UI-008**: `TradeProposalModal` shows error alert with text "创建交易失败，请重试" when proposal creation fails
9. **AC-EXCHANGE-UI-009**: `TradeProposalModal` close button calls `onClose` prop when clicked
10. **AC-EXCHANGE-UI-010**: `TradeProposalModal` Common rarity shows gray badge with "普通" text; Legendary rarity shows amber badge with "传奇" text

### TradeNotification Tests (AC-EXCHANGE-UI-011 through AC-EXCHANGE-UI-018)
11. **AC-EXCHANGE-UI-011**: `TradeNotification` returns null (renders nothing) when `notifications` is empty array or all have `isRead: true`
12. **AC-EXCHANGE-UI-012**: `TradeNotification` displays most recent unread notification from `notifications` array with icon (📥 for incoming proposal)
13. **AC-EXCHANGE-UI-013**: `TradeNotification` shows title text "收到交易请求" and notification message with proposer machine name
14. **AC-EXCHANGE-UI-014**: `TradeNotification` incoming notification shows "接受" button that calls `acceptProposal` with proposal ID and `markNotificationRead` with notification ID
15. **AC-EXCHANGE-UI-015**: `TradeNotification` incoming notification shows "拒绝" button that calls `rejectProposal` with proposal ID and `markNotificationRead` with notification ID
16. **AC-EXCHANGE-UI-016**: `TradeNotification` dismiss button (×) calls `markNotificationRead` with notification ID
17. **AC-EXCHANGE-UI-017**: `TradeNotification` displays count indicator "(N)" when multiple unread notifications exist
18. **AC-EXCHANGE-UI-018**: After dismissing one notification, `TradeNotification` displays next most recent unread notification

### ExchangePanel Tests (AC-EXCHANGE-UI-019 through AC-EXCHANGE-UI-028)
19. **AC-EXCHANGE-UI-019**: `ExchangePanel` shows three tabs: "我的挂牌", "浏览交易", "交易历史" with active tab having purple underline indicator
20. **AC-EXCHANGE-UI-020**: `ExchangePanel` listings tab machine selection dropdown shows codex entries not already listed
21. **AC-EXCHANGE-UI-021**: `ExchangePanel` listings tab "挂牌" button calls `markForTrade` with selected entry ID; disabled when no entry selected
22. **AC-EXCHANGE-UI-022**: `ExchangePanel` listings tab listed machine shows "下架" button that calls `unmarkFromTrade` with entry ID
23. **AC-EXCHANGE-UI-023**: `ExchangePanel` browse trades tab has faction filter dropdown with all 6 factions selectable and rarity filter dropdown with all rarities selectable
24. **AC-EXCHANGE-UI-024**: `ExchangePanel` browse trades tab community machines grid displays filtered results with "出价交易" button per machine
25. **AC-EXCHANGE-UI-025**: `ExchangePanel` browse trades tab "出价交易" button opens TradeProposalModal (disabled when user has no listed machines)
26. **AC-EXCHANGE-UI-026**: `ExchangePanel` trade history tab shows completed trades with given machine, received machine, timestamp, and rarity badges
27. **AC-EXCHANGE-UI-027**: `ExchangePanel` shows correct empty state messages: "暂无挂牌的机器" (listings), "没有找到符合条件的机器" (browse), "暂无交易记录" (history)
28. **AC-EXCHANGE-UI-028**: `ExchangePanel` close button calls `onClose` prop when clicked

### Regression Tests
29. **Regression-001**: All existing 3,668 tests continue to pass
30. **Regression-002**: Build size ≤ 560KB

## Test Methods

### TradeProposalModal Test Verification

#### T1.1: Component Existence and Props
- Verify component file exists at `src/components/Exchange/TradeProposalModal.tsx` or `.tsx`
- Verify component accepts props: `targetMachine`, `onClose`, `onSuccess`
- Verify component is lazy-loaded or directly importable for testing

#### T1.2: Render with Target Machine (AC-EXCHANGE-UI-001)
- **Entry**: Render modal with `targetMachine` prop containing `{id: 't1', name: 'Test Machine', rarity: 'legendary', modules: ['m1', 'm2']}`
- **Check**: Screen contains "Test Machine", "legendary" (or rarity badge), close button (×)
- **NEGATIVE**: Modal should not render error boundary crash on valid props

#### T1.3: Empty State (AC-EXCHANGE-UI-002)
- **Entry**: Mock `getMyListedMachines()` to return `[]`
- **Check**: Screen contains "你的图鉴中没有挂牌的机器"
- **NEGATIVE**: Submit button should not be clickable/functional when no machines available

#### T1.4: Machine Selection (AC-EXCHANGE-UI-003, AC-EXCHANGE-UI-004)
- **Entry**: Mock `getMyListedMachines()` to return `[{id: 'm1', name: 'Alpha'}, {id: 'm2', name: 'Beta'}]`
- **Check**: Dropdown shows "Alpha" and "Beta" options
- **Action**: Select "Alpha" from dropdown
- **Check**: Preview shows "Alpha" with rarity badge and module count
- **NEGATIVE**: Preview should not show stale data after selection change

#### T1.5: Submit Button States (AC-EXCHANGE-UI-005)
- **Entry**: Render with valid machines available, no selection made
- **Check**: Submit button has `disabled` attribute or aria-disabled="true"
- **Action**: Select a machine
- **Check**: Submit button is enabled
- **Action**: Click submit, verify `isSubmitting` becomes true
- **Check**: Submit button becomes disabled during submission
- **NEGATIVE**: Submit button should not be re-clickable during submission (prevent double-submit)

#### T1.6: Submission Success (AC-EXCHANGE-UI-006, AC-EXCHANGE-UI-007)
- **Entry**: Mock `createProposal` to resolve successfully
- **Action**: Select machine and click submit
- **Check**: `createProposal(selectedMachineId, targetMachine)` called with correct args
- **Check**: Success message/state displayed
- **Check**: Modal auto-closes after 2000ms (use `vi.useFakeTimers()` + `vi.advanceTimersByTime(2000)`)
- **NEGATIVE**: Success state should not show duplicate success messages on re-render

#### T1.7: Submission Error (AC-EXCHANGE-UI-008)
- **Entry**: Mock `createProposal` to reject with error
- **Action**: Select machine and click submit
- **Check**: Error alert visible with text "创建交易失败，请重试"
- **NEGATIVE**: Error state should clear when user attempts re-submission

#### T1.8: Close Button (AC-EXCHANGE-UI-009)
- **Action**: Click close button (×)
- **Check**: `onClose` called exactly once
- **NEGATIVE**: Modal should not remain visible after onClose is called

#### T1.9: Rarity Badges (AC-EXCHANGE-UI-010)
- **Test Common**: With `rarity: 'common'`, verify gray badge with "普通" text
- **Test Legendary**: With `rarity: 'legendary'`, verify amber badge with "传奇" text
- **NEGATIVE**: Badge should not show wrong rarity color for given rarity

### TradeNotification Test Verification

#### T2.1: No Notifications State (AC-EXCHANGE-UI-011)
- **Entry**: Render with `notifications: []`
- **Check**: Component returns null (container has no child elements)
- **Entry**: Render with `notifications: [{id: 'n1', isRead: true, ...}]`
- **Check**: Component returns null
- **NEGATIVE**: Component should not render notification list when no unread notifications exist

#### T2.2: Incoming Notification Display (AC-EXCHANGE-UI-012, AC-EXCHANGE-UI-013)
- **Entry**: Render with `notifications: [{id: 'n1', type: 'incoming_proposal', isRead: false, message: 'Alpha wants to trade', proposal: {id: 'p1'}}]`
- **Check**: Icon "📥" visible
- **Check**: Title "收到交易请求" visible
- **Check**: Message "Alpha wants to trade" visible
- **NEGATIVE**: Should not display read notifications

#### T2.3: Quick Accept Action (AC-EXCHANGE-UI-014)
- **Entry**: Mock `acceptProposal` and `markNotificationRead` as jest fns
- **Action**: Click "接受" button
- **Check**: `acceptProposal('p1')` called
- **Check**: `markNotificationRead('n1')` called
- **NEGATIVE**: Buttons should not remain clickable after being clicked once

#### T2.4: Quick Reject Action (AC-EXCHANGE-UI-015)
- **Entry**: Mock `rejectProposal` and `markNotificationRead` as jest fns
- **Action**: Click "拒绝" button
- **Check**: `rejectProposal('p1')` called
- **Check**: `markNotificationRead('n1')` called
- **NEGATIVE**: Buttons should not remain clickable after being clicked once

#### T2.5: Dismiss Action (AC-EXCHANGE-UI-016)
- **Entry**: Mock `markNotificationRead` as jest fn
- **Action**: Click dismiss button (×)
- **Check**: `markNotificationRead('n1')` called
- **NEGATIVE**: Notification should not remain visible after dismiss is clicked

#### T2.6: Multiple Notifications (AC-EXCHANGE-UI-017)
- **Entry**: Render with 3 unread notifications
- **Check**: Count indicator "(3)" visible
- **NEGATIVE**: Count should not include read notifications

#### T2.7: Dismiss and Show Next (AC-EXCHANGE-UI-018)
- **Entry**: Render with 2 unread notifications: n1 (most recent), n2
- **Action**: Dismiss n1
- **Check**: n2 is now displayed
- **NEGATIVE**: Component should not crash when dismissing last notification (should return null)

### ExchangePanel Test Verification

#### T3.1: Tab Navigation (AC-EXCHANGE-UI-019)
- **Entry**: Render ExchangePanel
- **Check**: Three tabs visible: "我的挂牌", "浏览交易", "交易历史"
- **Action**: Click "浏览交易" tab
- **Check**: Tab content changes to browse trades view
- **Check**: Active tab has purple underline indicator
- **NEGATIVE**: Inactive tabs should not have underline indicator

#### T3.2: Listings Tab - Machine Selection (AC-EXCHANGE-UI-020)
- **Entry**: Mock `getMyListedMachines()` returns `[{id: 'l1'}]`, codex has additional machines
- **Check**: Selection dropdown shows codex entries not in 'l1'
- **NEGATIVE**: Dropdown should not show already-listed machines

#### T3.3: Listings Tab - Mark for Trade (AC-EXCHANGE-UI-021)
- **Entry**: Mock `markForTrade` as jest fn
- **Action**: Select a machine from dropdown, click "挂牌"
- **Check**: `markForTrade(entryId)` called with correct ID
- **Check**: "挂牌" button disabled when no entry selected
- **NEGATIVE**: `markForTrade` should not be called with undefined/null ID

#### T3.4: Listings Tab - Unmark from Trade (AC-EXCHANGE-UI-022)
- **Entry**: Mock `unmarkFromTrade` as jest fn, existing listings present
- **Action**: Click "下架" on a listed machine
- **Check**: `unmarkFromTrade(entryId)` called
- **NEGATIVE**: Listed machine should not remain in listed section after unmarkFromTrade

#### T3.5: Listings Tab - Empty State (AC-EXCHANGE-UI-027)
- **Entry**: Mock `getMyListedMachines()` returns `[]`
- **Check**: Empty state shows "暂无挂牌的机器"

#### T3.6: Browse Trades Tab - Filters (AC-EXCHANGE-UI-023)
- **Entry**: Mock `getTradeableCommunityMachines()` returns machines from all factions
- **Check**: Faction filter dropdown has 6 faction options
- **Check**: Rarity filter dropdown has all rarities
- **Action**: Select a faction filter
- **Check**: Grid shows only machines of that faction
- **Action**: Select a rarity filter
- **Check**: Grid shows only machines matching both filters

#### T3.7: Browse Trades Tab - Trade Button (AC-EXCHANGE-UI-024, AC-EXCHANGE-UI-025)
- **Entry**: Community machines available, user has listed machines
- **Check**: Each machine card shows "出价交易" button
- **Action**: Click "出价交易" on a machine
- **Check**: TradeProposalModal opened with target machine
- **Entry**: User has no listed machines
- **Check**: "出价交易" button disabled
- **NEGATIVE**: Trade button should not open modal if user cannot propose

#### T3.8: Browse Trades Tab - No Results (AC-EXCHANGE-UI-027)
- **Entry**: Apply filter that matches no machines
- **Check**: Shows "没有找到符合条件的机器" message

#### T3.9: Trade History Tab (AC-EXCHANGE-UI-026)
- **Entry**: Mock `getTradeHistory()` returns trade entries
- **Check**: Each trade shows given machine name and received machine name
- **Check**: Each trade shows timestamp
- **Check**: Each trade shows rarity badges for both machines
- **Entry**: `getTradeHistory()` returns `[]`
- **Check**: Shows "暂无交易记录"

#### T3.10: Close Button (AC-EXCHANGE-UI-028)
- **Action**: Click close button (×)
- **Check**: `onClose` called exactly once
- **NEGATIVE**: Panel should not remain open after onClose is called

## Risks

1. **Store mocking**: ExchangePanel, TradeProposalModal, and TradeNotification all depend on `useExchangeStore`, `useCodexStore`, and `useCommunityStore`. Must properly mock these stores with `vi.mock()` at module level.

2. **Lazy loading**: TradeProposalModal may be lazy-loaded via `React.lazy()`, requiring `<Suspense>` wrapper or direct component import in tests.

3. **Timer handling**: Success state auto-close uses `setTimeout`, requiring `vi.useFakeTimers()` and `vi.advanceTimersByTime(2000)`.

4. **Type consistency**: Must import proper types from `../../types/exchange` and `../../types` for props and store interfaces.

5. **State isolation**: Each test must reset mocked stores and clear call history in `beforeEach` to prevent pollution between tests.

6. **Component dependencies**: Some components may have additional dependencies (CSS modules, icons) that need mocking.

7. **Test file path**: Tests must be placed in `src/components/Exchange/__tests__/` directory per project convention.

## Failure Conditions

1. Any new test fails (individual test failure)
2. Existing test suite falls below 3,668 tests
3. Build size exceeds 560KB
4. TypeScript compilation errors introduced
5. More than 30 minutes test execution time
6. Components referenced in tests do not exist at expected paths
7. Required props on components are missing or incorrectly typed

## Done Definition

- [ ] TradeProposalModal has comprehensive test coverage (minimum 15 tests)
- [ ] TradeNotification has comprehensive test coverage (minimum 10 tests)
- [ ] ExchangePanel has expanded test coverage (minimum 25 tests total, up from 4)
- [ ] All acceptance criteria (AC-EXCHANGE-UI-001 through AC-EXCHANGE-UI-028) have at least one corresponding test
- [ ] All negative assertions verified: no crashes, no stale state, no double-submits, no remaining visible elements after dismissal
- [ ] All existing 3,668 tests continue to pass
- [ ] Build succeeds with size ≤ 560KB
- [ ] TypeScript compilation succeeds with 0 errors
- [ ] Total new tests: minimum 50 (15 + 10 + 25 = 50)
- [ ] All test files follow existing project conventions (`describe` blocks, `it`/`test` naming, `vi.fn()`, `beforeEach`)
- [ ] All dismissal/reopen paths verified functional
- [ ] All entry/completion/dismissal states covered for stateful UI components

## Out of Scope

- E2E tests with real browser automation
- Testing actual localStorage persistence (covered by hydration tests in store tests)
- Visual regression screenshot tests
- Animation timing tests beyond auto-close timer verification
- Accessibility tests (covered in separate test file if exists)
- Integration with actual backend API (mocked store is sufficient)
- Changes to production code (test-first approach; tests define expected behavior)
- Component implementation/fixes discovered during testing (report only)
- Performance benchmarks or load testing
- Cross-browser compatibility testing

---

**APPROVED** — Round 99 execution approved.

**QA Evaluation — Round 98 Results Used for Context:**
- Verdict: PASS
- Total tests after Round 98: 3,668
- Build size: 485.11 KB (< 560KB threshold)
- Exchange store testing complete; UI testing round begins

**Operator Inbox Instructions:** None detected — contract reviewed and approved as submitted.
