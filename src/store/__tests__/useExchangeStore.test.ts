/**
 * Exchange Store Tests - Comprehensive Coverage
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useExchangeStore, hydrateExchangeStore, isExchangeHydrated, 
         selectListings, selectIncomingProposals, selectOutgoingProposals,
         selectTradeHistory, selectNotifications, selectIsHydrated } from '../useExchangeStore';
import { useCodexStore } from '../useCodexStore';
import { useCommunityStore } from '../useCommunityStore';

// Use vi.hoisted to create ALL mocks and data before imports
const mockCodexEntries = vi.hoisted(() => [
  {
    id: 'codex-1',
    codexId: 'MC-0001',
    name: 'Test Machine 1',
    rarity: 'rare' as const,
    modules: [],
    connections: [],
    attributes: {
      name: 'Test Machine 1',
      rarity: 'rare' as const,
      stats: { stability: 75, powerOutput: 60, energyCost: 30, failureRate: 20 },
      tags: ['fire'],
      description: 'Test machine',
      codexId: 'MC-0001',
    },
    createdAt: Date.now(),
  },
  {
    id: 'codex-2',
    codexId: 'MC-0002',
    name: 'Test Machine 2',
    rarity: 'legendary' as const,
    modules: [],
    connections: [],
    attributes: {
      name: 'Test Machine 2',
      rarity: 'legendary' as const,
      stats: { stability: 90, powerOutput: 80, energyCost: 40, failureRate: 10 },
      tags: ['arcane'],
      description: 'Test machine 2',
      codexId: 'MC-0002',
    },
    createdAt: Date.now(),
  },
]);

const mockCommunityMachine = vi.hoisted(() => ({
  id: 'mock-1',
  author: 'test_user',
  publishedAt: Date.now(),
  likes: 10,
  views: 100,
  modules: [],
  connections: [],
  attributes: {
    name: 'Community Machine 1',
    rarity: 'legendary' as const,
    stats: { stability: 90, powerOutput: 80, energyCost: 40, failureRate: 10 },
    tags: ['arcane'],
    description: 'Community machine',
    codexId: 'CM-0001',
  },
  dominantFaction: 'void' as const,
}));

const mockCommunityMachine2 = vi.hoisted(() => ({
  id: 'mock-2',
  author: 'another_user',
  publishedAt: Date.now(),
  likes: 25,
  views: 200,
  modules: [],
  connections: [],
  attributes: {
    name: 'Community Machine 2',
    rarity: 'epic' as const,
    stats: { stability: 85, powerOutput: 75, energyCost: 35, failureRate: 15 },
    tags: ['fire', 'arcane'],
    description: 'Another community machine',
    codexId: 'CM-0002',
  },
  dominantFaction: 'fire' as const,
}));

// Mock functions that can be inspected
const mockAddEntry = vi.fn();
const mockRemoveEntry = vi.fn();

// Mutable state for mocking
let mockCodexEntriesState = [...mockCodexEntries];

const mockCodexGetEntry = (id: string) => mockCodexEntriesState.find((e) => e.id === id);
const mockCodexGetEntries = () => mockCodexEntriesState;

const mockCommunityState = {
  communityMachines: [mockCommunityMachine, mockCommunityMachine2],
  publishedMachines: [] as any[],
};

// Mock the external stores with getState as static method
vi.mock('../useCodexStore', () => ({
  useCodexStore: Object.assign(
    vi.fn(() => ({
      entries: mockCodexEntriesState,
      getEntry: mockCodexGetEntry,
      addEntry: mockAddEntry,
      removeEntry: mockRemoveEntry,
    })),
    { 
      getState: () => ({
        entries: mockCodexEntriesState,
        getEntry: mockCodexGetEntry,
        addEntry: mockAddEntry,
        removeEntry: mockRemoveEntry,
      })
    }
  ),
}));

vi.mock('../useCommunityStore', () => ({
  useCommunityStore: Object.assign(
    vi.fn(() => mockCommunityState),
    { 
      getState: () => mockCommunityState
    }
  ),
}));

describe('useExchangeStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useExchangeStore.setState({
      listings: [],
      incomingProposals: [],
      outgoingProposals: [],
      tradeHistory: [],
      notifications: [],
      isHydrated: true,
    });
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset mock codex entries
    mockCodexEntriesState = [...mockCodexEntries];
    
    // Reset community state
    mockCommunityState.communityMachines = [mockCommunityMachine, mockCommunityMachine2];
    mockCommunityState.publishedMachines = [];
  });

  // =========================================================================
  // STORE INITIALIZATION TESTS
  // =========================================================================
  describe('Store Initialization', () => {
    it('should have empty arrays on initial state', () => {
      useExchangeStore.setState({
        listings: [],
        incomingProposals: [],
        outgoingProposals: [],
        tradeHistory: [],
        notifications: [],
        isHydrated: false,
      });
      
      const state = useExchangeStore.getState();
      expect(state.listings).toEqual([]);
      expect(state.incomingProposals).toEqual([]);
      expect(state.outgoingProposals).toEqual([]);
      expect(state.tradeHistory).toEqual([]);
      expect(state.notifications).toEqual([]);
    });

    it('should set hydrated state correctly', () => {
      expect(useExchangeStore.getState().isHydrated).toBe(true);
      
      useExchangeStore.getState().setHydrated(false);
      expect(useExchangeStore.getState().isHydrated).toBe(false);
      
      useExchangeStore.getState().setHydrated(true);
      expect(useExchangeStore.getState().isHydrated).toBe(true);
    });
  });

  // =========================================================================
  // LISTING MANAGEMENT TESTS (AC-EXCHANGE-001, AC-EXCHANGE-002)
  // =========================================================================
  describe('Listing Actions', () => {
    describe('markForTrade', () => {
      it('should mark a machine for trade (AC-EXCHANGE-001)', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        
        const { listings } = useExchangeStore.getState();
        expect(listings).toHaveLength(1);
        expect(listings[0].codexEntryId).toBe('codex-1');
        expect(listings[0].tradePreference).toBe('any');
        expect(typeof listings[0].listedAt).toBe('number');
      });

      it('should preserve custom trade preference', () => {
        useExchangeStore.getState().markForTrade('codex-1', 'faction:void');
        
        const { listings } = useExchangeStore.getState();
        expect(listings[0].tradePreference).toBe('faction:void');
      });

      it('should not add duplicate listings', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        useExchangeStore.getState().markForTrade('codex-1');
        
        const { listings } = useExchangeStore.getState();
        expect(listings).toHaveLength(1);
      });

      it('should add multiple different listings', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        useExchangeStore.getState().markForTrade('codex-2');
        
        const { listings } = useExchangeStore.getState();
        expect(listings).toHaveLength(2);
      });
    });

    describe('unmarkFromTrade', () => {
      it('should unmark a machine from trade (AC-EXCHANGE-002)', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        expect(useExchangeStore.getState().listings).toHaveLength(1);
        
        useExchangeStore.getState().unmarkFromTrade('codex-1');
        
        const { listings } = useExchangeStore.getState();
        expect(listings).toHaveLength(0);
        expect(useExchangeStore.getState().isListed('codex-1')).toBe(false);
      });

      it('should only remove specified listing', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        useExchangeStore.getState().markForTrade('codex-2');
        
        useExchangeStore.getState().unmarkFromTrade('codex-1');
        
        const { listings } = useExchangeStore.getState();
        expect(listings).toHaveLength(1);
        expect(listings[0].codexEntryId).toBe('codex-2');
      });

      it('should handle unmarking non-existent listing gracefully', () => {
        expect(() => {
          useExchangeStore.getState().unmarkFromTrade('non-existent');
        }).not.toThrow();
      });
    });

    describe('isListed', () => {
      it('should return false for unlisted machines', () => {
        expect(useExchangeStore.getState().isListed('codex-1')).toBe(false);
        expect(useExchangeStore.getState().isListed('codex-2')).toBe(false);
        expect(useExchangeStore.getState().isListed('non-existent')).toBe(false);
      });

      it('should return true for listed machines (AC-EXCHANGE-001)', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        expect(useExchangeStore.getState().isListed('codex-1')).toBe(true);
      });

      it('should not remain true after unmarkFromTrade (AC-EXCHANGE-002)', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        expect(useExchangeStore.getState().isListed('codex-1')).toBe(true);
        
        useExchangeStore.getState().unmarkFromTrade('codex-1');
        expect(useExchangeStore.getState().isListed('codex-1')).toBe(false);
      });
    });

    describe('getMyListedMachines (AC-EXCHANGE-012)', () => {
      it('should return empty array when no listings exist', () => {
        const machines = useExchangeStore.getState().getMyListedMachines();
        expect(machines).toEqual([]);
      });

      it('should return empty array when codex is empty', () => {
        mockCodexEntriesState = [];
        
        useExchangeStore.getState().markForTrade('codex-1');
        const machines = useExchangeStore.getState().getMyListedMachines();
        expect(machines).toEqual([]);
      });

      it('should return listed machines from codex', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        useExchangeStore.getState().markForTrade('codex-2');
        
        const machines = useExchangeStore.getState().getMyListedMachines();
        expect(machines).toHaveLength(2);
        expect(machines.map(m => m.id)).toContain('codex-1');
        expect(machines.map(m => m.id)).toContain('codex-2');
      });

      it('should only return machines that exist in codex', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        useExchangeStore.getState().markForTrade('non-existent-codex');
        
        const machines = useExchangeStore.getState().getMyListedMachines();
        expect(machines).toHaveLength(1);
        expect(machines[0].id).toBe('codex-1');
      });
    });
  });

  // =========================================================================
  // PROPOSAL MANAGEMENT TESTS
  // =========================================================================
  describe('Proposal Actions', () => {
    describe('createProposal (AC-EXCHANGE-003)', () => {
      it('should create proposal with correct structure', () => {
        const proposal = useExchangeStore.getState().createProposal('codex-1', mockCommunityMachine);
        
        expect(proposal).not.toBeNull();
        expect(proposal?.id).toBeDefined();
        expect(typeof proposal?.id).toBe('string');
        expect(proposal?.proposerMachineId).toBe('codex-1');
        expect(proposal?.targetMachineId).toBe('mock-1');
        expect(proposal?.status).toBe('pending');
        expect(typeof proposal?.createdAt).toBe('number');
      });

      it('should add proposal to outgoingProposals array', () => {
        useExchangeStore.getState().createProposal('codex-1', mockCommunityMachine);
        
        const { outgoingProposals } = useExchangeStore.getState();
        expect(outgoingProposals).toHaveLength(1);
        expect(outgoingProposals[0].proposerMachineId).toBe('codex-1');
      });

      it('should return null for non-existent codex entry', () => {
        const proposal = useExchangeStore.getState().createProposal('non-existent-id', mockCommunityMachine);
        expect(proposal).toBeNull();
      });

      it('should include proposerMachine data in proposal', () => {
        const proposal = useExchangeStore.getState().createProposal('codex-1', mockCommunityMachine);
        
        expect(proposal?.proposerMachine).toBeDefined();
        expect(proposal?.proposerMachine.id).toBe('codex-1');
      });

      it('should include targetMachine data in proposal', () => {
        const proposal = useExchangeStore.getState().createProposal('codex-1', mockCommunityMachine);
        
        expect(proposal?.targetMachine).toBeDefined();
        expect(proposal?.targetMachine.id).toBe('mock-1');
      });
    });

    describe('acceptProposal (AC-EXCHANGE-004)', () => {
      beforeEach(() => {
        mockAddEntry.mockClear();
        mockRemoveEntry.mockClear();
      });

      it('should accept pending incoming proposal', () => {
        // Create an incoming proposal first
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'proposal-incoming-1',
            proposerMachineId: 'external-user-machine',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        const result = useExchangeStore.getState().acceptProposal('proposal-incoming-1');
        
        expect(result).toBe(true);
        
        const { incomingProposals } = useExchangeStore.getState();
        expect(incomingProposals[0].status).toBe('accepted');
        expect(incomingProposals[0].respondedAt).toBeDefined();
      });

      it('should call codexStore.addEntry with correct parameters', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'proposal-incoming-1',
            proposerMachineId: 'external-user-machine',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        useExchangeStore.getState().acceptProposal('proposal-incoming-1');
        
        expect(mockAddEntry).toHaveBeenCalledWith(
          mockCommunityMachine.attributes.name,
          mockCommunityMachine.modules,
          mockCommunityMachine.connections,
          mockCommunityMachine.attributes
        );
      });

      it('should call codexStore.removeEntry for proposer machine', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'proposal-incoming-1',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        useExchangeStore.getState().acceptProposal('proposal-incoming-1');
        
        expect(mockRemoveEntry).toHaveBeenCalledWith('codex-1');
      });

      it('should not succeed for non-pending proposal', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'proposal-accepted',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'accepted',
            createdAt: Date.now(),
          }],
        });

        const result = useExchangeStore.getState().acceptProposal('proposal-accepted');
        expect(result).toBe(false);
      });

      it('should not succeed for non-existent proposal', () => {
        const result = useExchangeStore.getState().acceptProposal('non-existent-proposal');
        expect(result).toBe(false);
      });

      it('should add notification on successful acceptance', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'proposal-incoming-1',
            proposerMachineId: 'external-user-machine',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        useExchangeStore.getState().acceptProposal('proposal-incoming-1');
        
        const { notifications } = useExchangeStore.getState();
        expect(notifications.length).toBeGreaterThan(0);
        const acceptanceNotification = notifications.find(n => n.type === 'accepted');
        expect(acceptanceNotification).toBeDefined();
        expect(acceptanceNotification?.message).toContain('交易成功');
      });

      it('should record trade in history', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'proposal-incoming-1',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        useExchangeStore.getState().acceptProposal('proposal-incoming-1');
        
        const { tradeHistory } = useExchangeStore.getState();
        expect(tradeHistory).toHaveLength(1);
        expect(tradeHistory[0].givenMachineId).toBe('codex-1');
        expect(tradeHistory[0].receivedMachineId).toBe('mock-1');
      });

      it('should handle edge case: already rejected proposal cannot be accepted', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'proposal-rejected',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'rejected',
            createdAt: Date.now(),
          }],
        });

        const result = useExchangeStore.getState().acceptProposal('proposal-rejected');
        expect(result).toBe(false);
        expect(mockAddEntry).not.toHaveBeenCalled();
      });
    });

    describe('rejectProposal (AC-EXCHANGE-005)', () => {
      it('should update proposal status to rejected', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'proposal-incoming-1',
            proposerMachineId: 'external-user-machine',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        useExchangeStore.getState().rejectProposal('proposal-incoming-1');
        
        const { incomingProposals } = useExchangeStore.getState();
        expect(incomingProposals[0].status).toBe('rejected');
        expect(incomingProposals[0].respondedAt).toBeDefined();
      });

      it('should add notification on rejection', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'proposal-incoming-1',
            proposerMachineId: 'external-user-machine',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        useExchangeStore.getState().rejectProposal('proposal-incoming-1');
        
        const { notifications } = useExchangeStore.getState();
        const rejectionNotification = notifications.find(n => n.type === 'rejected');
        expect(rejectionNotification).toBeDefined();
        expect(rejectionNotification?.message).toContain('已拒绝');
      });

      it('should not crash for non-existent proposal', () => {
        expect(() => {
          useExchangeStore.getState().rejectProposal('non-existent');
        }).not.toThrow();
      });

      it('should not affect other proposals when rejecting one', () => {
        useExchangeStore.setState({
          incomingProposals: [
            {
              id: 'proposal-1',
              proposerMachineId: 'user-1',
              proposerMachine: mockCodexEntries[0],
              targetMachineId: 'mock-1',
              targetMachine: mockCommunityMachine,
              status: 'pending',
              createdAt: Date.now(),
            },
            {
              id: 'proposal-2',
              proposerMachineId: 'user-2',
              proposerMachine: mockCodexEntries[1],
              targetMachineId: 'mock-2',
              targetMachine: mockCommunityMachine2,
              status: 'pending',
              createdAt: Date.now(),
            },
          ],
        });

        useExchangeStore.getState().rejectProposal('proposal-1');
        
        const { incomingProposals } = useExchangeStore.getState();
        expect(incomingProposals[0].status).toBe('rejected');
        expect(incomingProposals[1].status).toBe('pending');
      });
    });

    describe('getProposal (AC-EXCHANGE-013)', () => {
      it('should retrieve specific proposal by ID from incoming proposals', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'incoming-123',
            proposerMachineId: 'user-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        const proposal = useExchangeStore.getState().getProposal('incoming-123');
        
        expect(proposal).toBeDefined();
        expect(proposal?.id).toBe('incoming-123');
      });

      it('should retrieve specific proposal by ID from outgoing proposals', () => {
        useExchangeStore.setState({
          outgoingProposals: [{
            id: 'outgoing-456',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        const proposal = useExchangeStore.getState().getProposal('outgoing-456');
        
        expect(proposal).toBeDefined();
        expect(proposal?.id).toBe('outgoing-456');
      });

      it('should return undefined for non-existent proposal ID (AC-EXCHANGE-013)', () => {
        const proposal = useExchangeStore.getState().getProposal('non-existent-id');
        expect(proposal).toBeUndefined();
      });

      it('should prefer incoming proposal when ID exists in both', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'same-id',
            proposerMachineId: 'incoming-user',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
          outgoingProposals: [{
            id: 'same-id',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-2',
            targetMachine: mockCommunityMachine2,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        const proposal = useExchangeStore.getState().getProposal('same-id');
        
        expect(proposal).toBeDefined();
        expect(proposal?.proposerMachineId).toBe('incoming-user');
      });
    });

    describe('getMyPendingProposals (AC-EXCHANGE-006)', () => {
      it('should return only pending outgoing proposals', () => {
        useExchangeStore.setState({
          outgoingProposals: [
            {
              id: 'outgoing-pending-1',
              proposerMachineId: 'codex-1',
              proposerMachine: mockCodexEntries[0],
              targetMachineId: 'mock-1',
              targetMachine: mockCommunityMachine,
              status: 'pending',
              createdAt: Date.now(),
            },
            {
              id: 'outgoing-pending-2',
              proposerMachineId: 'codex-2',
              proposerMachine: mockCodexEntries[1],
              targetMachineId: 'mock-2',
              targetMachine: mockCommunityMachine2,
              status: 'pending',
              createdAt: Date.now(),
            },
          ],
        });

        const pending = useExchangeStore.getState().getMyPendingProposals();
        
        expect(pending).toHaveLength(2);
        expect(pending.every(p => p.status === 'pending')).toBe(true);
      });

      it('should not include accepted proposals (AC-EXCHANGE-006)', () => {
        useExchangeStore.setState({
          outgoingProposals: [
            {
              id: 'outgoing-accepted',
              proposerMachineId: 'codex-1',
              proposerMachine: mockCodexEntries[0],
              targetMachineId: 'mock-1',
              targetMachine: mockCommunityMachine,
              status: 'accepted',
              createdAt: Date.now(),
            },
          ],
        });

        const pending = useExchangeStore.getState().getMyPendingProposals();
        
        expect(pending).toHaveLength(0);
      });

      it('should not include rejected proposals (AC-EXCHANGE-006)', () => {
        useExchangeStore.setState({
          outgoingProposals: [
            {
              id: 'outgoing-rejected',
              proposerMachineId: 'codex-1',
              proposerMachine: mockCodexEntries[0],
              targetMachineId: 'mock-1',
              targetMachine: mockCommunityMachine,
              status: 'rejected',
              createdAt: Date.now(),
            },
          ],
        });

        const pending = useExchangeStore.getState().getMyPendingProposals();
        
        expect(pending).toHaveLength(0);
      });

      it('should return empty array when no outgoing proposals', () => {
        const pending = useExchangeStore.getState().getMyPendingProposals();
        expect(pending).toEqual([]);
      });

      it('should not include incoming proposals', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'incoming-pending',
            proposerMachineId: 'external-user',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        const pending = useExchangeStore.getState().getMyPendingProposals();
        
        expect(pending).toHaveLength(0);
      });
    });

    describe('getIncomingPendingProposals (AC-EXCHANGE-007)', () => {
      it('should return only pending incoming proposals', () => {
        useExchangeStore.setState({
          incomingProposals: [
            {
              id: 'incoming-pending-1',
              proposerMachineId: 'user-1',
              proposerMachine: mockCodexEntries[0],
              targetMachineId: 'mock-1',
              targetMachine: mockCommunityMachine,
              status: 'pending',
              createdAt: Date.now(),
            },
            {
              id: 'incoming-pending-2',
              proposerMachineId: 'user-2',
              proposerMachine: mockCodexEntries[1],
              targetMachineId: 'mock-2',
              targetMachine: mockCommunityMachine2,
              status: 'pending',
              createdAt: Date.now(),
            },
          ],
        });

        const pending = useExchangeStore.getState().getIncomingPendingProposals();
        
        expect(pending).toHaveLength(2);
        expect(pending.every(p => p.status === 'pending')).toBe(true);
      });

      it('should not include accepted proposals (AC-EXCHANGE-007)', () => {
        useExchangeStore.setState({
          incomingProposals: [
            {
              id: 'incoming-accepted',
              proposerMachineId: 'user-1',
              proposerMachine: mockCodexEntries[0],
              targetMachineId: 'mock-1',
              targetMachine: mockCommunityMachine,
              status: 'accepted',
              createdAt: Date.now(),
            },
          ],
        });

        const pending = useExchangeStore.getState().getIncomingPendingProposals();
        
        expect(pending).toHaveLength(0);
      });

      it('should not include rejected proposals (AC-EXCHANGE-007)', () => {
        useExchangeStore.setState({
          incomingProposals: [
            {
              id: 'incoming-rejected',
              proposerMachineId: 'user-1',
              proposerMachine: mockCodexEntries[0],
              targetMachineId: 'mock-1',
              targetMachine: mockCommunityMachine,
              status: 'rejected',
              createdAt: Date.now(),
            },
          ],
        });

        const pending = useExchangeStore.getState().getIncomingPendingProposals();
        
        expect(pending).toHaveLength(0);
      });

      it('should return empty array when no incoming proposals', () => {
        const pending = useExchangeStore.getState().getIncomingPendingProposals();
        expect(pending).toEqual([]);
      });

      it('should not include outgoing proposals', () => {
        useExchangeStore.setState({
          outgoingProposals: [{
            id: 'outgoing-pending',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        const pending = useExchangeStore.getState().getIncomingPendingProposals();
        
        expect(pending).toHaveLength(0);
      });
    });
  });

  // =========================================================================
  // TRADE HISTORY TESTS (AC-EXCHANGE-008)
  // =========================================================================
  describe('Trade History', () => {
    describe('recordTrade', () => {
      it('should add trade to history with correct structure', () => {
        const proposal: any = {
          id: 'proposal-1',
          proposerMachineId: 'codex-1',
          proposerMachine: mockCodexEntries[0],
          targetMachineId: 'mock-1',
          targetMachine: mockCommunityMachine,
          status: 'accepted',
          createdAt: Date.now(),
        };

        useExchangeStore.getState().recordTrade(proposal);
        
        const { tradeHistory } = useExchangeStore.getState();
        expect(tradeHistory).toHaveLength(1);
        expect(tradeHistory[0].id).toBeDefined();
        expect(tradeHistory[0].givenMachineId).toBe('codex-1');
        expect(tradeHistory[0].givenMachine).toEqual(mockCodexEntries[0]);
        expect(tradeHistory[0].receivedMachineId).toBe('mock-1');
        expect(tradeHistory[0].receivedMachine).toEqual(mockCommunityMachine);
        expect(tradeHistory[0].completedAt).toBeDefined();
      });

      it('should prepend to history (most recent first) (AC-EXCHANGE-008)', () => {
        const proposal1: any = {
          id: 'proposal-1',
          proposerMachineId: 'codex-1',
          proposerMachine: mockCodexEntries[0],
          targetMachineId: 'mock-1',
          targetMachine: mockCommunityMachine,
          status: 'accepted',
          createdAt: Date.now() - 1000,
        };

        const proposal2: any = {
          id: 'proposal-2',
          proposerMachineId: 'codex-2',
          proposerMachine: mockCodexEntries[1],
          targetMachineId: 'mock-2',
          targetMachine: mockCommunityMachine2,
          status: 'accepted',
          createdAt: Date.now(),
        };

        useExchangeStore.getState().recordTrade(proposal1);
        useExchangeStore.getState().recordTrade(proposal2);
        
        const { tradeHistory } = useExchangeStore.getState();
        expect(tradeHistory).toHaveLength(2);
        expect(tradeHistory[0].id).toBeDefined();
        expect(tradeHistory[0].givenMachineId).toBe('codex-2'); // Most recent first
        expect(tradeHistory[1].givenMachineId).toBe('codex-1');
      });
    });

    describe('getTradeHistory', () => {
      it('should return trade history array (AC-EXCHANGE-008)', () => {
        const proposal: any = {
          id: 'proposal-1',
          proposerMachineId: 'codex-1',
          proposerMachine: mockCodexEntries[0],
          targetMachineId: 'mock-1',
          targetMachine: mockCommunityMachine,
          status: 'accepted',
          createdAt: Date.now(),
        };

        useExchangeStore.getState().recordTrade(proposal);
        
        const history = useExchangeStore.getState().getTradeHistory();
        expect(Array.isArray(history)).toBe(true);
        expect(history).toHaveLength(1);
      });

      it('should return empty array when no history', () => {
        const history = useExchangeStore.getState().getTradeHistory();
        expect(history).toEqual([]);
      });
    });
  });

  // =========================================================================
  // NOTIFICATION TESTS (AC-EXCHANGE-009)
  // =========================================================================
  describe('Notification Actions', () => {
    describe('addNotification', () => {
      it('should add notification with auto-generated id', () => {
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: 'Test notification',
          type: 'incoming',
          read: false,
        });
        
        const notifications = useExchangeStore.getState().notifications;
        expect(notifications[0].id).toBeDefined();
        expect(typeof notifications[0].id).toBe('string');
      });

      it('should add createdAt timestamp', () => {
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: 'Test notification',
          type: 'incoming',
          read: false,
        });
        
        const notifications = useExchangeStore.getState().notifications;
        expect(typeof notifications[0].createdAt).toBe('number');
      });

      it('should prepend notifications (newest first) (AC-EXCHANGE-009)', () => {
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: 'First notification',
          type: 'incoming',
          read: false,
        });
        
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-2',
          message: 'Second notification',
          type: 'accepted',
          read: false,
        });
        
        const notifications = useExchangeStore.getState().notifications;
        expect(notifications[0].message).toBe('Second notification');
        expect(notifications[1].message).toBe('First notification');
      });

      it('should enforce notification limit (max 50) (AC-EXCHANGE-009)', () => {
        // Add 55 notifications
        for (let i = 0; i < 55; i++) {
          useExchangeStore.getState().addNotification({
            proposalId: `proposal-${i}`,
            message: `Notification ${i}`,
            type: 'incoming',
            read: false,
          });
        }
        
        const notifications = useExchangeStore.getState().notifications;
        expect(notifications.length).toBe(50);
        // Oldest notification should not remain
        expect(notifications.find(n => n.message === 'Notification 0')).toBeUndefined();
        // Newest notification should remain
        expect(notifications.find(n => n.message === 'Notification 54')).toBeDefined();
      });

      it('should handle notification with empty message gracefully', () => {
        expect(() => {
          useExchangeStore.getState().addNotification({
            proposalId: 'proposal-1',
            message: '',
            type: 'incoming',
            read: false,
          });
        }).not.toThrow();
      });

      it('should handle notification with undefined message gracefully', () => {
        expect(() => {
          useExchangeStore.getState().addNotification({
            proposalId: 'proposal-1',
            message: undefined as any,
            type: 'incoming',
            read: false,
          });
        }).not.toThrow();
      });
    });

    describe('markNotificationRead', () => {
      it('should update read status to true (AC-EXCHANGE-009)', () => {
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: 'Test notification',
          type: 'incoming',
          read: false,
        });
        
        const notificationId = useExchangeStore.getState().notifications[0].id;
        useExchangeStore.getState().markNotificationRead(notificationId);
        
        expect(useExchangeStore.getState().notifications[0].read).toBe(true);
      });

      it('should not affect other notifications (AC-EXCHANGE-009)', () => {
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: 'First',
          type: 'incoming',
          read: false,
        });
        
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-2',
          message: 'Second',
          type: 'incoming',
          read: false,
        });
        
        const firstNotificationId = useExchangeStore.getState().notifications[1].id;
        useExchangeStore.getState().markNotificationRead(firstNotificationId);
        
        const notifications = useExchangeStore.getState().notifications;
        expect(notifications[0].read).toBe(false); // Second notification unchanged
        expect(notifications[1].read).toBe(true); // First notification marked as read
      });

      it('should handle non-existent notification ID gracefully', () => {
        expect(() => {
          useExchangeStore.getState().markNotificationRead('non-existent-id');
        }).not.toThrow();
      });
    });

    describe('clearNotifications', () => {
      it('should empty notifications array (AC-EXCHANGE-009)', () => {
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: 'Test 1',
          type: 'incoming',
          read: false,
        });
        
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-2',
          message: 'Test 2',
          type: 'accepted',
          read: false,
        });
        
        expect(useExchangeStore.getState().notifications).toHaveLength(2);
        
        useExchangeStore.getState().clearNotifications();
        
        expect(useExchangeStore.getState().notifications).toHaveLength(0);
      });

      it('should handle clearing when already empty', () => {
        expect(() => {
          useExchangeStore.getState().clearNotifications();
        }).not.toThrow();
      });
    });

    describe('getUnreadCount', () => {
      it('should return count of unread notifications (AC-EXCHANGE-009)', () => {
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: 'Test 1',
          type: 'incoming',
          read: false,
        });
        
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-2',
          message: 'Test 2',
          type: 'accepted',
          read: false,
        });
        
        expect(useExchangeStore.getState().getUnreadCount()).toBe(2);
      });

      it('should return 0 when all notifications are read (AC-EXCHANGE-009)', () => {
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: 'Test 1',
          type: 'incoming',
          read: false,
        });
        
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-2',
          message: 'Test 2',
          type: 'accepted',
          read: false,
        });
        
        const notificationId1 = useExchangeStore.getState().notifications[1].id;
        const notificationId2 = useExchangeStore.getState().notifications[0].id;
        
        useExchangeStore.getState().markNotificationRead(notificationId1);
        useExchangeStore.getState().markNotificationRead(notificationId2);
        
        expect(useExchangeStore.getState().getUnreadCount()).toBe(0);
      });

      it('should return 0 when no notifications exist', () => {
        expect(useExchangeStore.getState().getUnreadCount()).toBe(0);
      });
    });
  });

  // =========================================================================
  // COMPUTED/MISC TESTS
  // =========================================================================
  describe('Computed/Miscellaneous', () => {
    describe('getTradeableCommunityMachines (AC-EXCHANGE-010)', () => {
      it('should return combined communityMachines and publishedMachines', () => {
        const machines = useExchangeStore.getState().getTradeableCommunityMachines();
        
        expect(machines).toContain(mockCommunityMachine);
        expect(machines).toContain(mockCommunityMachine2);
      });

      it('should include published machines', () => {
        const publishedMachine = {
          id: 'published-1',
          author: 'me',
          publishedAt: Date.now(),
          likes: 5,
          views: 50,
          modules: [],
          connections: [],
          attributes: {
            name: 'Published Machine',
            rarity: 'rare' as const,
            stats: { stability: 70, powerOutput: 55, energyCost: 25, failureRate: 25 },
            tags: ['arcane'],
            description: 'My published machine',
            codexId: 'PUB-0001',
          },
          dominantFaction: 'void' as const,
        };

        mockCommunityState.publishedMachines = [publishedMachine];

        const machines = useExchangeStore.getState().getTradeableCommunityMachines();
        
        expect(machines).toHaveLength(3);
        expect(machines.map(m => m.id)).toContain('mock-1');
        expect(machines.map(m => m.id)).toContain('mock-2');
        expect(machines.map(m => m.id)).toContain('published-1');
      });

      it('should return empty array when no community machines', () => {
        mockCommunityState.communityMachines = [];
        mockCommunityState.publishedMachines = [];

        const machines = useExchangeStore.getState().getTradeableCommunityMachines();
        
        expect(machines).toEqual([]);
      });
    });

    describe('hasPendingProposals (AC-EXCHANGE-011)', () => {
      it('should return true when incoming pending proposals exist', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'incoming-pending',
            proposerMachineId: 'user-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        expect(useExchangeStore.getState().hasPendingProposals()).toBe(true);
      });

      it('should return true when outgoing pending proposals exist', () => {
        useExchangeStore.setState({
          outgoingProposals: [{
            id: 'outgoing-pending',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        expect(useExchangeStore.getState().hasPendingProposals()).toBe(true);
      });

      it('should return false when no pending proposals', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'incoming-accepted',
            proposerMachineId: 'user-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'accepted',
            createdAt: Date.now(),
          }],
          outgoingProposals: [{
            id: 'outgoing-rejected',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'rejected',
            createdAt: Date.now(),
          }],
        });

        expect(useExchangeStore.getState().hasPendingProposals()).toBe(false);
      });

      it('should return true when both incoming and outgoing have pending', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'incoming-pending',
            proposerMachineId: 'user-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'pending',
            createdAt: Date.now(),
          }],
          outgoingProposals: [{
            id: 'outgoing-pending',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-2',
            targetMachine: mockCommunityMachine2,
            status: 'pending',
            createdAt: Date.now(),
          }],
        });

        expect(useExchangeStore.getState().hasPendingProposals()).toBe(true);
      });

      it('should return false when no proposals at all', () => {
        expect(useExchangeStore.getState().hasPendingProposals()).toBe(false);
      });
    });

    describe('Hydration Helpers', () => {
      it('should have hydrateExchangeStore function', () => {
        expect(typeof hydrateExchangeStore).toBe('function');
      });

      it('should have isExchangeHydrated function', () => {
        expect(typeof isExchangeHydrated).toBe('function');
      });
    });
  });

  // =========================================================================
  // EDGE CASE TESTS
  // =========================================================================
  describe('Edge Cases', () => {
    describe('acceptProposal edge cases', () => {
      it('should return false for non-existent proposal ID without crashing', () => {
        const result = useExchangeStore.getState().acceptProposal('definitely-does-not-exist');
        expect(result).toBe(false);
      });

      it('should not call addEntry when proposal does not exist', () => {
        useExchangeStore.getState().acceptProposal('non-existent');
        expect(mockAddEntry).not.toHaveBeenCalled();
      });

      it('should not call removeEntry when proposal does not exist', () => {
        useExchangeStore.getState().acceptProposal('non-existent');
        expect(mockRemoveEntry).not.toHaveBeenCalled();
      });

      it('should handle expired status gracefully', () => {
        useExchangeStore.setState({
          incomingProposals: [{
            id: 'proposal-expired',
            proposerMachineId: 'codex-1',
            proposerMachine: mockCodexEntries[0],
            targetMachineId: 'mock-1',
            targetMachine: mockCommunityMachine,
            status: 'expired',
            createdAt: Date.now(),
          }],
        });

        const result = useExchangeStore.getState().acceptProposal('proposal-expired');
        expect(result).toBe(false);
      });
    });

    describe('rejectProposal edge cases', () => {
      it('should not crash for non-existent proposal ID', () => {
        expect(() => {
          useExchangeStore.getState().rejectProposal('non-existent-id');
        }).not.toThrow();
      });

      it('should not add notification for non-existent proposal', () => {
        const notificationCountBefore = useExchangeStore.getState().notifications.length;
        
        useExchangeStore.getState().rejectProposal('non-existent-id');
        
        expect(useExchangeStore.getState().notifications.length).toBe(notificationCountBefore);
      });
    });

    describe('createProposal edge cases', () => {
      it('should create proposal for already-listed machine', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        
        const proposal = useExchangeStore.getState().createProposal('codex-1', mockCommunityMachine);
        
        expect(proposal).not.toBeNull();
        expect(proposal?.status).toBe('pending');
      });
    });

    describe('getMyListedMachines edge cases', () => {
      it('should return empty array when codex is empty', () => {
        mockCodexEntriesState = [];
        
        useExchangeStore.getState().markForTrade('some-id');
        
        const machines = useExchangeStore.getState().getMyListedMachines();
        expect(machines).toEqual([]);
      });

      it('should filter out listings for removed codex entries', () => {
        useExchangeStore.getState().markForTrade('codex-1');
        useExchangeStore.getState().markForTrade('codex-2');
        
        // Remove one entry from codex
        mockCodexEntriesState = [mockCodexEntries[0]];
        
        const machines = useExchangeStore.getState().getMyListedMachines();
        expect(machines).toHaveLength(1);
        expect(machines[0].id).toBe('codex-1');
      });
    });

    describe('Notification edge cases', () => {
      it('should handle empty message', () => {
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: '',
          type: 'incoming',
          read: false,
        });
        
        expect(useExchangeStore.getState().notifications[0].message).toBe('');
      });

      it('should handle very long message', () => {
        const longMessage = 'A'.repeat(10000);
        
        useExchangeStore.getState().addNotification({
          proposalId: 'proposal-1',
          message: longMessage,
          type: 'incoming',
          read: false,
        });
        
        expect(useExchangeStore.getState().notifications[0].message.length).toBe(10000);
      });
    });

    describe('Trade history edge cases', () => {
      it('should handle undefined proposerMachine', () => {
        const proposal: any = {
          id: 'proposal-1',
          proposerMachineId: 'non-existent',
          proposerMachine: undefined,
          targetMachineId: 'mock-1',
          targetMachine: mockCommunityMachine,
          status: 'accepted',
          createdAt: Date.now(),
        };

        expect(() => {
          useExchangeStore.getState().recordTrade(proposal);
        }).not.toThrow();
      });

      it('should handle undefined targetMachine', () => {
        const proposal: any = {
          id: 'proposal-1',
          proposerMachineId: 'codex-1',
          proposerMachine: mockCodexEntries[0],
          targetMachineId: 'non-existent',
          targetMachine: undefined,
          status: 'accepted',
          createdAt: Date.now(),
        };

        expect(() => {
          useExchangeStore.getState().recordTrade(proposal);
        }).not.toThrow();
      });
    });
  });

  // =========================================================================
  // SELECTOR TESTS
  // =========================================================================
  describe('Selectors', () => {
    it('should export selectListings', () => {
      expect(typeof selectListings).toBe('function');
    });

    it('should export selectIncomingProposals', () => {
      expect(typeof selectIncomingProposals).toBe('function');
    });

    it('should export selectOutgoingProposals', () => {
      expect(typeof selectOutgoingProposals).toBe('function');
    });

    it('should export selectTradeHistory', () => {
      expect(typeof selectTradeHistory).toBe('function');
    });

    it('should export selectNotifications', () => {
      expect(typeof selectNotifications).toBe('function');
    });

    it('should export selectIsHydrated', () => {
      expect(typeof selectIsHydrated).toBe('function');
    });

    it('should selectListings return correct state', () => {
      useExchangeStore.getState().markForTrade('codex-1');
      const result = selectListings(useExchangeStore.getState());
      expect(result).toHaveLength(1);
    });

    it('should selectIncomingProposals return correct state', () => {
      useExchangeStore.setState({
        incomingProposals: [{
          id: 'test-1',
          proposerMachineId: 'user-1',
          proposerMachine: mockCodexEntries[0],
          targetMachineId: 'mock-1',
          targetMachine: mockCommunityMachine,
          status: 'pending',
          createdAt: Date.now(),
        }],
      });
      const result = selectIncomingProposals(useExchangeStore.getState());
      expect(result).toHaveLength(1);
    });

    it('should selectOutgoingProposals return correct state', () => {
      useExchangeStore.getState().createProposal('codex-1', mockCommunityMachine);
      const result = selectOutgoingProposals(useExchangeStore.getState());
      expect(result).toHaveLength(1);
    });

    it('should selectTradeHistory return correct state', () => {
      const proposal: any = {
        id: 'proposal-1',
        proposerMachineId: 'codex-1',
        proposerMachine: mockCodexEntries[0],
        targetMachineId: 'mock-1',
        targetMachine: mockCommunityMachine,
        status: 'accepted',
        createdAt: Date.now(),
      };
      useExchangeStore.getState().recordTrade(proposal);
      const result = selectTradeHistory(useExchangeStore.getState());
      expect(result).toHaveLength(1);
    });

    it('should selectNotifications return correct state', () => {
      useExchangeStore.getState().addNotification({
        proposalId: 'proposal-1',
        message: 'Test',
        type: 'incoming',
        read: false,
      });
      const result = selectNotifications(useExchangeStore.getState());
      expect(result).toHaveLength(1);
    });

    it('should selectIsHydrated return correct state', () => {
      const result = selectIsHydrated(useExchangeStore.getState());
      expect(result).toBe(true);
    });
  });
});
