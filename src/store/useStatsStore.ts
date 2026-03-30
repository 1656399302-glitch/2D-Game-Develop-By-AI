/**
 * Stats Store
 * 
 * Zustand store for tracking user statistics.
 * Persists data to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FactionId, UserStats, DEFAULT_USER_STATS } from '../types/factions';

// Session tracking for playtime
let sessionStartTime: number | null = null;
let sessionPlaytime: number = 0;

interface StatsStore extends UserStats {
  // Earned achievements set
  earnedAchievements: string[];
  
  // Session tracking
  sessionStart: () => void;
  sessionEnd: () => void;
  
  // Actions
  incrementMachinesCreated: () => void;
  incrementActivations: () => void;
  incrementErrors: () => void;
  incrementCodexEntries: () => void;
  addPlaytime: (minutes: number) => void;
  updateFactionCount: (faction: FactionId, count: number) => void;
  addEarnedAchievement: (achievementId: string) => void;
  hasEarnedAchievement: (achievementId: string) => boolean;
  resetStats: () => void;
  
  // Getters
  getStats: () => UserStats;
}

// Storage key for localStorage
const STORAGE_KEY = 'arcane-machine-stats-store';

export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      // Initial state from defaults
      ...DEFAULT_USER_STATS,
      earnedAchievements: [],
      
      // Session management
      sessionStart: () => {
        if (sessionStartTime === null) {
          sessionStartTime = Date.now();
        }
      },
      
      sessionEnd: () => {
        if (sessionStartTime !== null) {
          const sessionDuration = Date.now() - sessionStartTime;
          sessionPlaytime += sessionDuration;
          const minutes = Math.floor(sessionDuration / 60000);
          if (minutes > 0) {
            set((state) => ({
              playtimeMinutes: state.playtimeMinutes + minutes,
            }));
          }
          sessionStartTime = null;
        }
      },
      
      // Increment machines created
      incrementMachinesCreated: () => {
        set((state) => ({
          machinesCreated: state.machinesCreated + 1,
        }));
      },
      
      // Increment activations
      incrementActivations: () => {
        set((state) => ({
          activations: state.activations + 1,
        }));
      },
      
      // Increment errors
      incrementErrors: () => {
        set((state) => ({
          errors: state.errors + 1,
        }));
      },
      
      // Increment codex entries
      incrementCodexEntries: () => {
        set((state) => ({
          codexEntries: state.codexEntries + 1,
        }));
      },
      
      // Add playtime
      addPlaytime: (minutes) => {
        set((state) => ({
          playtimeMinutes: state.playtimeMinutes + minutes,
        }));
      },
      
      // Update faction count
      updateFactionCount: (faction, count) => {
        set((state) => ({
          factionCounts: {
            ...state.factionCounts,
            [faction]: count,
          },
        }));
      },
      
      // Add earned achievement
      addEarnedAchievement: (achievementId) => {
        set((state) => {
          if (state.earnedAchievements.includes(achievementId)) {
            return state;
          }
          return {
            earnedAchievements: [...state.earnedAchievements, achievementId],
          };
        });
      },
      
      // Check if achievement is earned
      hasEarnedAchievement: (achievementId) => {
        return get().earnedAchievements.includes(achievementId);
      },
      
      // Reset all stats
      resetStats: () => {
        set({
          ...DEFAULT_USER_STATS,
          earnedAchievements: [],
        });
        sessionStartTime = null;
        sessionPlaytime = 0;
      },
      
      // Get current stats as UserStats object
      getStats: () => {
        const state = get();
        return {
          machinesCreated: state.machinesCreated,
          activations: state.activations,
          errors: state.errors,
          playtimeMinutes: state.playtimeMinutes,
          factionCounts: state.factionCounts,
          codexEntries: state.codexEntries,
        };
      },
    }),
    {
      name: STORAGE_KEY,
      // FIX: Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
    }
  )
);

// FIX: Helper to manually trigger hydration
export const hydrateStatsStore = () => {
  useStatsStore.persist.rehydrate();
};

// FIX: Helper to check if hydration is complete
export const isStatsHydrated = () => {
  return useStatsStore.persist.hasHydrated();
};

// Start session tracking on store creation
if (typeof window !== 'undefined') {
  // Start session when page loads
  useStatsStore.getState().sessionStart();
  
  // End session and save playtime when page unloads
  window.addEventListener('beforeunload', () => {
    useStatsStore.getState().sessionEnd();
  });
}

// Selectors for common state slices
export const selectMachinesCreated = (state: StatsStore) => state.machinesCreated;
export const selectActivations = (state: StatsStore) => state.activations;
export const selectEarnedAchievements = (state: StatsStore) => state.earnedAchievements;
export const selectCodexEntries = (state: StatsStore) => state.codexEntries;

export default useStatsStore;
