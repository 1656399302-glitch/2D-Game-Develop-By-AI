import { useState, useEffect, useRef } from 'react';
import { hydrateTutorialStore } from '../store/useTutorialStore';
import { hydrateCodexStore } from '../store/useCodexStore';
import { hydrateRecipeStore } from '../store/useRecipeStore';
import { hydrateStatsStore } from '../store/useStatsStore';
import { hydrateFactionStore } from '../store/useFactionStore';
import { hydrateFactionReputationStore } from '../store/useFactionReputationStore';
import { hydrateChallengeStore } from '../store/useChallengeStore';
import { hydrateCommunityStore } from '../store/useCommunityStore';
import { hydrateFavoritesStore } from '../store/useFavoritesStore';
import { hydrateMachineTagsStore } from '../store/useMachineTagsStore';
import { hydrateTemplateStore } from '../store/useTemplateStore';

/**
 * Store Hydration Hook - REWRITTEN FOR ROUND 38
 * 
 * This hook provides controlled hydration for Zustand persist stores.
 * 
 * PROBLEM WITH PREVIOUS APPROACH:
 * - Module-level listeners array + setLocalState in callbacks caused cascading updates
 * - Multiple listeners firing simultaneously triggered "Maximum update depth exceeded"
 * 
 * NEW APPROACH (Round 38):
 * - Simple module-level flag to track hydration status
 * - useRef to track if hydration has been triggered (prevents double-triggering)
 * - useState only updates ONCE after hydration completes
 * - NO listeners, NO callbacks, NO cascading state updates
 * 
 * This is a SIMPLE solution that avoids the complexity of the previous approach.
 */

interface HydrationState {
  isHydrated: boolean;
}

// Module-level flag to track if hydration has been initiated
// This prevents multiple hydration attempts across React's StrictMode double-render
let hydrationInitiated = false;

// Track which stores have been hydrated
const hydratedStores = new Set<string>();

/**
 * Hydrate a single store by name (for debugging/tracking)
 */
const hydrateStore = (storeName: string, hydrateFn: () => void) => {
  if (!hydratedStores.has(storeName)) {
    hydratedStores.add(storeName);
    hydrateFn();
  }
};

/**
 * Hydrates all persist stores without triggering cascading state updates.
 * This function runs ONCE per page load.
 */
const hydrateAllStores = () => {
  if (hydrationInitiated) return;
  hydrationInitiated = true;

  // Hydrate all stores in sequence
  hydrateStore('tutorial', hydrateTutorialStore);
  hydrateStore('codex', hydrateCodexStore);
  hydrateStore('recipe', hydrateRecipeStore);
  hydrateStore('stats', hydrateStatsStore);
  hydrateStore('faction', hydrateFactionStore);
  hydrateStore('factionReputation', hydrateFactionReputationStore);
  hydrateStore('challenge', hydrateChallengeStore);
  hydrateStore('community', hydrateCommunityStore);
  hydrateStore('favorites', hydrateFavoritesStore);
  hydrateStore('machineTags', hydrateMachineTagsStore);
  hydrateStore('templates', hydrateTemplateStore);
};

/**
 * Hook to manage store hydration
 * 
 * This hook:
 * 1. Triggers hydration ONCE on mount (via useEffect with empty deps)
 * 2. Updates state ONCE after hydration
 * 3. Returns stable { isHydrated } state
 * 
 * IMPORTANT: The useEffect has empty dependencies [] to ensure it runs exactly once.
 * This is intentional - hydration should only happen once on app mount.
 */
export function useStoreHydration(): HydrationState {
  // Use useState to trigger re-renders after hydration
  // Initial value is false (not hydrated)
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Use useRef to track if we've scheduled hydration
  // This prevents StrictMode double-invocation issues
  const hydrationScheduled = useRef(false);

  useEffect(() => {
    // Only trigger hydration once
    if (hydrationScheduled.current) return;
    hydrationScheduled.current = true;

    // Schedule hydration for the next frame
    // Using requestAnimationFrame ensures we don't block the initial render
    const frameId = requestAnimationFrame(() => {
      hydrateAllStores();
      // Update state ONCE after hydration is triggered
      // Note: We set this immediately after triggering, not after waiting for promises
      // because the stores' internal state updates are what matters, not the promises
      setIsHydrated(true);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []); // Empty deps - run exactly once on mount

  return { isHydrated };
}

/**
 * Simple hook to check if stores are hydrated
 * Returns true after hydration completes
 */
export function useIsHydrated(): boolean {
  const { isHydrated } = useStoreHydration();
  return isHydrated;
}
