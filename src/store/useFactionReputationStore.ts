/**
 * Faction Reputation Store
 * 
 * Zustand store for managing faction reputation points and levels.
 * Persists to localStorage for user progress.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FactionReputationLevel,
  FactionReputation,
  getReputationLevel as getRepLevel,
  isVariantUnlockedForLevel,
} from '../types/factionReputation';

/**
 * Store state interface
 */
interface FactionReputationState {
  /** Reputation data for each faction */
  reputations: Record<string, number>;
  
  /** Total reputation earned across all factions */
  totalReputationEarned: number;
  
  /** Add reputation points to a faction */
  addReputation: (factionId: string, points: number) => void;
  
  /** Get current reputation for a faction */
  getReputation: (factionId: string) => number;
  
  /** Get reputation level for a faction */
  getReputationLevel: (factionId: string) => FactionReputationLevel;
  
  /** Check if a faction variant is unlocked */
  isVariantUnlocked: (factionId: string) => boolean;
  
  /** Get full reputation data for a faction */
  getReputationData: (factionId: string) => FactionReputation;
  
  /** Reset reputation for a faction */
  resetReputation: (factionId: string) => void;
  
  /** Reset all faction reputations */
  resetAllReputations: () => void;
  
  /** Award bonus reputation to all factions (for special events) */
  awardBonusReputation: (points: number) => void;
}

/**
 * Default faction IDs for the Arcane Machine Codex
 */
export const FACTION_IDS = ['void', 'inferno', 'storm', 'stellar'] as const;

/**
 * Default reputation state for all factions
 */
const getDefaultReputations = (): Record<string, number> => {
  const reputations: Record<string, number> = {};
  for (const factionId of FACTION_IDS) {
    reputations[factionId] = 0;
  }
  return reputations;
};

/**
 * Create the faction reputation store
 */
export const useFactionReputationStore = create<FactionReputationState>()(
  persist(
    (set, get) => ({
      /** Reputation data for each faction */
      reputations: getDefaultReputations(),
      
      /** Total reputation earned across all factions */
      totalReputationEarned: 0,

      /**
       * Add reputation points to a faction
       * Automatically updates level based on new total
       */
      addReputation: (factionId: string, points: number) => {
        set((state) => {
          const currentReputation = state.reputations[factionId] || 0;
          const newReputation = Math.max(0, currentReputation + points);
          
          return {
            reputations: {
              ...state.reputations,
              [factionId]: newReputation,
            },
            totalReputationEarned: state.totalReputationEarned + points,
          };
        });
      },

      /**
       * Get current reputation for a faction
       */
      getReputation: (factionId: string) => {
        return get().reputations[factionId] || 0;
      },

      /**
       * Get reputation level for a faction
       */
      getReputationLevel: (factionId: string): FactionReputationLevel => {
        const points = get().reputations[factionId] || 0;
        return getRepLevel(points);
      },

      /**
       * Check if a faction variant is unlocked
       * (Unlocked at Grandmaster rank, 2000+ reputation)
       */
      isVariantUnlocked: (factionId: string) => {
        const level = get().getReputationLevel(factionId);
        return isVariantUnlockedForLevel(level);
      },

      /**
       * Get full reputation data for a faction
       */
      getReputationData: (factionId: string): FactionReputation => {
        const points = get().reputations[factionId] || 0;
        const level = getRepLevel(points);
        
        return {
          factionId,
          points,
          level,
          totalEarned: points,
          lastUpdated: Date.now(),
        };
      },

      /**
       * Reset reputation for a specific faction
       */
      resetReputation: (factionId: string) => {
        set((state) => {
          const removedReputation = state.reputations[factionId] || 0;
          return {
            reputations: {
              ...state.reputations,
              [factionId]: 0,
            },
            totalReputationEarned: Math.max(0, state.totalReputationEarned - removedReputation),
          };
        });
      },

      /**
       * Reset all faction reputations
       */
      resetAllReputations: () => {
        set({
          reputations: getDefaultReputations(),
          totalReputationEarned: 0,
        });
      },

      /**
       * Award bonus reputation to all factions
       * Useful for special events or corrections
       */
      awardBonusReputation: (points: number) => {
        set((state) => {
          const newReputations = { ...state.reputations };
          for (const factionId of FACTION_IDS) {
            newReputations[factionId] = (newReputations[factionId] || 0) + points;
          }
          return {
            reputations: newReputations,
            totalReputationEarned: state.totalReputationEarned + (points * FACTION_IDS.length),
          };
        });
      },
    }),
    {
      /** Store name for persistence */
      name: 'arcane-machine-reputation-store',
      
      /** Version for future migrations */
      version: 1,
      
      /** Partialize to only persist specific fields */
      partialize: (state) => ({
        reputations: state.reputations,
        totalReputationEarned: state.totalReputationEarned,
      }),
      
      // FIX: Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
    }
  )
);

// FIX: Helper to manually trigger hydration
export const hydrateFactionReputationStore = () => {
  useFactionReputationStore.persist.rehydrate();
};

// FIX: Helper to check if hydration is complete
export const isFactionReputationHydrated = () => {
  return useFactionReputationStore.persist.hasHydrated();
};

/**
 * Hook to get all faction reputations at once
 */
export function useAllReputations() {
  return useFactionReputationStore((state) => state.reputations);
}

/**
 * Hook to get reputation for a specific faction
 */
export function useFactionReputation(factionId: string) {
  return useFactionReputationStore((state) => state.getReputation(factionId));
}

/**
 * Hook to get reputation level for a specific faction
 */
export function useFactionReputationLevel(factionId: string) {
  return useFactionReputationStore((state) => state.getReputationLevel(factionId));
}

/**
 * Hook to check if a faction variant is unlocked
 * FIX: Use selector to prevent full store subscription
 */
export function useIsVariantUnlocked(factionId: string) {
  // Use getState directly to avoid subscription
  const isUnlocked = useFactionReputationStore((state) => state.isVariantUnlocked(factionId));
  return isUnlocked;
}

// Selector for variant unlock status to prevent cascading updates
export const selectIsVariantUnlocked = (factionId: string) => (state: FactionReputationState) => {
  const level = getRepLevel(state.reputations[factionId] || 0);
  return isVariantUnlockedForLevel(level);
};

export default useFactionReputationStore;
