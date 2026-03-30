import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CHALLENGE_DEFINITIONS,
  ChallengeDefinition,
  ChallengeCategory,
  ChallengeDifficulty,
} from '../data/challenges';

/**
 * Badge structure for earned achievements
 */
export interface Badge {
  id: string;
  displayName: string;
  description: string;
  earnedAt: number;
}

/**
 * Challenge progress tracking
 */
export interface ChallengeProgress {
  machinesCreated: number;
  machinesSaved: number;
  connectionsCreated: number;
  activations: number;
  overloadsTriggered: number;
  gearsCreated: number;
  highestStability: number;
}

/**
 * Challenge store state interface
 */
interface ChallengeState {
  /** Array of completed challenge IDs */
  completedChallenges: string[];
  /** Array of claimed reward IDs (to prevent double-claiming) */
  claimedRewards: string[];
  /** Player experience points */
  totalXP: number;
  /** Earned badges */
  badges: Badge[];
  /** Challenge progress tracking */
  challengeProgress: ChallengeProgress;
  /** Loading state for localStorage hydration */
  loading: boolean;
}

/**
 * Challenge store actions interface
 */
interface ChallengeActions {
  /** Check if a challenge condition is met based on type and value */
  checkChallengeCompletion: (type: string, value: number) => boolean;
  
  /** Claim reward for a completed challenge */
  claimReward: (challengeId: string) => void;
  
  /** Get challenges filtered by category */
  getChallengesByCategory: (category: ChallengeCategory) => ChallengeDefinition[];
  
  /** Get challenges filtered by difficulty */
  getChallengesByDifficulty: (difficulty: ChallengeDifficulty) => ChallengeDefinition[];
  
  /** Get all completed challenges */
  getCompletedChallenges: () => ChallengeDefinition[];
  
  /** Get all available (not completed) challenges */
  getAvailableChallenges: () => ChallengeDefinition[];
  
  /** Get current progress for a specific challenge */
  getChallengeProgress: (challengeId: string) => number;
  
  /** Check if a challenge is completed */
  isChallengeCompleted: (challengeId: string) => boolean;
  
  /** Check if a reward is claimed */
  isRewardClaimed: (challengeId: string) => boolean;
  
  /** Update progress counters */
  updateProgress: (progress: Partial<ChallengeProgress>) => void;
  
  /** Reset all challenge progress */
  resetChallenges: () => void;

  // === Backward Compatibility Aliases ===
  
  /** Alias for isChallengeCompleted (backward compatibility) */
  isCompleted: (challengeId: string) => boolean;
  
  /** Alias for claimReward (backward compatibility) */
  completeChallenge: (challengeId: string) => void;
  
  /** Get count of completed challenges (backward compatibility) */
  getCompletedCount: () => number;
  
  /** Alias for resetChallenges (backward compatibility) */
  resetProgress: () => void;
}

type ChallengeStore = ChallengeState & ChallengeActions;

const STORAGE_KEY = 'arcane-codex-challenge-store';

/**
 * Default challenge progress
 */
const DEFAULT_PROGRESS: ChallengeProgress = {
  machinesCreated: 0,
  machinesSaved: 0,
  connectionsCreated: 0,
  activations: 0,
  overloadsTriggered: 0,
  gearsCreated: 0,
  highestStability: 0,
};

/**
 * Get the progress value for a challenge type
 */
function getProgressForChallengeType(
  progress: ChallengeProgress,
  type: string
): number {
  switch (type) {
    case 'machines_created':
      return progress.machinesCreated;
    case 'machines_saved':
      return progress.machinesSaved;
    case 'connections_created':
      return progress.connectionsCreated;
    case 'activations':
      return progress.activations;
    case 'overloads':
      return progress.overloadsTriggered;
    case 'gears':
      return progress.gearsCreated;
    case 'stability':
      return progress.highestStability;
    default:
      return 0;
  }
}

/**
 * Check if an ID is in the array
 */
function isInArray(arr: string[], id: string): boolean {
  return arr.includes(id);
}

/**
 * Add an ID to the array if not already present
 */
function addToArray(arr: string[], id: string): string[] {
  if (arr.includes(id)) {
    return arr;
  }
  return [...arr, id];
}

/**
 * Challenge store with XP, badges, and progress tracking
 */
export const useChallengeStore = create<ChallengeStore>()(
  persist(
    (set, get) => ({
      // State - use arrays for better Zustand persistence compatibility
      completedChallenges: [],
      claimedRewards: [],
      totalXP: 0,
      badges: [],
      challengeProgress: { ...DEFAULT_PROGRESS },
      loading: true,

      // Actions
      checkChallengeCompletion: (type: string, value: number) => {
        const progress = get().challengeProgress;
        const currentValue = getProgressForChallengeType(progress, type);
        return currentValue >= value;
      },

      claimReward: (challengeId: string) => {
        const state = get();
        const challenge = CHALLENGE_DEFINITIONS.find(c => c.id === challengeId);
        
        if (!challenge) {
          console.warn(`Challenge not found: ${challengeId}`);
          return;
        }

        // Don't allow claiming if already completed
        if (isInArray(state.completedChallenges, challengeId)) {
          return;
        }

        // Process reward based on type
        switch (challenge.reward.type) {
          case 'xp':
            set({
              completedChallenges: addToArray(state.completedChallenges, challengeId),
              claimedRewards: addToArray(state.claimedRewards, challengeId),
              totalXP: state.totalXP + (challenge.reward.value as number),
            });
            break;
            
          case 'badge':
            const badge: Badge = {
              id: challenge.reward.value as string,
              displayName: challenge.reward.displayName,
              description: challenge.reward.description,
              earnedAt: Date.now(),
            };
            set({
              completedChallenges: addToArray(state.completedChallenges, challengeId),
              claimedRewards: addToArray(state.claimedRewards, challengeId),
              badges: [...state.badges, badge],
            });
            break;
            
          case 'recipe':
            // Trigger recipe unlock
            set({
              completedChallenges: addToArray(state.completedChallenges, challengeId),
              claimedRewards: addToArray(state.claimedRewards, challengeId),
            });
            // Trigger recipe unlock in useRecipeStore
            setTimeout(() => {
              import('./useRecipeStore').then(({ useRecipeStore }) => {
                useRecipeStore.getState().unlockRecipe(challenge.reward.value as string);
              }).catch(() => {
                // Recipe store might not be available
              });
            }, 0);
            break;
        }
      },

      getChallengesByCategory: (category: ChallengeCategory) => {
        return CHALLENGE_DEFINITIONS.filter(c => c.category === category);
      },

      getChallengesByDifficulty: (difficulty: ChallengeDifficulty) => {
        return CHALLENGE_DEFINITIONS.filter(c => c.difficulty === difficulty);
      },

      getCompletedChallenges: () => {
        const completedIds = get().completedChallenges;
        return CHALLENGE_DEFINITIONS.filter(c => isInArray(completedIds, c.id));
      },

      getAvailableChallenges: () => {
        const completedIds = get().completedChallenges;
        return CHALLENGE_DEFINITIONS.filter(c => !isInArray(completedIds, c.id));
      },

      getChallengeProgress: (challengeId: string) => {
        const challenge = CHALLENGE_DEFINITIONS.find(c => c.id === challengeId);
        if (!challenge) return 0;
        
        const progress = get().challengeProgress;
        // Map challenge ID to progress type
        const typeMap: Record<string, keyof ChallengeProgress> = {
          'first-machine': 'machinesCreated',
          'energy-master': 'connectionsCreated',
          'codex-entry': 'machinesSaved',
          'golden-gear': 'gearsCreated',
          'overload-specialist': 'overloadsTriggered',
          'stability-master': 'highestStability',
          'legendary-forge': 'machinesCreated',
          'activation-king': 'activations',
        };
        
        const progressType = typeMap[challengeId];
        if (!progressType) return 0;
        
        return progress[progressType];
      },

      isChallengeCompleted: (challengeId: string) => {
        return isInArray(get().completedChallenges, challengeId);
      },

      isRewardClaimed: (challengeId: string) => {
        return isInArray(get().claimedRewards, challengeId);
      },

      updateProgress: (updates: Partial<ChallengeProgress>) => {
        set(state => {
          const newProgress = { ...state.challengeProgress, ...updates };
          
          // Update highest stability if needed
          if (updates.highestStability !== undefined) {
            if (updates.highestStability > state.challengeProgress.highestStability) {
              newProgress.highestStability = updates.highestStability;
            } else {
              newProgress.highestStability = state.challengeProgress.highestStability;
            }
          }
          
          return { challengeProgress: newProgress };
        });
      },

      resetChallenges: () => {
        set({
          completedChallenges: [],
          claimedRewards: [],
          totalXP: 0,
          badges: [],
          challengeProgress: { ...DEFAULT_PROGRESS },
        });
      },

      // === Backward Compatibility Aliases ===
      
      isCompleted: (challengeId: string) => {
        return get().isChallengeCompleted(challengeId);
      },

      completeChallenge: (challengeId: string) => {
        get().claimReward(challengeId);
      },

      getCompletedCount: () => {
        return get().completedChallenges.length;
      },

      resetProgress: () => {
        get().resetChallenges();
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
        }
      },
      // Only persist specific fields
      partialize: (state) => ({
        completedChallenges: state.completedChallenges,
        claimedRewards: state.claimedRewards,
        totalXP: state.totalXP,
        badges: state.badges,
        challengeProgress: state.challengeProgress,
      }),
      // FIX: Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
    }
  )
);

// FIX: Helper to manually trigger hydration
export const hydrateChallengeStore = () => {
  useChallengeStore.persist.rehydrate();
};

// FIX: Helper to check if hydration is complete
export const isChallengeHydrated = () => {
  return useChallengeStore.persist.hasHydrated();
};

// Selectors for common state slices
export const selectCompletedChallenges = (state: ChallengeStore) => state.completedChallenges;
export const selectTotalXP = (state: ChallengeStore) => state.totalXP;
export const selectBadges = (state: ChallengeStore) => state.badges;

export default useChallengeStore;
