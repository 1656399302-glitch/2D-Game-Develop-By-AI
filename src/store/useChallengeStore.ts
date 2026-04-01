import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CHALLENGE_DEFINITIONS,
  ChallengeDefinition,
  ChallengeCategory,
  ChallengeDifficulty,
  calculateChallengeBonusMultiplier,
  calculateBonusReputation,
  isTechMasteryAvailable,
} from '../data/challenges';
import {
  LeaderboardEntry,
  TimeTrialState,
  ChallengeCompletion,
} from '../types/challenge';

/**
 * Leaderboard storage helpers
 */
const LEADERBOARD_STORAGE_KEY = 'arcane-codex-time-trial-leaderboard';

const loadLeaderboard = (): Record<string, LeaderboardEntry[]> => {
  try {
    const stored = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load leaderboard:', e);
  }
  return {};
};

const saveLeaderboard = (data: Record<string, LeaderboardEntry[]>) => {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save leaderboard:', e);
  }
};

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
  
  // ===== Time Trial State =====
  /** Current time trial state */
  timeTrialState: TimeTrialState;
  /** Leaderboard data (challengeId -> entries[]) */
  leaderboard: Record<string, LeaderboardEntry[]>;

  // ===== Round 86: Challenge-Codex Integration =====
  /** Challenge completions with machine associations */
  challengeCompletions: ChallengeCompletion[];
}

/**
 * Challenge store actions interface
 */
interface ChallengeActions {
  /** Check if a challenge condition is met based on type and value */
  checkChallengeCompletion: (type: string, value: number) => boolean;
  
  /** Claim reward for a completed challenge */
  claimReward: (challengeId: string, highestTechTier?: number) => void;

  /** Claim reward for a completed challenge with machine association (Round 86) */
  claimRewardWithMachines: (challengeId: string, machineIds: string[], highestTechTier?: number) => void;
  
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

  // ===== Tech Integration =====
  
  /** Check if a tech mastery challenge is available based on current tech state */
  isTechMasteryAvailable: (challengeId: string, completedResearch?: Record<string, string[]>) => boolean;
  
  /** Get the bonus multiplier for a challenge based on tech tier */
  getChallengeBonusMultiplier: (challengeId: string, highestTechTier: number) => number;
  
  /** Get bonus reputation for completing a challenge with a machine */
  getBonusReputation: (challengeId: string, highestTechTier: number) => number;

  // ===== Time Trial Actions =====
  
  /** Start a time trial */
  startTimeTrial: (challengeId: string) => void;
  
  /** Pause the current time trial */
  pauseTimeTrial: () => void;
  
  /** Resume the paused time trial */
  resumeTimeTrial: () => void;
  
  /** Stop/cancel the current time trial */
  stopTimeTrial: () => void;
  
  /** Complete a time trial with the final time */
  completeTimeTrial: (timeMs: number) => void;
  
  /** Reset the time trial state */
  resetTimeTrial: () => void;
  
  /** Update time trial progress */
  updateTimeTrialProgress: (progress: Record<string, number>) => void;

  // ===== Leaderboard Actions =====
  
  /** Add an entry to the leaderboard */
  addLeaderboardEntry: (entry: LeaderboardEntry) => void;
  
  /** Get leaderboard entries for a challenge */
  getLeaderboard: (challengeId: string) => LeaderboardEntry[];
  
  /** Get personal best for a challenge */
  getPersonalBest: (challengeId: string) => LeaderboardEntry | null;
  
  /** Clear leaderboard for a challenge */
  clearChallengeLeaderboard: (challengeId: string) => void;
  
  /** Clear all leaderboard data */
  clearAllLeaderboard: () => void;

  // ===== Round 86: Challenge-Codex Integration =====

  /** Get all challenge completions for a specific machine */
  getCompletionsForMachine: (machineId: string) => ChallengeCompletion[];
  
  /** Get all machines that were used in a specific challenge */
  getMachinesForChallenge: (challengeId: string) => string[];
  
  /** Check if a machine was used in any completed challenges */
  hasChallengeMastery: (machineId: string) => boolean;

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
 * Default time trial state
 */
const DEFAULT_TIME_TRIAL_STATE: TimeTrialState = {
  activeChallengeId: null,
  isTrialActive: false,
  isPaused: false,
  elapsedTime: 0,
  startTimestamp: null,
  pausedTimestamp: null,
  progress: {},
  isCompleted: false,
  completionTime: null,
};

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
 * Challenge store with XP, badges, progress tracking, time trials, and leaderboard
 * Extended with Challenge-Codex integration (Round 86)
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
      
      // Time trial state
      timeTrialState: { ...DEFAULT_TIME_TRIAL_STATE },
      
      // Leaderboard data (initialized from localStorage)
      leaderboard: {},

      // Round 86: Challenge-Codex Integration
      challengeCompletions: [],

      // Actions
      checkChallengeCompletion: (type: string, value: number) => {
        const progress = get().challengeProgress;
        const currentValue = getProgressForChallengeType(progress, type);
        return currentValue >= value;
      },

      claimReward: (challengeId: string, highestTechTier: number = 0) => {
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

        // Calculate bonus multiplier
        const bonusMultiplier = calculateChallengeBonusMultiplier(highestTechTier);

        // Process reward based on type
        switch (challenge.reward.type) {
          case 'xp': {
            // Calculate bonus reputation for tech tier
            const baseXP = challenge.reward.value as number;
            const bonusXP = Math.round(baseXP * (bonusMultiplier - 1));
            set({
              completedChallenges: addToArray(state.completedChallenges, challengeId),
              claimedRewards: addToArray(state.claimedRewards, challengeId),
              totalXP: state.totalXP + baseXP + bonusXP,
            });
            break;
          }
            
          case 'reputation': {
            // Calculate bonus reputation for tech tier
            const baseRep = challenge.baseReputation || (challenge.reward.value as number);
            const bonusRep = Math.round(baseRep * (bonusMultiplier - 1));
            // This would need integration with faction reputation store
            // For now, just mark as completed
            set({
              completedChallenges: addToArray(state.completedChallenges, challengeId),
              claimedRewards: addToArray(state.claimedRewards, challengeId),
            });
            console.log(`+${baseRep + bonusRep} reputation (base: ${baseRep}, bonus: ${bonusRep})`);
            break;
          }
            
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

      // Round 86: Claim reward with machine associations
      claimRewardWithMachines: (challengeId: string, machineIds: string[], highestTechTier: number = 0) => {
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

        // Calculate bonus multiplier
        const bonusMultiplier = calculateChallengeBonusMultiplier(highestTechTier);

        // Create challenge completion record (Round 86)
        const completion: ChallengeCompletion = {
          challengeId,
          machinesUsed: machineIds,
          completedAt: new Date().toISOString(),
        };

        // Process reward based on type
        switch (challenge.reward.type) {
          case 'xp': {
            const baseXP = challenge.reward.value as number;
            const bonusXP = Math.round(baseXP * (bonusMultiplier - 1));
            set({
              completedChallenges: addToArray(state.completedChallenges, challengeId),
              claimedRewards: addToArray(state.claimedRewards, challengeId),
              totalXP: state.totalXP + baseXP + bonusXP,
              // Round 86: Track completion with machines
              challengeCompletions: [...state.challengeCompletions, completion],
            });
            break;
          }
            
          case 'reputation': {
            const baseRep = challenge.baseReputation || (challenge.reward.value as number);
            const bonusRep = Math.round(baseRep * (bonusMultiplier - 1));
            set({
              completedChallenges: addToArray(state.completedChallenges, challengeId),
              claimedRewards: addToArray(state.claimedRewards, challengeId),
              challengeCompletions: [...state.challengeCompletions, completion],
            });
            console.log(`+${baseRep + bonusRep} reputation (base: ${baseRep}, bonus: ${bonusRep})`);
            break;
          }
            
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
              challengeCompletions: [...state.challengeCompletions, completion],
            });
            break;
            
          case 'recipe':
            set({
              completedChallenges: addToArray(state.completedChallenges, challengeId),
              claimedRewards: addToArray(state.claimedRewards, challengeId),
              challengeCompletions: [...state.challengeCompletions, completion],
            });
            setTimeout(() => {
              import('./useRecipeStore').then(({ useRecipeStore }) => {
                useRecipeStore.getState().unlockRecipe(challenge.reward.value as string);
              }).catch(() => {});
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
          'arcane-artist': 'machinesCreated',
          'master-architect': 'machinesCreated',
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
        const state = get();
        const newProgress = { ...state.challengeProgress, ...updates };
        
        // Update highest stability if needed
        if (updates.highestStability !== undefined) {
          if (updates.highestStability > state.challengeProgress.highestStability) {
            newProgress.highestStability = updates.highestStability;
          } else {
            newProgress.highestStability = state.challengeProgress.highestStability;
          }
        }
        
        set({ challengeProgress: newProgress });
      },

      resetChallenges: () => {
        set({
          completedChallenges: [],
          claimedRewards: [],
          totalXP: 0,
          badges: [],
          challengeProgress: { ...DEFAULT_PROGRESS },
          timeTrialState: { ...DEFAULT_TIME_TRIAL_STATE },
          challengeCompletions: [], // Round 86: Reset completions too
        });
      },

      // ===== Tech Integration =====

      isTechMasteryAvailable: (_challengeId: string, completedResearch?: Record<string, string[]>) => {
        if (completedResearch) {
          return isTechMasteryAvailable(_challengeId, completedResearch);
        }
        return true;
      },

      getChallengeBonusMultiplier: (_challengeId: string, highestTechTier: number) => {
        return calculateChallengeBonusMultiplier(highestTechTier);
      },

      getBonusReputation: (challengeId: string, highestTechTier: number) => {
        const challenge = CHALLENGE_DEFINITIONS.find(c => c.id === challengeId);
        if (!challenge) return 0;
        
        const baseRep = challenge.baseReputation || (challenge.reward.value as number);
        return calculateBonusReputation(baseRep, highestTechTier);
      },

      // ===== Time Trial Actions =====

      startTimeTrial: (challengeId: string) => {
        set({
          timeTrialState: {
            activeChallengeId: challengeId,
            isTrialActive: true,
            isPaused: false,
            elapsedTime: 0,
            startTimestamp: Date.now(),
            pausedTimestamp: null,
            progress: {},
            isCompleted: false,
            completionTime: null,
          },
        });
      },

      pauseTimeTrial: () => {
        set((state) => ({
          timeTrialState: {
            ...state.timeTrialState,
            isPaused: true,
            pausedTimestamp: Date.now(),
          },
        }));
      },

      resumeTimeTrial: () => {
        set((state) => ({
          timeTrialState: {
            ...state.timeTrialState,
            isPaused: false,
            pausedTimestamp: null,
          },
        }));
      },

      stopTimeTrial: () => {
        set({
          timeTrialState: { ...DEFAULT_TIME_TRIAL_STATE },
        });
      },

      completeTimeTrial: (timeMs: number) => {
        set((state) => ({
          timeTrialState: {
            ...state.timeTrialState,
            isTrialActive: false,
            isCompleted: true,
            completionTime: timeMs,
          },
        }));
      },

      resetTimeTrial: () => {
        set({
          timeTrialState: { ...DEFAULT_TIME_TRIAL_STATE },
        });
      },

      updateTimeTrialProgress: (progress: Record<string, number>) => {
        set((state) => ({
          timeTrialState: {
            ...state.timeTrialState,
            progress: { ...state.timeTrialState.progress, ...progress },
          },
        }));
      },

      // ===== Leaderboard Actions =====

      addLeaderboardEntry: (entry: LeaderboardEntry) => {
        set((state) => {
          const existing = state.leaderboard[entry.challengeId] || [];
          
          // Add new entry
          const newEntries = [...existing, entry];
          
          // Sort by time (ascending - faster is better)
          newEntries.sort((a, b) => a.time - b.time);
          
          // Keep only top 10
          const trimmedEntries = newEntries.slice(0, 10);
          
          const newLeaderboard = {
            ...state.leaderboard,
            [entry.challengeId]: trimmedEntries,
          };
          
          // Persist to localStorage
          saveLeaderboard(newLeaderboard);
          
          return {
            leaderboard: newLeaderboard,
          };
        });
      },

      getLeaderboard: (challengeId: string) => {
        const leaderboard = get().leaderboard;
        const entries = leaderboard[challengeId] || [];
        return entries.sort((a, b) => a.time - b.time);
      },

      getPersonalBest: (challengeId: string) => {
        const entries = get().leaderboard[challengeId] || [];
        return entries.length > 0 ? entries[0] : null;
      },

      clearChallengeLeaderboard: (challengeId: string) => {
        set((state) => {
          const newLeaderboard = { ...state.leaderboard };
          delete newLeaderboard[challengeId];
          saveLeaderboard(newLeaderboard);
          return { leaderboard: newLeaderboard };
        });
      },

      clearAllLeaderboard: () => {
        saveLeaderboard({});
        set({ leaderboard: {} });
      },

      // ===== Round 86: Challenge-Codex Integration =====

      /**
       * Get all challenge completions for a specific machine
       * Used to display Challenge Mastery badges on codex entries
       */
      getCompletionsForMachine: (machineId: string) => {
        const completions = get().challengeCompletions;
        return completions.filter((c) => c.machinesUsed.includes(machineId));
      },

      /**
       * Get all machines that were used in a specific challenge
       */
      getMachinesForChallenge: (challengeId: string) => {
        const completions = get().challengeCompletions;
        const completion = completions.find((c) => c.challengeId === challengeId);
        return completion ? completion.machinesUsed : [];
      },

      /**
       * Check if a machine was used in any completed challenges
       */
      hasChallengeMastery: (machineId: string) => {
        const completions = get().challengeCompletions;
        return completions.some((c) => c.machinesUsed.includes(machineId));
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
      version: 4, // Round 86: Incremented for challengeCompletions
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
          // Load leaderboard from localStorage
          const leaderboard = loadLeaderboard();
          if (Object.keys(leaderboard).length > 0) {
            state.leaderboard = leaderboard;
          }
        }
      },
      // Only persist specific fields
      partialize: (state) => ({
        completedChallenges: state.completedChallenges,
        claimedRewards: state.claimedRewards,
        totalXP: state.totalXP,
        badges: state.badges,
        challengeProgress: state.challengeProgress,
        timeTrialState: state.timeTrialState,
        challengeCompletions: state.challengeCompletions, // Round 86: Persist completions
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
export const selectTimeTrialState = (state: ChallengeStore) => state.timeTrialState;
export const selectLeaderboard = (state: ChallengeStore) => state.leaderboard;
export const selectChallengeCompletions = (state: ChallengeStore) => state.challengeCompletions; // Round 86

export default useChallengeStore;
