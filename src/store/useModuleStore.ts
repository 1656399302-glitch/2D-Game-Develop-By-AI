/**
 * Module Store
 * 
 * Zustand store for managing unlocked circuit modules.
 * Tracks module unlocks including faction-based unlocks when faction tiers are completed.
 * 
 * ROUND 154: Initial implementation
 * - Tier 2 (≥7 machines for a faction) → unlocks 2 tier-2 modules
 * - Tier 3 (≥15 machines for a faction) → unlocks 2 tier-3 modules
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FactionId, FACTIONS } from '../types/factions';

// Faction tier thresholds
export const FACTION_TIER_THRESHOLDS = {
  TIER_2: 7,  // ≥7 machines for a faction unlocks tier 2
  TIER_3: 15, // ≥15 machines for a faction unlocks tier 3
} as const;

// Module ID format: {factionId}-t{tier}-{moduleLetter}
// e.g., void-t2-a, void-t2-b, void-t3-a, void-t3-b

export interface FactionModule {
  id: string;
  factionId: FactionId;
  tier: 2 | 3;
  name: string;
  nameCn: string;
  description: string;
  icon: string;
}

/**
 * Generate all faction tier modules
 */
function generateFactionModules(): FactionModule[] {
  const modules: FactionModule[] = [];
  const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar', 'arcane', 'chaos'];
  
  const tierDescriptions: Record<number, { name: string; nameCn: string; desc: string }> = {
    2: {
      name: 'Advanced',
      nameCn: '进阶',
      desc: 'Advanced faction module unlocked at tier 2',
    },
    3: {
      name: 'Ultimate',
      nameCn: '究极',
      desc: 'Ultimate faction module unlocked at tier 3',
    },
  };
  
  for (const factionId of factionIds) {
    const faction = FACTIONS[factionId];
    
    // Generate tier-2 modules (2 modules)
    for (let letter = 0; letter < 2; letter++) {
      const moduleLetter = letter === 0 ? 'a' : 'b';
      modules.push({
        id: `${factionId}-t2-${moduleLetter}`,
        factionId,
        tier: 2,
        name: `${faction.name} ${tierDescriptions[2].name} ${moduleLetter.toUpperCase()}`,
        nameCn: `${faction.nameCn}${tierDescriptions[2].nameCn}${letter + 1}`,
        description: `${faction.description} ${tierDescriptions[2].desc}.`,
        icon: faction.icon,
      });
    }
    
    // Generate tier-3 modules (2 modules)
    for (let letter = 0; letter < 2; letter++) {
      const moduleLetter = letter === 0 ? 'a' : 'b';
      modules.push({
        id: `${factionId}-t3-${moduleLetter}`,
        factionId,
        tier: 3,
        name: `${faction.name} ${tierDescriptions[3].name} ${moduleLetter.toUpperCase()}`,
        nameCn: `${faction.nameCn}${tierDescriptions[3].nameCn}${letter + 1}`,
        description: `${faction.description} ${tierDescriptions[3].desc}.`,
        icon: faction.icon,
      });
    }
  }
  
  return modules;
}

/**
 * All available faction tier modules
 */
export const FACTION_MODULES = generateFactionModules();

/**
 * Get all module IDs for a specific faction and tier
 */
export function getFactionTierModuleIds(factionId: FactionId, tier: 2 | 3): string[] {
  return FACTION_MODULES
    .filter(m => m.factionId === factionId && m.tier === tier)
    .map(m => m.id);
}

/**
 * Get faction tier from machine count
 */
export function getFactionTier(machineCount: number): 0 | 1 | 2 | 3 {
  if (machineCount >= FACTION_TIER_THRESHOLDS.TIER_3) return 3;
  if (machineCount >= FACTION_TIER_THRESHOLDS.TIER_2) return 2;
  if (machineCount >= 3) return 1;
  return 0;
}

interface ModuleStore {
  /** Set of unlocked module IDs */
  unlockedModules: Set<string>;
  
  /** Faction tier progress: factionId -> highest tier reached */
  factionTierProgress: Record<FactionId, number>;
  
  // Actions
  
  /**
   * Unlock a module by ID (idempotent)
   */
  unlockModule: (moduleId: string) => void;
  
  /**
   * Check if a module is unlocked
   */
  isModuleUnlocked: (moduleId: string) => boolean;
  
  /**
   * Get all unlocked modules
   */
  getUnlockedModules: () => string[];
  
  /**
   * Check and unlock faction tier modules based on machine count
   * Called when faction machine count changes
   * 
   * @param factionId - The faction to check
   * @param machineCount - Current machine count for that faction
   * @returns Array of newly unlocked module IDs
   */
  checkAndUnlockFactionModules: (factionId: FactionId, machineCount: number) => string[];
  
  /**
   * Get all faction tier modules for a specific faction and tier
   */
  getFactionTierModules: (factionId: FactionId, tier: 2 | 3) => FactionModule[];
  
  /**
   * Get all unlocked faction modules for a specific faction
   */
  getUnlockedFactionModules: (factionId: FactionId) => FactionModule[];
  
  /**
   * Get the highest tier reached for a faction
   */
  getFactionHighestTier: (factionId: FactionId) => number;
  
  /**
   * Reset all module unlocks
   */
  resetAllUnlocks: () => void;
  
  /**
   * Reset faction tier progress for a specific faction
   */
  resetFactionProgress: (factionId: FactionId) => void;
}

// Storage key for localStorage
const STORAGE_KEY = 'arcane-machine-module-store';

export const useModuleStore = create<ModuleStore>()(
  persist(
    (set, get) => ({
      /** Set of unlocked module IDs */
      unlockedModules: new Set<string>(),
      
      /** Faction tier progress */
      factionTierProgress: {
        void: 0,
        inferno: 0,
        storm: 0,
        stellar: 0,
        arcane: 0,
        chaos: 0,
      },
      
      /**
       * Unlock a module by ID (idempotent)
       */
      unlockModule: (moduleId: string) => {
        set((state) => {
          // Skip if already unlocked
          if (state.unlockedModules.has(moduleId)) {
            return state;
          }
          
          const newUnlockedModules = new Set(state.unlockedModules);
          newUnlockedModules.add(moduleId);
          
          return { unlockedModules: newUnlockedModules };
        });
      },
      
      /**
       * Check if a module is unlocked
       */
      isModuleUnlocked: (moduleId: string) => {
        return get().unlockedModules.has(moduleId);
      },
      
      /**
       * Get all unlocked modules
       */
      getUnlockedModules: () => {
        return Array.from(get().unlockedModules);
      },
      
      /**
       * Check and unlock faction tier modules based on machine count
       */
      checkAndUnlockFactionModules: (factionId: FactionId, machineCount: number) => {
        const state = get();
        const currentHighestTier = state.factionTierProgress[factionId] || 0;
        const newTier = getFactionTier(machineCount);
        
        // Skip if tier hasn't improved
        if (newTier <= currentHighestTier) {
          return [];
        }
        
        const newlyUnlocked: string[] = [];
        
        // Unlock tier-2 modules if reaching tier 2
        if (newTier >= 2 && currentHighestTier < 2) {
          const tier2Modules = getFactionTierModuleIds(factionId, 2);
          for (const moduleId of tier2Modules) {
            if (!state.unlockedModules.has(moduleId)) {
              newlyUnlocked.push(moduleId);
            }
          }
        }
        
        // Unlock tier-3 modules if reaching tier 3
        if (newTier >= 3 && currentHighestTier < 3) {
          const tier3Modules = getFactionTierModuleIds(factionId, 3);
          for (const moduleId of tier3Modules) {
            if (!state.unlockedModules.has(moduleId)) {
              newlyUnlocked.push(moduleId);
            }
          }
        }
        
        // Update state if there are new unlocks
        if (newlyUnlocked.length > 0) {
          set((state) => {
            const newUnlockedModules = new Set(state.unlockedModules);
            for (const moduleId of newlyUnlocked) {
              newUnlockedModules.add(moduleId);
            }
            
            return {
              unlockedModules: newUnlockedModules,
              factionTierProgress: {
                ...state.factionTierProgress,
                [factionId]: newTier,
              },
            };
          });
        } else {
          // Just update tier progress
          set((state) => ({
            factionTierProgress: {
              ...state.factionTierProgress,
              [factionId]: newTier,
            },
          }));
        }
        
        return newlyUnlocked;
      },
      
      /**
       * Get all faction tier modules for a specific faction and tier
       */
      getFactionTierModules: (factionId: FactionId, tier: 2 | 3) => {
        return FACTION_MODULES.filter(m => m.factionId === factionId && m.tier === tier);
      },
      
      /**
       * Get all unlocked faction modules for a specific faction
       */
      getUnlockedFactionModules: (factionId: FactionId) => {
        const state = get();
        return FACTION_MODULES.filter(
          m => m.factionId === factionId && state.unlockedModules.has(m.id)
        );
      },
      
      /**
       * Get the highest tier reached for a faction
       */
      getFactionHighestTier: (factionId: FactionId) => {
        return get().factionTierProgress[factionId] || 0;
      },
      
      /**
       * Reset all module unlocks
       */
      resetAllUnlocks: () => {
        set({
          unlockedModules: new Set<string>(),
          factionTierProgress: {
            void: 0,
            inferno: 0,
            storm: 0,
            stellar: 0,
            arcane: 0,
            chaos: 0,
          },
        });
      },
      
      /**
       * Reset faction tier progress for a specific faction
       */
      resetFactionProgress: (factionId: FactionId) => {
        set((state) => ({
          factionTierProgress: {
            ...state.factionTierProgress,
            [factionId]: 0,
          },
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      // Custom serializer to handle Set
      partialize: (state) => ({
        unlockedModules: Array.from(state.unlockedModules),
        factionTierProgress: state.factionTierProgress,
      }),
      // Custom deserializer to restore Set
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.unlockedModules)) {
          // Convert array back to Set (Zustand will merge this)
          // Note: This is handled in the merge step below
        }
      },
      // Merge storage state with initial state
      merge: (persistedState: any, currentState) => {
        if (persistedState?.unlockedModules) {
          return {
            ...currentState,
            ...persistedState,
            unlockedModules: new Set(persistedState.unlockedModules),
          };
        }
        return currentState;
      },
      // Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
    }
  )
);

// Helper to manually trigger hydration
export const hydrateModuleStore = () => {
  useModuleStore.persist.rehydrate();
};

// Helper to check if hydration is complete
export const isModuleHydrated = () => {
  return useModuleStore.persist.hasHydrated();
};

export default useModuleStore;
