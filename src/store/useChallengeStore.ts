import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Challenge, CHALLENGES } from '../types/challenges';

const STORAGE_KEY = 'arcane-codex-challenges';

interface ChallengeState {
  /** Array of completed challenge IDs */
  completedChallengeIds: string[];
  /** Whether the store is loading from localStorage */
  loading: boolean;
}

interface ChallengeActions {
  /** Mark a challenge as completed */
  completeChallenge: (id: string) => void;
  /** Reset all challenge progress */
  resetProgress: () => void;
  /** Check if a specific challenge is completed */
  isCompleted: (id: string) => boolean;
  /** Get count of completed challenges */
  getCompletedCount: () => number;
  /** Get all completed challenges */
  getCompletedChallenges: () => Challenge[];
}

type ChallengeStore = ChallengeState & ChallengeActions;

// Helper to convert array to Set
const arrayToSet = (arr: string[]): Set<string> => new Set(arr);

// Helper to convert Set to array
const setToArray = (set: Set<string>): string[] => Array.from(set);

export const useChallengeStore = create<ChallengeStore>()(
  persist(
    (set, get) => ({
      // State - store as array for persistence, convert to Set for internal use
      completedChallengeIds: [],
      loading: true,

      // Actions
      completeChallenge: (id: string) => {
        set((state) => {
          if (state.completedChallengeIds.includes(id)) {
            return state; // Already completed
          }
          return { completedChallengeIds: [...state.completedChallengeIds, id] };
        });
      },

      resetProgress: () => {
        set({ completedChallengeIds: [] });
      },

      isCompleted: (id: string) => {
        return get().completedChallengeIds.includes(id);
      },

      getCompletedCount: () => {
        return get().completedChallengeIds.length;
      },

      getCompletedChallenges: () => {
        const completedIds = get().completedChallengeIds;
        return CHALLENGES.filter((c: Challenge) => completedIds.includes(c.id));
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Mark loading as complete after rehydration
        if (state) {
          state.loading = false;
        }
      },
      // Custom partialize to only persist the completedChallengeIds array
      partialize: (state) => ({
        completedChallengeIds: state.completedChallengeIds,
      }),
    }
  )
);

// Export helper functions for use in components if needed
export { arrayToSet, setToArray };

export default useChallengeStore;
