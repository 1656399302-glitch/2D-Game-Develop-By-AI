/**
 * Faction Store
 * 
 * Zustand store for managing faction progress and tech tree unlocks.
 * Persists data to localStorage.
 * 
 * ROUND 80: Extended to 6 factions per contract specification.
 * ROUND 154: Added faction tier → module unlock integration.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FactionId, TechTreeNode, generateTechTreeNodes } from '../types/factions';
import { MODULE_TO_FACTION } from '../types/factions';
import type { CodexEntry } from '../types';
import { useModuleStore } from './useModuleStore';

// Faction tier thresholds
export const FACTION_TIER_THRESHOLDS = {
  TIER_2: 7,  // ≥7 machines for a faction unlocks tier 2
  TIER_3: 15, // ≥15 machines for a faction unlocks tier 3
} as const;

interface FactionStore {
  // Faction machine counts (for tech tree progression)
  factionCounts: Record<FactionId, number>;
  
  // Tech tree unlock status
  techTreeUnlocks: Record<string, boolean>;
  
  // Selected faction alignment
  selectedFaction: FactionId | null;
  
  // Actions
  incrementFactionCount: (faction: FactionId) => void;
  setFactionCount: (faction: FactionId, count: number) => void;
  setSelectedFaction: (faction: FactionId | null) => void;
  unlockTechTreeNode: (nodeId: string) => void;
  getTechTreeNodes: () => TechTreeNode[];
  getFactionCount: (faction: FactionId) => number;
  isTechTreeNodeUnlocked: (nodeId: string) => boolean;
  resetFactionProgress: () => void;
  
  // ROUND 154: Faction tier module unlock methods
  /**
   * Calculate faction counts from codex entries
   * Based on dominant faction of each machine
   */
  calculateFactionCountsFromCodex: (entries: CodexEntry[]) => Record<FactionId, number>;
  
  /**
   * Update faction machine count and trigger module unlocks
   * Called when machines are added to codex or imported
   */
  updateFactionMachineCount: (faction: FactionId, newCount: number) => void;
  
  /**
   * Sync faction counts from codex and trigger all module unlocks
   * Call this when codex changes
   */
  syncFactionCountsFromCodex: (entries: CodexEntry[]) => string[];
  
  /**
   * Get current faction tier based on machine count
   */
  getFactionTier: (faction: FactionId) => 0 | 1 | 2 | 3;
}

// Storage key for localStorage
const STORAGE_KEY = 'arcane-machine-faction-store';

/**
 * Calculate dominant faction from modules
 */
function calculateDominantFaction(modules: CodexEntry['modules']): FactionId | null {
  const factionModuleCounts: Record<FactionId, number> = {
    void: 0,
    inferno: 0,
    storm: 0,
    stellar: 0,
    arcane: 0,
    chaos: 0,
  };
  
  modules.forEach(module => {
    const faction = MODULE_TO_FACTION[module.type];
    if (faction) {
      factionModuleCounts[faction]++;
    }
  });
  
  // Find the faction with the most modules
  let maxCount = 0;
  let dominantFaction: FactionId | null = null;
  
  (Object.keys(factionModuleCounts) as FactionId[]).forEach(factionId => {
    if (factionModuleCounts[factionId] > maxCount) {
      maxCount = factionModuleCounts[factionId];
      dominantFaction = factionId;
    }
  });
  
  return dominantFaction;
}

/**
 * Get faction tier from machine count
 */
function getTierFromCount(count: number): 0 | 1 | 2 | 3 {
  if (count >= FACTION_TIER_THRESHOLDS.TIER_3) return 3;
  if (count >= FACTION_TIER_THRESHOLDS.TIER_2) return 2;
  if (count >= 3) return 1;
  return 0;
}

export const useFactionStore = create<FactionStore>()(
  persist(
    (set, get) => ({
      // Initial state - extended to 6 factions
      factionCounts: {
        void: 0,
        inferno: 0,
        storm: 0,
        stellar: 0,
        arcane: 0,
        chaos: 0,
      },
      
      techTreeUnlocks: {},
      
      selectedFaction: null,
      
      // Increment faction machine count and update unlocks
      incrementFactionCount: (faction) => {
        set((state) => {
          const newCounts = {
            ...state.factionCounts,
            [faction]: state.factionCounts[faction] + 1,
          };
          
          // Generate tech tree nodes with updated counts
          const nodes = generateTechTreeNodes(newCounts);
          
          // Check for new unlocks
          const newUnlocks: Record<string, boolean> = {};
          nodes.forEach((node) => {
            if (node.isUnlocked && !state.techTreeUnlocks[node.id]) {
              newUnlocks[node.id] = true;
            }
          });
          
          return {
            factionCounts: newCounts,
            techTreeUnlocks: {
              ...state.techTreeUnlocks,
              ...newUnlocks,
            },
          };
        });
      },
      
      // Set faction machine count directly (for syncing from codex)
      setFactionCount: (faction, count) => {
        set((state) => {
          const newCounts = {
            ...state.factionCounts,
            [faction]: count,
          };
          
          // Generate tech tree nodes with updated counts
          const nodes = generateTechTreeNodes(newCounts);
          
          // Check for new unlocks
          const newUnlocks: Record<string, boolean> = {};
          nodes.forEach((node) => {
            if (node.isUnlocked && !state.techTreeUnlocks[node.id]) {
              newUnlocks[node.id] = true;
            }
          });
          
          return {
            factionCounts: newCounts,
            techTreeUnlocks: {
              ...state.techTreeUnlocks,
              ...newUnlocks,
            },
          };
        });
      },
      
      // Set selected faction alignment
      setSelectedFaction: (faction) => {
        set({ selectedFaction: faction });
      },
      
      // Manually unlock a tech tree node
      unlockTechTreeNode: (nodeId) => {
        set((state) => ({
          techTreeUnlocks: {
            ...state.techTreeUnlocks,
            [nodeId]: true,
          },
        }));
      },
      
      // Get current tech tree nodes with unlock status
      getTechTreeNodes: () => {
        const { factionCounts, techTreeUnlocks } = get();
        const nodes = generateTechTreeNodes(factionCounts);
        
        // Update unlock status from store
        return nodes.map((node) => ({
          ...node,
          isUnlocked: techTreeUnlocks[node.id] || node.isUnlocked,
        }));
      },
      
      // Get faction count
      getFactionCount: (faction) => {
        return get().factionCounts[faction];
      },
      
      // Check if a tech tree node is unlocked
      isTechTreeNodeUnlocked: (nodeId) => {
        const { techTreeUnlocks } = get();
        const nodes = get().getTechTreeNodes();
        const node = nodes.find((n) => n.id === nodeId);
        return techTreeUnlocks[nodeId] || (node?.isUnlocked ?? false);
      },
      
      // Reset all faction progress - extended to 6 factions
      resetFactionProgress: () => {
        set({
          factionCounts: {
            void: 0,
            inferno: 0,
            storm: 0,
            stellar: 0,
            arcane: 0,
            chaos: 0,
          },
          techTreeUnlocks: {},
          selectedFaction: null,
        });
      },
      
      // ============================================
      // ROUND 154: Faction tier module unlock methods
      // ============================================
      
      /**
       * Calculate faction counts from codex entries
       */
      calculateFactionCountsFromCodex: (entries) => {
        const factionCounts: Record<FactionId, number> = {
          void: 0,
          inferno: 0,
          storm: 0,
          stellar: 0,
          arcane: 0,
          chaos: 0,
        };
        
        entries.forEach(entry => {
          // Use dominant faction from modules
          const dominantFaction = calculateDominantFaction(entry.modules);
          if (dominantFaction) {
            factionCounts[dominantFaction]++;
          }
        });
        
        return factionCounts;
      },
      
      /**
       * Update faction machine count and trigger module unlocks
       */
      updateFactionMachineCount: (faction, newCount) => {
        const state = get();
        const currentCount = state.factionCounts[faction] || 0;
        
        // Skip if count hasn't changed
        if (newCount === currentCount) {
          return;
        }
        
        // Update faction count in faction store
        get().setFactionCount(faction, newCount);
        
        // Check for module unlocks in module store
        const moduleStore = useModuleStore.getState();
        const newlyUnlocked = moduleStore.checkAndUnlockFactionModules(faction, newCount);
        
        if (newlyUnlocked.length > 0) {
          console.log(`[FactionStore] Unlocked modules for ${faction}:`, newlyUnlocked);
        }
      },
      
      /**
       * Sync faction counts from codex and trigger all module unlocks
       */
      syncFactionCountsFromCodex: (entries) => {
        const newFactionCounts = get().calculateFactionCountsFromCodex(entries);
        const state = get();
        const allNewlyUnlocked: string[] = [];
        
        // Update each faction count and check for unlocks
        (Object.keys(newFactionCounts) as FactionId[]).forEach(factionId => {
          const newCount = newFactionCounts[factionId];
          const currentCount = state.factionCounts[factionId] || 0;
          
          // Only update if count changed
          if (newCount !== currentCount) {
            get().setFactionCount(factionId, newCount);
            
            // Check for module unlocks
            const moduleStore = useModuleStore.getState();
            const newlyUnlocked = moduleStore.checkAndUnlockFactionModules(factionId, newCount);
            allNewlyUnlocked.push(...newlyUnlocked);
          }
        });
        
        return allNewlyUnlocked;
      },
      
      /**
       * Get current faction tier based on machine count
       */
      getFactionTier: (faction) => {
        const count = get().factionCounts[faction] || 0;
        return getTierFromCount(count);
      },
    }),
    {
      name: STORAGE_KEY,
      // Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
    }
  )
);

// Helper to manually trigger hydration
export const hydrateFactionStore = () => {
  useFactionStore.persist.rehydrate();
};

// Helper to check if hydration is complete
export const isFactionHydrated = () => {
  return useFactionStore.persist.hasHydrated();
};

// Selectors for common state slices
export const selectFactionCounts = (state: FactionStore) => state.factionCounts;
export const selectSelectedFaction = (state: FactionStore) => state.selectedFaction;

export default useFactionStore;
