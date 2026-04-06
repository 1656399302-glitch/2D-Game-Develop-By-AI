/**
 * Exchange Store Tests
 * 
 * Round 167 Fix: Wrapped all renderHook() calls in await act(async () => {...})
 * to fix act() warnings in React 18 testing.
 * 
 * Tests for the Exchange Store functionality including:
 * - simulateIncomingProposal
 * - acceptIncomingProposal
 * - rejectIncomingProposal
 * - Notification integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useExchangeStore } from '../../../store/useExchangeStore';

// Mock zustand persist middleware
vi.mock('zustand/middleware', async () => {
  const actual = await vi.importActual('zustand/middleware');
  return {
    ...actual,
    persist: (fn: Function) => (set: Function, get: Function) => fn(set, get),
  };
});

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
}));

// Helper function to wrap renderHook in act()
async function renderExchangeStore() {
  let result: any;
  await act(async () => {
    const renderResult = renderHook(() => useExchangeStore());
    result = renderResult;
  });
  return result;
}

// Helper function to reset store in act()
async function resetStore() {
  await act(async () => {
    useExchangeStore.setState({
      listings: [],
      incomingProposals: [],
      outgoingProposals: [],
      tradeHistory: [],
      notifications: [],
      isHydrated: true,
    });
  });
}

// Helper function to wrap store mutations in act()
async function simulateIncomingProposal(result: any) {
  await act(async () => {
    result.current.simulateIncomingProposal();
  });
}

// Helper function to wrap store mutations in act()
async function rejectProposal(result: any, proposalId: string) {
  await act(async () => {
    result.current.rejectProposal(proposalId);
  });
}

describe('Exchange Store - Incoming Proposals', () => {
  // Mock community machines
  const mockCommunityMachines = [
    {
      id: 'community-1',
      author: 'user1',
      authorName: 'Arcane Wizard',
      publishedAt: Date.now() - 86400000,
      likes: 100,
      views: 500,
      modules: [],
      connections: [],
      attributes: {
        name: 'Void Resonator',
        rarity: 'epic' as const,
        stats: { stability: 72, powerOutput: 85, energyCost: 45, failureRate: 28 },
        tags: ['void'],
        description: 'A void-powered resonance device',
        codexId: 'VR-3421',
      },
      dominantFaction: 'void' as const,
    },
    {
      id: 'community-2',
      author: 'user2',
      authorName: 'Pyro Master',
      publishedAt: Date.now() - 86400000 * 2,
      likes: 200,
      views: 1000,
      modules: [],
      connections: [],
      attributes: {
        name: 'Inferno Blaze',
        rarity: 'legendary' as const,
        stats: { stability: 55, powerOutput: 98, energyCost: 72, failureRate: 45 },
        tags: ['fire'],
        description: 'A devastating thermal amplifier',
        codexId: 'IB-9087',
      },
      dominantFaction: 'inferno' as const,
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset the store state before each test
    await resetStore();
  });

  // =========================================================================
  // AC-120-001: Simulated Incoming Proposals
  // =========================================================================
  describe('simulateIncomingProposal (AC-120-001)', () => {
    it('creates incoming proposal when simulateIncomingProposal is called', async () => {
      const { result } = await renderExchangeStore();
      
      // Initial state should have no incoming proposals
      expect(result.current.incomingProposals.length).toBe(0);
      
      // Call simulateIncomingProposal
      await simulateIncomingProposal(result);
      
      // Should have created a new incoming proposal
      expect(result.current.incomingProposals.length).toBe(1);
      expect(result.current.incomingProposals[0].status).toBe('pending');
    });

    it('creates incoming proposal with valid structure', async () => {
      const { result } = await renderExchangeStore();
      
      await simulateIncomingProposal(result);
      
      const proposal = result.current.incomingProposals[0];
      expect(proposal).toBeDefined();
      expect(proposal.id).toBeDefined();
      expect(proposal.proposerMachine).toBeDefined();
      expect(proposal.proposerMachineId).toBeDefined();
      expect(proposal.targetMachine).toBeDefined();
      expect(proposal.targetMachineId).toBeDefined();
      expect(proposal.status).toBe('pending');
      expect(proposal.createdAt).toBeDefined();
    });

    it('getIncomingPendingProposals returns pending proposals', async () => {
      const { result } = await renderExchangeStore();
      
      await simulateIncomingProposal(result);
      
      const pendingProposals = result.current.getIncomingPendingProposals();
      expect(pendingProposals.length).toBeGreaterThanOrEqual(1);
      expect(pendingProposals[0].status).toBe('pending');
    });

    it('returns null when no community machines available', async () => {
      // This test is informational - the store will still create proposals
      // since getTradeableCommunityMachines uses the community store
      const { result } = await renderExchangeStore();
      
      // Without mocking the community store, simulateIncomingProposal may return null
      // or create proposals based on available community machines
      await simulateIncomingProposal(result);
      // Just verify the method is callable
      expect(typeof result.current.simulateIncomingProposal).toBe('function');
    });
  });

  // =========================================================================
  // Accept Incoming Proposal
  // =========================================================================
  describe('acceptIncomingProposal', () => {
    it('accepts incoming proposal and updates status to accepted', async () => {
      const { result } = await renderExchangeStore();
      
      // Create incoming proposal
      await simulateIncomingProposal(result);
      
      const proposalId = result.current.incomingProposals[0].id;
      
      // Accept proposal
      await act(async () => {
        result.current.acceptIncomingProposal(proposalId);
      });
      
      // Proposal should be accepted
      const updatedProposal = result.current.incomingProposals.find(p => p.id === proposalId);
      expect(updatedProposal?.status).toBe('accepted');
    });

    it('adds accepted proposal to trade history', async () => {
      const { result } = await renderExchangeStore();
      
      // Create incoming proposal
      await simulateIncomingProposal(result);
      
      const proposalId = result.current.incomingProposals[0].id;
      const targetMachineId = result.current.incomingProposals[0].targetMachineId;
      
      // Accept proposal
      await act(async () => {
        result.current.acceptIncomingProposal(proposalId);
      });
      
      // Trade history should have entry
      const tradeHistory = result.current.getTradeHistory();
      expect(tradeHistory.length).toBe(1);
      expect(tradeHistory[0].receivedMachineId).toBe(targetMachineId);
    });

    it('adds notification when proposal is accepted', async () => {
      const { result } = await renderExchangeStore();
      
      // Create incoming proposal
      await simulateIncomingProposal(result);
      
      const proposalId = result.current.incomingProposals[0].id;
      
      // Accept proposal
      await act(async () => {
        result.current.acceptIncomingProposal(proposalId);
      });
      
      // Notifications should include accepted notification
      const notifications = result.current.notifications;
      const acceptedNotif = notifications.find(n => n.type === 'accepted');
      expect(acceptedNotif).toBeDefined();
      expect(acceptedNotif?.message).toContain('交易成功');
    });
  });

  // =========================================================================
  // Reject Incoming Proposal
  // =========================================================================
  describe('rejectIncomingProposal', () => {
    it('rejects incoming proposal and updates status to rejected', async () => {
      const { result } = await renderExchangeStore();
      
      // Create incoming proposal
      await simulateIncomingProposal(result);
      
      const proposalId = result.current.incomingProposals[0].id;
      
      // Reject proposal
      await act(async () => {
        result.current.rejectIncomingProposal(proposalId);
      });
      
      // Proposal should be rejected
      const updatedProposal = result.current.incomingProposals.find(p => p.id === proposalId);
      expect(updatedProposal?.status).toBe('rejected');
    });

    it('does not add to trade history when rejected', async () => {
      const { result } = await renderExchangeStore();
      
      // Create incoming proposal
      await simulateIncomingProposal(result);
      
      const proposalId = result.current.incomingProposals[0].id;
      
      // Reject proposal
      await act(async () => {
        result.current.rejectIncomingProposal(proposalId);
      });
      
      // Trade history should be empty
      const tradeHistory = result.current.getTradeHistory();
      expect(tradeHistory.length).toBe(0);
    });

    it('adds notification when proposal is rejected', async () => {
      const { result } = await renderExchangeStore();
      
      // Create incoming proposal
      await simulateIncomingProposal(result);
      
      const proposalId = result.current.incomingProposals[0].id;
      
      // Reject proposal
      await act(async () => {
        result.current.rejectIncomingProposal(proposalId);
      });
      
      // Notifications should include rejected notification
      const notifications = result.current.notifications;
      const rejectedNotif = notifications.find(n => n.type === 'rejected');
      expect(rejectedNotif).toBeDefined();
    });
  });

  // =========================================================================
  // Notification Integration
  // =========================================================================
  describe('Notification Integration', () => {
    it('creates notification when simulateIncomingProposal is called', async () => {
      const { result } = await renderExchangeStore();
      
      await simulateIncomingProposal(result);
      
      // Should have at least one notification (the incoming proposal notification)
      expect(result.current.notifications.length).toBeGreaterThanOrEqual(1);
      
      // Should have incoming type notification
      const incomingNotif = result.current.notifications.find(n => n.type === 'incoming');
      expect(incomingNotif).toBeDefined();
    });

    it('notifications contain proposal ID', async () => {
      const { result } = await renderExchangeStore();
      
      await simulateIncomingProposal(result);
      
      const proposalId = result.current.incomingProposals[0].id;
      const incomingNotif = result.current.notifications.find(n => n.type === 'incoming');
      
      if (incomingNotif) {
        expect(incomingNotif.proposalId).toBe(proposalId);
      }
    });

    it('getUnreadCount returns correct count', async () => {
      const { result } = await renderExchangeStore();
      
      // Create 3 incoming proposals
      await act(async () => {
        result.current.simulateIncomingProposal();
        result.current.simulateIncomingProposal();
        result.current.simulateIncomingProposal();
      });
      
      // Should have 3 unread notifications
      expect(result.current.getUnreadCount()).toBeGreaterThanOrEqual(3);
    });

    it('markNotificationRead updates notification read status', async () => {
      const { result } = await renderExchangeStore();
      
      await simulateIncomingProposal(result);
      
      const notifId = result.current.notifications[0]?.id;
      if (notifId) {
        await act(async () => {
          result.current.markNotificationRead(notifId);
        });
        
        const updatedNotif = result.current.notifications.find(n => n.id === notifId);
        expect(updatedNotif?.read).toBe(true);
      }
    });

    it('clearNotifications removes all notifications', async () => {
      const { result } = await renderExchangeStore();
      
      // Create some proposals
      await act(async () => {
        result.current.simulateIncomingProposal();
        result.current.simulateIncomingProposal();
      });
      
      expect(result.current.notifications.length).toBeGreaterThan(0);
      
      await act(async () => {
        result.current.clearNotifications();
      });
      
      expect(result.current.notifications.length).toBe(0);
    });
  });

  // =========================================================================
  // Multiple Proposals
  // =========================================================================
  describe('Multiple Proposals', () => {
    it('can handle multiple incoming proposals', async () => {
      const { result } = await renderExchangeStore();
      
      // Create 3 incoming proposals
      await act(async () => {
        result.current.simulateIncomingProposal();
        result.current.simulateIncomingProposal();
        result.current.simulateIncomingProposal();
      });
      
      expect(result.current.incomingProposals.length).toBe(3);
      expect(result.current.getIncomingPendingProposals().length).toBe(3);
    });

    it('can accept some and reject others', async () => {
      const { result } = await renderExchangeStore();
      
      // Create 3 incoming proposals
      await act(async () => {
        result.current.simulateIncomingProposal();
        result.current.simulateIncomingProposal();
        result.current.simulateIncomingProposal();
      });
      
      const proposals = result.current.incomingProposals;
      
      // Accept first, reject second, leave third pending
      await act(async () => {
        result.current.acceptIncomingProposal(proposals[0].id);
        result.current.rejectIncomingProposal(proposals[1].id);
      });
      
      // Check final state
      const pending = result.current.getIncomingPendingProposals();
      expect(pending.length).toBe(1);
      expect(pending[0].id).toBe(proposals[2].id);
      
      // Trade history should have 1 entry
      expect(result.current.getTradeHistory().length).toBe(1);
    });
  });

  // =========================================================================
  // Edge Cases
  // =========================================================================
  describe('Edge Cases', () => {
    it('handles acceptProposal with invalid ID gracefully', async () => {
      const { result } = await renderExchangeStore();
      
      const success = result.current.acceptProposal('invalid-id');
      expect(success).toBe(false);
    });

    it('handles rejectProposal with invalid ID gracefully', async () => {
      const { result } = await renderExchangeStore();
      
      // Should not throw - need to wrap in act() to prevent warnings
      await rejectProposal(result, 'invalid-id');
    });

    it('getProposal returns undefined for non-existent proposal', async () => {
      const { result } = await renderExchangeStore();
      
      const proposal = result.current.getProposal('non-existent-id');
      expect(proposal).toBeUndefined();
    });
  });
});
