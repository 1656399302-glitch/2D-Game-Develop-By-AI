/**
 * Faction Reputation Store
 * 
 * Zustand store for managing faction reputation points and levels.
 * Also handles research system for tech tree progression.
 * Persists to localStorage for user progress.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FactionReputationLevel,
  FactionReputation,
  getReputationLevel as getRepLevel,
  isVariantUnlockedForLevel,
  RESEARCH_DURATION_MS,
  MAX_RESEARCH_QUEUE,
  ResearchItem,
} from '../types/factionReputation';
import { TechTreeNode, TECH_TREE_REQUIREMENTS, FactionId, FACTIONS } from '../types/factions';
import { useFactionStore } from './useFactionStore';

/**
 * Result types for research operations
 */
export type ResearchResult = 'ok' | 'queue_full' | 'already_researching' | 'locked';

/**
 * Store state interface
 */
interface FactionReputationState {
  /** Reputation data for each faction */
  reputations: Record<string, number>;
  
  /** Total reputation earned across all factions */
  totalReputationEarned: number;
  
  /** Current research items (techId -> { startedAt, durationMs }) */
  currentResearch: Record<string, ResearchItem>;
  
  /** Completed research per faction (factionId -> techId[]) */
  completedResearch: Record<string, string[]>;
  
  // ========== Research Methods ==========
  
  /** Start researching a tech */
  researchTech: (techId: string, factionId: string) => ResearchResult;
  
  /** Complete a research and unlock the tech */
  completeResearch: (techId: string, factionId: string) => void;
  
  /** Get all researchable techs for a faction (available state) */
  getResearchableTechs: (factionId: string) => TechTreeNode[];
  
  /** Get required reputation for a tech */
  getRequiredReputation: (techId: string) => number;
  
  /** Get current research items for a faction */
  getCurrentResearch: (factionId: string) => ResearchItem[];
  
  /** Cancel a research */
  cancelResearch: (techId: string, factionId: string) => void;
  
  // ========== Existing Reputation Methods ==========
  
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
 * Get tech tree node config by techId
 */
const getTechTreeNodeConfig = (techId: string): { faction: FactionId; tier: number } | null => {
  const parts = techId.split('-tier-');
  if (parts.length !== 2) return null;
  const faction = parts[0] as FactionId;
  const tier = parseInt(parts[1], 10);
  if (!['void', 'inferno', 'storm', 'stellar'].includes(faction)) return null;
  if (![1, 2, 3].includes(tier)) return null;
  return { faction, tier };
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
      
      /** Current research items */
      currentResearch: {},
      
      /** Completed research per faction */
      completedResearch: {},

      // ========== Research Methods ==========

      /**
       * Start researching a tech
       * @returns 'ok' if started successfully, error code otherwise
       */
      researchTech: (techId: string, factionId: string): ResearchResult => {
        const state = get();
        
        // Check if already researching this tech
        if (state.currentResearch[techId]) {
          return 'already_researching';
        }
        
        // Check if already completed
        const completedForFaction = state.completedResearch[factionId] || [];
        if (completedForFaction.includes(techId)) {
          return 'already_researching';
        }
        
        // Check reputation requirement
        const nodeConfig = getTechTreeNodeConfig(techId);
        if (!nodeConfig) {
          return 'locked';
        }
        
        const requiredRep = state.getRequiredReputation(techId);
        const currentRep = state.reputations[factionId] || 0;
        if (currentRep < requiredRep) {
          return 'locked';
        }
        
        // Check queue capacity
        const currentResearchCount = Object.keys(state.currentResearch).length;
        if (currentResearchCount >= MAX_RESEARCH_QUEUE) {
          return 'queue_full';
        }
        
        // Start research
        set((s) => ({
          currentResearch: {
            ...s.currentResearch,
            [techId]: {
              techId,
              startedAt: Date.now(),
              durationMs: RESEARCH_DURATION_MS,
            },
          },
        }));
        
        return 'ok';
      },

      /**
       * Complete a research and unlock the tech
       * Calls unlockTechTreeNode on the faction store
       */
      completeResearch: (techId: string, factionId: string) => {
        const state = get();
        
        // Check if research exists
        if (!state.currentResearch[techId]) {
          return;
        }
        
        // Remove from current research
        const newCurrentResearch = { ...state.currentResearch };
        delete newCurrentResearch[techId];
        
        // Add to completed research
        const completedForFaction = state.completedResearch[factionId] || [];
        const newCompletedResearch = {
          ...state.completedResearch,
          [factionId]: [...completedForFaction, techId],
        };
        
        set({
          currentResearch: newCurrentResearch,
          completedResearch: newCompletedResearch,
        });
        
        // Unlock the tech tree node in faction store
        useFactionStore.getState().unlockTechTreeNode(techId);
      },

      /**
       * Get all researchable techs for a faction (available state)
       * Returns techs only for the specified factionId
       */
      getResearchableTechs: (factionId: string): TechTreeNode[] => {
        const state = get();
        const availableTechs: TechTreeNode[] = [];
        const fid = factionId as FactionId;
        
        // Iterate through tiers for the given faction only
        for (let tier = 1; tier <= 3; tier++) {
          const techId = `${fid}-tier-${tier}`;
          const requiredRep = state.getRequiredReputation(techId);
          const currentRep = state.reputations[fid] || 0;
          
          // Check if completed
          const completedForFaction = state.completedResearch[fid] || [];
          const isCompleted = completedForFaction.includes(techId);
          
          // Check if researching
          const isResearching = !!state.currentResearch[techId];
          
          // Check reputation
          const hasEnoughRep = currentRep >= requiredRep;
          
          // Tech is available if: has enough rep, not completed, not researching
          if (hasEnoughRep && !isCompleted && !isResearching) {
            const rowIndex = FACTIONS[fid] ? Object.keys(FACTIONS).indexOf(fid) : 0;
            availableTechs.push({
              id: techId,
              faction: fid,
              tier: tier as 1 | 2 | 3,
              name: `${fid} Tier ${tier}`,
              description: `${fid} research tier ${tier}`,
              unlockRequirement: requiredRep,
              isUnlocked: isCompleted,
              position: { row: rowIndex, col: tier - 1 },
            });
          }
        }
        
        return availableTechs;
      },

      /**
       * Get required reputation for a tech
       */
      getRequiredReputation: (techId: string): number => {
        const nodeConfig = getTechTreeNodeConfig(techId);
        if (!nodeConfig) return 9999;
        return TECH_TREE_REQUIREMENTS[nodeConfig.tier as keyof typeof TECH_TREE_REQUIREMENTS] || 9999;
      },

      /**
       * Get current research items for a faction
       */
      getCurrentResearch: (factionId: string): ResearchItem[] => {
        const state = get();
        const items: ResearchItem[] = [];
        
        for (const techId of Object.keys(state.currentResearch)) {
          const nodeConfig = getTechTreeNodeConfig(techId);
          if (nodeConfig && nodeConfig.faction === factionId) {
            items.push(state.currentResearch[techId]);
          }
        }
        
        return items;
      },

      /**
       * Cancel a research
       */
      cancelResearch: (techId: string, _factionId: string) => {
        const state = get();
        
        // Only cancel if this research exists
        const nodeConfig = getTechTreeNodeConfig(techId);
        if (!nodeConfig) {
          return;
        }
        
        const newCurrentResearch = { ...state.currentResearch };
        delete newCurrentResearch[techId];
        
        set({ currentResearch: newCurrentResearch });
      },

      // ========== Existing Reputation Methods ==========

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
      version: 2,
      
      /** Partialize to only persist specific fields */
      partialize: (state) => ({
        reputations: state.reputations,
        totalReputationEarned: state.totalReputationEarned,
        currentResearch: state.currentResearch,
        completedResearch: state.completedResearch,
      }),
      
      // Skip automatic hydration to prevent cascading state updates
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
 */
export function useIsVariantUnlocked(factionId: string) {
  const isUnlocked = useFactionReputationStore((state) => state.isVariantUnlocked(factionId));
  return isUnlocked;
}

// Selector for variant unlock status to prevent cascading updates
export const selectIsVariantUnlocked = (factionId: string) => (state: FactionReputationState) => {
  const level = getRepLevel(state.reputations[factionId] || 0);
  return isVariantUnlockedForLevel(level);
};

export default useFactionReputationStore;
