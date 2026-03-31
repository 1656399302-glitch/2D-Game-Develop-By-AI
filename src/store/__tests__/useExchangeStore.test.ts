/**
 * Exchange Store Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useExchangeStore } from '../useExchangeStore';

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

const mockCodexState = {
  entries: mockCodexEntries,
  getEntry: (id: string) => mockCodexEntries.find((e) => e.id === id),
  addEntry: vi.fn(),
  removeEntry: vi.fn(),
};

const mockCommunityState = {
  communityMachines: [mockCommunityMachine],
  publishedMachines: [],
};

// Mock the external stores with getState as static method
vi.mock('../useCodexStore', () => ({
  useCodexStore: Object.assign(
    () => mockCodexState,
    { getState: () => mockCodexState }
  ),
}));

vi.mock('../useCommunityStore', () => ({
  useCommunityStore: Object.assign(
    () => mockCommunityState,
    { getState: () => mockCommunityState }
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
  });

  describe('Listing Actions', () => {
    it('should mark a machine for trade', () => {
      useExchangeStore.getState().markForTrade('codex-1');
      
      const { listings } = useExchangeStore.getState();
      expect(listings).toHaveLength(1);
      expect(listings[0].codexEntryId).toBe('codex-1');
      expect(listings[0].tradePreference).toBe('any');
    });

    it('should mark a machine with custom trade preference', () => {
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

    it('should unmark a machine from trade', () => {
      useExchangeStore.getState().markForTrade('codex-1');
      expect(useExchangeStore.getState().listings).toHaveLength(1);
      
      useExchangeStore.getState().unmarkFromTrade('codex-1');
      expect(useExchangeStore.getState().listings).toHaveLength(0);
    });

    it('should check if a machine is listed', () => {
      expect(useExchangeStore.getState().isListed('codex-1')).toBe(false);
      
      useExchangeStore.getState().markForTrade('codex-1');
      
      expect(useExchangeStore.getState().isListed('codex-1')).toBe(true);
      expect(useExchangeStore.getState().isListed('codex-2')).toBe(false);
    });
  });

  describe('Proposal Actions', () => {
    it('should create a trade proposal', () => {
      const proposal = useExchangeStore.getState().createProposal('codex-1', mockCommunityMachine);
      
      expect(proposal).not.toBeNull();
      expect(proposal?.proposerMachineId).toBe('codex-1');
      expect(proposal?.targetMachineId).toBe('mock-1');
      expect(proposal?.status).toBe('pending');
      
      const { outgoingProposals } = useExchangeStore.getState();
      expect(outgoingProposals).toHaveLength(1);
    });

    it('should not create proposal for non-existent codex entry', () => {
      const proposal = useExchangeStore.getState().createProposal('non-existent-id', mockCommunityMachine);
      
      expect(proposal).toBeNull();
    });
  });

  describe('Notification Actions', () => {
    it('should add a notification', () => {
      useExchangeStore.getState().addNotification({
        proposalId: 'proposal-1',
        message: 'Test notification',
        type: 'incoming',
        read: false,
      });
      
      const notifications = useExchangeStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toBe('Test notification');
      expect(notifications[0].read).toBe(false);
    });

    it('should mark notification as read', () => {
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

    it('should get unread notification count', () => {
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

    it('should clear all notifications', () => {
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
  });

  describe('Trade History', () => {
    it('should record a completed trade', () => {
      useExchangeStore.getState().recordTrade({
        id: 'proposal-1',
        proposerMachineId: 'codex-1',
        proposerMachine: mockCodexEntries[0],
        targetMachineId: 'mock-1',
        targetMachine: mockCommunityMachine,
        status: 'accepted' as const,
        createdAt: Date.now(),
      });
      
      const tradeHistory = useExchangeStore.getState().tradeHistory;
      expect(tradeHistory).toHaveLength(1);
      expect(tradeHistory[0].givenMachineId).toBe('codex-1');
      expect(tradeHistory[0].receivedMachineId).toBe('mock-1');
    });

    it('should get trade history', () => {
      const history = useExchangeStore.getState().getTradeHistory();
      
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('Hydration', () => {
    it('should set hydrated state', () => {
      expect(useExchangeStore.getState().isHydrated).toBe(true);
      
      useExchangeStore.getState().setHydrated(false);
      
      expect(useExchangeStore.getState().isHydrated).toBe(false);
    });
  });
});
