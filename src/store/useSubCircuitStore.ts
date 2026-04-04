/**
 * Sub-Circuit Store
 * 
 * Round 129: Sub-circuit Module System
 * 
 * Zustand store for managing custom sub-circuits with localStorage persistence.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  SubCircuitModule,
  SubCircuitStoreState,
  CreateSubCircuitInput,
  CreateSubCircuitResult,
  DeleteSubCircuitResult,
  MAX_CUSTOM_SUB_CIRCUITS,
  SUB_CIRCUIT_STORAGE_KEY,
  isValidSubCircuitName,
  isNameUnique,
} from '../types/subCircuit';

// ============================================================================
// Store Interface
// ============================================================================

interface SubCircuitStore extends SubCircuitStoreState {
  // Actions
  createSubCircuit: (input: CreateSubCircuitInput) => CreateSubCircuitResult;
  deleteSubCircuit: (subCircuitId: string) => DeleteSubCircuitResult;
  
  // Queries
  getSubCircuitById: (subCircuitId: string) => SubCircuitModule | undefined;
  getAllSubCircuits: () => SubCircuitModule[];
  isNameTaken: (name: string) => boolean;
  canCreateMore: () => boolean;
  
  // Bulk operations
  clearAllSubCircuits: () => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useSubCircuitStore = create<SubCircuitStore>()(
  persist(
    (set, get) => ({
      // Initial state
      subCircuits: [],
      maxSubCircuits: MAX_CUSTOM_SUB_CIRCUITS,

      /**
       * Create a new sub-circuit module
       */
      createSubCircuit: (input: CreateSubCircuitInput): CreateSubCircuitResult => {
        const { name, moduleIds, description } = input;
        const state = get();
        
        // Validate name
        if (!isValidSubCircuitName(name)) {
          return {
            success: false,
            error: '名称无效：长度必须在1-50个字符之间',
          };
        }
        
        // Check for duplicate name
        if (!isNameUnique(name, state.subCircuits)) {
          return {
            success: false,
            error: `子电路 "${name}" 已存在，请使用不同的名称`,
          };
        }
        
        // Check limit
        if (state.subCircuits.length >= MAX_CUSTOM_SUB_CIRCUITS) {
          return {
            success: false,
            error: `已达到最大数量限制（${MAX_CUSTOM_SUB_CIRCUITS}个），请删除现有子电路后再试`,
          };
        }
        
        // Validate moduleIds
        if (!moduleIds || moduleIds.length < 2) {
          return {
            success: false,
            error: '子电路至少需要包含2个模块',
          };
        }
        
        // Create the sub-circuit
        const now = Date.now();
        const newSubCircuit: SubCircuitModule = {
          id: uuidv4(),
          name: name.trim(),
          moduleIds: [...new Set(moduleIds)], // Remove duplicates
          createdAt: now,
          updatedAt: now,
          description: description?.trim(),
        };
        
        set((state) => ({
          subCircuits: [...state.subCircuits, newSubCircuit],
        }));
        
        return {
          success: true,
          subCircuit: newSubCircuit,
        };
      },

      /**
       * Delete a sub-circuit module
       */
      deleteSubCircuit: (subCircuitId: string): DeleteSubCircuitResult => {
        const state = get();
        
        // Find the sub-circuit
        const existing = state.subCircuits.find((sc) => sc.id === subCircuitId);
        if (!existing) {
          return {
            success: false,
            error: '子电路不存在',
          };
        }
        
        // Remove from store
        set((state) => ({
          subCircuits: state.subCircuits.filter((sc) => sc.id !== subCircuitId),
        }));
        
        return {
          success: true,
        };
      },

      /**
       * Get a sub-circuit by ID
       */
      getSubCircuitById: (subCircuitId: string): SubCircuitModule | undefined => {
        return get().subCircuits.find((sc) => sc.id === subCircuitId);
      },

      /**
       * Get all sub-circuits
       */
      getAllSubCircuits: (): SubCircuitModule[] => {
        return [...get().subCircuits].sort((a, b) => b.createdAt - a.createdAt);
      },

      /**
       * Check if a name is already taken
       */
      isNameTaken: (name: string): boolean => {
        return !isNameUnique(name, get().subCircuits);
      },

      /**
       * Check if more sub-circuits can be created
       */
      canCreateMore: (): boolean => {
        return get().subCircuits.length < MAX_CUSTOM_SUB_CIRCUITS;
      },

      /**
       * Clear all sub-circuits
       */
      clearAllSubCircuits: (): void => {
        set({ subCircuits: [] });
      },
    }),
    {
      name: SUB_CIRCUIT_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        subCircuits: state.subCircuits,
      }),
      // Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error('[useSubCircuitStore] Hydration failed:', error);
          }
        };
      },
    }
  )
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Manual hydration trigger for sub-circuit store
 */
export const hydrateSubCircuitStore = () => {
  useSubCircuitStore.persist.rehydrate();
};

/**
 * Check if sub-circuit store has hydrated
 */
export const isSubCircuitHydrated = (): boolean => {
  return useSubCircuitStore.persist.hasHydrated();
};

/**
 * Get sub-circuit count
 */
export const getSubCircuitCount = (): number => {
  return useSubCircuitStore.getState().subCircuits.length;
};

export default useSubCircuitStore;
