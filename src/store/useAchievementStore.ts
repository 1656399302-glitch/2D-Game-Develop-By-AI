/**
 * Achievement Store
 * 
 * Zustand store for managing achievement state with unlock tracking
 * and localStorage persistence.
 * 
 * ROUND 136: Refactored to include:
 * - unlockAchievement(id) method for new category-based tracking
 * - unlockedAt timestamp tracking
 * - localStorage persistence under key 'tech-tree-achievements'
 * 
 * Maintains backward compatibility with existing triggerUnlock and condition-based system.
 */

import { create } from 'zustand';
import { 
  ACHIEVEMENT_DEFINITIONS, 
  type AchievementDefinition,
} from '../data/achievements';
import type { 
  Achievement, 
  AchievementState, 
  AchievementCategory,
  StoredAchievementData,
  ExtendedUserStats,
} from '../types/achievement';
import { ACHIEVEMENT_STORAGE_KEY } from '../types/achievement';

// Storage key for localStorage persistence
const STORAGE_KEY = ACHIEVEMENT_STORAGE_KEY;

interface AchievementStore {
  // All achievements with their definitions and unlock state
  achievements: Achievement[];
  
  // Callback for achievement unlock (backward compatibility)
  onUnlockCallback: ((achievement: Achievement) => void) | null;
  
  // Recently unlocked achievements (to prevent duplicate notifications)
  recentlyUnlocked: Set<string>;
  
  // Actions
  
  /**
   * NEW ROUND 136: Unlock achievement by ID
   * Sets isUnlocked to true, unlockedAt timestamp, persists to localStorage
   */
  unlockAchievement: (id: string) => void;
  
  /**
   * LEGACY: Trigger unlock with full achievement object (for condition-based system)
   * Maintained for backward compatibility with App.tsx
   */
  triggerUnlock: (achievement: AchievementDefinition) => void;
  
  setOnUnlockCallback: (callback: ((achievement: Achievement) => void) | null) => void;
  clearRecentlyUnlocked: () => void;
  
  // Getters
  getAchievement: (id: string) => Achievement | undefined;
  getUnlockedCount: () => number;
  getAchievementsByCategory: (category: AchievementCategory) => Achievement[];
  
  // Persistence
  _loadFromStorage: () => void;
  _saveToStorage: () => void;
}

/**
 * Initialize achievements with default locked state
 */
function initializeAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((definition) => ({
    ...definition,
    isUnlocked: false,
    unlockedAt: null,
  }));
}

/**
 * Load achievement state from localStorage
 */
function loadFromStorage(): Record<string, AchievementState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: StoredAchievementData = JSON.parse(stored);
      return data.achievements || {};
    }
  } catch (error) {
    console.warn('Failed to load achievements from localStorage:', error);
  }
  return {};
}

/**
 * Save achievement state to localStorage
 */
function saveToStorage(achievements: Achievement[]): void {
  try {
    const achievementStates: Record<string, AchievementState> = {};
    achievements.forEach((a) => {
      achievementStates[a.id] = {
        isUnlocked: a.isUnlocked,
        unlockedAt: a.unlockedAt,
      };
    });
    
    const data: StoredAchievementData = {
      achievements: achievementStates,
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save achievements to localStorage:', error);
  }
}

export const useAchievementStore = create<AchievementStore>((set, get) => {
  // Initialize with definitions and load persisted state
  const initialAchievements = initializeAchievements();
  const persistedState = loadFromStorage();
  
  // Apply persisted state to initial achievements
  initialAchievements.forEach((achievement) => {
    const persisted = persistedState[achievement.id];
    if (persisted) {
      achievement.isUnlocked = persisted.isUnlocked;
      achievement.unlockedAt = persisted.unlockedAt;
    }
  });
  
  return {
    // Initialize achievements with definitions
    achievements: initialAchievements,
    
    // Initialize as null - external code sets the callback
    onUnlockCallback: null,
    
    // Track recently unlocked achievements
    recentlyUnlocked: new Set(),
    
    /**
     * NEW ROUND 136: Unlock an achievement by ID
     * - Sets isUnlocked to true
     * - Sets unlockedAt timestamp (only if not already unlocked)
     * - Persists to localStorage
     * - Triggers notification callback
     */
    unlockAchievement: (id: string) => {
      const state = get();
      const achievement = state.achievements.find((a) => a.id === id);
      
      if (!achievement) {
        // Achievement ID not found - no-op, don't throw
        return;
      }
      
      // Skip if already unlocked
      if (achievement.isUnlocked) {
        return;
      }
      
      const now = Date.now();
      
      // Update achievement state
      set((state) => {
        const updatedAchievements = state.achievements.map((a) => {
          if (a.id === id) {
            return {
              ...a,
              isUnlocked: true,
              unlockedAt: now,
            };
          }
          return a;
        });
        
        // Save to localStorage
        saveToStorage(updatedAchievements);
        
        return {
          achievements: updatedAchievements,
          // Add to recently unlocked
          recentlyUnlocked: new Set([...state.recentlyUnlocked, id]),
        };
      });
      
      // Get updated achievement and trigger callback
      const updatedAchievement = get().achievements.find((a) => a.id === id);
      if (updatedAchievement && state.onUnlockCallback) {
        state.onUnlockCallback(updatedAchievement);
      }
    },
    
    /**
     * LEGACY: Trigger unlock with full achievement object
     * Maintained for backward compatibility with App.tsx
     * Uses the condition-based system
     */
    triggerUnlock: (achievement: AchievementDefinition) => {
      const state = get();
      
      // Skip if already recently unlocked (prevent spam)
      if (state.recentlyUnlocked.has(achievement.id)) {
        return;
      }
      
      // Find the achievement in state and mark as unlocked
      const existingAchievement = state.achievements.find((a) => a.id === achievement.id);
      if (!existingAchievement) {
        return;
      }
      
      // Skip if already unlocked
      if (existingAchievement.isUnlocked) {
        return;
      }
      
      const now = Date.now();
      
      // Add to recently unlocked
      set((state) => ({
        recentlyUnlocked: new Set([...state.recentlyUnlocked, achievement.id]),
      }));
      
      // Update achievement state
      set((state) => {
        const updatedAchievements = state.achievements.map((a) => {
          if (a.id === achievement.id) {
            return {
              ...a,
              isUnlocked: true,
              unlockedAt: now,
            };
          }
          return a;
        });
        
        // Save to localStorage
        saveToStorage(updatedAchievements);
        
        return { achievements: updatedAchievements };
      });
      
      // Get updated achievement and trigger callback
      const updatedAchievement = get().achievements.find((a) => a.id === achievement.id);
      if (updatedAchievement && state.onUnlockCallback) {
        state.onUnlockCallback(updatedAchievement);
      }
    },
    
    // Set the callback function
    setOnUnlockCallback: (callback) => {
      set({ onUnlockCallback: callback });
    },
    
    // Clear recently unlocked (for testing)
    clearRecentlyUnlocked: () => {
      set({ recentlyUnlocked: new Set() });
    },
    
    // Get achievement by ID
    getAchievement: (id: string) => {
      return get().achievements.find((a) => a.id === id);
    },
    
    // Get count of unlocked achievements
    getUnlockedCount: () => {
      return get().achievements.filter((a) => a.isUnlocked).length;
    },
    
    // Get achievements by category
    getAchievementsByCategory: (category: AchievementCategory) => {
      return get().achievements.filter((a) => a.category === category);
    },
    
    // Load from storage (can be called to re-sync)
    _loadFromStorage: () => {
      const persistedState = loadFromStorage();
      const currentAchievements = get().achievements;
      
      const updatedAchievements = currentAchievements.map((achievement) => {
        const persisted = persistedState[achievement.id];
        if (persisted) {
          return {
            ...achievement,
            isUnlocked: persisted.isUnlocked,
            unlockedAt: persisted.unlockedAt,
          };
        }
        return achievement;
      });
      
      set({ achievements: updatedAchievements });
    },
    
    // Save to storage
    _saveToStorage: () => {
      saveToStorage(get().achievements);
    },
  };
});

/**
 * Helper to check and trigger achievements
 * Call this from stats updates to check for new achievements
 */
export function checkAndTriggerAchievements(
  achievement: AchievementDefinition,
  currentStats: Record<string, unknown>,
  previousStats: Record<string, unknown> | undefined
): void {
  // Only trigger if condition is now met but wasn't before
  const wasComplete = previousStats ? achievement.condition?.(previousStats as unknown as ExtendedUserStats) : false;
  const isComplete = achievement.condition?.(currentStats as unknown as ExtendedUserStats);
  
  if (isComplete && !wasComplete) {
    useAchievementStore.getState().triggerUnlock(achievement);
  }
}

// Re-export types for convenience
export type { Achievement, AchievementState, AchievementCategory, ExtendedUserStats } from '../types/achievement';
export { ACHIEVEMENT_STORAGE_KEY } from '../types/achievement';

// Re-export FACTIONS for backward compatibility
export { FACTIONS, DEFAULT_USER_STATS } from '../types/factions';
export type { FactionId } from '../types/factions';

// Default export
export default useAchievementStore;
