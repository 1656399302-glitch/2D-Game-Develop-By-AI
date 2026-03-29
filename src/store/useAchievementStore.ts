/**
 * Achievement Store
 * 
 * Zustand store for managing achievement toast callbacks.
 * Provides a callback mechanism for displaying achievement unlock notifications.
 * Integrates with faction reputation system.
 */

import { create } from 'zustand';
import { Achievement } from '../types/factions';

interface AchievementStore {
  // Callback for achievement unlock
  onUnlockCallback: ((achievement: Achievement) => void) | null;
  
  // Recently unlocked achievements (to prevent duplicate notifications)
  recentlyUnlocked: Set<string>;
  
  // Actions
  setOnUnlockCallback: (callback: ((achievement: Achievement) => void) | null) => void;
  
  // Helper to trigger callback (called by other stores/services)
  triggerUnlock: (achievement: Achievement) => void;
  
  // Clear recently unlocked (for testing)
  clearRecentlyUnlocked: () => void;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  // Initialize as null - external code sets the callback
  onUnlockCallback: null,
  
  // Track recently unlocked achievements
  recentlyUnlocked: new Set(),
  
  // Set the callback function
  setOnUnlockCallback: (callback) => {
    set({ onUnlockCallback: callback });
  },
  
  // Trigger the callback if it exists
  // Also integrates with faction reputation system
  triggerUnlock: (achievement) => {
    const state = get();
    
    // Skip if already recently unlocked (prevent spam)
    if (state.recentlyUnlocked.has(achievement.id)) {
      return;
    }
    
    // Add to recently unlocked
    set((state) => ({
      recentlyUnlocked: new Set([...state.recentlyUnlocked, achievement.id]),
    }));
    
    // Call the callback if it exists
    const callback = state.onUnlockCallback;
    if (callback) {
      callback(achievement);
    }
    
    // Integrate with faction reputation system
    // If achievement has a faction, award +10 reputation
    if (achievement.faction) {
      // Dynamic import to avoid circular dependency
      import('./useFactionReputationStore').then(({ useFactionReputationStore }) => {
        useFactionReputationStore.getState().addReputation(achievement.faction!, 10);
      }).catch(() => {
        // Reputation store might not be available
      });
    }
  },
  
  // Clear recently unlocked (for testing)
  clearRecentlyUnlocked: () => {
    set({ recentlyUnlocked: new Set() });
  },
}));

/**
 * Helper to check and trigger achievements
 * Call this from stats updates to check for new achievements
 */
export function checkAndTriggerAchievements(
  achievement: Achievement,
  currentStats: Record<string, unknown>,
  previousStats: Record<string, unknown> | undefined
): void {
  // Only trigger if condition is now met but wasn't before
  const wasComplete = previousStats ? achievement.condition(previousStats as any) : false;
  const isComplete = achievement.condition(currentStats as any);
  
  if (isComplete && !wasComplete) {
    useAchievementStore.getState().triggerUnlock(achievement);
  }
}

export default useAchievementStore;
