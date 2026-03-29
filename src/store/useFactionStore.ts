/**
 * Faction Store
 * 
 * Zustand store for managing faction progress and tech tree unlocks.
 * Persists data to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FactionId, TechTreeNode, generateTechTreeNodes } from '../types/factions';

interface FactionStore {
  // Faction machine counts (for tech tree progression)
  factionCounts: Record<FactionId, number>;
  
  // Tech tree unlock status
  techTreeUnlocks: Record<string, boolean>;
  
  // Selected faction alignment
  selectedFaction: FactionId | null;
  
  // Actions
  incrementFactionCount: (faction: FactionId) => void;
  setSelectedFaction: (faction: FactionId | null) => void;
  unlockTechTreeNode: (nodeId: string) => void;
  getTechTreeNodes: () => TechTreeNode[];
  getFactionCount: (faction: FactionId) => number;
  isTechTreeNodeUnlocked: (nodeId: string) => boolean;
  resetFactionProgress: () => void;
}

// Storage key for localStorage
const STORAGE_KEY = 'arcane-machine-faction-store';

export const useFactionStore = create<FactionStore>()(
  persist(
    (set, get) => ({
      // Initial state
      factionCounts: {
        void: 0,
        inferno: 0,
        storm: 0,
        stellar: 0,
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
      
      // Reset all faction progress
      resetFactionProgress: () => {
        set({
          factionCounts: {
            void: 0,
            inferno: 0,
            storm: 0,
            stellar: 0,
          },
          techTreeUnlocks: {},
          selectedFaction: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);

export default useFactionStore;
