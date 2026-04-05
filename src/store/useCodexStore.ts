import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { CodexEntry, PlacedModule, Connection, GeneratedAttributes, Rarity } from '../types';

interface CodexStore {
  entries: CodexEntry[];
  addEntry: (
    name: string,
    modules: PlacedModule[],
    connections: Connection[],
    attributes: GeneratedAttributes
  ) => CodexEntry;
  removeEntry: (id: string) => void;
  getEntry: (id: string) => CodexEntry | undefined;
  getEntriesByRarity: (rarity: Rarity) => CodexEntry[];
  getEntryCount: () => number;
  checkRecipeUnlocks: () => void;
  // ROUND 154: Added faction tier module unlock method
  syncFactionTierUnlocks: () => void;
}

export const useCodexStore = create<CodexStore>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (name, modules, connections, attributes) => {
        const entry: CodexEntry = {
          id: uuidv4(),
          codexId: `MC-${String(get().entries.length + 1).padStart(4, '0')}`,
          name,
          rarity: attributes.rarity,
          modules,
          connections,
          attributes,
          createdAt: Date.now(),
        };

        set((state) => ({
          entries: [...state.entries, entry],
        }));

        // ROUND 102: Recipe System Integration
        // Check if machine creation unlocks any recipes
        setTimeout(() => {
          get().checkRecipeUnlocks();
        }, 0);
        
        // ROUND 154: Faction tier module unlocks
        // Sync faction counts from codex and trigger module unlocks
        setTimeout(() => {
          get().syncFactionTierUnlocks();
        }, 0);

        return entry;
      },

      removeEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
        
        // ROUND 154: Sync faction tier unlocks after removal
        setTimeout(() => {
          get().syncFactionTierUnlocks();
        }, 0);
      },

      getEntry: (id) => {
        return get().entries.find((e) => e.id === id);
      },

      getEntriesByRarity: (rarity) => {
        return get().entries.filter((e) => e.rarity === rarity);
      },

      getEntryCount: () => {
        return get().entries.length;
      },

      /**
       * ROUND 102: Recipe System Integration
       * Check if machine creation count unlocks any recipes
       * Called after a machine is saved to the codex
       */
      checkRecipeUnlocks: () => {
        // Dynamic import to avoid circular dependency at module load time
        import('./useRecipeStore').then(({ useRecipeStore }) => {
          const currentCount = get().entries.length;
          useRecipeStore.getState().checkMachinesCreatedUnlock(currentCount);
        }).catch((err) => {
          console.warn('[CodexStore] Failed to import recipe store:', err);
        });
      },
      
      /**
       * ROUND 154: Faction Tier Module Unlocks
       * Sync faction counts from codex entries and trigger module unlocks
       * This is called when machines are added to or removed from the codex
       */
      syncFactionTierUnlocks: () => {
        // Dynamic import to avoid circular dependency at module load time
        import('./useFactionStore').then(({ useFactionStore }) => {
          const allEntries = get().entries;
          const newlyUnlocked = useFactionStore.getState().syncFactionCountsFromCodex(allEntries);
          
          if (newlyUnlocked.length > 0) {
            console.log('[CodexStore] Faction tier modules unlocked:', newlyUnlocked);
          }
        }).catch((err) => {
          console.warn('[CodexStore] Failed to import faction store:', err);
        });
      },
    }),
    {
      name: 'arcane-codex-storage',
      // FIX: Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
    }
  )
);

// FIX: Helper to manually trigger hydration
export const hydrateCodexStore = () => {
  useCodexStore.persist.rehydrate();
};

// FIX: Helper to check if hydration is complete
export const isCodexHydrated = () => {
  return useCodexStore.persist.hasHydrated();
};

/**
 * Hook to get codex entries count
 */
export function useCodexEntryCount() {
  return useCodexStore((state) => state.entries.length);
}

/**
 * Hook to get all codex entries
 */
export function useCodexEntries() {
  return useCodexStore((state) => state.entries);
}
