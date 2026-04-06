/**
 * Exchange Store
 * 
 * Zustand store for managing the Codex Exchange System.
 * Handles trade listings, proposals, and trade history.
 * 
 * Note: Trade data is stored in localStorage and persists across
 * browser sessions (survives page refresh and browser restart).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { TradeProposal, TradeListing, TradeHistory, TradeNotification } from '../types/exchange';
import { CodexEntry } from '../types';
import { CommunityMachine } from '../data/communityGalleryData';
import { useCodexStore } from './useCodexStore';
import { useCommunityStore } from './useCommunityStore';

// Storage key for exchange data - stored in localStorage
// Data persists across browser restarts (unlike sessionStorage which clears on close)
const EXCHANGE_STORAGE_KEY = 'arcane-exchange-storage';

// AI Trader names for simulated proposals
const AI_TRADER_NAMES = [
  '机械大师 Alpha',
  '虚空行者 Beta', 
  '星火术士 Gamma',
  '雷霆使者 Delta',
  '奥术炼金师 Epsilon',
  '混沌锻造者 Zeta',
  '元素领主 Eta',
  '星辰法师 Theta',
];

interface ExchangeStore {
  // Trade listings - codex machines marked as available for trade
  listings: TradeListing[];

  // Incoming proposals (simulated - for MVP, we track proposals locally)
  incomingProposals: TradeProposal[];

  // Outgoing proposals (created by user)
  outgoingProposals: TradeProposal[];

  // Completed trades
  tradeHistory: TradeHistory[];

  // Notifications
  notifications: TradeNotification[];

  // Hydration state
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;

  // Listing actions
  markForTrade: (codexEntryId: string, tradePreference?: string) => void;
  unmarkFromTrade: (codexEntryId: string) => void;
  isListed: (codexEntryId: string) => boolean;
  getMyListedMachines: () => CodexEntry[];

  // Proposal actions
  createProposal: (proposerMachineId: string, targetMachine: CommunityMachine) => TradeProposal | null;
  acceptProposal: (proposalId: string) => boolean;
  rejectProposal: (proposalId: string) => void;
  expireProposal: (proposalId: string) => void;
  getProposal: (proposalId: string) => TradeProposal | undefined;
  getProposalById: (proposalId: string) => TradeProposal | undefined;
  getMyPendingProposals: () => TradeProposal[];
  getIncomingPendingProposals: () => TradeProposal[];

  // Simulated incoming proposals (for demo/testing)
  simulateIncomingProposal: () => TradeProposal | null;
  acceptIncomingProposal: (proposalId: string) => boolean;
  rejectIncomingProposal: (proposalId: string) => void;

  // Trade history actions
  recordTrade: (proposal: TradeProposal) => void;
  getTradeHistory: () => TradeHistory[];

  // Notification actions
  addNotification: (notification: Omit<TradeNotification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  getUnreadCount: () => number;

  // Computed getters
  getTradeableCommunityMachines: () => CommunityMachine[];
  hasPendingProposals: () => boolean;
}

export const useExchangeStore = create<ExchangeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      listings: [],
      incomingProposals: [],
      outgoingProposals: [],
      tradeHistory: [],
      notifications: [],
      isHydrated: false,
      setHydrated: (value: boolean) => set({ isHydrated: value }),

      // Mark a codex machine as available for trade
      markForTrade: (codexEntryId: string, tradePreference = 'any') => {
        const exists = get().listings.some((l) => l.codexEntryId === codexEntryId);
        if (exists) return;

        set((state) => ({
          listings: [
            ...state.listings,
            {
              codexEntryId,
              listedAt: Date.now(),
              tradePreference,
            },
          ],
        }));
      },

      // Unmark a codex machine from trade
      unmarkFromTrade: (codexEntryId: string) => {
        set((state) => ({
          listings: state.listings.filter((l) => l.codexEntryId !== codexEntryId),
        }));
      },

      // Check if a machine is listed for trade
      isListed: (codexEntryId: string) => {
        return get().listings.some((l) => l.codexEntryId === codexEntryId);
      },

      // Get all listed machines from user's codex
      getMyListedMachines: () => {
        const codexEntries = useCodexStore.getState().entries;
        const listings = get().listings;
        return codexEntries.filter((entry) =>
          listings.some((l) => l.codexEntryId === entry.id)
        );
      },

      // Create a trade proposal
      createProposal: (proposerMachineId: string, targetMachine: CommunityMachine) => {
        const codexEntry = useCodexStore.getState().getEntry(proposerMachineId);
        if (!codexEntry) return null;

        const proposal: TradeProposal = {
          id: uuidv4(),
          proposerMachineId,
          proposerMachine: codexEntry,
          targetMachineId: targetMachine.id,
          targetMachine,
          status: 'pending',
          createdAt: Date.now(),
        };

        set((state) => ({
          outgoingProposals: [...state.outgoingProposals, proposal],
        }));

        // For MVP, this is a client-side simulation
        // In production, the proposal would be sent to a server and 
        // the other user would accept/reject it
        setTimeout(() => {
          const currentProposals = useExchangeStore.getState().outgoingProposals;
          const pendingProposal = currentProposals.find((p) => p.id === proposal.id);
          if (pendingProposal && pendingProposal.status === 'pending') {
            // For demo: proposals remain in pending state until manually accepted
            // In a real app, this would be handled server-side
          }
        }, 2000);

        return proposal;
      },

      // Accept a trade proposal (from incoming proposals)
      acceptProposal: (proposalId: string) => {
        const proposal = get().incomingProposals.find((p) => p.id === proposalId);
        if (!proposal || proposal.status !== 'pending') return false;

        // Add the received machine to codex
        const codexStore = useCodexStore.getState();
        codexStore.addEntry(
          proposal.targetMachine.attributes.name,
          proposal.targetMachine.modules,
          proposal.targetMachine.connections,
          proposal.targetMachine.attributes
        );

        // Remove the given machine from codex (if it still exists)
        const givenEntry = codexStore.getEntry(proposal.proposerMachineId);
        if (givenEntry) {
          codexStore.removeEntry(proposal.proposerMachineId);
        }

        // Update proposal status
        set((state) => ({
          incomingProposals: state.incomingProposals.map((p) =>
            p.id === proposalId
              ? { ...p, status: 'accepted' as const, respondedAt: Date.now() }
              : p
          ),
        }));

        // Record in trade history
        get().recordTrade(proposal);

        // Add notification
        get().addNotification({
          proposalId,
          message: `交易成功! 你获得了 ${proposal.targetMachine.attributes.name}`,
          type: 'accepted',
          read: false,
        });

        return true;
      },

      // Reject a trade proposal
      rejectProposal: (proposalId: string) => {
        set((state) => ({
          incomingProposals: state.incomingProposals.map((p) =>
            p.id === proposalId
              ? { ...p, status: 'rejected' as const, respondedAt: Date.now() }
              : p
          ),
        }));

        const proposal = get().incomingProposals.find((p) => p.id === proposalId);
        if (proposal) {
          get().addNotification({
            proposalId,
            message: `${proposal.targetMachine.attributes.name} 的交易请求已拒绝`,
            type: 'rejected',
            read: false,
          });
        }
      },

      // Expire a trade proposal (marks as expired and removes from pending lists)
      expireProposal: (proposalId: string) => {
        const proposal = get().incomingProposals.find((p) => p.id === proposalId);
        
        // Update proposal status to expired (if it exists and is pending)
        set((state) => ({
          incomingProposals: state.incomingProposals.map((p) =>
            p.id === proposalId && p.status === 'pending'
              ? { ...p, status: 'expired' as const, respondedAt: Date.now() }
              : p
          ),
        }));

        // Also update outgoing proposals if applicable
        set((state) => ({
          outgoingProposals: state.outgoingProposals.map((p) =>
            p.id === proposalId && p.status === 'pending'
              ? { ...p, status: 'expired' as const, respondedAt: Date.now() }
              : p
          ),
        }));

        // Add notification for expiration
        if (proposal) {
          get().addNotification({
            proposalId,
            message: `${proposal.targetMachine.attributes.name} 的交易请求已过期`,
            type: 'rejected',
            read: false,
          });
        }
      },

      // Get a specific proposal (searches both incoming and outgoing)
      getProposal: (proposalId: string) => {
        return (
          get().incomingProposals.find((p) => p.id === proposalId) ||
          get().outgoingProposals.find((p) => p.id === proposalId)
        );
      },

      // Get a specific proposal by ID (alias for getProposal for clarity)
      getProposalById: (proposalId: string) => {
        return get().getProposal(proposalId);
      },

      // Get user's pending outgoing proposals
      getMyPendingProposals: () => {
        return get().outgoingProposals.filter((p) => p.status === 'pending');
      },

      // Get incoming pending proposals
      getIncomingPendingProposals: () => {
        return get().incomingProposals.filter((p) => p.status === 'pending');
      },

      // Simulate an incoming proposal from an AI trader (for demo/testing)
      simulateIncomingProposal: () => {
        const communityMachines = get().getTradeableCommunityMachines();
        if (communityMachines.length === 0) return null;

        // Select a random community machine
        const targetMachine = communityMachines[Math.floor(Math.random() * communityMachines.length)];

        // Select a random AI trader name
        const traderName = AI_TRADER_NAMES[Math.floor(Math.random() * AI_TRADER_NAMES.length)];

        // Create a simulated CodexEntry for the AI trader's machine
        const simulatedProposerMachine: CodexEntry = {
          id: `ai-${uuidv4()}`,
          codexId: `AI-${Date.now()}`,
          name: `${traderName} 的机器`,
          rarity: targetMachine.attributes.rarity,
          modules: [],
          connections: [],
          attributes: {
            name: `${traderName} 的机器`,
            rarity: targetMachine.attributes.rarity,
            stats: targetMachine.attributes.stats,
            tags: targetMachine.attributes.tags,
            description: `来自 ${traderName} 的交易请求`,
            codexId: `AI-${Date.now()}`,
          },
          createdAt: Date.now(),
        };

        const proposal: TradeProposal = {
          id: uuidv4(),
          proposerMachineId: simulatedProposerMachine.id,
          proposerMachine: simulatedProposerMachine,
          targetMachineId: targetMachine.id,
          targetMachine,
          status: 'pending',
          createdAt: Date.now(),
        };

        // Add proposal to incoming proposals
        set((state) => ({
          incomingProposals: [proposal, ...state.incomingProposals],
        }));

        // Add notification
        get().addNotification({
          proposalId: proposal.id,
          message: `${traderName} 想要交换 ${targetMachine.attributes.name}`,
          type: 'incoming',
          read: false,
        });

        return proposal;
      },

      // Accept an incoming proposal (alias for acceptProposal with clear naming)
      acceptIncomingProposal: (proposalId: string) => {
        return get().acceptProposal(proposalId);
      },

      // Reject an incoming proposal (alias for rejectProposal with clear naming)
      rejectIncomingProposal: (proposalId: string) => {
        get().rejectProposal(proposalId);
      },

      // Record a completed trade
      recordTrade: (proposal: TradeProposal) => {
        const historyEntry: TradeHistory = {
          id: uuidv4(),
          givenMachineId: proposal.proposerMachineId,
          givenMachine: proposal.proposerMachine,
          receivedMachineId: proposal.targetMachineId,
          receivedMachine: proposal.targetMachine,
          completedAt: Date.now(),
        };

        set((state) => ({
          tradeHistory: [historyEntry, ...state.tradeHistory],
        }));
      },

      // Get trade history
      getTradeHistory: () => {
        return get().tradeHistory;
      },

      // Add a notification
      addNotification: (notification) => {
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: uuidv4(),
              createdAt: Date.now(),
            },
            ...state.notifications,
          ].slice(0, 50), // Keep max 50 notifications
        }));
      },

      // Mark notification as read
      markNotificationRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
        }));
      },

      // Clear all notifications
      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Get unread notification count
      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },

      // Get community machines available for trade
      getTradeableCommunityMachines: () => {
        const communityMachines = useCommunityStore.getState().communityMachines;
        const publishedMachines = useCommunityStore.getState().publishedMachines;
        const allMachines = [...communityMachines, ...publishedMachines];

        // For MVP, all community machines are available for trade
        // In production, this would filter by availableForTrade flag per machine
        return allMachines;
      },

      // Check if there are pending proposals
      hasPendingProposals: () => {
        const pendingIncoming = get().incomingProposals.filter(
          (p) => p.status === 'pending'
        ).length;
        const pendingOutgoing = get().outgoingProposals.filter(
          (p) => p.status === 'pending'
        ).length;
        return pendingIncoming > 0 || pendingOutgoing > 0;
      },
    }),
    {
      name: EXCHANGE_STORAGE_KEY,
      // Only persist essential data
      partialize: (state) => ({
        listings: state.listings,
        tradeHistory: state.tradeHistory,
        notifications: state.notifications,
        incomingProposals: state.incomingProposals,
        outgoingProposals: state.outgoingProposals,
      }),
      // Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Helper to manually trigger hydration
export const hydrateExchangeStore = () => {
  useExchangeStore.persist.rehydrate();
};

// Helper to check if hydration is complete
export const isExchangeHydrated = () => {
  return useExchangeStore.persist.hasHydrated();
};

// Selector helpers
export const selectListings = (state: ExchangeStore) => state.listings;
export const selectIncomingProposals = (state: ExchangeStore) => state.incomingProposals;
export const selectOutgoingProposals = (state: ExchangeStore) => state.outgoingProposals;
export const selectTradeHistory = (state: ExchangeStore) => state.tradeHistory;
export const selectNotifications = (state: ExchangeStore) => state.notifications;
export const selectIsHydrated = (state: ExchangeStore) => state.isHydrated;
