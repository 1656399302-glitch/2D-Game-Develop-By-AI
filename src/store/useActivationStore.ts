/**
 * Activation Store
 * 
 * Zustand store for tracking machine activations.
 * Integrates with the Recipe System to check for unlock conditions
 * based on activation count (e.g., Void Siphon at 50 activations,
 * Fire Crystal at 10 activations).
 * 
 * ROUND 102: Recipe System Integration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Activation event for tracking individual machine activations
 */
export interface ActivationEvent {
  id: string;
  timestamp: number;
  machineId?: string;
  state: 'charging' | 'active' | 'overload' | 'failure' | 'shutdown';
}

/**
 * Activation store state
 */
interface ActivationState {
  /** Total activation count across all machines */
  totalActivations: number;
  
  /** Current session activation count */
  sessionActivations: number;
  
  /** History of recent activation events */
  recentActivations: ActivationEvent[];
  
  /** Whether a recipe discovery is pending */
  pendingRecipeDiscovery: boolean;
  
  /** Last activation state for recipe checking */
  lastActivationState: ActivationState['recentActivations'][0]['state'] | null;
}

/**
 * Activation store actions
 */
interface ActivationActions {
  /**
   * Record a machine activation
   * This is called when the user activates a machine.
   * Integrates with the Recipe System to check unlock conditions.
   */
  recordActivation: (machineId?: string, state?: ActivationState['recentActivations'][0]['state']) => void;
  
  /**
   * Get current activation count
   */
  getActivationCount: () => number;
  
  /**
   * Check if we should trigger recipe unlock check
   * Called internally after recording an activation
   */
  checkRecipeUnlocks: () => void;
  
  /**
   * Clear recent activations history
   */
  clearRecentActivations: () => void;
  
  /**
   * Reset all activation data
   */
  resetActivations: () => void;
}

type ActivationStore = ActivationState & ActivationActions;

const STORAGE_KEY = 'arcane-machine-activation-store';
const MAX_RECENT_ACTIVATIONS = 50;

/**
 * Generate unique ID for activation event
 */
const generateActivationId = (): string => {
  return `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useActivationStore = create<ActivationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      totalActivations: 0,
      sessionActivations: 0,
      recentActivations: [],
      pendingRecipeDiscovery: false,
      lastActivationState: null,

      /**
       * Record a machine activation
       * This is the main entry point for tracking activations.
       * It updates the count and triggers recipe unlock checks.
       */
      recordActivation: (machineId?: string, state: ActivationState['recentActivations'][0]['state'] = 'active') => {
        const activationEvent: ActivationEvent = {
          id: generateActivationId(),
          timestamp: Date.now(),
          machineId,
          state,
        };

        set((s) => {
          // Keep only the most recent activations
          const newRecentActivations = [activationEvent, ...s.recentActivations].slice(0, MAX_RECENT_ACTIVATIONS);
          
          return {
            totalActivations: s.totalActivations + 1,
            sessionActivations: s.sessionActivations + 1,
            recentActivations: newRecentActivations,
            lastActivationState: state,
          };
        });

        // Trigger recipe unlock check after state update
        // Use setTimeout to ensure the state is updated first
        setTimeout(() => {
          get().checkRecipeUnlocks();
        }, 0);
      },

      /**
       * Get current activation count
       */
      getActivationCount: () => {
        return get().totalActivations;
      },

      /**
       * Check if any recipes should be unlocked based on activation count
       * This integrates with the Recipe System
       */
      checkRecipeUnlocks: () => {
        // Dynamic import to avoid circular dependency at module load time
        import('./useRecipeStore').then(({ useRecipeStore }) => {
          const currentCount = get().totalActivations;
          useRecipeStore.getState().checkActivationCountUnlock(currentCount);
        }).catch((err) => {
          console.warn('[ActivationStore] Failed to import recipe store:', err);
        });
      },

      /**
       * Clear recent activations history
       */
      clearRecentActivations: () => {
        set({ recentActivations: [] });
      },

      /**
       * Reset all activation data
       */
      resetActivations: () => {
        set({
          totalActivations: 0,
          sessionActivations: 0,
          recentActivations: [],
          pendingRecipeDiscovery: false,
          lastActivationState: null,
        });
      },
    }),
    {
      name: STORAGE_KEY,
      // Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
      
      // Only persist totalActivations
      partialize: (state) => ({
        totalActivations: state.totalActivations,
      }),
    }
  )
);

// Helper to manually trigger hydration
export const hydrateActivationStore = () => {
  useActivationStore.persist.rehydrate();
};

// Helper to check if hydration is complete
export const isActivationHydrated = () => {
  return useActivationStore.persist.hasHydrated();
};

/**
 * Hook to get current activation count
 */
export function useActivationCount() {
  return useActivationStore((state) => state.totalActivations);
}

/**
 * Hook to get session activation count
 */
export function useSessionActivations() {
  return useActivationStore((state) => state.sessionActivations);
}

/**
 * Hook to get recent activation events
 */
export function useRecentActivations(limit?: number) {
  const recentActivations = useActivationStore((state) => state.recentActivations);
  return limit ? recentActivations.slice(0, limit) : recentActivations;
}

export default useActivationStore;
