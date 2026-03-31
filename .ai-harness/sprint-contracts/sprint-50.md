# Sprint Contract — Round 50

## APPROVED

## Scope

This round implements a **Codex Exchange System** that enables users to trade machines from their personal codex with community-shared machines. This transforms the codex from a static collection into an active economy where machines have perceived value and can be exchanged.

**Key Components:**
1. Trade Listing — Users can mark codex machines as "available for trade"
2. Exchange Browser — Browse tradeable community machines
3. Trade Proposals — Create, view, accept/reject trade offers
4. Trade History — Track completed exchanges
5. Exchange UI — New toolbar button and modal panel for managing trades

**Architecture Approach:**
- New `useExchangeStore` for trade state management (Zustand + localStorage persistence)
- Trade proposals stored locally with simulated acceptance/rejection
- Integration with existing `useCodexStore` and `useCommunityStore`
- No backend required — all trade simulation works client-side

## Spec Traceability

### P0 Items (Must Implement This Round)
- **Trade Listing:** Mark/unmark codex machines as tradeable, set trade preferences
- **Exchange Browser:** Browse community machines available for trade with filtering by faction/rarity
- **Trade Proposals:** Create offers (select own machine + desired machine), view pending proposals
- **Accept/Reject Trades:** Accept or reject incoming trade proposals
- **Trade History:** Record completed trades with timestamps

### P1 Items (Supporting Infrastructure)
- **Exchange Store:** New Zustand store with persistence for trade state
- **Exchange UI Integration:** Toolbar button, exchange panel/modal
- **Trade Notification:** Toast/banner when new trade proposal arrives
- **Machine Comparison in Exchange:** Compare machines before accepting trade

### Remaining P0/P1 After This Round
- All prior P0/P1 items remain passing (1732+ tests)
- Codex Exchange becomes a new P1 feature
- Community features expanded with trade functionality

### P2 Intentionally Deferred
- Real-time trade matching algorithm
- Trade value/rating system
- AI-powered trade suggestions
- Multi-machine trades (3-way exchanges)

## Deliverables

### 1. Exchange Store (`src/store/useExchangeStore.ts`)
- State: `availableForTrade[]`, `incomingProposals[]`, `outgoingProposals[]`, `tradeHistory[]`
- Actions: `markForTrade()`, `unmarkFromTrade()`, `createProposal()`, `acceptProposal()`, `rejectProposal()`
- Persistence: Zustand persist middleware (`arcane-exchange-storage`)
- Computed: `getMyTradeableMachines()`, `getTradeableCommunityMachines()`, `hasPendingProposals()`

### 2. Exchange Panel Component (`src/components/Exchange/ExchangePanel.tsx`)
- Lazy-loaded modal (code splitting)
- Three tabs: "My Listings", "Browse Trades", "Trade History"
- My Listings: List codex machines marked for trade with unmark button
- Browse Trades: Grid of community machines available for trade with "Offer Trade" button
- Trade History: Table of completed trades with machines exchanged

### 3. Trade Proposal Modal (`src/components/Exchange/TradeProposalModal.tsx`)
- Select machine from YOUR codex (dropdown)
- Shows selected machine stats
- Shows target community machine stats
- Create/Cancel buttons
- Confirmation on submit

### 4. Trade Notification (`src/components/Exchange/TradeNotification.tsx`)
- Toast appears when new proposal received
- Shows proposal details
- Quick accept/reject buttons
- Links to Exchange Panel for full management

### 5. Toolbar Integration (`src/components/Exchange/ExchangeButton.tsx`)
- New "⚖ 交易所" button in toolbar
- Shows badge count for pending proposals
- Opens Exchange Panel

### 6. Trade Proposal Types (`src/types/exchange.ts`)
```typescript
interface TradeProposal {
  id: string;
  proposerMachine: CodexEntry;       // Machine from proposer's codex
  targetMachineId: string;           // Community machine ID
  targetMachine: CommunityMachine;   // Community machine data
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: number;
  respondedAt?: number;
}

interface TradeListing {
  codexEntryId: string;
  listedAt: number;
  tradePreference: string;  // e.g., "any", "faction:solar", "rarity:legendary"
}

interface TradeHistory {
  id: string;
  givenMachine: CodexEntry;
  receivedMachineId: string;
  receivedMachine: CommunityMachine;
  completedAt: number;
}
```

### 7. Tests
- `src/components/Exchange/__tests__/ExchangePanel.test.tsx`
- `src/store/__tests__/useExchangeStore.test.ts`
- Minimum 50 new tests covering exchange functionality

## Acceptance Criteria

1. **AC1 Trade Listing:** User can mark any codex machine as "available for trade" and it appears in Browse Trades
2. **AC2 Browse Trades:** Community machines appear in exchange browser with faction/rarity filtering
3. **AC3 Create Proposal:** User can create a trade proposal selecting own machine + desired community machine
4. **AC4 Accept/Reject:** Pending proposals can be accepted (machine added to codex, given machine removed) or rejected
5. **AC5 Trade History:** Completed trades are recorded and displayed in Trade History tab
6. **AC6 Toolbar Integration:** Exchange button visible in toolbar with pending proposal badge
7. **AC7 Build PASS:** Application builds with 0 TypeScript errors
8. **AC8 Tests PASS:** All existing tests (1732+) plus new exchange tests pass

## Test Methods

### Unit Tests (Automated)
```bash
# Build verification
npm run build

# All tests including new exchange tests
npm test -- --run
```

### Browser Tests (Manual Verification)

#### Trade Listing Flow
1. Open application
2. Create and save a machine to codex
3. Open Exchange Panel via toolbar
4. Click "My Listings" tab
5. Select machine from dropdown
6. Click "List for Trade"
7. Verify machine appears in "Listed Machines" section

#### Browse Trades Flow
1. Open Exchange Panel
2. Click "Browse Trades" tab
3. Verify community machines are displayed
4. Filter by faction (e.g., Solar)
5. Filter by rarity (e.g., Legendary)
6. Verify filtering works correctly

#### Trade Proposal Flow
1. Open Exchange Panel → Browse Trades
2. Click "Offer Trade" on a community machine
3. Select one of YOUR listed machines from dropdown
4. Review both machines' stats
5. Click "Submit Proposal"
6. Verify proposal appears in "Pending Proposals"

#### Accept/Reject Flow
1. With pending proposal created
2. View in "Incoming Proposals" (simulate by creating local proposal)
3. Click "Accept Trade"
4. Verify machine added to YOUR codex
5. Verify YOUR given machine removed from codex
6. Verify trade recorded in History

#### Trade History Flow
1. Complete a trade
2. Open Exchange Panel
3. Click "Trade History" tab
4. Verify completed trade displayed with timestamp

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Trade acceptance removes machine from codex | Medium | High | Add confirmation dialog before accepting |
| Community machines not marked "tradeable" | High | Medium | Seed some community machines as tradeable; add toggle to community store |
| Trade state conflicts with codex deletions | Medium | Medium | Validate machine exists before completing trade |
| New store causes hydration cascade | Low | Medium | Follow existing pattern: manual hydration, useRef for refs |
| Test coverage gaps | Medium | Low | Write comprehensive unit tests for store and components |

## Failure Conditions

This round MUST FAIL if:
1. Build fails with TypeScript errors
2. Any existing test suite fails (regression)
3. Trade acceptance crashes when machine doesn't exist
4. Exchange panel breaks existing codex or community gallery functionality

This round MUST PASS if ALL of the following are true:
1. ✅ Exchange button appears in toolbar
2. ✅ User can mark codex machines as tradeable
3. ✅ Trade proposals can be created with machine selection
4. ✅ Pending proposals can be accepted (adds machine to codex) or rejected
5. ✅ Trade history records completed exchanges
6. ✅ `npm run build` succeeds with 0 TypeScript errors
7. ✅ `npm test -- --run` shows 1732+ existing tests + new tests passing
8. ✅ No regression in codex or community gallery functionality

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ Exchange toolbar button renders with pending badge support
2. ✅ Exchange Panel opens as lazy-loaded modal with 3 tabs
3. ✅ "My Listings" tab shows codex machines with "List for Trade" functionality
4. ✅ "Browse Trades" tab shows tradeable community machines with filtering
5. ✅ "Trade History" tab shows completed trades
6. ✅ Trade Proposal Modal allows creating trade offers
7. ✅ Accepting trade adds machine to codex and removes given machine
8. ✅ Rejecting trade updates proposal status
9. ✅ New `useExchangeStore` persists to localStorage
10. ✅ `npm run build` succeeds with 0 TypeScript errors
11. ✅ `npm test -- --run` passes (1732+ existing + new tests)
12. ✅ No console errors on Exchange Panel open/close
13. ✅ No regression in existing codex/community functionality

## Out of Scope

- **No real-time backend** — all trading is simulated client-side
- **No real trade matching** — users manually browse and propose
- **No trade value/currency system** — pure machine-for-machine exchange
- **No multi-machine trades** — only 1:1 exchanges
- **No AI trade suggestions** — future enhancement
- **No messaging between traders** — future enhancement
- **No ratings/reviews** — future enhancement
- **No cross-session trade state** — proposals reset on page refresh (by design for MVP)
- **No trade cancellation** — once accepted/rejected, final

## Technical Notes

### Data Flow
```
User Action → useExchangeStore action → Update local state
                                          ↓
                                    Persist to localStorage
                                          ↓
                                    UI re-renders with new state
```

### Hydration Pattern
Follow existing pattern from `useCodexStore`:
- Manual `hydrateExchangeStore()` call in App.tsx
- `isHydrated` check prevents cascade
- `useRef` for store refs in useEffect dependencies

### Code Splitting
All exchange components lazy-loaded like existing modals:
```typescript
const LazyExchangePanel = lazy(() => 
  import('./components/Exchange/ExchangePanel').then(m => ({ default: m.ExchangePanel }))
);
```

### Community Integration
- Extend `CommunityMachine` type with `availableForTrade: boolean`
- Seed 3-5 mock machines as tradeable initially
- Filter community gallery to show trade indicator
