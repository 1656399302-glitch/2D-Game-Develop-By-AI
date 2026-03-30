/**
 * Store Hydration Hook
 * 
 * Provides controlled hydration for Zustand persist stores.
 * This prevents cascading state updates during initial app load.
 */

import { useEffect, useState, useCallback } from 'react';
import { hydrateTutorialStore } from '../store/useTutorialStore';
import { hydrateCodexStore } from '../store/useCodexStore';
import { hydrateRecipeStore } from '../store/useRecipeStore';
import { hydrateStatsStore } from '../store/useStatsStore';
import { hydrateFactionStore } from '../store/useFactionStore';
import { hydrateFactionReputationStore } from '../store/useFactionReputationStore';
import { hydrateChallengeStore } from '../store/useChallengeStore';
import { hydrateCommunityStore } from '../store/useCommunityStore';

interface HydrationState {
  isHydrated: boolean;
}

/**
 * Hook to manage store hydration
 * Triggers manual hydration for all persist stores after mount
 */
export function useStoreHydration() {
  const [hydrationState, setHydrationState] = useState<HydrationState>({
    isHydrated: false,
  });

  // FIX: Manually trigger hydration for all stores
  const triggerHydration = useCallback(() => {
    // Hydrate all stores
    hydrateTutorialStore();
    hydrateCodexStore();
    hydrateRecipeStore();
    hydrateStatsStore();
    hydrateFactionStore();
    hydrateFactionReputationStore();
    hydrateChallengeStore();
    hydrateCommunityStore();

    // Update state to reflect hydration
    setHydrationState({
      isHydrated: true,
    });
  }, []);

  // Trigger hydration on mount after a brief delay to ensure React is ready
  useEffect(() => {
    // Use requestAnimationFrame to ensure hydration happens after initial render
    const frameId = requestAnimationFrame(() => {
      // Additional small delay to ensure all components have mounted
      const timeoutId = setTimeout(() => {
        triggerHydration();
      }, 0);

      return () => clearTimeout(timeoutId);
    });

    return () => cancelAnimationFrame(frameId);
  }, [triggerHydration]);

  return hydrationState;
}

/**
 * Hook to check if all stores are hydrated
 */
export function useIsHydrated(): boolean {
  const state = useStoreHydration();
  return state.isHydrated;
}
