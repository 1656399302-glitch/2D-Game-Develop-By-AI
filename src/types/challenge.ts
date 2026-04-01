/**
 * Challenge System Type Definitions
 * Extended for Time Trial and Leaderboard functionality
 * Round 86: Added ChallengeCompletion type for codex integration
 */

// Re-export existing challenge types from data/challenges.ts
export type {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeRewardType,
  ChallengeReward,
  ChallengeUnlockCondition,
  ChallengeDefinition,
} from '../data/challenges';

export {
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  getChallengeCategoryLabel,
  getChallengeCategoryIcon,
  CHALLENGE_DEFINITIONS,
  getChallengeById,
  getChallengesByCategory,
  getChallengesByDifficulty,
} from '../data/challenges';

/**
 * Time trial challenge types
 */
export type TimeTrialDifficulty = 'easy' | 'normal' | 'hard' | 'extreme';

/**
 * Time trial objective
 */
export interface TimeTrialObjective {
  id: string;
  type: 'create_machine' | 'reach_stability' | 'use_module_count' | 'create_connections' | 'reach_rarity' | 'reach_output';
  description: string;
  /** Target value for the objective */
  target: number;
  /** Current progress (optional, filled at runtime) */
  progress?: number;
}

/**
 * Time trial challenge definition
 */
export interface TimeTrialChallenge {
  id: string;
  title: string;
  description: string;
  /** Time limit in seconds */
  timeLimit: number;
  difficulty: TimeTrialDifficulty;
  /** Base XP/reputation reward */
  baseReward: number;
  /** Difficulty multiplier for rewards */
  rewardMultiplier: number;
  /** Objectives to complete the challenge */
  objectives: TimeTrialObjective[];
  /** Target values for each objective */
  targets: Record<string, number>;
  /** Unlock condition (optional) */
  unlockCondition?: {
    type: 'challenge_completed' | 'machines_created' | 'xp_threshold';
    value: string | number;
  };
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  id: string;
  /** Challenge ID this entry belongs to */
  challengeId: string;
  /** Time in milliseconds */
  time: number;
  /** Human-readable time (MM:SS) */
  timeDisplay: string;
  /** Date achieved (timestamp) */
  dateAchieved: number;
  /** Date display string */
  dateDisplay: string;
  /** Machine codex ID if applicable */
  codexId?: string;
  /** Machine name if applicable */
  machineName?: string;
}

/**
 * Time trial state
 */
export interface TimeTrialState {
  /** Current challenge ID */
  activeChallengeId: string | null;
  /** Whether trial is in progress */
  isTrialActive: boolean;
  /** Whether trial is paused */
  isPaused: boolean;
  /** Elapsed time in milliseconds */
  elapsedTime: number;
  /** Start timestamp */
  startTimestamp: number | null;
  /** Paused timestamp (when paused) */
  pausedTimestamp: number | null;
  /** Current progress */
  progress: Record<string, number>;
  /** Whether trial is completed */
  isCompleted: boolean;
  /** Completion time (milliseconds) */
  completionTime: number | null;
}

/**
 * Challenge completion record (Round 86)
 * Tracks which codex machine IDs were used/completed when a challenge was finished.
 * Used to display "Challenge Mastery" badges on qualifying machines in the Codex.
 */
export interface ChallengeCompletion {
  /** Challenge ID that was completed */
  challengeId: string;
  /** Array of codex entry IDs (machines) that were used/created during this challenge */
  machinesUsed: string[];
  /** ISO timestamp of when the challenge was completed */
  completedAt: string;
}

/**
 * Get difficulty multiplier
 */
export function getDifficultyMultiplier(difficulty: TimeTrialDifficulty): number {
  const multipliers: Record<TimeTrialDifficulty, number> = {
    easy: 0.5,
    normal: 1.0,
    hard: 1.5,
    extreme: 2.0,
  };
  return multipliers[difficulty];
}

/**
 * Get difficulty color
 */
export function getTimeTrialDifficultyColor(difficulty: TimeTrialDifficulty): string {
  const colors: Record<TimeTrialDifficulty, string> = {
    easy: '#22c55e',
    normal: '#3b82f6',
    hard: '#f59e0b',
    extreme: '#ef4444',
  };
  return colors[difficulty];
}

/**
 * Get difficulty label (Chinese)
 */
export function getTimeTrialDifficultyLabel(difficulty: TimeTrialDifficulty): string {
  const labels: Record<TimeTrialDifficulty, string> = {
    easy: '简单',
    normal: '普通',
    hard: '困难',
    extreme: '极限',
  };
  return labels[difficulty];
}

/**
 * Format time in milliseconds to MM:SS display
 */
export function formatTimeDisplay(milliseconds: number): string {
  const absMs = Math.abs(milliseconds);
  const totalSeconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${milliseconds < 0 ? '-' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format date to display string
 */
export function formatDateDisplay(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate leaderboard entry ID
 */
export function generateLeaderboardEntryId(challengeId: string, time: number): string {
  return `lb-${challengeId}-${time}-${Date.now()}`;
}
