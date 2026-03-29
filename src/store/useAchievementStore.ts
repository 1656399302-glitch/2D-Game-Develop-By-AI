/**
 * Achievement Store
 * 
 * Zustand store for managing achievement toast callbacks.
 * Provides a callback mechanism for displaying achievement unlock notifications.
 */

import { create } from 'zustand';
import { Achievement } from '../types/factions';

interface AchievementStore {
  // Callback for achievement unlock
  onUnlockCallback: ((achievement: Achievement) => void) | null;
  
  // Actions
  setOnUnlockCallback: (callback: ((achievement: Achievement) => void) | null) => void;
  
  // Helper to trigger callback (called by other stores/services)
  triggerUnlock: (achievement: Achievement) => void;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  // Initialize as null - external code sets the callback
  onUnlockCallback: null,
  
  // Set the callback function
  setOnUnlockCallback: (callback) => {
    set({ onUnlockCallback: callback });
  },
  
  // Trigger the callback if it exists
  triggerUnlock: (achievement) => {
    const callback = get().onUnlockCallback;
    if (callback) {
      callback(achievement);
    }
  },
}));

export default useAchievementStore;
