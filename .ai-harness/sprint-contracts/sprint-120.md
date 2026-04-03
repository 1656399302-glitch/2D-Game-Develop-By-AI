APPROVED

# Sprint Contract — Round 120

## Scope

Enhance the Exchange/Trade System to create a complete, interactive trading experience with simulated incoming proposals, proposal responses, and improved notification integration.

## Spec Traceability

### P0 items covered this round
1. **Exchange System Enhancement** — Add simulated incoming proposals (AI traders) that periodically arrive, allowing users to accept/reject trade offers
2. **Trade Notification System** — Integrate TradeNotification component with Exchange system for incoming proposals, acceptances, and rejections
3. **Exchange Store Improvements** — Add `getIncomingPendingProposals` usage, implement auto-accept/demo accept flow for testing

### P1 items covered this round
1. **TradeProposalModal Enhancement** — Add support for accepting/rejecting incoming proposals
2. **ExchangePanel Integration** — Display incoming proposals section with accept/reject buttons
3. **Exchange System Tests** — Add tests for incoming proposals, proposal acceptance, and notification flow

### Remaining P0/P1 after this round
- All P0/P1 items from spec are covered by previous rounds
- Exchange system enhancement brings it from "MVP demo" to "interactive demo" level

### P2 intentionally deferred
- Backend server integration for real multiplayer trading
- WebSocket/real-time proposal notifications
- Trade reputation/scoring system

## Deliverables

1. **Enhanced Exchange Store** (`src/store/useExchangeStore.ts`)
   - Add `simulateIncomingProposal()` method for demo/testing
   - Add `acceptIncomingProposal()` action
   - Add `rejectIncomingProposal()` action
   - Improve notification integration

2. **ExchangeButton Component Enhancement** (`src/components/Exchange/ExchangeButton.tsx`)
   - Show badge with incoming proposal count
   - Visual indicator when new proposals arrive

3. **Incoming Proposals UI** (integrated into `src/components/Exchange/ExchangePanel.tsx`)
   - New "收到的报价" (Incoming Offers) tab or section
   - Accept/Reject buttons for each proposal
   - Proposal countdown timer (demo simulation)

4. **TradeNotification Component** (`src/components/Exchange/TradeNotification.tsx`)
   - Integrate with incoming proposal events
   - Toast notifications for new proposals

5. **New Tests** (`src/components/Exchange/__tests__/`)
   - `exchangeStore.test.ts` — Tests for incoming proposal logic (add to existing)
   - `ExchangePanel.test.tsx` — Tests for incoming proposals UI (add to existing)
   - `TradeNotification.test.tsx` — Tests for notification integration (add to existing)

## Acceptance Criteria

### AC-120-001: Simulated Incoming Proposals
**Statement**: Exchange store can generate simulated incoming proposals from "AI traders" that appear periodically; users can accept or reject these proposals.

**Verification**:
1. Call `simulateIncomingProposal()` and verify an `incomingProposals` array contains new entry with status 'pending'
2. Verify `getIncomingPendingProposals()` returns count ≥ 1 after simulation
3. Call `acceptIncomingProposal(proposalId)` and verify trade is recorded in `tradeHistory`
4. Call `rejectIncomingProposal(proposalId)` and verify proposal status changes to 'rejected'

### AC-120-002: ExchangeButton Badge
**Statement**: ExchangeButton displays badge with count of pending incoming proposals when count > 0.

**Verification**:
1. Render ExchangeButton with 0 incoming proposals → no badge element rendered
2. Render ExchangeButton with 2 incoming proposals → badge element visible with text "2"
3. Click badge → ExchangePanel opens (visible in DOM)

### AC-120-003: Incoming Proposals in ExchangePanel
**Statement**: ExchangePanel displays incoming proposals section with machine preview, accept/reject buttons, and countdown timer.

**Verification**:
1. With ≥1 incoming proposal → "收到的报价" section visible in ExchangePanel
2. Each proposal card shows: proposer machine name, rarity badge, accept button, reject button
3. Click "接受" → `acceptIncomingProposal` called, success notification visible, proposal removed from incoming list
4. Click "拒绝" → `rejectIncomingProposal` called, proposal removed from incoming list

### AC-120-004: Notification Integration
**Statement**: TradeNotification component displays notifications for incoming proposals, acceptances, and rejections.

**Verification**:
1. Create incoming proposal → toast notification appears with message containing "交易报价"
2. Accept proposal → toast notification appears with message containing "成功" or "accepted"
3. Reject proposal → toast notification appears with message containing "拒绝" or "rejected"

### AC-120-005: Trade History After Exchange
**Statement**: Completed trades (from accepting incoming proposals) appear in trade history.

**Verification**:
1. Accept incoming proposal → verify `tradeHistory` array has new entry with both giverId and receiverId
2. Open ExchangePanel → navigate to Trade History tab → completed trade card visible with machine names
3. Verify trade card shows both the machine given and machine received

### AC-120-006: Regression Test
**Statement**: All 4958 existing tests pass (0 failures); no regression in functionality.

**Verification**:
```bash
npm test -- --run 2>&1 | tail -10
```
**Expected**: Test Files 186+ passed, Tests 4958+ passed, 0 failures, 0 skipped

## Test Methods

### AC-120-001: Simulated Incoming Proposals
**Test File**: `src/components/Exchange/__tests__/exchangeStore.test.ts`
```typescript
describe('incoming proposals', () => {
  it('creates incoming proposal on simulateIncomingProposal', () => {
    const { result } = renderHook(() => useExchangeStore());
    act(() => { result.current.simulateIncomingProposal(); });
    expect(result.current.incomingProposals.length).toBeGreaterThan(0);
    expect(result.current.incomingProposals[0].status).toBe('pending');
  });

  it('accepts incoming proposal and records trade', () => {
    // Setup: create incoming proposal
    // Action: acceptIncomingProposal(proposalId)
    // Assert: proposal status = 'accepted', tradeHistory has entry
  });

  it('rejects incoming proposal', () => {
    // Setup: create incoming proposal
    // Action: rejectIncomingProposal(proposalId)
    // Assert: proposal status = 'rejected'
  });
});
```

### AC-120-002: ExchangeButton Badge
**Test File**: `src/components/Exchange/__tests__/ExchangeButton.test.tsx`
```typescript
describe('incoming proposals badge', () => {
  it('does not render badge when no incoming proposals', () => {
    useExchangeStore.mockReturnValue({ incomingProposals: [], getIncomingPendingProposals: () => [] });
    render(<ExchangeButton />);
    expect(screen.queryByRole('button', { name: /badge/i })).toBeNull();
  });

  it('renders badge with count when incoming proposals exist', () => {
    useExchangeStore.mockReturnValue({ 
      incomingProposals: [{ id: '1' }, { id: '2' }], 
      getIncomingPendingProposals: () => [{ id: '1' }, { id: '2' }] 
    });
    render(<ExchangeButton />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
```

### AC-120-003: Incoming Proposals in ExchangePanel
**Test File**: `src/components/Exchange/__tests__/ExchangePanel.test.tsx`
```typescript
describe('incoming proposals section', () => {
  it('displays incoming offers section when proposals exist', () => {
    useExchangeStore.mockReturnValue({ 
      incomingProposals: [{ id: '1', proposerName: 'AI Trader Alpha', status: 'pending' }] 
    });
    render(<ExchangePanel />);
    expect(screen.getByText('收到的报价')).toBeInTheDocument();
  });

  it('accept button calls acceptIncomingProposal', () => {
    // Mock store with proposal
    // Render ExchangePanel
    // Click accept button
    // Assert acceptIncomingProposal was called with proposal id
  });

  it('reject button calls rejectIncomingProposal', () => {
    // Mock store with proposal
    // Render ExchangePanel
    // Click reject button
    // Assert rejectIncomingProposal was called with proposal id
  });
});
```

### AC-120-004: Notification Integration
**Test File**: `src/components/Exchange/__tests__/TradeNotification.test.tsx`
```typescript
describe('proposal notifications', () => {
  it('shows notification for incoming proposal', () => {
    render(<TradeNotification type="incoming_proposal" />);
    expect(screen.getByText(/交易报价/i)).toBeInTheDocument();
  });

  it('shows notification for accepted proposal', () => {
    render(<TradeNotification type="proposal_accepted" />);
    expect(screen.getByText(/成功/i)).toBeInTheDocument();
  });

  it('shows notification for rejected proposal', () => {
    render(<TradeNotification type="proposal_rejected" />);
    expect(screen.getByText(/拒绝/i)).toBeInTheDocument();
  });
});
```

### AC-120-005: Trade History After Exchange
**Test File**: `src/components/Exchange/__tests__/ExchangePanel.test.tsx` (add to existing)
```typescript
describe('trade history after incoming proposal acceptance', () => {
  it('shows completed trade in history after acceptance', async () => {
    // Setup: mock exchange store with incoming proposal
    // Render ExchangePanel
    // Click accept button
    // Switch to Trade History tab
    // Assert trade card visible with both machine names
  });
});
```

### AC-120-006: Regression Test
```bash
npm test -- --run 2>&1 | grep -E "Test Files|Tests|passed|failed"
```

## Risks

1. **Store State Complexity** — Adding incoming proposals adds complexity to store state; need to ensure proper state isolation in tests
2. **Timer Management** — Simulated proposal expiration uses timers; must clean up in tests to avoid flakiness
3. **Mock Dependencies** — Tests mock multiple stores; careful to maintain mock consistency across test cases
4. **Bundle Size** — Adding new UI components may increase bundle; must stay ≤512KB
5. **Existing Test Interference** — Adding tests to existing test files must not break existing test cases

## Failure Conditions

1. **Test Failures** — Any new test failing means the round is incomplete
2. **Regression** — If existing 4958 tests drop below 4958 passing, round fails
3. **TypeScript Errors** — `npx tsc --noEmit` must exit with code 0
4. **Build Errors** — `npm run build` must complete without errors
5. **Bundle Size** — Main bundle must remain ≤512KB
6. **Broken Functionality** — If existing Exchange system (listings, outgoing proposals) breaks, round fails
7. **Missing Deliverables** — If any deliverable listed in this contract is not implemented, round fails

## Done Definition

All of the following must be TRUE before claiming round complete:

1. `npm test -- --run` shows ≥4958 tests passing (4958 baseline + new tests)
2. `npx tsc --noEmit` exits with code 0
3. `npm run build` completes successfully with bundle ≤512KB
4. `simulateIncomingProposal()` creates incoming proposal with status 'pending'
5. `acceptIncomingProposal()` updates proposal status to 'accepted' and adds entry to `tradeHistory`
6. `rejectIncomingProposal()` updates proposal status to 'rejected'
7. ExchangeButton renders badge with correct count when `getIncomingPendingProposals()` returns items
8. ExchangePanel displays "收到的报价" section with accept/reject buttons
9. TradeNotification displays appropriate messages for incoming/accepted/rejected proposals
10. Trade History tab shows completed trades with correct machine names

## Out of Scope

- Real backend/server integration for multiplayer trading
- WebSocket or real-time notification delivery
- Trade reputation or scoring system
- Multi-user proposal management
- Proposal expiration automation (beyond demo simulation)
- Mobile-specific optimizations for Exchange UI
- Export/import of trade history
- Changes to other Exchange functionality (listings, outgoing proposals, marketplace browsing)
