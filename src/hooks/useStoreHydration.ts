import { useEffect, useState } from 'react';
import { hydrateTutorialStore } from '../store/useTutorialStore';
import { hydrateCodexStore } from '../store/useCodexStore';
import { hydrateRecipeStore } from '../store/useRecipeStore';
import { hydrateStatsStore } from '../store/useStatsStore';
import { hydrateFactionStore } from '../store/useFactionStore';
import { hydrateFactionReputationStore } from '../store/useFactionReputationStore';
import { hydrateChallengeStore } from '../store/useChallengeStore';
import { hydrateCommunityStore } from '../store/useCommunityStore';

/**
 * Store Hydration Hook
 * 
 * Provides controlled hydration for Zustand persist stores.
 * This prevents cascading state updates during initial app load.
 * 
 * FIXED: Uses module-level state and listener pattern to:
 * - Prevent double hydration across multiple hook instances
 * - Avoid cascading setState calls that trigger update loops
 * - Share hydration state across all components using the hook
 */

interface HydrationState {
  isHydrated: boolean;
}

// Module-level state to prevent double hydration and cascading updates
let hasHydrated = false;
let hydrationState: HydrationState = { isHydrated: false };
let hydrationListeners: Array<(state: HydrationState) => void> = [];

/**
 * Notifies all listeners of hydration state change
 */
const notifyHydrationChange = () => {
  hydrationListeners.forEach(listener => listener(hydrationState));
};

/**
 * Hydrates all persist stores without triggering cascading state updates.
 */
const hydrateAllStores = () => {
  if (hasHydrated) return;
  hasHydrated = true;

  // Hydrate all stores in sequence
  hydrateTutorialStore();
  hydrateCodexStore();
  hydrateRecipeStore();
  hydrateStatsStore();
  hydrateFactionStore();
  hydrateFactionReputationStore();
  hydrateChallengeStore();
  hydrateCommunityStore();

  // Update state and notify all listeners
  hydrationState = { isHydrated: true };
  notifyHydrationChange();
};

/**
 * Hook to manage store hydration
 * Triggers manual hydration for all persist stores after mount
 * Uses stable initialization to prevent cascading updates
 */
export function useStoreHydration() {
  const [localState, setLocalState] = useState<HydrationState>(hydrationState);

  useEffect(() => {
    // Register listener for state changes
    const listener = (state: HydrationState) => {
      setLocalState(state);
    };
    hydrationListeners.push(listener);

    // Trigger hydration if not already done
    if (!hasHydrated) {
      // Use requestAnimationFrame for stable initialization
      const frameId = requestAnimationFrame(() => {
        hydrateAllStores();
      });
      return () => {
        hydrationListeners = hydrationListeners.filter(l => l !== listener);
        cancelAnimationFrame(frameId);
      };
    }

    return () => {
      hydrationListeners = hydrationListeners.filter(l => l !== listener);
    };
  }, []);

  return localState;
}

/**
 * Hook to check if all stores are hydrated
 * Reuses the main useStoreHydration hook to share state
 */
export function useIsHydrated(): boolean {
  const state = useStoreHydration();
  return state.isHydrated;
}
