/**
 * Challenge System Type Definitions
 * Extended for Time Trial and Leaderboard functionality
 * Round 86: Added ChallengeCompletion type for codex integration
 * Round 160: Added ChallengeObjective, ValidationResult, ObjectiveType, PartialCreditResult
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

// ============================================================================
// Round 160: Challenge Validation Types
// ============================================================================

/**
 * Objective types for challenge validation
 * - output: Circuit must produce specific output states
 * - component_count: Circuit must use ≤ specified components
 * - timing: Circuit must meet timing requirements
 */
export type ObjectiveType = 'output' | 'component_count' | 'timing';

/**
 * Output state requirement for output validation
 */
export type OutputState = 'HIGH' | 'LOW';

/**
 * Target output configuration
 */
export interface OutputTarget {
  /** Node ID or output identifier */
  nodeId: string;
  /** Display name for the output */
  name: string;
  /** Expected signal state */
  expectedState: OutputState;
}

/**
 * Component count constraint
 */
export interface ComponentCountConstraint {
  /** Maximum number of components allowed */
  maxComponents: number;
  /** Include wire segments in count */
  includeWires?: boolean;
}

/**
 * Timing requirement types
 */
export type TimingRequirementType = 'clock_period' | 'edge_alignment' | 'delay_constraint';

/**
 * Clock period requirement
 * Validates that clock signal meets period specification
 * Tolerance: ±2 units
 */
export interface ClockPeriodRequirement {
  /** Requirement type */
  type: 'clock_period';
  /** Expected period in time units */
  expectedPeriod: number;
  /** Tolerance in time units (±2 for clock period) */
  tolerance: number;
  /** Clock signal identifier */
  clockSignalId: string;
}

/**
 * Edge alignment requirement
 * Validates that signal transitions align with clock edges
 * Tolerance: ±1 unit
 */
export interface EdgeAlignmentRequirement {
  /** Requirement type */
  type: 'edge_alignment';
  /** Signal to check */
  signalId: string;
  /** Expected alignment with clock edges */
  tolerance: number;
  /** Reference clock signal ID */
  referenceClockId: string;
}

/**
 * Delay constraint requirement
 * Validates that signal propagation delay meets maximum
 * Tolerance: ±1 unit
 */
export interface DelayConstraintRequirement {
  /** Requirement type */
  type: 'delay_constraint';
  /** Maximum allowed delay in time units */
  maxDelay: number;
  /** Tolerance in time units (±1 for delay) */
  tolerance: number;
  /** Signal to check */
  signalId: string;
  /** Source node for delay measurement */
  sourceNodeId: string;
  /** Target node for delay measurement */
  targetNodeId: string;
}

/**
 * Union type for all timing requirements
 */
export type TimingRequirement = 
  | ClockPeriodRequirement 
  | EdgeAlignmentRequirement 
  | DelayConstraintRequirement;

/**
 * Challenge objective definition
 * A single objective that a circuit must satisfy
 */
export interface ChallengeObjective {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Detailed description */
  description: string;
  /** Type of objective */
  objectiveType: ObjectiveType;
  /** Priority (lower = higher priority) */
  priority: number;
  /** Points awarded for completing this objective */
  points: number;
  /** Output target (for 'output' type) */
  outputTarget?: OutputTarget;
  /** Component count constraint (for 'component_count' type) */
  componentConstraint?: ComponentCountConstraint;
  /** Timing requirements (for 'timing' type) */
  timingRequirements?: TimingRequirement[];
}

/**
 * Validation status for a single objective
 */
export type ValidationStatus = 'idle' | 'validating' | 'passed' | 'failed' | 'error';

/**
 * Result of validating a single objective
 */
export interface ObjectiveValidationResult {
  /** Objective ID */
  objectiveId: string;
  /** Validation status */
  status: ValidationStatus;
  /** Whether the objective was met */
  passed: boolean;
  /** Detailed message */
  message: string;
  /** Actual measured value (if applicable) */
  actualValue?: number;
  /** Expected value (if applicable) */
  expectedValue?: number;
  /** Points earned for this objective */
  pointsEarned: number;
  /** Error details (if status is 'error') */
  error?: string;
}

/**
 * Result of validating all objectives for a challenge
 */
export interface ValidationResult {
  /** Challenge ID */
  challengeId: string;
  /** Circuit ID being validated */
  circuitId: string;
  /** Whether all objectives passed */
  isSuccess: boolean;
  /** Overall validation status */
  status: 'idle' | 'validating' | 'passed' | 'failed';
  /** Individual objective results */
  objectiveResults: ObjectiveValidationResult[];
  /** Total points earned */
  totalPoints: number;
  /** Maximum possible points */
  maxPoints: number;
  /** Percentage score (0-100) */
  score: number;
  /** Timestamp of validation */
  validatedAt: number;
  /** Error message if validation failed completely */
  error?: string;
}

/**
 * Partial credit result for scoring
 * Used when challenge allows partial credit based on objectives met
 */
export interface PartialCreditResult {
  /** Challenge ID */
  challengeId: string;
  /** Total score (0-100) */
  score: number;
  /** Points earned */
  pointsEarned: number;
  /** Maximum points possible */
  maxPoints: number;
  /** Number of objectives passed */
  objectivesPassed: number;
  /** Total objectives */
  totalObjectives: number;
  /** Whether challenge is considered complete (score >= pass threshold) */
  isComplete: boolean;
  /** Breakdown by objective */
  breakdown: Array<{
    objectiveId: string;
    passed: boolean;
    pointsEarned: number;
    pointsPossible: number;
  }>;
}

/**
 * Circuit data for validation
 */
export interface CircuitValidationData {
  /** Circuit identifier */
  id: string;
  /** Circuit name */
  name?: string;
  /** Component instances in the circuit */
  components: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    parameters?: Record<string, unknown>;
  }>;
  /** Output node values */
  outputs: Record<string, boolean>;
  /** Signal traces for timing validation */
  signalTraces?: Array<{
    step: number;
    signals: Record<string, boolean>;
  }>;
  /** Wire count (for includeWires option) */
  wireCount?: number;
}

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Include partial credit in results */
  includePartialCredit?: boolean;
  /** Pass threshold for partial credit (0-100) */
  passThreshold?: number;
  /** Enable strict mode (fail on any warning) */
  strictMode?: boolean;
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

/**
 * Default validation tolerances per requirement type
 */
export const DEFAULT_TOLERANCES = {
  clock_period: 2,
  edge_alignment: 1,
  delay_constraint: 1,
} as const;

/**
 * Maximum tolerance values
 */
export const MAX_TOLERANCES = {
  clock_period: 4,
  edge_alignment: 2,
  delay_constraint: 2,
} as const;
