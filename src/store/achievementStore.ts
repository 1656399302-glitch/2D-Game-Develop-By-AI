/**
 * Achievement Store with Persistence
 * 
 * Zustand store for tracking unlocked achievements with localStorage persistence.
 * Tracks: first-forge, first-activation, first-export, complex-machine-created,
 * faction achievements, and skill achievements.
 * 
 * ROUND 81 PHASE 2: New store implementation per contract D3.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Achievement IDs that this store tracks
export type AchievementId =
  | 'first-forge'
  | 'first-activation'
  | 'first-export'
  | 'faction-void'
  | 'faction-forge'
  | 'faction-phase'
  | 'faction-barrier'
  | 'faction-order'
  | 'faction-chaos'
  | 'complex-machine-created'
  | 'apprentice-forge'
  | 'perfect-activation'
  | 'skilled-artisan';

interface AchievementState {
  // Set of unlocked achievement IDs
  unlockedAchievements: Set<AchievementId>;
  
  // Last unlock timestamp (for animations)
  lastUnlockTime: number | null;
  
  // Actions
  unlock: (achievementId: AchievementId) => void;
  isUnlocked: (achievementId: AchievementId) => boolean;
  getUnlocked: () => AchievementId[];
  reset: () => void;
}

// Custom storage adapter for Set serialization
const zustandStorage = {
  getItem: (name: string): string | null => {
    const value = localStorage.getItem(name);
    if (value === null) return null;
    
    try {
      const parsed = JSON.parse(value);
      // Convert Set back from array
      if (parsed.state?.unlockedAchievements) {
        parsed.state.unlockedAchievements = new Set(parsed.state.unlockedAchievements);
      }
      return JSON.stringify(parsed);
    } catch {
      return value;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value);
      // Convert Set to array for storage
      if (parsed.state?.unlockedAchievements instanceof Set) {
        parsed.state.unlockedAchievements = Array.from(parsed.state.unlockedAchievements);
      }
      localStorage.setItem(name, JSON.stringify(parsed));
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      // Initialize with empty set
      unlockedAchievements: new Set<AchievementId>(),
      
      // Last unlock timestamp
      lastUnlockTime: null,
      
      /**
       * Unlock an achievement
       * Does nothing if already unlocked
       */
      unlock: (achievementId: AchievementId) => {
        const { unlockedAchievements } = get();
        
        // Skip if already unlocked
        if (unlockedAchievements.has(achievementId)) {
          return;
        }
        
        set({
          unlockedAchievements: new Set([...unlockedAchievements, achievementId]),
          lastUnlockTime: Date.now(),
        });
      },
      
      /**
       * Check if an achievement is unlocked
       */
      isUnlocked: (achievementId: AchievementId) => {
        return get().unlockedAchievements.has(achievementId);
      },
      
      /**
       * Get array of all unlocked achievement IDs
       */
      getUnlocked: () => {
        return Array.from(get().unlockedAchievements);
      },
      
      /**
       * Reset all achievements (for testing or user request)
       */
      reset: () => {
        set({
          unlockedAchievements: new Set<AchievementId>(),
          lastUnlockTime: null,
        });
      },
    }),
    {
      name: 'arcane-codex-achievements', // localStorage key
      storage: createJSONStorage(() => zustandStorage),
      // Only persist these fields
      partialize: (state) => ({
        unlockedAchievements: Array.from(state.unlockedAchievements),
        lastUnlockTime: state.lastUnlockTime,
      }),
    }
  )
);

// Helper to check if store has any achievements unlocked
export function hasAnyAchievements(): boolean {
  return useAchievementStore.getState().getUnlocked().length > 0;
}

// Helper to get achievement unlock count
export function getUnlockedCount(): number {
  return useAchievementStore.getState().getUnlocked().length;
}

// Helper to check multiple achievements at once
export function checkMultipleAchievements(achievementIds: AchievementId[]): AchievementId[] {
  return achievementIds.filter(id => useAchievementStore.getState().isUnlocked(id));
}

export default useAchievementStore;
