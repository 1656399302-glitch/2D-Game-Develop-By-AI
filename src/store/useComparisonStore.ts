/**
 * Comparison Store
 * 
 * Zustand store for managing machine comparison state.
 * Used by the MachineComparisonPanel to track selected machines.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CodexEntry } from '../types';

interface SavedComparison {
  id: string;
  machineA: CodexEntry;
  machineB: CodexEntry;
  createdAt: number;
  name?: string;
}

interface ComparisonState {
  // Selected machines for comparison
  selectedMachineA: CodexEntry | null;
  selectedMachineB: CodexEntry | null;
  
  // Saved comparisons (P1 feature)
  savedComparisons: SavedComparison[];
  
  // Actions
  selectMachineA: (entry: CodexEntry | null) => void;
  selectMachineB: (entry: CodexEntry | null) => void;
  swapMachines: () => void;
  clearSelection: () => void;
  
  // Saved comparisons actions (P1)
  saveComparison: (name?: string) => void;
  removeComparison: (id: string) => void;
  loadComparison: (id: string) => void;
  
  // Getters
  hasBothSelected: () => boolean;
  getComparisonName: () => string;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      selectedMachineA: null,
      selectedMachineB: null,
      savedComparisons: [],
      
      selectMachineA: (entry) => {
        set({ selectedMachineA: entry });
      },
      
      selectMachineB: (entry) => {
        set({ selectedMachineB: entry });
      },
      
      swapMachines: () => {
        const { selectedMachineA, selectedMachineB } = get();
        set({
          selectedMachineA: selectedMachineB,
          selectedMachineB: selectedMachineA,
        });
      },
      
      clearSelection: () => {
        set({
          selectedMachineA: null,
          selectedMachineB: null,
        });
      },
      
      saveComparison: (name) => {
        const { selectedMachineA, selectedMachineB, savedComparisons } = get();
        
        if (!selectedMachineA || !selectedMachineB) return;
        
        const comparison: SavedComparison = {
          id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          machineA: selectedMachineA,
          machineB: selectedMachineB,
          createdAt: Date.now(),
          name,
        };
        
        set({
          savedComparisons: [...savedComparisons, comparison],
        });
      },
      
      removeComparison: (id) => {
        set((state) => ({
          savedComparisons: state.savedComparisons.filter((c) => c.id !== id),
        }));
      },
      
      loadComparison: (id) => {
        const { savedComparisons } = get();
        const comparison = savedComparisons.find((c) => c.id === id);
        
        if (comparison) {
          set({
            selectedMachineA: comparison.machineA,
            selectedMachineB: comparison.machineB,
          });
        }
      },
      
      hasBothSelected: () => {
        const { selectedMachineA, selectedMachineB } = get();
        return selectedMachineA !== null && selectedMachineB !== null;
      },
      
      getComparisonName: () => {
        const { selectedMachineA, selectedMachineB } = get();
        if (!selectedMachineA || !selectedMachineB) return '';
        
        return `${selectedMachineA.name} vs ${selectedMachineB.name}`;
      },
    }),
    {
      name: 'arcane-comparison-storage',
      // Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
    }
  )
);

// Helper to manually trigger hydration
export const hydrateComparisonStore = () => {
  useComparisonStore.persist.rehydrate();
};

// Helper to check if hydration is complete
export const isComparisonHydrated = () => {
  return useComparisonStore.persist.hasHydrated();
};

// Selector hooks
export const useSelectedMachineA = () => {
  return useComparisonStore((state) => state.selectedMachineA);
};

export const useSelectedMachineB = () => {
  return useComparisonStore((state) => state.selectedMachineB);
};

export const useSavedComparisons = () => {
  return useComparisonStore((state) => state.savedComparisons);
};

export const useHasBothSelected = () => {
  return useComparisonStore((state) => state.selectedMachineA !== null && state.selectedMachineB !== null);
};

export default useComparisonStore;
