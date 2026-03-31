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
  getProposal: (proposalId: string) => TradeProposal | undefined;
  getMyPendingProposals: () => TradeProposal[];
  getIncomingPendingProposals: () => TradeProposal[];

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

      // Accept a trade proposal
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

      // Get a specific proposal
      getProposal: (proposalId: string) => {
        return (
          get().incomingProposals.find((p) => p.id === proposalId) ||
          get().outgoingProposals.find((p) => p.id === proposalId)
        );
      },

      // Get user's pending outgoing proposals
      getMyPendingProposals: () => {
        return get().outgoingProposals.filter((p) => p.status === 'pending');
      },

      // Get incoming pending proposals
      getIncomingPendingProposals: () => {
        return get().incomingProposals.filter((p) => p.status === 'pending');
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
